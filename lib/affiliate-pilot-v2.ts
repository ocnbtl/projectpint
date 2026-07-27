import { createHash } from "node:crypto";
import {
  affiliatePilotV2Authorization,
  affiliatePilotV2Scenes,
  type AffiliatePilotV2Scene
} from "../data/affiliate-pilot.v2.ts";
import {
  affiliatePilotV1Selections
} from "../data/affiliate-pilot.v1.ts";
import type { AffiliateProduct } from "./affiliate-catalog.ts";
import { buildAffiliateMediaJobs, type AffiliateMediaJob } from "./affiliate-media.ts";
import { inspirationStyles } from "./redesign-data.ts";

export const AFFILIATE_PILOT_V2_VERSION = "affiliate-pilot-v2";
export const AFFILIATE_PILOT_V2_PROMPT_VERSION = "affiliate-pilot-natural-photo-v2";
export const AFFILIATE_PILOT_V2_GENERATION_VERSION = "pilot-2026-07-26-run-02";
export const AFFILIATE_PILOT_V2_REQUESTED_MODEL = "gpt-image-2";
export const AFFILIATE_PILOT_V2_REQUESTED_QUALITY = "high";

const NATURAL_PHOTO_CONTRACT = [
  "Use case: photorealistic-natural.",
  "Asset type: Project Pint affiliate product detail gallery photograph.",
  "Primary request: make a genuinely plausible bathroom photograph that an ordinary homeowner or interior-design editor could have captured on a recent smartphone main camera, not a product advertisement and not a synthetic interior render.",
  "Capture character: handheld single exposure, realistic smartphone dynamic range, modest computational sharpening, subtle fine sensor noise in shadows, slight lens distortion or perspective convergence where appropriate, minor everyday asymmetry, and natural depth of field.",
  "Scene realism: this must be a different physical bathroom from every other image in the same five-image set, not the same room with small rearrangements. The space should feel occupied and functional, with plausible everyday bathroom items and slight fabric or placement imperfections.",
  "Exposure invariant: expose the product and room together under the same ambient light. The product must not be independently brightened, relit, glowing, haloed, cut out, pasted in, or cleaner and sharper than its surroundings. Match contact shadows, reflected color, contrast, white balance, and specular highlights to the exact scene.",
  "Composition invariant: vary camera position, viewpoint, framing distance, and product orientation meaningfully. The product remains identifiable and at believable scale, but it need not be centered, face the same direction, or dominate every frame.",
  "Avoid: studio key or rim light, showroom emptiness, luxury real-estate staging, perfect bilateral symmetry, flawless magazine styling, HDR-expanded shadows, clipped product highlights, cinematic teal-orange grading, fake portrait-mode blur, excessive bokeh, CGI smoothness, repeated architecture, or five near-duplicate compositions."
].join(" ");

type AffiliatePilotV2Selection = (typeof affiliatePilotV1Selections)[number];

const POSE_GUIDE_BY_JOB_KEY = new Map<string, string>([
  ["B0829N8C9G:minimalist-elegance:2", "left-profile"],
  ["B0829N8C9G:minimalist-elegance:3", "rear-three-quarter"],
  ["B0829N8C9G:modern-marble:2", "left-profile"],
  ["B0829N8C9G:modern-marble:3", "rear-three-quarter"]
]);

const QA_CORRECTION_BY_JOB_KEY = new Map<string, string>([
  [
    "B0D2KK6MNS:boho-earth-tones:5",
    "Targeted correction after QA rejection: The product reference image shows a freestanding oval/curved display rail, but that rail is NOT part of the product and MUST NOT appear. Install the curtain on exactly one ordinary straight horizontal wall-to-wall shower rod with two visible wall mounts. No curve, return, oval, loop, ceiling track, or freestanding rail. Preserve the specified tub-interior reverse-side camera viewpoint and all curtain identity invariants."
  ],
  [
    "B0829N8C9G:minimalist-elegance:2",
    "Targeted QA correction: the prior attempt placed a readable dental-floss brand logo on a background prop. Every secondary toiletry, dental item, container, and package in this replacement must be plain and unbranded with no readable words, logos, symbols, labels, or pseudo-text. Preserve the reviewed side-profile dispenser orientation, natural room-matched exposure, ordinary smartphone character, and lived-in bathroom context."
  ]
]);

