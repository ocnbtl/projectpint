import { createHash } from "node:crypto";
import {
  affiliatePilotV4Authorization,
  affiliatePilotV4IdentityViews,
  affiliatePilotV4Run06BudgetLanes,
  affiliatePilotV4Run06CameraRecipes,
  affiliatePilotV4Run06Contract,
  affiliatePilotV4Run06DecisionStatuses,
  affiliatePilotV4Run06EvidencePolicy,
  affiliatePilotV4Run06ExecutionPolicy,
  affiliatePilotV4Run06LightingRecipes,
  affiliatePilotV4Run06MaterialBehaviors,
  affiliatePilotV4Run06OccupancyStrategies,
  affiliatePilotV4Run06RoomArchetypes,
  affiliatePilotV4Run06StyleProfiles,
  affiliatePilotV4Run06VisualQaRubric,
  affiliatePilotV4Selections,
  type AffiliatePilotV4IdentityView,
  type AffiliatePilotV4ProductRole,
  type AffiliatePilotV4Run06DecisionStatus,
  type AffiliatePilotV4Selection
} from "../data/affiliate-pilot.v4.ts";
import type { AffiliateProduct } from "./affiliate-catalog.ts";
import { inspirationStyles } from "./redesign-data.ts";

export const AFFILIATE_PILOT_V4_VERSION = "affiliate-pilot-v4";
export const AFFILIATE_PILOT_V4_PROMPT_VERSION =
  affiliatePilotV4Run06Contract.contractVersion;
export const AFFILIATE_PILOT_V4_GENERATION_VERSION =
  affiliatePilotV4Run06Contract.generationVersion;
export const AFFILIATE_PILOT_V4_REQUESTED_MODEL = "gpt-image-2";
export const AFFILIATE_PILOT_V4_REQUESTED_QUALITY = "high";
export const AFFILIATE_PILOT_V4_TARGET = {
  width: 1024,
  height: 1536,
  aspect: "2:3"
} as const;

const IDENTITY_VIEW_DIRECTIONS: Record<AffiliatePilotV4IdentityView, string> = {
  presentation:
    "Use the most informative canonical three-quarter view supported by the exact-SKU evidence. Show the complete product with generous safe area.",
  front:
    "Use a true orthographic front elevation with a level camera perpendicular to the evidence-defined canonical front.",
  back:
    "Rotate the same physical product exactly 180 degrees from the canonical front. Do not mirror handed geometry or invent rear features.",
  left:
    "Rotate the same physical product to show its physical left side in a true orthographic elevation, not a three-quarter view.",
  right:
    "Rotate the same physical product to show its physical right side in a true orthographic elevation, not a three-quarter view.",
  top:
    "Use a true orthographic plan view directly above the same product and preserve the evidence-defined footprint and feature positions.",
  bottom:
    "Use a true orthographic underside view. Render only underside geometry supported by the dossier; unresolved geometry must remain blocked."
};

type ProductLike = Pick<
  AffiliateProduct,
  "id" | "asin" | "slug" | "name" | "brand"
>;

type DiversityPlan = {
  corpusSeed: string;
  roomArchetypeId: string;
  roomArchetype: string;
  cameraId: string;
  camera: string;
  lightingId: string;
  lighting: string;
  budgetId: string;
  budget: string;
  occupancyId: string;
  occupancy: string;
  materialId: string;
  material: string;
};

export type AffiliatePilotV4DossierReadiness = Readonly<
  Record<
    string,
    {
      status: "research_complete";
      privateReferenceCount: number;
      dossierSha256: string;
    }
  >
>;

