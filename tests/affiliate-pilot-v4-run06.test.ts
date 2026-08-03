import assert from "node:assert/strict";
import test from "node:test";
import { affiliatePilotV4Selections } from "../data/affiliate-pilot.v4.ts";
import { affiliateApprovedCohortFixture } from "../lib/affiliate-catalog.ts";
import {
  AFFILIATE_PILOT_V4_DOSSIER_SCHEMA_VERSION,
  affiliatePilotV4DossierClaimSections,
  validateAffiliatePilotV4Dossier
} from "../lib/affiliate-pilot-v4-dossiers.ts";
import {
  AFFILIATE_PILOT_V4_GENERATION_VERSION,
  AFFILIATE_PILOT_V4_PROMPT_VERSION,
  buildAffiliatePilotV4ExecutionLog,
  buildAffiliatePilotV4Manifest
} from "../lib/affiliate-pilot-v4.ts";

test("run 06 rebuilds every reference and creates an owner-curation candidate pool", () => {
  const manifest = buildAffiliatePilotV4Manifest(
    affiliateApprovedCohortFixture()
  );
  const identity = manifest.jobs.filter((job) => job.kind === "identity");
  const styled = manifest.jobs.filter((job) => job.kind === "styled");

  assert.equal(
    AFFILIATE_PILOT_V4_PROMPT_VERSION,
    "affiliate-pilot-lived-in-iphone-realism-v4.71"
  );
  assert.equal(AFFILIATE_PILOT_V4_GENERATION_VERSION, "pilot-2026-08-01-run-06");
  const bambusi = affiliatePilotV4Selections.find((selection) => selection.asin === "B0DC7VG6Z9");
  assert.ok(bambusi);
  assert.ok(bambusi.identityPrompt.includes("exactly nine INTERIOR front-to-back bamboo slat boards"));
  assert.ok(bambusi.identityPrompt.includes("left and right identity views face the narrow 9-inch-deep ends"));
  assert.ok(bambusi.hiddenGeometryPolicy.includes("Show exactly four leg ends with exactly four pads"));
  assert.ok(bambusi.hiddenGeometryPolicy.includes("exactly nine slats with eight gaps"));
  assert.ok(bambusi.hiddenGeometryPolicy.includes("legs foreshorten into their pads"));
  assert.ok(bambusi.countableFeatures.includes("exactly eight top gaps"));
  assert.ok(!bambusi.countableFeatures.includes("exactly seven top gaps"));
  assert.ok(bambusi.placementInvariant.includes("nine-interior-slat identity"));
  assert.equal(manifest.status, "blocked_source_evidence");
  assert.equal(manifest.referenceRightsConfirmed, true);
  assert.equal(manifest.generationAuthorized, true);
  assert.equal(manifest.fullScaleAuthorized, false);
  assert.equal(manifest.regenerateAllPilotAssets, true);
  assert.equal(manifest.regenerateAllStyledAssets, true);
  assert.equal(manifest.reuseReviewedIdentityAssets, false);
  assert.equal(manifest.reusedIdentityCount, 0);
  assert.equal(manifest.reusedStyledCount, 0);
  assert.equal(manifest.ownerSelectionRequired, true);
  assert.equal(manifest.assistantAcceptanceIsFinal, false);
  assert.equal(manifest.failedAssetsMustBeRetried, false);
  assert.equal(manifest.failedCandidatesMustBeReplaced, true);

  assert.equal(manifest.productCount, 10);
  assert.equal(manifest.sourceResearchCompletedCount, 0);
  assert.equal(manifest.styleCount, 12);
  assert.equal(manifest.totalCount, 670);
  assert.equal(identity.length, 70);
  assert.equal(styled.length, 600);
  assert.equal(manifest.identityGenerationRequestedCount, 70);
  assert.equal(manifest.styledFirstPassGenerationRequestedCount, 600);
  assert.equal(manifest.supportReferenceGenerationRequestedCount, 0);
  assert.equal(manifest.roomPlateGenerationRequestedCount, 0);
  assert.equal(manifest.sameSceneCorrectionEligibleCount, 0);
  assert.equal(manifest.totalProviderGenerationRequestFloor, 670);
  assert.equal(manifest.identityProviderReferenceInputLimitObserved, 5);

  assert.equal(new Set(manifest.jobs.map((job) => job.id)).size, 670);
  assert.equal(new Set(manifest.jobs.map((job) => job.storageKey)).size, 670);
  assert.equal(new Set(manifest.jobs.map((job) => job.promptSha256)).size, 670);
  assert.ok(
    manifest.jobs.every(
      (job) =>
        job.promptVersion === AFFILIATE_PILOT_V4_PROMPT_VERSION &&
        job.generationVersion === AFFILIATE_PILOT_V4_GENERATION_VERSION
    )
  );

  assert.ok(
    identity.every(
      (job) =>
        job.status === "blocked_source_evidence" &&
        job.referenceInputCount === 0 &&
        job.sourceDossierSha256 === null &&
        job.requiresSourceDossier &&
        job.requiresPromptCapture &&
        job.reusedFromGenerationVersion === null &&
        job.reusablePriorAssetAllowed === false &&
        job.sourceDossierKey.endsWith(`/${job.asin}/dossier.json`) &&
        job.sourceEvidenceRoot.endsWith(`/${job.asin}`) &&
        job.prompt.includes("Do not generate if the dossier is missing") &&
        job.prompt.includes("Never substitute a sibling variation")
    )
  );
  assert.equal(
    new Set(identity.map((job) => `${job.asin}:${job.identityView}`)).size,
    70
  );
  assert.ok(
    identity.every((job) =>
      job.asin === "B0F3L72TC3"
        ? job.chromaKeyHex === "#ff00ff" && job.prompt.includes("#ff00ff chroma magenta")
        : job.chromaKeyHex === "#00ff00" && job.prompt.includes("#00ff00 chroma green")
    )
  );

  assert.ok(
    styled.every(
      (job) =>
        job.status === "blocked_identity_pack" &&
        job.decisionStatus === "blocked_identity_pack" &&
        job.referenceInputCount === 1 &&
        job.requiresCompleteReferencePack &&
        job.referencePackVersion === "pending_identity_generation" &&
        job.providerAttemptBudget === 1 &&
        job.routineSupportReferenceGenerationCount === 0 &&
        job.roomPlateGenerationCount === 0 &&
        job.sameSceneCorrectionGenerationCount === 0 &&
        job.reusableProductCompositeAllowed === false &&
        job.localPixelSurgeryAllowed === false &&
        job.failedCandidateAction ===
          "preserve_and_generate_materially_different_bathroom" &&
        job.ownerApprovalRequired &&
        job.replacementForCandidateId === null &&
        job.storageKey.includes("affiliate-pilot/v4/candidates/") &&
        job.ownerSelectedStorageKey.includes("/styles/") &&
        job.prompt.includes("raw homeowner iPhone camera-roll photograph") &&
        job.prompt.includes("real person's camera roll") &&
        job.prompt.includes("Camera-roll test") &&
        job.prompt.includes("Concrete scene direction") &&
        job.prompt.includes("Room history and budget") &&
        job.prompt.includes("Camera authenticity") &&
        job.prompt.includes("default iPhone HEIC/JPEG look") &&
        job.prompt.includes("Everyday evidence") &&
        job.prompt.includes("Surface forensic realism") &&
        job.prompt.includes("fine roller or brush stipple") &&
        job.prompt.includes("growth rings and color change between pieces") &&
        job.prompt.includes("Product placement and scale") &&
        job.prompt.includes("Fresh-candidate rule") &&
        job.prompt.includes("not owner-approved or publishable") &&
        job.prompt.includes("no RAW processing") &&
        job.prompt.includes("Never use fractal grain") &&
        job.prompt.includes("not pristine, empty, luxury-perfect") &&
        !job.prompt.includes("first-pass owner-curation candidate for a private bathroom inspiration gallery") &&
        !job.prompt.includes("Human trace cap") &&
        !job.prompt.includes("real, attractive, owner-occupied bathroom") &&
        !job.prompt.includes("Invent a scene-specific") &&
        !job.prompt.includes("one to three ordinary human-use clues")
    )
  );
  assert.equal(new Set(styled.map((job) => job.diversityPlan.corpusSeed)).size, 600);

  const sets = new Map<string, typeof styled>();
  for (const job of styled) {
    const key = `${job.asin}:${job.styleSlug}`;
    sets.set(key, [...(sets.get(key) ?? []), job]);
  }
  assert.equal(sets.size, 120);
  for (const jobs of sets.values()) {
    assert.equal(jobs.length, 5);
    for (const key of [
      "themeDirectionId",
      "roomArchetypeId",
      "cameraId",
      "lightingId",
      "budgetId",
      "occupancyId",
      "materialId"
    ] as const) {
      assert.equal(new Set(jobs.map((job) => job.diversityPlan[key])).size, 5);
    }
    assert.ok(
      jobs.every(
        (job) =>
          job.diversityPlan.themeDirection.length > 40 &&
          job.prompt.includes(job.diversityPlan.themeDirection)
      )
    );
  }

  assert.deepEqual(manifest.decisionStatuses, [
    "blocked_source_evidence",
    "blocked_identity_pack",
    "queued",
    "generated",
    "assistant_hard_reject",
    "assistant_pass_owner_pending",
    "owner_accepted",
    "owner_declined",
    "replacement_needed",
    "superseded_evidence",
    "unknown_not_reviewed"
  ]);
  assert.equal(manifest.executionPolicy.routineSupportReferenceCalls, 0);
  assert.equal(manifest.executionPolicy.routineRoomPlateCalls, 0);
  assert.equal(manifest.executionPolicy.sameSceneCorrectionCalls, 0);
  assert.equal(manifest.executionPolicy.repeatedSameCauseLimit, 2);
  assert.equal(
    manifest.executionPolicy.thirdSameCauseCandidateRequiresRootRevision,
    true
  );
  assert.equal(manifest.visualQaRubric.ownerApprovalRequired, true);
  assert.ok(
    manifest.products.every(
      (product) =>
        product.sourceResearchStatus === "required_not_started" &&
        product.referencePackStatus === "blocked_source_evidence" &&
        product.researchStartingPoints.length > 0
    )
  );
});

