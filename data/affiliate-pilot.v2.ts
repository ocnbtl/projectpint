export const affiliatePilotV2Authorization = {
  referenceRightsConfirmed: true,
  generationAuthorized: true,
  fullScaleAuthorized: false,
  sourceImagesPrivateOnly: true,
  ownerApprovedPresentationReuse: true,
  authorizedAt: "2026-07-26T20:15:00-04:00"
} as const;

export interface AffiliatePilotV2Scene {
  asin: "B0829N8C9G" | "B0D2KK6MNS" | "B0DC7VG6Z9";
  styleSlug:
    | "minimalist-elegance"
    | "modern-marble"
    | "boho-earth-tones"
    | "warm-editorial"
    | "japandi"
    | "spa-greenery";
  slot: 1 | 2 | 3 | 4 | 5;
  sceneId: string;
  room: string;
  camera: string;
  lighting: string;
  productPlacement: string;
  livedInDetails: string;
}

export const affiliatePilotV2Scenes: readonly AffiliatePilotV2Scene[] = [
  {
    asin: "B0829N8C9G",
    styleSlug: "minimalist-elegance",
    slot: 1,
    sceneId: "minimalist-small-rental-sink-morning",
    room:
      "A real compact rental bathroom with a narrow matte-white vanity, off-white painted wall, simple frameless mirror, pale gray porcelain floor, and a partially visible tub beyond the sink.",
    camera:
      "Handheld vertical smartphone photo from chest height in the doorway, about a 28mm-equivalent view, slightly off-axis with mild natural perspective convergence; the dispenser sits in the lower-right third rather than centered.",
    lighting:
      "Soft overcast morning window light from camera-left mixed with an ordinary warm ceiling fixture. Protect the window highlights and let the sink-side shadows stay gently open; no separate light on the dispenser.",
    productPlacement:
      "Place the dispenser beside the faucet, rotated about 35 degrees so the pump spout points diagonally into the sink. Show a front three-quarter view, with the brushed metal reading a half-stop darker and more integrated than a catalog product shot.",
    livedInDetails:
      "Include a folded hand towel on a wall ring, a plain toothbrush cup, a small tissue box, and one everyday moisturizer bottle with no readable label. Keep the counter mostly tidy but not empty."
  },
  {
    asin: "B0829N8C9G",
    styleSlug: "minimalist-elegance",
    slot: 2,
    sceneId: "minimalist-apartment-side-view-afternoon",
    room:
      "A different modest apartment bathroom with a light-oak floating vanity, round mirror, warm-white microcement wall, brushed-nickel faucet, and a shallow medicine cabinet visible at the edge.",
    camera:
      "Close handheld smartphone photograph from just above counter height using a natural 50mm-equivalent perspective. View the dispenser from its left side and keep a little imperfect empty margin above it; focus is on the pump and metal texture while the room remains recognizable.",
    lighting:
      "Uneven late-afternoon daylight from a small frosted window behind the camera, with realistic mild falloff toward the wall. Use normal smartphone sharpening and a trace of shadow noise, without portrait-mode blur or studio reflections.",
    productPlacement:
      "Turn the dispenser about 90 degrees from the canonical front so the small OXO mark is naturally out of view and the spout points toward camera-right. Keep the base flat on the vanity and match its contact shadow and color temperature to the room.",
    livedInDetails:
      "Add a slightly rumpled neutral hand towel, a ceramic tray holding dental floss and a comb, and a used bar of soap in a shallow dish. Nothing should be styled with perfect spacing."
  },
  {
    asin: "B0829N8C9G",
    styleSlug: "minimalist-elegance",
    slot: 3,
    sceneId: "minimalist-family-bath-wide-evening",
    room:
      "A distinct small family bathroom with a standard white vanity cabinet, plain square mirror, cream shower curtain in the background, light stone-look vinyl floor, and a laundry hamper partly visible near the door.",
    camera:
      "Wider 24mm-equivalent vertical smartphone view taken from the hall at natural standing height. Allow slight edge distortion and a subtly tilted handheld horizon. The dispenser is a useful supporting object on the vanity, clearly identifiable but occupying less than one-eighth of the frame.",
    lighting:
      "Early-evening ambient light: a warm vanity bar is on while cool residual window light reaches the tub. Preserve this believable mixed white balance. The dispenser must not glow or become the brightest object.",
    productPlacement:
      "Rotate the dispenser about 150 degrees so the rear three-quarter surface and pump silhouette are visible, with the spout facing toward the mirror. Keep its true proportions and blue-tinted base band.",
    livedInDetails:
      "Include a bath mat with slight wear, two towels on hooks at different heights, a closed toilet-lid edge, a wastebasket, and two ordinary toiletries without legible branding."
  },
  {
    asin: "B0829N8C9G",
    styleSlug: "minimalist-elegance",
    slot: 4,
    sceneId: "minimalist-powder-room-overhead-detail",
    room:
      "A different tiny powder room with a wall-mounted white sink, pale putty wall paint, compact oval mirror, chrome tap, and no bathtub or shower.",
    camera:
      "Oblique top-down handheld smartphone photo from roughly shoulder height at a 35mm-equivalent view, looking across the sink instead of straight at it. The crop includes the basin rim and wall corner and feels like a quick homeowner photograph.",
    lighting:
      "Diffuse midday daylight with a small amount of cool reflected light from the mirror. Retain realistic tiny specular highlights on the steel but avoid clipped white bands, artificial rim light, or a bright halo.",
    productPlacement:
      "Place the dispenser near the back-left corner of the sink, rotated about 210 degrees with the pump spout aimed over the basin. The camera sees a rear-side angle; make the reflection on the body belong to this exact room.",
    livedInDetails:
      "Add a casually folded guest towel, one small unlabeled hand-cream tube, and a toilet-paper roll partly visible below. Leave a faint water spot near the faucet and slight fabric creasing."
  },
  {
    asin: "B0829N8C9G",
    styleSlug: "minimalist-elegance",
    slot: 5,
    sceneId: "minimalist-older-home-window-rain",
    room:
      "A distinct older-home bathroom with a pedestal sink, simple white subway-tile backsplash with slightly uneven grout, muted greige walls, and a small rain-speckled sash window.",
    camera:
      "Vertical 35mm-equivalent smartphone photograph taken from a low three-quarter position near the towel rail, with the dispenser in the left third. Keep the depth of field mostly natural for a phone main camera, not artificially shallow.",
    lighting:
      "Dim rainy-day window light plus a modest warm sconce. Preserve the subdued exposure and let the brushed steel be medium gray; the product must receive the same soft light and contrast as the faucet and tile.",
    productPlacement:
      "Rotate the dispenser about 300 degrees so the pump spout points back toward the wall and the body is seen from its right rear quarter. It should feel naturally used, stable, and not deliberately posed for a product ad.",
    livedInDetails:
      "Include a hand towel with an imperfect fold, a small ceramic cup, a hairbrush partly cropped at the counter edge, and a bathrobe hanging softly out of focus in the background."
  },
  {
    asin: "B0829N8C9G",
    styleSlug: "modern-marble",
    slot: 1,
    sceneId: "marble-condo-vanity-cool-morning",
    room:
      "A contemporary but lived-in condo bathroom with a Carrara-look marble vanity top, cool-gray lower cabinet, large plain mirror, white wall tile, and a glass shower reflected in the background.",
    camera:
      "Handheld vertical smartphone view at eye level, 28mm-equivalent, standing slightly to the side of the vanity. Use an asymmetrical composition with the dispenser near one edge and the reflected shower adding depth.",
    lighting:
      "Cool indirect morning daylight from the shower window, balanced by a weak warm practical. Keep realistic marble highlight variation; no glow, spotlight, isolated product exposure, or brightened metal.",
    productPlacement:
      "Set the dispenser to the right of the faucet and rotate it about 45 degrees, pump spout angled toward the basin. Match its reflections to the marble, mirror, and window instead of inventing studio softboxes.",
    livedInDetails:
      "Add a hand towel loosely draped over a ring, a contact-lens case, a small tray with two plain toiletries, and a bath mat reflected in the mirror."
  },
  {
    asin: "B0829N8C9G",
    styleSlug: "modern-marble",
    slot: 2,
    sceneId: "marble-dark-powder-room-close",
    room:
      "A different moody powder room with dark gray marble-look slab backsplash, a compact white basin, walnut vanity, matte black faucet, and one small framed print with no readable text.",
    camera:
      "Close vertical smartphone image from counter height with a 50mm-equivalent natural perspective, looking across the dispenser's right side. Do not center it; allow the faucet to overlap a small part of the background silhouette without hiding the product.",
    lighting:
      "One warm wall sconce plus weak cool spill from the hallway. Use a slightly underexposed phone capture with visible but clean shadow detail and restrained highlights on the pump.",
    productPlacement:
      "Turn the dispenser about 110 degrees so the side and back dominate and the spout points away from camera. Preserve the blue-tinted reservoir band at the base without making it neon.",
    livedInDetails:
      "Include a dark hand towel with a natural sag, a small water glass, one ring dish, and subtle dried water marks near the faucet."
  },
  {
    asin: "B0829N8C9G",
    styleSlug: "modern-marble",
    slot: 3,
    sceneId: "marble-shared-bath-doorway-wide",
    room:
      "A separate shared bathroom with marble-look porcelain floor, white quartz vanity, light-gray veined backsplash, ordinary tub-shower, and a tall linen cabinet.",
    camera:
      "Wide 24mm-equivalent vertical phone photo from the doorway at standing height, with mild handheld tilt. The dispenser remains recognizable on the vanity but is not the central or brightest feature.",
    lighting:
      "Bright but overcast daytime ambient light from a frosted window, ordinary automatic exposure, and natural falloff into the linen cabinet. Avoid HDR-expanded shadows and real-estate-photo polish.",
    productPlacement:
      "Show a rear three-quarter orientation around 165 degrees with the pump pointing toward the mirror. Keep plausible scale beside the faucet and toothbrush cup.",
    livedInDetails:
      "Add two mismatched towels, a woven hamper, a half-used tissue box, a bath mat, and a few plain daily-care items grouped imperfectly."
  },
  {
    asin: "B0829N8C9G",
    styleSlug: "modern-marble",
    slot: 4,
    sceneId: "marble-hotel-inspired-oblique-night",
    room:
      "A different hotel-inspired home bathroom with cream marble-look tile, a narrow wall-hung vanity, rounded rectangular mirror, brushed-brass sconce, and a closed shower door in the far background.",
    camera:
      "Oblique top-down 35mm-equivalent smartphone shot taken from just above sink height, framing the basin diagonally. Let the product sit in the upper-left third and show more countertop texture than a product catalog would.",
    lighting:
      "Warm nighttime practical light only, with believable yellow warmth and a little phone-camera shadow noise. Metal highlights should be localized and no brighter than the faucet.",
    productPlacement:
      "Rotate the dispenser about 230 degrees, pump spout aimed toward the basin and away from the camera. Maintain true brushed-steel roughness, grounded contact shadow, and room-matched reflections.",
    livedInDetails:
      "Include a loosely rolled washcloth, reading glasses near the mirror, a plain lotion pump, and a small tray that is not perfectly parallel to the vanity edge."
  },
  {
    asin: "B0829N8C9G",
    styleSlug: "modern-marble",
    slot: 5,
    sceneId: "marble-vintage-renovation-side-daylight",
    room:
      "A distinct renovated vintage bathroom with a small marble remnant countertop, painted sage-gray cabinet, original plaster wall, oval medicine cabinet, and classic hex floor tile.",
    camera:
      "Handheld vertical photo from a low 35mm-equivalent side angle near the open door. A blurred doorframe occupies a thin foreground strip, giving the frame a casual observational feel.",
    lighting:
      "Neutral late-morning window light with a gentle bright patch on the wall, not on the dispenser. Use ordinary smartphone dynamic range, modest sharpening, and no cinematic grading.",
    productPlacement:
      "Turn the dispenser about 315 degrees so the right-front quarter is visible and the spout points left across the sink. Keep it slightly darker than the white basin and integrated into the scene.",
    livedInDetails:
      "Add a cotton hand towel, a small ceramic tumbler, a hair tie, and a partly open lower drawer with neatly stacked washcloths visible."
  },
  {
    asin: "B0D2KK6MNS",
    styleSlug: "boho-earth-tones",
    slot: 1,
    sceneId: "boho-rental-tub-closed-morning",
    room:
      "A real rental bathroom with a standard alcove tub, warm cream walls, simple tan tile, oak-look vinyl floor, and one small high window; not an architectural showpiece.",
    camera:
      "Vertical 28mm-equivalent handheld smartphone photograph from the doorway at chest height. Show the full curtain closed on one straight wall-to-wall rod, slightly off-center, with ordinary perspective convergence.",
    lighting:
      "Soft late-morning window light plus a weak warm ceiling fixture. Let folds create uneven but natural shadow bands; avoid a separately lit curtain, theatrical glow, or perfectly even exposure.",
    productPlacement:
      "Hang the same full-length muted terracotta-rust curtain on silver metal hooks. The panel is mostly closed, with irregular everyday fold widths and the bottom hem hanging naturally just inside the tub.",
    livedInDetails:
      "Include a woven laundry basket, muted clay bath mat, two neutral towels on hooks, a small wood stool, and a few bath bottles with unreadable labels."
  },
  {
    asin: "B0D2KK6MNS",
    styleSlug: "boho-earth-tones",
    slot: 2,
    sceneId: "boho-tub-side-partly-open-afternoon",
    room:
      "A different older-home bathroom with an enameled tub, ivory square tile, terracotta floor, cane-front vanity, and a narrow shelf holding folded towels.",
    camera:
      "Handheld 35mm-equivalent vertical photo from the tub side near faucet height, looking diagonally toward the room. The curtain is seen from an unusual side angle rather than as a flat front elevation.",
    lighting:
      "Warm afternoon daylight from a window behind the curtain, making the linen weave visible without turning the panel translucent or orange. Retain realistic shadow detail and no commercial softbox look.",
    productPlacement:
      "Draw the same curtain about one-quarter open toward camera-left so the panel bunches more densely on one side. Keep one straight rod, silver hooks, plain hem, solid color, and no tieback.",
    livedInDetails:
      "Show a trailing plant on the shelf, a striped but muted hand towel, a ceramic soap dish, a natural sponge, and a slightly rumpled bath mat."
  },
  {
    asin: "B0D2KK6MNS",
    styleSlug: "boho-earth-tones",
    slot: 3,
    sceneId: "boho-family-bath-wide-evening",
    room:
      "A distinct family bathroom with white subway tile, warm beige paint, a painted wood vanity, patterned but subdued floor runner, and a hamper beside the tub.",
    camera:
      "Wide 24mm-equivalent portrait smartphone view from the hall, standing height, including sink, mirror, toilet edge, and tub. The curtain establishes the palette but does not fill the frame.",
    lighting:
      "Early evening with the warm vanity bulbs on and dim blue window light remaining. Preserve mixed color temperature and ordinary phone-camera grain; avoid perfect real-estate lighting.",
    productPlacement:
      "Hang the curtain fully closed but shift the camera to its right rear quarter so its folds and side return differ from the first scene. Keep the panel's exact solid terracotta-rust identity.",
    livedInDetails:
      "Include a child's bath toy basket low in the frame, two used towels, toilet paper, a lidded trash bin, and several everyday toiletries without readable labels."
  },
  {
    asin: "B0D2KK6MNS",
    styleSlug: "boho-earth-tones",
    slot: 4,
    sceneId: "boho-small-bath-low-angle-rain",
    room:
      "A different compact bathroom with limewashed sand-colored walls, handmade-look cream tile, a simple pedestal sink, and a small rain-speckled window.",
    camera:
      "Low 28mm-equivalent handheld vertical view from near hamper height, angled upward toward the curtain and rod. Allow slight lens distortion and asymmetry while keeping the rod straight and physically plausible.",
    lighting:
      "Dim rainy-day diffuse light with one amber sconce. Let the lower curtain fall into softer shadow and retain subtle fabric texture; do not brighten the product independently.",
    productPlacement:
      "The same curtain is about one-third open toward camera-right, with deeper compressed folds at the gathered side and broader folds across the remaining panel. No tieback or curved rail.",
    livedInDetails:
      "Add a woven bin with towels, a teak bath mat, a robe on a hook, and a small unlabeled amber bottle on the sink."
  },
  {
    asin: "B0D2KK6MNS",
    styleSlug: "boho-earth-tones",
    slot: 5,
    sceneId: "boho-tub-interior-detail-midday",
    room:
      "A distinct sunlit bathroom with pale clay plaster, small-format cream tile around the tub, natural wood window trim, and a simple wall niche.",
    camera:
      "Vertical 50mm-equivalent smartphone detail from inside the dry tub looking outward at the back side of the curtain and a slice of the room. Keep enough context to understand the installation and avoid catalog flatness.",
    lighting:
      "Dappled but soft midday window light filtered by a thin blind. Show minor exposure variation across the linen and a little phone-camera texture without clipping warm fabric highlights.",
    productPlacement:
      "Show the same curtain partly drawn, viewed from its reverse side at a rear three-quarter angle. Preserve solid terracotta-rust color, plain hem, silver hook silhouettes, and linen-like weave.",
    livedInDetails:
      "Include a bath brush in the niche, folded neutral towel on the vanity, a small plant, and an imperfectly aligned cotton runner beyond the tub."
  },
  {
    asin: "B0D2KK6MNS",
    styleSlug: "warm-editorial",
    slot: 1,
    sceneId: "warm-editorial-plaster-doorway-morning",
    room:
      "A lived-in renovated bathroom with warm putty plaster walls, an ordinary white alcove tub, creamy tile, oak vanity, and a narrow vintage mirror; refined but attainable.",
    camera:
      "Handheld vertical smartphone shot from the doorway at a 35mm-equivalent view, chest height, with a little doorframe in the foreground. The curtain is offset in the composition rather than presented straight-on.",
    lighting:
      "Quiet overcast morning light from a side window plus reflected warm wall color. Keep soft natural contrast and a slightly imperfect automatic white balance; no studio fill.",
    productPlacement:
      "Hang the same curtain nearly closed with a small hand-width opening on camera-right. Use one straight rod, naturally varied folds, and the same silver hooks and plain hem.",
    livedInDetails:
      "Add a rumpled ivory hand towel, ceramic cup, half-used tissue box, small framed art with no readable text, and a laundry hamper partly cropped by the door."
  },
  {
    asin: "B0D2KK6MNS",
    styleSlug: "warm-editorial",
    slot: 2,
    sceneId: "warm-editorial-tub-side-golden-hour",
    room:
      "A different bathroom with peach-beige painted walls, white zellige-look tub surround, aged-brass fixtures, pale wood vanity, and a linen shade over a small window.",
    camera:
      "Vertical 28mm-equivalent smartphone photograph from beside the tub at shoulder height, looking along the rod. The perspective shows the curtain's depth and side folds instead of repeating a front elevation.",
    lighting:
      "Late-afternoon sunlight filtered through the linen shade creates a gentle warm patch on the wall and uneven ambient light across the curtain. Do not make it uniformly luminous or saturated.",
    productPlacement:
      "Draw the curtain about 40 percent open toward camera-left, producing compact folds at the gathered section and a relaxed diagonal leading edge. No tieback, extra panel, or curved rod.",
    livedInDetails:
      "Include a folded but slightly uneven bath towel, one amber bath bottle with no readable label, a wood bath brush, and a pair of slippers near the mat."
  },
  {
    asin: "B0D2KK6MNS",
    styleSlug: "warm-editorial",
    slot: 3,
    sceneId: "warm-editorial-shared-room-wide-night",
    room:
      "A distinct shared bathroom with cream plaster-look walls, a basic white vanity, simple tub, warm oak shelving, and stone-look floor tile.",
    camera:
      "Wide 24mm-equivalent vertical phone image from the hall at standing height, with slight handheld tilt and ordinary edge stretching. Include the full room so the curtain is one element in a believable household space.",
    lighting:
      "Nighttime practical lighting from two warm sconces and a dim ceiling fixture. Preserve darker corners and a little natural smartphone noise; do not flatten the room or spotlight the curtain.",
    productPlacement:
      "The same curtain is fully closed but viewed from a left three-quarter angle, with physically different fold spacing caused by the oblique perspective. Maintain the exact solid muted rust color.",
    livedInDetails:
      "Add a towel over the vanity edge, open shelf with mixed folded towels, hairbrush, bath mat with a curled corner, and a wastebasket."
  },
  {
    asin: "B0D2KK6MNS",
    styleSlug: "warm-editorial",
    slot: 4,
    sceneId: "warm-editorial-bath-detail-backlit-rain",
    room:
      "A different small bathroom with warm gray plaster, classic square tile, old painted window trim, pedestal sink, and one simple wall hook.",
    camera:
      "Close 50mm-equivalent vertical smartphone detail from sink-side height, framing the curtain at an oblique angle with the window and room edge still visible. Avoid a perfectly squared product composition.",
    lighting:
      "Soft rainy-day backlight through frosted glass, producing believable muted folds with gentle shadow noise. Retain terracotta color without glowing edges or artificial translucency.",
    productPlacement:
      "The same curtain is about one-fifth open and seen from the room side near its leading edge. The straight rod and silver hooks remain visible; the hem hangs naturally with slight unevenness.",
    livedInDetails:
      "Include a damp hand towel, ceramic soap dish, small radiator, and a bathrobe softly blurred at the edge of frame."
  },
  {
    asin: "B0D2KK6MNS",
    styleSlug: "warm-editorial",
    slot: 5,
    sceneId: "warm-editorial-tub-interior-low-afternoon",
    room:
      "A distinct warm bathroom with dusty-cream wall tile, pale pink-beige paint, oak storage cabinet, and terrazzo-look floor just beyond the tub.",
    camera:
      "Low vertical 35mm-equivalent smartphone view from the dry tub interior looking out toward the vanity. The curtain occupies one side of the frame and the room occupies the other, creating a candid in-use viewpoint.",
    lighting:
      "Neutral afternoon ambient light with subtle warm bounce from the walls. Use realistic exposure roll-off and phone texture; no cinematic grade, perfect symmetry, or product halo.",
    productPlacement:
      "Pull the same curtain roughly halfway closed so it forms a diagonal plane viewed from its reverse side. Preserve the plain unprinted linen-like textile, silver hooks, exact color family, and finished hem.",
    livedInDetails:
      "Show a small stack of towels, lotion bottle without readable branding, a loosely placed bath mat, and a plant on top of the storage cabinet."
  },
  {
    asin: "B0DC7VG6Z9",
    styleSlug: "japandi",
    slot: 1,
    sceneId: "japandi-walk-in-side-morning",
    room:
      "A calm but lived-in bathroom with warm off-white plaster, small walk-in shower, pale stone floor, light-oak vanity, and simple cotton blind.",
    camera:
      "Handheld vertical smartphone image at seated eye level from outside the shower, 35mm-equivalent, with the bench in the lower-left third and a natural view into the rest of the room.",
    lighting:
      "Soft overcast morning window light with gentle warm bounce from the oak. The bamboo must share the room's exposure and be slightly darker than the pale floor, with no isolated product light.",
    productPlacement:
      "Place the exact bench just outside the shower, front three-quarter orientation around 30 degrees. Keep all four legs grounded and show the slatted top, bowed apron, and lower shelf.",
    livedInDetails:
      "Put one loosely folded cotton towel on the lower shelf, a small ceramic bath cup on the vanity, simple slippers, and one unlabeled cleanser. Keep everyday spacing."
  },
  {
    asin: "B0DC7VG6Z9",
    styleSlug: "japandi",
    slot: 2,
    sceneId: "japandi-tub-side-close-afternoon",
    room:
      "A different compact bathroom with a standard white tub, warm beige tile, pale wood medicine cabinet, plaster wall, and a small recessed shelf.",
    camera:
      "Close 50mm-equivalent vertical smartphone photograph from tub-rim height, showing the bench's left side and top at a natural shallow angle. Depth of field remains mostly phone-like and not artificially blurred.",
    lighting:
      "Uneven late-afternoon indirect daylight from camera-right. Preserve natural bamboo grain and shadow under the lower shelf without lifting the product brighter than the tub surround.",
    productPlacement:
      "Rotate the bench about 90 degrees so its narrow side faces the camera and the slatted top runs away into the frame. Place it beside the tub as a towel perch, with no person.",
    livedInDetails:
      "Lay one casually folded neutral towel across part of the top, place a bath brush on the lower shelf, and include a slightly used soap bar and plain bottle in the recessed shelf."
  },
  {
    asin: "B0DC7VG6Z9",
    styleSlug: "japandi",
    slot: 3,
    sceneId: "japandi-family-bath-wide-evening",
    room:
      "A distinct attainable family bathroom with cream tile, pale wood vanity, ordinary shower-tub, warm-gray walls, and a tall narrow storage cabinet.",
    camera:
      "Wide 24mm-equivalent vertical smartphone shot from the open doorway at standing height, with mild lens stretching and a subtly imperfect horizon. The bench is visible beside the tub but is not oversized or centered.",
    lighting:
      "Early-evening mix of cool window light and warm ceiling light, with believable darker corners and ordinary phone dynamic range. The product must not be the brightest element.",
    productPlacement:
      "Show a rear three-quarter orientation around 155 degrees, lower shelf and leg structure still legible, positioned parallel to the tub rather than facing the camera.",
    livedInDetails:
      "Include a hamper, two towels at different heights, bath mat, tissue box, and several plain daily toiletries. The room should feel occupied, not staged."
  },
  {
    asin: "B0DC7VG6Z9",
    styleSlug: "japandi",
    slot: 4,
    sceneId: "japandi-shower-oblique-rain",
    room:
      "A different small walk-in shower with textured warm-gray tile, plaster ceiling, simple chrome hardware, and a frosted window with rain visible.",
    camera:
      "Oblique top-down 28mm-equivalent handheld phone view from just outside the shower, looking across the bench diagonally. Allow a cropped glass-panel edge in the foreground for depth.",
    lighting:
      "Dim diffuse rainy-day light through the frosted window. Let the underside and shelf remain naturally shadowed with subtle noise; avoid glowing bamboo, HDR, or clean studio highlights.",
    productPlacement:
      "Rotate the bench about 225 degrees to show its right rear quarter. It stands safely on the dry side of the shower floor, with the open gaps and dark feet visible.",
    livedInDetails:
      "Put one damp folded washcloth on the lower shelf, include two unlabeled shower bottles in a niche, a natural sponge, and a few plausible water droplets on the tile."
  },
  {
    asin: "B0DC7VG6Z9",
    styleSlug: "japandi",
    slot: 5,
    sceneId: "japandi-pedestal-sink-low-daylight",
    room:
      "A distinct older-home bathroom updated with warm white walls, a pedestal sink, cream hex tile, one light-oak shelf, and a plain linen shower curtain in the background.",
    camera:
      "Low 35mm-equivalent vertical smartphone photo from near floor height beside the vanity, looking slightly upward. A towel edge may softly overlap a small corner of the frame, making it observational rather than catalog-like.",
    lighting:
      "Neutral late-morning daylight with ordinary reflected shadow color. Keep bamboo midtone detail and a grounded contact shadow; no special light or exposure adjustment for the bench.",
    productPlacement:
      "Rotate the bench about 300 degrees so the right-front quarter and bowed apron are visible. Use it as a practical seat near the sink, not as a display pedestal.",
    livedInDetails:
      "Place a small folded towel and hairbrush on the lower shelf, slippers nearby, a robe on a wall hook, and a plain cup on the sink."
  },
  {
    asin: "B0DC7VG6Z9",
    styleSlug: "spa-greenery",
    slot: 1,
    sceneId: "spa-green-tile-shower-morning",
    room:
      "A lived-in bathroom with muted moss-green shower tile, warm white plaster, clear glass panel, stone-look floor, and a small frosted window; relaxing but not a luxury resort.",
    camera:
      "Vertical handheld smartphone view from just outside the shower at chest height, 28mm-equivalent, with the bench in the lower-right third and the vanity partly visible beyond.",
    lighting:
      "Soft morning window light filtered through frosted glass, with gentle green bounce from tile. The bamboo should not be warmer or brighter than the room; no separate key light.",
    productPlacement:
      "Place the exact bench at a front-left three-quarter angle around 40 degrees on the dry shower edge, all legs grounded, slatted top and lower shelf clearly visible.",
    livedInDetails:
      "Include one folded sage towel on the lower shelf, two ordinary shower bottles without readable labels, a bath mat, and a modest potted fern outside the wet zone."
  },
  {
    asin: "B0DC7VG6Z9",
    styleSlug: "spa-greenery",
    slot: 2,
    sceneId: "spa-white-tub-plant-close-midday",
    room:
      "A different bright bathroom with a standard white tub, pale eucalyptus-green walls, simple white tile, cane hamper, and a high shelf with trailing plants.",
    camera:
      "Close vertical 50mm-equivalent phone photo from tub-rim height, viewing the bench from its narrow left side and including the shelf and tub hardware for context.",
    lighting:
      "Diffused midday light from a sheer blind with realistic soft shadows. Keep highlights on bamboo restrained, grain visible, and no HDR or boosted product saturation.",
    productPlacement:
      "Rotate the bench 90 degrees so its side faces the camera. Position it beside the tub as a towel and bath-item perch, maintaining exact two-tier geometry.",
    livedInDetails:
      "Place a loosely folded white towel and small natural sponge on top, one plain bottle on the lower shelf, and show an imperfect bath mat and watering can partly cropped."
  },
  {
    asin: "B0DC7VG6Z9",
    styleSlug: "spa-greenery",
    slot: 3,
    sceneId: "spa-shared-bath-wide-cloudy",
    room:
      "A distinct shared bathroom with sage subway tile, white vanity, ordinary tub-shower, gray-green painted walls, and open shelving with household linens.",
    camera:
      "Wide 24mm-equivalent portrait smartphone image from the doorway at standing height. Preserve mild wide-angle distortion and a casual handheld horizon; the bench is a useful room element rather than a hero object.",
    lighting:
      "Cloudy daylight plus an ordinary ceiling light, mixed naturally with darker shelf recesses. The bench must match the room exposure and not appear pasted in or separately illuminated.",
    productPlacement:
      "Show the bench from a rear three-quarter orientation around 160 degrees near the shower entrance, with the lower shelf and all legs still plausible at room scale.",
    livedInDetails:
      "Include towels of two green tones, a hamper, tissue box, bath mat, small wastebasket, several plain toiletries, and one plant with a few imperfect leaves."
  },
  {
    asin: "B0DC7VG6Z9",
    styleSlug: "spa-greenery",
    slot: 4,
    sceneId: "spa-dark-shower-low-evening",
    room:
      "A different compact shower room with deep olive tile, warm plaster ceiling, simple chrome shower fixtures, and a small shelf niche.",
    camera:
      "Low vertical 28mm-equivalent smartphone view near knee height from outside the shower, angled across the bench toward the niche. Let the glass edge create a subtle foreground reflection without covering the product.",
    lighting:
      "Early-evening practical light with dim cool window spill. Retain shadow texture beneath the bench and a little phone-camera grain; do not lift or spotlight the bamboo.",
    productPlacement:
      "Rotate the bench around 235 degrees to reveal the right rear quarter and open shelf. It sits on a believable dry patch with realistic contact shadows and a few water droplets nearby.",
    livedInDetails:
      "Place a folded dark-green washcloth on the lower shelf, include two unlabeled bottles and a bath brush in the niche, and a robe hanging beyond the shower."
  },
  {
    asin: "B0DC7VG6Z9",
    styleSlug: "spa-greenery",
    slot: 5,
    sceneId: "spa-older-bath-oblique-afternoon",
    room:
      "A distinct older bathroom refreshed with muted green paint, cream square tile, pedestal sink, patterned vinyl floor, and a sunny window filled with a few ordinary houseplants.",
    camera:
      "Oblique top-down 35mm-equivalent handheld vertical photo from shoulder height near the sink, looking diagonally toward the bench and tub. Keep normal phone depth of field and slightly imperfect framing.",
    lighting:
      "Late-afternoon indirect sunlight broken by leaves, producing subtle irregular shadows that fall across both room and product. Prevent clipped bamboo highlights or a warm product glow.",
    productPlacement:
      "Rotate the bench about 310 degrees so its right-front quarter faces the camera. Position it near the tub with one folded towel, while preserving the slat layout, shelf, bowed apron, feet, and open sides.",
    livedInDetails:
      "Add a watering mister, small plant saucer, hairbrush, neutral bath mat, and a couple of everyday toiletries with no readable branding."
  }
] as const;
