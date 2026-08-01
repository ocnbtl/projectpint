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
  affiliatePilotV4StyleSetExpressionLanes,
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
  "Phone-evidence invariant: preserve at least two ordinary capture defects such as an intruding threshold edge, mild roll, uncorrected vertical convergence, a loosely clipped architectural boundary, fine shadow noise, or imperfect highlight recovery. Do not make both axes perfectly corrected or use tripod-like symmetry.",
  "Daily-use invariant: show at least three independent nondecorative signs of occupancy or age from the assigned room history and human trace, such as handled fabric, skewed placement, partially open storage, a used sink item, high-touch wear, a water mark, or a mismatched retained finish. Plants, art, baskets, and coordinated decor do not count.",
  "Decor-limit invariant: never build a coordinated plant-art-rug vignette. Use at most one optional decorative style cue; everything else must have a practical household reason to be present.",
  "Physical invariant: use one buildable North American bathroom. Anything visible has support and clearance; any visible sink, tub, shower, door, cabinet, glass edge, plumbing fixture, outlet, switch, or reflection is complete and coherent. Omit risky fixtures rather than crop or invent them.",
  "Material invariant: prefer matte, honed, worn, and directionally textured surfaces. Preserve seams, thickness, grain, nap, weave, contact compression, water variation, and irregular roughness. No cloned patches, tiled veins, repeated folds, procedural ribbing, crystalline noise, or blanket gloss.",
  "Exposure invariant: product and room share one camera exposure, white balance, color spill, focus behavior, shadow softness, noise, and highlight rolloff. The product is not cleaner, sharper, brighter, or more saturated than its surroundings.",
  "Identity invariant: show exactly one reviewed canonical product at ordinary household scale, correctly supported and handed, with no duplicate, mutation, invented feature, packaging, new mark, or alternate variation.",
  "Secondary-object invariant: use plain unbranded objects with no readable labels, label-shaped graphics, pseudo-text, logos, or decorative typography. No secondary object may share the featured product's category or silhouette. For toiletries, prefer unlabeled cups, brushes, cloths, or loose ordinary items; omit bottles, tubes, and packages when a truly blank surface cannot be guaranteed.",
  "Set-variety invariant: every five-scene set uses five different physical rooms, camera positions, light sources, room histories, palette emphases, human traces, and material irregularities."
].join("\n");

const SLOT_COMPOSITION_INTENTS = [
  "Wide room-context frame from reachable doorway or threshold space. Keep the product off the optical center and let ordinary architecture occupy most of the image.",
  "Closer functional room view from reachable standing space, but not a product hero. Let one foreground or edge element make the framing feel found rather than staged.",
  "Slightly elevated diagonal from a different dry standing position, revealing a genuinely different wall and floor plan from slots 1 and 2.",
  "Lower candid viewpoint from accessible dry floor near the tub exterior, with one foreground edge or mild occlusion and no impossible camera position.",
  "Candid side or partial-obstruction composition from normal accessible room volume, such as peeking past a real jamb, cabinet edge, or hanging towel."
] as const;

const ROLE_PLACEMENTS: Record<
  AffiliatePilotV4ProductRole,
  readonly [string, string, string, string, string]