export interface AffiliatePilotV2Job extends Omit<AffiliateMediaJob, "status"> {
  status: "queued" | "reused_owner_approved";
  referenceInputCount: 0 | 2 | 3;
  requiresPromptCapture: boolean;
  requestedModel: typeof AFFILIATE_PILOT_V2_REQUESTED_MODEL;
  requestedQuality: typeof AFFILIATE_PILOT_V2_REQUESTED_QUALITY;
  promptSha256: string;
  sceneId: string | null;
  reusedFromStorageKey: string | null;
  poseGuideId: string | null;
  poseGuideStorageKey: string | null;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function buildStyledPrompt(
  job: AffiliateMediaJob,
  selection: AffiliatePilotV2Selection,
  scene: AffiliatePilotV2Scene,
  styleName: string,
  styleDescription: string
): string {
  return [
    NATURAL_PHOTO_CONTRACT,
    `Style direction: ${styleName}. ${styleDescription}`,
    `Scene/backdrop: ${scene.room}`,
    `Composition/framing: ${scene.camera}`,
    `Lighting/mood: ${scene.lighting}`,
    `Product placement and orientation: ${scene.productPlacement}`,
    `Natural set dressing: ${scene.livedInDetails}`,
    `Product identity invariant: ${selection.identityPrompt}`,
    "Input images: Image 1 is the approved private canonical product reference; Image 2 is the owner-accepted transparent presentation anchor. Use both only to preserve the same physical product identity. Do not reproduce either source background or source composition.",
    "Materials and integration: preserve believable surface roughness, seams, weave, grain, joinery, hardware, and small identity details. Any reflection must depict this room's nearby forms and light sources rather than a studio setup.",
    "Constraints: exactly one canonical product; safe and physically functional placement; no people or hands; no packaging; no invented feature, claim, permanent accessory, label, pattern, finish, or duplicate product; no text overlay or watermark.",
    `Output intent: one high-quality ${job.kind} portrait image at 1024x1536 in a 2:3 frame.`
  ].join("\n");
}

export function buildAffiliatePilotV2Manifest(products: AffiliateProduct[]) {
  const productByAsin = new Map(products.map((product) => [product.asin, product]));
  const styleBySlug = new Map(inspirationStyles.map((style) => [style.slug, style]));
  const sceneByKey = new Map(
    affiliatePilotV2Scenes.map((scene) => [
      `${scene.asin}:${scene.styleSlug}:${scene.slot}`,
      scene
    ])
  );
  if (sceneByKey.size !== 30 || affiliatePilotV2Scenes.length !== 30) {
    throw new Error("Pilot v2 requires exactly 30 unique styled scene specifications.");
  }

  const jobs: AffiliatePilotV2Job[] = [];
  const productsManifest = affiliatePilotV1Selections.map((selection) => {
    const product = productByAsin.get(selection.asin);
    if (!product) throw new Error(`Pilot v2 product ASIN ${selection.asin} is not approved.`);
    if (product.approvalStatus !== "approved" && product.approvalStatus !== "approved_with_caveat") {
      throw new Error(`Pilot v2 product ASIN ${selection.asin} is not approved.`);
    }

    const sourceJobs = buildAffiliateMediaJobs(product).filter(
      (job) =>
        job.kind === "presentation" ||
        (job.styleSlug !== null &&
          selection.styleSlugs.some((styleSlug) => styleSlug === job.styleSlug))
    );
    if (sourceJobs.length !== 11) {
      throw new Error(`Pilot v2 product ${selection.asin} produced ${sourceJobs.length} jobs.`);
    }

    sourceJobs.forEach((job) => {
      const storageKey = job.storageKey
        .replace(/^affiliate-products\/v1\//, "affiliate-pilot/v2/")
        .replace(/\.webp$/, ".png");

      if (job.kind === "presentation") {
        const reusedFromStorageKey = storageKey.replace(
          /^affiliate-pilot\/v2\//,
          "affiliate-pilot/v1/"
        );
        const prompt =
          "Owner-approved transparent presentation asset reused unchanged from affiliate pilot v1; no generation call is authorized or required for this job.";
        jobs.push({
          ...job,
          storageKey,
          promptVersion: AFFILIATE_PILOT_V2_PROMPT_VERSION,
          generationVersion: AFFILIATE_PILOT_V2_GENERATION_VERSION,
          prompt,
          status: "reused_owner_approved",
          referenceInputCount: 0,
          requiresPromptCapture: false,
          requestedModel: AFFILIATE_PILOT_V2_REQUESTED_MODEL,
          requestedQuality: AFFILIATE_PILOT_V2_REQUESTED_QUALITY,
          promptSha256: sha256(prompt),
          sceneId: null,
          reusedFromStorageKey,
          poseGuideId: null,
          poseGuideStorageKey: null
        });
        return;
      }

      const scene = sceneByKey.get(`${selection.asin}:${job.styleSlug}:${job.slot}`);
      if (!scene) {
        throw new Error(
          `Pilot v2 is missing scene direction for ${selection.asin}:${job.styleSlug}:${job.slot}.`
        );
      }
      const style = styleBySlug.get(job.styleSlug!);
      if (!style) throw new Error(`Unknown pilot v2 style ${job.styleSlug}.`);
      const poseGuideId = POSE_GUIDE_BY_JOB_KEY.get(
        `${selection.asin}:${job.styleSlug}:${job.slot}`
      ) ?? null;
      const qaCorrection = QA_CORRECTION_BY_JOB_KEY.get(
        `${selection.asin}:${job.styleSlug}:${job.slot}`
      ) ?? null;
      const poseGuideStorageKey = poseGuideId
        ? `affiliate-pilot/v2/private-pose-guides/${selection.asin}/${poseGuideId}.png`
        : null;
      const prompt =
        buildStyledPrompt(job, selection, scene, style.name, style.description) +
        (poseGuideId
          ? `\nPose-guide correction: Image 3 is the reviewed private ${poseGuideId.replaceAll("-", " ")} orientation guide. Match Image 3's product rotation and pump direction exactly while adapting only the camera height and room lighting to this scene. This correction exists because the earlier attempt incorrectly reverted to the canonical front view. Do not show the familiar front-facing view and do not add the OXO mark when it is hidden in Image 3.`
          : "") +
        (qaCorrection ? `\n${qaCorrection}` : "");
      jobs.push({
        ...job,
        storageKey,
        promptVersion: AFFILIATE_PILOT_V2_PROMPT_VERSION,
        generationVersion: AFFILIATE_PILOT_V2_GENERATION_VERSION,
        prompt,
        status: "queued",
        referenceInputCount: poseGuideId ? 3 : 2,
        requiresPromptCapture: true,
        requestedModel: AFFILIATE_PILOT_V2_REQUESTED_MODEL,
        requestedQuality: AFFILIATE_PILOT_V2_REQUESTED_QUALITY,
        promptSha256: sha256(prompt),
        sceneId: scene.sceneId,
        reusedFromStorageKey: null,
        poseGuideId,
        poseGuideStorageKey
      });
    });

    return {
      ...selection,
      productId: product.id,
      slug: product.slug,
      productName: product.name,
      brand: product.brand,
      approvalStatus: product.approvalStatus,
      jobCount: sourceJobs.length
    };
  });

  if (jobs.length !== 33 || new Set(jobs.map((job) => job.id)).size !== 33) {
    throw new Error("The affiliate pilot v2 must contain exactly 33 unique jobs.");
  }

  return {
    pilotVersion: AFFILIATE_PILOT_V2_VERSION,
    manifestVersion: 2,
    promptVersion: AFFILIATE_PILOT_V2_PROMPT_VERSION,
    generationVersion: AFFILIATE_PILOT_V2_GENERATION_VERSION,
    requestedModel: AFFILIATE_PILOT_V2_REQUESTED_MODEL,
    requestedQuality: AFFILIATE_PILOT_V2_REQUESTED_QUALITY,
    ...affiliatePilotV2Authorization,
    executionLogRequired: true,
    exactPromptCaptureRequired: true,
    productCount: productsManifest.length,
    presentationCount: jobs.filter((job) => job.kind === "presentation").length,
    reusedPresentationCount: jobs.filter((job) => job.status === "reused_owner_approved").length,
    poseGuideJobCount: jobs.filter((job) => job.poseGuideId !== null).length,
    poseGuideCount: new Set(jobs.map((job) => job.poseGuideId).filter(Boolean)).size,
    styledCount: jobs.filter((job) => job.kind === "styled").length,
    generationRequestedCount: jobs.filter((job) => job.status === "queued").length,
    totalCount: jobs.length,
    products: productsManifest,
    jobs
  };
}
