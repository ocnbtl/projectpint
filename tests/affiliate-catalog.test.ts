import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  AffiliateCatalogConflictError,
  affiliateCandidateFixture,
  affiliateReplacementFixture,
  catalogSummary,
  parseAffiliateCatalog,
  readAffiliateCatalog,
  readPublicAffiliateProduct,
  saveAffiliateCatalog
} from "../lib/affiliate-catalog.ts";
import {
  affiliatePresentationKey,
  affiliateStyleMediaKey,
  buildAffiliateMediaJobs,
  buildAffiliateMediaManifest
} from "../lib/affiliate-media.ts";
import { inspirationStyles } from "../lib/redesign-data.ts";

async function withLocalCatalog(
  context: test.TestContext,
  prefix: string
): Promise<string> {
  const dataRoot = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  const previousMode = process.env.STORAGE_MODE;
  const previousRoot = process.env.LOCAL_DATA_ROOT;
  const previousPreview = process.env.AFFILIATE_CATALOG_PREVIEW;
  process.env.STORAGE_MODE = "local";
  process.env.LOCAL_DATA_ROOT = dataRoot;
  delete process.env.AFFILIATE_CATALOG_PREVIEW;
  context.after(async () => {
    if (previousMode === undefined) delete process.env.STORAGE_MODE;
    else process.env.STORAGE_MODE = previousMode;
    if (previousRoot === undefined) delete process.env.LOCAL_DATA_ROOT;
    else process.env.LOCAL_DATA_ROOT = previousRoot;
    if (previousPreview === undefined) delete process.env.AFFILIATE_CATALOG_PREVIEW;
    else process.env.AFFILIATE_CATALOG_PREVIEW = previousPreview;
    await fs.rm(dataRoot, { recursive: true, force: true });
  });
  return dataRoot;
}

test("the affiliate candidate fixture contains 60 unique canonical products and five per current style", () => {
  const products = affiliateCandidateFixture();
  assert.equal(products.length, 60);
  assert.equal(new Set(products.map((product) => product.id)).size, 60);
  assert.equal(new Set(products.map((product) => product.slug)).size, 60);
  assert.equal(new Set(products.map((product) => product.asin)).size, 60);
  assert.equal(new Set(products.map((product) => product.canonicalAmazonUrl)).size, 60);

  for (const style of inspirationStyles) {
    const primary = products.filter((product) =>
      product.styleAssignments.some((assignment) => assignment.styleSlug === style.slug && assignment.role === "primary")
    );
    assert.equal(primary.length, 5, `${style.name} should have exactly five candidates`);
    assert.deepEqual(primary.map((product) => product.styleAssignments[0]?.rank), [1, 2, 3, 4, 5]);
  }

  assert.ok(products.every((product) => product.canonicalAmazonUrl === `https://www.amazon.com/dp/${product.asin}`));
  assert.ok(products.every((product) => product.associatesUrl === null));
  assert.ok(products.every((product) => product.visibility === "private"));
  assert.equal(products.filter((product) => product.approvalStatus === "approved").length, 32);
  assert.equal(products.filter((product) => product.approvalStatus === "approved_with_caveat").length, 9);
  assert.equal(products.filter((product) => product.approvalStatus === "rejected").length, 19);
  assert.ok(products.every((product) => product.approvalHistory.length === 1));
  assert.ok(products.every((product) => product.approvalHistory[0]?.source === "owner"));
  assert.ok(products.every((product) => product.recommendationRationale !== product.styleAssignments[0]?.rationale));

  const summary = catalogSummary(products);
  assert.deepEqual(summary, {
    total: 60,
    pending: 0,
    approved: 41,
    rejected: 19,
    unavailable: 0,
    mediaReady: 0,
    categories: 15,
    styles: 12
  });
});

