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
        job.promptVersion === "affiliate-pilot-real-bathroom-v4.14" &&
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
  assert.equal(
    manifest.executionPolicy
      .textileBodySupportFullHeightParallelChannelsAreHardReject,
    true
  );
  assert.equal(
    manifest.executionPolicy.textileBodySupportMinimumMidBodyDeformationBreaks,
    2
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
        job.prompt.includes("Decor-limit invariant:") &&
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
  });
  assert.doesNotMatch(
    JSON.stringify(manifest),
    /\/private\/tmp|project-pint-affiliate-pilot-v4-refs/
  );

  const oxo = styled.find(
    (job) =>
      job.asin === "B0829N8C9G" &&
      job.styleSlug === "dark-moody" &&
      job.slot === 4
  )!;
  assert.match(oxo.prompt, /short, nearly horizontal forward spout/i);
  assert.match(oxo.prompt, /product merely happens to be present/i);

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
  assert.equal(curtain.supportReferenceInputCount, 2);
  assert.equal(curtain.headerSupportReferenceRequired, false);
  assert.equal(curtain.headerSupportReferenceInputCount, 0);
  assert.equal(curtain.headerSupportReferencePrompt, null);
  assert.equal(curtain.roomPlateSupportRequired, true);
  assert.equal(curtain.roomPlateSupportInputCount, 0);
  assert.equal(curtain.roomPlateProviderAttemptBudget, 2);
  assert.equal(curtain.roomPlateReuseAllowed, false);
  assert.equal(curtain.providerNativeRoomPlateEditRequired, true);
  assert.equal(curtain.nativeHeaderAuditEditRequired, false);
  assert.equal(curtain.nativeHeaderAuditEditInputCount, 0);
  assert.equal(curtain.nativeHeaderAuditEditProviderAttemptBudget, 2);
  assert.equal(curtain.nativeHeaderAuditEditReuseAllowed, false);
  assert.equal(curtain.nativeHeaderAuditEditPrompt, null);
  assert.equal(curtain.finalizationEditGenerationCount, 0);
  assert.match(curtain.roomPlateSupportPrompt!, /room-only iPhone plate/i);
  assert.match(curtain.roomPlateSupportPrompt!, /below the would-be suspension line/i);
  assert.match(curtain.roomPlateSupportPrompt!, /complete rectangular shower opening.+hard rejection/i);
  assert.match(curtain.roomPlateSupportPrompt!, /full shower lintel, soffit, ceiling band/i);
  assert.match(curtain.prompt, /locked photographic base/i);
  assert.match(curtain.prompt, /below-suspension-line feasibility gate/i);
  assert.match(curtain.prompt, /alter only the empty lower shower opening/i);
  assert.equal(curtain.supportReferenceGenerationCount, 2);
  assert.equal(
    curtain.supportReferenceCropPolicy,
    "not_applicable"
  );
  assert.match(curtain.supportReferencePrompt!, /three to five plainly unequal primary masses/i);
  assert.match(curtain.supportReferencePrompt!, /two or more different mid-body heights/i);
  assert.match(curtain.supportReferencePrompt!, /no set of similar fold channels may run uninterrupted/i);
  assert.match(curtain.supportReferencePrompt!, /every fold and compressed mass descends from gathered suspension points above/i);
  assert.match(curtain.supportReferencePrompt!, /no tieback, knot, bow, band, cord, clip/i);
  assert.match(curtain.supportReferencePrompt!, /never unsupported lateral force/i);
  assert.match(curtain.prompt, /never smooth those breaks into uninterrupted full-height channels/i);
  assert.match(curtain.prompt, /Image 3 is the reviewed exact-product material\/detail crop/i);
  assert.match(curtain.prompt, /no reusable product silhouette or header/i);
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
  assert.equal(curtainClose.supportReferenceInputCount, 2);
  assert.equal(curtainClose.supportReferenceReuseAllowed, false);
  assert.equal(curtainClose.supportReferenceCompositingAllowed, false);
  assert.match(curtainClose.supportReferencePrompt!, /one-use physical-state reference/i);
  assert.match(curtainClose.supportReferencePrompt!, /three to five plainly unequal primary masses/i);
  assert.match(curtainClose.supportReferencePrompt!, /change the gathered silhouette width at three heights/i);
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
