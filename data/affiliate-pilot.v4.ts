export const affiliatePilotV4Authorization = {
  referenceRightsConfirmed: true,
  generationAuthorized: true,
  fullScaleAuthorized: false,
  sourceImagesPrivateOnly: true,
  regenerateAllPilotAssets: false,
  regenerateAllStyledAssets: true,
  reuseReviewedIdentityAssets: true,
  authorizedAt: "2026-07-31T05:00:00-04:00"
} as const;

export const affiliatePilotV4IdentityViews = [
  "presentation",
  "front",
  "back",
  "left",
  "right",
  "top",
  "bottom"
] as const;

export type AffiliatePilotV4IdentityView =
  (typeof affiliatePilotV4IdentityViews)[number];

export type AffiliatePilotV4Asin =
  | "B0829N8C9G"
  | "B0D2KK6MNS"
  | "B0DC7VG6Z9"
  | "B08TLP2D54"
  | "B07PFYZ3DP"
  | "B07SG7BV11"
  | "B008X0VM0Q"
  | "B000MS63E2"
  | "B0F3L72TC3"
  | "B00176AOKM";

export type AffiliatePilotV4ProductRole =
  | "countertop-dispenser"
  | "solid-shower-curtain"
  | "shower-bench"
  | "wall-mirror"
  | "rolling-cart"
  | "patterned-shower-curtain"
  | "wall-towel-ring"
  | "countertop-soap-dish"
  | "hanging-live-plant"
  | "bathtub-caddy";

export interface AffiliatePilotV4Selection {
  asin: AffiliatePilotV4Asin;
  homeStyleSlug: string;
  productRole: AffiliatePilotV4ProductRole;
  referenceSourceUrls: readonly string[];
  privateReferenceCount: number;
  identityPrompt: string;
  countableFeatures: readonly string[];
  hiddenGeometryPolicy: string;
  placementInvariant: string;
  rationale: string;
}