export type AffiliatePilotV4IdentityJob = {
  id: string;
  productId: string;
  asin: string;
  kind: "identity";
  identityView: AffiliatePilotV4IdentityView;
  styleSlug: null;
  slot: 0;
  candidateOrdinal: 0;
  storageKey: string;
  sourceDossierKey: string;
  sourceEvidenceRoot: string;
  atlasStorageKey: string;
  promptVersion: string;
  generationVersion: string;
  prompt: string;
  promptSha256: string;
  postprocess: "chroma_to_transparent_png";
  chromaKeyHex: "#00ff00" | "#ff00ff";
  status: "blocked_source_evidence" | "queued";
  referenceInputCount: number;
  availablePrivateReferenceCount: number;
  sourceDossierSha256: string | null;
  referencePlan: string;
  requiresSourceDossier: true;
  requiresPromptCapture: true;
  requestedModel: typeof AFFILIATE_PILOT_V4_REQUESTED_MODEL;
  requestedQuality: typeof AFFILIATE_PILOT_V4_REQUESTED_QUALITY;
  reusedFromGenerationVersion: null;
  reusablePriorAssetAllowed: false;
  sceneId: null;
  qaFocus: string;
};

export type AffiliatePilotV4StyledJob = {
  id: string;
  productId: string;
  asin: string;
  kind: "styled";
  identityView: null;
  styleSlug: string;
  slot: number;
  candidateOrdinal: 1;
  sceneId: string;
  storageKey: string;
  ownerSelectedStorageKey: string;
  sourceDossierKey: string;
  atlasStorageKey: string;
  referencePackVersion: "pending_identity_generation";
  promptVersion: string;
  generationVersion: string;
  prompt: string;
  promptSha256: string;
  postprocess: "none";
  status: "blocked_identity_pack";
  decisionStatus: AffiliatePilotV4Run06DecisionStatus;
  referenceInputCount: 1;
  referencePlan: string;
  requiresCompleteReferencePack: true;
  requiresPromptCapture: true;
  requestedModel: typeof AFFILIATE_PILOT_V4_REQUESTED_MODEL;
  requestedQuality: typeof AFFILIATE_PILOT_V4_REQUESTED_QUALITY;
  qaFocus: string;
  diversityPlan: DiversityPlan;
  generationStrategy: "fresh_exact_product_room_candidate";
  providerAttemptBudget: 1;
  routineSupportReferenceGenerationCount: 0;
  roomPlateGenerationCount: 0;
  sameSceneCorrectionGenerationCount: 0;
  reusableProductCompositeAllowed: false;
  localPixelSurgeryAllowed: false;
  failedCandidateAction: "preserve_and_generate_materially_different_bathroom";
  ownerApprovalRequired: true;
  replacementForCandidateId: null;
};

export type AffiliatePilotV4Job =
  | AffiliatePilotV4IdentityJob
  | AffiliatePilotV4StyledJob;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableNumber(value: string): number {
  return Number.parseInt(sha256(value).slice(0, 8), 16);
}

function cleanSegment(value: string): string {
  const clean = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!clean) throw new Error(`Unable to create a storage segment from "${value}".`);
  return clean;
}

function productRoot(product: Pick<AffiliateProduct, "asin" | "slug">): string {
  return `affiliate-pilot/v4/${product.asin}/${cleanSegment(product.slug)}`;
}

function identityKey(
  product: Pick<AffiliateProduct, "asin" | "slug">,
  view: AffiliatePilotV4IdentityView
): string {
  return `${productRoot(product)}/identity/${view}-transparent.png`;
}

function atlasKey(product: Pick<AffiliateProduct, "asin" | "slug">): string {
  return `${productRoot(product)}/identity/reference-atlas.png`;
}

function dossierKey(asin: string): string {
  return `${affiliatePilotV4Run06EvidencePolicy.privateDossierRoot}/${asin}/dossier.json`;
}

function sourceEvidenceRoot(asin: string): string {
  return `${affiliatePilotV4Run06EvidencePolicy.sourceImageRoot}/${asin}`;
}

function candidateKey(
  product: Pick<AffiliateProduct, "asin" | "slug">,
  styleSlug: string,
  slot: number
): string {
  return `affiliate-pilot/v4/candidates/${product.asin}/${cleanSegment(product.slug)}/${styleSlug}/scene-${String(slot).padStart(2, "0")}-candidate-01.png`;
}

function ownerSelectedKey(
  product: Pick<AffiliateProduct, "asin" | "slug">,
  styleSlug: string,
  slot: number
): string {
  return `${productRoot(product)}/styles/${styleSlug}/scene-${String(slot).padStart(2, "0")}.png`;
}

