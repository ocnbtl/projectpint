const OBSERVED_AT = "2026-07-25T22:00:00-04:00";
const OWNER_DECIDED_AT = "2026-07-26T14:00:00-04:00";
const PROMPT_VERSION = "affiliate-product-v1";

const OWNER_REJECTIONS: Record<string, string> = {
  B07DXCC1WZ: "Too many reviews report towel shedding.",
  B079NB9CG3: "Bad reviews and the product does not match the Brass & Terrazzo style.",
  B0864MF9HD: "The product does not match terrazzo and reads too coastal.",
  B01J9Y164Q: "The colorway does not match Boho Earth Tones.",
  B07MH3C62G: "The product is too expensive.",
  B00HNMN4A6: "The product does not fit Dark & Moody and its quality is questionable.",
  B0D231RK6C: "The item is questionable and has no reviews.",
  B004SK6B8S: "The product is too expensive.",
  B0747PQMS4: "The product is too expensive and does not fit Industrial Loft.",
  B07M8JH2SP: "The design is too complicated for consistent AI reproduction.",
  B0CQ724NXP: "The product is too expensive.",
  B09R2HV6GG: "The product is too expensive and does not fit Coastal Calm.",
  B0BV1971T4: "The product is too expensive.",
  B0B3HYSGCQ: "The product is too expensive.",
  B07WTCTNFF: "The product does not fit Japandi.",
  B0DWBYZNVK: "The product is too expensive.",
  B09W42ND35: "The product does not have enough reviews and is too expensive.",
  B0003WN1R4: "The product is too expensive.",
  B074C6QHWD: "The product does not fit Vintage Eclectic."
};

export interface CandidateInput {
  style: string;
  rank: number;
  asin: string;
  slug: string;
  brand: string;
  name: string;
  category: string;
  price: string;
  rationale: string;
  whyUseful?: string;
  caveats: string[];
  recommendation?: "approve" | "approve_with_caveat" | "replace";
  crossStyleNotes?: string;
  observedAt?: string;
  supportingSources?: SupportingSource[];
  applyOwnerDecision?: boolean;
}

const CATEGORY_UTILITY: Record<string, string> = {
  "bathroom storage": "Gives frequently used bathroom items a defined home and makes the room easier to keep organized.",
  "soap accessory": "Adds a practical handwashing or bathing accessory that can be evaluated without committing to a larger renovation.",
  "bath mat": "Adds a dedicated landing surface beside the bath or shower while letting shoppers compare size, care, and floor compatibility.",
  "bathroom mirror": "Adds a functional grooming surface and a clear visual focal point without changing the room's core layout.",
  "bathroom hardware": "Solves a specific hanging or dispensing need with a finish that can coordinate the room's smaller details.",
  "bathroom textiles": "Changes a large share of the room's color and pattern with an item that is comparatively easy to replace.",
  "bathroom wastebasket": "Adds necessary small-footprint waste storage to a room where floor space is often limited.",
  "towel set": "Provides a coordinated set for daily bath use while carrying the palette through a practical essential.",
  "bathroom seating": "Adds bath-side seating or storage utility, subject to the product's dimensions, care, and load guidance.",
  "bathroom tray": "Contains small daily-use products on the vanity so the recommendation is decorative and organizational.",
  "decorative accent": "Adds a focused decorative layer that can make the style legible without permanent construction.",
  "bathroom lighting": "Addresses vanity illumination and creates a strong style cue, subject to electrical and installation requirements.",
  "live plant": "Introduces a living focal point and organic texture, with care, light, humidity, and pet-safety needs made explicit.",
  "surface finish": "Offers a targeted surface update without a full material replacement, within the maker's substrate and moisture limits.",
  "wall storage": "Adds storage without consuming floor area, subject to wall type, anchors, dimensions, and load guidance."
};

export interface SupportingSource {
  sourceType: "manufacturer" | "retailer" | "editorial" | "community";
  title: string;
  url: string;
  notes: string;
}