export const affiliatePilotV4Selections: readonly AffiliatePilotV4Selection[] = [
  {
    asin: "B0829N8C9G",
    homeStyleSlug: "minimalist-elegance",
    productRole: "countertop-dispenser",
    referenceSourceUrls: [
      "https://www.oxo.com/stainless-steel-soap-dispenser-1.html"
    ],
    privateReferenceCount: 1,
    identityPrompt:
      "Exactly one OXO Good Grips stainless-steel soap dispenser. It has a tall gently tapered brushed-stainless body; a charcoal-gray rounded pump head; a short, nearly horizontal forward spout that does not tilt upward; a narrow clear blue-tinted reservoir band at the base; and one small oval OXO mark near the lower-right front of the metal body. Preserve the same taper, height-to-width ratio, pump-to-body scale, short spout length and angle, base band, seam locations, and mark position from every view. The steel is softly brushed and moderately rough, never chrome-bright, mirror-polished, glowing, or independently lit.",
    countableFeatures: [
      "one pump head",
      "one short nearly horizontal spout",
      "one blue-tinted base band",
      "one small oval front mark"
    ],
    hiddenGeometryPolicy:
      "Use the authorized listing and the accepted canonical front geometry to infer only the continuous rear and underside surfaces. Do not invent controls, labels, windows, feet, fasteners, or a second reservoir.",
    placementInvariant:
      "Stand the dispenser vertically on a dry, level, fully supporting vanity, shelf, or tub ledge at ordinary hand-soap scale. Keep its pump easy to reach, its center of mass over the support, and its brushed metal exposed to exactly the same light and white balance as the room.",
    rationale:
      "Re-tests reflective integration, exact spout angle, rotation, exposure, and mirror correspondence."
  },
  {
    asin: "B0D2KK6MNS",
    homeStyleSlug: "boho-earth-tones",
    productRole: "solid-shower-curtain",
    referenceSourceUrls: [
      "https://www.amazon.com/dp/B0D2KK6MNS",
      "https://www.noon.com/uae-en/koufall-boho-shower-curtain-terracotta-rust-colored-linen-fabric-cloth-waterproof-western-bohemian-shower-curtain-set-with-hooks-for-bathroom-decor/Z3CFB7955B4AC6ACDA0EEZ/p/",
      "https://www.ebay.com/itm/147181131187"
    ],
    privateReferenceCount: 1,
    identityPrompt:
      "Exactly one 72-by-72-inch full-length solid muted terracotta-rust linen-blend shower curtain. It has a subtle irregular woven texture, exactly twelve reinforced top openings, plain side seams, and one plain weighted bottom hem. It has no separate top band. When hung, use exactly twelve separate simple silver hooks on one straight wall-mounted rod, tiny natural sags between suspension points, unequal fold widths and depths, cross-grain wrinkles, and changing fold amplitude from top to hem. Never convert the folds into repeated tubes or fractals and never add a pattern, stripe, border, ruffle, tassel, fringe, tieback, embroidery, ombre, valance, extra panel, or alternate color.",
    countableFeatures: [
      "exactly twelve reinforced top openings",
      "exactly twelve hooks when fully visible",
      "one plain bottom hem",
      "no separate top band"
    ],
    hiddenGeometryPolicy:
      "The reverse face uses the same solid color and weave with normal seam construction. Side, top, and bottom studies describe real fabric thickness and hems without inventing lining, magnets, weights, grommets, or decorative layers not supported by the reference.",
    placementInvariant:
      "Hang the curtain from one straight, structurally mounted rod over a complete functional tub or shower. Every visible opening has one hook, gravity controls every fold, the hem clears or naturally approaches the tub/floor, and the camera occupies real accessible space.",
    rationale:
      "Re-tests exact twelve-point construction, nonrepeating fabric deformation, and architectural plausibility."
  },
  {
    asin: "B0DC7VG6Z9",
    homeStyleSlug: "japandi",
    productRole: "shower-bench",
    referenceSourceUrls: [
      "https://www.bambusi.com/products/bamboo-shower-bench-small-shower-stool-with-storage-shelf-non-slip-shower-seat-bathroom-bench-spa-decor-wooden-shower-bench-foot-rest-shaving-stool-for-shower-suitable-for-indoor-outdoor-use"
    ],
    privateReferenceCount: 1,
    identityPrompt:
      "Exactly one compact natural-bamboo Bambusi shower bench, approximately 17 inches wide by 9 inches deep by 17 inches high. Preserve the authorized geometry: a rectangular top with exactly nine front-to-back bamboo slats and eight dark gaps; a rounded outer top frame; a gently bowed front apron; four slightly splayed straight legs with small dark non-slip feet; open sides; and the same single lower open slatted shelf and joinery. The bamboo is matte-to-satin with stochastic natural grain, never glossy, flat, plastic, orange, arched, semicircular, or independently bright.",
    countableFeatures: [
      "exactly nine front-to-back top slats",
      "exactly eight top gaps",
      "four straight legs",
      "four dark feet",
      "one lower open shelf"
    ],
    hiddenGeometryPolicy:
      "Infer unseen joinery only as the simplest continuation of the authorized reference. Do not add braces, drawers, a third shelf, a back, arms, cushions, metal framing, curved legs, or decorative cutouts.",
    placementInvariant:
      "Set all four feet on one level dry or plausibly wet floor with clearance from glass, walls, vanities, and drains. Props may rest on the top or lower shelf only when fully supported and may never conceal the nine-slat identity in every image.",
    rationale:
      "Re-tests exact slat direction and count, shelf geometry, material roughness, contact, and exposure."
  },
  {
    asin: "B08TLP2D54",
    homeStyleSlug: "modern-marble",
    productRole: "wall-mirror",
    referenceSourceUrls: [
      "https://www.umbra.com/products/hubba-arched-wall-mirror"
    ],
    privateReferenceCount: 1,
    identityPrompt:
      "Exactly one Umbra Hubba arched wall mirror in brass, approximately 34.25 inches wide, 36.25 inches high, and 1.13 inches deep. Preserve its broad smooth semicircular arch top, straight flat bottom, softly rounded lower corners, very thin continuous metallic-brass rim, shallow wall depth, and one large uninterrupted plain mirror pane. Never add a bevel, shelf, hooks, segmented panes, pointed top, crest, ornate molding, thick gold frame, backlight, or alternate finish.",
    countableFeatures: [
      "one uninterrupted mirror pane",
      "one continuous thin brass rim",
      "one arched top",
      "one straight bottom"
    ],
    hiddenGeometryPolicy:
      "The rear reference study may show only a simple flat backing and plausible concealed mounting points supported by the manufacturer geometry. Do not invent visible brackets, wires, lights, shelves, or decorative hardware.",
    placementInvariant:
      "Mount the mirror flat and level on a structurally plausible wall above a usable vanity. Its reflection must be a correct ray-consistent view of the room opposite it, including the featured product when geometry requires, with no camera, phantom doorway, duplicated fixture, or texture mismatch.",
    rationale:
      "Re-tests exact thin-frame identity, mounting scale, doors, switches, and physically coherent reflections."
  },
  {
    asin: "B07PFYZ3DP",
    homeStyleSlug: "scandinavian-clean",
    productRole: "rolling-cart",
    referenceSourceUrls: [
      "https://www.yamazakihome.com/en-kr/products/h10365"
    ],
    privateReferenceCount: 3,
    identityPrompt:
      "Exactly one Yamazaki Home Tower Slim Rolling Storage Cart in white, approximately 5.1 inches wide, 18.7 inches long, and 27 inches high including casters. Preserve the asymmetric reference topology: a narrow tall powder-coated white-steel body; one natural light-wood rectangular top; one solid concealment panel along one long side; one open opposite long side; one full-width upper shelf directly below the wood top; one shortened middle shelf occupying roughly two-thirds of the length and leaving one tall open bay; one full-width bottom shelf; one U-shaped pull handle at one short end; and exactly four small white nylon casters. Never mirror the asymmetry, widen it, equalize the compartments, change shelf count, add drawers or doors, hide casters, curve the body, or turn it into a generic trolley.",
    countableFeatures: [
      "one wood top",
      "one full-width upper shelf",
      "one shortened middle shelf",
      "one tall open bay",
      "one full-width bottom shelf",
      "one solid long-side panel",
      "one U-shaped end handle",
      "exactly four casters"
    ],
    hiddenGeometryPolicy:
      "All six orthographic views must agree on the same non-mirrored compartment map. Use only the complementary owner-authorized manufacturer views to resolve hidden edges; do not symmetrize or improvise internal shelves.",
    placementInvariant:
      "Put all four casters on one level dry floor with the narrow body clear of walls, doors, shower glass, and toilet. Shelf loads must fit completely inside the real compartments and may not hide the shortened-middle-shelf/tall-bay topology in every image.",
    rationale:
      "Re-tests the hardest V3 identity failure using a complete orthographic reference pack and topology checklist."
  },
  {
    asin: "B07SG7BV11",
    homeStyleSlug: "vintage-eclectic",
    productRole: "patterned-shower-curtain",
    referenceSourceUrls: [
      "https://www.lushdecor.com/collections/84-inch-shower-curtains/products/leah-shower-curtain"
    ],
    privateReferenceCount: 1,
    identityPrompt:
      "Exactly one Lush Decor Leah Floral Shower Curtain in the approved blue 72-by-72-inch variation. Preserve the white polyester ground and the same large loose watercolor flowers and leaves in teal, aqua blue, smoky gray, muted taupe, and soft charcoal from the authorized reference. Preserve the major motif scale and placement hierarchy, exactly twelve top openings, plain side seams, and one plain bottom hem with no separate top band. Natural folds may occlude print regions but must not turn the motif into a tiled repeat or repeated fractal. Never shrink or multiply the flowers, invent different blossoms, add a border, stripe, ruffle, tassel, fringe, tieback, valance, or alternate colorway.",
    countableFeatures: [
      "exactly twelve top openings",
      "exactly twelve hooks when fully visible",
      "one plain bottom hem",
      "no top band",
      "one stable large-scale floral motif hierarchy"
    ],
    hiddenGeometryPolicy:
      "Use the same printed reverse appearance supported by the thin polyester construction. Side, top, and bottom views describe the fabric and hems without inventing lining, weights, magnets, or decoration.",
    placementInvariant:
      "Hang the curtain from one straight wall-mounted rod over a complete functional tub or shower. Keep the exact floral hierarchy recognizable through nonrepeating folds, use all twelve hooks when the full header is visible, and never place the camera in a wall.",
    rationale:
      "Re-tests the strong V3 textile result while hardening motif, hook-count, hem, and top-band accuracy."
  },
  {
    asin: "B008X0VM0Q",
    homeStyleSlug: "brass-terrazzo",
    productRole: "wall-towel-ring",
    referenceSourceUrls: [
      "https://www.deltafaucet.com/bathroom/product/759460-CZ.html"
    ],
    privateReferenceCount: 2,
    identityPrompt:
      "Exactly one Delta Trinsic model 759460-CZ fixed towel ring in Champagne Bronze, 5-11/16 inches high by 2 inches deep by 6-13/32 inches wide. Preserve the round wall escutcheon, short cylindrical offset stem, and one fixed non-pivoting rounded-square open C-shaped bar. In the canonical front orientation, the escutcheon is at the upper left; the bar runs right, bends down, runs left across the bottom, and ends in one short upward return at the lower left, leaving one deliberate opening on the left. The warm brushed champagne-bronze finish is continuous and softly reflective. Never close the ring, mirror its handedness, pivot it, add a hinge, double bar, square backplate, fastener on the face, or alternate finish.",
    countableFeatures: [
      "one round escutcheon",
      "one offset stem",
      "one fixed open C-shaped bar",
      "one lower-left upturned end",
      "one left-side opening"
    ],
    hiddenGeometryPolicy:
      "The rear view may show only the circular mounting interface and simplest concealed bracket relationship supported by Delta documentation. Do not invent exposed anchors, screws, hinges, or a reversible joint.",
    placementInvariant:
      "Mount the round escutcheon flush to a vertical wall at practical hand-towel height, with the fixed handed orientation unchanged. A towel may hang naturally through the open frame without floating, clipping, hiding the entire bar, or pulling the mount away from the wall.",
    rationale:
      "Adds fixed wall hardware, handed geometry, small countable construction, and metal exposure."
  },
  {
    asin: "B000MS63E2",
    homeStyleSlug: "modern-marble",
    productRole: "countertop-soap-dish",
    referenceSourceUrls: [
      "https://business.walmart.com/ip/Creative-Home-Marble-Bullet-Soap-Dish/31031128",
      "https://www.homedepot.com/p/Creative-Home-Spa-2-Piece-Soap-Dish-in-Champagne-Marble-74480/303845543"
    ],
    privateReferenceCount: 3,
    identityPrompt:
      "Exactly one Creative Home two-piece rectangular soap dish in natural champagne marble, approximately 5.2 inches long by 4 inches wide by 1.1 inches high. Preserve one low rectangular base tray with softly rounded corners and one removable fitted slatted marble insert. The insert has exactly eight parallel raised marble bars with seven narrow drainage channels running front-to-back in the canonical front view. Keep the warm cream-beige Java-marble color with subtle nonrepeating natural veins and small fossil-like flecks; every generated angle represents the same stone specimen and the same vein landmarks. Never make it oval, round, plastic, ceramic, one-piece, deeply ribbed, perforated, footed, metallic, or a generic marble slab.",
    countableFeatures: [
      "one rectangular base tray",
      "one removable insert",
      "exactly eight raised bars",
      "exactly seven drainage channels",
      "four softly rounded corners"
    ],
    hiddenGeometryPolicy:
      "Use the simplest flat underside and fitted two-piece relationship consistent with the authorized views. Do not invent drain holes, rubber feet, logos, fasteners, cavities, or an extra tray if they are not visible in the reference set.",
    placementInvariant:
      "Place the complete two-piece dish flat on a dry, level, fully supporting vanity or tub ledge. A single soap bar may rest across the raised bars without obscuring the entire insert; water may collect only plausibly, and the stone shares the room exposure.",
    rationale:
      "Adds small two-piece natural-stone geometry, exact drainage count, stable placement, and nonrepeating material identity."
  },
  {
    asin: "B0F3L72TC3",
    homeStyleSlug: "spa-greenery",
    productRole: "hanging-live-plant",
    referenceSourceUrls: [
      "https://www.amazon.com/dp/B0F3L72TC3",
      "https://www.lowes.com/pd/Costa-Farms-Easy-To-Grow-Devil-s-Ivy-Golden-Pothos-House-Plant-in-10-in-Hanging-Basket/1001047690"
    ],
    privateReferenceCount: 3,
    identityPrompt:
      "Exactly one representative Costa Farms Golden Pothos (Epipremnum aureum) in the approved 10-inch black hanging grower basket. Preserve one ribbed dark charcoal-black round plastic basket, one attached three-point dark hanger converging at one top hook, dense naturally asymmetrical trailing vines, and broad heart-shaped green leaves with irregular yellow-gold variegation. The seven-view identity pack defines one representative specimen for this campaign, so preserve its dominant vine directions, canopy width, basket shape, hanger geometry, and recognizable leaf clusters across generated scenes while allowing only tiny natural leaf motion. Never change it to neon pothos, marble queen, philodendron, ivy, fern, artificial plant, ceramic pot, macrame planter, or a different basket.",
    countableFeatures: [
      "one 10-inch ribbed black basket",
      "one three-point hanger",
      "one top hook",
      "one stable representative canopy and vine silhouette",
      "heart-shaped green-and-gold leaves"
    ],
    hiddenGeometryPolicy:
      "The bottom view may show only the simple basket base and drainage geometry supported by the authorized retailer reference. Leaf-by-leaf identity is not a product claim because shipped live plants vary; preserve the campaign specimen's large-scale silhouette rather than cloning every leaf.",
    placementInvariant:
      "Suspend the hanger from one structurally plausible ceiling or wall hook, or place the basket fully supported on a shelf only when the hanger remains attached. Keep foliage clear of open flame, electrical fixtures, and shower spray, and never imply pet safety.",
    rationale:
      "Adds an organic variable product while defining the boundary between exact container identity and honest live-plant variation."
  },
  {
    asin: "B00176AOKM",
    homeStyleSlug: "spa-greenery",
    productRole: "bathtub-caddy",
    referenceSourceUrls: [
      "https://www.umbra.com/products/aquala-bathtub-caddy"
    ],
    privateReferenceCount: 4,
    identityPrompt:
      "Exactly one Umbra Aquala extendable bathtub caddy in the Natural finish, approximately 28.13 inches long by 8.63 inches wide by 1.25 inches high, extending to a maximum of 37 inches. Preserve the long low natural-wood tray; its staggered slatted upper boards and lengthwise grooves; the central hinged reading support bar and book/tablet ledge; one narrow phone slot; one circular stemware opening near the right; one double loofah hook; and two slim chrome-finished wire extension arms with rectangular outer handles and silicone contact protection. Preserve the exact left-right feature positions from the authorized manufacturer views. Never turn it into a flat plank, generic slatted bridge, folding table, solid metal rack, serving tray with legs, or a different caddy.",
    countableFeatures: [
      "one long low wood tray",
      "two extendable wire arms",
      "two rectangular outer handles",
      "one reading support bar",
      "one phone slot",
      "one circular stemware opening",
      "one double loofah hook"
    ],
    hiddenGeometryPolicy:
      "Use the four authorized manufacturer views to resolve underside rails, extension travel, and feature positions. Do not invent legs, extra slots, extra cup holes, drawers, hinges, hardware, or mirrored controls.",
    placementInvariant:
      "Bridge the caddy across a real bathtub with both silicone-protected extension arms fully supported on opposite dry rim edges. Keep it level, clear of taps, and never floating over water. Any book, bottle, candle, glass, or cloth must use an actual supported feature without blocking the complete product identity.",
    rationale:
      "Adds a wide asymmetric extendable product with multiple fixed features, dual-rim support, and strict water-adjacent physics."
  }
] as const;