function countableChecklist(selection: AffiliatePilotV4Selection): string {
  return selection.countableFeatures
    .map((feature, index) => `${index + 1}) ${feature}`)
    .join("; ");
}

function pickWithId<T extends readonly string[]>(
  values: T,
  base: number,
  slot: number,
  step: number,
  prefix: string
): { id: string; value: T[number] } {
  const index = (base + (slot - 1) * step) % values.length;
  return { id: `${prefix}-${String(index + 1).padStart(2, "0")}`, value: values[index] };
}

function diversityPlanFor(asin: string, styleSlug: string, slot: number): DiversityPlan {
  const seedText = `${AFFILIATE_PILOT_V4_GENERATION_VERSION}:${asin}:${styleSlug}:${slot}`;
  const base = stableNumber(`${asin}:${styleSlug}`);
  const room = pickWithId(affiliatePilotV4Run06RoomArchetypes, base, slot, 5, "room");
  const camera = pickWithId(affiliatePilotV4Run06CameraRecipes, base, slot, 3, "camera");
  const lighting = pickWithId(affiliatePilotV4Run06LightingRecipes, base, slot, 7, "light");
  const budget = pickWithId(affiliatePilotV4Run06BudgetLanes, base, slot, 1, "budget");
  const occupancy = pickWithId(
    affiliatePilotV4Run06OccupancyStrategies,
    base,
    slot,
    3,
    "occupancy"
  );
  const material = pickWithId(
    affiliatePilotV4Run06MaterialBehaviors,
    base,
    slot,
    7,
    "material"
  );
  return {
    corpusSeed: sha256(seedText).slice(0, 20),
    roomArchetypeId: room.id,
    roomArchetype: room.value,
    cameraId: camera.id,
    camera: camera.value,
    lightingId: lighting.id,
    lighting: lighting.value,
    budgetId: budget.id,
    budget: budget.value,
    occupancyId: occupancy.id,
    occupancy: occupancy.value,
    materialId: material.id,
    material: material.value
  };
}

function buildIdentityPrompt(
  product: ProductLike,
  selection: AffiliatePilotV4Selection,
  view: AffiliatePilotV4IdentityView
): string {
  const chromaKeyHex =
    selection.productRole === "hanging-live-plant" ? "#ff00ff" : "#00ff00";
  const chromaName = chromaKeyHex === "#ff00ff" ? "chroma magenta" : "chroma green";
  return [
    "Use case: product-mockup.",
    "Asset type: exact-product identity reference for a private affiliate-media pilot.",
    `Job: ${product.asin} ${view} identity view for ${product.name} by ${product.brand}.`,
    `Evidence gate: read the validated exact-SKU dossier at ${dossierKey(product.asin)} and use only its hashed private source images. Do not generate if the dossier is missing, incomplete, contradictory, or still marks identity-critical geometry unknown.`,
    `Exact product contract from the current catalog record: ${selection.identityPrompt}`,
    `Countable-feature audit: ${countableChecklist(selection)}.`,
    `Evidence-defined hidden geometry: ${selection.hiddenGeometryPolicy}`,
    `Requested view: ${IDENTITY_VIEW_DIRECTIONS[view]}`,
    "Cross-view invariant: all seven outputs depict one unchanged physical product in one coordinate system. Preserve dimensions, material, finish, pattern, topology, count, seams, handedness, mounting points, supports, and evidence-backed hidden geometry. Never substitute a sibling variation or infer a feature from a generated image.",
    "Composition: exactly one complete product centered in a 2:3 portrait frame with generous safe area. No crop, packaging, prop, hand, room, display stand, text overlay, or watermark.",
    `Background: perfectly flat ${chromaKeyHex} ${chromaName} with no gradient, horizon, floor plane, reflection, or cast shadow. Do not use ${chromaKeyHex} on the product.`,
    "Rendering: neutral broad light, truthful roughness and translucency, crisp edges, and nonperiodic material detail. Avoid luxury gloss, procedural texture, invented branding, and unsupported geometry.",
    `Output: one 1024x1536 portrait image. A separately verified local chroma-removal pass will create ${identityKey(product as AffiliateProduct, view)}.`
  ].join("\n");
}