const SUPPORTING_SOURCES: Record<string, SupportingSource[]> = {
  B07MM4GXV6: [{ sourceType: "manufacturer", title: "Yamazaki Home Tower Toothbrush Stand specifications", url: "https://www.yamazakihome.com/en/products/h10387", notes: "Brand source for materials, dimensions, and intended use." }],
  B0829N8C9G: [{ sourceType: "manufacturer", title: "OXO Stainless Steel Soap Dispenser", url: "https://www.oxo.com/stainless-steel-soap-dispenser-1.html", notes: "Brand source for dispenser construction and care." }],
  B01KMVJKXE: [{ sourceType: "retailer", title: "iDesign Slim Wastebasket listing", url: "https://www.target.com/p/-/A-1001398048", notes: "Retailer corroboration for product type and dimensions; exact variation must still be matched." }],
  B09SGSMDD3: [{ sourceType: "manufacturer", title: "Umbra Hubba Pebble Mirror", url: "https://umbrajapan.jp/products/hubba-peblu-mirror", notes: "Brand source for the mirror design family and specifications." }],
  B07R43TGDR: [{ sourceType: "manufacturer", title: "Gorilla Grip Memory Foam Bath Rug", url: "https://gorillagrip.com/products/memory-foam-bath-rug", notes: "Brand source for construction and care guidance." }],
  B000MS63E2: [{ sourceType: "retailer", title: "Creative Home Marble Soap Dish", url: "https://business.walmart.com/ip/Creative-Home-Marble-Bullet-Soap-Dish/31031128", notes: "Retailer specification corroboration for the natural-marble product." }],
  B00595JFVG: [{ sourceType: "retailer", title: "Creative Home Marble Vanity Tray", url: "https://www.walmart.com/ip/22639880", notes: "Retailer corroboration for the tray identity and material." }],
  B084DWWQBD: [{ sourceType: "manufacturer", title: "RoomMates Carrara Marble Hexagon StickTiles", url: "https://roommatesdecor.com/products/carrara-marble-hexagon-peel-and-stick-backsplash", notes: "Brand source for coverage and installation; the use guide excludes direct steam, submersion, and shower interiors." }],
  B08TLP2D54: [{ sourceType: "manufacturer", title: "Umbra Hubba Arched Wall Mirror", url: "https://uk.umbra.com/collections/decor/products/hubba-arched-wall-mirror", notes: "Brand source for specifications; brand-store availability can differ from Amazon." }],
  B0F3L72TC3: [
    { sourceType: "manufacturer", title: "Costa Farms Golden Pothos care information", url: "https://images.thdstatic.com/catalog/pdfImages/7e/7e2024db-774c-4e4f-a994-346668a0e21d.pdf", notes: "Grower care reference." },
    { sourceType: "editorial", title: "ASPCA Golden Pothos toxicity reference", url: "https://www.aspca.org/pet-care/aspca-poison-control/toxic-and-non-toxic-plants/devils-ivy", notes: "Authoritative pet-safety evidence: golden pothos is toxic to dogs and cats." }
  ],
  B005MYFCV6: [{ sourceType: "manufacturer", title: "AquaTeak Original Spa Teak Mat", url: "https://aquateak.com/the-original-spa-teak-bath-shower-mat/", notes: "Brand source for material, dimensions, and care context." }],
  B00176AOKM: [{ sourceType: "retailer", title: "Umbra Aquala Bathtub Caddy", url: "https://www.homedepot.ca/product/umbra-aquala-bathtub-caddy-natural/1001413242", notes: "Retailer corroboration for the product identity and extendable design." }],
  B01920JLGM: [{ sourceType: "retailer", title: "EcoDecors Teak Shower Bench listing", url: "https://www.walmart.com/ip/16982465338", notes: "Retailer corroboration; exact variation dimensions and load claim require confirmation." }],
  B008X0VM0Q: [{ sourceType: "manufacturer", title: "Delta Trinsic Towel Ring", url: "https://www.deltafaucet.com/bathroom/product/759460-CZ.html", notes: "Brand specifications and installation information; Delta showed out of stock while Amazon showed availability." }],
  B07GCDNH5L: [{ sourceType: "manufacturer", title: "Moen Voss Double Robe Hook", url: "https://shop.moen.com/products/yb5103ch", notes: "Brand source for the Voss model family; verify the selected brushed-gold finish code." }],
  B079NB9CG3: [{ sourceType: "manufacturer", title: "Blomus SONO Soap Dispenser", url: "https://blomus.us/products/sono-bathroom-soap-dispenser-ceramic-soft-touch-manual-soap-pump-modern-design", notes: "Brand source for material, capacity, and care." }],
  B0864MF9HD: [{ sourceType: "manufacturer", title: "Avanti Linens Coastal Terrazzo collection", url: "https://avantilinens.com/", notes: "Brand-family source; the exact curtain variation remains Amazon-verified." }],
  B01J9Y164Q: [{ sourceType: "manufacturer", title: "Lush Decor Bohemian Stripe Shower Curtain", url: "https://www.lushdecor.com/collections/boho-shower-curtains/products/bohemian-stripe-shower-curtain", notes: "Brand source for dimensions, material, and care." }],
  B07L4J1P9P: [{ sourceType: "retailer", title: "Mkono Macrame Plant Hanger specifications", url: "https://www.desertcart.in/products/337252339-mkono-macrame-wall-planter-wall-plant-hanger-indoor-hanging-planter-basket-with-wood-beads-decorative-flower-pot-holder-no-tassels-for-indoor-outdoor-boho-home-decor-35-inch-ivory", notes: "Marketplace corroboration for the exact ASIN, cotton material, size, and pot exclusion." }],
  B0DC7VG6Z9: [{ sourceType: "manufacturer", title: "Bambusi Bamboo Shower Bench", url: "https://www.bambusi.com/products/bamboo-shower-bench-small-shower-stool-with-storage-shelf-non-slip-shower-seat-bathroom-bench-spa-decor-wooden-shower-bench-foot-rest-shaving-stool-for-shower-suitable-for-indoor-outdoor-use", notes: "Brand source for dimensions, bamboo construction, non-slip feet, care, and avoiding prolonged soaking." }],
  B07PFYZ3DP: [{ sourceType: "manufacturer", title: "Yamazaki Tower Rolling Slim Bathroom Cart", url: "https://www.yamazakihome.com/en-kr/products/h10365", notes: "Brand source for dimensions, materials, load limits, and assembly." }],
  B08JVLK6PL: [{ sourceType: "manufacturer", title: "Umbra Bellwood Cosmetic Organizer", url: "https://www.umbra.com/products/bellwood-organizer", notes: "Brand source for dimensions and materials; brand store showed backorder while Amazon showed availability." }],
  B07G9Y22LY: [{ sourceType: "manufacturer", title: "Zone Denmark Nova One Soap Dispenser", url: "https://www.zonedenmarkshop.com/eu/products/bath/soap-dispensers/zone-denmark-nova-one-soap-dispenser-331217.html", notes: "Brand source for designer, stoneware/ABS construction, coating, and capacity." }],
  B0CQ7LWKBD: [{ sourceType: "manufacturer", title: "SKL Home CloudSoft towel bundles", url: "https://shopsklhome.com/collections/towel-bundles", notes: "Brand source confirms the oatmeal six-piece set and collection." }],
  B01N6LEAEZ: [{ sourceType: "manufacturer", title: "Umbra Hub mirror collection", url: "https://www.umbra.com/collections/gifts-for-the-new-homeowner/products/hub-arched-wall-mirror", notes: "Brand-family source for Hub construction; exact round 24-inch variation remains Amazon-verified." }],
  B07MH3C62G: [{ sourceType: "manufacturer", title: "Blomus MODO Soap Dispenser", url: "https://blomus.us/products/modo-ti-coated-stainless-steel-bathroom-soap-dispenser-manual-soap-pump-industrial-modern-decor?view=json", notes: "Brand source for capacity, titanium-coated steel, non-slip base, dimensions, and care." }],
  B072L3P9BQ: [{ sourceType: "manufacturer", title: "Delta Trinsic Towel Ring, Matte Black", url: "https://www.deltafaucet.com/bathroom/product/759460-BL.html", notes: "Brand specifications and installation information; Delta showed out of stock while Amazon showed availability." }],
  B00HNMN4A6: [{ sourceType: "manufacturer", title: "Madison Park Aubrey Jacquard Shower Curtain", url: "https://madisonpark2010.com/products/aubrey-jacquard-shower-curtain", notes: "Brand source for exact black variation, dimensions, and care." }],
  B07PH12HNB: [{ sourceType: "manufacturer", title: "American Soft Linen six-piece Turkish towel set", url: "https://americansoftlinen.com/products/6-piece-turkish-towel-set", notes: "Brand source for set composition, material, and color family." }],
  B073V6RZ66: [{ sourceType: "manufacturer", title: "Kate and Laurel round mirror collection", url: "https://www.kateandlaurel.com/collections/hutton-mirror-collection", notes: "Brand-family corroboration; exact Travis variation remains Amazon-verified." }],
  B004SK6B8S: [{ sourceType: "manufacturer", title: "Yamazaki RIN Tissue Case", url: "https://www.yamajitsu.co.jp/products/242506", notes: "Brand source for the RIN design, dimensions, and brown variation." }],
  B09WZSQ1M8: [{ sourceType: "manufacturer", title: "MyGift Industrial Pipe Bathroom Shelf", url: "https://www.mygift.com/products/torched-wood-industrial-pipe-bathroom-shelf-set-w-towel-bar", notes: "Brand source for dimensions and mounting; brand store showed sold out while Amazon showed availability." }],
  B00W98NNCI: [{ sourceType: "manufacturer", title: "Design House Kimball light specification sheet", url: "https://pdf.lowes.com/productdocuments/3c0a7d81-dae5-4c8c-ba82-177a124c465f/69925969.pdf", notes: "Manufacturer specification sheet for dimensions and lamp requirements." }],
  B07MYN5XC2: [{ sourceType: "retailer", title: "Franklin Brass Maxted Toilet Paper Holder", url: "https://www.lowes.com/pd/Franklin-Brass-Maxted-Flat-Black-Wall-Mount-Single-Post-Toilet-Paper-Holder/1000792526", notes: "Retailer corroboration for model, finish, and wall-mount form." }],
  B0747PQMS4: [{ sourceType: "manufacturer", title: "Yamazaki Tower Slim Toilet Rack", url: "https://www.yamazakihome.com/en-kr/products/h10286", notes: "Brand source for black variation, dimensions, materials, and load limits." }],
  B07M8JH2SP: [{ sourceType: "manufacturer", title: "Lush Decor Harbor Life Shower Curtain", url: "https://www.lushdecor.com/collections/coastal-shower-curtains-1/products/harbor-life-shower-curtain", notes: "Brand source for exact collection, dimensions, material, and care." }],
  B0CQ724NXP: [{ sourceType: "manufacturer", title: "SKL Home CloudSoft Smoke Blue six-piece set", url: "https://shopsklhome.com/products/cloudsoft-cotton-luxury-6-piece-towel-set-smoke-blue", notes: "Brand source for dimensions, GSM, material, and certification; brand store showed sold out while Amazon showed availability." }],
  B09D8NL8BY: [{ sourceType: "manufacturer", title: "Avanti Abstract Coastal collection", url: "https://avantilinens.com/abstract-coastal/", notes: "Brand source for the ceramic dispenser design and collection materials." }],
  B09R2HV6GG: [{ sourceType: "manufacturer", title: "Kate and Laurel Cates Mirror with Shelf", url: "https://www.kateandlaurel.com/products/cates-framed-wall-mirror-with-shelf", notes: "Brand source for dimensions and construction; brand store requested availability notification while Amazon showed availability." }],
  B07BF8K2ZS: [{ sourceType: "manufacturer", title: "Madison Park Bayside Bath Rug", url: "https://madisonpark2010.com/products/bayside-reversible-high-pile-tufted-bath-rug", notes: "Brand source for 100% cotton construction, bath use, size, design, and care." }],
  B0BV1971T4: [{ sourceType: "manufacturer", title: "Yamazaki Tower Magnetic Bath Stool", url: "https://www.yamazakihome.com/en/products/h11148", notes: "Brand-family source for materials, load guidance, temperature limits, and magnetic-wall requirement; confirm the Amazon height variation." }],
  B0B3HYSGCQ: [{ sourceType: "manufacturer", title: "Zone Denmark Ume Soap Dispenser, Taupe", url: "https://us.zonedenmarkshop.com/products/zone-denmark-ume-soap-dispenser?variant=44445246783667", notes: "Brand source for the taupe variation, form, and pump design." }],
  B07F92T98T: [{ sourceType: "manufacturer", title: "Mind Reader Bali Bamboo Bath Mat", url: "https://mindreaderproducts.com/products/mind-reader-bali-collection-luxury-roll-up-bamboo-shower-bath-mat-23-5-x-16-5-brown", notes: "Brand source for the exact dimensions and material wording." }],
  B07WTCTNFF: [{ sourceType: "manufacturer", title: "Yamazaki Tower Amenity Tray", url: "https://www.yamazakihome.com/en/products/h10327", notes: "Brand source for steel construction, dimensions, color options, and bathroom use." }],
  B0DWBYZNVK: [{ sourceType: "manufacturer", title: "Umbra Bellwood Toilet Paper Holder collection", url: "https://www.umbra.com/collections/toilet-paper-stands", notes: "Brand source confirms the Bellwood toilet-paper holder and reserve product family." }],
  B07SG7BV11: [{ sourceType: "manufacturer", title: "Lush Decor Leah Shower Curtain", url: "https://www.lushdecor.com/collections/84-inch-shower-curtains/products/leah-shower-curtain", notes: "Brand source for floral variations, material, dimensions, and care." }],
  B09W42ND35: [{ sourceType: "manufacturer", title: "Touch of Class Ashfield Oval Wall Mirror", url: "https://www.touchofclass.com/ashfield-oval-wall-mirror-black/p/AZ35-002/", notes: "Brand source for resin construction, dimensions, mounting, and care; exact Amazon variation is aged gold and beige." }],
  B0003WN1R4: [{ sourceType: "manufacturer", title: "Kingston Brass Victorian Towel Ring, Oil-Rubbed Bronze", url: "https://www.kingstonbrass.com/en-ca/products/kingston-brass-ba1114orb-oil-rubbed-bronze", notes: "Brand source for brass construction, dimensions, installation, and living-finish behavior." }],
  B074C6QHWD: [{ sourceType: "manufacturer", title: "Madison Park Casablanca Medallion Bath Rug", url: "https://madisonpark2010.com/products/casablanca-medallion-cotton-tufted-bath-rug", notes: "Brand source for 100% cotton construction, medallion design, size, and care." }],
  B07114HTDD: [{ sourceType: "manufacturer", title: "Creative Scents Victoria collection", url: "https://creativescents.com/pages/sitemap", notes: "Brand source confirms the Victoria lotion-dispenser product family." }]
};