> = {
  "countertop-dispenser": [
    "Place it upright near the sink on a fully supporting vanity, canonical front turned about 15 degrees toward the camera; the short spout remains nearly horizontal and projects toward the viewer's right in this front-biased camera.",
    "Use a closer opposite-side view with a natural 35–55 degree rotation, pump reachable from the basin, and no independent highlight on the steel; the reviewed right-view short spout projects toward the viewer's left.",
    "Show a higher oblique view that reveals the pump and base band together while keeping every edge on the counter; the reviewed top-view short spout remains nearly horizontal and projects toward the viewer's right.",
    "Use a restrained rear-three-quarter orientation that still makes the pump geometry legible; the reviewed back-view short spout projects toward the viewer's left, and if a mirror can see it, include its correct reversed reflection.",
    "Use a candid side-biased placement near one lived-in object, but keep the dispenser vertical, completely supported, and visually distinct from secondary containers; the reviewed left-view short spout projects toward the viewer's right."
  ],
  "solid-shower-curtain": [
    "Use a wide doorway view with the curtain pulled 30-45 percent open and gathered asymmetrically toward the left. Keep the entire countable header, first hook, rod, and top edge outside the upper frame. Show no more than 45 percent of panel width, one ordinary side edge, the weighted hem, and a real shower-interior edge with fresh localized compression rather than a broad textile wall.",
    "Use a closer oblique side view with the curtain pulled 35-55 percent open and gathered asymmetrically to one side. Keep the entire countable header outside the upper frame before the first hook and show no more than 45 percent of the panel width. Reveal one real tub or shower-interior edge behind it. The visible fabric must form localized compression, cross-grain tension, changing fold depth, and one ordinary side edge, never a broad flat curtain wall.",
    "Use a slightly elevated opposite-side room view with the curtain pulled 50-65 percent open and gathered toward the right. Keep the entire countable header, rod, openings, hooks, and top edge outside frame. Show a different shower-interior edge, one side seam, the weighted hem, and a fresh gravity state whose folds and wrinkle paths do not repeat slots 1 or 2.",
    "Use a low oblique exterior side view from accessible dry floor near the tub, with the curtain pulled 45-60 percent open and gathered toward the far wall. Keep the entire header outside frame and keep the visible curtain silhouette inside the far-side 18-30 percent of frame width at every height. Show one shower-interior edge, one ordinary side seam, localized cross-grain wrinkles, a broad relaxed face, and the weighted body continuing behind the tub rim without a reused silhouette.",
    "Use a doorway or partial-obstruction view with the curtain pulled 35-55 percent open and asymmetrically gathered to one side. Keep the entire countable header outside frame before the first hook, show no more than 45 percent of panel width, preserve one weighted hem and scene-specific compressed folds, and never reuse a prior curtain cutout."
  ],
  "patterned-shower-curtain": [
    "Use a wide doorway view with the curtain pulled 30-45 percent open and gathered asymmetrically toward the left. Keep the entire countable header, first hook, rod, and top edge outside the upper frame. Show no more than 45 percent of panel width, one ordinary side edge, the weighted hem, a real shower-interior edge, and only a nonrepeating partial read of the canonical floral hierarchy.",
    "Show a closer oblique side view with the curtain pulled 35-55 percent open and asymmetrically gathered to one side. Keep the entire countable header outside frame before the first hook, show no more than 45 percent of panel width, reveal one shower-interior edge, and preserve motif scale, fabric thickness, and localized compression without tiling flowers or creating a broad flat curtain wall.",
    "Use a slightly elevated opposite-side room view with the curtain pulled 50-65 percent open and gathered toward the right. Keep the entire countable header, rod, openings, hooks, and top edge outside frame. Show a different shower-interior edge, one side seam, the weighted hem, and a fresh partial floral read without repeated landmarks, tiled motifs, or reused folds.",
    "Use a low oblique exterior side view from accessible dry floor near the tub, with the curtain pulled 45-60 percent open and gathered toward the far wall. Keep the entire header outside frame and keep the visible curtain silhouette inside the far-side 18-30 percent of frame width at every height. Show one shower-interior edge, one ordinary side seam, localized cross-grain wrinkles, a fresh partial floral read, and the weighted body continuing behind the tub rim.",
    "Use a realistic threshold view with the curtain pulled 35-55 percent open and asymmetrically gathered to one side. Keep the entire countable header outside frame before the first hook, show no more than 45 percent of panel width, and preserve the canonical floral panel while changing room, camera, and gravity state."
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
  "solid-shower-curtain": ["front", "right", "back", "back", "left"],
  "shower-bench": ["front", "right", "top", "left", "back"],
  "wall-mirror": ["front", "left", "top", "right", "back"],
  "rolling-cart": ["front", "back", "top", "right", "left"],
  "patterned-shower-curtain": ["front", "right", "back", "back", "left"],
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
  referenceInputCount: 3 | 5;
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
  styleSetExpressionLane: string;
  generationStrategy:
    | "direct_identity_locked_room_first"
    | "room_plate_two_pass_native_textile_full_header"
    | "room_plate_edit_deformation_gated_material_locked_textile_body_hidden_header";
  providerAttemptBudget: number;
  reusableProductCompositeAllowed: false;
  localPixelSurgeryAllowed: false;
  localCropPolicy: "not_allowed";
  exactProductMaterialReferenceRequired: boolean;
  exactProductHeaderReferenceRequired: boolean;
  sourceReferenceCropPolicy:
    | "not_applicable"
    | "recorded_crop_to_exclude_listing_overlay_only";
  identityReferenceCropPolicy:
    | "not_applicable"
    | "recorded_body_hem_crop_excluding_invisible_header";
  supportReferenceRequired: boolean;
  supportReferenceInputCount: 0 | 1 | 2;
  supportReferencePrompt: string | null;
  supportReferencePromptSha256: string | null;
  supportReferenceProviderAttemptBudget: number;
  supportReferenceReuseAllowed: false;
  supportReferenceCompositingAllowed: false;
  headerSupportReferenceRequired: boolean;
  headerSupportReferenceInputCount: 0 | 3;
  headerSupportReferencePrompt: string | null;
  headerSupportReferencePromptSha256: string | null;
  roomPlateSupportRequired: boolean;
  roomPlateSupportInputCount: 0;
  roomPlateSupportPrompt: string | null;
  roomPlateSupportPromptSha256: string | null;
  roomPlateProviderAttemptBudget: number;
  roomPlateReuseAllowed: false;
  roomPlateCorrectionAllowed: boolean;
  roomPlateCorrectionInputCount: 0 | 1;
  roomPlateCorrectionPrompt: string | null;
  roomPlateCorrectionPromptSha256: string | null;
  roomPlateCorrectionProviderAttemptBudget: number;
  roomPlateCorrectionRequiresSameSceneNearPass: boolean;
  roomPlateCorrectionMustPreservePassingPixels: boolean;
  roomPlateCorrectionReuseAllowed: false;
  roomPlateCorrectionCompositingAllowed: false;
  providerNativeRoomPlateEditRequired: boolean;
  nativeHeaderAuditEditRequired: boolean;
  nativeHeaderAuditEditInputCount: 0 | 3;
  nativeHeaderAuditEditPrompt: string | null;
  nativeHeaderAuditEditPromptSha256: string | null;
  nativeHeaderAuditEditProviderAttemptBudget: number;
  nativeHeaderAuditEditReuseAllowed: false;
  nonTextileNearPassCorrectionAllowed: boolean;
  nonTextileNearPassCorrectionInputCount: 0 | 3;
  nonTextileNearPassCorrectionPrompt: string | null;
  nonTextileNearPassCorrectionPromptSha256: string | null;
  nonTextileNearPassCorrectionProviderAttemptBudget: number;
  nonTextileNearPassCorrectionRequiresSameSceneNearPass: boolean;
  nonTextileNearPassCorrectionMustPreservePassingPixels: boolean;
  nonTextileNearPassCorrectionMayEditOnlyDocumentedHardRejectPixels: boolean;
  nonTextileNearPassCorrectionReuseAllowed: false;
  nonTextileNearPassCorrectionCompositingAllowed: false;
  finalizationEditGenerationCount: 0 | 1;
  supportReferenceGenerationCount: 0 | 1 | 2 | 3;
  supportReferenceCropPolicy:
    | "not_applicable"
    | "recorded_role_isolation_crops_required";
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
  _slot: number
): AffiliatePilotV4StyledJob["generationStrategy"] {
  if (role !== "solid-shower-curtain" && role !== "patterned-shower-curtain") {
    return "direct_identity_locked_room_first";
  }
  return "room_plate_edit_deformation_gated_material_locked_textile_body_hidden_header";
}

function isTextileRole(role: AffiliatePilotV4ProductRole): boolean {
  return role === "solid-shower-curtain" || role === "patterned-shower-curtain";
}

function buildTextileBodySupportPrompt(
  product: AffiliateProduct,
  selection: AffiliatePilotV4Selection,
  sceneId: string,
  identityReferenceView: AffiliatePilotV4IdentityView,
  fullHeaderTextile: boolean
): string {
  const solidTextile = selection.productRole === "solid-shower-curtain";
  const patternInstruction =
    selection.productRole === "patterned-shower-curtain"
      ? "Preserve the canonical motif hierarchy, scale, colorway, and landmark relationships from Image 1 without tiling, cloning, or stretching the print."
      : "Keep the panel solid muted terracotta-rust with no added pattern, stripe, border, ombre, or decoration.";
  const physicalState = fullHeaderTextile
    ? "Show the complete camera-visible panel body, both ordinary side seams, and the complete weighted bottom hem. The unseen twelve suspension points spread the panel across most of its width. Below the unseen suspension line, let the body relax into one broad cloth face covering at least seventy percent of visible width. Permit one wide shallow asymmetric displacement that changes width gradually and fades completely into the broad face by the lower third. A second wrinkle may be local and must end within twenty percent of image height. Finish with a modest nonperiodic weighted-hem wave."
    : "The curtain is partly open, with most gathering occurring above and outside the upper frame. Show no more than 45 percent of total panel width. Preserve one free ordinary side edge and the weighted hem. Below the unseen suspension line, let the visible body relax into one broad cloth face covering at least seventy percent of visible width. Permit one wide shallow asymmetric displacement that changes width gradually and fades completely into the broad face by the lower third. A second wrinkle may be local and must end within twenty percent of image height. Finish with a modest nonperiodic weighted-hem wave.";
  const inputRoles = solidTextile
    ? "Input role: Image 1 is the reviewed exact-product listing material/detail crop for weave, yarn variation, muted terracotta-rust color, thickness, and surface roughness. It contains no product silhouette or fold map. No generated identity drape is supplied or allowed to condition this solid-curtain support; the reviewed identity remains separate evidence for header count and overall product identity."
    : `Input roles: Image 1 is the reviewed ${identityReferenceView} identity view for print motif hierarchy, motif scale, colorway, ordinary side seam, thickness, and weighted hem only; explicitly discard its silhouette, periodic fold rhythm, lighting, and all visible header geometry. Image 2 is a reviewed exact-product listing material/detail crop for print behavior, thickness, and surface roughness.`;
  return [
    "Use case: internal one-use physical-state reference for one Project Pint bathroom scene, not a final product photograph.",
    `Scene-specific body support identity: ${sceneId}. This support image may be used only by this scene and must never be reused or composited.`,
    "Asset type: isolated textile body-and-hem drape study on a plain neutral light-gray background.",
    `Create the exact ${product.name} by ${product.brand} shown in the references, but show only the camera-visible body, applicable ordinary side seams, and weighted bottom hem. The rod, mounts, hooks, grommets, reinforced openings, and complete top edge must be outside the upper frame and absent.`,
    `Fresh gravity state: ${physicalState}`,
    "Gravity and support gate: every displacement descends from unseen suspension points above the upper frame, but the visible body is relaxed rather than gathered into pleats. At most one compression trough may persist for the full visible height, and it must be plainly wider and shallower at one end. The main asymmetric displacement must lose depth and disappear into the broad face by the lower third. Include no tieback, knot, bow, band, cord, clip, hook, hand, side attachment, contact point, singular waist, convergence toward one mid-height point, large diagonal trough, U-shaped scoop, swag, loop, folded-over mass, or theatrical drapery styling. No part of the lower body may fold upward over another, and the free weighted hem may not climb toward the mid-body.",
    "Hard rejection gate: the body must read first as one mostly flat, naturally imperfect hanging sheet, not as a set of vertical folds. Never create two or more adjacent full-height channels, bilateral symmetry, an evenly spaced row of tubes, pleats, parallel stripes, repeated arcs, cloned grooves, rigid planes, or a reusable catalog silhouette. If two neighboring troughs can be traced uninterrupted from the upper crop to the hem, or if the body can be summarized as parallel vertical stripes or as a dramatic diagonal swag, the support has failed.",
    patternInstruction,
    inputRoles,
    "Composition: one complete camera-visible body-and-hem section centered with generous neutral margin, no room, no tub, no props, no text, no labels, no watermark, no person, and no shadow that implies a cutout pasted into a bathroom.",
    "Technical output gate: output exactly 1024 pixels wide by exactly 1536 pixels high in a 2:3 portrait frame. Any one-pixel width or height deviation is a hard rejection; do not crop, pad, stretch, or rescale internally to disguise a dimension miss.",
    "Output: one high-quality 1024x1536 portrait PNG-ready reference."
  ].join("\n");
}

function buildTextileHeaderSupportPrompt(
  product: AffiliateProduct,
  selection: AffiliatePilotV4Selection,
  sceneId: string
): string {
  const patternInstruction =
    selection.productRole === "patterned-shower-curtain"
      ? "Preserve the canonical top-row motif scale, colorway, and landmark relationships without tiling or stretching the print."
      : "Keep the header solid muted terracotta-rust with no added pattern, stripe, border, ombre, or decoration.";
  return [
    "Use case: internal one-use header-count scaffold for one Project Pint bathroom scene, not a final product photograph.",
    `Scene-specific header support identity: ${sceneId}. This support may be used only by this scene and must never be reused or composited.`,
    "Asset type: isolated full-header construction study on a plain neutral light-gray background.",
    `Create exactly one ${product.name} by ${product.brand}. Show one complete straight metal rod, both simple mounts, and the complete top edge with generous margin.`,
    "Count is the primary gate: exactly twelve reinforced openings and exactly twelve separate simple hooks, one hook through each opening. Audit them as four left, four center, and four right positions for 4 + 4 + 4 = 12, but do not render numbers, dividers, group gaps, or labels. The sixth and seventh hooks straddle the panel centerline. No thirteenth or partial hook, missing hook, double hook, empty opening, or separate top band.",
    patternInstruction,
    "Input roles: Image 1 is the reviewed front identity view for exact product color, twelve-opening count, and top-edge identity only; body fold rhythm is irrelevant. Image 2 is a reviewed exact-product listing material/detail crop for color, weave or print behavior, and thickness. Image 3 is the reviewed exact-product header-construction crop for hook/grommet relationship only; its partial visible count does not govern the required total.",
    "Composition: isolated header construction reference only, no bathroom, no tub, no props, no text, no labels, no watermark, no person, and no dramatic product lighting. A recorded crop will exclude the body below the header before final-scene use.",
    "Output: one high-quality 1024x1536 portrait PNG-ready reference."
  ].join("\n");
}

function buildTextileRoomPlatePrompt(
  product: AffiliateProduct,
  style: (typeof inspirationStyles)[number],
  profile: {
    readonly palette: string;
    readonly architecture: string;
    readonly livedIn: string;
  },
  sceneId: string,
  slot: number,
  cameraRecipe: string,
  lightingRecipe: string,
  roomHistoryRecipe: string,
  humanTraceRecipe: string,
  materialRecipe: string,
  styleVariationLane: string,
  styleSetExpressionLane: string
): string {
  const cameraVolumeContract =
    "Preserve loose phone framing, mild convergence or roll, and a reachable dry-floor camera position outside the tub.";
  const installationZoneContract =
    "Installation zone: show a functional lower tub or shower opening and one unobstructed shower-interior edge, but crop or tilt the phone camera so the image intersects that opening below the would-be suspension line. The complete rod, mounts, hooks, reinforced openings, curtain top edge, full shower lintel, soffit, ceiling band, and upper wall above the would-be rod must all remain outside the upper frame wherever the curtain body will later enter. Include no rod fragment or mounting hardware. A complete rectangular shower opening or visible lintel above the empty curtain zone is a hard rejection because it makes hidden suspension physically impossible. The empty lower shower opening must be coherent and large enough to receive a gathered body that enters through the top frame already below its suspension line. Put the shower zone off center and generally within 25-45 percent of the frame width; room architecture, circulation, an imperfect foreground edge, and ordinary household use must remain more visually important.";
  const insertionContract =
    "Clear insertion-corridor gate: reserve one continuous empty vertical corridor within the shower zone, approximately 18-35 percent of frame width, running from the top image border already below suspension through the lower shower opening and behind the tub or shower wall. No towel, door, jamb, cabinet, basket, plant, art, fixture, reflection, hand, liner, hook, rod, or other room object may cross, cover, hang above, or project into this corridor. Put every human trace and optional style cue on the opposite side. Any foreground towel, jamb, or cabinet edge mentioned by the camera recipe must stay opposite the shower and occupy no more than eight percent of total frame area. If a later curtain could not be inserted without erasing a room object, the plate has failed.";
  const plateLockPurpose =
    "Plate-lock purpose: a later provider-native edit will add only the reviewed gathered curtain body inside the empty lower shower opening while the complete header remains outside frame. Make the room photograph strong enough to preserve unchanged; do not reserve a blank product-photography backdrop or light the shower opening as a hero.";
  return [
    "Use case: create-image.",
    "Asset type: internal one-use room-only iPhone plate for a Project Pint bathroom scene, not a final product image.",
    `Scene-specific room plate identity: ${sceneId}. This plate may be used only by this scene and must never be reused or locally composited.`,
    "Primary request: photograph a believable occupied home bathroom before its shower curtain is hung. The room, its ordinary use, and its imperfect phone capture are the subject.",
    `The featured ${product.name} by ${product.brand} must be completely absent. Include no shower curtain, liner, textile crossing the shower opening, loose hook, ring, packaging, label, logo, or readable or pseudo-text.`,
    installationZoneContract,
    insertionContract,
    "Electrical safety gate: omit every outlet, receptacle, switch, wall plate, cord, charger, plug, power strip, hair tool, and portable electrical device from the frame unless this manifest scene explicitly requires a code-safe U.S. GFCI installation. A fixed lighting recipe may use only a code-safe hardwired wall or ceiling fixture outside the wet zone, with no visible cord, plug, junction, supply hardware, or ambiguous wall plate. Never generate a standard duplex receptacle in a bathroom wet-area composition.",
    `Room history: ${roomHistoryRecipe}`,
    `iPhone capture: ${cameraRecipe}`,
    `Composition: ${SLOT_COMPOSITION_INTENTS[slot - 1]} ${cameraVolumeContract} Do not make a centered front elevation, corrected real-estate photograph, catalog angle, or symmetrical room.`,
    `Available light: ${lightingRecipe}`,
    `Exact human-trace ceiling: ${humanTraceRecipe} Show only the movable human traces explicitly named in this sentence. Do not invent any additional sign of use, storage item, toiletry, towel, container, cleaning product, or decorative object. Fixed wear, repair, grout variation, scuffs, and nonuniform paint may supply age without increasing the object count. Place every named trace outside the reserved shower insertion corridor.`,
    `Material behavior: ${materialRecipe}`,
    `Fixed-surface style direction: ${style.name}. Interpret the style only through one fixed architectural or material choice derived from this description: ${style.description}`,
    `Fixed style reference, not a palette or shopping list: ${profile.architecture}. The palette '${profile.palette}' may influence existing wall or fixed-surface undertones only; never instantiate it as matching movable objects or textiles.`,
    `Set-level fixed-surface expression lane: ${styleSetExpressionLane}`,
    `Fixed-surface variation lane: ${styleVariationLane} Apply this lane to architecture, room history, or a built-in finish only.`,
    "Set-diversity hard gate: use the style's most obvious signature color or material on at most one major fixed surface in this scene. Floor, vanity top, wet-zone wall, and main painted wall may not all repeat one signature finish. Across the five-scene set, repeating the same dominant fixed-surface category plus palette emphasis is a hard rejection.",
    "Zero-decor gate: include no plant, flower, vase, art, framed print, decorative bowl, tray, candle, basket used as decor, display shelf, stacked or rolled display towel, matching textile set, coordinated container, styled toiletries, open product packaging, label, or pseudo-text. Storage furniture may exist when required by room history, but its shelves and top remain visually quiet rather than merchandised.",
    "Movable-object audit: count semantic object groups before output. The exact assigned human traces plus any single functional floor textile may total no more than five groups in the entire frame. A grouped stack, filled basket, stocked shelf, toiletry cluster, or coordinated arrangement counts as multiple groups and fails unless that exact grouping is explicitly named by the assigned human-trace sentence. If the count exceeds five, remove extras rather than rearranging them.",
    "Physical audit: visible plumbing, tub or shower edges, doors, storage, supports, reflections, and circulation must be complete and coherent. Portable electrical devices are absent; any explicitly required fixed light is hardwired outside the wet zone with no visible supply hardware. Prefer matte, worn, directionally textured, and nonrepeating surfaces. No blanket gloss, tiled veins, repeated wood grain, procedural grout, impossible reflections, floating objects, or malformed fixtures.",
    plateLockPurpose,
    "Output: one high-quality 1024x1536 portrait room-only image in a 2:3 frame."
  ].join("\n");
}

function buildTextileRoomPlateCorrectionPrompt(
  product: AffiliateProduct,
  sceneId: string
): string {
  return [
    "Use case: edit-image.",
    "Asset type: provider-native bounded correction of one reviewed same-scene room-only iPhone plate, not a new room and not a final product image.",
    `Scene-specific room plate identity: ${sceneId}. Image 1 is a full-size-reviewed near-pass for this exact scene and may never be used by another scene.`,
    "Preservation contract: preserve Image 1's camera position, crop, lens behavior, architecture, plumbing, tub, vanity, window, door, floor, trim, light direction, exposure, noise, color response, wear, mat, basket, towel, ordinary objects, shadows, highlights, and every other passing pixel. Do not restage, redesign, clean, widen, recrop, relight, recolor, beautify, or replace the room.",
    "Correction scope: alter only the smallest documented hard-reject region named in the appended runtime correction directive. The directive must come from the recorded full-size review of Image 1. Do not make any unrequested improvement and do not edit a soft caveat.",
    `Product absence: the featured ${product.name} by ${product.brand} remains completely absent. Include no shower curtain, liner, textile crossing the shower opening, loose hook, ring, rod, mount, reinforced opening, top edge, packaging, label, logo, readable text, or pseudo-text.`,
    "Insertion-corridor result: leave one continuous empty rigid-architecture corridor from the top image border already below suspension through the lower shower opening and behind the tub or shower wall. No fabric, towel, door, jamb, cabinet, basket, plant, art, bottle, fixture, reflection, or other object may cross it.",
    "Safety result: include no outlet, receptacle, switch, wall plate, cord, plug, charger, power strip, hair tool, or portable electrical device unless the appended directive explicitly requires a code-safe U.S. GFCI. If the directive retains or replaces a fixed light, it must be one code-safe hardwired wall or ceiling fixture outside the wet zone with no visible cord, plug, junction, switch, supply hardware, or ambiguous plate.",
    "Method boundary: this must be one coherent provider-native image edit. Local compositing, masking, cloning, patching, cropping, or post-generation pixel surgery is forbidden.",
    "Output: one corrected high-quality 1024x1536 portrait room-only image in a 2:3 frame."
  ].join("\n");
}

function buildNativeHeaderAuditEditPrompt(
  product: AffiliateProduct,
  selection: AffiliatePilotV4Selection,
  sceneId: string
): string {
  const patternInstruction =
    selection.productRole === "patterned-shower-curtain"
      ? "Continue the existing canonical motif across the narrow edited header without resizing, tiling, mirroring, cloning, or shifting the body print."
      : "Keep the existing solid muted terracotta-rust color and dry woven surface; add no pattern, stripe, border, ombre, or decoration.";
  return [
    "Use case: edit-image.",
    "Asset type: final provider-native full-header construction audit for one Project Pint bathroom scene.",
    `Scene-specific finalization identity: ${sceneId}. This edit and every input are one-use evidence for this scene only.`,
    `Primary request: correct only the narrow header construction of the already placed ${product.name} by ${product.brand} in Image 1.`,
    "Input image roles: Image 1 is the reviewed room-placement candidate and governs the complete final image, curtain body, hem, room, camera, exposure, noise, objects, wear, and human irregularity. Image 2 is the reviewed scene-specific twelve-point header scaffold and governs only the straight rod, both mounts, exactly twelve hooks, exactly twelve openings, and direct hook-to-opening relationship. Image 3 is the reviewed room-only plate and is a preservation reference for every non-product pixel; do not restore its empty shower opening.",
    "Edit scope: modify only the smallest narrow strip needed between the rod and the existing curtain body. Preserve Image 1 everywhere else, including every architectural edge, cabinet, open door or drawer, pump, towel, switch, tub edge, floor mark, mat corner, shadow, highlight, phone artifact, body fold, side seam, and weighted hem. Do not redesign, restage, clean, relight, reframe, recrop, widen, or move the room or curtain body.",
    "Count gate: exactly twelve reinforced top openings and exactly twelve separate simple silver hooks, one hook through each opening. Audit four left + four center + four right = 12. The sixth and seventh positions straddle the panel centerline. Show all twelve distinctly between the two visible mounts, with no hidden, partial, thirteenth, missing, doubled, fused, or empty position.",
    "Construction gate: openings pass directly through the same uninterrupted curtain body. No separate top band, reinforcement strip, cuff, valance, doubled panel, repeated scallop, evenly repeated header wave, added seam, or change to the existing side edges.",
    patternInstruction,
    "Integration gate: the corrected header shares Image 1's exact perspective, warm overhead falloff, exposure, white balance, texture scale, focus, noise, and metal roughness. It must look photographed in the same original iPhone capture, never pasted, sharper, brighter, or more regular than the body.",
    `Final identity audit: ${countableChecklist(selection)}. Reject the edit internally if the count is not exactly twelve or if anything outside the narrow header strip changes materially.`,
    "Constraints: provider-native edit only; no local compositing, reusable header, text, label, logo, watermark, person, hand, packaging, duplicate product, alternate variation, or additional bathroom object.",
    "Output: one final high-quality 1024x1536 portrait image in a 2:3 frame."
  ].join("\n");
}

function buildNonTextileNearPassCorrectionPrompt(
  product: AffiliateProduct,
  selection: AffiliatePilotV4Selection,
  sceneId: string,
  primarySceneReferenceView: AffiliatePilotV4IdentityView
): string {
  return [
    "Use case: edit-image.",
    "Asset type: one-use provider-native same-scene correction for a reviewed non-textile Project Pint near-pass.",
    `Scene-specific correction identity: ${sceneId}. This correction and every input are restricted to this exact scene and may never be reused or composited elsewhere.`,
    `Featured product: ${product.name} by ${product.brand}.`,
    "Input image roles: Image 1 is the full-size-reviewed same-scene near-pass and the immutable base photograph. It governs the complete room, camera, crop, perspective, architecture, plumbing, support surfaces, object count, assigned human traces, material wear, reflections, light direction, exposure, shadows, highlights, color spill, focus, noise, and every passing product pixel. Image 2 is the reviewed seven-view identity atlas and governs complete canonical product geometry, handedness, counts, material boundaries, and hidden-feature continuity. Image 3 is the reviewed " +
      primarySceneReferenceView +
      " identity view and governs only the documented failed product geometry visible from this camera.",
    "Edit scope: change only the smallest pixels required by the separately supplied documented hard-reject list. A product correction must remain inside the existing product footprint unless a missing canonical protrusion requires a minimal local extension. A secondary-object correction may remove or neutralize only a specifically documented same-category, label-bearing, logo-bearing, or pseudo-text object, restoring the immediately surrounding wall, ledge, counter, or container surface without inventing decor.",
    "Immutable-base gate: do not redesign, restage, clean, relight, reframe, recrop, widen, move, replace, or sharpen the room. Preserve every passing room boundary, fixture, towel, mat, basket, grooming item, wear mark, shadow, reflection, highlight, phone artifact, and unlabeled object. Any material room redraw is a hard rejection.",
    "Camera-projected handedness gate: when a documented failure concerns left-right orientation, the separately supplied correction directive must state the required viewer-space projection for this exact camera. Follow that explicit viewer-space direction while preserving the visible canonical front, mark position, support, and every other product feature. Never mirror the product, swap a handed feature, or infer left-right from an unrelated room axis.",
    `Identity gate: ${selection.identityPrompt}`,
    `Countable-feature gate: ${countableChecklist(selection)}.`,
    "Ambiguity gate: exactly one object may share the featured product's category or recognizable silhouette. Add no bottle, pump, dispenser, package, label-shaped graphic, readable text, pseudo-text, logo, alternate mark, duplicate, or decorative typography.",
    "Integration gate: corrected pixels must share Image 1's exact scale, perspective, support, exposure, white balance, color spill, shadow softness, focus, noise, highlight rolloff, and material roughness. The corrected product may not become larger, cleaner, brighter, sharper, more centered, or more saturated.",
    "Constraints: provider-native edit only; no local pixel surgery, reusable cutout, compositing, new room object, person, hand, packaging, claim, text overlay, or watermark.",
    "Technical output gate: output exactly 1024 pixels wide by exactly 1536 pixels high. Preserve the original portrait framing; any one-pixel width or height deviation is a hard rejection."
  ].join("\n");
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
  styleSetExpressionLane: string;
  generationStrategy: AffiliatePilotV4StyledJob["generationStrategy"];
  referenceInputCount: AffiliatePilotV4StyledJob["referenceInputCount"];
  referencePlan: string;
  textileRole: boolean;
  fullHeaderTextile: boolean;
  hiddenHeaderTextile: boolean;
  supportReferencePrompt: string | null;
  headerSupportReferencePrompt: string | null;
  roomPlateSupportPrompt: string | null;
  roomPlateCorrectionPrompt: string | null;
  nativeHeaderAuditEditPrompt: string | null;
  nonTextileNearPassCorrectionPrompt: string | null;
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
  const styleSetExpressionLane =
    affiliatePilotV4StyleSetExpressionLanes[slot - 1];
  if (!styleSetExpressionLane) {
    throw new Error(`Pilot v4 has no set-level style lane for slot ${slot}.`);
  }
  const generationStrategy = generationStrategyFor(
    selection.productRole,
    slot
  );
  const textileRole = isTextileRole(selection.productRole);
  const fullHeaderTextile = false;
  const hiddenHeaderTextile = textileRole;
  const supportIdentityReferenceView = fullHeaderTextile
    ? "front"
    : primarySceneReferenceView;
  const supportReferencePrompt = textileRole
    ? buildTextileBodySupportPrompt(
        product,
        selection,
        sceneId,
        supportIdentityReferenceView,
        fullHeaderTextile
      )
    : null;
  const headerSupportReferencePrompt = fullHeaderTextile
    ? buildTextileHeaderSupportPrompt(product, selection, sceneId)
    : null;
  const roomPlateSupportPrompt = textileRole
    ? buildTextileRoomPlatePrompt(
        product,
        style,
        profile,
        sceneId,
        slot,
        cameraRecipe,
        lightingRecipe,
        roomHistoryRecipe,
        humanTraceRecipe,
        materialRecipe,
        styleVariationLane,
        styleSetExpressionLane
      )
    : null;
  const roomPlateCorrectionPrompt = textileRole
    ? buildTextileRoomPlateCorrectionPrompt(product, sceneId)
    : null;
  const nativeHeaderAuditEditPrompt = fullHeaderTextile
    ? buildNativeHeaderAuditEditPrompt(product, selection, sceneId)
    : null;
  const nonTextileNearPassCorrectionPrompt = !textileRole
    ? buildNonTextileNearPassCorrectionPrompt(
        product,
        selection,
        sceneId,
        primarySceneReferenceView
      )
    : null;
  const referenceInputCount = 3;
  const referencePlan = fullHeaderTextile
    ? "Use this job's reviewed one-use room-only iPhone plate as the locked edit base, its reviewed one-use twelve-point header-count scaffold crop, and its separate reviewed one-use body-and-hem support crop."
    : hiddenHeaderTextile
      ? "Use this job's reviewed one-use hidden-header room plate as the locked edit base, its reviewed one-use deformation-gated body-and-hem support, and the reviewed exact-product material/detail crop. Solid-curtain supports are conditioned only by flat exact-product material evidence; patterned supports may use reviewed identity evidence only for motif topology. No generated identity drape may condition a solid support or the final scene."
    : "Use the reviewed seven-view identity atlas, the scene-selected orthographic identity view, and the reviewed canonical presentation anchor.";
  const inputImageRoles = fullHeaderTextile
    ? "Input image roles: Image 1 is the reviewed one-use room-only iPhone plate and the locked photographic base. Preserve its camera position, framing, room geometry, light direction, exposure, objects, wear, and irregularity. Image 2 is the reviewed one-use header-count scaffold crop for the complete straight rod, both mounts, and exactly twelve one-to-one hooks/openings only; its body is excluded. Image 3 is the separate reviewed one-use body-and-hem support crop for exact-product material, fresh fold masses, seams, cross-grain tension, and weighted hem only; its top edge is excluded. Use a provider-native edit to add one coherent curtain only inside the empty shower opening. Do not redesign, restage, widen, clean, relight, or recrop the room, and do not paste or locally composite either support."
    : hiddenHeaderTextile
      ? "Input image roles: Image 1 is the reviewed one-use hidden-header room plate, the immutable base photograph, and the locked photographic base and composition; its shower crop has already passed the below-suspension-line feasibility gate. Make a constrained local provider edit inside only its reserved empty shower corridor, not a room re-render. Preserve its exact camera position, crop, framing, architecture, plumbing, every existing window or door boundary, vanity or storage edge, towel or floor textile, assigned human-trace object scale and location, wall and trim wear, tile boundaries, tub-side geometry, light direction, exposure, shadows, highlights, noise, labels, object count, and human irregularity. Shifting, enlarging, restaging, replacing, cleaning, or redrawing any of those room elements is a hard rejection. Image 2 is the reviewed one-use scene-specific body-and-hem support generated and accepted for this job; it governs the fresh body silhouette, ordinary side seam, weighted hem, and relaxed gravity state. Its body must remain one mostly broad cloth face covering at least seventy percent of visible width, with at most one changing full-height trough and one asymmetric displacement that fades into the face by the lower third. A second adjacent uninterrupted full-height channel is a hard rejection. Never convert it into equal tubes, parallel stripes, rigid planes, a large diagonal trough, U-shaped scoop, swag, loop, folded-over mass, unsupported pinch, or a free hem ending at or above the tub rim. Image 3 is the reviewed exact-product material/detail crop and governs only weave or print behavior, color, thickness, and surface roughness; it contains no reusable product silhouette or header. Use the constrained local edit to alter only the empty lower shower opening enough to add the partly open curtain body, entering through the top frame already below its hidden suspension line and continuing naturally below the tub rim toward the shower interior or floor. The rod, mounts, hooks, openings, top edge, full lintel, and soffit remain outside frame."
      : `Input image roles: Image 1 is the reviewed seven-view identity atlas. Image 2 is the reviewed ${primarySceneReferenceView} identity view for this camera. Image 3 is the reviewed presentation anchor. Use them only for product identity; do not copy their backdrop, atlas layout, display pose, chroma color, lighting, or prior fabric drape into the room.`;
  const identityQa = textileRole
    ? "Identity: the exact twelve-opening and twelve-hook total remains verified in the reviewed identity evidence. The styled scene must reveal zero rod, mount, hook, reinforced opening, or top-edge pixels; any visible header geometry is a hard reject. Preserve the reviewed body color or print, side seam, fabric thickness, and weighted hem without inventing a visible count."
    : `Identity: ${countableChecklist(selection)}.`;
  const qaFocus = [
    "Realism: score at least 3/4 for iPhone plausibility, incidental-product framing, nonrepeating materials, human irregularity, nonliteral style interpretation, and set-level light/room variety.",
    "Hard reject: AI-stock polish, centered hero framing, repeated product cutout or textile drape, procedural texture, blanket gloss, showroom staging, uniform HDR, symmetric prop layout, or a dominant signature surface-and-palette combination repeated elsewhere in the five-scene set.",
    identityQa,
    textileRole
      ? "Textile gravity: keep one mostly relaxed broad face covering at least seventy percent of visible width. Allow at most one full-height trough, and require one asymmetric displacement to change width and fade into the broad face by the lower third. Reject two adjacent uninterrupted channels, equal tubes, parallel stripes, rigid planes, large diagonal troughs, U-shaped scoops, swags, loops, folded-over masses, unsupported pinches, or a free weighted hem ending at or above the tub rim."
      : "Product gravity: every visible mass must be supported by the declared installation or placement.",
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
    styleSetExpressionLane,
    generationStrategy,
    referenceInputCount,
    referencePlan,
    textileRole,
    fullHeaderTextile,
    hiddenHeaderTextile,
    supportReferencePrompt,
    headerSupportReferencePrompt,
    roomPlateSupportPrompt,
    roomPlateCorrectionPrompt,
    nativeHeaderAuditEditPrompt,
    nonTextileNearPassCorrectionPrompt,
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
      `Set-level fixed-surface expression lane: ${styleSetExpressionLane}`,
      `Style variation lane: ${styleVariationLane}`,
      "Set-diversity hard gate: use the style's most obvious signature color or material on at most one major fixed surface in this scene. Floor, vanity top, wet-zone wall, and main painted wall may not all repeat one signature finish. Across the five-scene set, repeating the same dominant fixed-surface category plus palette emphasis is a hard rejection.",
      "Movable-object ceiling: the assigned Human trace sentence is the only source of movable household objects. Do not add optional style props, decor, stocked storage, plants, bottles, tubes, packages, jars, candles, art, trays, baskets, or toiletry clusters. When the assigned trace names a grooming item, use one plain brush, comb, cup, cloth, hair tie, or loose unlabeled object rather than a container.",
      `Featured product present in the room: ${product.name} by ${product.brand}.`,
      `Product identity contract: ${selection.identityPrompt}`,
      `Countable-feature preflight: ${countableChecklist(selection)}.`,
      `Hidden-geometry policy: ${selection.hiddenGeometryPolicy}`,
      `Product placement invariant: ${selection.placementInvariant}`,
      `Scene-specific product placement: ${placement}`,
      `Reflection and door plan: ${shot.reflectionPlan}`,
      inputImageRoles,
      `Generation strategy: ${generationStrategy}. ${fullHeaderTextile ? "First edit the reviewed room plate natively and alter only the empty shower opening enough to place the complete product; the room plate must remain recognizably unchanged. Treat this as the placement pass. A second provider-native audit edit will then correct only the narrow header strip and produce the accepted final." : hiddenHeaderTextile ? "Treat the reviewed hidden-header room plate as an immutable base photograph. Perform a constrained local provider edit inside only its reserved empty lower shower corridor, preserve every existing room element and boundary, reproduce the accepted one-trough broad body, and keep the complete header outside frame. Any room redraw or second adjacent full-height textile channel fails." : "Generate this scene's product state natively inside this room."} Reusing or locally compositing a product cutout, fold silhouette, textile map, room plate, or prior accepted scene is forbidden.`,
      `Scene-specific QA target: ${qaFocus}`,
      "Final audit: first ask whether this could be mistaken for an ordinary person's good iPhone bathroom photo. Then check product identity, scale, support, visible construction, reflections, material repetition, exposure integration, text, and whether any object or styling looks too perfectly arranged.",
      "Constraints: exactly one canonical featured product; no people or hands; no packaging; no product claim, alternate variation, added label, duplicate, text overlay, or watermark.",
      `Output: one high-quality image exactly 1024 pixels wide by exactly 1536 pixels high in a ${AFFILIATE_PILOT_V4_TARGET.aspect} portrait frame. Any one-pixel width or height deviation is a hard rejection.`
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
          styleSetExpressionLane,
          generationStrategy,
          referenceInputCount,
          referencePlan,
          textileRole,
          fullHeaderTextile,
          hiddenHeaderTextile,
          supportReferencePrompt,
          headerSupportReferencePrompt,
          roomPlateSupportPrompt,
          roomPlateCorrectionPrompt,
          nativeHeaderAuditEditPrompt,
          nonTextileNearPassCorrectionPrompt
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
          styleSetExpressionLane,
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
            : "not_applicable",
          identityReferenceCropPolicy: "not_applicable",
          supportReferenceRequired: textileRole,
          supportReferenceInputCount: textileRole
            ? selection.productRole === "solid-shower-curtain"
              ? 1
              : 2
            : 0,
          supportReferencePrompt,
          supportReferencePromptSha256: supportReferencePrompt
            ? sha256(supportReferencePrompt)
            : null,
          supportReferenceProviderAttemptBudget:
            affiliatePilotV4ExecutionPolicy.supportReferenceProviderAttemptBudget,
          supportReferenceReuseAllowed: false,
          supportReferenceCompositingAllowed: false,
          headerSupportReferenceRequired: fullHeaderTextile,
          headerSupportReferenceInputCount: fullHeaderTextile ? 3 : 0,
          headerSupportReferencePrompt,
          headerSupportReferencePromptSha256: headerSupportReferencePrompt
            ? sha256(headerSupportReferencePrompt)
            : null,
          roomPlateSupportRequired: textileRole,
          roomPlateSupportInputCount: 0,
          roomPlateSupportPrompt,
          roomPlateSupportPromptSha256: roomPlateSupportPrompt
            ? sha256(roomPlateSupportPrompt)
            : null,
          roomPlateProviderAttemptBudget:
            affiliatePilotV4ExecutionPolicy.roomPlateProviderAttemptBudget,
          roomPlateReuseAllowed: false,
          roomPlateCorrectionAllowed:
            textileRole &&
            affiliatePilotV4ExecutionPolicy
              .providerNativeRoomPlateCorrectionAllowed,
          roomPlateCorrectionInputCount: textileRole ? 1 : 0,
          roomPlateCorrectionPrompt,
          roomPlateCorrectionPromptSha256: roomPlateCorrectionPrompt
            ? sha256(roomPlateCorrectionPrompt)
            : null,
          roomPlateCorrectionProviderAttemptBudget:
            affiliatePilotV4ExecutionPolicy
              .roomPlateCorrectionProviderAttemptBudget,
          roomPlateCorrectionRequiresSameSceneNearPass:
            textileRole &&
            affiliatePilotV4ExecutionPolicy
              .roomPlateCorrectionRequiresFullSizeReviewedSameSceneSource,
          roomPlateCorrectionMustPreservePassingPixels:
            textileRole &&
            affiliatePilotV4ExecutionPolicy
              .roomPlateCorrectionMustPreservePassingPixels,
          roomPlateCorrectionReuseAllowed: false,
          roomPlateCorrectionCompositingAllowed: false,
          providerNativeRoomPlateEditRequired: textileRole,
          nativeHeaderAuditEditRequired: fullHeaderTextile,
          nativeHeaderAuditEditInputCount: fullHeaderTextile ? 3 : 0,
          nativeHeaderAuditEditPrompt,
          nativeHeaderAuditEditPromptSha256: nativeHeaderAuditEditPrompt
            ? sha256(nativeHeaderAuditEditPrompt)
            : null,
          nativeHeaderAuditEditProviderAttemptBudget:
            affiliatePilotV4ExecutionPolicy
              .providerNativeHeaderAuditEditAttemptBudget,
          nativeHeaderAuditEditReuseAllowed: false,
          nonTextileNearPassCorrectionAllowed:
            !textileRole &&
            affiliatePilotV4ExecutionPolicy
              .providerNativeNonTextileNearPassCorrectionAllowed,
          nonTextileNearPassCorrectionInputCount: textileRole ? 0 : 3,
          nonTextileNearPassCorrectionPrompt,
          nonTextileNearPassCorrectionPromptSha256:
            nonTextileNearPassCorrectionPrompt
              ? sha256(nonTextileNearPassCorrectionPrompt)
              : null,
          nonTextileNearPassCorrectionProviderAttemptBudget:
            affiliatePilotV4ExecutionPolicy
              .nonTextileNearPassCorrectionProviderAttemptBudget,
          nonTextileNearPassCorrectionRequiresSameSceneNearPass:
            !textileRole &&
            affiliatePilotV4ExecutionPolicy
              .nonTextileNearPassCorrectionRequiresFullSizeReviewedSameSceneSource,
          nonTextileNearPassCorrectionMustPreservePassingPixels:
            !textileRole &&
            affiliatePilotV4ExecutionPolicy
              .nonTextileNearPassCorrectionMustPreservePassingPixels,
          nonTextileNearPassCorrectionMayEditOnlyDocumentedHardRejectPixels:
            !textileRole &&
            affiliatePilotV4ExecutionPolicy
              .nonTextileNearPassCorrectionMayEditOnlyDocumentedHardRejectPixels,
          nonTextileNearPassCorrectionReuseAllowed: false,
          nonTextileNearPassCorrectionCompositingAllowed: false,
          finalizationEditGenerationCount: fullHeaderTextile ? 1 : 0,
          supportReferenceGenerationCount: fullHeaderTextile
            ? 3
            : hiddenHeaderTextile
              ? 2
              : 0,
          supportReferenceCropPolicy: fullHeaderTextile
            ? "recorded_role_isolation_crops_required"
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
  const bodySupportReferenceJobs = styledJobs.filter(
    (job) => job.supportReferenceRequired
  );
  const headerSupportReferenceJobs = styledJobs.filter(
    (job) => job.headerSupportReferenceRequired
  );
  const roomPlateSupportJobs = styledJobs.filter(
    (job) => job.roomPlateSupportRequired
  );
  const roomPlateCorrectionJobs = styledJobs.filter(
    (job) => job.roomPlateCorrectionAllowed
  );
  const nativeHeaderAuditEditJobs = styledJobs.filter(
    (job) => job.nativeHeaderAuditEditRequired
  );
  const nonTextileNearPassCorrectionJobs = styledJobs.filter(
    (job) => job.nonTextileNearPassCorrectionAllowed
  );
  const supportReferenceGenerationRequestedCount = styledJobs.reduce(
    (count, job) => count + job.supportReferenceGenerationCount,
    0
  );
  const finalizationEditGenerationRequestedCount = styledJobs.reduce(
    (count, job) => count + job.finalizationEditGenerationCount,
    0
  );
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
    bodySupportReferenceJobs.length !== 120 ||
    new Set(
      bodySupportReferenceJobs.map((job) => job.supportReferencePromptSha256)
    ).size !== bodySupportReferenceJobs.length ||
    headerSupportReferenceJobs.length !== 0 ||
    roomPlateSupportJobs.length !== 120 ||
    new Set(
      roomPlateSupportJobs.map((job) => job.roomPlateSupportPromptSha256)
    ).size !== roomPlateSupportJobs.length ||
    roomPlateCorrectionJobs.length !== 120 ||
    new Set(
      roomPlateCorrectionJobs.map(
        (job) => job.roomPlateCorrectionPromptSha256
      )
    ).size !== roomPlateCorrectionJobs.length ||
    nativeHeaderAuditEditJobs.length !== 0 ||
    nonTextileNearPassCorrectionJobs.length !== 480 ||
    new Set(
      nonTextileNearPassCorrectionJobs.map(
        (job) => job.nonTextileNearPassCorrectionPromptSha256
      )
    ).size !== nonTextileNearPassCorrectionJobs.length ||
    finalizationEditGenerationRequestedCount !== 0 ||
    supportReferenceGenerationRequestedCount !== 240
  ) {
    throw new Error(
      "Pilot v4 requires 120 unique textile body supports, 120 unique hidden-header room plates, 120 same-scene room-plate correction contracts, and 480 unique non-textile near-pass correction contracts, and forbids visible-header and header-audit styled jobs."
    );
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
    supportReferenceGenerationRequestedCount,
    roomPlateGenerationRequestedCount: roomPlateSupportJobs.length,
    roomPlateCorrectionEligibleCount: roomPlateCorrectionJobs.length,
    nonTextileNearPassCorrectionEligibleCount:
      nonTextileNearPassCorrectionJobs.length,
    finalizationEditGenerationRequestedCount,
    totalProviderGenerationRequestFloor:
      styledJobs.length +
      supportReferenceGenerationRequestedCount +
      finalizationEditGenerationRequestedCount,
    totalCount: jobs.length,
    target: AFFILIATE_PILOT_V4_TARGET,
    products: productsManifest,
    jobs
  };
}