function buildStyledPrompt(
  product: ProductLike,
  selection: AffiliatePilotV4Selection,
  style: (typeof inspirationStyles)[number],
  slot: number,
  diversity: DiversityPlan
): { prompt: string; qaFocus: string } {
  const profile =
    affiliatePilotV4Run06StyleProfiles[
      style.slug as keyof typeof affiliatePilotV4Run06StyleProfiles
    ];
  if (!profile) throw new Error(`Missing run-06 style profile for ${style.slug}.`);
  const sceneId = `v4-${product.asin}-${style.slug}-${String(slot).padStart(2, "0")}-candidate-01`;
  const qaFocus = [
    "exact product visible and identifiable",
    "bathroom is the subject and product is incidental",
    `recognizable ${style.name} expression through ${profile.recognizableThrough}`,
    "plausible iPhone capture and household construction",
    "nonperiodic materials, physically supported objects, coherent reflections",
    "materially distinct room, camera, lighting, budget, palette, and activity within the five-scene set"
  ].join("; ");
  return {
    prompt: [
      "Use case: photorealistic-natural.",
      "Asset type: first-pass owner-curation candidate for a private bathroom inspiration gallery.",
      `Scene identity: ${sceneId}; corpus diversity seed: ${diversity.corpusSeed}.`,
      "Primary request: create a believable iPhone photograph of a real, cared-for home bathroom that contains the exact featured product. The bathroom is the subject; the product is naturally incidental, off-center, visibly present, and identifiable at ordinary household scale.",
      `Featured exact product: ${product.name} by ${product.brand}, ASIN ${product.asin}.`,
      `Reference pack: use the complete reviewed seven-view atlas at ${atlasKey(product as AffiliateProduct)} together with the validated dossier at ${dossierKey(product.asin)}. These references define product identity only; do not copy their backdrop, pose, lighting, or atlas layout into the bathroom.`,
      `Product contract: ${selection.identityPrompt}`,
      `Countable-feature audit: ${countableChecklist(selection)}.`,
      `Support and placement: ${selection.placementInvariant}`,
      `Hidden geometry: ${selection.hiddenGeometryPolicy}`,
      `Style: ${style.name}. Make it recognizable through ${profile.recognizableThrough}. ${profile.avoidFormula}`,
      `Room archetype: ${diversity.roomArchetype}.`,
      `Budget lane: ${diversity.budget}.`,
      `Camera: ${diversity.camera}. Keep ordinary phone sharpening, realistic deep focus, mild noise, limited highlight recovery, and small framing imperfections; no fake portrait blur, perfect tripod symmetry, or impossible camera volume.`,
      `Lighting: ${diversity.lighting}. Product and room must share exposure, white balance, color spill, shadow softness, reflections, focus, noise, and highlight rolloff.`,
      `Occupancy direction: ${diversity.occupancy}. Invent a scene-specific, sparse, coherent set of one to three ordinary human-use clues; do not repeat a fixed soap/brush/slippers/towel/toilet kit, coordinate a decor vignette, add a competing product silhouette, or use readable labels and pseudo-text.`,
      `Material focus: ${diversity.material}. All fabric, stone, aggregate, tile, grout, wood, paint, glass, metal, towels, and wear must be stochastic and nonperiodic at room scale. Repeated fractals, cloned folds, tiled veins, and blanket gloss are hard failures.`,
      "Physical gate: every mass has support and gravity; doors and drawers have clearance; plumbing and wet-zone construction connect coherently; electrical devices are omitted unless complete and plausible; reflections agree with the room and camera; no collision, floating object, duplicate fixture, or broken topology.",
      "Realism range: make the room maintained and credible at its assigned budget. Ordinary age and repair are welcome, but do not make it dirty, trashed, damaged, abandoned, or decrepit. Do not produce a showroom, advertisement, synthetic interior render, real-estate listing, or centered product hero.",
      "Fresh-candidate rule: generate a new physical bathroom and composition from scratch. Do not edit, repair, imitate, or reuse any prior room, candidate, product composite, room plate, generated support image, prop arrangement, texture map, or fold silhouette.",
      "Decision semantics: this output is not owner-approved or publishable. It will be saved as generated evidence, screened for hard failures, and if it passes will remain owner-pending.",
      `Final audit: ${qaFocus}.`,
      "Constraints: exactly one canonical featured product; no people or hands; no packaging; no alternate variation; no invented product claim; no text overlay; no watermark.",
      "Output: one image exactly 1024x1536 pixels in a 2:3 portrait frame."
    ].join("\n"),
    qaFocus
  };
}