export function affiliateCandidateRecord(input: CandidateInput) {
  const url = `https://www.amazon.com/dp/${input.asin}`;
  const observedAt = input.observedAt ?? OBSERVED_AT;
  const applyOwnerDecision = input.applyOwnerDecision ?? true;
  const ownerRejectionReason = applyOwnerDecision ? OWNER_REJECTIONS[input.asin] : undefined;
  const requestedRecommendation = input.recommendation ?? "approve";
  const recommendation = ownerRejectionReason ? "replace" : requestedRecommendation;
  const approvalStatus = !applyOwnerDecision
    ? "pending"
    : ownerRejectionReason
      ? "rejected"
      : requestedRecommendation === "approve_with_caveat"
        ? "approved_with_caveat"
        : "approved";
  const workflowStatus = !applyOwnerDecision
    ? "needs_approval"
    : ownerRejectionReason
      ? "research"
      : "approved";
  return {
    id: `prod_${input.asin.toLowerCase()}`,
    slug: input.slug,
    asin: input.asin,
    canonicalAmazonUrl: url,
    associatesUrl: null,
    brand: input.brand,
    manufacturer: input.brand,
    category: input.category,
    name: input.name,
    recommendation,
    recommendationRationale: input.whyUseful ?? CATEGORY_UTILITY[input.category] ?? "Adds a specific, practical bathroom-use option that can be evaluated against the listed caveats.",
    caveats: input.caveats,
    crossStyleNotes: input.crossStyleNotes ?? "No duplicate proposed. Consider additional style assignments only after the canonical product is approved.",
    workflowStatus,
    approvalStatus,
    approvalHistory: applyOwnerDecision ? [{
      decision: approvalStatus,
      reason: ownerRejectionReason ?? (
        approvalStatus === "approved_with_caveat"
          ? "Owner approved the initial candidate; the recorded research caveats remain applicable."
          : "Owner approved the initial candidate."
      ),
      decidedAt: OWNER_DECIDED_AT,
      source: "owner"
    }] : [],
    availabilityStatus: "verified_available",
    availabilityObservedAt: observedAt,
    priceObservation: {
      display: input.price,
      observedAt,
      sourceUrl: url
    },
    researchSources: [
      {
        sourceType: "amazon",
        title: `${input.brand} ${input.name} Amazon listing`,
        url,
        observedAt,
        privateReferenceOnly: true,
        notes: "Specific listing, ASIN, displayed price, and purchase availability observed in the Amazon storefront. Price and availability are volatile."
      },
      ...(input.supportingSources ?? SUPPORTING_SOURCES[input.asin] ?? []).map((source) => ({
        ...source,
        observedAt,
        privateReferenceOnly: true
      }))
    ],
    styleAssignments: [{
      styleSlug: input.style,
      role: "primary",
      rank: input.rank,
      rationale: input.rationale
    }],
    transparentPresentation: {
      status: "not_started",
      storageKey: "",
      alt: "",
      promptVersion: PROMPT_VERSION,
      generationVersion: "",
      qaNotes: ""
    },
    mediaSets: [],
    referenceReadiness: "partial",
    mediaCompleteness: "not_started",
    imageQaStatus: "not_started",
    publicationReadiness: "blocked",
    visibility: "private",
    unavailable: false,
    retired: false,
    createdAt: OBSERVED_AT,
    updatedAt: applyOwnerDecision ? OWNER_DECIDED_AT : observedAt
  };
}

