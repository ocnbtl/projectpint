import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  AFFILIATE_PILOT_V4_DOSSIER_SCHEMA_VERSION,
  affiliatePilotV4DossierClaimSections,
  validateAffiliatePilotV4Dossier,
  type AffiliatePilotV4DossierClaimBlock,
  type AffiliatePilotV4DossierClaimSection,
  type AffiliatePilotV4PrivateReference
} from "../lib/affiliate-pilot-v4-dossiers.ts";

type CollectedImage = {
  path?: string;
  sourceUrl: string;
  sha256?: string;
  fetchStatus?: string;
};

type CollectedSource = {
  id: string;
  type: string;
  url: string;
  accessedAt: string;
  snapshotPath: string;
  snapshotSha256: string;
  exactAsinPresent: boolean;
  fetchStatus: string;
  images: CollectedImage[];
};

type CollectedProduct = { asin: string; sources: CollectedSource[] };

type ReferenceSelection = {
  sourceId: string;
  ordinals: number[];
  role: AffiliatePilotV4PrivateReference["role"];
};

type DossierConfig = {
  sourceClaims: Record<string, string[]>;
  exactSourceIds: string[];
  blocks: Record<AffiliatePilotV4DossierClaimSection, AffiliatePilotV4DossierClaimBlock>;
  references: ReferenceSelection[];
  explicitUnknowns: Array<{
    field: string;
    handling: string;
    identityCritical: boolean;
  }>;
  contradictions: Array<{
    field: string;
    observation: string;
    resolution: string;
    status: "resolved" | "bounded";
  }>;
};

const confirmed = (claims: string[], sourceIds: string[]): AffiliatePilotV4DossierClaimBlock => ({
  claims,
  sourceIds,
  confidence: "confirmed"
});

const bounded = (claims: string[], sourceIds: string[]): AffiliatePilotV4DossierClaimBlock => ({
  claims,
  sourceIds,
  confidence: "bounded_inference"
});

