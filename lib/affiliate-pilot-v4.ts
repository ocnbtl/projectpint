import { createHash } from "node:crypto";
import {
  affiliatePilotV4Authorization,
  affiliatePilotV4CameraRecipes,
  affiliatePilotV4ExecutionPolicy,
  affiliatePilotV4HumanTraceRecipes,
  affiliatePilotV4IdentityViews,
  affiliatePilotV4LightingRecipes,
  affiliatePilotV4MaterialRecipes,
  affiliatePilotV4RealismReset,
  affiliatePilotV4RoomHistoryRecipes,
  affiliatePilotV4Selections,
  affiliatePilotV4ShotBlueprints,
  affiliatePilotV4StyleVariationLanes,
  affiliatePilotV4StyleProfiles,
  affiliatePilotV4VisualQaRubric,
  type AffiliatePilotV4IdentityView,
  type AffiliatePilotV4ProductRole,
  type AffiliatePilotV4Selection
} from "../data/affiliate-pilot.v4.ts";
import type { AffiliateProduct } from "./affiliate-catalog.ts";
import { inspirationStyles } from "./redesign-data.ts";

export const AFFILIATE_PILOT_V4_VERSION = "affiliate-pilot-v4";
export const AFFILIATE_PILOT_V4_PROMPT_VERSION =
  affiliatePilotV4RealismReset.contractVersion;
export const AFFILIATE_PILOT_V4_GENERATION_VERSION =
  "pilot-2026-07-31-run-05";
export const AFFILIATE_PILOT_V4_REQUESTED_MODEL = "gpt-image-2";
export const AFFILIATE_PILOT_V4_REQUESTED_QUALITY = "high";
export const AFFILIATE_PILOT_V4_TARGET = {
  width: 1024,
  height: 1536,
  aspect: "2:3"
} as const;

const IDENTITY_VIEW_DIRECTIONS: Record<AffiliatePilotV4IdentityView, string> = {
  presentation:
    "Use the most informative canonical three-quarter view, normally front-right unless the authorized references clearly establish another canonical handed view. Show the complete product with generous safe area.",
  front:
    "Use a true orthographic front elevation: camera centered on the canonical front plane, optical axis perpendicular to it, level horizon, no three-quarter rotation, and no perspective exaggeration.",
  back:
    "Rotate the same physical product exactly 180 degrees from the canonical front. Use a true orthographic rear elevation, centered and level, without mirroring the product's handed geometry.",
  left:
    "Rotate the same physical product exactly 90 degrees to reveal its physical left side. Use a true orthographic side elevation, centered and level, without turning it into a three-quarter view.",
  right:
    "Rotate the same physical product exactly 90 degrees to reveal its physical right side. Use a true orthographic side elevation, centered and level, without turning it into a three-quarter view.",
  top:
    "Use a true orthographic plan view directly above the same product, optical axis vertical, showing its exact footprint, openings, feature positions, and material continuity without perspective distortion.",
  bottom:
    "Use a true orthographic underside view directly below the same product, optical axis vertical. Show only underside construction supported by the authorized references and the declared hidden-geometry policy."
};

const PHYSICAL_PHOTO_CONTRACT = [
  "Use case: photorealistic-natural.",
  "Asset type: candid iPhone bathroom snapshot for a Project Pint affiliate gallery.",
  "Primary request: photograph a believable occupied home bathroom; the featured product merely happens to be present. The room and recent human use are the subject, never the product.",
  "Capture priority: believable household photograph first, decorative polish second. Keep modest framing mistakes, mild perspective convergence, ordinary phone sharpening, fine shadow noise, limited highlight recovery, and no fake portrait blur.",
  "Anti-stock invariant: do not center or hero-light the product, clear every surface, align every prop, repeat a catalog composition, or make the room resemble a luxury listing, showroom, advertisement, or synthetic interior render.",
  "Physical invariant: use one buildable North American bathroom. Anything visible has support and clearance; any visible sink, tub, shower, door, cabinet, glass edge, plumbing fixture, outlet, switch, or reflection is complete and coherent. Omit risky fixtures rather than crop or invent them.",
  "Material invariant: prefer matte, honed, worn, and directionally textured surfaces. Preserve seams, thickness, grain, nap, weave, contact compression, water variation, and irregular roughness. No cloned patches, tiled veins, repeated folds, procedural ribbing, crystalline noise, or blanket gloss.",
  "Exposure invariant: product and room share one camera exposure, white balance, color spill, focus behavior, shadow softness, noise, and highlight rolloff. The product is not cleaner, sharper, brighter, or more saturated than its surroundings.",
  "Identity invariant: show exactly one reviewed canonical product at ordinary household scale, correctly supported and handed, with no duplicate, mutation, invented feature, packaging, new mark, or alternate variation.",
  "Secondary-object invariant: use plain unbranded objects with no readable labels, pseudo-text, logos, or decorative typography.",
  "Set-variety invariant: every five-scene set uses five different physical rooms, camera positions, light sources, room histories, palette emphases, human traces, and material irregularities."
].join("\n");