function assertApproved(product: AffiliateProduct, asin: string): void {
  if (
    product.approvalStatus !== "approved" &&
    product.approvalStatus !== "approved_with_caveat"
  ) {
    throw new Error(`Pilot v4 product ASIN ${asin} is not approved.`);
  }
}

function assertManifest(jobs: AffiliatePilotV4Job[], productCount: number): void {
  const identity = jobs.filter((job) => job.kind === "identity");
  const styled = jobs.filter((job) => job.kind === "styled");
  if (productCount !== 10 || inspirationStyles.length !== 12) {
    throw new Error("Pilot v4 run 06 requires exactly ten products and twelve styles.");
  }
  if (jobs.length !== 670 || identity.length !== 70 || styled.length !== 600) {
    throw new Error(
      `Pilot v4 run 06 expected 670 jobs (70 identity and 600 styled), received ${jobs.length} (${identity.length} identity and ${styled.length} styled).`
    );
  }
  for (const [label, values] of [
    ["job IDs", jobs.map((job) => job.id)],
    ["storage keys", jobs.map((job) => job.storageKey)],
    ["prompt hashes", jobs.map((job) => job.promptSha256)]
  ] as const) {
    if (new Set(values).size !== values.length) {
      throw new Error(`Pilot v4 run 06 ${label} must be unique.`);
    }
  }
  if (identity.some((job) => job.reusedFromGenerationVersion !== null || job.reusablePriorAssetAllowed)) {
    throw new Error("Every run-06 identity job must use fresh source evidence with zero reuse.");
  }
  if (
    identity.some(
      (job) =>
        (job.status === "blocked_source_evidence" &&
          (job.referenceInputCount !== 0 || job.sourceDossierSha256 !== null)) ||
        (job.status === "queued" &&
          (job.referenceInputCount < 1 ||
            !/^[a-f0-9]{64}$/.test(job.sourceDossierSha256 ?? "")))
    )
  ) {
    throw new Error("Run-06 identity readiness must agree with validated dossier references and hashes.");
  }
  if (
    styled.some(
      (job) =>
        job.providerAttemptBudget !== 1 ||
        job.routineSupportReferenceGenerationCount !== 0 ||
        job.roomPlateGenerationCount !== 0 ||
        job.sameSceneCorrectionGenerationCount !== 0 ||
        job.reusableProductCompositeAllowed ||
        job.localPixelSurgeryAllowed ||
        !job.ownerApprovalRequired
    )
  ) {
    throw new Error("Run-06 styled jobs must use the one-call candidate model with owner-final decisions.");
  }
  const sets = new Map<string, AffiliatePilotV4StyledJob[]>();
  for (const job of styled) {
    const key = `${job.asin}:${job.styleSlug}`;
    sets.set(key, [...(sets.get(key) ?? []), job]);
  }
  if (sets.size !== 120 || [...sets.values()].some((set) => set.length !== 5)) {
    throw new Error("Run 06 requires 120 five-candidate product/style sets.");
  }
  for (const set of sets.values()) {
    for (const key of [
      "roomArchetypeId",
      "cameraId",
      "lightingId",
      "budgetId",
      "occupancyId",
      "materialId"
    ] as const) {
      if (new Set(set.map((job) => job.diversityPlan[key])).size !== set.length) {
        throw new Error(`Every five-candidate set requires five distinct ${key} values.`);
      }
    }
  }
}