const configs: Record<string, DossierConfig> = {
  B0829N8C9G: {
    sourceClaims: {
      "oxo-manufacturer": ["exact SKU 13273700", "12-ounce capacity", "materials", "finish", "fill window", "pump geometry"],
      "amazon-exact-asin": ["ASIN linkage and retailer variation check"]
    },
    exactSourceIds: ["oxo-manufacturer", "amazon-exact-asin"],
    blocks: {
      exactSkuIdentity: confirmed(["OXO Good Grips Stainless Steel Soap Dispenser, SKU 13273700, 12-ounce capacity."], ["oxo-manufacturer"]),
      materials: confirmed(["Brushed stainless-steel body with plastic and silicone functional components and a clear lower reservoir/window."], ["oxo-manufacturer"]),
      finish: confirmed(["Fingerprint-resistant brushed stainless, charcoal-gray pump, and a transparent lower section; the lower section is not permanently blue and takes on the soap color only when filled."], ["oxo-manufacturer"]),
      dimensions: confirmed(["Tall countertop-dispenser proportions and 12-ounce capacity are authoritative; generation must preserve the manufacturer-image height-to-width relationship rather than invent a numeric footprint."], ["oxo-manufacturer"]),
      topology: confirmed(["One tapered body, one rounded pump head, one short nearly horizontal forward spout, one wide-mouth upper fill assembly, and one transparent lower reservoir section."], ["oxo-manufacturer"]),
      countableFeatures: confirmed(["One pump head, one forward spout, one clear lower section, and one small OXO mark on the lower front only."], ["oxo-manufacturer"]),
      patternOrGrain: confirmed(["Fine vertical-to-oblique brushed-metal grain with no chrome-like mirror reflection."], ["oxo-manufacturer"]),
      mountingOrSupport: confirmed(["Freestanding countertop product supported by its flat base."], ["oxo-manufacturer"]),
      orientationAndHandedness: confirmed(["In the manufacturer canonical front, the spout projects forward and the small OXO mark sits on the viewer-left lower front; the mark is absent from the rear and sides."], ["oxo-manufacturer"]),
      hiddenGeometry: bounded(["Unshown rear and underside must remain plain continuations of the visible shell and base, without invented controls, feet, labels, or fasteners."], ["oxo-manufacturer"])
    },
    references: [{ sourceId: "oxo-manufacturer", ordinals: [1, 2, 3, 4, 5, 6, 7], role: "canonical_product" }],
    explicitUnknowns: [{ field: "exact underside molding", handling: "Use a plain recessed base silhouette and make no countable underside claim.", identityCritical: false }],
    contradictions: [{ field: "lower reservoir color", observation: "The prior prompt treated the lower band as permanently blue.", resolution: "Manufacturer imagery shows a clear lower reservoir/window; blue is liquid color, not a product finish.", status: "resolved" }]
  },
  B0D2KK6MNS: {
    sourceClaims: {
      "amazon-exact-asin": ["exact ASIN", "terracotta variation", "72-by-72-inch size", "20/80 flax-polyester blend", "twelve grommets and included hooks"],
      "noon-exact-listing": ["title corroboration only; downloaded page assets excluded as unrelated"],
      "ebay-exact-listing": ["listing corroboration"]
    },
    exactSourceIds: ["amazon-exact-asin", "noon-exact-listing", "ebay-exact-listing"],
    blocks: {
      exactSkuIdentity: confirmed(["KOUFALL terracotta-rust linen-look shower curtain, ASIN B0D2KK6MNS, 72 by 72 inches."], ["amazon-exact-asin"]),
      materials: confirmed(["Listing specifies 20% flax linen and 80% polyester fabric with reinforced metal grommets."], ["amazon-exact-asin"]),
      finish: confirmed(["Solid muted terracotta-rust color with visible irregular linen-like weave and a water-resistant textile surface."], ["amazon-exact-asin"]),
      dimensions: confirmed(["72 inches wide by 72 inches long."], ["amazon-exact-asin"]),
      topology: confirmed(["One unlined rectangular panel with plain side seams, reinforced top openings, and one plain bottom hem."], ["amazon-exact-asin"]),
      countableFeatures: confirmed(["Exactly twelve reinforced top openings and twelve included silver ball-bead style hooks when the full header is shown."], ["amazon-exact-asin"]),
      patternOrGrain: confirmed(["No printed motif, border, stripe, ruffle, fringe, tassel, or ombre; only nonperiodic woven texture."], ["amazon-exact-asin"]),
      mountingOrSupport: confirmed(["Suspends by one hook per grommet from a straight shower rod; gravity controls all folds."], ["amazon-exact-asin"]),
      orientationAndHandedness: confirmed(["Front and rear have no handed graphic; seam and grommet positions must remain consistent across views."], ["amazon-exact-asin"]),
      hiddenGeometry: bounded(["Reverse face uses the same solid textile construction; do not invent lining, weights, magnets, or a separate top band."], ["amazon-exact-asin"])
    },
    references: [{ sourceId: "amazon-exact-asin", ordinals: [2, 3, 4, 5, 6, 7, 8], role: "material_pattern" }],
    explicitUnknowns: [{ field: "microscopic reverse-face weave", handling: "Keep the same solid blend and slightly subdued reverse lighting without asserting a coating or lining.", identityCritical: false }],
    contradictions: [{ field: "Noon page assets", observation: "Captured Noon image assets were unrelated site/brand graphics.", resolution: "Retain the text snapshot for corroboration but exclude all Noon images from private generation references.", status: "resolved" }]
  },
  B0DC7VG6Z9: {
    sourceClaims: {
      "bambusi-manufacturer": ["exact current product", "natural bamboo material", "dimensions", "slat and shelf topology", "non-slip feet"],
      "amazon-exact-asin": ["ASIN linkage"],
      "desertcart-exact-asin": ["retailer corroboration"]
    },
    exactSourceIds: ["bambusi-manufacturer", "amazon-exact-asin"],
    blocks: {
      exactSkuIdentity: confirmed(["Bambusi compact bamboo shower bench represented by ASIN B0DC7VG6Z9 and the current manufacturer product page."], ["bambusi-manufacturer", "amazon-exact-asin"]),
      materials: confirmed(["Natural bamboo construction with dark non-slip foot pads."], ["bambusi-manufacturer"]),
      finish: confirmed(["Warm natural bamboo in a matte-to-satin finish with irregular real wood grain."], ["bambusi-manufacturer"]),
      dimensions: confirmed(["Approximately 17 inches wide by 9 inches deep by 17 inches high."], ["bambusi-manufacturer"]),
      topology: confirmed(["Rectangular concave/slightly bowed nine-slat top, four straight slightly splayed legs, open sides, and one lower slatted shelf."], ["bambusi-manufacturer"]),
      countableFeatures: confirmed(["Exactly nine interior front-to-back top slats, eight top gaps, four legs, four dark feet, and one lower shelf."], ["bambusi-manufacturer"]),
      patternOrGrain: confirmed(["Nonrepeating longitudinal bamboo grain and natural color variation; no orange plastic gloss."], ["bambusi-manufacturer"]),
      mountingOrSupport: confirmed(["Freestanding; all four non-slip feet contact one level surface."], ["bambusi-manufacturer"]),
      orientationAndHandedness: confirmed(["No reversible controls; the gently bowed front apron and slat direction define the canonical front."], ["bambusi-manufacturer"]),
      hiddenGeometry: bounded(["Use only simple shelf and leg joinery visible across the manufacturer angles; add no brace, drawer, back, arm, or metal frame."], ["bambusi-manufacturer"])
    },
    references: [{ sourceId: "bambusi-manufacturer", ordinals: [1, 2, 3, 4, 5, 6, 7, 8], role: "topology" }],
    explicitUnknowns: [{ field: "underside fastener placement", handling: "Do not expose or count fasteners; continue the visible bamboo rails conservatively.", identityCritical: false }],
    contradictions: []
  },
  B08TLP2D54: {
    sourceClaims: {
      "umbra-manufacturer": ["Hubba arched mirror", "brass variation", "dimensions", "thin-frame geometry", "mounting context"],
      "amazon-exact-asin": ["ASIN linkage"],
      "aptdeco-exact-asin": ["exact variation corroboration"]
    },
    exactSourceIds: ["umbra-manufacturer", "amazon-exact-asin", "aptdeco-exact-asin"],
    blocks: {
      exactSkuIdentity: confirmed(["Umbra Hubba Arched Wall Mirror, brass variation, ASIN B08TLP2D54, SKU 1017061-104."], ["umbra-manufacturer", "amazon-exact-asin"]),
      materials: confirmed(["Large plain mirror pane with a thin metallic rim and flat rear backing."], ["umbra-manufacturer"]),
      finish: confirmed(["Warm brass rim with restrained soft reflection; no bevel or backlight."], ["umbra-manufacturer"]),
      dimensions: confirmed(["34.25 inches wide by 36.25 inches high by 1.13 inches deep."], ["umbra-manufacturer"]),
      topology: confirmed(["One broad semicircular arch, straight bottom, softly rounded lower corners, thin continuous rim, and one uninterrupted pane."], ["umbra-manufacturer"]),
      countableFeatures: confirmed(["One mirror pane, one thin rim, one arched top, and one straight bottom."], ["umbra-manufacturer"]),
      patternOrGrain: confirmed(["Uniform brass rim and optically plain mirror surface; no pane segmentation or decorative molding."], ["umbra-manufacturer"]),
      mountingOrSupport: confirmed(["Wall-mounted flat and level with concealed rear mounting hardware."], ["umbra-manufacturer"]),
      orientationAndHandedness: confirmed(["Vertically oriented arch with no left-right handed feature."], ["umbra-manufacturer"]),
      hiddenGeometry: bounded(["Rear must remain a simple flat backing with only plausible concealed mounting points; no invented wires, lights, shelf, or exposed brackets."], ["umbra-manufacturer"])
    },
    references: [{ sourceId: "umbra-manufacturer", ordinals: [2, 3, 4, 5, 6, 7, 8], role: "canonical_product" }],
    explicitUnknowns: [{ field: "exact concealed fastener layout", handling: "Keep mounting hardware hidden in presentation and show only a generic flush mounting interface in the rear study.", identityCritical: false }],
    contradictions: []
  },
  B07PFYZ3DP: {
    sourceClaims: {
      "yamazaki-manufacturer": ["product number 4306", "white variation", "metric dimensions", "materials", "three-tier asymmetric topology", "reversible handle", "casters"],
      "amazon-exact-asin": ["ASIN linkage"]
    },
    exactSourceIds: ["yamazaki-manufacturer", "amazon-exact-asin"],
    blocks: {
      exactSkuIdentity: confirmed(["Yamazaki Home Tower Slim Rolling Storage Cart, white, product number 4306, ASIN B07PFYZ3DP."], ["yamazaki-manufacturer", "amazon-exact-asin"]),
      materials: confirmed(["Powder-coated steel body, wood-fiber top board, and nylon casters."], ["yamazaki-manufacturer"]),
      finish: confirmed(["Matte white steel with a natural light wood-fiber top and small white casters."], ["yamazaki-manufacturer"]),
      dimensions: confirmed(["13 cm wide by 47.5 cm deep by 68.5 cm high including casters, approximately 5.1 by 18.7 by 27 inches."], ["yamazaki-manufacturer"]),
      topology: confirmed(["Narrow three-tier body with one solid long-side concealment panel, an open opposite side, a full upper shelf, a shortened middle shelf leaving one tall bay, a full lower shelf, one detachable U-shaped handle, and four casters."], ["yamazaki-manufacturer"]),
      countableFeatures: confirmed(["One wood top, three shelf levels with one shortened middle shelf, one tall bay, one solid long-side panel, one handle, and exactly four casters."], ["yamazaki-manufacturer"]),
      patternOrGrain: confirmed(["Uniform powder coat and subtle longitudinal wood-fiber grain on the top only."], ["yamazaki-manufacturer"]),
      mountingOrSupport: confirmed(["Freestanding rolling cart supported by four nylon casters on a level floor."], ["yamazaki-manufacturer"]),
      orientationAndHandedness: confirmed(["The handle is designed to attach at either short end. A generated seven-view pack must choose one attachment end and keep that single physical assembly consistent across rotations; screen-space position may change with camera rotation."], ["yamazaki-manufacturer"]),
      hiddenGeometry: bounded(["Use complementary manufacturer angles to continue the asymmetric shelf map and solid panel; do not symmetrize compartments or invent drawers and doors."], ["yamazaki-manufacturer"])
    },
    references: [{ sourceId: "yamazaki-manufacturer", ordinals: [1, 2, 3, 4, 5, 6, 7], role: "topology" }],
    explicitUnknowns: [{ field: "minor underside caster fasteners", handling: "Show only the four caster stems and plain frame surfaces supported by the reference angles.", identityCritical: false }],
    contradictions: [{ field: "handle handedness", observation: "The prior prompt treated one handle end as immutable and prohibited mirroring.", resolution: "Manufacturer instructions say the handle may be attached on either left or right; lock one assembly for cross-view consistency without claiming fixed handedness.", status: "resolved" }]
  },
  B07SG7BV11: {
    sourceClaims: {
      "lush-decor-manufacturer": ["exact Blue 72-by-72 variant", "variant SKU 16T003778", "barcode 848742080757", "100% polyester", "unlined construction", "floral motif"],
      "amazon-exact-asin": ["ASIN linkage"],
      "wayfair-blue-72x72": ["blue size corroboration"],
      "macys-72x72": ["size and product-name corroboration"]
    },
    exactSourceIds: ["lush-decor-manufacturer", "amazon-exact-asin", "wayfair-blue-72x72", "macys-72x72"],
    blocks: {
      exactSkuIdentity: confirmed(["Lush Decor Leah Floral Shower Curtain, Blue, 72 by 72 inches, variant SKU 16T003778, barcode 848742080757, ASIN B07SG7BV11."], ["lush-decor-manufacturer", "amazon-exact-asin"]),
      materials: confirmed(["100% polyester, unlined single-panel shower curtain."], ["lush-decor-manufacturer"]),
      finish: confirmed(["White ground printed with loose watercolor teal, aqua, smoky gray, muted taupe, and charcoal flowers and leaves."], ["lush-decor-manufacturer"]),
      dimensions: confirmed(["72 inches wide by 72 inches long for the exact Blue variation."], ["lush-decor-manufacturer"]),
      topology: confirmed(["One rectangular unlined panel with top openings, plain side seams, and one plain lower hem."], ["lush-decor-manufacturer"]),
      countableFeatures: confirmed(["Exactly twelve top openings when the full header is visible, one bottom hem, and no separate top band."], ["lush-decor-manufacturer"]),
      patternOrGrain: confirmed(["Stable large-scale watercolor floral hierarchy; natural folds may occlude it but must not tile, shrink, multiply, or substitute another colorway."], ["lush-decor-manufacturer"]),
      mountingOrSupport: confirmed(["Suspends from one straight shower rod with one hook per opening and gravity-controlled folds."], ["lush-decor-manufacturer"]),
      orientationAndHandedness: confirmed(["Preserve the manufacturer Blue print orientation and major motif landmarks; do not horizontally mirror the print between identity views."], ["lush-decor-manufacturer"]),
      hiddenGeometry: bounded(["Reverse face remains the same unlined polyester panel; do not invent a liner, weights, magnets, or decorative reverse layer."], ["lush-decor-manufacturer"])
    },
    references: [{ sourceId: "lush-decor-manufacturer", ordinals: [1, 2, 3, 4, 5], role: "material_pattern" }],
    explicitUnknowns: [{ field: "reverse-side print saturation", handling: "Preserve motif registration while allowing only physically plausible slight reverse-side attenuation; do not invent a separate lining.", identityCritical: false }],
    contradictions: [{ field: "variant imagery", observation: "The manufacturer page includes yellow, purple, coral, navy, and unrelated recommendation imagery.", resolution: "Only the five hashed files whose filename begins 16T003778-LEAH-BLUE are authorized as generation references.", status: "resolved" }]
  },
  B008X0VM0Q: {
    sourceClaims: {
      "delta-manufacturer": ["model 759460-CZ", "Champagne Bronze finish", "dimensions", "fixed non-pivoting geometry", "manufacturer packshot"],
      "amazon-exact-asin": ["ASIN linkage"]
    },
    exactSourceIds: ["delta-manufacturer", "amazon-exact-asin"],
    blocks: {
      exactSkuIdentity: confirmed(["Delta Trinsic Towel Ring, model 759460-CZ, Champagne Bronze, ASIN B008X0VM0Q."], ["delta-manufacturer", "amazon-exact-asin"]),
      materials: confirmed(["Metal wall accessory with concealed mounting interface."], ["delta-manufacturer"]),
      finish: confirmed(["Warm brushed Champagne Bronze with controlled soft reflection."], ["delta-manufacturer"]),
      dimensions: confirmed(["5-11/16 inches high by 2 inches deep by 6-13/32 inches wide."], ["delta-manufacturer"]),
      topology: confirmed(["Round escutcheon, short cylindrical offset stem, and one fixed non-pivoting rounded-square open C-shaped bar."], ["delta-manufacturer"]),
      countableFeatures: confirmed(["One escutcheon, one stem, one open bar, one lower-left upturned end, and one left-side opening in canonical front."], ["delta-manufacturer"]),
      patternOrGrain: confirmed(["Uniform brushed warm-metal finish with no chrome mirror effect or decorative texture."], ["delta-manufacturer"]),
      mountingOrSupport: confirmed(["Round escutcheon mounts flush to a vertical wall through concealed hardware."], ["delta-manufacturer"]),
      orientationAndHandedness: confirmed(["Canonical front has escutcheon upper left and open return at lower left; the product is fixed, not pivoting or reversible."], ["delta-manufacturer"]),
      hiddenGeometry: bounded(["Rear may show only a simple circular mounting interface; do not invent exposed anchors, face screws, hinges, or a reversible joint."], ["delta-manufacturer"])
    },
    references: [{ sourceId: "delta-manufacturer", ordinals: [1], role: "canonical_product" }],
    explicitUnknowns: [{ field: "concealed bracket screw pattern", handling: "Keep it concealed or render a featureless circular interface in the rear study.", identityCritical: false }],
    contradictions: [{ field: "motion", observation: "Generic towel-ring imagery can imply a pivoting ring.", resolution: "Delta identifies this geometry as fixed; no hinge or pivot is allowed.", status: "resolved" }]
  },
  B000MS63E2: {
    sourceClaims: {
      "home-depot-model-74480": ["exact model 74480", "two-piece champagne marble dish", "product imagery", "dimensions"],
      "amazon-exact-asin": ["ASIN linkage"],
      "walmart-model-74480": ["model and dimension corroboration"],
      "bed-bath-beyond-model-74480": ["material and two-piece construction corroboration"],
      "overstock-model-74480": ["material and two-piece construction corroboration"]
    },
    exactSourceIds: ["home-depot-model-74480", "amazon-exact-asin", "walmart-model-74480", "bed-bath-beyond-model-74480", "overstock-model-74480"],
    blocks: {
      exactSkuIdentity: confirmed(["Creative Home Spa two-piece soap dish in Champagne Marble, model 74480, ASIN B000MS63E2."], ["home-depot-model-74480", "amazon-exact-asin"]),
      materials: confirmed(["Natural champagne marble stone in a fitted two-piece construction."], ["home-depot-model-74480", "bed-bath-beyond-model-74480"]),
      finish: confirmed(["Warm cream-beige natural stone with subtle nonperiodic veins and small fossil-like flecks."], ["home-depot-model-74480"]),
      dimensions: confirmed(["Retail sources describe approximately 5.1-5.2 inches long by 4 inches wide by 1.1 inches high; preserve photographed proportions rather than treating rounding differences as distinct variants."], ["home-depot-model-74480", "walmart-model-74480"]),
      topology: confirmed(["One low rectangular base tray with rounded corners and one removable fitted slatted marble insert."], ["home-depot-model-74480"]),
      countableFeatures: confirmed(["One base, one insert, eight parallel raised bars, seven narrow drainage channels, and four rounded corners."], ["home-depot-model-74480"]),
      patternOrGrain: confirmed(["One consistent natural-stone specimen with stable broad vein landmarks and nonrepeating small flecks across views."], ["home-depot-model-74480"]),
      mountingOrSupport: confirmed(["Freestanding dish sits flat on a fully supporting horizontal surface."], ["home-depot-model-74480"]),
      orientationAndHandedness: confirmed(["Channels run front-to-back in canonical front; no left-right handed mechanism."], ["home-depot-model-74480"]),
      hiddenGeometry: bounded(["Use the simplest flat underside and fitted insert relationship; do not invent drain holes, rubber feet, logos, or fasteners."], ["home-depot-model-74480"])
    },
    references: [{ sourceId: "home-depot-model-74480", ordinals: [1, 2, 3], role: "topology" }],
    explicitUnknowns: [{ field: "retailer dimension rounding", handling: "Treat 5-1/8 and 5.2 inches, and 1-1/8 and 1.1 inches, as rounding of model 74480; use visual proportions.", identityCritical: false }],
    contradictions: [{ field: "drainage count", observation: "Retail prose does not state a bar count.", resolution: "Three exact-model closeups visibly support eight raised bars and seven channels; the count is an image-derived exact-model observation.", status: "resolved" }]
  },
  B0F3L72TC3: {
    sourceClaims: {
      "amazon-exact-asin": ["ASIN linkage"],
      "costa-farms-species": ["Golden Pothos species identity and natural variation boundary"],
      "lowes-10-inch-basket": ["Costa Farms 10-inch hanging-basket category corroboration"],
      "pricehistory-exact-asin": ["exact ASIN", "model L-GNP-G-POT-01-AM", "10-inch basket", "10-by-10-by-36-inch listing dimensions", "exact listing packshot"]
    },
    exactSourceIds: ["amazon-exact-asin", "pricehistory-exact-asin"],
    blocks: {
      exactSkuIdentity: confirmed(["Costa Farms Golden Pothos live plant in hanging grow pot, model L-GNP-G-POT-01-AM, ASIN B0F3L72TC3."], ["pricehistory-exact-asin", "amazon-exact-asin"]),
      materials: confirmed(["Live Epipremnum aureum foliage in a dark ribbed plastic grow pot with attached dark hanger."], ["pricehistory-exact-asin", "costa-farms-species"]),
      finish: confirmed(["Charcoal-black ribbed grow pot; green heart-shaped foliage with irregular yellow-gold variegation."], ["pricehistory-exact-asin", "costa-farms-species"]),
      dimensions: confirmed(["Listing states 10 by 10 by 36 inches overall and a 10-inch hanging basket; live canopy and vine length naturally vary."], ["pricehistory-exact-asin"]),
      topology: confirmed(["One round ribbed grow pot, one attached multi-strand hanger converging at a top hook, and a naturally asymmetric trailing canopy."], ["pricehistory-exact-asin"]),
      countableFeatures: confirmed(["One 10-inch basket, one attached hanger assembly, one top hook, and one representative canopy; leaf count is explicitly variable and not a product claim."], ["pricehistory-exact-asin", "costa-farms-species"]),
      patternOrGrain: confirmed(["Nonperiodic natural leaf placement and irregular golden variegation; never a cloned leaf texture or alternate pothos cultivar."], ["costa-farms-species", "pricehistory-exact-asin"]),
      mountingOrSupport: confirmed(["Hangs from one structurally plausible hook by the attached hanger, or rests fully supported with the hanger retained."], ["pricehistory-exact-asin"]),
      orientationAndHandedness: bounded(["The plant has no commercial handedness. Choose one representative campaign specimen silhouette and preserve its dominant vine directions across the identity pack while allowing tiny natural leaf movement."], ["pricehistory-exact-asin"]),
      hiddenGeometry: bounded(["Basket underside remains a simple dark grow-pot base; do not assert a drainage-hole count that the exact listing does not show."], ["pricehistory-exact-asin"])
    },
    references: [{ sourceId: "pricehistory-exact-asin", ordinals: [1], role: "canonical_product" }],
    explicitUnknowns: [
      { field: "individual shipped plant silhouette", handling: "Use the exact listing image as one representative campaign specimen; do not claim leaf-by-leaf identity for future shipped plants.", identityCritical: false },
      { field: "basket underside drainage-hole count", handling: "Show no countable drain holes in the bottom identity view.", identityCritical: false }
    ],
    contradictions: [{ field: "manufacturer page imagery", observation: "The Costa species page image feed includes unrelated plants and containers.", resolution: "Use the manufacturer snapshot for botanical boundaries only and the exact-ASIN packshot for container and campaign identity.", status: "resolved" }]
  },
  B00176AOKM: {
    sourceClaims: {
      "umbra-manufacturer": ["Aquala Natural current design", "SKU 020390-390", "dimensions", "37-inch extension", "phone holder", "double loofah hook", "wine-glass holder", "middle support", "silicone-protected arms"],
      "amazon-exact-asin": ["ASIN linkage"]
    },
    exactSourceIds: ["umbra-manufacturer", "amazon-exact-asin"],
    blocks: {
      exactSkuIdentity: confirmed(["Umbra Aquala Bathtub Caddy in Natural, current SKU 020390-390, linked to ASIN B00176AOKM."], ["umbra-manufacturer", "amazon-exact-asin"]),
      materials: confirmed(["Natural renewable-source wood tray with chrome-finished metal extension arms and thin silicone slip-resistant contact layers."], ["umbra-manufacturer"]),
      finish: confirmed(["Natural wood with real tone, texture, and grain variation plus restrained chrome arm reflections."], ["umbra-manufacturer"]),
      dimensions: confirmed(["28.13 by 8.63 by 1.25 inches, extending to a maximum of 37 inches."], ["umbra-manufacturer"]),
      topology: confirmed(["Long low wood tray, extendable arms, rectangular outer handles, phone holder, hinged reading support with added middle support, book/tablet ledge, circular stemware opening, and double loofah hook."], ["umbra-manufacturer"]),
      countableFeatures: confirmed(["Two extension arms, two outer handles, one phone holder, one reading support, one middle support, one ledge, one stemware opening, and one double hook."], ["umbra-manufacturer"]),
      patternOrGrain: confirmed(["Longitudinal nonrepeating natural wood grain and staggered board/groove layout; no plastic or uniform procedural texture."], ["umbra-manufacturer"]),
      mountingOrSupport: confirmed(["Both silicone-protected extension arms rest on opposite bathtub rims; the caddy remains level and clear of taps."], ["umbra-manufacturer"]),
      orientationAndHandedness: confirmed(["Preserve manufacturer-view left-right positions of phone holder, reading support, stemware opening, hook, and arm handles across all rotations."], ["umbra-manufacturer"]),
      hiddenGeometry: bounded(["Use manufacturer angles to continue underside rails and extension travel; do not invent legs, extra holes, drawers, hinges, or controls."], ["umbra-manufacturer"])
    },
    references: [{ sourceId: "umbra-manufacturer", ordinals: [2, 3, 4, 5, 6, 7, 8], role: "topology" }],
    explicitUnknowns: [{ field: "minor underside screw pattern", handling: "Keep fasteners visually subordinate and only where supported by the manufacturer angles.", identityCritical: false }],
    contradictions: [{ field: "legacy versus current Aquala features", observation: "Older listings may omit the newer phone holder, double hook, wine-glass holder, or middle support.", resolution: "The current manufacturer SKU 020390-390 geometry governs this run; the dossier records the updated features explicitly.", status: "resolved" }]
  }
};

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function publisherFor(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

function titleFor(asin: string, sourceId: string): string {
  return `${asin} exact-product evidence - ${sourceId.replace(/-/g, " ")}`;
}

const repositoryRoot = process.cwd();
const sourceRoot = path.join(
  repositoryRoot,
  "output",
  "affiliate-pilot",
  "v4",
  "private-evidence",
  "product-sources"
);
const dossierRoot = path.join(
  repositoryRoot,
  "output",
  "affiliate-pilot",
  "v4",
  "private-evidence",
  "product-dossiers"
);
const collection = JSON.parse(
  fs.readFileSync(path.join(sourceRoot, "collection.json"), "utf8").replace(/^\uFEFF/, "")
) as CollectedProduct[];

if (collection.length !== 10 || Object.keys(configs).length !== 10) {
  throw new Error(`Expected ten collected products and ten dossier configs; received ${collection.length} and ${Object.keys(configs).length}.`);
}

let totalReferences = 0;
for (const product of collection) {
  const config = configs[product.asin];
  if (!config) throw new Error(`Missing dossier config for ${product.asin}.`);
  const sourceById = new Map(product.sources.map((source) => [source.id, source]));

  const sources = Object.entries(config.sourceClaims).map(([sourceId, claims]) => {
    const source = sourceById.get(sourceId);
    if (!source || source.fetchStatus !== "captured") {
      throw new Error(`${product.asin} source ${sourceId} is missing or uncaptured.`);
    }
    const snapshotAbsolute = path.join(repositoryRoot, source.snapshotPath);
    if (!fs.existsSync(snapshotAbsolute)) {
      throw new Error(`${product.asin} snapshot is missing: ${source.snapshotPath}`);
    }
    const observedHash = sha256File(snapshotAbsolute);
    if (observedHash !== source.snapshotSha256) {
      throw new Error(`${product.asin} snapshot hash mismatch for ${sourceId}.`);
    }
    return {
      id: source.id,
      title: titleFor(product.asin, source.id),
      url: source.url,
      publisher: publisherFor(source.url),
      accessedAt: source.accessedAt,
      sourceType: source.type,
      exactSkuMatch: config.exactSourceIds.includes(source.id),
      claims,
      snapshotPath: source.snapshotPath,
      snapshotSha256: source.snapshotSha256
    };
  });

  const privateReferences: AffiliatePilotV4PrivateReference[] = [];
  for (const selection of config.references) {
    const source = sourceById.get(selection.sourceId);
    if (!source) throw new Error(`${product.asin} reference source ${selection.sourceId} is missing.`);
    const availableImages = source.images.filter((image) => image.path && image.sha256);
    for (const ordinal of selection.ordinals) {
      const image = availableImages[ordinal - 1];
      if (!image?.path || !image.sha256) {
        throw new Error(`${product.asin} ${selection.sourceId} image ${ordinal} is unavailable.`);
      }
      const absolutePath = path.join(repositoryRoot, image.path);
      if (!fs.existsSync(absolutePath)) throw new Error(`Missing private reference ${image.path}.`);
      if (sha256File(absolutePath) !== image.sha256) {
        throw new Error(`Private reference hash mismatch: ${image.path}.`);
      }
      privateReferences.push({
        path: image.path,
        sha256: image.sha256,
        sourceId: selection.sourceId,
        role: selection.role
      });
    }
  }

  for (const section of affiliatePilotV4DossierClaimSections) {
    if (!config.blocks[section]) throw new Error(`${product.asin} is missing claim block ${section}.`);
  }
  const researchedAt = sources
    .map((source) => source.accessedAt)
    .sort()
    .at(-1) as string;
  const dossier = {
    schemaVersion: AFFILIATE_PILOT_V4_DOSSIER_SCHEMA_VERSION,
    asin: product.asin,
    researchedAt,
    ...config.blocks,
    explicitUnknowns: config.explicitUnknowns,
    contradictions: config.contradictions,
    sources,
    privateReferences,
    readiness: { status: "research_complete" as const, blockers: [] as string[] }
  };
  const validation = validateAffiliatePilotV4Dossier(dossier, product.asin);
  if (!validation.valid) {
    throw new Error(`${product.asin} dossier validation failed:\n${validation.errors.join("\n")}`);
  }
  const productDossierRoot = path.join(dossierRoot, product.asin);
  fs.mkdirSync(productDossierRoot, { recursive: true });
  fs.writeFileSync(
    path.join(productDossierRoot, "dossier.json"),
    `${JSON.stringify(dossier, null, 2)}\n`,
    "utf8"
  );
  totalReferences += privateReferences.length;
  process.stdout.write(`${product.asin}: ${sources.length} claim-linked sources, ${privateReferences.length} hashed references\n`);
}

process.stdout.write(`Built and validated 10/10 exact-product dossiers with ${totalReferences} private references.\n`);