const SLOT_COMPOSITION_INTENTS = [
  "Wide room-context frame from reachable doorway or threshold space. Keep the product off the optical center and let ordinary architecture occupy most of the image.",
  "Closer functional room view from reachable standing space, but not a product hero. Let one foreground or edge element make the framing feel found rather than staged.",
  "Slightly elevated diagonal from a different dry standing position, revealing a genuinely different wall and floor plan from slots 1 and 2.",
  "Lower candid viewpoint from real open floor or authorized dry tub volume, with one foreground edge or mild occlusion and no impossible camera position.",
  "Candid side or partial-obstruction composition from normal accessible room volume, such as peeking past a real jamb, cabinet edge, or hanging towel."
] as const;

const ROLE_PLACEMENTS: Record<
  AffiliatePilotV4ProductRole,
  readonly [string, string, string, string, string]
> = {
  "countertop-dispenser": [
    "Place it upright near the sink on a fully supporting vanity, canonical front turned about 15 degrees toward the camera; the short spout remains nearly horizontal.",
    "Use a closer opposite-side view with a natural 35–55 degree rotation, pump reachable from the basin, and no independent highlight on the steel.",
    "Show a higher oblique view that reveals the pump and base band together while keeping every edge on the counter and the spout angle exact.",
    "Use a restrained rear-three-quarter orientation that still makes the pump geometry legible; if a mirror can see it, include its correct reversed reflection.",
    "Use a candid side-biased placement near one lived-in object, but keep the dispenser vertical, completely supported, and visually distinct from secondary bottles."
  ],
  "solid-shower-curtain": [
    "Show one newly generated full shower drape with exactly twelve separate hooks through exactly twelve openings on one straight rod. Simulate this scene's folds from twelve independent suspension points; do not reuse a drape, fold silhouette, or product cutout from another scene.",
    "Use a closer partly drawn side view with the entire countable header outside the upper frame before the first hook. Let the visible fabric gather asymmetrically with localized compression, cross-grain tension, changing fold depth, and one ordinary side edge.",
    "Show a second newly generated full header with exactly twelve hooks, but use a materially different left-right opening amount and a fresh gravity drape. No fold peak, trough, hem wave, or wrinkle map may repeat slot 1.",
    "Use a physically possible reverse view from dry tub volume with the entire header outside frame. Reveal plain reverse weave, side thickness, localized cross-grain wrinkles, unequal folds, and a plausible tub rim without reusing another scene's textile silhouette.",
    "Use a doorway or partial-obstruction view with the entire countable header outside frame before the first hook. Preserve one weighted hem and scene-specific irregular folds; never reuse a prior curtain cutout."
  ],
  "patterned-shower-curtain": [
    "Show one newly generated full shower drape with exactly twelve hooks through exactly twelve openings. Preserve major floral landmarks through an original gravity drape and never reuse a textile silhouette or product cutout.",
    "Show a closer partly drawn curtain with the entire countable header outside frame before the first hook. Preserve motif scale, fabric thickness, and asymmetric compression without tiling flowers.",
    "Show a second newly generated full header with exactly twelve hooks and a materially different opening amount. Preserve the same floral hierarchy but create fresh folds, wrinkle paths, and hem waves.",
    "Use a reverse view from physically open dry tub volume with the entire header outside frame and correct thin-polyester light transmission, a fresh drape, and no changed colorway.",
    "Use a realistic threshold view with the entire countable header outside frame before the first hook. Preserve the canonical floral panel while changing room, camera, and gravity state."
  ],
  "shower-bench": [
    "Place all four feet on a level dry floor beside the shower, leaving the lower shelf empty and the exact nine front-to-back top slats visible.",
    "Place one supported folded towel on part of the top and one small plain bottle inside the lower shelf without concealing the shelf topology or changing slat direction.",
    "Use the bench in a coherent wet-room zone with believable dampness, all four feet clear of the drain and glass, and the exact matte nine-slat top still readable.",
    "Place one brush and one folded cloth fully on the top, leaving clear circulation and no contact with vanity, wall, tub, or glass.",
    "Use a lower side angle with a different shelf load or no shelf load, preserving four feet, one lower shelf, the bowed apron, and natural non-glossy bamboo exposure."
  ],
  "wall-mirror": [
    "Mount it level above a fully buildable vanity; use a slightly off-axis camera so the mirror reflects a declared opposite wall and doorway rather than the phone.",
    "Use a closer vanity composition that shows the thin rim, shallow wall depth, straight bottom, and correct counter reflection with no duplicated objects.",
    "Use an elevated diagonal view with a different real opposite wall, complete cabinet handles, and reflected texture matching direct texture.",
    "Use mixed warm and cool light that appears consistently in the mirror and room; the arch remains broad, smooth, and unmutated.",
    "Use a candid side view past a real door jamb; the door, switch if any, reflected product, and room geometry must all agree with the mirror rays."
  ],
  "rolling-cart": [
    "Show the open long side and the non-mirrored tall-bay/short-middle-shelf topology; all four casters contact the floor and the wood top remains level.",
    "Use the solid concealment side as the nearer side while enough of the end and open side remains visible to prove the exact asymmetric compartment map.",
    "Use an elevated diagonal view that proves the wood top, full upper shelf, shortened middle shelf, tall open bay, full bottom shelf, handle, and four casters.",
    "Place two or three small items only inside real shelf volumes, with the shortened middle shelf and tall open bay unobstructed enough to audit.",
    "Use a candid narrow-space placement with safe clearance from toilet, door, and shower glass; do not mirror the handle or shelf layout and keep all four casters visible or geometrically accounted for."
  ],
  "wall-towel-ring": [
    "Mount the round escutcheon flush on a dry wall with the canonical upper-left mount and lower-left open return; leave the fixed ring empty for a clear identity read.",
    "Hang one light hand towel naturally through the fixed open frame while keeping both the upper-left mount and lower-left upturned end visible.",
    "Use an elevated oblique view that proves the two-inch wall projection and non-pivoting stem without mirroring the handedness.",
    "Use warm practical plus cool ambient light across the same champagne-bronze finish; keep the wall mount flush and the towel's center of mass inside the frame if present.",
    "Use a candid vanity-side wall placement with the fixed open C shape unobstructed; no hinge, closed square, loose mount, or reversible orientation."
  ],
  "countertop-soap-dish": [
    "Place the empty two-piece dish flat near a sink, with all eight raised bars and seven channels visible and the entire base supported.",
    "Rest one ordinary soap bar across only part of the insert so at least five bars and the two-piece relationship remain visible.",
    "Use a higher oblique view that proves the rectangular footprint, eight front-to-back bars, seven drainage channels, and four rounded corners.",
    "Place the empty dish on a different dry tub ledge or shelf, keeping it level, stable, room-exposed, and recognizably the same veined stone specimen.",
    "Use a close candid vanity composition with one supported neighboring object and no pooled water, extra drain hole, oval mutation, or repeated marble texture."
  ],
  "hanging-live-plant": [
    "Suspend the three-point hanger from one visible structural ceiling hook, with the black basket level and the campaign specimen's dominant vines clear of wet fixtures.",
    "Use a closer side view of the same suspended basket and canopy, preserving the three hanger legs, top hook, ribbed pot, and dominant vine directions.",
    "Use an elevated oblique view that reveals the canopy top, hanger convergence, pot rim, and natural irregular green-and-gold variegation without changing cultivar.",
    "Place the basket fully supported on a stable high shelf with the attached hanger gathered naturally above it; no foliage intersects walls, lights, or glass.",
    "Use a candid doorway or tub-side view of the suspended plant with realistic slight leaf variation only, preserving the same large-scale canopy silhouette and black basket."
  ],
  "bathtub-caddy": [
    "Bridge the caddy level across a real tub with both extension arms supported on opposite rims; leave it mostly empty so all fixed slots, support bar, handles, and wood geometry can be audited.",
    "Use a closer opposite-side view with one open book on the real reading support and one plain bottle fully on the tray; both rim contacts remain visible.",
    "Use a higher diagonal view that proves both extension arms, both rectangular handles, the phone slot, circular stemware opening, support bar, loofah hook, and exact left-right layout.",
    "Use a low tub-edge view with the water line safely below the caddy and one supported towel or brush; nothing floats, blocks a tap, or changes the tray topology.",
    "Use a candid side composition with a different tub shape and restrained props, preserving two-rim support, level extension, dry electronics policy, and the same non-mirrored feature positions."
  ]
};

