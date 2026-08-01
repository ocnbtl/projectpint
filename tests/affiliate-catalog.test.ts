import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  AffiliateCatalogConflictError,
  affiliateApprovedCohortFixture,
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
import { buildAffiliatePilotManifest } from "../lib/affiliate-pilot.ts";
import { buildAffiliatePilotV2Manifest } from "../lib/affiliate-pilot-v2.ts";
import { buildAffiliatePilotV3Manifest } from "../lib/affiliate-pilot-v3.ts";
import { buildAffiliatePilotV4Manifest } from "../lib/affiliate-pilot-v4.ts";
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
    styleSlots: 60,
    pending: 0,
    approved: 41,
    rejected: 19,
    unavailable: 0,
    mediaReady: 0,
    categories: 15,
    styles: 12
  });
});

test("owner rejections and all 19 approved replacements preserve the exact style slots and canonical identity rules", () => {
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
  assert.ok(proposals.every(
    (proposal) =>
      proposal.proposalStatus === "approved" ||
      proposal.proposalStatus === "approved_with_caveat"
  ));
  assert.ok(proposals.every(
    (proposal) => proposal.proposedProduct.approvalStatus === proposal.proposalStatus
  ));
  assert.ok(proposals.every(
    (proposal) => proposal.proposedProduct.approvalHistory.at(-1)?.source === "owner"
  ));
  assert.ok(newCanonical.every((proposal) => !products.some(
    (product) => product.asin === proposal.proposedProduct.asin
  )));
});

