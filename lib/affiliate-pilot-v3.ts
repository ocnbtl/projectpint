import { createHash } from "node:crypto";
import {
  affiliatePilotV3Authorization,
  affiliatePilotV3Scenes,
  affiliatePilotV3Selections,
  type AffiliatePilotV3Scene
} from "../data/affiliate-pilot.v3.ts";
import type { AffiliateProduct } from "./affiliate-catalog.ts";
import { buildAffiliateMediaJobs, type AffiliateMediaJob } from "./affiliate-media.ts";
import { inspirationStyles } from "./redesign-data.ts";

export const AFFILIATE_PILOT_V3_VERSION = "affiliate-pilot-v3";
export const AFFILIATE_PILOT_V3_PROMPT_VERSION =
  "affiliate-pilot-physical-photo-v3";
export const AFFILIATE_PILOT_V3_GENERATION_VERSION =
  "pilot-2026-07-27-run-03";
export const AFFILIATE_PILOT_V3_REQUESTED_MODEL = "gpt-image-2";
export const AFFILIATE_PILOT_V3_REQUESTED_QUALITY = "high";

const PHYSICAL_PHOTO_CONTRACT = [
  "Use case: photorealistic-natural.",
  "Asset type: Project Pint affiliate product-detail gallery photograph.",
  "Primary request: create one genuinely plausible bathroom photograph that an ordinary homeowner or interior-design editor could have captured on a recent smartphone main camera. It is not a product advertisement, synthetic interior render, real-estate listing, or showroom photograph.",
  "Capture character: handheld single exposure, realistic smartphone dynamic range, modest computational sharpening, subtle fine sensor noise in darker areas, mild lens distortion or perspective convergence where appropriate, small compositional imperfections, and natural main-camera depth of field. Avoid fake portrait-mode blur and do not make every surface perfect.",
  "Physical-support invariant: every object has mass, gravity, and a valid support. All boxes, bottles, trays, towels, rugs, and accessories rest fully and stably on a floor, shelf, hook, rail, counter, tub edge, or other physically sufficient support. A textile may drape only when enough of it is supported and the fold path is believable. Nothing floats, balances impossibly, overhangs accidentally, or penetrates glass, doors, walls, tubs, counters, hooks, shelves, or another object.",
  "Bathroom-architecture invariant: depict one buildable, functional room. A pedestal basin has a coherent column to the floor; a wall-hung basin has believable mounting and plumbing; a vanity basin is correctly inset or mounted. Show complete, coherent faucets, drains, shower heads, arms, hoses when applicable, controls, rods, door swings, wall joins, floor joins, and circulation clearances. The camera occupies real accessible room volume, never a wall, cabinet, mirror, glass panel, or impossible void.",
  "Reflection invariant: every mirror or reflective surface depicts only forms and light sources that truly exist opposite it in this exact room, with correct reversed position, perspective, occlusion, scale, and color. Do not invent phantom towels, doors, windows, lights, rooms, duplicate fixtures, or duplicate products. Choose a camera angle that keeps the phone and photographer out of the reflected field unless explicitly requested.",
  "Material invariant: use stochastic, nonrepeating natural surface detail. Tile, marble, wood, plaster, terrazzo, metal, rugs, and fabric must not use visibly cloned patches, crystalline noise, tiled grain, repeated veining, or repeated folds. Preserve correct roughness, seams, thickness, weave, grain direction, joinery, and contact shadows.",
  "Exposure invariant: expose the product and room together under the same ambient light and white balance. The product is not independently brightened, relit, glowing, haloed, cut out, pasted in, cleaner, smoother, or sharper than its surroundings. Its diffuse color, reflected color, contrast, specular hue, shadow softness, and contact shadow belong to the scene.",
  "Set-variety invariant: this must be a different physical room, palette, layout, camera position, time, and prop arrangement from every other image in the same five-image set. Do not repeat the same towel color, towel placement, shelf load, bottle grouping, rug, plant, or architectural shell five times.",
  "Product-identity invariant: render exactly one approved canonical product, at plausible scale, with no duplicate, mutation, alternate variation, invented feature, permanent accessory, packaging, added claim, or new mark. Secondary products must be plain and unbranded with no readable words, labels, logos, symbols, or pseudo-text.",
  "Avoid: studio key or rim light, commercial product lighting, centered catalog pose, showroom emptiness, perfect bilateral symmetry, flawless magazine styling, HDR-expanded shadows, clipped product highlights, cinematic teal-orange grading, excessive bokeh, CGI smoothness, repeated architecture, gravity errors, collision errors, impossible reflections, or near-duplicate compositions."
].join(" ");