const SCENE_REFERENCE_VIEW_BY_ROLE: Record<
  AffiliatePilotV4ProductRole,
  readonly [
    AffiliatePilotV4IdentityView,
    AffiliatePilotV4IdentityView,
    AffiliatePilotV4IdentityView,
    AffiliatePilotV4IdentityView,
    AffiliatePilotV4IdentityView
  ]
> = {
  "countertop-dispenser": ["front", "right", "top", "back", "left"],
  "solid-shower-curtain": ["front", "right", "top", "back", "left"],
  "shower-bench": ["front", "right", "top", "left", "back"],
  "wall-mirror": ["front", "left", "top", "right", "back"],
  "rolling-cart": ["front", "back", "top", "right", "left"],
  "patterned-shower-curtain": ["front", "right", "top", "back", "left"],
  "wall-towel-ring": ["front", "right", "top", "left", "back"],
  "countertop-soap-dish": ["front", "right", "top", "left", "back"],
  "hanging-live-plant": ["front", "right", "top", "left", "back"],
  "bathtub-caddy": ["front", "right", "top", "left", "back"]
};

type AffiliatePilotV4IdentityJob = {
  id: string;
  productId: string;
  asin: string;
  kind: "identity";
  identityView: AffiliatePilotV4IdentityView;
  styleSlug: null;
  slot: 0;
  storageKey: string;
  promptVersion: string;
  generationVersion: string;
  prompt: string;
  promptSha256: string;
  postprocess: "chroma_to_transparent_png";
  status: "reused_reviewed";
  referenceInputCount: number;
  referencePlan: string;
  requiresPromptCapture: false;
  requestedModel: typeof AFFILIATE_PILOT_V4_REQUESTED_MODEL;
  requestedQuality: typeof AFFILIATE_PILOT_V4_REQUESTED_QUALITY;
  reusedFromGenerationVersion: string;
  sceneId: null;
  qaFocus: string;
  atlasStorageKey: string;
  primarySceneReferenceView: null;
};

