import { createHash } from "node:crypto";
import {
  affiliatePilotV4Authorization,
  affiliatePilotV4IdentityViews,
  affiliatePilotV4Selections,
  affiliatePilotV4ShotBlueprints,
  affiliatePilotV4StyleProfiles,
  type AffiliatePilotV4IdentityView,
  type AffiliatePilotV4ProductRole,
  type AffiliatePilotV4Selection
} from "../data/affiliate-pilot.v4.ts";
import type { AffiliateProduct } from "./affiliate-catalog.ts";
import { inspirationStyles } from "./redesign-data.ts";

export const AFFILIATE_PILOT_V4_VERSION = "affiliate-pilot-v4";
export const AFFILIATE_PILOT_V4_PROMPT_VERSION =
  "affiliate-pilot-identity-physical-photo-v4";
export const AFFILIATE_PILOT_V4_GENERATION_VERSION =
  "pilot-2026-07-27-run-04";
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
  "Asset type: Project Pint affiliate product-detail gallery photograph.",
  "Primary request: create one genuinely plausible bathroom photograph that an ordinary homeowner or interior-design editor could have captured with a recent smartphone main camera. It is not a product advertisement, synthetic interior render, real-estate listing, luxury showroom, or studio set.",
  "Capture invariant: handheld single exposure; realistic smartphone dynamic range; modest computational sharpening; subtle fine sensor noise in darker areas; mild lens distortion or perspective convergence when physically appropriate; small compositional imperfections; natural main-camera depth of field; no fake portrait-mode cutout.",
  "Support and collision invariant: every object has mass, gravity, a plausible center of mass, and one sufficient support. Every box, bottle, tray, towel, rug, plant, caddy, ring, and accessory rests fully on or hangs correctly from a floor, shelf, hook, rail, counter, tub rim, wall mount, or other declared support. Nothing floats, balances impossibly, accidentally overhangs, phases through, or intersects glass, doors, walls, tubs, counters, hooks, shelves, handles, plants, textiles, or another object.",
  "Bathroom architecture invariant: depict one buildable, functional North American residential bathroom. A pedestal basin has a coherent column to the floor; a wall-hung basin has believable mounting and plumbing; a vanity basin is correctly inset or mounted. Shower heads connect to real arms or hoses, controls and drains are complete, glass has coherent edges and supports, rods mount to walls, doors have jambs, hinges, latch, correctly placed knob or lever, and real swing clearance, cabinets and drawers have complete consistent hardware, and the camera occupies accessible room volume rather than a wall, cabinet, glass panel, mirror, or impossible void.",
  "North American electrical invariant: omit electrical devices unless useful to the composition. Any visible bathroom receptacle is a correctly proportioned U.S. NEMA 5-15R duplex GFCI with two vertical blade slots and one round ground per receptacle plus coherent TEST and RESET controls in one normal wall plate. Any visible switch is one standard U.S. Decora rocker or toggle in a conventional plate. Never invent slot patterns, hybrid foreign outlets, extra holes, melted plates, or impossible mirror duplicates.",
  "Reflection invariant: every mirror and reflective surface depicts only forms and light sources that truly exist opposite it in this exact room, with correct reversed position, perspective, occlusion, scale, orientation, and color. Reflect the featured product whenever ray geometry requires it. Do not invent phantom towels, windows, lights, doors, rooms, cameras, duplicate fixtures, or duplicate products. Reflected material texture must be as coherent as directly viewed texture.",
  "Material invariant: use stochastic nonrepeating natural detail. Tile, marble, wood, plaster, terrazzo, metal, rugs, foliage, and fabric must not use cloned patches, crystalline noise, tiled grain, copied veining, repeated fractals, or repeated folds. Preserve real roughness, seams, thickness, weave, grain direction, leaf structure, joinery, hardware, and contact shadows.",
  "Exposure invariant: expose the product and room together under exactly the same ambient light, color spill, white balance, and shadow environment. The product is never independently brightened, glowing, haloed, pasted in, cleaner, smoother, sharper, or more saturated than its surroundings. Its diffuse color, reflected color, contrast, specular hue, highlight rolloff, shadow softness, and contact shadow belong to the scene.",
  "Set-variety invariant: within this style's five-image set, use a materially different physical room, wall arrangement, palette emphasis, camera position and height, time or weather, towel color and placement, prop grouping, rug, plant use, and architectural shell. Do not return the same room or camera with minor decor swaps.",
  "Secondary-label invariant: plain unbranded secondary props are preferred. A short real-looking label or graphic may appear occasionally only when every character is crisp, intentional, correctly spelled, and geometrically attached to its container. Never use garbled pseudo-text, fuzzy symbols, counterfeit marks, or accidental third-party branding.",
  "Product identity invariant: render exactly one approved canonical product at plausible scale, with no duplicate, mutation, mirror reversal, alternate variation, invented feature, permanent accessory, packaging, added claim, or new mark.",
  "Avoid: studio key or rim light; commercial product lighting; centered catalog pose; showroom emptiness; perfect bilateral symmetry; flawless magazine styling; HDR-expanded shadows; clipped product highlights; cinematic teal-orange grading; excessive bokeh; CGI smoothness; gravity errors; collision errors; impossible reflections; incomplete plumbing; broken doors; incorrect outlets or switches; repeated architecture; or near-duplicate compositions."
].join(" ");

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
    "Show the full shower opening and complete header with exactly twelve separate hooks through exactly twelve openings on one straight rod; use unequal folds and no top band.",
    "Show a closer, partly drawn curtain with only part of the header intentionally outside the frame; the visible fabric bunches asymmetrically with nonrepeating folds.",
    "Show the full header again with exactly twelve hooks, a different left-right opening amount, and a plain weighted hem following gravity.",
    "Use a physically possible reverse view from dry tub volume with the top naturally out of frame; reveal fabric thickness, cross-grain wrinkles, and a plausible tub rim.",
    "Use a doorway view with either all twelve correctly countable hooks or a deliberate crop before the count begins; never show an incorrect partial full-header count."
  ],
  "patterned-shower-curtain": [
    "Show the full shower opening and complete header with exactly twelve hooks through exactly twelve openings; preserve major floral landmarks through irregular folds and use no top band.",
    "Show a closer partly drawn curtain with the outer header intentionally cropped; preserve motif scale and prevent tiled flower repetition.",
    "Show the full header again with exactly twelve hooks and a different asymmetric drape; every large blossom remains part of the same reference hierarchy.",
    "Use a reverse view from physically open dry tub volume, with the top outside frame and correct thin-polyester light transmission without changing the colorway.",
    "Use a realistic threshold view with all twelve hooks correctly countable or the header clearly outside the frame; never substitute a different floral panel."
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
  status: "queued";
  referenceInputCount: number;
  referencePlan: string;
  requiresPromptCapture: true;
  requestedModel: typeof AFFILIATE_PILOT_V4_REQUESTED_MODEL;
  requestedQuality: typeof AFFILIATE_PILOT_V4_REQUESTED_QUALITY;
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
  referenceInputCount: 3;
  referencePlan: string;
  requiresPromptCapture: true;
  requestedModel: typeof AFFILIATE_PILOT_V4_REQUESTED_MODEL;
  requestedQuality: typeof AFFILIATE_PILOT_V4_REQUESTED_QUALITY;
  sceneId: string;
  qaFocus: string;
  atlasStorageKey: string;
  primarySceneReferenceView: AffiliatePilotV4IdentityView;
};