test("owner rejections and all 19 replacement proposals preserve the exact style slots and canonical identity rules", () => {
  const products = affiliateCandidateFixture();
  const proposals = affiliateReplacementFixture();
  const rejected = products.filter((product) => product.approvalStatus === "rejected");
  const rejectedAsins = new Set(rejected.map((product) => product.asin));

  assert.equal(rejected.length, 19);
  assert.equal(proposals.length, 19);
  assert.deepEqual(new Set(proposals.map((proposal) => proposal.replacesAsin)), rejectedAsins);
  assert.ok(rejected.every((product) => product.approvalHistory.at(-1)?.decision === "rejected"));
  assert.ok(rejected.every((product) => product.approvalHistory.at(-1)?.reason.trim()));

  const reused = proposals.filter((proposal) => proposal.reuseExistingCanonical);
  const newCanonical = proposals.filter((proposal) => !proposal.reuseExistingCanonical);
  assert.equal(reused.length, 1);
  assert.equal(reused[0]?.proposedProduct.asin, "B0DC7VG6Z9");
  assert.equal(reused[0]?.styleSlug, "japandi");
  assert.equal(newCanonical.length, 18);
  assert.equal(new Set(newCanonical.map((proposal) => proposal.proposedProduct.asin)).size, 18);
  assert.ok(newCanonical.every((proposal) => proposal.proposalStatus === "pending"));
  assert.ok(newCanonical.every((proposal) => proposal.proposedProduct.approvalStatus === "pending"));
  assert.ok(newCanonical.every((proposal) => !products.some(
    (product) => product.asin === proposal.proposedProduct.asin
  )));
});

test("catalog validation rejects duplicate identity, ASIN mismatch, and premature public visibility", () => {
  const products = affiliateCandidateFixture();
  assert.throws(() => parseAffiliateCatalog([...products, structuredClone(products[0])]), /Duplicate/);

  const mismatched = structuredClone(products);
  mismatched[0]!.canonicalAmazonUrl = "https://www.amazon.com/dp/B000000000";
  assert.throws(() => parseAffiliateCatalog(mismatched), /must match/);

  const premature = structuredClone(products);
  premature[0]!.visibility = "public";
  assert.throws(() => parseAffiliateCatalog(premature), /must be approved|Associates URL|complete/);
});

test("catalog persistence has optimistic conflict protection and keeps non-published products private", async (context) => {
  await withLocalCatalog(context, "project-pint-catalog-");
  const base = await readAffiliateCatalog();
  assert.equal(await readPublicAffiliateProduct(base[0]!.slug), null);

  const edited = structuredClone(base);
  edited[0]!.name = "Locally edited product";
  edited[0]!.updatedAt = "2026-07-25T23:00:00-04:00";
  await saveAffiliateCatalog(edited, base);
  assert.equal((await readAffiliateCatalog())[0]!.name, "Locally edited product");
  await assert.rejects(() => saveAffiliateCatalog(base, base), AffiliateCatalogConflictError);
});

test("public product reads require approval, an Associates URL, complete QA, and visibility", async (context) => {
  await withLocalCatalog(context, "project-pint-public-catalog-");
  const base = await readAffiliateCatalog();
  const publishable = structuredClone(base);
  const first = publishable[0]!;
  first.workflowStatus = "published";
  first.associatesUrl = `${first.canonicalAmazonUrl}?tag=owner-supplied-20`;
  first.mediaCompleteness = "complete";
  first.imageQaStatus = "passed";
  first.publicationReadiness = "ready";
  first.visibility = "public";
  await saveAffiliateCatalog(publishable, base);
  assert.equal((await readPublicAffiliateProduct(first.slug))?.asin, first.asin);

  const current = await readAffiliateCatalog();
  const retired = structuredClone(current);
  retired[0]!.visibility = "private";
  retired[0]!.retired = true;
  retired[0]!.workflowStatus = "retired";
  await saveAffiliateCatalog(retired, current);
  assert.equal(await readPublicAffiliateProduct(first.slug), null);
});

test("media manifest excludes rejected products and keeps the approved cohort rights-blocked", () => {
  const products = affiliateCandidateFixture();
  const oneProductJobs = buildAffiliateMediaJobs(products[0]!);
  assert.equal(oneProductJobs.length, 61);
  assert.equal(oneProductJobs.filter((job) => job.kind === "presentation").length, 1);
  assert.equal(oneProductJobs.filter((job) => job.kind === "styled").length, 60);
  assert.ok(oneProductJobs.every((job) => job.status === "blocked_reference_rights"));

  const rejectedProduct = products.find((product) => product.approvalStatus === "rejected")!;
  assert.ok(buildAffiliateMediaJobs(rejectedProduct).every((job) => job.status === "blocked_approval"));

  const manifest = buildAffiliateMediaManifest(products);
  assert.equal(manifest.candidateCount, 60);
  assert.equal(manifest.productCount, 41);
  assert.equal(manifest.excludedCount, 19);
  assert.equal(manifest.presentationCount, 41);
  assert.equal(manifest.styledCount, 2460);
  assert.equal(manifest.totalCount, 2501);
  assert.equal(manifest.cohortReadyForPilot, false);
  assert.equal(manifest.generationAuthorized, false);
  assert.equal(new Set(manifest.jobs.map((job) => job.id)).size, 2501);
  assert.equal(new Set(manifest.jobs.map((job) => job.storageKey)).size, 2501);
  assert.ok(manifest.jobs.every((job) => !rejectedProduct || job.asin !== rejectedProduct.asin));
  assert.ok(manifest.excludedProducts.every((product) => product.approvalStatus === "rejected"));
});

