import { affiliatePilotV2Scenes } from "./affiliate-pilot.v2.ts";

export const affiliatePilotV3Authorization = {
  referenceRightsConfirmed: true,
  generationAuthorized: true,
  fullScaleAuthorized: false,
  sourceImagesPrivateOnly: true,
  ownerApprovedPresentationReuse: true,
  authorizedAt: "2026-07-27T12:00:00-04:00"
} as const;

export type AffiliatePilotV3Asin =
  | "B0829N8C9G"
  | "B0D2KK6MNS"
  | "B0DC7VG6Z9"
  | "B08TLP2D54"
  | "B07PFYZ3DP"
  | "B07SG7BV11";

export interface AffiliatePilotV3Scene {
  asin: AffiliatePilotV3Asin;
  styleSlug: string;
  slot: 1 | 2 | 3 | 4 | 5;
  sceneId: string;
  room: string;
  camera: string;
  lighting: string;
  productPlacement: string;
  livedInDetails: string;
  qaFocus: string;
}

export const affiliatePilotV3Selections = [
  {
    asin: "B0829N8C9G",
    productRole: "reflective rigid product",
    styleSlugs: ["minimalist-elegance", "modern-marble"],
    reusePresentationFromV2: true,
    presentationReferenceCount: 0,
    styledReferenceCount: 2,
    referenceSourceUrl: "https://www.oxo.com/stainless-steel-soap-dispenser-1.html",
    identityPrompt:
      "Exactly one OXO dispenser with a tall gently tapered brushed-stainless body, charcoal-gray rounded pump and short forward spout, clear blue-tinted reservoir band at the base, and one small oval OXO mark near the lower-right front of the metal body. The steel is softly brushed and moderately rough, never mirror-polished or independently bright. Preserve the same taper, height-to-width ratio, pump geometry, base band, mark position, and spout direction under rotation. Never add a second pump, handle, alternate finish, label, or permanent accessory.",
    rationale:
      "Re-tests reflective integration, room-matched exposure, varied orientation, and support-surface physics."
  },
  {
    asin: "B0D2KK6MNS",
    productRole: "solid woven textile",
    styleSlugs: ["boho-earth-tones", "warm-editorial"],
    reusePresentationFromV2: true,
    presentationReferenceCount: 0,
    styledReferenceCount: 2,
    referenceSourceUrl: "https://www.amazon.com/dp/B0D2KK6MNS",
    identityPrompt:
      "Exactly one 72-by-72-inch full-length solid muted terracotta-rust shower curtain with a subtle irregular linen-blend weave, twelve reinforced top openings on twelve separate silver metal hooks, and one plain weighted bottom hem. Keep the exact unprinted color and construction. The hanging fabric has twelve top suspension points, tiny natural sags between hooks, unequal fold widths and depths, changing fold amplitude from top to bottom, slight cross-grain wrinkles, and a softly weighted hem; it must never look like repeated extruded tubes. Never add a pattern, stripe, tassel, fringe, ombre, tieback, embroidery, extra panel, alternate color, curved rail, or freestanding display frame.",
    rationale:
      "Re-tests nonrepeating textile deformation, gravity, hooks, hem, room variety, and plausible camera placement."
  },
  {
    asin: "B0DC7VG6Z9",
    productRole: "slatted furniture with open geometry",
    styleSlugs: ["japandi", "spa-greenery"],
    reusePresentationFromV2: true,
    presentationReferenceCount: 0,
    styledReferenceCount: 2,
    referenceSourceUrl:
      "https://www.bambusi.com/products/bamboo-shower-bench-small-shower-stool-with-storage-shelf-non-slip-shower-seat-bathroom-bench-spa-decor-wooden-shower-bench-foot-rest-shaving-stool-for-shower-suitable-for-indoor-outdoor-use",
    identityPrompt:
      "Exactly one compact natural-bamboo shower bench about 17 inches wide by 9 inches deep by 17 inches high. Preserve the approved reference geometry: rectangular top with exactly nine parallel bamboo slats and eight dark gaps, rounded outer top frame, gently bowed front apron, four slightly splayed straight legs with small dark non-slip feet, open sides, and the same lower open slatted shelf and joinery shown in the references. The bamboo is matte-to-satin with visible natural grain, not glossy, flat, plastic, orange, arched, or semicircular. Never change the number of top slats, leg shape, shelf layout, proportions, or add a cushion, back, armrest, drawer, third shelf, or metal frame.",
    rationale:
      "Re-tests exact geometry, material roughness, scene-matched exposure, collision avoidance, and varied shelf use."
  },
  {
    asin: "B08TLP2D54",
    productRole: "architectural mirror with reflection",
    styleSlugs: ["modern-marble", "brass-terrazzo"],
    reusePresentationFromV2: false,
    presentationReferenceCount: 1,
    styledReferenceCount: 2,
    referenceSourceUrl: "https://www.umbra.com/products/hubba-arched-wall-mirror",
    identityPrompt:
      "Exactly one Umbra Hubba arched wall mirror in brass, approximately 34.25 inches wide, 36.25 inches high, and 1.13 inches deep. Preserve its broad smooth arch top, straight flat bottom, softly rounded lower corners, very thin continuous metallic-brass rim, shallow wall depth, and large uninterrupted plain mirror glass. Never add an ornate frame, bevel, shelf, hooks, segmented panes, pointed top, decorative crest, thick gold molding, or alternate finish.",
    rationale:
      "Stress-tests coherent reflection geometry, thin-frame identity, mounting, scale, and camera visibility."
  },
  {
    asin: "B07PFYZ3DP",
    productRole: "rigid multi-tier rolling storage",
    styleSlugs: ["scandinavian-clean", "minimalist-elegance"],
    reusePresentationFromV2: false,
    presentationReferenceCount: 2,
    styledReferenceCount: 3,
    referenceSourceUrl: "https://www.yamazakihome.com/en-kr/products/h10365",
    identityPrompt:
      "Exactly one Yamazaki Tower Slim Rolling Storage Cart in white, approximately 5.1 inches wide, 18.7 inches long, and 27 inches high including casters. Preserve the narrow tall powder-coated white steel body, natural light-wood rectangular top, one solid concealment panel along one long side, open opposite long side, full-width upper shelf below the wood top, shortened middle shelf occupying roughly two-thirds of the length and leaving one tall open bay, full-width bottom shelf, U-shaped pull handle at one short end, and four small white nylon casters. Never widen it, change shelf count or openings, add drawers or doors, hide the casters, curve the body, or turn it into a generic trolley.",
    rationale:
      "Stress-tests exact rigid geometry, open shelves, four-point floor contact, stable loads, and tight-space placement."
  },
  {
    asin: "B07SG7BV11",
    productRole: "large patterned textile",
    styleSlugs: ["vintage-eclectic", "coastal-calm"],
    reusePresentationFromV2: false,
    presentationReferenceCount: 1,
    styledReferenceCount: 2,
    referenceSourceUrl:
      "https://www.lushdecor.com/collections/84-inch-shower-curtains/products/leah-shower-curtain",
    identityPrompt:
      "Exactly one Lush Decor Leah Floral Shower Curtain in the approved blue 72-by-72-inch variation: white polyester ground with the same large loose watercolor flowers and leaves in teal, aqua blue, smoky gray, muted taupe, and soft charcoal shown in the canonical reference. Preserve the motif scale, approximate placement hierarchy, palette, twelve top openings, plain side seams, and plain bottom hem while allowing natural folds to occlude parts of the print. Never convert it to a tiled repeat, shrink or multiply the flowers, invent different blossoms, add a border, stripe, ruffle, tassel, fringe, tieback, valance, or alternate colorway.",
    rationale:
      "Stress-tests pattern identity under physically plausible folds, hooks, occlusion, lighting, and varied bathroom palettes."
  }
] as const;