export function buildAffiliatePilotV4Manifest(
  products: AffiliateProduct[],
  dossierReadiness: AffiliatePilotV4DossierReadiness = {}
) {
  const productByAsin = new Map(products.map((product) => [product.asin, product]));
  if (
    Object.keys(affiliatePilotV4Run06StyleProfiles).length !==
    inspirationStyles.length
  ) {
    throw new Error("Pilot v4 run 06 requires one active profile per Inspiration style.");
  }

  const jobs: AffiliatePilotV4Job[] = [];
  const productsManifest = affiliatePilotV4Selections.map((selection) => {
    const product = productByAsin.get(selection.asin);
    if (!product) throw new Error(`Pilot v4 product ASIN ${selection.asin} is missing.`);
    assertApproved(product, selection.asin);

    const productAtlasKey = atlasKey(product);
    const productDossierKey = dossierKey(product.asin);
    const productSourceRoot = sourceEvidenceRoot(product.asin);
    const dossier = dossierReadiness[product.asin];
    const sourceReady = dossier?.status === "research_complete";
    const chromaKeyHex =
      selection.productRole === "hanging-live-plant" ? "#ff00ff" : "#00ff00";
    for (const identityView of affiliatePilotV4IdentityViews) {
      const prompt = buildIdentityPrompt(product, selection, identityView);
      jobs.push({
        id: `${product.id}:identity:${identityView}`,
        productId: product.id,
        asin: product.asin,
        kind: "identity",
        identityView,
        styleSlug: null,
        slot: 0,
        candidateOrdinal: 0,
        storageKey: identityKey(product, identityView),
        sourceDossierKey: productDossierKey,
        sourceEvidenceRoot: productSourceRoot,
        atlasStorageKey: productAtlasKey,
        promptVersion: AFFILIATE_PILOT_V4_PROMPT_VERSION,
        generationVersion: AFFILIATE_PILOT_V4_GENERATION_VERSION,
        prompt,
        promptSha256: sha256(prompt),
        postprocess: "chroma_to_transparent_png",
        chromaKeyHex,
        status: sourceReady ? "queued" : "blocked_source_evidence",
        referenceInputCount: sourceReady ? Math.min(5, dossier.privateReferenceCount) : 0,
        availablePrivateReferenceCount: sourceReady ? dossier.privateReferenceCount : 0,
        sourceDossierSha256: sourceReady ? dossier.dossierSha256 : null,
        referencePlan: sourceReady
          ? "Use only the claim-linked, hash-verified private image paths enumerated by the validated exact-SKU dossier."
          : "Resolve exact input image paths from the validated private dossier; do not generate while any identity-critical field is unknown or contradictory.",
        requiresSourceDossier: true,
        requiresPromptCapture: true,
        requestedModel: AFFILIATE_PILOT_V4_REQUESTED_MODEL,
        requestedQuality: AFFILIATE_PILOT_V4_REQUESTED_QUALITY,
        reusedFromGenerationVersion: null,
        reusablePriorAssetAllowed: false,
        sceneId: null,
        qaFocus: `Full-size ${identityView} audit against claim-linked exact-SKU evidence; ${countableChecklist(selection)}; cross-view dimensions, finish, topology, handedness, support, hidden geometry, unique hash, and transparent-edge readiness.`
      });
    }

    for (const style of inspirationStyles) {
      for (let slot = 1; slot <= 5; slot += 1) {
        const diversityPlan = diversityPlanFor(product.asin, style.slug, slot);
        const { prompt, qaFocus } = buildStyledPrompt(
          product,
          selection,
          style,
          slot,
          diversityPlan
        );
        jobs.push({
          id: `${product.id}:${style.slug}:${slot}:candidate:1`,
          productId: product.id,
          asin: product.asin,
          kind: "styled",
          identityView: null,
          styleSlug: style.slug,
          slot,
          candidateOrdinal: 1,
          sceneId: `v4-${product.asin}-${style.slug}-${String(slot).padStart(2, "0")}-candidate-01`,
          storageKey: candidateKey(product, style.slug, slot),
          ownerSelectedStorageKey: ownerSelectedKey(product, style.slug, slot),
          sourceDossierKey: productDossierKey,
          atlasStorageKey: productAtlasKey,
          referencePackVersion: "pending_identity_generation",
          promptVersion: AFFILIATE_PILOT_V4_PROMPT_VERSION,
          generationVersion: AFFILIATE_PILOT_V4_GENERATION_VERSION,
          prompt,
          promptSha256: sha256(prompt),
          postprocess: "none",
          status: "blocked_identity_pack",
          decisionStatus: "blocked_identity_pack",
          referenceInputCount: 1,
          referencePlan:
            "Use the complete reviewed seven-view atlas as the reusable image reference and the validated dossier as the textual identity authority for every fresh bathroom call.",
          requiresCompleteReferencePack: true,
          requiresPromptCapture: true,
          requestedModel: AFFILIATE_PILOT_V4_REQUESTED_MODEL,
          requestedQuality: AFFILIATE_PILOT_V4_REQUESTED_QUALITY,
          qaFocus,
          diversityPlan,
          generationStrategy: "fresh_exact_product_room_candidate",
          providerAttemptBudget: 1,
          routineSupportReferenceGenerationCount: 0,
          roomPlateGenerationCount: 0,
          sameSceneCorrectionGenerationCount: 0,
          reusableProductCompositeAllowed: false,
          localPixelSurgeryAllowed: false,
          failedCandidateAction: "preserve_and_generate_materially_different_bathroom",
          ownerApprovalRequired: true,
          replacementForCandidateId: null
        });
      }
    }

    return {
      ...selection,
      privateReferenceCount: sourceReady
        ? dossier.privateReferenceCount
        : selection.privateReferenceCount,
      productId: product.id,
      slug: product.slug,
      productName: product.name,
      brand: product.brand,
      category: product.category,
      approvalStatus: product.approvalStatus,
      sourceResearchStatus: sourceReady ? ("research_complete" as const) : ("required_not_started" as const),
      researchStartingPoints: [...selection.referenceSourceUrls],
      sourceDossierKey: productDossierKey,
      sourceEvidenceRoot: productSourceRoot,
      referencePackStatus: sourceReady ? ("identity_generation_queued" as const) : ("blocked_source_evidence" as const),
      identityCount: affiliatePilotV4IdentityViews.length,
      styledCount: inspirationStyles.length * 5,
      jobCount: affiliatePilotV4IdentityViews.length + inspirationStyles.length * 5,
      atlasStorageKey: productAtlasKey
    };
  });

  assertManifest(jobs, productsManifest.length);
  const identityJobs = jobs.filter((job) => job.kind === "identity");
  const styledJobs = jobs.filter((job) => job.kind === "styled");
  return {
    pilotVersion: AFFILIATE_PILOT_V4_VERSION,
    manifestVersion: 6,
    promptVersion: AFFILIATE_PILOT_V4_PROMPT_VERSION,
    generationVersion: AFFILIATE_PILOT_V4_GENERATION_VERSION,
    status:
      productsManifest.every((product) => product.sourceResearchStatus === "research_complete")
        ? ("identity_generation_queued" as const)
        : ("blocked_source_evidence" as const),
    requestedModel: AFFILIATE_PILOT_V4_REQUESTED_MODEL,
    requestedQuality: AFFILIATE_PILOT_V4_REQUESTED_QUALITY,
    providerModelObserved: null,
    providerQualityObserved: null,
    providerMetadataNote:
      "The built-in image-generation surface does not expose selected model, quality, request IDs, or billing. Requested values are workflow intent; provider values remain unobserved.",
    ...affiliatePilotV4Authorization,
    regenerateAllPilotAssets: true,
    regenerateAllStyledAssets: true,
    reuseReviewedIdentityAssets: false,
    ownerSelectionRequired: true,
    assistantAcceptanceIsFinal: false,
    contract: affiliatePilotV4Run06Contract,
    evidencePolicy: affiliatePilotV4Run06EvidencePolicy,
    executionPolicy: affiliatePilotV4Run06ExecutionPolicy,
    decisionStatuses: affiliatePilotV4Run06DecisionStatuses,
    visualQaRubric: affiliatePilotV4Run06VisualQaRubric,
    executionLogRequired: true,
    exactPromptCaptureRequired: true,
    perAssetVisualReviewRequired: true,
    failedAssetsMustBeRetried: false,
    failedCandidatesMustBeReplaced: true,
    productCount: productsManifest.length,
    sourceResearchCompletedCount: productsManifest.filter(
      (product) => product.sourceResearchStatus === "research_complete"
    ).length,
    identityProviderReferenceInputLimitObserved: 5,
    styleCount: inspirationStyles.length,
    styleViewsPerProduct: inspirationStyles.length * 5,
    identityViewsPerProduct: affiliatePilotV4IdentityViews.length,
    presentationCount: identityJobs.filter(
      (job) => job.identityView === "presentation"
    ).length,
    orthographicCount: identityJobs.filter(
      (job) => job.identityView !== "presentation"
    ).length,
    identityCount: identityJobs.length,
    reusedIdentityCount: 0,
    styledCount: styledJobs.length,
    reusedStyledCount: 0,
    identityGenerationRequestedCount: identityJobs.length,
    styledFirstPassGenerationRequestedCount: styledJobs.length,
    supportReferenceGenerationRequestedCount: 0,
    roomPlateGenerationRequestedCount: 0,
    sameSceneCorrectionEligibleCount: 0,
    totalProviderGenerationRequestFloor: identityJobs.length + styledJobs.length,
    totalCount: jobs.length,
    target: AFFILIATE_PILOT_V4_TARGET,
    products: productsManifest,
    jobs
  };
}