export const affiliatePilotV4RealismReset = {
  contractVersion: "affiliate-pilot-real-bathroom-v4.25",
  supersedesPromptVersion: "affiliate-pilot-identity-physical-photo-v4",
  supersedesGenerationVersion: "pilot-2026-07-27-run-04",
  resetAuthorizedAt: "2026-07-31T05:00:00-04:00",
  resetScope: "all 600 styled bathroom scenes",
  preserveReviewedIdentityAssets: true,
  preserveSupersededEvidence: true,
  reason:
    "Owner review found AI-stock polish, repeated lighting and room formulas, literal style stereotypes, procedural material texture, repeated curtain folds, and an unsustainable retry/compositing rate.",
  rootCauseRevision:
    "Two prompt-only proof retries showed that generated curtain identities propagated synthetic folds and incorrect header counts. Exact-product evidence, de-staging, one-use room plates, and deformation-gated supports corrected material, composition, and gravity. Four native header passes could not preserve twelve visible positions, so styled scenes keep the complete countable header outside frame while reviewed identities remain authoritative. Removing generated identity drapes from final conditioning stopped their periodic silhouette from returning. Scene 04 then exposed two more root failures. A room plate showing the complete shower alcove lintel made outside-frame suspension physically impossible, so every textile plate now intersects the shower below the would-be suspension line. After that correction, forcing multiple large mid-body direction changes alternated between repeated vertical tubes and an implausible diagonal swag with a short free hem. Textile variation was constrained to quiet gravity. Scene 05 then proved that below-suspension framing alone is insufficient: an oversized foreground towel can occupy the exact product insertion strip, and incidental generated receptacles can violate the wet-area electrical gate. Every room plate now reserves a continuous clear insertion corridor from the top frame into the tub, keeps all human traces and foreground intrusions on the opposite side, caps those intrusions at eight percent of frame area, and omits electrical devices unless a manifest scene explicitly requires a code-safe GFCI. Its next fresh plate passed every room gate but filled the reserved corridor with a white shower liner. Throwing away an otherwise valid room and generating another complete room would repeat the high-cost failure pattern. The room-plate retry path may therefore use one provider-native same-scene correction of a reviewed near-pass, changing only documented hard-reject pixels while preserving every passing room pixel. Scene 01 then reproduced three nearly equal full-height fold lanes in both allowed V4.17 body-support attempts, including the targeted retry. The remaining root cause was the support generator still receiving a front identity image whose periodic catalog fold map contradicted the text instruction to discard it. V4.18 prohibits any generated identity-drape pixel from conditioning a solid-curtain body support. Solid supports receive only the reviewed exact-product material crop and must form a mostly relaxed broad sheet with a single fading asymmetric displacement rather than a requested row of compressions. Patterned supports retain their reviewed identity only for motif topology until equivalent flat source evidence exists. Local compositing, reuse across scenes, and broad restaging remain forbidden.",
  roomPlateRootCauseRevision:
    "Fresh room plates for scenes 01, 02, and 03 independently defaulted to coordinated plants, baskets, vases, shelves, display towels, bottles, trays, and matching textiles even though their insertion corridors and phone lighting were otherwise usable. The shared prompt simultaneously requested style vocabulary, a lived-in list, the assigned human trace, and at least two additional signs of use. That additive object language overpowered the anti-vignette sentence. V4.19 removes optional movable style vocabulary and additional trace invention from textile room plates. Style may appear only through one fixed architectural or material cue, assigned human traces are an exact ceiling rather than a minimum, decorative objects are zero, and the room must pass an explicit five-group movable-object audit before output. Scene 04 then exposed a deterministic safety contradiction: its lighting recipe allowed a table lamp while the wet-area gate prohibited portable electrical devices. The provider placed the lamp on the vanity. V4.20 replaces that recipe with a code-safe hardwired shaded wall sconce outside the wet zone, forbids visible supply hardware, and replaces the unrelated foliage-only material recipe with ordinary painted-plaster, laminate, and caulk variation that can govern any bathroom without inventing decor. Pre-final compatibility review then found that the shared room-plate builder still forced every camera onto dry floor while slot 04 explicitly requires an oblique reverse curtain view from authorized dry tub volume. V4.21 made that camera volume scene-aware, and V4.22 defined the physically correct foreground occlusion plane. The two allowed V4.22 finals then exposed a more fundamental scalability failure: the first kept the curtain inside the plane but reverted to a staged room and repeated folds, while the correction preserved the room and broad body only by expanding the near-lens curtain to almost half the frame. An inside-tub reverse view inherently puts a full-height textile too close to the phone and fights the room-first requirement. V4.23 retires reverse-view curtain scenes and replaces slot 04 with a low accessible dry-floor exterior side view. All textile scenes again use the simpler rigid empty corridor, and slot 04 caps the curtain silhouette at the far-side eighteen-to-thirty-percent of frame width. The resulting five-scene visual proof then isolated the remaining retry cause in the final edit: the generic locked-base language still allowed the provider to redraw room geometry and reinterpret an accepted broad body as several parallel channels on its first Scene 05 pass. A constrained retry succeeded only after declaring the room plate immutable, enumerating the preservation boundary, and making room redraw plus a second full-height textile channel the two explicit hard gates. V4.24 consolidates that successful correction into every hidden-header final prompt and adds exact-canvas, immutable-base, and room-redraw execution gates before the workflow advances.",
  nonTextileRootCauseRevision:
    "The first OXO hard-product scene proved that the room-first reset works for non-textiles, but both allowed direct attempts failed small identity or secondary-object gates. Attempt one produced a strong candid room while omitting the canonical lower-right oval mark and adding a competing pump bottle. Attempt two produced another strong room but collapsed the short forward spout into a cap, misplaced the mark, and added labeled pump bottles and pseudo-text despite the direct prompt. Regenerating a third whole room would discard passing camera, light, architecture, material, and human-trace evidence while leaving the small-region failure mechanism unchanged. V4.25 strengthens the secondary-object invariant and adds one provider-native same-scene near-pass correction lane for non-textiles. The correction uses the preserved near-pass as an immutable base, the reviewed atlas, and the primary orthographic identity view; it may edit only documented hard-reject pixels, must preserve every passing room pixel, may remove same-category or label-bearing ambiguity, and cannot be reused or composited.",
} as const;