test("media storage keys are deterministic and reject invalid gallery slots", () => {
  const product = affiliateCandidateFixture()[0]!;
  assert.equal(
    affiliatePresentationKey(product),
    `affiliate-products/v1/${product.asin}/${product.slug}/presentation/product-transparent.webp`
  );
  assert.equal(
    affiliateStyleMediaKey(product, "japandi", 5),
    `affiliate-products/v1/${product.asin}/${product.slug}/styles/japandi/scene-05.webp`
  );
  assert.throws(() => affiliateStyleMediaKey(product, "japandi", 0), /between 1 and 5/);
  assert.throws(() => affiliateStyleMediaKey(product, "japandi", 6), /between 1 and 5/);
});

test("prepared migration and rollback cover every catalog relation and preserve server-only access", async () => {
  const migration = await fs.readFile(
    path.join(process.cwd(), "supabase/migrations/20260725_affiliate_catalog_foundation.sql"),
    "utf8"
  );
  const rollback = await fs.readFile(
    path.join(process.cwd(), "supabase/rollback/20260725_affiliate_catalog_foundation.rollback.sql"),
    "utf8"
  );
  const tables = [
    "affiliate_products",
    "affiliate_product_research_sources",
    "affiliate_product_style_assignments",
    "affiliate_product_media_sets",
    "affiliate_product_media_assets",
    "affiliate_scenes",
    "affiliate_scene_products"
  ];
  for (const table of tables) {
    assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
    assert.match(migration, new RegExp(`revoke all on table public\\.${table} from anon, authenticated`));
    assert.match(rollback, new RegExp(`drop table if exists public\\.${table}`));
  }
  assert.match(migration, /affiliate_products_publication_gate/);
  assert.match(migration, /affiliate_product_one_primary_style/);
  assert.match(migration, /approval_history jsonb not null default '\[\]'::jsonb/);
});

test("affiliate catalog API preserves authentication, origin, JSON, conflict, and validation boundaries", async () => {
  const route = await fs.readFile(path.join(process.cwd(), "app/api/admin/affiliate-catalog/route.ts"), "utf8");
  assert.match(route, /isAdminSessionValid/);
  assert.match(route, /isSameOriginMutation/);
  assert.match(route, /isJsonRequest/);
  assert.match(route, /AffiliateCatalogConflictError/);
  assert.match(route, /ZodError/);
  assert.match(route, /PRIVATE_NO_STORE_HEADERS/);
});

test("public affiliate detail keeps media gates and swipe gallery controls explicit", async () => {
  const catalog = await fs.readFile(path.join(process.cwd(), "lib/affiliate-catalog.ts"), "utf8");
  const gallery = await fs.readFile(path.join(process.cwd(), "components/AffiliateProductGallery.tsx"), "utf8");
  assert.match(catalog, /product\.mediaCompleteness !== "complete"/);
  assert.match(catalog, /product\.imageQaStatus !== "passed"/);
  assert.match(gallery, /onPointerDown/);
  assert.match(gallery, /onPointerUp/);
});

test("admin replacement queue exposes human-readable decisions without editing the canonical catalog", async () => {
  const page = await fs.readFile(path.join(process.cwd(), "app/admin/affiliate-links/page.tsx"), "utf8");
  const queue = await fs.readFile(
    path.join(process.cwd(), "components/admin/AffiliateReplacementQueue.tsx"),
    "utf8"
  );
  const styles = await fs.readFile(path.join(process.cwd(), "app/globals.css"), "utf8");
  assert.match(page, /affiliateReplacementFixture/);
  assert.match(page, /19 are rejected with/);
  assert.match(queue, /Replacement approval queue/);
  assert.match(queue, /ownerRejectionReason/);
  assert.match(queue, /reuseExistingCanonical/);
  assert.match(styles, /\.affiliate-replacement-mobile-list/);
  assert.match(styles, /@media \(max-width: 820px\)[\s\S]*\.affiliate-replacement-table-wrap/);
});