test("validated dossier readiness queues all 70 fresh identity views without unblocking styled jobs", () => {
  const dossierHash = "a".repeat(64);
  const readiness = Object.fromEntries(
    affiliatePilotV4Selections.map((selection, index) => [
      selection.asin,
      {
        status: "research_complete" as const,
        privateReferenceCount: index + 1,
        dossierSha256: dossierHash
      }
    ])
  );
  const manifest = buildAffiliatePilotV4Manifest(
    affiliateApprovedCohortFixture(),
    readiness
  );
  const identity = manifest.jobs.filter((job) => job.kind === "identity");
  const styled = manifest.jobs.filter((job) => job.kind === "styled");

  assert.equal(manifest.status, "identity_generation_queued");
  assert.equal(manifest.sourceResearchCompletedCount, 10);
  assert.ok(
    manifest.products.every(
      (product) =>
        product.sourceResearchStatus === "research_complete" &&
        product.referencePackStatus === "identity_generation_queued"
    )
  );
  assert.ok(
    identity.every(
      (job) =>
        job.status === "queued" &&
        job.referenceInputCount > 0 &&
        job.referenceInputCount <= 5 &&
        job.availablePrivateReferenceCount >= job.referenceInputCount &&
        job.sourceDossierSha256 === dossierHash
    )
  );
  assert.ok(styled.every((job) => job.status === "blocked_identity_pack"));
});