export const affiliatePilotV4ExecutionPolicy = {
  providerAttemptBudgetPerAsset: 2,
  providerAttemptBudgetResetsOnlyAfterLoggedRootStrategyRevision: true,
  providerAttemptBudgetPerFiveSceneSet: 12,
  systemicFailureThreshold: 3,
  reusableProductCompositeAllowed: false,
  localPixelSurgeryAllowed: false,
  localCropAllowedOnlyWhenManifestExplicitlyAuthorizesIt: true,
  contactSheetGateRequiredBeforeNextSet: true,
  directProviderFinalPreferred: true,
  rootCauseRevisionRequiredAfterSystemicFailure: true,
  exactProductSourceReferenceRequiredForTextiles: true,
  sourceReferenceCropAllowedForOverlayExclusionOnly: true,
  sourceReferenceCropMustBeLogged: true,
  maxReferenceInputsForTextiles: 3,
  oneUseSceneSpecificTextileBodySupportRequired: true,
  solidTextileBodySupportInputCount: 1,
  solidTextileBodySupportIdentityDrapeInputAllowed: false,
  patternedTextileBodySupportInputCount: 2,
  textileBodySupportBroadFaceMinimumFraction: 0.7,
  textileBodySupportMaximumFullHeightCompressionChannels: 1,
  textileBodySupportFullHeightParallelChannelsAreHardReject: true,
  textileBodySupportMinimumMidBodyDeformationBreaks: 1,
  textileBodySupportRequiresMultiHeightSilhouetteChanges: true,
  textileBodySupportCompressionOrigin: "suspension_above_frame_only",
  textileBodySupportUnsupportedLateralPinchIsHardReject: true,
  textileBodySupportQuietGravityRequired: true,
  textileBodySupportLargeDiagonalTroughIsHardReject: true,
  textileBodySupportFoldVariationMode:
    "mostly_relaxed_broad_face_with_single_fading_asymmetric_displacement",
  textileFinalFreeHemAtOrAboveTubRimIsHardReject: true,
  textileFinalImmutableRoomPlateBaseRequired: true,
  textileFinalRoomPlateGeometryRedrawIsHardReject: true,
  textileFinalSecondFullHeightChannelIsHardReject: true,
  textileFinalExactCanvasRequired: true,
  textileFinalIdentityDrapeReferenceAllowed: false,
  reviewedBodySupportCarriesIdentityToTextileFinal: true,
  oneUseSceneSpecificHeaderCountSupportRequiredForFullHeader: false,
  oneUseSceneSpecificRoomPlateRequiredForFullHeader: false,
  oneUseSceneSpecificRoomPlateRequiredForStyledTextiles: true,
  textileRoomPlateMustEnterFrameBelowSuspensionLine: true,
  textileRoomPlateVisibleCompleteShowerLintelIsHardReject: true,
  textileRoomPlateClearInsertionCorridorRequired: true,
  textileRoomPlateHumanTracesMustAvoidInsertionCorridor: true,
  textileRoomPlateMaximumForegroundIntrusionFrameFraction: 0.08,
  textileRoomPlateDecorativeObjectCount: 0,
  textileRoomPlateMaximumMovableObjectGroups: 5,
  textileRoomPlateAdditionalHumanTraceCount: 0,
  textileRoomPlateStyleCueMode:
    "one_fixed_architectural_or_material_cue_only",
  textileRoomPlateElectricalDevicePolicy:
    "omit_unless_manifest_explicitly_requires_code_safe_gfci",
  textileRoomPlatePracticalLightingPolicy:
    "hardwired_fixture_outside_wet_zone_with_no_visible_supply_hardware",
  textileRoomPlateCameraVolumeMustMatchFinalPlacement: true,
  textileStyledReverseViewEnabled: false,
  textileSlot04ExteriorSideViewRequired: true,
  providerNativeRoomPlateCorrectionAllowed: true,
  roomPlateSecondAttemptMayCorrectSameSceneNearPass: true,
  roomPlateCorrectionInputCount: 1,
  roomPlateCorrectionProviderAttemptBudget: 1,
  roomPlateCorrectionRequiresFullSizeReviewedSameSceneSource: true,
  roomPlateCorrectionMustPreservePassingPixels: true,
  roomPlateCorrectionReuseAllowed: false,
  roomPlateCorrectionCompositingAllowed: false,
  supportReferenceProviderAttemptBudget: 2,
  roomPlateProviderAttemptBudget: 2,
  supportReferenceReuseAllowed: false,
  supportReferenceCompositingAllowed: false,
  roomPlateReuseAllowed: false,
  providerNativeRoomPlateEditRequiredForFullHeader: false,
  providerNativeRoomPlateEditRequiredForStyledTextiles: true,
  providerNativeHeaderAuditEditRequiredForFullHeader: false,
  providerNativeHeaderAuditEditAttemptBudget: 2,
  providerNativeHeaderAuditEditReuseAllowed: false,
  providerNativeNonTextileNearPassCorrectionAllowed: true,
  nonTextileNearPassCorrectionInputCount: 3,
  nonTextileNearPassCorrectionProviderAttemptBudget: 1,
  nonTextileNearPassCorrectionRequiresFullSizeReviewedSameSceneSource: true,
  nonTextileNearPassCorrectionMustPreservePassingPixels: true,
  nonTextileNearPassCorrectionMayEditOnlyDocumentedHardRejectPixels: true,
  nonTextileNearPassCorrectionReuseAllowed: false,
  nonTextileNearPassCorrectionCompositingAllowed: false,
  nonTextileSecondSameCategoryObjectIsHardReject: true,
  nonTextileLabelBearingSecondaryObjectIsHardReject: true,
  styledTextileHeaderVisibilityPolicy: "entire_countable_header_outside_frame",
  reviewedIdentityEvidenceRequiredForExactHeaderCount: true,
  visibleCountableTextileHeaderIsHardReject: true,
  headerCountProviderLimitationObserved: true,
  reviewedIdentityBodyCropAllowedForInvisibleHeaderOnly: true
} as const;