type AffiliatePilotV3Selection = (typeof affiliatePilotV3Selections)[number];

const POSE_GUIDE_BY_JOB_KEY = new Map<string, string>([
  ["B0829N8C9G:minimalist-elegance:2", "left-profile"],
  ["B0829N8C9G:minimalist-elegance:3", "rear-three-quarter"],
  ["B0829N8C9G:modern-marble:2", "left-profile"],
  ["B0829N8C9G:modern-marble:3", "rear-three-quarter"]
]);

export interface AffiliatePilotV3Job extends Omit<AffiliateMediaJob, "status"> {
  status: "queued" | "reused_owner_approved";
  referenceInputCount: number;
  requiresPromptCapture: boolean;
  requestedModel: typeof AFFILIATE_PILOT_V3_REQUESTED_MODEL;
  requestedQuality: typeof AFFILIATE_PILOT_V3_REQUESTED_QUALITY;
  promptSha256: string;
  sceneId: string | null;
  qaFocus: string | null;
  reusedFromStorageKey: string | null;
  poseGuideId: string | null;
  poseGuideStorageKey: string | null;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function buildPresentationPrompt(
  product: AffiliateProduct,
  selection: AffiliatePilotV3Selection
): string {
  const inputDescription =
    selection.asin === "B07PFYZ3DP"
      ? "Input images 1 and 2 are complementary owner-authorized private manufacturer references: use both to preserve the exact exterior, open shelf geometry, solid concealment side, handle, wood top, and four casters."
      : "Input image 1 is the owner-authorized private canonical manufacturer reference. Use it to preserve the exact product identity.";
  return [
    "Use case: create-image.",
    "Asset type: transparent-ready Project Pint affiliate catalog presentation.",
    `Create one faithful full-product presentation of ${product.name} by ${product.brand}.`,
    inputDescription,
    `Product identity invariant: ${selection.identityPrompt}`,
    "Composition: one complete product only, centered in a portrait 2:3 frame with generous safe area on all sides. Use a useful canonical three-quarter or straight-on view that clearly communicates the product's defining construction. Do not crop any edge.",
    "Lighting: broad soft neutral light shared across the whole product, restrained highlights, realistic material roughness, and a subtle natural grounding shadow. This is clean product presentation, but not glossy luxury advertising.",
    "Background: perfectly flat, uniform chroma green #00FF00 behind and around every part of the product. No gradient, horizon, floor texture, room, props, text overlay, watermark, packaging, stand, display rail, or environmental reflection.",
    "Segmentation safety: preserve crisp but natural edges, openings, gaps, thin frame sections, hooks, casters, and translucent or reflective boundaries. Do not spill green into the product.",
    "Output intent: one high-quality portrait image at 1024x1536 in a 2:3 frame. A reviewed local chroma-removal pass will create the transparent delivery asset."
  ].join("\n");
}

function styledInputDescription(
  selection: AffiliatePilotV3Selection,
  poseGuideId: string | null
): string {
  let description: string;
  if (selection.asin === "B07PFYZ3DP") {
    description =
      "Input image 1 is the owner-authorized private canonical manufacturer view, input image 2 is the complementary private open-shelf geometry reference, and input image 3 is the reviewed transparent presentation anchor. Use all three only to preserve one exact physical product.";
  } else {
    description =
      "Input image 1 is the owner-authorized private canonical product reference and input image 2 is the reviewed transparent presentation anchor. Use both only to preserve one exact physical product.";
  }
  if (poseGuideId) {
    description += ` Input image 3 is the reviewed private ${poseGuideId.replaceAll("-", " ")} pose guide. Match that product rotation and pump direction while adapting the camera height and room lighting to this scene.`;
  }
  return description;
}

function buildStyledPrompt(
  job: AffiliateMediaJob,
  selection: AffiliatePilotV3Selection,
  scene: AffiliatePilotV3Scene,
  styleName: string,
  styleDescription: string,
  poseGuideId: string | null
): string {
  return [
    PHYSICAL_PHOTO_CONTRACT,
    `Style direction: ${styleName}. ${styleDescription}`,
    `Scene/backdrop: ${scene.room}`,
    `Composition/framing: ${scene.camera}`,
    `Lighting/mood: ${scene.lighting}`,
    `Product placement and orientation: ${scene.productPlacement}`,
    `Natural set dressing: ${scene.livedInDetails}`,
    `Product identity invariant: ${selection.identityPrompt}`,
    `Scene-specific QA target: ${scene.qaFocus}`,
    `Input images: ${styledInputDescription(selection, poseGuideId)} Do not reproduce any source background, source room, source composition, or display hardware.`,
    "Final physical audit before rendering: trace every object's support and center of mass; confirm no geometry intersects; confirm the camera could stand where specified; confirm the sink, shower, rod, door, floor, and walls could be built; confirm every mirror ray corresponds to the stated opposite room; confirm the product's exact countable features and scene-matched exposure.",
    "Constraints: exactly one canonical product; safe, dry, and physically functional placement; no people or hands; no readable secondary branding; no packaging; no invented feature, claim, permanent accessory, label, pattern, finish, or duplicate product; no text overlay or watermark.",
    `Output intent: one high-quality ${job.kind} portrait image at 1024x1536 in a 2:3 frame.`
  ].join("\n");
}

export function buildAffiliatePilotV3Manifest(products: AffiliateProduct[]) {
  const productByAsin = new Map(products.map((product) => [product.asin, product]));
  const styleBySlug = new Map(inspirationStyles.map((style) => [style.slug, style]));
  const sceneByKey = new Map(
    affiliatePilotV3Scenes.map((scene) => [
      `${scene.asin}:${scene.styleSlug}:${scene.slot}`,
      scene
    ])
  );
  if (sceneByKey.size !== 60 || affiliatePilotV3Scenes.length !== 60) {
    throw new Error("Pilot v3 requires exactly 60 unique styled scene specifications.");
  }

  const jobs: AffiliatePilotV3Job[] = [];
  const productsManifest = affiliatePilotV3Selections.map((selection) => {
    const product = productByAsin.get(selection.asin);
    if (!product) throw new Error(`Pilot v3 product ASIN ${selection.asin} is not approved.`);
    if (
      product.approvalStatus !== "approved" &&
      product.approvalStatus !== "approved_with_caveat"
    ) {
      throw new Error(`Pilot v3 product ASIN ${selection.asin} is not approved.`);
    }

    const sourceJobs = buildAffiliateMediaJobs(product).filter(
      (job) =>
        job.kind === "presentation" ||
        (job.styleSlug !== null &&
          selection.styleSlugs.some((styleSlug) => styleSlug === job.styleSlug))
    );
    if (sourceJobs.length !== 11) {
      throw new Error(`Pilot v3 product ${selection.asin} produced ${sourceJobs.length} jobs.`);
    }

    sourceJobs.forEach((job) => {
      const storageKey = job.storageKey
        .replace(/^affiliate-products\/v1\//, "affiliate-pilot/v3/")
        .replace(/\.webp$/, ".png");

      if (job.kind === "presentation") {
        if (selection.reusePresentationFromV2) {
          const reusedFromStorageKey = storageKey.replace(
            /^affiliate-pilot\/v3\//,
            "affiliate-pilot/v2/"
          );
          const prompt =
            "Owner-approved transparent presentation asset reused unchanged from affiliate pilot v2; no generation call is required for this job.";
          jobs.push({
            ...job,
            storageKey,
            promptVersion: AFFILIATE_PILOT_V3_PROMPT_VERSION,
            generationVersion: AFFILIATE_PILOT_V3_GENERATION_VERSION,
            prompt,
            status: "reused_owner_approved",
            referenceInputCount: 0,
            requiresPromptCapture: false,
            requestedModel: AFFILIATE_PILOT_V3_REQUESTED_MODEL,
            requestedQuality: AFFILIATE_PILOT_V3_REQUESTED_QUALITY,
            promptSha256: sha256(prompt),
            sceneId: null,
            qaFocus: null,
            reusedFromStorageKey,
            poseGuideId: null,
            poseGuideStorageKey: null
          });
        } else {
          const prompt = buildPresentationPrompt(product, selection);
          jobs.push({
            ...job,
            storageKey,
            promptVersion: AFFILIATE_PILOT_V3_PROMPT_VERSION,
            generationVersion: AFFILIATE_PILOT_V3_GENERATION_VERSION,
            prompt,
            status: "queued",
            referenceInputCount: selection.presentationReferenceCount,
            requiresPromptCapture: true,
            requestedModel: AFFILIATE_PILOT_V3_REQUESTED_MODEL,
            requestedQuality: AFFILIATE_PILOT_V3_REQUESTED_QUALITY,
            promptSha256: sha256(prompt),
            sceneId: null,
            qaFocus:
              "Faithful canonical geometry, chroma separation, complete uncropped product, and clean transparent-edge readiness.",
            reusedFromStorageKey: null,
            poseGuideId: null,
            poseGuideStorageKey: null
          });
        }
        return;
      }

      const scene = sceneByKey.get(
        `${selection.asin}:${job.styleSlug}:${job.slot}`
      );
      if (!scene) {
        throw new Error(
          `Pilot v3 is missing scene direction for ${selection.asin}:${job.styleSlug}:${job.slot}.`
        );
      }
      const style = styleBySlug.get(job.styleSlug!);
      if (!style) throw new Error(`Unknown pilot v3 style ${job.styleSlug}.`);
      const poseGuideId =
        POSE_GUIDE_BY_JOB_KEY.get(
          `${selection.asin}:${job.styleSlug}:${job.slot}`
        ) ?? null;
      const poseGuideStorageKey = poseGuideId
        ? `affiliate-pilot/v2/private-pose-guides/${selection.asin}/${poseGuideId}.png`
        : null;
      const prompt = buildStyledPrompt(
        job,
        selection,
        scene,
        style.name,
        style.description,
        poseGuideId
      );
      jobs.push({
        ...job,
        storageKey,
        promptVersion: AFFILIATE_PILOT_V3_PROMPT_VERSION,
        generationVersion: AFFILIATE_PILOT_V3_GENERATION_VERSION,
        prompt,
        status: "queued",
        referenceInputCount:
          selection.styledReferenceCount + (poseGuideId ? 1 : 0),
        requiresPromptCapture: true,
        requestedModel: AFFILIATE_PILOT_V3_REQUESTED_MODEL,
        requestedQuality: AFFILIATE_PILOT_V3_REQUESTED_QUALITY,
        promptSha256: sha256(prompt),
        sceneId: scene.sceneId,
        qaFocus: scene.qaFocus,
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

  if (jobs.length !== 66 || new Set(jobs.map((job) => job.id)).size !== 66) {
    throw new Error("The affiliate pilot v3 must contain exactly 66 unique jobs.");
  }
  if (new Set(jobs.map((job) => job.storageKey)).size !== 66) {
    throw new Error("The affiliate pilot v3 storage keys must be unique.");
  }

  return {
    pilotVersion: AFFILIATE_PILOT_V3_VERSION,
    manifestVersion: 3,
    promptVersion: AFFILIATE_PILOT_V3_PROMPT_VERSION,
    generationVersion: AFFILIATE_PILOT_V3_GENERATION_VERSION,
    requestedModel: AFFILIATE_PILOT_V3_REQUESTED_MODEL,
    requestedQuality: AFFILIATE_PILOT_V3_REQUESTED_QUALITY,
    providerModelObserved: null,
    providerQualityObserved: null,
    providerMetadataNote:
      "The built-in image-generation surface does not expose selected model or quality metadata; requested values are retained as workflow intent and provider values remain unobserved.",
    ...affiliatePilotV3Authorization,
    executionLogRequired: true,
    exactPromptCaptureRequired: true,
    productCount: productsManifest.length,
    presentationCount: jobs.filter((job) => job.kind === "presentation").length,
    reusedPresentationCount: jobs.filter(
      (job) => job.status === "reused_owner_approved"
    ).length,
    generatedPresentationCount: jobs.filter(
      (job) => job.kind === "presentation" && job.status === "queued"
    ).length,
    poseGuideJobCount: jobs.filter((job) => job.poseGuideId !== null).length,
    poseGuideCount: new Set(
      jobs.map((job) => job.poseGuideId).filter(Boolean)
    ).size,
    styledCount: jobs.filter((job) => job.kind === "styled").length,
    generationRequestedCount: jobs.filter((job) => job.status === "queued").length,
    totalCount: jobs.length,
    products: productsManifest,
    jobs
  };
}