const candidate = affiliateCandidateRecord;

export const affiliateCandidateFixtureData = [
  // Minimalist Elegance
  candidate({
    style: "minimalist-elegance", rank: 1, asin: "B07MM4GXV6", slug: "yamazaki-tower-toothbrush-stand-white",
    brand: "Yamazaki Home", name: "Tower Toothbrush Stand, White", category: "bathroom storage", price: "$29.74",
    rationale: "A compact white steel organizer gives the vanity a disciplined, low-visual-noise silhouette.",
    caveats: ["Confirm slot dimensions against the intended toothbrushes or electric-brush heads."]
  }),
  candidate({
    style: "minimalist-elegance", rank: 2, asin: "B0829N8C9G", slug: "oxo-stainless-steel-soap-dispenser",
    brand: "OXO", name: "Good Grips Stainless Steel Soap Dispenser", category: "soap accessory", price: "$25.00",
    rationale: "The restrained stainless cylinder adds useful polish without decorative clutter.",
    caveats: ["Finish can show water spots; capacity and pump compatibility should be checked on the selected variation."]
  }),
  candidate({
    style: "minimalist-elegance", rank: 3, asin: "B01KMVJKXE", slug: "idesign-slim-white-wastebasket",
    brand: "iDesign", name: "Slim White Bathroom Wastebasket", category: "bathroom wastebasket", price: "$12.77",
    rationale: "A narrow, solid-white bin supports the style and solves a real small-bath footprint problem.",
    caveats: ["Open top; confirm dimensions and capacity for the intended location."]
  }),
  candidate({
    style: "minimalist-elegance", rank: 4, asin: "B09SGSMDD3", slug: "umbra-hubba-pebble-wall-mirror-titanium",
    brand: "Umbra", name: "Hubba Pebble Wall Mirror, Titanium", category: "bathroom mirror", price: "$140.00",
    rationale: "The frameless-looking organic outline creates one sculptural focal point while keeping the palette quiet.",
    caveats: ["Listing color is titanium rather than white; verify wall anchors, dimensions, and bathroom placement."]
  }),
  candidate({
    style: "minimalist-elegance", rank: 5, asin: "B07R43TGDR", slug: "gorilla-grip-white-memory-foam-bath-rug",
    brand: "Gorilla Grip", name: "Memory Foam Bath Rug, White, 24 x 17", category: "bath mat", price: "$19.99",
    rationale: "The simple white surface adds comfort while preserving the monochrome, uncluttered look.",
    caveats: ["Confirm backing suitability for the floor finish and follow the listing care instructions."]
  }),

  // Modern Marble
  candidate({
    style: "modern-marble", rank: 1, asin: "B000MS63E2", slug: "creative-home-champagne-marble-soap-dish",
    brand: "Creative Home", name: "Natural Champagne Marble Soap Dish", category: "soap accessory", price: "$18.99",
    rationale: "Real stone veining introduces marble in a small, functional dose that works on most vanities.",
    caveats: ["Natural stone color and veining vary; confirm drain design and sealing/care guidance."]
  }),
  candidate({
    style: "modern-marble", rank: 2, asin: "B00595JFVG", slug: "creative-home-champagne-marble-vanity-tray",
    brand: "Creative Home", name: "Natural Champagne Marble Vanity Tray", category: "bathroom tray", price: "$39.99",
    rationale: "A stone tray organizes daily products while turning the marble cue into a deliberate surface.",
    caveats: ["Natural stone variation and weight are expected; confirm dimensions before purchase."]
  }),
  candidate({
    style: "modern-marble", rank: 3, asin: "B081KBL53J", slug: "mdesign-mirri-white-marble-wastebasket",
    brand: "mDesign", name: "Mirri White-Marble Metal Wastebasket", category: "bathroom wastebasket", price: "$26.99",
    rationale: "The marble-look finish carries the style into an overlooked utility item without requiring renovation.",
    caveats: ["The finish is a printed marble look, not natural stone; confirm coating and cleaning guidance."]
  }),
  candidate({
    style: "modern-marble", rank: 4, asin: "B084DWWQBD", slug: "roommates-carrara-hexagon-sticktiles",
    brand: "RoomMates", name: "StickTiles Carrara Marble Hexagon Peel-and-Stick Tile", category: "surface finish", price: "$12.49",
    rationale: "The small-scale hex pattern can create a convincing vanity backsplash accent with renter-friendly installation.",
    caveats: ["The brand use guide supports humid bathrooms but excludes direct steam, submersion, and shower interiors; verify substrate, seams, and removal limits."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "modern-marble", rank: 5, asin: "B08TLP2D54", slug: "umbra-hubba-arched-wall-mirror-brass",
    brand: "Umbra", name: "Hubba Arched Wall Mirror, Brass", category: "bathroom mirror", price: "$160.00",
    rationale: "The slim brass arch gives veined surfaces a warm contemporary counterpoint and a clear vanity focal point.",
    caveats: ["Umbra's own storefront was backordered when checked while Amazon showed availability; verify variation, mounting hardware, and final dimensions."]
  }),

  // Spa Greenery
  candidate({
    style: "spa-greenery", rank: 1, asin: "B0F3L72TC3", slug: "costa-farms-golden-pothos-hanging-basket",
    brand: "Costa Farms", name: "Golden Pothos Live Plant, 10-Inch Hanging Basket", category: "live plant", price: "$31.99",
    rationale: "A trailing pothos supplies the living green canopy that makes the spa concept read immediately.",
    caveats: ["Live-plant size, fullness, and shipping condition vary.", "ASPCA identifies golden pothos as toxic to dogs and cats; placement requires care."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "spa-greenery", rank: 2, asin: "B005MYFCV6", slug: "aquateak-original-spa-teak-bath-mat",
    brand: "AquaTeak", name: "Original Spa Teak Bath and Shower Mat", category: "bath mat", price: "$79.95",
    rationale: "Slatted teak brings a warm spa-floor cue and a practical elevated surface.",
    caveats: ["Wood care, drainage, slip behavior, and placement guidance should be followed; confirm exact size."]
  }),
  candidate({
    style: "spa-greenery", rank: 3, asin: "B00176AOKM", slug: "umbra-aquala-bamboo-bath-caddy",
    brand: "Umbra", name: "Aquala Extendable Bamboo Bath Caddy", category: "bathroom storage", price: "$51.00",
    rationale: "The bamboo bridge makes the bath feel intentional and gives a useful landing place for a calm ritual.",
    caveats: ["Confirm tub-width range and keep electronics away from water regardless of tray slots."]
  }),
  candidate({
    style: "spa-greenery", rank: 4, asin: "B07DXCC1WZ", slug: "skl-home-air-cloud-eucalyptus-towel-set",
    brand: "SKL Home", name: "Air Cloud Six-Piece Towel Set, Eucalyptus", category: "towel set", price: "$29.99",
    rationale: "Muted eucalyptus textiles reinforce the botanical palette without adding literal plant motifs.",
    caveats: ["Confirm towel dimensions, fiber content, and care instructions for this color variation."]
  }),
  candidate({
    style: "spa-greenery", rank: 5, asin: "B01920JLGM", slug: "ecodecors-teak-shower-bench-18",
    brand: "EcoDecors", name: "Teak Shower Bench, 18 Inch", category: "bathroom seating", price: "$124.98",
    rationale: "A compact teak bench adds spa utility, layered storage, and a strong natural-material anchor.",
    caveats: ["Verify dimensions, stated load limit, maintenance, and whether the intended shower floor is level."]
  }),

  // Brass & Terrazzo
  candidate({
    style: "brass-terrazzo", rank: 1, asin: "B008X0VM0Q", slug: "delta-trinsic-towel-ring-champagne-bronze",
    brand: "Delta", name: "Trinsic Square Towel Ring, Champagne Bronze", category: "bathroom hardware", price: "$30.95",
    rationale: "The clean square form delivers the precise champagne-brass note that balances lively terrazzo.",
    caveats: ["Delta's own storefront showed this finish out of stock while Amazon showed it available; confirm finish code and installation clearances."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "brass-terrazzo", rank: 2, asin: "B07GCDNH5L", slug: "moen-voss-double-robe-hook-brushed-gold",
    brand: "Moen", name: "Voss Double Robe Hook, Brushed Gold", category: "bathroom hardware", price: "$19.35",
    rationale: "A compact brushed-gold hook expands the metal story while adding useful hanging capacity.",
    caveats: ["The observed listing is the Voss model; confirm finish matching with other brass or bronze pieces."]
  }),
  candidate({
    style: "brass-terrazzo", rank: 3, asin: "B079NB9CG3", slug: "blomus-sono-soap-dispenser-microchip",
    brand: "Blomus", name: "SONO Ceramic Soap Dispenser, Microchip", category: "soap accessory", price: "$34.04",
    rationale: "The softly speckled neutral body echoes terrazzo chips while leaving brass hardware visually dominant.",
    caveats: ["Confirm the selected color and pump finish; ceramic can chip if dropped."]
  }),
  candidate({
    style: "brass-terrazzo", rank: 4, asin: "B0DS28YHKH", slug: "luxspire-terrazzo-resin-vanity-tray",
    brand: "Luxspire", name: "Terrazzo-Look Resin Vanity Tray, 8 x 4", category: "bathroom tray", price: "$14.99",
    rationale: "The small tray supplies the terrazzo pattern at low commitment and contains daily countertop items.",
    caveats: ["This is resin with a terrazzo look, not stone terrazzo; verify exact dimensions and heat/cleaner limits."]
  }),
  candidate({
    style: "brass-terrazzo", rank: 5, asin: "B0864MF9HD", slug: "avanti-coastal-terrazzo-shower-curtain",
    brand: "Avanti Linens", name: "Coastal Terrazzo Shower Curtain", category: "bathroom textiles", price: "$31.99",
    rationale: "Its scattered color blocks make terrazzo the room-scale pattern while remaining easy to replace.",
    caveats: ["Confirm dimensions, fabric content, liner requirement, and that the coastal motifs suit the intended board."]
  }),

  // Boho Earth Tones
  candidate({
    style: "boho-earth-tones", rank: 1, asin: "B01J9Y164Q", slug: "lush-decor-bohemian-stripe-shower-curtain",
    brand: "Lush Decor", name: "Bohemian Stripe Shower Curtain, Turquoise and Orange", category: "bathroom textiles", price: "$16.56",
    rationale: "Layered warm stripes make the textile the room's folk-pattern anchor without permanent installation.",
    caveats: ["Confirm liner requirement and final color balance; the turquoise accent is stronger than a purely earth-tone palette."]
  }),
  candidate({
    style: "boho-earth-tones", rank: 2, asin: "B0DD3C9KFR", slug: "folkulture-ripple-bath-mat-terracotta",
    brand: "Folkulture", name: "Scalloped Ripple Bath Mat, Terracotta", category: "bath mat", price: "$21.00",
    rationale: "The rust color and wavy edge add handmade energy in a useful, compact footprint.",
    caveats: ["Verify backing, wash care, absorbency, and actual color under bathroom lighting."]
  }),
  candidate({
    style: "boho-earth-tones", rank: 3, asin: "B07L4J1P9P", slug: "mkono-macrame-plant-hanger-ivory",
    brand: "Mkono", name: "Macrame Plant Hanger, Ivory, 35 Inch", category: "decorative accent", price: "$7.99",
    rationale: "Macrame introduces the woven, suspended craft cue associated with relaxed bohemian rooms.",
    caveats: ["Plant pot and mounting hardware are not included; verify anchor strength and keep the installation clear of wet traffic."]
  }),
  candidate({
    style: "boho-earth-tones", rank: 4, asin: "B08XVTDB5K", slug: "la-jolie-muse-paper-rope-baskets-brown",
    brand: "LA JOLIE MUSE", name: "Paper-Rope Wicker Storage Baskets, Brown, Three Pack", category: "bathroom storage", price: "$25.99",
    rationale: "The woven brown texture turns practical shelf organization into a warm natural layer.",
    caveats: ["Paper rope is not intended for sustained soaking; confirm dimensions and keep away from direct spray."]
  }),
  candidate({
    style: "boho-earth-tones", rank: 5, asin: "B0DC7VG6Z9", slug: "bambusi-bamboo-shower-bench-natural",
    brand: "Bambusi", name: "Bamboo Shower Bench with Storage Shelf, Natural", category: "bathroom seating", price: "$44.99",
    rationale: "The simple bamboo bench adds an earthy furniture note plus towel or basket storage.",
    caveats: ["Brand guidance says to air-dry after use and avoid prolonged soaking; confirm the selected finish, load limit, assembly, and exact dimensions."],
    recommendation: "approve_with_caveat"
  }),

  // Scandinavian Clean
  candidate({
    style: "scandinavian-clean", rank: 1, asin: "B07PFYZ3DP", slug: "yamazaki-tower-slim-rolling-cart-white",
    brand: "Yamazaki Home", name: "Tower Slim Rolling Storage Cart, White", category: "bathroom storage", price: "$165.00",
    rationale: "A narrow white utility cart embodies Scandinavian efficiency and makes awkward gaps useful.",
    caveats: ["Confirm width, caster clearance, shelf height, and delivered configuration."]
  }),
  candidate({
    style: "scandinavian-clean", rank: 2, asin: "B08JVLK6PL", slug: "umbra-bellwood-vanity-organizer-white-natural",
    brand: "Umbra", name: "Bellwood Vanity Organizer, White and Natural", category: "bathroom storage", price: "$48.00",
    rationale: "White surfaces with one light-wood handle create a clean, friendly organizer rather than a clinical one.",
    caveats: ["Umbra showed the white/natural variation on backorder while Amazon showed it available; confirm tray dimensions and material care around standing water."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "scandinavian-clean", rank: 3, asin: "B07G9Y22LY", slug: "zone-denmark-nova-soap-dispenser-soft-gray",
    brand: "Zone Denmark", name: "Nova Soap Dispenser, Soft Gray", category: "soap accessory", price: "$34.99",
    rationale: "The matte rounded form and muted gray tone fit a quiet Nordic vanity palette.",
    caveats: ["Confirm capacity, finish, and selected variation; the soft-touch surface may need gentle cleaning."]
  }),
  candidate({
    style: "scandinavian-clean", rank: 4, asin: "B0CQ7LWKBD", slug: "skl-home-cloudsoft-towel-set-oatmeal",
    brand: "SKL Home", name: "CloudSoft Cotton Six-Piece Towel Set, Oatmeal", category: "towel set", price: "$79.99",
    rationale: "Warm oatmeal textiles soften a pale bathroom while maintaining the restrained Scandinavian palette.",
    caveats: ["Confirm GSM, dimensions, and care instructions for the exact six-piece variation."]
  }),
  candidate({
    style: "scandinavian-clean", rank: 5, asin: "B00FZJUXVC", slug: "idesign-formbu-bamboo-wastebasket",
    brand: "iDesign", name: "Formbu Rectangular Bamboo Wastebasket", category: "bathroom wastebasket", price: "$25.64",
    rationale: "The plain bamboo box is both useful and visually warm, with no ornamental noise.",
    caveats: ["Natural bamboo should be kept out of direct spray; confirm capacity and care guidance."]
  }),

  // Dark & Moody
  candidate({
    style: "dark-moody", rank: 1, asin: "B01N6LEAEZ", slug: "umbra-hub-round-mirror-black-24",
    brand: "Umbra", name: "Hub Round Wall Mirror, Black, 24 Inch", category: "bathroom mirror", price: "$97.02",
    rationale: "A broad black rim creates the graphic vanity anchor a dark room needs without ornate detailing.",
    caveats: ["Confirm diameter, depth, wall anchors, and clearance above the faucet."]
  }),
  candidate({
    style: "dark-moody", rank: 2, asin: "B07MH3C62G", slug: "blomus-modo-soap-dispenser-black",
    brand: "Blomus", name: "MODO Soap Dispenser, Black", category: "soap accessory", price: "$69.95",
    rationale: "The near-monolithic black form makes a small daily object feel architectural and intentional.",
    caveats: ["Confirm coating, capacity, and cleaner compatibility; independent retailer reviews include complaints about soap tracking down the body."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "dark-moody", rank: 3, asin: "B072L3P9BQ", slug: "delta-trinsic-towel-ring-matte-black",
    brand: "Delta", name: "Trinsic Square Towel Ring, Matte Black", category: "bathroom hardware", price: "$20.75",
    rationale: "The crisp matte-black square carries the dark palette into functional wall hardware.",
    caveats: ["Delta showed the model out of stock while Amazon showed it available; the open arm is fixed/non-reversible and requires secure installation."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "dark-moody", rank: 4, asin: "B07PQN436L", slug: "idesign-slim-black-wastebasket",
    brand: "iDesign", name: "Slim Black Bathroom Wastebasket", category: "bathroom wastebasket", price: "$15.99",
    rationale: "A narrow black bin disappears into the palette while solving a necessary storage problem.",
    caveats: ["Open top; confirm footprint and capacity for the intended alcove."]
  }),
  candidate({
    style: "dark-moody", rank: 5, asin: "B00HNMN4A6", slug: "madison-park-aubrey-black-shower-curtain",
    brand: "Madison Park", name: "Aubrey Black Paisley Shower Curtain", category: "bathroom textiles", price: "$21.49",
    rationale: "The black-on-neutral pattern gives the board layered drama instead of relying on flat dark paint alone.",
    caveats: ["Confirm the exact pattern scale, liner requirement, and fabric care."]
  }),

  // Warm Editorial
  candidate({
    style: "warm-editorial", rank: 1, asin: "B0D231RK6C", slug: "creative-coop-brown-reactive-glaze-vase",
    brand: "Creative Co-Op", name: "Gourd-Shaped Stoneware Vase, Brown Reactive Glaze", category: "decorative accent", price: "$21.32",
    rationale: "Its amber-brown glaze supplies a photographed, collected-object focal point on a shelf or vanity.",
    caveats: ["Reactive glaze varies piece to piece; confirm watertight use if displaying fresh stems."]
  }),
  candidate({
    style: "warm-editorial", rank: 2, asin: "B07PH12HNB", slug: "american-soft-linen-dark-brown-towel-set",
    brand: "American Soft Linen", name: "Six-Piece Turkish Cotton Towel Set, Dark Brown", category: "towel set", price: "$39.99",
    rationale: "Deep brown towels add the tonal warmth and textile weight of an editorial bath vignette.",
    caveats: ["The observed color is dark brown rather than terracotta; verify dimensions, GSM, certification wording, and care."]
  }),
  candidate({
    style: "warm-editorial", rank: 3, asin: "B073V6RZ66", slug: "kate-laurel-travis-round-mirror-gold",
    brand: "Kate and Laurel", name: "Travis Round Wall Mirror, Gold, 25.6 Inch", category: "bathroom mirror", price: "$67.49",
    rationale: "A warm gold circle gives the room a strong composition without overwhelming smaller walls.",
    caveats: ["Verify frame material, exact color, bathroom suitability, and included hanging hardware."]
  }),
  candidate({
    style: "warm-editorial", rank: 4, asin: "B0BLY4RJMQ", slug: "household-essentials-water-hyacinth-basket",
    brand: "Household Essentials", name: "Water Hyacinth Rectangular Storage Basket", category: "bathroom storage", price: "$23.99",
    rationale: "Handwoven fibers add the tactile natural layer that keeps an editorial palette from feeling staged.",
    caveats: ["Natural fiber should be protected from sustained moisture; confirm dimensions and iron-frame finish."]
  }),
  candidate({
    style: "warm-editorial", rank: 5, asin: "B004SK6B8S", slug: "yamazaki-rin-tissue-case-brown",
    brand: "Yamazaki Home", name: "Rin Tissue Case, Brown", category: "bathroom storage", price: "$63.99",
    rationale: "The wood-forward cover turns an ordinary tissue box into a warm, compositionally quiet object.",
    caveats: ["Confirm tissue-box dimensions and the exact wood/steel color combination."]
  }),

  // Industrial Loft
  candidate({
    style: "industrial-loft", rank: 1, asin: "B09WZSQ1M8", slug: "mygift-industrial-pipe-shelf-towel-bar",
    brand: "MyGift", name: "Industrial Pipe Shelf with Towel Bar", category: "wall storage", price: "$29.99",
    rationale: "Black pipe and a rustic shelf combine storage and towel hanging in one unmistakably industrial piece.",
    caveats: ["MyGift showed the set sold out while Amazon showed it available; verify seller, wall anchors, load rating, dimensions, and wet-zone clearance."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "industrial-loft", rank: 2, asin: "B00W98NNCI", slug: "design-house-kimball-three-light-vanity",
    brand: "Design House", name: "Kimball Three-Light Bathroom Vanity Light, Coffee Bronze", category: "bathroom lighting", price: "$67.92",
    rationale: "Metal shades and a dark bronze rail provide a real loft-lighting gesture above the vanity.",
    caveats: ["Hardwired electrical installation requires a qualified person and local-code compliance; confirm damp rating, bulbs, finish, and dimensions."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "industrial-loft", rank: 3, asin: "B07MYN5XC2", slug: "franklin-brass-maxted-toilet-paper-holder-black",
    brand: "Franklin Brass", name: "Maxted Single-Post Toilet Paper Holder, Matte Black", category: "bathroom hardware", price: "$13.48",
    rationale: "The simple dark metal bracket echoes factory hardware without resorting to novelty pipe fittings.",
    caveats: ["Confirm mounting orientation, roll clearance, hardware, and finish match."]
  }),
  candidate({
    style: "industrial-loft", rank: 4, asin: "B0747PQMS4", slug: "yamazaki-tower-slim-bathroom-storage-black",
    brand: "Yamazaki Home", name: "Tower Slim Bathroom Storage and Toilet Paper Stocker, Black", category: "bathroom storage", price: "$78.00",
    rationale: "A black steel cabinet creates compact, utilitarian storage with a clean workshop silhouette.",
    caveats: ["Confirm the selected color, roll capacity, opening direction, and narrow footprint."]
  }),
  candidate({
    style: "industrial-loft", rank: 5, asin: "B0105KDYXO", slug: "spectrum-utility-wire-basket-industrial-gray",
    brand: "Spectrum Diversified", name: "Utility Steel Wire Storage Basket, Industrial Gray", category: "bathroom storage", price: "$18.20",
    rationale: "Open steel wire keeps folded towels or supplies visible and gives shelves a light industrial texture.",
    caveats: ["Confirm dimensions, finish durability in humid rooms, and whether contents need a liner."]
  }),

  // Coastal Calm
  candidate({
    style: "coastal-calm", rank: 1, asin: "B07M8JH2SP", slug: "lush-decor-harbor-life-shower-curtain",
    brand: "Lush Decor", name: "Harbor Life Shower Curtain, Blue and Taupe", category: "bathroom textiles", price: "$24.94",
    rationale: "The pale ocean scene establishes a calm coastal narrative in one reversible textile layer.",
    caveats: ["Confirm liner requirement and whether the literal seaside illustration is appropriate for the final board."]
  }),
  candidate({
    style: "coastal-calm", rank: 2, asin: "B0CQ724NXP", slug: "skl-home-cloudsoft-towel-set-smoke-blue",
    brand: "SKL Home", name: "CloudSoft Cotton Six-Piece Towel Set, Smoke Blue", category: "towel set", price: "$94.99",
    rationale: "Muted smoke-blue towels create a coastal palette through color rather than novelty motifs.",
    caveats: ["SKL Home showed the Smoke Blue six-piece set sold out while Amazon showed it available; confirm seller, GSM, dimensions, color, and care."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "coastal-calm", rank: 3, asin: "B09D8NL8BY", slug: "avanti-abstract-coastal-soap-dispenser",
    brand: "Avanti Linens", name: "Abstract Coastal Soap Dispenser", category: "soap accessory", price: "$24.98",
    rationale: "Soft blue-and-sand patterning brings the coast to a useful countertop object.",
    caveats: ["Confirm pump finish, capacity, pattern variation, and resin care."]
  }),
  candidate({
    style: "coastal-calm", rank: 4, asin: "B09R2HV6GG", slug: "kate-laurel-cates-white-mirror-shelf",
    brand: "Kate and Laurel", name: "Cates White Framed Mirror with Shelf, 24 x 31", category: "bathroom mirror", price: "$259.99",
    rationale: "A painted-white frame and narrow shelf evoke relaxed cottage millwork while adding display space.",
    caveats: ["The brand page requested availability notification while Amazon showed it available; verify seller, anchors, shelf load, dimensions, and humidity placement."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "coastal-calm", rank: 5, asin: "B07BF8K2ZS", slug: "madison-park-bayside-coastal-bath-rug-blue",
    brand: "Madison Park", name: "Bayside Cotton Tufted Bath Rug, Blue, 21 x 34", category: "bath mat", price: "$24.69",
    rationale: "Blue-and-taupe seaside motifs add a textile coastal cue in a product explicitly made and cared for as a bath rug.",
    caveats: ["It is reversible cotton without rubber backing; use the brand-recommended rug pad and confirm door clearance."],
    crossStyleNotes: "No duplicate proposed; it can also support Vintage Eclectic if a more literal coastal floor accent is desired."
  }),

  // Japandi
  candidate({
    style: "japandi", rank: 1, asin: "B0BV1971T4", slug: "yamazaki-tower-magnetic-bath-chair-white",
    brand: "Yamazaki Home", name: "Tower Magnetic Bath Chair, White", category: "bathroom seating", price: "$88.62",
    rationale: "The crisp low stool and magnetic drying concept combine Japanese bath utility with spare modern form.",
    caveats: ["Magnetic storage requires a compatible flat steel wall; confirm the selected height, dimensions, load guidance, and regional documentation."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "japandi", rank: 2, asin: "B0B3HYSGCQ", slug: "zone-denmark-ume-soap-dispenser-taupe",
    brand: "Zone Denmark", name: "Ume Soap Dispenser, Taupe", category: "soap accessory", price: "$49.99",
    rationale: "The pebble-like taupe form balances Japanese restraint with Scandinavian softness.",
    caveats: ["Confirm capacity, pump material, exact taupe finish, and cleaning guidance."]
  }),
  candidate({
    style: "japandi", rank: 3, asin: "B07F92T98T", slug: "mind-reader-bamboo-bath-mat-brown",
    brand: "Mind Reader", name: "Bamboo Bath Mat, Brown, 23.5 x 16.5", category: "bath mat", price: "$17.78",
    rationale: "Linear wood slats create a warm, orderly transition between bath and floor.",
    caveats: ["The brand's material wording mixes wood and rayon from bamboo; verify construction, slip treatment, drying, and care before wet use."],
    recommendation: "approve_with_caveat"
  }),
  candidate({
    style: "japandi", rank: 4, asin: "B07WTCTNFF", slug: "yamazaki-tower-bathroom-vanity-tray",
    brand: "Yamazaki Home", name: "Tower Steel Bathroom Vanity Tray", category: "bathroom tray", price: "$22.00",
    rationale: "A thin, disciplined tray groups daily objects and reinforces the style's purposeful negative space.",
    caveats: ["Confirm selected color, footprint, silicone feet, and coating care."]
  }),
  candidate({
    style: "japandi", rank: 5, asin: "B0DWBYZNVK", slug: "umbra-bellwood-toilet-paper-holder-white-natural",
    brand: "Umbra", name: "Bellwood Toilet Paper Holder with Storage, White and Natural", category: "bathroom storage", price: "$60.00",
    rationale: "Light wood and white recycled plastic turn necessary storage into a calm hybrid of both Japandi traditions.",
    caveats: ["Confirm roll capacity, tray dimensions, recycled-plastic finish, and floor footprint."]
  }),

  // Vintage Eclectic
  candidate({
    style: "vintage-eclectic", rank: 1, asin: "B07SG7BV11", slug: "lush-decor-leah-floral-shower-curtain-blue",
    brand: "Lush Decor", name: "Leah Floral Shower Curtain, Blue", category: "bathroom textiles", price: "$17.17",
    rationale: "Large watercolor blooms establish a collected floral layer that can mix with aged metals and painted furniture.",
    caveats: ["Confirm liner requirement, pattern placement, and final blue tone."]
  }),
  candidate({
    style: "vintage-eclectic", rank: 2, asin: "B09W42ND35", slug: "touch-of-class-ashfield-acanthus-mirror",
    brand: "Touch of Class", name: "Ashfield Acanthus Leaf Wall Mirror, Aged Gold and Beige", category: "bathroom mirror", price: "$125.00",
    rationale: "The aged-gold acanthus frame gives the vanity a convincing antique-style focal point.",
    caveats: ["Verify frame material, dimensions, weight, mounting, and bathroom humidity placement."]
  }),
  candidate({
    style: "vintage-eclectic", rank: 3, asin: "B0003WN1R4", slug: "kingston-brass-victorian-towel-ring-bronze",
    brand: "Kingston Brass", name: "Victorian Towel Ring, Oil-Rubbed Bronze", category: "bathroom hardware", price: "$40.71",
    rationale: "Traditional detailing and dark bronze make functional hardware part of the vintage composition.",
    caveats: ["Confirm finish variation, projection, mounting hardware, and compatibility with existing fixtures."]
  }),
  candidate({
    style: "vintage-eclectic", rank: 4, asin: "B074C6QHWD", slug: "madison-park-casablanca-medallion-bath-rug-taupe",
    brand: "Madison Park", name: "Casablanca Medallion Cotton Bath Rug, Taupe, 20 x 30", category: "bath mat", price: "$17.99",
    rationale: "The tufted medallion reads like a collected vintage textile and layers pattern at floor level without matching the floral curtain.",
    caveats: ["Use a suitably sized washer and follow care instructions; independent retailer feedback notes washer damage when crowded."],
    recommendation: "approve_with_caveat",
    crossStyleNotes: "No duplicate proposed; the taupe medallion can also support Boho Earth Tones if a quieter floor pattern is preferred."
  }),
  candidate({
    style: "vintage-eclectic", rank: 5, asin: "B07114HTDD", slug: "creative-scents-victoria-soap-dispenser",
    brand: "Creative Scents", name: "Victoria Decorative Soap Dispenser, Beige", category: "soap accessory", price: "$17.99",
    rationale: "Its ornamental beige body adds a small collected counterpoint to floral and bronze pieces.",
    caveats: ["Confirm capacity, pump durability, finish, and whether the decoration suits the selected mirror and textile mix."]
  })
];