export const affiliatePilotV4CameraRecipes = [
  "iPhone 15 Pro main 1x camera, 24 mm equivalent, held at chest height with a slight one-degree roll and mild uncorrected vertical convergence; no tripod and no portrait mode.",
  "iPhone 14 main 1x camera, about 26 mm equivalent, held one step inside the doorway and a little off center; one architectural edge may be loosely clipped.",
  "iPhone 15 Pro 2x camera, about 48 mm equivalent, used from across reachable dry floor for a compressed candid detail that still reads as part of a room.",
  "iPhone 13 mini main camera, about 26 mm equivalent, held around upper-waist height after stepping around an ordinary obstacle; accept a slightly loose crop.",
  "iPhone 15 Pro 0.5x camera, about 13 mm equivalent, used only because the bathroom is genuinely tight; retain modest edge stretch and do not perfectly correct the verticals.",
  "iPhone 14 Pro main 1x camera, 24 mm equivalent, from seated or low standing height with a real foreground edge creating depth; keep background detail rather than fake bokeh.",
  "iPhone 15 main 1x camera, about 26 mm equivalent, held just below shoulder height with a small downward tilt and natural auto-leveling that is not geometrically perfect.",
  "iPhone 13 main 1x camera, about 26 mm equivalent, quickly framed in portrait orientation so a towel, jamb, or cabinet edge intrudes slightly without hiding the product.",
  "iPhone SE main camera, about 28 mm equivalent, with more limited highlight recovery, visible fine shadow noise, and ordinary computational sharpening.",
  "iPhone 15 Pro main 1x camera, 24 mm equivalent, captured like a Live Photo moment with tiny hand-position imperfection and no artificial depth isolation."
] as const;

