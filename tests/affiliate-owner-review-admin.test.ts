import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  listOwnerReviewBatches,
  loadOwnerReviewWorkspace,
  OwnerReviewNotFoundError,
  OwnerReviewDecisionConflictError,
  OwnerReviewValidationError,
  ownerReviewDecisionExport,
  ownerReviewHostedObjectKey,
  resolveOwnerReviewAsset,
  saveOwnerReviewDecision,
  verifyOwnerReviewAsset
} from "../lib/affiliate-owner-review.ts";

const BATCH_ID = "v999-owner-review-001";

function sha256(value: Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

test("owner-review workspace validates frozen media, persists decisions, detects conflicts, and exports apply-compatible JSON", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "project-pint-owner-review-"));
  const outputRoot = path.join(root, "v4");
  const dataRoot = path.join(root, "data");
  const previousOutputRoot = process.env.AFFILIATE_PILOT_V4_OUTPUT_ROOT;
  const previousDataRoot = process.env.LOCAL_DATA_ROOT;
  const previousStorageMode = process.env.STORAGE_MODE;
  const previousReviewSource = process.env.AFFILIATE_OWNER_REVIEW_SOURCE;
  const previousSupabaseUrl = process.env.SUPABASE_URL;
  const previousSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const previousReviewBucket = process.env.AFFILIATE_REVIEW_MEDIA_BUCKET;
  const previousFetch = globalThis.fetch;
  process.env.AFFILIATE_PILOT_V4_OUTPUT_ROOT = outputRoot;
  process.env.LOCAL_DATA_ROOT = dataRoot;
  process.env.STORAGE_MODE = "local";
  context.after(async () => {
    if (previousOutputRoot === undefined) delete process.env.AFFILIATE_PILOT_V4_OUTPUT_ROOT;
    else process.env.AFFILIATE_PILOT_V4_OUTPUT_ROOT = previousOutputRoot;
    if (previousDataRoot === undefined) delete process.env.LOCAL_DATA_ROOT;
    else process.env.LOCAL_DATA_ROOT = previousDataRoot;
    if (previousStorageMode === undefined) delete process.env.STORAGE_MODE;
    else process.env.STORAGE_MODE = previousStorageMode;
    if (previousReviewSource === undefined) delete process.env.AFFILIATE_OWNER_REVIEW_SOURCE;
    else process.env.AFFILIATE_OWNER_REVIEW_SOURCE = previousReviewSource;
    if (previousSupabaseUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousSupabaseUrl;
    if (previousSupabaseKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousSupabaseKey;
    if (previousReviewBucket === undefined) delete process.env.AFFILIATE_REVIEW_MEDIA_BUCKET;
    else process.env.AFFILIATE_REVIEW_MEDIA_BUCKET = previousReviewBucket;
    globalThis.fetch = previousFetch;
    await fs.rm(root, { recursive: true, force: true });
  });

  const firstImage = Buffer.from("fixture-image-one");
  const secondImage = Buffer.from("fixture-image-two");
  const candidateDir = path.join(outputRoot, "candidates", "TESTASIN01");
  await fs.mkdir(candidateDir, { recursive: true });
  await fs.writeFile(path.join(candidateDir, "scene-01.png"), firstImage);
  await fs.writeFile(path.join(candidateDir, "scene-02.png"), secondImage);

  const jobs = [
    {
      reviewNumber: 1,
      sceneId: "v4-TESTASIN01-style-one-01-candidate-01",
      jobId: "prod_testasin01:style-one:1:candidate:1",
      asin: "TESTASIN01",
      productName: "Fixture Product",
      brand: "Fixture Brand",
      productSlug: "fixture-product",
      productRole: "fixture-role",
      styleSlug: "style-one",
      slot: 1,
      candidateOrdinal: 1,
      candidatePath: "output/affiliate-pilot/v4/candidates/TESTASIN01/scene-01.png",
      ownerSelectedStorageKey: "affiliate-pilot/v4/TESTASIN01/styles/style-one/scene-01.png",
      statusAtFreeze: "assistant_pass_owner_pending",
      sourceOwnerReviewBatchId: "v998-owner-review-001",
      sourceReviewNumber: 1,
      candidateSha256: sha256(firstImage),
      amazonListingUrl: "https://www.amazon.com/dp/TESTASIN01"
    },
    {
      reviewNumber: 2,
      sceneId: "v4-TESTASIN01-style-two-02-candidate-01",
      jobId: "prod_testasin01:style-two:2:candidate:1",
      asin: "TESTASIN01",
      productName: "Fixture Product",
      brand: "Fixture Brand",
      productSlug: "fixture-product",
      productRole: "fixture-role",
      styleSlug: "style-two",
      slot: 2,
      candidateOrdinal: 1,
      candidatePath: "output/affiliate-pilot/v4/candidates/TESTASIN01/scene-02.png",
      ownerSelectedStorageKey: "affiliate-pilot/v4/TESTASIN01/styles/style-two/scene-02.png",
      statusAtFreeze: "assistant_pass_owner_pending",
      sourceOwnerReviewBatchId: "v998-owner-review-001",
      sourceReviewNumber: 2,
      candidateSha256: sha256(secondImage),
      amazonListingUrl: "https://www.amazon.com/dp/TESTASIN01"
    }
  ];
  const batchDir = path.join(outputRoot, "private-evidence", "owner-review-batches", BATCH_ID);
  await fs.mkdir(batchDir, { recursive: true });
  const reviewIndex = {
    batchId: BATCH_ID,
    renderedAt: "2026-08-08T12:00:00.000Z",
    candidateCount: jobs.length,
    contactSheets: ["contact-sheet-01.png"],
    publicationStatus: "not_authorized_not_copied",
    jobs
  };
  await fs.writeFile(path.join(batchDir, "review-index.json"), JSON.stringify(reviewIndex));

  const batches = await listOwnerReviewBatches();
  assert.deepEqual(batches.map((batch) => batch.batchId), [BATCH_ID]);
  assert.equal((await loadOwnerReviewWorkspace(BATCH_ID)).candidates.length, 2);
  const asset = await resolveOwnerReviewAsset(BATCH_ID, jobs[0]!.sceneId);
  assert.deepEqual(await verifyOwnerReviewAsset(asset), firstImage);

  const approved = await saveOwnerReviewDecision({
    batchId: BATCH_ID,
    sceneId: jobs[0]!.sceneId,
    decision: "approved",
    note: "Product identity and room realism look accurate.",
    expectedRevision: 0
  });
  assert.equal(approved.revision, 1);
  assert.equal(approved.history.length, 1);
  await assert.rejects(
    saveOwnerReviewDecision({
      batchId: BATCH_ID,
      sceneId: jobs[0]!.sceneId,
      decision: "approved",
      note: "Stale update",
      expectedRevision: 0
    }),
    OwnerReviewDecisionConflictError
  );
  await assert.rejects(
    saveOwnerReviewDecision({
      batchId: BATCH_ID,
      sceneId: jobs[1]!.sceneId,
      decision: "denied",
      note: "   ",
      expectedRevision: 0
    }),
    OwnerReviewValidationError
  );
  await assert.rejects(ownerReviewDecisionExport(BATCH_ID), /1 image is still pending review/);

  await saveOwnerReviewDecision({
    batchId: BATCH_ID,
    sceneId: jobs[1]!.sceneId,
    decision: "denied",
    note: "The tile repetition looks synthetic and too perfect.",
    expectedRevision: 0
  });
  const exported = await ownerReviewDecisionExport(BATCH_ID);
  assert.equal(exported.batchId, BATCH_ID);
  assert.deepEqual(exported.decisions.map((decision) => decision.decision), ["APPROVE", "DENY"]);
  assert.equal(exported.decisions[1]?.note, "The tile repetition looks synthetic and too perfect.");
  assert.equal(exported.publicationStatus, "not_authorized_not_copied");

  assert.equal(
    ownerReviewHostedObjectKey(BATCH_ID, jobs[0]!),
    `batches/${BATCH_ID}/${jobs[0]!.sceneId}.png`
  );
  await fs.writeFile(path.join(dataRoot, "Affiliate_Owner_Review_Batches.json"), JSON.stringify([reviewIndex]));
  process.env.AFFILIATE_OWNER_REVIEW_SOURCE = "supabase";
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_fixture";
  process.env.AFFILIATE_REVIEW_MEDIA_BUCKET = "affiliate-owner-review";
  let requestedUrl = "";
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return new Response(new Uint8Array(firstImage), { status: 200, headers: { "Content-Type": "image/png" } });
  };
  assert.deepEqual((await listOwnerReviewBatches()).map((batch) => batch.batchId), [BATCH_ID]);
  const hostedAsset = await resolveOwnerReviewAsset(BATCH_ID, jobs[0]!.sceneId);
  assert.equal(hostedAsset.source, "supabase");
  assert.deepEqual(await verifyOwnerReviewAsset(hostedAsset), firstImage);
  assert.match(requestedUrl, /\/storage\/v1\/object\/authenticated\/affiliate-owner-review\/batches\/v999-owner-review-001\//);

  globalThis.fetch = async () => new Response(
    JSON.stringify({ statusCode: "404", error: "not_found", message: "Object not found", code: "NoSuchKey" }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
  await assert.rejects(
    verifyOwnerReviewAsset(hostedAsset),
    OwnerReviewNotFoundError
  );
});

test("media-review admin surface preserves authentication, private storage, and publication boundaries", async () => {
  const [route, assetRoute, exportRoute, page, gallery, frame, middleware, styles, migration, importer, packageJson] = await Promise.all([
    fs.readFile(path.join(process.cwd(), "app/api/admin/media-review/route.ts"), "utf8"),
    fs.readFile(path.join(process.cwd(), "app/api/admin/media-review/asset/route.ts"), "utf8"),
    fs.readFile(path.join(process.cwd(), "app/api/admin/media-review/export/route.ts"), "utf8"),
    fs.readFile(path.join(process.cwd(), "app/admin/media-review/page.tsx"), "utf8"),
    fs.readFile(path.join(process.cwd(), "components/admin/OwnerReviewGallery.tsx"), "utf8"),
    fs.readFile(path.join(process.cwd(), "components/admin/AdminFrame.tsx"), "utf8"),
    fs.readFile(path.join(process.cwd(), "middleware.ts"), "utf8"),
    fs.readFile(path.join(process.cwd(), "app/globals.css"), "utf8"),
    fs.readFile(path.join(process.cwd(), "supabase/migrations/20260808_affiliate_owner_review_storage.sql"), "utf8"),
    fs.readFile(path.join(process.cwd(), "scripts/import-affiliate-pilot-v4-owner-review-hosted.ts"), "utf8"),
    fs.readFile(path.join(process.cwd(), "package.json"), "utf8")
  ]);
  for (const source of [route, assetRoute, exportRoute]) {
    assert.match(source, /isAdminSessionValid/);
    assert.match(source, /PRIVATE_NO_STORE_HEADERS/);
  }
  assert.match(route, /isSameOriginMutation/);
  assert.match(route, /isJsonRequest/);
  assert.match(route, /OwnerReviewDecisionConflictError/);
  assert.match(assetRoute, /verifyOwnerReviewAsset/);
  assert.match(page, /They do not publish an image/);
  assert.match(gallery, /Download when complete/);
  assert.match(gallery, /Add a rejection reason before denying/);
  assert.match(gallery, /useUnsavedChangesGuard/);
  assert.match(frame, /\/admin\/media-review/);
  assert.match(middleware, /media-review/);
  assert.match(styles, /\.owner-review-focus/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(migration, /'affiliate-owner-review'/);
  assert.match(migration, /public = false/);
  assert.match(migration, /revoke all privileges on table public\.app_storage_tabs from anon, authenticated/);
  assert.match(importer, /importOwnerReviewBatchToHostedStorage/);
  assert.match(packageJson, /import:owner-review-hosted:affiliate-pilot-v4/);
});