test("the approved cohort fills 60 style slots with 59 unique canonical products", () => {
  const products = affiliateApprovedCohortFixture();
  const allAssignments = products.flatMap((product) => product.styleAssignments);

  assert.equal(products.length, 59);
  assert.equal(new Set(products.map((product) => product.asin)).size, 59);
  assert.equal(allAssignments.length, 60);
  assert.ok(products.every(
    (product) =>
      product.approvalStatus === "approved" ||
      product.approvalStatus === "approved_with_caveat"
  ));

  for (const style of inspirationStyles) {
    const assignments = allAssignments
      .filter((assignment) => assignment.styleSlug === style.slug)
      .sort((left, right) => left.rank - right.rank);
    assert.equal(assignments.length, 5, `${style.name} should have exactly five approved slots`);
    assert.deepEqual(assignments.map((assignment) => assignment.rank), [1, 2, 3, 4, 5]);
  }

  const bambusi = products.filter((product) => product.asin === "B0DC7VG6Z9");
  assert.equal(bambusi.length, 1);
  assert.deepEqual(
    bambusi[0]?.styleAssignments.map((assignment) => [assignment.styleSlug, assignment.role, assignment.rank]),
    [
      ["boho-earth-tones", "primary", 5],
      ["japandi", "additional", 1]
    ]
  );

  assert.deepEqual(catalogSummary(products), {
    total: 59,
    styleSlots: 60,
    pending: 0,
    approved: 59,
    rejected: 0,
    unavailable: 0,
    mediaReady: 0,
    categories: 15,
    styles: 12
  });
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

test("media manifest covers the approved canonical cohort and keeps every job rights-blocked", () => {
  const initialProducts = affiliateCandidateFixture();
  const products = affiliateApprovedCohortFixture();
  const oneProductJobs = buildAffiliateMediaJobs(products[0]!);
  assert.equal(oneProductJobs.length, 61);
  assert.equal(oneProductJobs.filter((job) => job.kind === "presentation").length, 1);
  assert.equal(oneProductJobs.filter((job) => job.kind === "styled").length, 60);
  assert.ok(oneProductJobs.every((job) => job.status === "blocked_reference_rights"));

  const rejectedProduct = initialProducts.find((product) => product.approvalStatus === "rejected")!;
  assert.ok(buildAffiliateMediaJobs(rejectedProduct).every((job) => job.status === "blocked_approval"));

  const manifest = buildAffiliateMediaManifest(products);
  assert.equal(manifest.candidateCount, 59);
  assert.equal(manifest.productCount, 59);
  assert.equal(manifest.styleSlotCount, 60);
  assert.equal(manifest.targetStyleSlotCount, 60);
  assert.equal(manifest.excludedCount, 0);
  assert.equal(manifest.presentationCount, 59);
  assert.equal(manifest.styledCount, 3540);
  assert.equal(manifest.totalCount, 3599);
  assert.equal(manifest.cohortReadyForPilot, true);
  assert.equal(manifest.generationAuthorized, false);
  assert.equal(new Set(manifest.jobs.map((job) => job.id)).size, 3599);
  assert.equal(new Set(manifest.jobs.map((job) => job.storageKey)).size, 3599);
  assert.ok(manifest.jobs.every((job) => job.status === "blocked_reference_rights"));
  assert.deepEqual(manifest.excludedProducts, []);
});

test("the authorized technical pilot contains three products and exactly 33 queued jobs", () => {
  const manifest = buildAffiliatePilotManifest(affiliateApprovedCohortFixture());

  assert.equal(manifest.referenceRightsConfirmed, true);
  assert.equal(manifest.generationAuthorized, true);
  assert.equal(manifest.fullScaleAuthorized, false);
  assert.equal(manifest.sourceImagesPrivateOnly, true);
  assert.equal(manifest.executionLogRequired, true);
  assert.equal(manifest.productCount, 3);
  assert.equal(manifest.presentationCount, 3);
  assert.equal(manifest.styledCount, 30);
  assert.equal(manifest.totalCount, 33);
  assert.equal(new Set(manifest.products.map((product) => product.asin)).size, 3);
  assert.ok(manifest.products.every((product) => product.styleSlugs.length === 2));
  assert.equal(new Set(manifest.jobs.map((job) => job.id)).size, 33);
  assert.ok(manifest.jobs.every((job) => job.status === "queued"));
  assert.ok(manifest.jobs.every((job) => job.promptVersion === "affiliate-pilot-product-v1"));
  assert.ok(manifest.jobs.every((job) => job.generationVersion === "pilot-2026-07-26-run-01"));
  assert.ok(manifest.jobs.every((job) => job.storageKey.startsWith("affiliate-pilot/v1/")));
  assert.ok(manifest.jobs.every((job) => job.requiresPromptCapture));
  assert.doesNotMatch(JSON.stringify(manifest), /\/private\/tmp|product-pint-affiliate-pilot-refs/);
  assert.ok(
    manifest.jobs
      .filter((job) => job.kind === "presentation")
      .every((job) => job.referenceInputCount === 1 && job.prompt.includes("#00FF00"))
  );
  assert.ok(
    manifest.jobs
      .filter((job) => job.kind === "styled")
      .every(
        (job) =>
          job.referenceInputCount === 2 &&
          job.prompt.includes("Product identity invariant:") &&
          job.prompt.includes("approved private reference")
      )
  );
});

test("the refreshed natural-photo pilot reuses approved cutouts and queues 30 materially distinct scenes", () => {
  const manifest = buildAffiliatePilotV2Manifest(affiliateApprovedCohortFixture());
  const presentations = manifest.jobs.filter((job) => job.kind === "presentation");
  const styled = manifest.jobs.filter((job) => job.kind === "styled");

  assert.equal(manifest.referenceRightsConfirmed, true);
  assert.equal(manifest.generationAuthorized, true);
  assert.equal(manifest.fullScaleAuthorized, false);
  assert.equal(manifest.ownerApprovedPresentationReuse, true);
  assert.equal(manifest.requestedModel, "gpt-image-2");
  assert.equal(manifest.requestedQuality, "high");
  assert.equal(manifest.productCount, 3);
  assert.equal(manifest.presentationCount, 3);
  assert.equal(manifest.reusedPresentationCount, 3);
  assert.equal(manifest.styledCount, 30);
  assert.equal(manifest.generationRequestedCount, 30);
  assert.equal(manifest.totalCount, 33);
  assert.equal(presentations.length, 3);
  assert.equal(styled.length, 30);
  assert.ok(presentations.every((job) => job.status === "reused_owner_approved"));
  assert.ok(
    presentations.every(
      (job) =>
        job.referenceInputCount === 0 &&
        job.requiresPromptCapture === false &&
        job.reusedFromStorageKey?.startsWith("affiliate-pilot/v1/")
    )
  );
  assert.ok(styled.every((job) => job.status === "queued"));
  assert.ok(
    styled.every(
      (job) =>
        (job.referenceInputCount === 2 || job.referenceInputCount === 3) &&
        job.requiresPromptCapture &&
        job.sceneId &&
        job.prompt.includes("recent smartphone main camera") &&
        job.prompt.includes("same ambient light") &&
        job.prompt.includes("not the same room with small rearrangements") &&
        job.prompt.includes("Avoid: studio key or rim light") &&
        job.prompt.includes("owner-accepted transparent presentation anchor")
    )
  );
  assert.equal(new Set(styled.map((job) => job.sceneId)).size, 30);
  assert.equal(new Set(styled.map((job) => job.prompt)).size, 30);
  assert.equal(new Set(styled.map((job) => job.promptSha256)).size, 30);
  assert.ok(manifest.jobs.every((job) => job.storageKey.startsWith("affiliate-pilot/v2/")));
  assert.ok(
    manifest.jobs.every(
      (job) =>
        job.promptVersion === "affiliate-pilot-natural-photo-v2" &&
        job.generationVersion === "pilot-2026-07-26-run-02"
    )
  );
  assert.doesNotMatch(JSON.stringify(manifest), /\/private\/tmp|affiliate-pilot-refs/);
  assert.equal(manifest.poseGuideJobCount, 4);
  assert.equal(manifest.poseGuideCount, 2);
  assert.ok(
    styled
      .filter((job) => job.poseGuideId)
      .every(
        (job) =>
          job.referenceInputCount === 3 &&
          job.poseGuideStorageKey?.startsWith("affiliate-pilot/v2/private-pose-guides/") &&
          job.prompt.includes("Image 3 is the reviewed private")
      )
  );
  assert.match(
    styled.find(
      (job) =>
        job.asin === "B0D2KK6MNS" &&
        job.styleSlug === "boho-earth-tones" &&
        job.slot === 5
    )!.prompt,
    /exactly one ordinary straight horizontal wall-to-wall shower rod/
  );
  assert.match(
    styled.find(
      (job) =>
        job.asin === "B0829N8C9G" &&
        job.styleSlug === "minimalist-elegance" &&
        job.slot === 2
    )!.prompt,
    /plain and unbranded with no readable words/
  );

  const styleGroups = Map.groupBy(styled, (job) => job.styleSlug);
  assert.equal(styleGroups.size, 6);
  styleGroups.forEach((jobs) => {
    assert.equal(jobs.length, 5);
    assert.equal(new Set(jobs.map((job) => job.sceneId)).size, 5);
    assert.deepEqual(
      jobs.map((job) => job.slot).sort(),
      [1, 2, 3, 4, 5]
    );
  });
});

test("the physical-photo v3 pilot defines six products, 66 assets, and scene-specific realism gates", () => {
  const manifest = buildAffiliatePilotV3Manifest(affiliateApprovedCohortFixture());
  const presentations = manifest.jobs.filter((job) => job.kind === "presentation");
  const styled = manifest.jobs.filter((job) => job.kind === "styled");
  const reusedPresentations = presentations.filter(
    (job) => job.status === "reused_owner_approved"
  );
  const generatedPresentations = presentations.filter(
    (job) => job.status === "queued"
  );

  assert.equal(manifest.referenceRightsConfirmed, true);
  assert.equal(manifest.generationAuthorized, true);
  assert.equal(manifest.fullScaleAuthorized, false);
  assert.equal(manifest.ownerApprovedPresentationReuse, true);
  assert.equal(manifest.requestedModel, "gpt-image-2");
  assert.equal(manifest.requestedQuality, "high");
  assert.equal(manifest.providerModelObserved, null);
  assert.equal(manifest.providerQualityObserved, null);
  assert.equal(manifest.productCount, 6);
  assert.equal(manifest.presentationCount, 6);
  assert.equal(manifest.reusedPresentationCount, 3);
  assert.equal(manifest.generatedPresentationCount, 3);
  assert.equal(manifest.styledCount, 60);
  assert.equal(manifest.generationRequestedCount, 63);
  assert.equal(manifest.totalCount, 66);
  assert.equal(presentations.length, 6);
  assert.equal(styled.length, 60);
  assert.equal(new Set(manifest.products.map((product) => product.asin)).size, 6);
  assert.equal(new Set(manifest.jobs.map((job) => job.id)).size, 66);
  assert.equal(new Set(manifest.jobs.map((job) => job.storageKey)).size, 66);
  assert.equal(new Set(styled.map((job) => job.sceneId)).size, 60);
  assert.equal(new Set(styled.map((job) => job.prompt)).size, 60);
  assert.equal(new Set(styled.map((job) => job.promptSha256)).size, 60);
  assert.ok(manifest.products.every((product) => product.styleSlugs.length === 2));
  assert.ok(
    manifest.products.every(
      (product) =>
        manifest.jobs.filter(
          (job) => job.asin === product.asin && job.kind === "styled"
        ).length === 10
    )
  );
  assert.ok(
    manifest.jobs.every((job) =>
      job.storageKey.startsWith("affiliate-pilot/v3/")
    )
  );
  assert.ok(
    manifest.jobs.every(
      (job) =>
        job.promptVersion === "affiliate-pilot-physical-photo-v3" &&
        job.generationVersion === "pilot-2026-07-27-run-03"
    )
  );
  assert.equal(reusedPresentations.length, 3);
  assert.ok(
    reusedPresentations.every(
      (job) =>
        job.referenceInputCount === 0 &&
        job.requiresPromptCapture === false &&
        job.reusedFromStorageKey?.startsWith("affiliate-pilot/v2/")
    )
  );
  assert.equal(generatedPresentations.length, 3);
  assert.ok(
    generatedPresentations.every(
      (job) =>
        job.requiresPromptCapture &&
        job.prompt.includes("#00FF00") &&
        job.prompt.includes("Segmentation safety:")
    )
  );
  assert.ok(
    styled.every(
      (job) =>
        job.status === "queued" &&
        job.requiresPromptCapture &&
        job.sceneId?.startsWith("v3-") &&
        job.qaFocus &&
        job.prompt.includes("Physical-support invariant:") &&
        job.prompt.includes("Bathroom-architecture invariant:") &&
        job.prompt.includes("Reflection invariant:") &&
        job.prompt.includes("Material invariant:") &&
        job.prompt.includes("Set-variety invariant:") &&
        job.prompt.includes("Final physical audit before rendering:")
    )
  );
  assert.doesNotMatch(
    JSON.stringify(manifest),
    /\/private\/tmp|affiliate-pilot-v3-refs|affiliate-pilot-refs/
  );
  assert.match(
    styled.find(
      (job) =>
        job.asin === "B0829N8C9G" &&
        job.styleSlug === "minimalist-elegance" &&
        job.slot === 1
    )!.prompt,
    /tissue box completely supported/
  );
  assert.match(
    styled.find(
      (job) =>
        job.asin === "B0D2KK6MNS" &&
        job.styleSlug === "warm-editorial" &&
        job.slot === 3
    )!.prompt,
    /towel must rest over its hook rather than passing through/
  );
  assert.match(
    styled.find(
      (job) =>
        job.asin === "B0DC7VG6Z9" &&
        job.styleSlug === "spa-greenery" &&
        job.slot === 4
    )!.prompt,
    /bath mat must sit entirely outside the shower/
  );
  assert.match(
    styled.find(
      (job) =>
        job.asin === "B08TLP2D54" &&
        job.styleSlug === "modern-marble" &&
        job.slot === 1
    )!.prompt,
    /perspective-correct continuation/
  );
  assert.match(
    styled.find(
      (job) =>
        job.asin === "B07PFYZ3DP" &&
        job.styleSlug === "scandinavian-clean" &&
        job.slot === 1
    )!.prompt,
    /shortened middle shelf/
  );
  assert.match(
    styled.find(
      (job) =>
        job.asin === "B07SG7BV11" &&
        job.styleSlug === "vintage-eclectic" &&
        job.slot === 1
    )!.prompt,
    /No tiled floral repeat/
  );
});

test("the v4 realism reset reuses reviewed identities and queues 600 varied room-first scenes", () => {
  const manifest = buildAffiliatePilotV4Manifest(
    affiliateApprovedCohortFixture()
  );
  const identity = manifest.jobs.filter((job) => job.kind === "identity");
  const styled = manifest.jobs.filter((job) => job.kind === "styled");

  assert.equal(manifest.referenceRightsConfirmed, true);
  assert.equal(manifest.generationAuthorized, true);
  assert.equal(manifest.fullScaleAuthorized, false);
  assert.equal(manifest.regenerateAllPilotAssets, false);
  assert.equal(manifest.regenerateAllStyledAssets, true);
  assert.equal(manifest.reuseReviewedIdentityAssets, true);
  assert.equal(manifest.requestedModel, "gpt-image-2");
  assert.equal(manifest.requestedQuality, "high");
  assert.equal(manifest.providerModelObserved, null);
  assert.equal(manifest.providerQualityObserved, null);
  assert.equal(manifest.productCount, 10);
  assert.equal(manifest.styleCount, 12);
  assert.equal(manifest.styleViewsPerProduct, 60);
  assert.equal(manifest.identityViewsPerProduct, 7);
  assert.equal(manifest.presentationCount, 10);
  assert.equal(manifest.orthographicCount, 60);
  assert.equal(manifest.identityCount, 70);
  assert.equal(manifest.supportReferenceGenerationRequestedCount, 240);
  assert.equal(manifest.roomPlateGenerationRequestedCount, 120);
  assert.equal(manifest.roomPlateCorrectionEligibleCount, 120);
  assert.equal(manifest.nonTextileNearPassCorrectionEligibleCount, 480);
  assert.equal(manifest.finalizationEditGenerationRequestedCount, 0);
  assert.equal(manifest.totalProviderGenerationRequestFloor, 840);
  assert.equal(manifest.reusedIdentityCount, 70);
  assert.equal(manifest.styledCount, 600);
  assert.equal(manifest.generationRequestedCount, 600);
  assert.equal(manifest.totalCount, 670);
  assert.equal(identity.length, 70);
  assert.equal(styled.length, 600);
  assert.equal(new Set(manifest.products.map((product) => product.asin)).size, 10);
  assert.equal(new Set(manifest.jobs.map((job) => job.id)).size, 670);
  assert.equal(new Set(manifest.jobs.map((job) => job.storageKey)).size, 670);
  assert.equal(new Set(manifest.jobs.map((job) => job.prompt)).size, 670);
  assert.equal(new Set(manifest.jobs.map((job) => job.promptSha256)).size, 670);
  assert.ok(identity.every((job) => job.status === "reused_reviewed"));
  assert.ok(styled.every((job) => job.status === "queued"));
  assert.ok(
    manifest.jobs.every(
      (job) =>
        job.promptVersion === "affiliate-pilot-real-bathroom-v4.41" &&
        job.generationVersion === "pilot-2026-07-31-run-05" &&
        job.storageKey.startsWith("affiliate-pilot/v4/")
    )
  );
  assert.equal(
    manifest.realismReset.supersedesGenerationVersion,
    "pilot-2026-07-27-run-04"
  );
  assert.equal(manifest.executionPolicy.providerAttemptBudgetPerAsset, 2);
  assert.equal(
    manifest.executionPolicy.oneUseSceneSpecificTextileBodySupportRequired,
    true
  );
  assert.equal(manifest.executionPolicy.solidTextileBodySupportInputCount, 1);
  assert.equal(
    manifest.executionPolicy.solidTextileBodySupportIdentityDrapeInputAllowed,
    false
  );
  assert.equal(manifest.executionPolicy.patternedTextileBodySupportInputCount, 2);
  assert.equal(
    manifest.executionPolicy.textileBodySupportBroadFaceMinimumFraction,
    0.7
  );
  assert.equal(
    manifest.executionPolicy.textileBodySupportMaximumFullHeightCompressionChannels,
    1
  );
  assert.equal(
    manifest.executionPolicy
      .textileBodySupportFullHeightParallelChannelsAreHardReject,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileBodySupportMinimumMidBodyDeformationBreaks,
    1
  );
  assert.equal(
    manifest.executionPolicy
      .textileBodySupportRequiresMultiHeightSilhouetteChanges,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileBodySupportCompressionOrigin,
    "suspension_above_frame_only"
  );
  assert.equal(
    manifest.executionPolicy
      .textileBodySupportUnsupportedLateralPinchIsHardReject,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileBodySupportQuietGravityRequired,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileBodySupportLargeDiagonalTroughIsHardReject,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileBodySupportFoldVariationMode,
    "mostly_relaxed_broad_face_with_single_fading_asymmetric_displacement"
  );
  assert.equal(
    manifest.executionPolicy.textileFinalFreeHemAtOrAboveTubRimIsHardReject,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileFinalImmutableRoomPlateBaseRequired,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileFinalRoomPlateGeometryRedrawIsHardReject,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileFinalSecondFullHeightChannelIsHardReject,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileFinalExactCanvasRequired,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileFinalIdentityDrapeReferenceAllowed,
    false
  );
  assert.equal(
    manifest.executionPolicy.reviewedBodySupportCarriesIdentityToTextileFinal,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .oneUseSceneSpecificHeaderCountSupportRequiredForFullHeader,
    false
  );
  assert.equal(
    manifest.executionPolicy.oneUseSceneSpecificRoomPlateRequiredForFullHeader,
    false
  );
  assert.equal(
    manifest.executionPolicy.oneUseSceneSpecificRoomPlateRequiredForStyledTextiles,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileRoomPlateMustEnterFrameBelowSuspensionLine,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .textileRoomPlateVisibleCompleteShowerLintelIsHardReject,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileRoomPlateClearInsertionCorridorRequired,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .textileRoomPlateHumanTracesMustAvoidInsertionCorridor,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .textileRoomPlateMaximumForegroundIntrusionFrameFraction,
    0.08
  );
  assert.equal(manifest.executionPolicy.textileRoomPlateDecorativeObjectCount, 0);
  assert.equal(
    manifest.executionPolicy.textileRoomPlateMaximumMovableObjectGroups,
    5
  );
  assert.equal(
    manifest.executionPolicy.textileRoomPlateAdditionalHumanTraceCount,
    0
  );
  assert.equal(
    manifest.executionPolicy.textileRoomPlateStyleCueMode,
    "one_fixed_architectural_or_material_cue_only"
  );
  assert.equal(
    manifest.executionPolicy.textileRoomPlateElectricalDevicePolicy,
    "omit_unless_manifest_explicitly_requires_code_safe_gfci"
  );
  assert.equal(
    manifest.executionPolicy.textileRoomPlatePracticalLightingPolicy,
    "hardwired_fixture_outside_wet_zone_with_no_visible_supply_hardware"
  );
  assert.equal(
    manifest.executionPolicy
      .textileRoomPlateCameraVolumeMustMatchFinalPlacement,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .textileStyledReverseViewEnabled,
    false
  );
  assert.equal(
    manifest.executionPolicy
      .textileSlot04ExteriorSideViewRequired,
    true
  );
  assert.equal(
    manifest.executionPolicy.providerNativeRoomPlateCorrectionAllowed,
    true
  );
  assert.equal(
    manifest.executionPolicy.roomPlateSecondAttemptMayCorrectSameSceneNearPass,
    true
  );
  assert.equal(manifest.executionPolicy.roomPlateCorrectionInputCount, 1);
  assert.equal(
    manifest.executionPolicy.roomPlateCorrectionProviderAttemptBudget,
    1
  );
  assert.equal(
    manifest.executionPolicy
      .roomPlateCorrectionRequiresFullSizeReviewedSameSceneSource,
    true
  );
  assert.equal(
    manifest.executionPolicy.roomPlateCorrectionMustPreservePassingPixels,
    true
  );
  assert.equal(manifest.executionPolicy.roomPlateCorrectionReuseAllowed, false);
  assert.equal(
    manifest.executionPolicy.roomPlateCorrectionCompositingAllowed,
    false
  );
  assert.equal(manifest.executionPolicy.supportReferenceProviderAttemptBudget, 2);
  assert.equal(manifest.executionPolicy.roomPlateProviderAttemptBudget, 2);
  assert.equal(manifest.executionPolicy.supportReferenceReuseAllowed, false);
  assert.equal(manifest.executionPolicy.supportReferenceCompositingAllowed, false);
  assert.equal(manifest.executionPolicy.roomPlateReuseAllowed, false);
  assert.equal(
    manifest.executionPolicy.providerNativeRoomPlateEditRequiredForFullHeader,
    false
  );
  assert.equal(
    manifest.executionPolicy.providerNativeRoomPlateEditRequiredForStyledTextiles,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .providerNativeHeaderAuditEditRequiredForFullHeader,
    false
  );
  assert.equal(
    manifest.executionPolicy.providerNativeHeaderAuditEditAttemptBudget,
    2
  );
  assert.equal(
    manifest.executionPolicy.providerNativeHeaderAuditEditReuseAllowed,
    false
  );
  assert.equal(
    manifest.executionPolicy.styledTextileHeaderVisibilityPolicy,
    "entire_countable_header_outside_frame"
  );
  assert.equal(
    manifest.executionPolicy.reviewedIdentityEvidenceRequiredForExactHeaderCount,
    true
  );
  assert.equal(
    manifest.executionPolicy.visibleCountableTextileHeaderIsHardReject,
    true
  );
  assert.equal(
    manifest.executionPolicy.headerCountProviderLimitationObserved,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .providerNativeNonTextileNearPassCorrectionAllowed,
    true
  );
  assert.equal(
    manifest.executionPolicy.nonTextileNearPassCorrectionInputCount,
    3
  );
  assert.equal(
    manifest.executionPolicy
      .nonTextileNearPassCorrectionProviderAttemptBudget,
    2
  );
  assert.equal(
    manifest.executionPolicy
      .nonTextileNearPassCorrectionRequiresFullSizeReviewedSameSceneSource,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .nonTextileNearPassCorrectionMustPreservePassingPixels,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .nonTextileNearPassCorrectionMayEditOnlyDocumentedHardRejectPixels,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .nonTextileNearPassCorrectionRequiresCameraProjectedHandednessDirective,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .countertopDispenserViewerSpaceHandednessBySlotRequired,
    true
  );
  assert.equal(
    manifest.executionPolicy
      .humanTraceMayNotConflictWithFeaturedProductCategoryInvariant,
    true
  );
  assert.equal(
    manifest.executionPolicy.nonTextileNearPassCorrectionReuseAllowed,
    false
  );
  assert.equal(
    manifest.executionPolicy
      .nonTextileNearPassCorrectionCompositingAllowed,
    false
  );
  assert.equal(
    manifest.executionPolicy
      .providerAttemptBudgetResetsOnlyAfterLoggedRootStrategyRevision,
    true
  );
  assert.equal(manifest.executionPolicy.reusableProductCompositeAllowed, false);
  assert.equal(manifest.executionPolicy.localPixelSurgeryAllowed, false);
  assert.equal(manifest.visualQaRubric.minimumScorePerDimension, 3);
  assert.ok(
    manifest.products.every(
      (product) =>
        manifest.jobs.filter(
          (job) => job.asin === product.asin && job.kind === "identity"
        ).length === 7 &&
        manifest.jobs.filter(
          (job) => job.asin === product.asin && job.kind === "styled"
        ).length === 60
    )
  );
  assert.ok(
    identity.every(
      (job) =>
        job.postprocess === "chroma_to_transparent_png" &&
        job.prompt.includes("#00FF00") &&
        job.prompt.includes("Countable-feature preflight:") &&
        job.prompt.includes("Hidden-geometry policy:") &&
        job.prompt.includes("Orientation continuity:") &&
        job.prompt.includes("Final identity audit before rendering:") &&
        job.requiresPromptCapture === false &&
        job.reusedFromGenerationVersion === "pilot-2026-07-27-run-04"
    )
  );
  assert.ok(
    styled.every(
      (job) =>
        job.referenceInputCount === 3 &&
        job.sceneId?.startsWith("v4-") &&
        job.primarySceneReferenceView &&
        job.prompt.includes("Primary request: photograph a believable occupied home bathroom") &&
        job.prompt.includes("iPhone capture:") &&
        job.prompt.includes("Room history:") &&
        job.prompt.includes("Human trace:") &&
        job.prompt.includes("Material behavior:") &&
        job.prompt.includes("Style variation lane:") &&
        job.prompt.includes("Anti-stock invariant:") &&
        job.prompt.includes("Phone-evidence invariant:") &&
        job.prompt.includes("Daily-use invariant:") &&
        job.prompt.includes(
          "the assigned Human trace supplies every movable object"
        ) &&
        job.prompt.includes("Decor-limit invariant:") &&
        job.prompt.includes("Add zero optional decorative objects") &&
        job.prompt.includes("Human-trace parsing hard gate:") &&
        job.prompt.includes(
          "show exactly one code-safe U.S. bathroom GFCI"
        ) &&
        job.prompt.includes("Set-variety invariant:") &&
        job.prompt.includes("Input image roles:") &&
        job.prompt.includes("Reusing or locally compositing a product cutout") &&
        job.providerAttemptBudget === 2 &&
        job.reusableProductCompositeAllowed === false &&
        job.localPixelSurgeryAllowed === false &&
        job.localCropPolicy === "not_allowed" &&
        (job.exactProductMaterialReferenceRequired
          ? job.sourceReferenceCropPolicy ===
            "recorded_crop_to_exclude_listing_overlay_only"
          : job.sourceReferenceCropPolicy === "not_applicable")
    )
  );
  assert.equal(new Set(styled.map((job) => job.sceneId)).size, 600);
  assert.ok(
    styled.every(
      (job) =>
        !/table lamp/i.test(job.lightingRecipe) &&
        !/Natural foliage varies leaf angle/i.test(job.materialRecipe) &&
        !/plain pump bottle/i.test(job.humanTraceRecipe) &&
        !/\bor\b/i.test(job.humanTraceRecipe) &&
        !/nearby objects|basket contains|everyday grooming object/i.test(
          job.humanTraceRecipe
        )
    )
  );
  const directSoapBarJobs = styled.filter((job) =>
    /plain soap bar/i.test(job.humanTraceRecipe)
  );
  assert.ok(directSoapBarJobs.length > 0);
  assert.ok(
    directSoapBarJobs.every(
      (job) =>
        /exactly one hand towel hangs fully visible from one fixed wall hook/i.test(
          job.humanTraceRecipe
        ) &&
        /one small visibly darker damp patch/i.test(
          job.humanTraceRecipe
        ) &&
        /rests directly on a fixed vanity counter/i.test(
          job.humanTraceRecipe
        ) &&
        /dish, tray, and holder are absent; no additional movable object/i.test(
          job.humanTraceRecipe
        )
    )
  );
  const closedCabinetHumanTraceJobs = styled.filter((job) =>
    /slightly off level/i.test(job.humanTraceRecipe)
  );
  assert.ok(closedCabinetHumanTraceJobs.length > 0);
  assert.ok(
    closedCabinetHumanTraceJobs.every(
      (job) =>
        /every cabinet and drawer is fully closed/i.test(
          job.humanTraceRecipe
        ) &&
        /noticeable angle/i.test(job.humanTraceRecipe) &&
        /no other movable object/i.test(job.humanTraceRecipe)
    )
  );
  assert.ok(
    styled.every(
      (job) => !/drawer remains open by about two inches/i.test(job.prompt)
    )
  );
  const fiveSceneSets = Map.groupBy(
    styled,
    (job) => `${job.asin}:${job.styleSlug}`
  );
  assert.equal(fiveSceneSets.size, 120);
  fiveSceneSets.forEach((jobs) => {
    assert.equal(jobs.length, 5);
    assert.equal(new Set(jobs.map((job) => job.cameraRecipe)).size, 5);
    assert.equal(new Set(jobs.map((job) => job.lightingRecipe)).size, 5);
    assert.equal(new Set(jobs.map((job) => job.roomHistoryRecipe)).size, 5);
    assert.equal(new Set(jobs.map((job) => job.humanTraceRecipe)).size, 5);
    assert.equal(new Set(jobs.map((job) => job.materialRecipe)).size, 5);
    assert.equal(new Set(jobs.map((job) => job.styleVariationLane)).size, 5);
    assert.equal(
      new Set(jobs.map((job) => job.styleSetExpressionLane)).size,
      5
    );
  });
  assert.ok(
    styled.every(
      (job) =>
        job.prompt.includes("Set-level fixed-surface expression lane:") &&
        job.prompt.includes("Fixed-surface authority:") &&
        job.prompt.includes("Set-diversity hard gate:") &&
        job.prompt.includes("Movable-object ceiling:") &&
        job.prompt.includes(
          "The style name and legacy description are thematic labels"
        ) &&
        !job.prompt.includes("Optional style vocabulary:")
    )
  );
  for (const style of inspirationStyles) {
    const styleJobs = styled.filter((job) => job.styleSlug === style.slug);
    assert.equal(styleJobs.length, 50);
    assert.ok(
      styleJobs.every(
        (job) =>
          job.prompt.includes(
            `Style direction: ${style.name} atmosphere only.`
          ) && !job.prompt.includes(style.description)
      ),
      `styled prompts must suppress the legacy ${style.name} description`
    );
  }
  const modernMarbleJobs = styled.filter(
    (job) => job.styleSlug === "modern-marble"
  );
  assert.equal(modernMarbleJobs.length, 50);
  assert.ok(
    modernMarbleJobs.every(
      (job) =>
        job.prompt.includes("Modern Marble atmosphere only.") &&
        job.prompt.includes(
          "the assigned fixed-surface lane alone decides whether any stone is visible"
        ) &&
        !job.prompt.includes(
          "Style direction: Modern Marble. Veined stone, cool tones"
        ) &&
        job.styleSetExpressionLane.includes("REQUIRED:") &&
        /zero(?:[- ]stone)?[- ]vein/i.test(job.styleSetExpressionLane) &&
        !job.prompt.includes("one skincare bottle")
    )
  );
  const modernMarbleSlotOne = modernMarbleJobs.filter(
    (job) => job.slot === 1
  );
  assert.equal(modernMarbleSlotOne.length, 10);
  assert.ok(
    modernMarbleSlotOne.every(
      (job) =>
        job.styleSetExpressionLane.includes("COUNTER-ONLY STONE LANE") &&
        job.styleSetExpressionLane.includes(
          "floor with zero stone veins"
        ) &&
        job.styleSetExpressionLane.includes(
          "wet-zone wall with zero stone veins"
        )
    )
  );
  const modernMarbleSlotThree = modernMarbleJobs.filter(
    (job) => job.slot === 3
  );
  assert.equal(modernMarbleSlotThree.length, 10);
  assert.ok(
    modernMarbleSlotThree.every(
      (job) =>
        job.styleSetExpressionLane.includes(
          "HARDWARE-AND-PERIOD-DETAIL LANE"
        ) &&
        job.styleSetExpressionLane.includes(
          "Visible marble, marble-look, stone veining, and white-gray Carrara are forbidden everywhere"
        ) &&
        job.styleSetExpressionLane.includes(
          "vanity counter = solid unpatterned zero-vein finish"
        ) &&
        job.styleSetExpressionLane.includes(
          "every wet-zone wall = plain solid-color tile or plaster with zero veins"
        )
    )
  );
  const spaGreeneryJobs = styled.filter(
    (job) => job.styleSlug === "spa-greenery"
  );
  assert.equal(spaGreeneryJobs.length, 50);
  assert.ok(
    spaGreeneryJobs.every(
      (job) =>
        job.styleSetExpressionLane.includes("REQUIRED:") &&
        /zero (?:signature )?green/i.test(job.styleSetExpressionLane) &&
        job.styleSetExpressionLane.includes("Add no plant.")
    )
  );
  const spaGreenerySlotOne = spaGreeneryJobs.filter(
    (job) => job.slot === 1
  );
  assert.equal(spaGreenerySlotOne.length, 10);
  assert.ok(
    spaGreenerySlotOne.every(
      (job) =>
        job.styleSetExpressionLane.includes(
          "COUNTER-OR-BACKSPLASH GREEN LANE"
        ) &&
        job.styleSetExpressionLane.includes(
          "main wall = ordinary warm white, cream, or light neutral gray paint with zero green"
        ) &&
        job.styleSetExpressionLane.includes(
          "wet-zone wall = plain white, cream, or warm gray with zero green"
      )
    )
  );
  const brassTerrazzoJobs = styled.filter(
    (job) => job.styleSlug === "brass-terrazzo"
  );
  assert.equal(brassTerrazzoJobs.length, 50);
  assert.ok(
    brassTerrazzoJobs.every(
      (job) =>
        job.styleSetExpressionLane.includes("REQUIRED SURFACES:") &&
        /zero[- ]chips?/i.test(job.styleSetExpressionLane) &&
        /EXACT BRASS (?:FAMILY|LIMIT)/.test(job.styleSetExpressionLane)
    )
  );
  const brassTerrazzoSlotOne = brassTerrazzoJobs.filter(
    (job) => job.slot === 1
  );
  assert.equal(brassTerrazzoSlotOne.length, 10);
  assert.ok(
    brassTerrazzoSlotOne.every(
      (job) =>
        job.styleSetExpressionLane.includes(
          "COUNTER-ONLY TERRAZZO LANE"
        ) &&
        job.styleSetExpressionLane.includes(
          "floor = plain solid-color"
        ) &&
        job.styleSetExpressionLane.includes(
          "wet-zone wall = plain solid-color"
        ) &&
        job.styleSetExpressionLane.includes(
          "champagne brass is allowed only on the sink faucet and its own handles"
        ) &&
        job.styleSetExpressionLane.includes(
          "mirror frame, cabinet pulls and knobs, room-door hardware"
        )
    )
  );
  const brassTerrazzoSlotTwo = brassTerrazzoJobs.filter(
    (job) => job.slot === 2
  );
  assert.equal(brassTerrazzoSlotTwo.length, 10);
  assert.ok(
    brassTerrazzoSlotTwo.every(
      (job) =>
        job.styleSetExpressionLane.includes(
          "WET-ZONE-ONLY TERRAZZO LANE"
        ) &&
        job.styleSetExpressionLane.includes(
          "champagne brass is allowed only on the shower or tub controls and matching spout"
        ) &&
        job.styleSetExpressionLane.includes(
          "sink faucet, mirror frame, cabinet pulls and knobs"
        )
    )
  );
  const brassTerrazzoSlotThree = brassTerrazzoJobs.filter(
    (job) => job.slot === 3
  );
  assert.equal(brassTerrazzoSlotThree.length, 10);
  assert.ok(
    brassTerrazzoSlotThree.every(
      (job) =>
        job.styleSetExpressionLane.includes(
          "FLOOR-ONLY TERRAZZO LANE"
        ) &&
        job.styleSetExpressionLane.includes(
          "champagne brass is allowed only on the vanity cabinet pulls and knobs"
        )
    )
  );
  const brassTerrazzoSlotFour = brassTerrazzoJobs.filter(
    (job) => job.slot === 4
  );
  assert.equal(brassTerrazzoSlotFour.length, 10);
  assert.ok(
    brassTerrazzoSlotFour.every(
      (job) =>
        job.styleSetExpressionLane.includes(
          "BRASS-ONLY OWNER-UPDATE LANE"
        ) &&
        job.styleSetExpressionLane.includes(
          "Visible terrazzo, chip aggregate, confetti pattern, and speckled stone are forbidden everywhere"
        ) &&
        job.styleSetExpressionLane.includes(
          "champagne brass is allowed only on the vanity cabinet pulls and knobs"
        ) &&
        job.styleSetExpressionLane.includes(
          "sink faucet, mirror frame, room-door hardware"
        )
    )
  );
  const brassTerrazzoSlotFive = brassTerrazzoJobs.filter(
    (job) => job.slot === 5
  );
  assert.equal(brassTerrazzoSlotFive.length, 10);
  assert.ok(
    brassTerrazzoSlotFive.every(
      (job) =>
        job.styleSetExpressionLane.includes(
          "ALTERNATE-PALETTE JOINERY LANE"
        ) &&
        job.styleSetExpressionLane.includes(
          "Visible terrazzo and chip aggregate are forbidden"
        ) &&
        job.styleSetExpressionLane.includes(
          "choose either one single small brass cabinet knob or one narrow fixed brass trim accent, never both"
        ) &&
        job.styleSetExpressionLane.includes(
          "all have zero chips"
        )
    )
  );
  assert.doesNotMatch(
    JSON.stringify(manifest),
    /\/private\/tmp|project-pint-affiliate-pilot-v4-refs/
  );
  const nonTextileJobs = styled.filter(
    (job) =>
      job.asin !== "B0D2KK6MNS" &&
      job.asin !== "B07SG7BV11"
  );
  const textileJobs = styled.filter(
    (job) =>
      job.asin === "B0D2KK6MNS" ||
      job.asin === "B07SG7BV11"
  );
  assert.equal(nonTextileJobs.length, 480);
  assert.equal(textileJobs.length, 120);
  assert.ok(
    nonTextileJobs.every(
      (job) =>
        job.nonTextileNearPassCorrectionAllowed === true &&
        job.nonTextileNearPassCorrectionInputCount === 3 &&
        job.nonTextileNearPassCorrectionPrompt &&
        job.nonTextileNearPassCorrectionPromptSha256 &&
        job.nonTextileNearPassCorrectionProviderAttemptBudget === 2 &&
        job.nonTextileNearPassCorrectionRequiresSameSceneNearPass === true &&
        job.nonTextileNearPassCorrectionMustPreservePassingPixels === true &&
        job.nonTextileNearPassCorrectionMayEditOnlyDocumentedHardRejectPixels ===
          true &&
        job.nonTextileNearPassCorrectionReuseAllowed === false &&
        job.nonTextileNearPassCorrectionCompositingAllowed === false
    )
  );
  assert.ok(
    textileJobs.every(
      (job) =>
        job.nonTextileNearPassCorrectionAllowed === false &&
        job.nonTextileNearPassCorrectionInputCount === 0 &&
        job.nonTextileNearPassCorrectionPrompt === null &&
        job.nonTextileNearPassCorrectionPromptSha256 === null
    )
  );

  const oxo = styled.find(
    (job) =>
      job.asin === "B0829N8C9G" &&
      job.styleSlug === "dark-moody" &&
      job.slot === 4
  )!;
  assert.match(oxo.prompt, /short, nearly horizontal forward spout/i);
  assert.match(
    oxo.prompt,
    /oval mark belongs only to the front surface.+absent from the canonical back/i
  );
  assert.match(oxo.prompt, /product merely happens to be present/i);
  assert.match(oxo.prompt, /No secondary object may share the featured product's category or silhouette/i);
  assert.match(oxo.prompt, /omit bottles, tubes, and packages/i);
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /same-scene near-pass and the immutable base photograph/i
  );
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /change only the smallest pixels required by the separately supplied documented hard-reject list/i
  );
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /Image 2 is the reviewed seven-view identity atlas/i
  );
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /Image 3 is the reviewed back identity view/i
  );
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /Any material room redraw is a hard rejection/i
  );
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /Camera-projected handedness gate/i
  );
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /required viewer-space projection for this exact camera/i
  );
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /Image 3's reviewed back identity view is authoritative/i
  );
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /zero visible oval front marks/i
  );
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /plain continuous rear brushed-steel surface/i
  );
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /spout must project toward the viewer'?s left exactly as Image 3 shows/i
  );
  assert.doesNotMatch(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /preserving the visible canonical front/i
  );
  assert.match(
    oxo.nonTextileNearPassCorrectionPrompt!,
    /label-bearing, logo-bearing, or pseudo-text object/i
  );
  const oxoMinimalist = styled
    .filter(
      (job) =>
        job.asin === "B0829N8C9G" &&
        job.styleSlug === "minimalist-elegance"
    )
    .sort((a, b) => a.slot - b.slot);
  assert.equal(oxoMinimalist.length, 5);
  assert.match(
    oxoMinimalist[0]!.prompt,
    /viewer'?s right in this front-biased camera/i
  );
  assert.match(oxoMinimalist[1]!.prompt, /right-view short spout projects toward the viewer'?s left/i);
  assert.match(oxoMinimalist[2]!.prompt, /top-view short spout.+viewer'?s right/i);
  assert.match(oxoMinimalist[3]!.prompt, /back-view short spout projects toward the viewer'?s left/i);
  assert.match(oxoMinimalist[4]!.prompt, /left-view short spout projects toward the viewer'?s right/i);
  assert.match(oxoMinimalist[4]!.humanTraceRecipe, /plain grooming brush/i);
  assert.ok(
    styled.every((job) =>
      job.prompt.includes("Scene-view visibility gate:")
    )
  );
  const oxoSlotFour = styled.filter(
    (job) => job.asin === "B0829N8C9G" && job.slot === 4
  );
  assert.equal(oxoSlotFour.length, 12);
  assert.ok(
    oxoSlotFour.every(
      (job) =>
        /zero visible oval front marks/i.test(job.prompt) &&
        /plain continuous canonical rear/i.test(job.prompt) &&
        /spout must project toward the viewer'?s left exactly as Image 2 shows/i.test(
          job.prompt
        ) &&
        /visible front mark or viewer-right spout is a hard rejection/i.test(
          job.prompt
        ) &&
        job.prompt.includes(
          "Broad tight-room bathroom view that uses the 0.5x lens to reveal an ordinary room, never a counter close-up."
        ) &&
        job.prompt.includes("at least two coherent non-vanity room zones") &&
        job.prompt.includes("outer image third") &&
        job.prompt.includes("8–14 percent of frame height") &&
        job.prompt.includes("exact fully visible wall-hook towel")
    )
  );
  const oxoSlotOne = styled.filter(
    (job) => job.asin === "B0829N8C9G" && job.slot === 1
  );
  assert.equal(oxoSlotOne.length, 12);
  assert.ok(
    oxoSlotOne.every(
      (job) =>
        job.prompt.includes(
          "Wide functional bathroom view from reachable low standing or seated-height space, never a vanity close-up."
        ) &&
        job.prompt.includes("at least two coherent non-vanity room zones") &&
        job.prompt.includes(
          "Keep the vanity at no more than the lower half of the frame."
        ) &&
        job.prompt.includes("outer image third") &&
        job.prompt.includes("8–14 percent of frame height") &&
        job.prompt.includes(
          "The exact assigned human-trace groups are ordinary traces"
        )
    )
  );
  const oxoSlotTwo = styled.filter(
    (job) => job.asin === "B0829N8C9G" && job.slot === 2
  );
  assert.equal(oxoSlotTwo.length, 12);
  assert.ok(
    oxoSlotTwo.every(
      (job) =>
        job.prompt.includes(
          "Broad functional bathroom view from reachable standing space, not a counter close-up."
        ) &&
        job.prompt.includes("at least two coherent non-vanity room zones") &&
        job.prompt.includes("outer image third") &&
        job.prompt.includes("8–14 percent of frame height")
    )
  );

  const curtain = styled.find(
    (job) =>
      job.asin === "B0D2KK6MNS" &&
      job.styleSlug === "coastal-calm" &&
      job.slot === 1
  )!;
  assert.match(curtain.prompt, /exactly twelve separate (?:simple silver )?hooks/);
  assert.match(curtain.prompt, /no separate top band/i);
  assert.match(curtain.prompt, /entire countable header.+outside/i);
  assert.match(curtain.prompt, /zero rod, mount, hook, reinforced opening, or top-edge pixels/i);
  assert.equal(
    curtain.generationStrategy,
    "room_plate_edit_deformation_gated_material_locked_textile_body_hidden_header"
  );
  assert.equal(curtain.referenceInputCount, 3);
  assert.equal(curtain.exactProductMaterialReferenceRequired, true);
  assert.equal(curtain.exactProductHeaderReferenceRequired, false);
  assert.match(curtain.prompt, /body-and-hem support/i);
  assert.equal(curtain.supportReferenceRequired, true);
  assert.equal(curtain.supportReferenceInputCount, 1);
  assert.equal(curtain.headerSupportReferenceRequired, false);
  assert.equal(curtain.headerSupportReferenceInputCount, 0);
  assert.equal(curtain.headerSupportReferencePrompt, null);
  assert.equal(curtain.roomPlateSupportRequired, true);
  assert.equal(curtain.roomPlateSupportInputCount, 0);
  assert.equal(curtain.roomPlateProviderAttemptBudget, 2);
  assert.equal(curtain.roomPlateReuseAllowed, false);
  assert.equal(curtain.roomPlateCorrectionAllowed, true);
  assert.equal(curtain.roomPlateCorrectionInputCount, 1);
  assert.equal(curtain.roomPlateCorrectionProviderAttemptBudget, 1);
  assert.equal(curtain.roomPlateCorrectionRequiresSameSceneNearPass, true);
  assert.equal(curtain.roomPlateCorrectionMustPreservePassingPixels, true);
  assert.equal(curtain.roomPlateCorrectionReuseAllowed, false);
  assert.equal(curtain.roomPlateCorrectionCompositingAllowed, false);
  assert.match(
    curtain.roomPlateCorrectionPrompt!,
    /provider-native bounded correction/i
  );
  assert.match(
    curtain.roomPlateCorrectionPrompt!,
    /alter only the smallest documented hard-reject region/i
  );
  assert.match(
    curtain.roomPlateCorrectionPrompt!,
    /preserve Image 1's camera position, crop, lens behavior/i
  );
  assert.match(
    curtain.roomPlateCorrectionPrompt!,
    /featured .+ remains completely absent/i
  );
  assert.match(
    curtain.roomPlateCorrectionPrompt!,
    /fixed light.+code-safe hardwired wall or ceiling fixture outside the wet zone/i
  );
  assert.equal(curtain.providerNativeRoomPlateEditRequired, true);
  assert.equal(curtain.nativeHeaderAuditEditRequired, false);
  assert.equal(curtain.nativeHeaderAuditEditInputCount, 0);
  assert.equal(curtain.nativeHeaderAuditEditProviderAttemptBudget, 2);
  assert.equal(curtain.nativeHeaderAuditEditReuseAllowed, false);
  assert.equal(curtain.nativeHeaderAuditEditPrompt, null);
  assert.equal(curtain.finalizationEditGenerationCount, 0);
  assert.match(curtain.roomPlateSupportPrompt!, /room-only iPhone plate/i);
  assert.match(curtain.roomPlateSupportPrompt!, /reachable dry-floor camera position outside the tub/i);
  assert.match(curtain.roomPlateSupportPrompt!, /below the would-be suspension line/i);
  assert.match(curtain.roomPlateSupportPrompt!, /complete rectangular shower opening.+hard rejection/i);
  assert.match(curtain.roomPlateSupportPrompt!, /full shower lintel, soffit, ceiling band/i);
  assert.match(curtain.roomPlateSupportPrompt!, /continuous empty vertical corridor/i);
  assert.match(curtain.roomPlateSupportPrompt!, /no more than eight percent of total frame area/i);
  assert.match(curtain.roomPlateSupportPrompt!, /omit every outlet, receptacle, switch, wall plate/i);
  assert.match(
    curtain.roomPlateSupportPrompt!,
    /fixed lighting recipe may use only a code-safe hardwired wall or ceiling fixture outside the wet zone/i
  );
  assert.match(curtain.roomPlateSupportPrompt!, /every named trace outside the reserved shower insertion corridor/i);
  assert.match(curtain.roomPlateSupportPrompt!, /Exact human-trace ceiling/i);
  assert.match(curtain.roomPlateSupportPrompt!, /Do not invent any additional sign of use/i);
  assert.match(curtain.roomPlateSupportPrompt!, /Zero-decor gate/i);
  assert.match(curtain.roomPlateSupportPrompt!, /no plant, flower, vase, art/i);
  assert.match(curtain.roomPlateSupportPrompt!, /no more than five groups/i);
  assert.match(curtain.roomPlateSupportPrompt!, /fixed architectural or material choice/i);
  assert.match(curtain.prompt, /locked photographic base/i);
  assert.match(curtain.prompt, /immutable base photograph/i);
  assert.match(curtain.prompt, /constrained local provider edit/i);
  assert.match(curtain.prompt, /not a room re-render/i);
  assert.match(curtain.prompt, /redrawing any of those room elements is a hard rejection/i);
  assert.match(curtain.prompt, /below-suspension-line feasibility gate/i);
  assert.match(curtain.prompt, /alter only the empty lower shower opening/i);
  assert.equal(curtain.supportReferenceGenerationCount, 2);
  assert.equal(
    curtain.supportReferenceCropPolicy,
    "not_applicable"
  );
  assert.match(curtain.supportReferencePrompt!, /broad cloth face covering at least seventy percent/i);
  assert.match(curtain.supportReferencePrompt!, /at most one compression trough may persist for the full visible height/i);
  assert.match(curtain.supportReferencePrompt!, /two or more adjacent full-height channels/i);
  assert.match(curtain.supportReferencePrompt!, /No generated identity drape is supplied or allowed/i);
  assert.match(curtain.supportReferencePrompt!, /Image 1 is the reviewed exact-product listing material\/detail crop/i);
  assert.match(curtain.supportReferencePrompt!, /no tieback, knot, bow, band, cord, clip/i);
  assert.match(curtain.supportReferencePrompt!, /large diagonal trough, U-shaped scoop, swag, loop/i);
  assert.match(curtain.prompt, /one mostly broad cloth face/i);
  assert.match(curtain.prompt, /A second adjacent uninterrupted full-height channel is a hard rejection/i);
  assert.match(curtain.prompt, /free hem ending at or above the tub rim/i);
  assert.match(curtain.prompt, /continuing naturally below the tub rim/i);
  assert.match(curtain.prompt, /Image 3 is the reviewed exact-product material\/detail crop/i);
  assert.match(curtain.prompt, /no reusable product silhouette or header/i);
  assert.match(curtain.prompt, /exactly 1024 pixels wide by exactly 1536 pixels high/i);
  assert.match(curtain.supportReferencePrompt!, /Any one-pixel width or height deviation is a hard rejection/i);
  assert.equal(
    curtain.identityReferenceCropPolicy,
    "not_applicable"
  );
  const curtainClose = styled.find(
    (job) =>
      job.asin === "B0D2KK6MNS" &&
      job.styleSlug === "coastal-calm" &&
      job.slot === 2
  )!;
  assert.match(curtainClose.prompt, /entire countable header outside/i);
  assert.equal(
    curtainClose.generationStrategy,
    "room_plate_edit_deformation_gated_material_locked_textile_body_hidden_header"
  );
  assert.match(curtainClose.prompt, /35.+55 percent open/i);
  assert.match(curtainClose.prompt, /no more than 45 percent of the panel width/i);
  assert.match(curtainClose.prompt, /shower-interior edge/i);
  assert.equal(curtainClose.referenceInputCount, 3);
  assert.equal(curtainClose.exactProductMaterialReferenceRequired, true);
  assert.equal(curtainClose.exactProductHeaderReferenceRequired, false);
  assert.equal(curtainClose.supportReferenceRequired, true);
  assert.equal(curtainClose.supportReferenceInputCount, 1);
  assert.equal(curtainClose.supportReferenceReuseAllowed, false);
  assert.equal(curtainClose.supportReferenceCompositingAllowed, false);
  assert.match(curtainClose.supportReferencePrompt!, /one-use physical-state reference/i);
  assert.match(curtainClose.supportReferencePrompt!, /broad cloth face covering at least seventy percent/i);
  assert.match(curtainClose.supportReferencePrompt!, /No generated identity drape is supplied or allowed/i);
  assert.equal(curtainClose.headerSupportReferenceRequired, false);
  assert.equal(curtainClose.headerSupportReferenceInputCount, 0);
  assert.equal(curtainClose.headerSupportReferencePrompt, null);
  assert.equal(curtainClose.roomPlateSupportRequired, true);
  assert.match(curtainClose.roomPlateSupportPrompt!, /room-only iPhone plate/i);
  assert.equal(curtainClose.providerNativeRoomPlateEditRequired, true);
  assert.equal(curtainClose.nativeHeaderAuditEditRequired, false);
  assert.equal(curtainClose.nativeHeaderAuditEditPrompt, null);
  assert.equal(curtainClose.finalizationEditGenerationCount, 0);
  assert.equal(curtainClose.supportReferenceGenerationCount, 2);
  assert.equal(
    curtainClose.identityReferenceCropPolicy,
    "not_applicable"
  );

  const curtainReverse = styled.find(
    (job) =>
      job.asin === "B0D2KK6MNS" &&
      job.styleSlug === "coastal-calm" &&
      job.slot === 4
  )!;
  assert.match(
    curtainReverse.roomPlateSupportPrompt!,
    /reachable dry-floor camera position outside the tub/i
  );
  assert.match(
    curtainReverse.prompt,
    /low oblique exterior side view from accessible dry floor near the tub/i
  );
  assert.match(
    curtainReverse.prompt,
    /far-side 18-30 percent of frame width at every height/i
  );
  assert.doesNotMatch(
    curtainReverse.roomPlateSupportPrompt!,
    /Reverse-view occlusion-plane gate/i
  );

  const patternedCurtain = styled.find(
    (job) =>
      job.asin === "B07SG7BV11" &&
      job.styleSlug === "vintage-eclectic" &&
      job.slot === 1
  )!;
  assert.equal(patternedCurtain.supportReferenceInputCount, 2);
  assert.match(
    patternedCurtain.supportReferencePrompt!,
    /Image 1 is the reviewed .+ identity view for print motif hierarchy/i
  );
  assert.match(
    patternedCurtain.supportReferencePrompt!,
    /explicitly discard its silhouette, periodic fold rhythm/i
  );

  const bench = styled.find(
    (job) =>
      job.asin === "B0DC7VG6Z9" &&
      job.styleSlug === "industrial-loft" &&
      job.slot === 3
  )!;
  assert.match(bench.prompt, /exactly nine front-to-back top slats/i);
  assert.match(bench.prompt, /clear of the drain and glass/i);

  const cart = styled.find(
    (job) =>
      job.asin === "B07PFYZ3DP" &&
      job.styleSlug === "japandi" &&
      job.slot === 3
  )!;
  assert.match(cart.prompt, /shortened middle shelf/);
  assert.match(cart.prompt, /four casters/);

  const delta = identity.find(
    (job) =>
      job.asin === "B008X0VM0Q" && job.identityView === "front"
  )!;
  assert.match(delta.prompt, /fixed non-pivoting rounded-square open C-shaped bar/);
  assert.match(delta.prompt, /never mirror a handed product/i);

  const marble = identity.find(
    (job) =>
      job.asin === "B000MS63E2" && job.identityView === "top"
  )!;
  assert.match(marble.prompt, /exactly eight raised bars/);
  assert.match(marble.prompt, /exactly seven drainage channels/);

  const caddy = styled.find(
    (job) =>
      job.asin === "B00176AOKM" &&
      job.styleSlug === "spa-greenery" &&
      job.slot === 3
  )!;
  assert.match(caddy.prompt, /both extension arms/);
  assert.match(caddy.prompt, /exact left-right layout/);
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

test("admin replacement record exposes human-readable owner decisions and normalized cohort counts", async () => {
  const page = await fs.readFile(path.join(process.cwd(), "app/admin/affiliate-links/page.tsx"), "utf8");
  const queue = await fs.readFile(
    path.join(process.cwd(), "components/admin/AffiliateReplacementQueue.tsx"),
    "utf8"
  );
  const manager = await fs.readFile(
    path.join(process.cwd(), "components/admin/AffiliateCatalogManager.tsx"),
    "utf8"
  );
  const styles = await fs.readFile(path.join(process.cwd(), "app/globals.css"), "utf8");
  assert.match(page, /affiliateReplacementFixture/);
  assert.match(page, /60 approved style slots use/);
  assert.match(page, /59 canonical products/);
  assert.match(queue, /Approved replacement record/);
  assert.match(queue, /ownerRejectionReason/);
  assert.match(queue, /reuseExistingCanonical/);
  assert.match(manager, /editorTriggerRef/);
  assert.match(manager, /editorTriggerRef\.current\?\.focus\(\)/);
  assert.match(styles, /\.affiliate-replacement-mobile-list/);
  assert.match(styles, /@media \(max-width: 820px\)[\s\S]*\.affiliate-replacement-table-wrap/);
});