export const affiliatePilotV4LightingRecipes = [
  "Cloudy north-window daylight with the electric lights off; the window is a little brighter than the room and shadow corners retain fine phone noise.",
  "Low early-morning sun entering from one side, creating one imperfect hard-edged patch and partial highlight clipping while the rest of the room stays cooler.",
  "Rainy midday window light with subdued contrast, a slightly cool automatic white balance, and no warm practical light.",
  "One ordinary warm wall sconce at dusk plus faint cool window spill; mixed white balance is visible but not stylized or teal-orange.",
  "Nighttime household overhead light only, with realistic falloff, darker corners, and no cinematic fill or glowing product.",
  "Late-afternoon light partly blocked by a neighboring building or tree, producing irregular bands that continue across product and room.",
  "Bright overcast daylight from an open door with the window outside frame; exposure favors the room and allows one small bright boundary.",
  "A single code-safe hardwired shaded wall sconce on a dry wall outside the wet zone before sunrise, with no visible cord, plug, junction, outlet, switch, or supply hardware; muted warm light, weak ambient blue, and ordinary phone shadow noise.",
  "Midday light through a practical roller shade, with uneven fabric transmission, soft edge falloff, and neutral auto white balance.",
  "Recently switched-on vanity light mixed with residual daylight; imperfect household color temperatures remain instead of being professionally neutralized."
] as const;

export const affiliatePilotV4RoomHistoryRecipes = [
  "A compact owner-occupied bathroom updated in stages: safe recent plumbing beside one retained older finish and small signs of ordinary use.",
  "A modest rental bathroom with sound but not luxurious fixtures, painted trim, practical storage, and one reversible personal improvement.",
  "A 1990s family bathroom selectively refreshed rather than gut-renovated, with believable cabinet depth and a little wear at high-touch edges.",
  "A narrow city apartment bathroom whose layout solves real space constraints, with no showroom-scale clearances or oversized fixtures.",
  "A small bungalow bathroom retaining one period detail while the wet-zone construction and plumbing are current and safe.",
  "A townhouse guest bathroom that is clean but lightly used, with one mismatched household item and restrained decoration.",
  "A busy shared bathroom after a quick tidy, with complete circulation and storage but not every textile or object perfectly aligned.",
  "A practical basement or secondary bathroom improved by its owner, with honest ventilation, simple materials, and no luxury staging.",
  "An older ensuite with accumulated furniture-like storage and repaired finishes, photographed as it actually exists rather than styled for sale.",
  "A recently renovated ordinary bathroom already showing normal life: softened towels, a water mark or two, and slight variation in grout or paint sheen."
] as const;