type AffiliatePilotV4StyledJob = {
  id: string;
  productId: string;
  asin: string;
  kind: "styled";
  identityView: null;
  styleSlug: string;
  slot: number;
  storageKey: string;
  promptVersion: string;
  generationVersion: string;
  prompt: string;
  promptSha256: string;
  postprocess: "none";
  status: "queued";
  referenceInputCount: 3 | 4 | 5;
  referencePlan: string;
  requiresPromptCapture: true;
  requestedModel: typeof AFFILIATE_PILOT_V4_REQUESTED_MODEL;
  requestedQuality: typeof AFFILIATE_PILOT_V4_REQUESTED_QUALITY;
  sceneId: string;
  qaFocus: string;
  atlasStorageKey: string;
  primarySceneReferenceView: AffiliatePilotV4IdentityView;
  cameraRecipe: string;
  lightingRecipe: string;
  roomHistoryRecipe: string;
  humanTraceRecipe: string;
  materialRecipe: string;
  styleVariationLane: string;
  generationStrategy:
    | "direct_identity_locked_room_first"
    | "exact_source_locked_textile_full_header"
    | "exact_source_locked_textile_hidden_header";
  providerAttemptBudget: number;
  reusableProductCompositeAllowed: false;
  localPixelSurgeryAllowed: false;
  localCropPolicy: "not_allowed";
  exactProductMaterialReferenceRequired: boolean;
  exactProductHeaderReferenceRequired: boolean;
  sourceReferenceCropPolicy:
    | "not_applicable"
    | "recorded_crop_to_exclude_listing_overlay_only";
};

export type AffiliatePilotV4Job =
  | AffiliatePilotV4IdentityJob
  | AffiliatePilotV4StyledJob;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function recipeFor(
  values: readonly string[],
  seed: string,
  slot: number,
  salt: string
): string {
  const offset = Number.parseInt(sha256(`${salt}:${seed}`).slice(0, 8), 16);
  return values[(offset + (slot - 1) * 3) % values.length]!;
}

function generationStrategyFor(
  role: AffiliatePilotV4ProductRole,
  slot: number
): AffiliatePilotV4StyledJob["generationStrategy"] {
  if (role !== "solid-shower-curtain" && role !== "patterned-shower-curtain") {
    return "direct_identity_locked_room_first";
  }
  return slot === 1 || slot === 3
    ? "exact_source_locked_textile_full_header"
    : "exact_source_locked_textile_hidden_header";
}

function isTextileRole(role: AffiliatePilotV4ProductRole): boolean {
  return role === "solid-shower-curtain" || role === "patterned-shower-curtain";
}

function incidentalFramingFor(role: AffiliatePilotV4ProductRole): string {
  if (
    role === "solid-shower-curtain" ||
    role === "patterned-shower-curtain" ||
    role === "wall-mirror"
  ) {
    return "The product is naturally large, but do not frame it as a centered hero. Let room architecture, circulation, foreground edges, and ordinary use remain visually important.";
  }
  return "Keep the product off center in the midground at ordinary household scale, generally about 8-20 percent of frame height. It must be identifiable without becoming the visual subject or receiving a cleaner exposure.";
}

function cleanSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
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