export function buildAffiliatePilotV4ExecutionLog(
  supersededEvidence =
    "output/affiliate-pilot/v4/superseded/pilot-2026-07-31-run-05-owner-superseded",
  createdAt = new Date().toISOString()
) {
  return {
    schemaVersion: "affiliate-pilot-execution-log-v4.2",
    pilotVersion: AFFILIATE_PILOT_V4_VERSION,
    createdAt,
    updatedAt: createdAt,
    promptVersion: AFFILIATE_PILOT_V4_PROMPT_VERSION,
    generationVersion: AFFILIATE_PILOT_V4_GENERATION_VERSION,
    status: "blocked_source_evidence",
    generationSurface: "built-in image-generation tool, one call at a time",
    requestedModel: AFFILIATE_PILOT_V4_REQUESTED_MODEL,
    requestedQuality: AFFILIATE_PILOT_V4_REQUESTED_QUALITY,
    providerModelObserved: null,
    providerQualityObserved: null,
    providerRequestIdsObserved: [],
    billingObserved: null,
    decisionStatuses: affiliatePilotV4Run06DecisionStatuses,
    identityGeneration: {
      expected: 70,
      generated: 0,
      assistantPassed: 0,
      ownerAccepted: 0,
      calls: []
    },
    styledGeneration: {
      expected: 600,
      generated: 0,
      assistantHardRejected: 0,
      assistantPassedOwnerPending: 0,
      ownerAccepted: 0,
      ownerDeclined: 0,
      replacementNeeded: 0,
      calls: [],
      setReviews: []
    },
    ownerReset: {
      occurredAt: createdAt,
      supersededEvidence,
      priorGenerationVersion:
        affiliatePilotV4Run06Contract.supersedesGenerationVersion,
      priorIdentityReused: 70,
      nextIdentityReused: 0,
      priorStyledAccepted: 23,
      nextStyledReused: 0,
      pendingCandidateDisposition: "superseded_unreviewed"
    },
    events: [
      {
        type: "owner_full_restart_recorded",
        occurredAt: createdAt,
        status: "superseded_evidence",
        decision:
          "Preserve run 05 without accepting its pending image; require fresh exact-SKU dossiers, 70 new identity views, and 600 new owner-pending candidates."
      }
    ]
  } as const;
}