export const affiliatePilotV4HumanTraceRecipes = [
  "One hand towel hangs a little unevenly and a plain toothbrush cup has been set down slightly off square.",
  "One drawer remains open by two or three inches and a folded washcloth is not perfectly aligned with the counter edge.",
  "A bath mat sits slightly skewed after use and one plain pump bottle is turned away from the camera.",
  "A robe or towel carries one natural compressed fold, while slippers point in different directions but remain fully supported.",
  "A small damp patch darkens part of one towel and a plain soap bar shows one softened used edge.",
  "A cabinet door is almost, but not completely, closed and one everyday grooming object rests where a person actually left it.",
  "A drinking glass or ceramic cup sits near the sink with a faint water ring; nearby objects are spaced irregularly rather than decoratively.",
  "A child's bath toy, step stool, contact case, or hair tie appears as one ordinary nondecorative interruption.",
  "One towel has been refolded imperfectly and a low basket contains two unlike household items without label text.",
  "The room is clean but not reset: one object is missing from an otherwise logical grouping and one textile edge is casually tucked."
] as const;

export const affiliatePilotV4MaterialRecipes = [
  "Favor matte and honed surfaces: slight grout-value variation, tiny edge wear, nonuniform plaster absorption, and no blanket glossy coating.",
  "Wood grain changes naturally from board to board, with believable end grain, joinery, and a faint high-touch sheen only where hands contact it.",
  "Fabric shows irregular yarn thickness, cross-grain tension, unequal folds, localized compression, and no cloned fold waveform or procedural ribbing.",
  "Stone is honed rather than mirror polished, with sparse nonrepeating veins that continue through perspective and never tile.",
  "Glazed tile varies subtly in face and reflection while grout lines remain constructed, imperfectly toned, and geometrically coherent.",
  "Painted trim and cabinetry have low-sheen brush or roller character with tiny high-touch wear, not uniformly perfect lacquer.",
  "Metal keeps real roughness, fingerprints or water-softened highlights where plausible, and never becomes chrome unless the product requires chrome.",
  "Towels and rugs have directional nap, compressed contact areas, irregular edges, and no identical repeating loops or fringe.",
  "Older ceramic and enamel surfaces stay sound but show gentle use variation, small water spotting, and restrained nonuniform reflection.",
  "Painted plaster, ordinary laminate, and caulk show small nonrepeating roller marks, edge wear, repairs, and contact variation without procedural noise or blanket gloss."
] as const;

export const affiliatePilotV4StyleVariationLanes = [
  "Express the style mainly through architecture and joinery; keep the wall color quiet and avoid the style's most obvious signature color.",
  "Express the style through two material choices and one textile, not through matched decor or literal themed wallpaper.",
  "Let one retained older element carry the style while the remaining fixtures are ordinary, safe, and visually restrained.",
  "Use a mostly neutral room with one off-palette household object; style coherence should come from proportion, texture, and editing.",
  "Interpret the style as an achievable owner update in a rental or modest home, not as a luxury designer installation.",
  "Mix one adjacent design influence into the style while preserving its core mood; avoid a catalog set assembled from matching pieces.",
  "Use the style in floor, trim, or hardware decisions while allowing walls and towels to depart from the expected color formula.",
  "Show a lived-in version of the style several years after installation, with gentle material aging and accumulated ordinary objects.",
  "Use fewer style cues at larger scale rather than many small decorative props; leave some surfaces visually unresolved or plain.",
  "Treat the style name as an atmosphere, not a checklist: one convincing room history matters more than literal color matching."
] as const;

export const affiliatePilotV4VisualQaRubric = {
  minimumScorePerDimension: 3,
  dimensions: [
    "reads as a real iPhone household photograph",
    "bathroom remains the subject and product feels incidental",
    "lighting is plausible, specific, and distinct within the set",
    "materials have nonrepeating roughness and believable wear",
    "composition includes restrained human irregularity",
    "style is legible without literal color or decor stereotypes",
    "product identity and physical construction remain correct"
  ],
  hardRejects: [
    "AI-stock or real-estate-listing polish",
    "centered product-hero composition",
    "reused product cutout or repeated textile drape",
    "cloned folds, tiled grain, repeated veining, or procedural texture",
    "uniform HDR, blanket gloss, or product-only lighting",
    "symmetrically staged props or implausibly perfect room reset",
    "pseudo-text, branding drift, impossible support, incomplete plumbing, or reflection errors"
  ]
} as const;