function styledKey(
  product: Pick<AffiliateProduct, "asin" | "slug">,
  styleSlug: string,
  slot: number
): string {
  return `${productRoot(product)}/styles/${cleanSegment(styleSlug)}/scene-${String(slot).padStart(2, "0")}.png`;
}

function countableChecklist(selection: AffiliatePilotV4Selection): string {
  return selection.countableFeatures
    .map((feature, index) => `${index + 1}) ${feature}`)
    .join("; ");
}

function buildIdentityPrompt(
  product: AffiliateProduct,
  selection: AffiliatePilotV4Selection,
  view: AffiliatePilotV4IdentityView
): string {
  const isPresentation = view === "presentation";
  return [
    "Use case: create-image.",
    "Asset type: Project Pint seven-view canonical affiliate-product identity reference.",
    `Create the ${view} identity view for ${product.name} by ${product.brand}.`,
    `Input references: use every supplied owner-authorized private manufacturer or retailer image only to reconstruct the same canonical product. ${isPresentation ? "No generated V4 identity anchor exists yet, so reconcile the private reference set conservatively." : "Also use the accepted V4 presentation anchor to keep this view in the exact same campaign specimen, handedness, proportions, material, and finish."}`,
    `Product identity contract: ${selection.identityPrompt}`,
    `Countable-feature preflight: ${countableChecklist(selection)}.`,
    `Hidden-geometry policy: ${selection.hiddenGeometryPolicy}`,
    `View and camera: ${IDENTITY_VIEW_DIRECTIONS[view]}`,
    "Orientation continuity: front, back, left, right, top, and bottom are rotations of one unchanged physical object in one coordinate system. Never mirror a handed product, reorder asymmetric features, change countable features, or substitute a sibling variation.",
    "Composition: exactly one complete product, centered in a portrait 2:3 frame with generous safe area on all sides. Do not crop any edge. For flexible textiles, show the requested structural view with gravity and real fabric thickness rather than a rigid board. For a living plant, preserve the declared campaign specimen's large-scale silhouette while retaining natural leaf irregularity.",
    "Lighting and material: broad neutral soft light shared across the whole object, restrained highlights, honest roughness, stochastic natural texture, and enough form shading to read geometry. No dramatic rim light, glossy luxury treatment, clipped metal, fake translucency, or repeated procedural texture.",
    "Background: perfectly flat uniform chroma green #00FF00 behind and around every part of the product. No gradient, horizon, floor, wall, room, props, text overlay, watermark, packaging, mounting display, hand, mannequin, extra hook, display rail, or environmental reflection.",
    "Segmentation safety: preserve crisp natural edges, openings, gaps, slats, hooks, foliage, casters, thin metal, transparent or reflective boundaries, and fabric fringes without green spill. Use no cast shadow beyond a tiny optional contact shadow inside the product footprint.",
    "Final identity audit before rendering: compare every count, dimension ratio, handed feature, seam, opening, slat, shelf, stem, hook, rim, bar, finish, and landmark against the authorized reference set; confirm this view can coexist with all six other views of one unchanged object.",
    `Output: one high-quality 1024x1536 portrait PNG-ready image in a ${AFFILIATE_PILOT_V4_TARGET.aspect} frame. A reviewed local chroma-removal pass will create the transparent final identity asset.`
  ].join("\n");
}