const originalQaFocus = new Map<string, string>([
  [
    "B0829N8C9G:minimalist-elegance:1",
    "Keep the tissue box completely supported by the vanity with all corners on the surface; no item may overhang. The sink, faucet, mirror, and tub geometry must remain coherent."
  ],
  [
    "B0829N8C9G:minimalist-elegance:2",
    "The towel may be casually rumpled but its center of mass and folds must be naturally supported, not unnaturally peeling off the counter. Use nonrepeating oak and microcement texture, and keep the dispenser less shiny."
  ],
  [
    "B0829N8C9G:minimalist-elegance:3",
    "Preserve the strong realistic full-bathroom composition, textured curtain, carpeted-looking bath rug, and believable shadows. Verify every reflected or background object and keep the dispenser room-exposed."
  ],
  [
    "B0829N8C9G:minimalist-elegance:4",
    "Use one structurally plausible wall-hung basin with a continuous rim, believable mounting and plumbing, and no invented side block, side ledge, or protruding fused mass."
  ],
  [
    "B0829N8C9G:minimalist-elegance:5",
    "Use a true pedestal sink whose basin is supported by a coherent column to the floor; no floating slab or protruding wall mass. Keep the product exposure subdued and scene-matched."
  ],
  [
    "B0829N8C9G:modern-marble:1",
    "Retain the lived-in contact-lens detail and towel. The large mirror must reflect the real glass shower and room behind the camera with correct perspective, not phantom objects."
  ],
  [
    "B0829N8C9G:modern-marble:2",
    "Turn the bottle only as a person would naturally leave it. Its metal must reflect the same warm sconce and weak cool hallway mix as the room, never a white studio softbox."
  ],
  [
    "B0829N8C9G:modern-marble:3",
    "Keep the successful higher, dynamic doorway viewpoint and plausible curtain. Check the linen cabinet, tub, mirror, and floor joins for a physically buildable room."
  ],
  [
    "B0829N8C9G:modern-marble:4",
    "Use a proper vanity-mounted basin and retain the useful dish and reading-glasses detail. The mirror reflection must agree with the exact counter and opposite wall."
  ],
  [
    "B0829N8C9G:modern-marble:5",
    "Retain the open drawer, hair tie, and through-the-door observational framing. Keep the drawer volume, door, mirror, and product lighting physically coherent."
  ],
  [
    "B0D2KK6MNS:boho-earth-tones:1",
    "Use a cream-and-clay rental room with a believable carpeted bath rug, wood-look floor, and plant. Make the curtain's twelve individually suspended folds irregular and gravity-led, never a repeated corrugated pattern."
  ],
  [
    "B0D2KK6MNS:boho-earth-tones:2",
    "Use a dusty-sage and terracotta older bathroom with a hanging plant. Let one-quarter-open fabric bunch asymmetrically with changing fold depth and a weighted hem."
  ],
  [
    "B0D2KK6MNS:boho-earth-tones:3",
    "Use a warm-gray lived-in family bathroom. The mirror may only show objects actually opposite it; do not reflect phantom towels, a second doorway, or impossible camera space."
  ],
  [
    "B0D2KK6MNS:boho-earth-tones:4",
    "Use amber rainy light, a realistic teak mat with nonrepeating grain, and a structurally plausible pedestal sink. Avoid copied vertical bands in the curtain."
  ],
  [
    "B0D2KK6MNS:boho-earth-tones:5",
    "The camera must occupy real dry tub volume near the open end, not a wall. Use exactly one straight wall-mounted rod; the cabinet and towel behind it must remain structurally coherent."
  ],
  [
    "B0D2KK6MNS:warm-editorial:1",
    "Use mottled daylight and a different dusty-blue plaster palette. Include plausible shower head, arm, controls, drain, slippers, soap, and towel; curtain illumination must match the room."
  ],
  [
    "B0D2KK6MNS:warm-editorial:2",
    "Use a filled but orderly shelving wall and accurate mirror reflection. The mirror must preserve the photographer's possible standing space and the curtain's true position."
  ],
  [
    "B0D2KK6MNS:warm-editorial:3",
    "Use a genuinely different pale-ochre room with radiator or wall heater. A hanging towel must rest over its hook rather than passing through it; preserve the strongest natural fabric behavior."
  ],
  [
    "B0D2KK6MNS:warm-editorial:4",
    "Use a physically possible reverse view from inside the dry tub. Keep the advertised terracotta color exact, and include the curtain in the mirror whenever the reflection geometry requires it."
  ],
  [
    "B0D2KK6MNS:warm-editorial:5",
    "Use warm editorial evening light in a rose-beige room with a complete shower fixture. Hooks, hem, wall mounts, folds, and camera position must all withstand close inspection."
  ],
  [
    "B0DC7VG6Z9:japandi:1",
    "Integrate the exact nine-slat bench into the room light and preserve matte bamboo. Use no repeated neutral towel on the lower shelf; leave the shelf empty in this scene."
  ],
  [
    "B0DC7VG6Z9:japandi:2",
    "Preserve exact shelf and leg geometry. Put one folded pale-sage towel fully supported on the top and one small plain bottle fully supported on the lower shelf."
  ],
  [
    "B0DC7VG6Z9:japandi:3",
    "Use convincing green wall tile, gray floor, and restrained red-bottle accents. Keep natural bamboo grain, exact nine top slats, correct lower shelf, and no gloss."
  ],
  [
    "B0DC7VG6Z9:japandi:4",
    "Use a coherent vanity-supported sink. Place a bath brush and one dispenser stably on the bench; no product part may intersect the wall, vanity, glass, or props."
  ],
  [
    "B0DC7VG6Z9:japandi:5",
    "Use slippers and a complete shower head, arm, hose, controls, and drain. The bath mat stays completely outside the shower, and the bench keeps clear of the glass."
  ],
  [
    "B0DC7VG6Z9:spa-greenery:1",
    "Preserve the realistic shower, plant, rug, and wall towel while matching bench exposure to the room. Use a rolled rust towel on top and leave the lower shelf empty."
  ],
  [
    "B0DC7VG6Z9:spa-greenery:2",
    "Use a correctly proportioned watering can and stable potted plants. Put one low basket entirely on the lower shelf and no towel on the bench."
  ],
  [
    "B0DC7VG6Z9:spa-greenery:3",
    "Use believable skincare clutter and physically plausible curtain folds. Put a loosely folded white towel only on the top, not the same lower-shelf arrangement as other scenes."
  ],
  [
    "B0DC7VG6Z9:spa-greenery:4",
    "No towel may pass through the door or glass, no bench part may intersect glass, and the bath mat must sit entirely outside the shower. Use a recognizable natural loofah rather than an ambiguous sponge."
  ],
  [
    "B0DC7VG6Z9:spa-greenery:5",
    "Keep a clear standing path to the sink; the bench cannot block it. Preserve the useful low angle, slippers, robe, and softly blurred foreground toiletries while keeping all geometry exact."
  ]
]);