test("product dossiers require claim links, hashes, conservative unknowns, and no blockers", () => {
  const hash = "b".repeat(64);
  const source = {
    id: "manufacturer",
    title: "Exact product",
    url: "https://example.com/product",
    publisher: "example.com",
    accessedAt: "2026-08-01T12:00:00.000Z",
    sourceType: "manufacturer",
    exactSkuMatch: true,
    claims: ["exact identity"],
    snapshotPath: "private/source.md",
    snapshotSha256: hash
  };
  const block = {
    claims: ["evidence-backed fact"],
    sourceIds: [source.id],
    confidence: "confirmed" as const
  };
  const dossier = {
    schemaVersion: AFFILIATE_PILOT_V4_DOSSIER_SCHEMA_VERSION,
    asin: "B0829N8C9G",
    researchedAt: "2026-08-01T12:00:00.000Z",
    ...Object.fromEntries(
      affiliatePilotV4DossierClaimSections.map((section) => [section, block])
    ),
    explicitUnknowns: [
      {
        field: "concealed screw pattern",
        handling: "Keep concealed and do not invent a count.",
        identityCritical: false
      }
    ],
    contradictions: [],
    sources: [source],
    privateReferences: [
      {
        path: "private/product.jpg",
        sha256: hash,
        sourceId: source.id,
        role: "canonical_product"
      }
    ],
    readiness: { status: "research_complete", blockers: [] as string[] }
  };
  assert.deepEqual(validateAffiliatePilotV4Dossier(dossier, dossier.asin), {
    valid: true,
    errors: []
  });

  const invalid = structuredClone(dossier);
  invalid.explicitUnknowns[0].identityCritical = true;
  invalid.readiness.blockers.push("unresolved bottom geometry");
  const result = validateAffiliatePilotV4Dossier(invalid, dossier.asin);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("Identity-critical unknown")));
  assert.ok(result.errors.some((error) => error.includes("cannot contain blockers")));
});

test("run 06 execution log keeps assistant and owner decisions separate", () => {
  const createdAt = "2026-08-01T05:47:51.947Z";
  const ledger = buildAffiliatePilotV4ExecutionLog(
    "output/affiliate-pilot/v4/superseded/run-05",
    createdAt
  );

  assert.equal(ledger.status, "blocked_source_evidence");
  assert.equal(ledger.createdAt, createdAt);
  assert.equal(ledger.identityGeneration.expected, 70);
  assert.equal(ledger.identityGeneration.generated, 0);
  assert.equal(ledger.styledGeneration.expected, 600);
  assert.equal(ledger.styledGeneration.generated, 0);
  assert.equal(ledger.styledGeneration.assistantPassedOwnerPending, 0);
  assert.equal(ledger.styledGeneration.ownerAccepted, 0);
  assert.equal(ledger.styledGeneration.ownerDeclined, 0);
  assert.equal(ledger.ownerReset.nextIdentityReused, 0);
  assert.equal(ledger.ownerReset.nextStyledReused, 0);
  assert.equal(ledger.ownerReset.pendingCandidateDisposition, "superseded_unreviewed");
  assert.equal(ledger.events[0].type, "owner_full_restart_recorded");
  assert.ok(ledger.decisionStatuses.includes("assistant_pass_owner_pending"));
  assert.ok(ledger.decisionStatuses.includes("owner_accepted"));
});