function buildStyledPrompt(
  product: AffiliateProduct,
  selection: AffiliatePilotV4Selection,
  style: (typeof inspirationStyles)[number],
  slot: number
): {
  prompt: string;
  qaFocus: string;
  primarySceneReferenceView: AffiliatePilotV4IdentityView;
  cameraRecipe: string;
  lightingRecipe: string;
  roomHistoryRecipe: string;
  humanTraceRecipe: string;
  materialRecipe: string;
  styleVariationLane: string;
  generationStrategy: AffiliatePilotV4StyledJob["generationStrategy"];
  referenceInputCount: AffiliatePilotV4StyledJob["referenceInputCount"];
  referencePlan: string;
  textileRole: boolean;
  fullHeaderTextile: boolean;
} {
  const profile =
    affiliatePilotV4StyleProfiles[
      style.slug as keyof typeof affiliatePilotV4StyleProfiles
    ];
  if (!profile) throw new Error(`Pilot v4 has no style profile for ${style.slug}.`);
  const shot = affiliatePilotV4ShotBlueprints[slot - 1];
  const placement = ROLE_PLACEMENTS[selection.productRole][slot - 1];
  const primarySceneReferenceView =
    SCENE_REFERENCE_VIEW_BY_ROLE[selection.productRole][slot - 1];
  const sceneId = `v4-${selection.asin}-${style.slug}-${String(slot).padStart(2, "0")}`;
  const recipeSeed = `${selection.asin}:${style.slug}`;
  const cameraRecipe = recipeFor(
    affiliatePilotV4CameraRecipes,
    recipeSeed,
    slot,
    "camera"
  );
  const lightingRecipe = recipeFor(
    affiliatePilotV4LightingRecipes,
    recipeSeed,
    slot,
    "lighting"
  );
  const roomHistoryRecipe = recipeFor(
    affiliatePilotV4RoomHistoryRecipes,
    recipeSeed,
    slot,
    "room"
  );
  const humanTraceRecipe = recipeFor(
    affiliatePilotV4HumanTraceRecipes,
    recipeSeed,
    slot,
    "human"
  );
  const materialRecipe = recipeFor(
    affiliatePilotV4MaterialRecipes,
    recipeSeed,
    slot,
    "material"
  );
  const styleVariationLane = recipeFor(
    affiliatePilotV4StyleVariationLanes,
    recipeSeed,
    slot,
    "style"
  );
  const generationStrategy = generationStrategyFor(
    selection.productRole,
    slot
  );
  const textileRole = isTextileRole(selection.productRole);
  const fullHeaderTextile = textileRole && (slot === 1 || slot === 3);
  const referenceInputCount = fullHeaderTextile ? 5 : textileRole ? 4 : 3;
  const referencePlan = textileRole
    ? `Use the reviewed seven-view identity atlas, the scene-selected orthographic identity view, the reviewed canonical presentation anchor, and one reviewed exact-product listing material detail.${fullHeaderTextile ? " Also use one reviewed exact-product listing header-construction image." : ""}`
    : "Use the reviewed seven-view identity atlas, the scene-selected orthographic identity view, and the reviewed canonical presentation anchor.";
  const inputImageRoles = textileRole
    ? `Input image roles: Image 1 is the reviewed seven-view identity atlas. Image 2 is the reviewed ${primarySceneReferenceView} identity view for this camera. Image 3 is the reviewed presentation anchor. Image 4 is a reviewed exact-product listing crop for weave, color, thickness, and surface roughness only; ignore any listing layout or excluded overlay. ${fullHeaderTextile ? "Image 5 is a reviewed exact-product listing image for grommet, hook, and header construction only." : "The complete countable header remains outside the final frame."} Use Images 1-3 only for stable product identity, and Images 4${fullHeaderTextile ? "-5" : ""} to correct synthetic textile behavior. Do not copy any reference backdrop, room, display pose, lighting, or existing fold silhouette into the bathroom.`
    : `Input image roles: Image 1 is the reviewed seven-view identity atlas. Image 2 is the reviewed ${primarySceneReferenceView} identity view for this camera. Image 3 is the reviewed presentation anchor. Use them only for product identity; do not copy their backdrop, atlas layout, display pose, chroma color, lighting, or prior fabric drape into the room.`;
  const qaFocus = [
    "Realism: score at least 3/4 for iPhone plausibility, incidental-product framing, nonrepeating materials, human irregularity, nonliteral style interpretation, and set-level light/room variety.",
    "Hard reject: AI-stock polish, centered hero framing, repeated product cutout or textile drape, procedural texture, blanket gloss, showroom staging, uniform HDR, or symmetric prop layout.",
    `Identity: ${countableChecklist(selection)}.`,
    `Placement: ${placement}`,
    `Room: ${shot.reflectionPlan}`,
    "Physical: complete visible plumbing, doors, supports and reflections; no pseudo-text, branding, collisions, floating objects, or malformed electrical devices."
  ].join(" ");

  return {
    primarySceneReferenceView,
    cameraRecipe,
    lightingRecipe,
    roomHistoryRecipe,
    humanTraceRecipe,
    materialRecipe,
    styleVariationLane,
    generationStrategy,
    referenceInputCount,
    referencePlan,
    textileRole,
    fullHeaderTextile,
    qaFocus,
    prompt: [
      PHYSICAL_PHOTO_CONTRACT,
      `Scene identity: ${sceneId}. This exact physical room and composition must not be reused elsewhere in the set.`,
      `Room history: ${roomHistoryRecipe}`,
      `iPhone capture: ${cameraRecipe}`,
      `Composition: ${SLOT_COMPOSITION_INTENTS[slot - 1]} ${incidentalFramingFor(selection.productRole)}`,
      `Available light: ${lightingRecipe}`,
      `Human trace: ${humanTraceRecipe}`,
      `Material behavior: ${materialRecipe}`,
      `Style direction: ${style.name}. ${style.description}`,
      `Style reference, not a checklist: ${profile.palette}. ${profile.architecture}.`,
      `Style variation lane: ${styleVariationLane}`,
      `Optional style vocabulary: choose at most two natural items from this list, only if the room needs them: ${profile.livedIn}.`,
      `Featured product present in the room: ${product.name} by ${product.brand}.`,
      `Product identity contract: ${selection.identityPrompt}`,
      `Countable-feature preflight: ${countableChecklist(selection)}.`,
      `Hidden-geometry policy: ${selection.hiddenGeometryPolicy}`,
      `Product placement invariant: ${selection.placementInvariant}`,
      `Scene-specific product placement: ${placement}`,
      `Reflection and door plan: ${shot.reflectionPlan}`,
      inputImageRoles,
      `Generation strategy: ${generationStrategy}. Generate this scene's product state natively inside this room. Reusing or compositing a product cutout, fold silhouette, textile map, or prior accepted scene is forbidden.`,
      `Scene-specific QA target: ${qaFocus}`,
      "Final audit: first ask whether this could be mistaken for an ordinary person's good iPhone bathroom photo. Then check product identity, scale, support, visible construction, reflections, material repetition, exposure integration, text, and whether any object or styling looks too perfectly arranged.",
      "Constraints: exactly one canonical featured product; no people or hands; no packaging; no product claim, alternate variation, added label, duplicate, text overlay, or watermark.",
      `Output: one high-quality 1024x1536 portrait image in a ${AFFILIATE_PILOT_V4_TARGET.aspect} frame.`
    ].join("\n")
  };
}