const refinedOriginalScenes: AffiliatePilotV3Scene[] = affiliatePilotV2Scenes.map(
  (scene) => {
    const qaFocus = originalQaFocus.get(
      `${scene.asin}:${scene.styleSlug}:${scene.slot}`
    );
    if (!qaFocus) {
      throw new Error(
        `Missing V3 QA focus for ${scene.asin}:${scene.styleSlug}:${scene.slot}`
      );
    }
    return {
      ...scene,
      sceneId: `v3-${scene.sceneId}`,
      qaFocus
    };
  }
);

const addedScenes: AffiliatePilotV3Scene[] = [
  {
    asin: "B08TLP2D54",
    styleSlug: "modern-marble",
    slot: 1,
    sceneId: "v3-hubba-marble-compact-condo-morning",
    room:
      "A compact contemporary condo bathroom with a believable white vanity cabinet, pale gray-veined marble top and backsplash, cool off-white wall, and a glass shower across from the sink.",
    camera:
      "Vertical smartphone photograph from the open doorway at chest height, 28mm-equivalent, offset 25 degrees from the mirror so the camera and photographer stay outside its reflected field.",
    lighting:
      "Soft cool morning window light from the shower side mixed with a weak warm ceiling practical, with ordinary phone dynamic range and no HDR.",
    productPlacement:
      "Mount the brass Hubba mirror securely and level above the vanity at normal face height. Reflect only the real glass shower, opposite wall, towel hook, and window geometry described in this room.",
    livedInDetails:
      "A contact-lens case, plain toothbrush cup, used hand towel, and one moisturizer sit imperfectly but fully supported on the vanity.",
    qaFocus:
      "The reflection must be a perspective-correct continuation of this exact room with no duplicate basin, phantom doorway, floating objects, visible camera, or warped thin brass rim."
  },
  {
    asin: "B08TLP2D54",
    styleSlug: "modern-marble",
    slot: 2,
    sceneId: "v3-hubba-marble-dark-powder-night",
    room:
      "A small nighttime powder room with charcoal marble-look backsplash, walnut vanity, one properly inset white basin, matte-black faucet, and warm gray side walls.",
    camera:
      "Close vertical 35mm-equivalent handheld view from the room's open side, just above counter height, looking obliquely across the brass frame rather than straight into the glass.",
    lighting:
      "One warm sconce above and to camera-left, with weak cool hall spill and natural shadow noise. Brass highlights are localized and never neon.",
    productPlacement:
      "Mount the arched mirror above the basin, slightly offset from the vanity center as an intentional renovation choice. Its reflected field contains only the opposite charcoal wall and open hall edge.",
    livedInDetails:
      "A half-full water glass, ring dish, dark hand towel, and faint dry water marks make the room used without cluttering it.",
    qaFocus:
      "Preserve an uninterrupted arch and straight bottom. The dark reflection cannot invent lights, rooms, frames, or objects and must share the camera's perspective."
  },
  {
    asin: "B08TLP2D54",
    styleSlug: "modern-marble",
    slot: 3,
    sceneId: "v3-hubba-marble-family-wide-overcast",
    room:
      "A modest shared family bathroom with marble-look porcelain floor, a long white quartz vanity, two real cabinet doors, pale plaster, and an alcove tub opposite the mirror.",
    camera:
      "Wide 24mm-equivalent vertical phone image from the hall at standing height, with mild edge distortion and the mirror occupying less than one-third of the frame.",
    lighting:
      "Bright overcast daylight from a frosted tub window with a warm vanity bar switched off; protect window highlights and retain natural cabinet shadows.",
    productPlacement:
      "Mount the single Hubba mirror above the left half of the vanity. Its view shows the opposite tub curtain, window edge, and one towel hook at the correct reversed angle.",
    livedInDetails:
      "Two mismatched towels, a tissue box entirely on the counter, a bath mat, and three unbranded daily-care items are casually placed.",
    qaFocus:
      "Keep the mirror at plausible scale and mounting height. Reflection, tub, cabinet, sink, door, and tissue box must all obey perspective, support, and gravity."
  },
  {
    asin: "B08TLP2D54",
    styleSlug: "modern-marble",
    slot: 4,
    sceneId: "v3-hubba-marble-vintage-renovation-rain",
    room:
      "A renovated older-home bathroom with a structurally supported pedestal sink, small marble shelf above it, muted blue-gray plaster, original hex floor, and rain-speckled sash window.",
    camera:
      "Low vertical 35mm-equivalent smartphone angle from beside the towel rail, shifted far enough right that the phone is not reflected.",
    lighting:
      "Dim rainy daylight plus one amber wall sconce, with the mirror glass darker than the window and realistic fine shadow noise.",
    productPlacement:
      "Mount the brass arched mirror directly to the plaster above the pedestal sink. Reflect the opposite plain wall, robe hook, and a sliver of the real sash window only.",
    livedInDetails:
      "A hairbrush, small ceramic cup, imperfect hand towel, and robe make the older room feel occupied.",
    qaFocus:
      "The sink must have a coherent pedestal to the floor. Do not reflect the camera, a second sink, impossible window, or object absent from the room."
  },
  {
    asin: "B08TLP2D54",
    styleSlug: "modern-marble",
    slot: 5,
    sceneId: "v3-hubba-marble-detail-late-afternoon",
    room:
      "A narrow apartment bathroom with cream-veined marble remnant, painted sage cabinet, flat plaster wall, and a real door opening opposite the vanity.",
    camera:
      "Vertical 50mm-equivalent phone detail from shoulder height at a strong side angle, framing the brass arch and its shallow wall depth while retaining the whole mirror.",
    lighting:
      "Late-afternoon window light creates one soft wall gradient and mild warm reflections in the brass, without clipping or studio strips.",
    productPlacement:
      "Mount the Hubba mirror level above a properly inset oval sink. The angled glass shows only a truthful slice of the opposite open door and plaster wall.",
    livedInDetails:
      "Reading glasses, a plain soap dish, and one loosely rolled washcloth rest fully on the counter.",
    qaFocus:
      "Show the authentic thin rim and shallow depth without thickening or beveling it. Reflected door angles and occlusion must match the camera."
  },
  {
    asin: "B08TLP2D54",
    styleSlug: "brass-terrazzo",
    slot: 1,
    sceneId: "v3-hubba-terrazzo-playful-morning",
    room:
      "A cheerful but practical bathroom with small cream terrazzo backsplash chips in rust, sage, and black, pale wood vanity, off-white walls, and brushed-brass faucet.",
    camera:
      "Handheld vertical 28mm-equivalent image from just inside the doorway, asymmetrical and slightly below eye level, with the camera outside the mirror's reflected field.",
    lighting:
      "Clear but indirect morning daylight from camera-left and an unlit brass sconce; moderate phone contrast with realistic grain.",
    productPlacement:
      "Mount the one brass Hubba mirror above the vanity. Its reflection contains the opposite linen closet and a real hanging sage towel at the correct reversed position.",
    livedInDetails:
      "A terrazzo-look soap tray, comb, rust washcloth, and small plant are placed with practical spacing.",
    qaFocus:
      "Do not duplicate terrazzo texture or mirror contents. All counter items must sit fully on the surface and the brass finish must remain thin and consistent."
  },
  {
    asin: "B08TLP2D54",
    styleSlug: "brass-terrazzo",
    slot: 2,
    sceneId: "v3-hubba-terrazzo-powder-side-afternoon",
    room:
      "A tiny powder room with warm white walls, a speckled concrete terrazzo floor, wall-hung oak vanity with visible support and plumbing, and one muted coral accent.",
    camera:
      "Vertical 35mm-equivalent smartphone view from the usable standing area beside the door, looking diagonally at the mirror and sink.",
    lighting:
      "Uneven afternoon daylight from a high frosted window, with a gentle falloff across the room and no separate product light.",
    productPlacement:
      "Mount the arched mirror securely above the wall-hung sink. It reflects a physically present opposite towel bar and the closed door edge, not the camera.",
    livedInDetails:
      "One coral hand towel, toilet-paper edge, wastebasket, and an unbranded hand-cream tube provide everyday scale.",
    qaFocus:
      "The camera must fit in the room. Vanity supports, plumbing, door, reflection, floor perspective, and mirror mounting all need coherent construction."
  },
  {
    asin: "B08TLP2D54",
    styleSlug: "brass-terrazzo",
    slot: 3,
    sceneId: "v3-hubba-terrazzo-wide-family-evening",
    room:
      "A distinct family bath with large pale terrazzo floor tiles, painted teal vanity, white tub surround, cream walls, and a laundry hamper near the tub.",
    camera:
      "Wide 24mm-equivalent portrait phone photo from the hall at normal standing height, with a thin blurred doorframe foreground and slight handheld tilt.",
    lighting:
      "Early evening mixed light from warm vanity sconces and cool residual window light, with ordinary automatic white balance.",
    productPlacement:
      "Mount the mirror above the teal vanity. Its reflected view truthfully includes the opposite white shower curtain edge and cool window light source.",
    livedInDetails:
      "A child's step stool, two towels at different heights, toothbrush cup, and partly open drawer create plausible family use.",
    qaFocus:
      "Reflection must contain only the opposite scene. Keep all architectural joins, open drawer volume, sink, and warm/cool light interaction physically plausible."
  },
  {
    asin: "B08TLP2D54",
    styleSlug: "brass-terrazzo",
    slot: 4,
    sceneId: "v3-hubba-terrazzo-oblique-night",
    room:
      "A different design-forward bathroom with dark green wall paint, restrained pink-and-gray terrazzo vanity top, compact cream cabinet, and brass practical light.",
    camera:
      "Oblique top-down vertical phone photograph from shoulder height, 35mm-equivalent, crossing the basin diagonally and revealing the mirror's lower frame.",
    lighting:
      "Warm nighttime practical light only, slightly underexposed with restrained brass and glass highlights.",
    productPlacement:
      "Mount the Hubba mirror level and high enough above the faucet for practical clearance. The glass reflects only the opposite dark-green wall and towel hook.",
    livedInDetails:
      "Reading glasses, a plain ceramic cup, and one used bar of soap sit imperfectly but stably on the counter.",
    qaFocus:
      "No warped arch, duplicate mirror, impossible reflection, floating item, clipped highlight, or crystalline repeating terrazzo pattern."
  },
  {
    asin: "B08TLP2D54",
    styleSlug: "brass-terrazzo",
    slot: 5,
    sceneId: "v3-hubba-terrazzo-low-doorway-cloudy",
    room:
      "A quiet rental bathroom with subtle gray terrazzo-look vinyl, white pedestal basin, pale clay wall, brass towel ring, and ordinary tub beyond.",
    camera:
      "Low vertical 28mm-equivalent view from the open doorway at waist height, with the mirror in the upper third and a realistic clear circulation path.",
    lighting:
      "Cloudy neutral daylight through textured glass, no practical light, and natural falloff behind the tub.",
    productPlacement:
      "Mount the mirror above the fully supported pedestal sink. Reflect the opposite pale wall and tub-curtain edge at the correct angle.",
    livedInDetails:
      "A folded navy towel on the ring, slippers on the dry floor, and a plain lotion bottle create restrained contrast.",
    qaFocus:
      "Pedestal, mirror, tub, doorway, towel ring, and reflected curtain must occupy one buildable room. No phantom photographer or impossible camera position."
  },
  {
    asin: "B07PFYZ3DP",
    styleSlug: "scandinavian-clean",
    slot: 1,
    sceneId: "v3-yamazaki-scandi-gap-storage-morning",
    room:
      "A bright but modest Scandinavian bathroom with white vanity cabinet, pale birch accents, warm-white tile, and a real 6-inch gap between vanity and wall.",
    camera:
      "Vertical 35mm-equivalent handheld phone image from the doorway at chest height, showing the cart's open shelf side at a front three-quarter angle.",
    lighting:
      "Soft overcast morning window light with an unlit ceiling fixture; neutral white balance and gentle floor contact shadows.",
    productPlacement:
      "Roll the exact narrow cart into the real gap without touching either wall or vanity. All four casters rest on the same dry level floor and the pull handle remains visible.",
    livedInDetails:
      "Place one folded pale-gray towel on the upper shelf, two plain bottles upright on the middle shelf, and a toilet-paper multipack fully supported on the bottom shelf.",
    qaFocus:
      "Preserve the solid side panel, open side, shortened middle shelf, tall bay, wood top, U handle, and four casters. Nothing may float or intersect the gap."
  },
  {
    asin: "B07PFYZ3DP",
    styleSlug: "scandinavian-clean",
    slot: 2,
    sceneId: "v3-yamazaki-scandi-laundry-side-afternoon",
    room:
      "A different pale-gray bathroom with wall-hung birch vanity, freestanding laundry hamper, white subway tile, and a clear wall beside the hamper.",
    camera:
      "Vertical 28mm-equivalent smartphone view at eye level from the tub side, showing mostly the cart's solid concealment panel and a narrow slice of its shelves.",
    lighting:
      "Cool late-afternoon window light with one weak warm ceiling practical and realistic mixed white balance.",
    productPlacement:
      "Park the cart parallel to the clear wall with a visible half-inch air gap. The long solid side faces the room and the handle points toward the open walking path.",
    livedInDetails:
      "The wood top holds one small plant and a hairbrush entirely within its edges; a rolled blue towel and plain refill bottle occupy separate supported shelves.",
    qaFocus:
      "The narrow proportions and solid concealment panel must match the reference. The cart cannot merge with the wall, hamper, floor, or props."
  },
  {
    asin: "B07PFYZ3DP",
    styleSlug: "scandinavian-clean",
    slot: 3,
    sceneId: "v3-yamazaki-scandi-family-wide-evening",
    room:
      "A lived-in family bathroom with oatmeal walls, simple white vanity, pale wood floor-look tile, alcove tub, and an open area near the linen closet.",
    camera:
      "Wide 24mm-equivalent vertical phone shot from the hall at standing height, with the cart useful but occupying less than one-sixth of the frame.",
    lighting:
      "Warm early-evening vanity light mixed with weak cool window light; no HDR or real-estate staging.",
    productPlacement:
      "Position the cart near the linen closet with the open side toward camera and a clear path to the tub, sink, and door. Four casters align with the floor plane.",
    livedInDetails:
      "Use mismatched folded washcloths on the upper shelf, a hair dryer in the tall bay with its cord safely contained, and one box fully on the bottom shelf.",
    qaFocus:
      "No repeated towels or perfect shelf styling. Preserve every shelf opening and keep cords, loads, doors, cart, and walking space physically coherent."
  },
  {
    asin: "B07PFYZ3DP",
    styleSlug: "scandinavian-clean",
    slot: 4,
    sceneId: "v3-yamazaki-scandi-low-caster-detail-rain",
    room:
      "A compact rainy-day bathroom with muted sage wall, white tile, light-oak vanity, and dry matte-gray porcelain floor.",
    camera:
      "Low vertical 50mm-equivalent phone photograph from knee height in the open doorway, showing the complete cart while emphasizing its lower shelf and casters.",
    lighting:
      "Dim diffuse window light plus one amber sconce, with realistic shadow noise and no independently bright cart.",
    productPlacement:
      "Set the cart on all four wheels beside the vanity, open side angled 30 degrees toward camera, with no wheel hidden inside a wall or cabinet.",
    livedInDetails:
      "A low woven basket sits entirely on the bottom shelf, two rolled rust washcloths sit on the shortened middle shelf, and the top stays empty.",
    qaFocus:
      "All four casters, bottom shelf, shortened middle shelf, tall bay, and solid back must resolve clearly and share the room's dim exposure."
  },
  {
    asin: "B07PFYZ3DP",
    styleSlug: "scandinavian-clean",
    slot: 5,
    sceneId: "v3-yamazaki-scandi-doorway-oblique-day",
    room:
      "A distinct small apartment bathroom with warm white plaster, blue-gray cabinet, ordinary toilet, shower curtain, and a narrow free corner behind the open door.",
    camera:
      "Oblique vertical 35mm-equivalent handheld view from inside the usable doorway swing, looking down slightly at the cart's wood top and open shelves.",
    lighting:
      "Neutral midday skylight with normal smartphone contrast and modest sharpening.",
    productPlacement:
      "Place the cart in the free corner outside the door swing and toilet clearance, handle facing the accessible side. It does not touch any wall.",
    livedInDetails:
      "One lotion, spare soap, two washcloths of different colors, and a cleaning cloth occupy different stable shelf zones.",
    qaFocus:
      "The door must have a real swing path and the cart must remain usable. No generic three-tier trolley substitution, missing panel, extra shelf, or floating caster."
  },
  {
    asin: "B07PFYZ3DP",
    styleSlug: "minimalist-elegance",
    slot: 1,
    sceneId: "v3-yamazaki-minimal-white-niche-morning",
    room:
      "A calm minimalist bathroom with cream microcement, simple white vanity, pale limestone-look floor, and a narrow built wall niche sized for the cart.",
    camera:
      "Vertical 28mm-equivalent phone image from the room entrance at eye level, showing the solid side panel and handle in an asymmetrical composition.",
    lighting:
      "Soft morning daylight from camera-right, unlit practicals, protected highlights, and quiet natural shadows.",
    productPlacement:
      "Roll the exact cart partly out of the niche by several inches so its handle, wood top, narrow body, and four grounded casters remain understandable.",
    livedInDetails:
      "Keep the top empty; place one charcoal folded towel on the upper shelf and one plain refill bottle in the tall bay.",
    qaFocus:
      "The niche, cart, floor, and wall cannot intersect. Preserve true narrow dimensions and restrained lived-in use without showroom emptiness."
  },
  {
    asin: "B07PFYZ3DP",
    styleSlug: "minimalist-elegance",
    slot: 2,
    sceneId: "v3-yamazaki-minimal-dark-side-night",
    room:
      "A different evening bathroom with matte taupe walls, compact walnut vanity, cream tile, and one clear side wall near the sink.",
    camera:
      "Close vertical 50mm-equivalent handheld phone view from counter height, looking along the cart's narrow short end and U-shaped pull handle.",
    lighting:
      "One warm wall sconce with weak hallway spill, slightly underexposed and naturally noisy in shadows.",
    productPlacement:
      "Park the cart on dry floor beside the wall with its open shelf side turned away enough to reveal the solid concealment panel and exact narrow depth.",
    livedInDetails:
      "A hairbrush rests fully on the wood top; one beige towel and two plain bottles are supported within separate shelves.",
    qaFocus:
      "Keep sconce warmth on the white steel and wood top. Do not widen the cart, erase the casters, merge it into the wall, or create unsupported shelf loads."
  },
  {
    asin: "B07PFYZ3DP",
    styleSlug: "minimalist-elegance",
    slot: 3,
    sceneId: "v3-yamazaki-minimal-rental-wide-cloudy",
    room:
      "A modest rental bathroom with off-white walls, standard pedestal sink, gray sheet-vinyl floor, tub curtain, and a real free strip beside the radiator.",
    camera:
      "Wide vertical 24mm-equivalent smartphone photo from the open hall at standing height with slight perspective convergence.",
    lighting:
      "Flat cloudy daylight through textured glass, no practical light, with ordinary phone exposure.",
    productPlacement:
      "Place the cart in the free strip while maintaining clearance from the radiator and sink. Show the open side at a rear three-quarter angle and all four floor contacts.",
    livedInDetails:
      "A tissue pack sits fully on the top, one rolled navy hand towel occupies the upper shelf, and the bottom shelf holds a small closed box.",
    qaFocus:
      "The radiator clearance, pedestal support, floor plane, cart geometry, and item support must all be plausible; no overhanging tissue pack."
  },
  {
    asin: "B07PFYZ3DP",
    styleSlug: "minimalist-elegance",
    slot: 4,
    sceneId: "v3-yamazaki-minimal-overhead-cleaning-day",
    room:
      "A compact functional bathroom with pale putty wall, wall-hung basin with believable bracket and plumbing, terrazzo-look vinyl floor, and a clear corner.",
    camera:
      "Oblique top-down vertical 35mm-equivalent phone shot from shoulder height, framing the cart diagonally and showing the shelf openings.",
    lighting:
      "Diffuse midday daylight with a small cool mirror bounce and localized soft floor shadows.",
    productPlacement:
      "Position the cart clear of the wall-hung sink and walking path, open side facing camera, exact wood top level and all casters aligned.",
    livedInDetails:
      "One natural loofah sits inside a small tray on the top; folded cleaning cloths and one refill bottle remain fully inside the lower shelf boundaries.",
    qaFocus:
      "No brain-like sponge, overhang, wall intersection, extra shelf, or distorted caster. Sink construction and cart perspective must agree."
  },
  {
    asin: "B07PFYZ3DP",
    styleSlug: "minimalist-elegance",
    slot: 5,
    sceneId: "v3-yamazaki-minimal-door-peek-rain",
    room:
      "A quiet older apartment bathroom with pale blue-gray plaster, small white vanity, rain-speckled window, and an unused strip beyond the open door.",
    camera:
      "Vertical 35mm-equivalent observational phone photo peeking through the doorway, with a thin blurred frame and the cart seen from its open side.",
    lighting:
      "Subdued rainy window light plus a weak warm ceiling fixture, with mixed white balance and no commercial polish.",
    productPlacement:
      "Place the cart entirely beyond the door swing on dry floor, handle accessible and solid side toward the wall without touching it.",
    livedInDetails:
      "Use a rust washcloth, one small covered bin, and three plain daily-care bottles at different supported shelf levels; leave the top mostly clear.",
    qaFocus:
      "Preserve a real standing and door path, exact cart openings, restrained clutter, and consistent dim light on every surface."
  },
  {
    asin: "B07SG7BV11",
    styleSlug: "vintage-eclectic",
    slot: 1,
    sceneId: "v3-leah-vintage-clawfoot-morning",
    room:
      "A collected older bathroom with a real clawfoot tub, faded warm-white walls, dark-stained wood floor, small antique cabinet, and simple straight ceiling-supported shower rod.",
    camera:
      "Vertical 28mm-equivalent handheld phone image from the doorway at chest height, showing the full curtain partly closed in a physically accessible view.",
    lighting:
      "Soft morning window light from camera-left with an unlit amber sconce and natural shadow variation through the floral fabric.",
    productPlacement:
      "Hang the exact blue Leah curtain on twelve separate brass-toned rings along one straight stable rod. Let it fall with unequal folds and a weighted hem just inside the tub.",
    livedInDetails:
      "Include worn slippers, an ordinary towel on a wall hook, a small fern on the cabinet, and one soap bottle in the tub.",
    qaFocus:
      "Preserve the exact large watercolor motif hierarchy while folds occlude it naturally. No tiled floral repeat, cloned blossoms, floating hem, impossible rod, or repeated fold cylinders."
  },
  {
    asin: "B07SG7BV11",
    styleSlug: "vintage-eclectic",
    slot: 2,
    sceneId: "v3-leah-vintage-painted-vanity-afternoon",
    room:
      "A different vintage-inspired bathroom with an alcove tub, dusty-rose wall, painted sage vanity, small hex floor, and aged-brass but structurally complete fixtures.",
    camera:
      "Wide vertical 24mm-equivalent phone view from the hall at standing height, including vanity, mirror, tub, and curtain without centering the product.",
    lighting:
      "Warm afternoon daylight from a frosted tub window with gentle room falloff and ordinary automatic white balance.",
    productPlacement:
      "Hang the same curtain mostly closed on twelve rings and one straight wall-mounted rod, with broader folds at one side and compressed folds at the other.",
    livedInDetails:
      "A hairbrush, mismatched towels, bath mat, and half-open vanity drawer make the room functional and lived in.",
    qaFocus:
      "The mirror must reflect only the opposite wall and real curtain segment. Drawer, towels, fixtures, rings, print, and hem must obey support and perspective."
  },
  {
    asin: "B07SG7BV11",
    styleSlug: "vintage-eclectic",
    slot: 3,
    sceneId: "v3-leah-vintage-side-rain",
    room:
      "A narrow rainy-day bathroom with ivory square tile, muted mustard upper wall, ordinary enameled tub, wall heater, and small shelf of used toiletries.",
    camera:
      "Vertical 35mm-equivalent handheld view from the tub's dry outer side near faucet height, looking along the curtain instead of straight at it.",
    lighting:
      "Dim cool window light mixed with one amber wall practical, with fine phone shadow noise and no independently lit fabric.",
    productPlacement:
      "Draw the curtain one-third open toward camera-right so its twelve hooks remain distributed along the straight rod and fabric bunching grows naturally toward the gathered side.",
    livedInDetails:
      "A robe hangs over, not through, a hook; a ceramic soap dish, two plain bottles, and rumpled navy bath mat show use.",
    qaFocus:
      "Fabric color, pattern, lighting, hook mechanics, and robe support must be coherent. Do not make the polyester glossy or the print perfectly repeated."
  },
  {
    asin: "B07SG7BV11",
    styleSlug: "vintage-eclectic",
    slot: 4,
    sceneId: "v3-leah-vintage-tub-reverse-day",
    room:
      "A distinct pale-blue bathroom with cream beadboard, standard alcove tub, glass-front medicine cabinet outside the tub, and a small walnut shelf.",
    camera:
      "Vertical 35mm-equivalent view from a real dry position inside the empty tub near its open end, looking out past a partly drawn curtain.",
    lighting:
      "Neutral midday window light with mottled leaf shadows and realistic translucent variation only at the thinnest fold edges.",
    productPlacement:
      "Show the reverse side of the same curtain partly open, with exact blue floral colors still recognizable, twelve hanging points, and a plain bottom hem.",
    livedInDetails:
      "A towel rests naturally over the tub edge, small bottles stand inside a wall niche, and the cabinet holds ordinary items.",
    qaFocus:
      "The camera cannot occupy the wall. If the cabinet glass reflects the curtain, its placement and perspective must match; do not change the colorway or invent a second panel."
  },
  {
    asin: "B07SG7BV11",
    styleSlug: "vintage-eclectic",
    slot: 5,
    sceneId: "v3-leah-vintage-family-evening",
    room:
      "A modest family bathroom with warm gray plaster, original black-and-white floor tile, ordinary white vanity, tub, and a tall linen cabinet with open shelves.",
    camera:
      "Wide 28mm-equivalent portrait phone photo from the accessible doorway, mildly tilted and unpolished, with the curtain supporting rather than dominating the scene.",
    lighting:
      "Early evening warm vanity lights plus cool residual window light, preserving mixed color temperature.",
    productPlacement:
      "Hang the exact curtain fully closed with irregular folds on one straight rod and twelve visible rings; keep the bottom hem clear of the dry floor.",
    livedInDetails:
      "Shelves contain folded towels in several colors, toilet paper, and plain bottles; a child's bath toy basket sits fully on the floor.",
    qaFocus:
      "Avoid cloned shelf objects and repeated floral blocks. Shower head, controls, drain, curtain, cabinet, vanity, and circulation must form one buildable bathroom."
  },
  {
    asin: "B07SG7BV11",
    styleSlug: "coastal-calm",
    slot: 1,
    sceneId: "v3-leah-coastal-white-blue-morning",
    room:
      "An airy but ordinary coastal bathroom with white walls, pale blue vanity, light oak-look floor, standard alcove tub, and one small high window.",
    camera:
      "Vertical 28mm-equivalent handheld phone photograph from the doorway at chest height, slightly off-axis with natural convergence.",
    lighting:
      "Cool soft morning daylight from the high window and no practical light; protect highlights and retain gentle curtain-fold shadows.",
    productPlacement:
      "Hang the blue Leah curtain mostly closed on twelve simple silver rings along one straight wall-mounted rod, with natural asymmetric folds and hem inside the tub.",
    livedInDetails:
      "A woven hamper, sand-colored bath mat, pale gray towel, and small shell dish create restrained coastal cues without theme decor.",
    qaFocus:
      "Keep the approved floral pattern and teal-aqua palette exact while making fabric weight and folds believable. No tiled print, ocean graphics, or fake transparency."
  },
  {
    asin: "B07SG7BV11",
    styleSlug: "coastal-calm",
    slot: 2,
    sceneId: "v3-leah-coastal-side-afternoon",
    room:
      "A different sun-washed bathroom with cream square tile, muted sea-glass wall paint, white vanity, and a practical wood shelf beside the tub.",
    camera:
      "Vertical 35mm-equivalent phone view from beside the vanity at waist height, looking diagonally toward a one-quarter-open curtain.",
    lighting:
      "Warm late-afternoon daylight passes across the room from camera-right, with localized but unclipped highlights and realistic white balance.",
    productPlacement:
      "Gather the curtain toward the window side with compressed irregular folds there and broader folds across the remaining panel, all on twelve separate rings.",
    livedInDetails:
      "A trailing plant, striped hand towel, plain soap dish, and slightly rumpled navy mat make the room used.",
    qaFocus:
      "No prop or towel may float or pass through another object. Preserve print scale, ring spacing, rod mounts, weighted hem, and room-matched fabric exposure."
  },
  {
    asin: "B07SG7BV11",
    styleSlug: "coastal-calm",
    slot: 3,
    sceneId: "v3-leah-coastal-family-wide-cloudy",
    room:
      "A lived-in shared bathroom with soft gray-blue walls, white quartz vanity, pale stone-look vinyl, alcove tub, and open linen shelves.",
    camera:
      "Wide 24mm-equivalent vertical smartphone image from the hall, with slight edge distortion and the curtain occupying less than half the frame.",
    lighting:
      "Bright cloudy daylight from textured glass with ordinary phone exposure and natural shadow falloff into the shelves.",
    productPlacement:
      "Hang the curtain fully closed but seen at a right three-quarter angle so the folds and side return differ from every other scene.",
    livedInDetails:
      "Use several towel colors, a tissue box fully on the counter, toothbrush cup, bath mat, and partly open drawer.",
    qaFocus:
      "The tissue box, towels, drawer, shelves, sink, and curtain must all be physically supported. Pattern deformation may follow folds but cannot mutate the flowers."
  },
  {
    asin: "B07SG7BV11",
    styleSlug: "coastal-calm",
    slot: 4,
    sceneId: "v3-leah-coastal-low-rain",
    room:
      "A small rainy coastal bathroom with dusty blue plaster, matte white tile, simple pedestal sink, and a rain-speckled sash window.",
    camera:
      "Low vertical 28mm-equivalent phone angle from the real floor area beside the hamper, looking upward toward the rod and curtain.",
    lighting:
      "Dim cool rain light with one weak warm sconce, leaving lower folds slightly darker and naturally noisy.",
    productPlacement:
      "Draw the curtain about one-third open toward camera-left with gravity-led bunching, twelve rings, straight rod, and bottom hem hanging just inside the tub.",
    livedInDetails:
      "Slippers, a light-rust towel, one amber bottle, and a woven bin add warm human contrast.",
    qaFocus:
      "The pedestal must reach the floor, camera must fit outside the tub, rod must mount to walls, and the curtain cannot glow or repeat like wallpaper."
  },
  {
    asin: "B07SG7BV11",
    styleSlug: "coastal-calm",
    slot: 5,
    sceneId: "v3-leah-coastal-doorway-evening",
    room:
      "A distinct evening bathroom with pale sand walls, blue-gray cabinet, standard tub, white tile surround, and a real open doorway opposite the shower.",
    camera:
      "Vertical 35mm-equivalent observational photo peeking through the doorway at shoulder height, with a narrow blurred doorframe foreground.",
    lighting:
      "Warm ceiling practical mixed with cool blue-hour window light, with realistic mixed white balance and no cinematic grading.",
    productPlacement:
      "Hang the same curtain two-thirds closed, with varied folds and all twelve rings on one straight rod. The fabric shares the exact warm-cool room light.",
    livedInDetails:
      "An open drawer, hair tie, towel on a hook, plain shower bottles, and a dry mat entirely outside the tub make the room lived in.",
    qaFocus:
      "Doorway, mirror if visible, tub, complete shower hardware, mat, drawer, hooks, hem, and print must form one physically possible photograph."
  }
];

export const affiliatePilotV3Scenes: readonly AffiliatePilotV3Scene[] = [
  ...refinedOriginalScenes,
  ...addedScenes
];