export type AffiliatePilotV4Job =
  | AffiliatePilotV4IdentityJob
  | AffiliatePilotV4StyledJob;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
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
  const qaFocus = [
    `Identity: ${countableChecklist(selection)}.`,
    `Placement: ${placement}`,
    `Room: ${shot.reflectionPlan}`,
    "Global: correct U.S. electrical devices if visible; complete cabinet handles, doors, plumbing, supports, nonrepeating textures, shared exposure, and no collisions."
  ].join(" ");

  return {
    primarySceneReferenceView,
    qaFocus,
    prompt: [
      PHYSICAL_PHOTO_CONTRACT,
      `Scene identity: ${sceneId}. This exact physical room and composition must not be reused elsewhere in the set.`,
      `Featured product: ${product.name} by ${product.brand}.`,
      `Product identity contract: ${selection.identityPrompt}`,
      `Countable-feature preflight: ${countableChecklist(selection)}.`,
      `Hidden-geometry policy: ${selection.hiddenGeometryPolicy}`,
      `Product placement invariant: ${selection.placementInvariant}`,
      `Scene-specific product placement: ${placement}`,
      `Style direction: ${style.name}. ${style.description}`,
      `Style palette: ${profile.palette}.`,
      `Style architecture: ${profile.architecture}.`,
      `Style-specific lived-in vocabulary: ${profile.livedIn}.`,
      `Composition and camera: ${shot.camera}`,
      `Lighting and weather: ${shot.lighting}`,
      `Human trace and set dressing: ${shot.activity}`,
      `Reflection and door plan: ${shot.reflectionPlan}`,
      `Reference-input contract: input image 1 is the reviewed seven-tile V4 identity atlas containing presentation, front, back, left, right, top, and bottom views of one accepted campaign specimen. Input image 2 is its reviewed ${primarySceneReferenceView} transparent identity view, chosen for this camera. Input image 3 is the reviewed canonical presentation anchor. Use all three only to preserve one exact physical product; never reproduce chroma green, atlas layout, labels, source background, source room, or display hardware.`,
      `Scene-specific QA target: ${qaFocus}`,
      "Final pre-render physical audit: first trace every object's support and center of mass; then trace every wall, floor, sink, tub, shower, glass edge, plumbing run, door swing, cabinet handle, hook, outlet, and switch; then ray-check every mirror; then count the product's exact features; then compare product and room exposure; then compare this room and camera against the other four slots and materially change any repeated setup before rendering.",
      "Constraints: exactly one canonical featured product; safe, functional, plausible placement; no people or hands; no packaging; no invented feature, claim, variation, permanent accessory, label, pattern, finish, or duplicate; no text overlay or watermark.",
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
        status: "queued",
        referenceInputCount:
          selection.privateReferenceCount +
          (identityView === "presentation" ? 0 : 1),
        referencePlan:
          identityView === "presentation"
            ? `Use ${selection.privateReferenceCount} owner-authorized private canonical source image(s).`
            : `Use ${selection.privateReferenceCount} owner-authorized private source image(s) plus the accepted V4 presentation anchor.`,
        requiresPromptCapture: true,
        requestedModel: AFFILIATE_PILOT_V4_REQUESTED_MODEL,
        requestedQuality: AFFILIATE_PILOT_V4_REQUESTED_QUALITY,
        sceneId: null,
        qaFocus: `Exact ${identityView} geometry; ${countableChecklist(selection)}; transparent-edge readiness; no unsupported hidden features.`,
        atlasStorageKey,
        primarySceneReferenceView: null
      });
    });

    inspirationStyles.forEach((style) => {
      for (let slot = 1; slot <= 5; slot += 1) {
        const { prompt, qaFocus, primarySceneReferenceView } =
          buildStyledPrompt(product, selection, style, slot);
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
          referenceInputCount: 3,
          referencePlan:
            "Use the reviewed seven-view identity atlas, the scene-selected orthographic identity view, and the reviewed canonical presentation anchor.",
          requiresPromptCapture: true,
          requestedModel: AFFILIATE_PILOT_V4_REQUESTED_MODEL,
          requestedQuality: AFFILIATE_PILOT_V4_REQUESTED_QUALITY,
          sceneId: `v4-${selection.asin}-${style.slug}-${String(slot).padStart(2, "0")}`,
          qaFocus,
          atlasStorageKey,
          primarySceneReferenceView
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
    styledCount: styledJobs.length,
    generationRequestedCount: jobs.length,
    totalCount: jobs.length,
    target: AFFILIATE_PILOT_V4_TARGET,
    products: productsManifest,
    jobs
  };
}