export function buildAffiliatePilotV4Manifest(
  products: AffiliateProduct[]
) {
  const productByAsin = new Map(products.map((product) => [product.asin, product]));
  if (inspirationStyles.length !== 12) {
    throw new Error("Pilot v4 requires exactly twelve Inspiration styles.");
  }
  if (
    Object.keys(affiliatePilotV4StyleProfiles).length !==
    inspirationStyles.length
  ) {
    throw new Error("Pilot v4 requires one style profile per Inspiration style.");
  }

  const jobs: AffiliatePilotV4Job[] = [];
  const productsManifest = affiliatePilotV4Selections.map((selection) => {
    const product = productByAsin.get(selection.asin);
    if (!product) {
      throw new Error(`Pilot v4 product ASIN ${selection.asin} is missing.`);
    }
    if (
      product.approvalStatus !== "approved" &&
      product.approvalStatus !== "approved_with_caveat"
    ) {
      throw new Error(`Pilot v4 product ASIN ${selection.asin} is not approved.`);
    }

    const atlasStorageKey = atlasKey(product);
    affiliatePilotV4IdentityViews.forEach((identityView) => {
      const prompt = buildIdentityPrompt(product, selection, identityView);
      jobs.push({
        id: `${product.id}:identity:${identityView}`,
        productId: product.id,
        asin: product.asin,
        kind: "identity",
        identityView,
        styleSlug: null,
        slot: 0,
        storageKey: identityKey(product, identityView),
        promptVersion: AFFILIATE_PILOT_V4_PROMPT_VERSION,
        generationVersion: AFFILIATE_PILOT_V4_GENERATION_VERSION,
        prompt,
        promptSha256: sha256(prompt),
        postprocess: "chroma_to_transparent_png",
        status: "reused_reviewed",
        referenceInputCount:
          selection.privateReferenceCount +
          (identityView === "presentation" ? 0 : 1),
        referencePlan:
          identityView === "presentation"
            ? `Use ${selection.privateReferenceCount} owner-authorized private canonical source image(s).`
            : `Use ${selection.privateReferenceCount} owner-authorized private source image(s) plus the accepted V4 presentation anchor.`,
        requiresPromptCapture: false,
        requestedModel: AFFILIATE_PILOT_V4_REQUESTED_MODEL,
        requestedQuality: AFFILIATE_PILOT_V4_REQUESTED_QUALITY,
        reusedFromGenerationVersion:
          affiliatePilotV4RealismReset.supersedesGenerationVersion,
        sceneId: null,
        qaFocus: `Exact ${identityView} geometry; ${countableChecklist(selection)}; transparent-edge readiness; no unsupported hidden features.`,
        atlasStorageKey,
        primarySceneReferenceView: null
      });
    });

    inspirationStyles.forEach((style) => {
      for (let slot = 1; slot <= 5; slot += 1) {
        const {
          prompt,
          qaFocus,
          primarySceneReferenceView,
          cameraRecipe,
          lightingRecipe,
          roomHistoryRecipe,
          humanTraceRecipe,
          materialRecipe,
          styleVariationLane,
          generationStrategy,
          referenceInputCount,
          referencePlan,
          textileRole,
          fullHeaderTextile
        } = buildStyledPrompt(product, selection, style, slot);
        jobs.push({
          id: `${product.id}:${style.slug}:${slot}`,
          productId: product.id,
          asin: product.asin,
          kind: "styled",
          identityView: null,
          styleSlug: style.slug,
          slot,
          storageKey: styledKey(product, style.slug, slot),
          promptVersion: AFFILIATE_PILOT_V4_PROMPT_VERSION,
          generationVersion: AFFILIATE_PILOT_V4_GENERATION_VERSION,
          prompt,
          promptSha256: sha256(prompt),
          postprocess: "none",
          status: "queued",
          referenceInputCount,
          referencePlan,
          requiresPromptCapture: true,
          requestedModel: AFFILIATE_PILOT_V4_REQUESTED_MODEL,
          requestedQuality: AFFILIATE_PILOT_V4_REQUESTED_QUALITY,
          sceneId: `v4-${selection.asin}-${style.slug}-${String(slot).padStart(2, "0")}`,
          qaFocus,
          atlasStorageKey,
          primarySceneReferenceView,
          cameraRecipe,
          lightingRecipe,
          roomHistoryRecipe,
          humanTraceRecipe,
          materialRecipe,
          styleVariationLane,
          generationStrategy,
          providerAttemptBudget:
            affiliatePilotV4ExecutionPolicy.providerAttemptBudgetPerAsset,
          reusableProductCompositeAllowed: false,
          localPixelSurgeryAllowed: false,
          localCropPolicy: "not_allowed",
          exactProductMaterialReferenceRequired: textileRole,
          exactProductHeaderReferenceRequired: fullHeaderTextile,
          sourceReferenceCropPolicy: textileRole
            ? "recorded_crop_to_exclude_listing_overlay_only"
            : "not_applicable"
        });
      }
    });

    return {
      ...selection,
      productId: product.id,
      slug: product.slug,
      productName: product.name,
      brand: product.brand,
      category: product.category,
      approvalStatus: product.approvalStatus,
      identityCount: affiliatePilotV4IdentityViews.length,
      styledCount: inspirationStyles.length * 5,
      jobCount: affiliatePilotV4IdentityViews.length + inspirationStyles.length * 5,
      atlasStorageKey
    };
  });

  const identityJobs = jobs.filter((job) => job.kind === "identity");
  const styledJobs = jobs.filter((job) => job.kind === "styled");
  if (
    jobs.length !== 670 ||
    identityJobs.length !== 70 ||
    styledJobs.length !== 600
  ) {
    throw new Error(
      `Pilot v4 expected 670 jobs (70 identity and 600 styled), received ${jobs.length} (${identityJobs.length} identity and ${styledJobs.length} styled).`
    );
  }
  if (new Set(jobs.map((job) => job.id)).size !== jobs.length) {
    throw new Error("Pilot v4 job IDs must be unique.");
  }
  if (new Set(jobs.map((job) => job.storageKey)).size !== jobs.length) {
    throw new Error("Pilot v4 storage keys must be unique.");
  }
  if (new Set(jobs.map((job) => job.promptSha256)).size !== jobs.length) {
    throw new Error("Pilot v4 exact prompts must be unique.");
  }
  if (
    productsManifest.some(
      (product) =>
        jobs.filter((job) => job.asin === product.asin && job.kind === "styled")
          .length !== 60
    )
  ) {
    throw new Error("Each pilot v4 product must have sixty styled jobs.");
  }

  return {
    pilotVersion: AFFILIATE_PILOT_V4_VERSION,
    manifestVersion: 4,
    promptVersion: AFFILIATE_PILOT_V4_PROMPT_VERSION,
    generationVersion: AFFILIATE_PILOT_V4_GENERATION_VERSION,
    requestedModel: AFFILIATE_PILOT_V4_REQUESTED_MODEL,
    requestedQuality: AFFILIATE_PILOT_V4_REQUESTED_QUALITY,
    providerModelObserved: null,
    providerQualityObserved: null,
    providerMetadataNote:
      "The built-in image-generation surface does not expose selected model or quality metadata. Requested values are workflow intent; provider values remain unobserved.",
    ...affiliatePilotV4Authorization,
    realismReset: affiliatePilotV4RealismReset,
    executionPolicy: affiliatePilotV4ExecutionPolicy,
    visualQaRubric: affiliatePilotV4VisualQaRubric,
    executionLogRequired: true,
    exactPromptCaptureRequired: true,
    perAssetVisualReviewRequired: true,
    failedAssetsMustBeRetried: true,
    productCount: productsManifest.length,
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
    reusedIdentityCount: identityJobs.length,
    styledCount: styledJobs.length,
    generationRequestedCount: styledJobs.length,
    totalCount: jobs.length,
    target: AFFILIATE_PILOT_V4_TARGET,
    products: productsManifest,
    jobs
  };
}