export const affiliatePilotV4StyleProfiles = {
  "minimalist-elegance": {
    palette:
      "warm white, chalk, mushroom, and one charcoal accent; no sterile blue-white showroom",
    architecture:
      "clean built-in vanity, quiet plaster or large-format tile, restrained hardware, and one simple framed or arched mirror",
    livedIn:
      "a folded hand towel, a single grooming item, a drinking glass, or a modest open drawer"
  },
  "modern-marble": {
    palette:
      "white, gray, or warm cream stone with restrained black, chrome, or brass accents",
    architecture:
      "buildable marble or marble-look vanity surfaces, properly inset basin, coherent shower glass, and nonrepeating veining",
    livedIn:
      "reading glasses, contact-lens case, comb dish, one skincare bottle, or a towel used once"
  },
  "spa-greenery": {
    palette:
      "soft mineral green, eucalyptus, pale stone, warm wood, and muted white",
    architecture:
      "calm shower or tub zone with matte tile, practical ventilation, and safe natural-light access",
    livedIn:
      "one healthy plant, bath brush, folded or loosely hung towel, slippers, and a small plain bottle"
  },
  "brass-terrazzo": {
    palette:
      "cream terrazzo with restrained multicolor chips, champagne brass, warm white, and one grounded color accent",
    architecture:
      "proper vanity joinery, complete cabinet hardware, coherent terrazzo surfaces, and correctly mounted warm-metal fixtures",
    livedIn:
      "a small tray, hand towel, comb, plant pot, or step stool with personal but orderly character"
  },
  "boho-earth-tones": {
    palette:
      "terracotta, clay, sand, dusty sage, tobacco, and cream without orange overgrading",
    architecture:
      "older but functional rental or cottage bathroom with honest plaster, wood, and woven textures",
    livedIn:
      "hanging plant, woven basket, rumpled towel, bath brush, small art print, or imperfect rug"
  },
  "scandinavian-clean": {
    palette:
      "soft white, pale oak, fog gray, powder blue, and one muted color note",
    architecture:
      "compact practical room, pale wood vanity, simple rectangular tile, and complete understated hardware",
    livedIn:
      "toothbrush cup, neatly used towel, toilet paper, modest skincare, or one open storage compartment"
  },
  "dark-moody": {
    palette:
      "charcoal, oxblood, forest, dark stone, and warm aged metal with retained shadow detail",
    architecture:
      "functional small bathroom with dark plaster or tile, warm sconces, and realistic daylight or doorway spill",
    livedIn:
      "dark towel, amber bottle, ring dish, paperback, or one plant catching side light"
  },
  "warm-editorial": {
    palette:
      "rose beige, ochre, walnut, cream, dusty blue, and restrained red accents",
    architecture:
      "characterful but buildable room with warm plaster, cabinet furniture, real radiator or vent, and layered practical light",
    livedIn:
      "open drawer, hair tie, robe, stacked skincare, slippers, framed art, or a towel not perfectly arranged"
  },
  "industrial-loft": {
    palette:
      "soft concrete gray, blackened steel, warm brick, weathered oak, and off-white",
    architecture:
      "real loft bathroom with sealed concrete, correctly plumbed exposed fixtures, steel-framed glass, and safe wet-zone detailing",
    livedIn:
      "canvas laundry bag, black comb, coiled dryer cord safely away from water, utility shelf, or plain amber bottle"
  },
  "coastal-calm": {
    palette:
      "salt white, sand, pale aqua, weathered blue, light oak, and small coral or navy accents",
    architecture:
      "airy bathroom with practical window treatment, simple tile, clean tub or shower, and no literal beach-theme overload",
    livedIn:
      "striped hand towel, shell-shaped soap dish, woven hamper, pale robe, or one small coastal art print"
  },
  japandi: {
    palette:
      "warm putty, rice paper, pale or smoked wood, moss, charcoal, and stone",
    architecture:
      "quiet low-clutter room with tactile plaster, rectilinear tub or shower, precise wood joinery, and intentional negative space",
    livedIn:
      "wood brush, folded linen, ceramic cup, small branch, slippers, or one low storage basket"
  },
  "vintage-eclectic": {
    palette:
      "aged cream, muted teal, burgundy, mustard, dusty pink, and dark wood in controlled combinations",
    architecture:
      "believable older bathroom with retained trim, updated safe plumbing, cabinet hardware, and layered collected finishes",
    livedIn:
      "framed art, painted cabinet, old stool, patterned rug, perfume bottle, toy, or personal shelf collection"
  }
} as const;

export const affiliatePilotV4ShotBlueprints = [
  {
    slot: 1,
    camera:
      "Natural standing eye level from the open doorway or room threshold, 24–28 mm equivalent smartphone main camera, with enough surrounding architecture to prove the room is buildable.",
    lighting:
      "Soft morning window light mixed with one practical fixture; ordinary smartphone exposure with retained window detail and gentle shadow noise.",
    activity:
      "A recently used but orderly bathroom: one towel is imperfectly hung and one daily-use object is out.",
    reflectionPlan:
      "Prefer no dominant mirror; if a mirror appears, angle it toward a real opposite wall and verify every reflected object."
  },
  {
    slot: 2,
    camera:
      "Closer three-quarter functional view from reachable standing space, 26–35 mm equivalent, with the complete product visible and mild natural perspective convergence.",
    lighting:
      "Overcast side light or diffused skylight with subdued practical fill; no studio highlight and no independently bright product.",
    activity:
      "Show one plausible interaction trace such as an open drawer, damp hand towel, uncapped plain jar, or drinking glass without a person.",
    reflectionPlan:
      "Use a small mirror only when it can reflect the stated counter, doorway, and product with correct reversed geometry."
  },
  {
    slot: 3,
    camera:
      "Slightly elevated diagonal smartphone view from a dry accessible corner, approximately 28 mm equivalent, revealing a different wall and floor plan from slots 1 and 2.",
    lighting:
      "Broken midday light through blinds or foliage, with irregular soft shadow shapes and realistic auto white balance.",
    activity:
      "Include one unexpected but normal household detail such as a contact case, child's bath toy, step stool, watering can, hair tie, or folded washcloth.",
    reflectionPlan:
      "Any reflective glass, metal, or mirror must agree with the single stated window and room layout; no phantom light source."
  },
  {
    slot: 4,
    camera:
      "Lower seated or tub-edge viewpoint from real open floor or dry tub volume, 28–35 mm equivalent, with a foreground edge allowed to create candid depth.",
    lighting:
      "Warm late-afternoon or early-evening practical light plus weak cool ambient spill, with the two color temperatures visible consistently on product and room.",
    activity:
      "Use a robe, slippers, towel, paperback, or toiletry grouping in a physically supported, slightly imperfect arrangement.",
    reflectionPlan:
      "Avoid a full frontal mirror unless the exact camera position, doorway, and featured product can all be reflected consistently."
  },
  {
    slot: 5,
    camera:
      "A distinct candid side or partial-obstruction composition, such as peeking past a real door jamb or vanity edge, from normal accessible room volume; never from inside a wall.",
    lighting:
      "A different weather or time cue—light rain, blue-hour window, or warm lamp—with realistic smartphone dynamic range and no cinematic grade.",
    activity:
      "Show modest personal variation: one open cabinet, mixed towel color, labeled secondary object only if its short text is crisp and correct, or otherwise a plain designed container.",
    reflectionPlan:
      "Perform an explicit ray check for every mirror and polished surface. A hinged door must have real jamb, hinges, swing clearance, latch, and correctly placed knob."
  }
] as const;
