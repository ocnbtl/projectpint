import {
  affiliateCandidateFixtureData,
  affiliateCandidateRecord,
  type CandidateInput
} from "./affiliate-candidates.v1.ts";

const OBSERVED_AT = "2026-07-26T16:30:00-04:00";

interface ReplacementInput {
  styleSlug: string;
  rank: number;
  replacesAsin: string;
  ownerRejectionReason: string;
  candidate: CandidateInput;
}

function replacement(input: ReplacementInput) {
  return {
    id: `replacement_${input.styleSlug}_${input.rank}`,
    styleSlug: input.styleSlug,
    rank: input.rank,
    replacesAsin: input.replacesAsin,
    ownerRejectionReason: input.ownerRejectionReason,
    proposalStatus: "pending" as const,
    reuseExistingCanonical: false,
    proposedProduct: affiliateCandidateRecord({
      ...input.candidate,
      style: input.styleSlug,
      rank: input.rank,
      observedAt: OBSERVED_AT,
      applyOwnerDecision: false
    })
  };
}

const approvedBambusi = affiliateCandidateFixtureData.find((product) => product.asin === "B0DC7VG6Z9");
if (!approvedBambusi) throw new Error("Approved Bambusi canonical product fixture is missing.");

export const affiliateReplacementFixtureData = [
  replacement({
    styleSlug: "spa-greenery",
    rank: 4,
    replacesAsin: "B07DXCC1WZ",
    ownerRejectionReason: "Too many reviews report towel shedding.",
    candidate: {
      style: "spa-greenery",
      rank: 4,
      asin: "B07PNCLMRD",
      slug: "idesign-cade-soap-pump-soft-aqua",
      brand: "iDesign",
      name: "Cade Bathroom Soap Pump, Soft Aqua",
      category: "soap accessory",
      price: "$6.74",
      rationale: "The compact soft-aqua pump reads as a clean water-and-greenery accent without competing with plants or wood.",
      whyUseful: "Replaces a rejected textile with an inexpensive, frequently used sink-side object whose simple form is easier to reproduce consistently.",
      caveats: ["Plastic construction; verify the soft-aqua variation and 12-ounce capacity before approving private references."],
      recommendation: "approve",
      supportingSources: [{
        sourceType: "retailer",
        title: "iDesign Cade Soap Pump retailer listing",
        url: "https://www.walmart.com/ip/661900923",
        notes: "Retailer corroboration for the Cade product family, pump format, and bathroom use."
      }]
    }
  }),
  replacement({
    styleSlug: "brass-terrazzo",
    rank: 3,
    replacesAsin: "B079NB9CG3",
    ownerRejectionReason: "Bad reviews and the product does not match the Brass & Terrazzo style.",
    candidate: {
      style: "brass-terrazzo",
      rank: 3,
      asin: "B0DTHLDX2W",
      slug: "luxspire-terrazzo-resin-soap-dispenser",
      brand: "Luxspire",
      name: "Terrazzo Resin Soap Dispenser, 320 mL",
      category: "soap accessory",
      price: "$17.99",
      rationale: "Visible terrazzo aggregate and a warm metal-tone pump make the style legible in one small functional object.",
      whyUseful: "Adds a practical sink accessory with unmistakable terrazzo patterning while avoiding another permanent finish or installation task.",
      caveats: ["Only 14 units remained when observed.", "Confirm the selected pump finish, resin construction, and 320 mL variation against the exact listing."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "retailer",
        title: "Luxspire terrazzo soap dispenser retailer listing",
        url: "https://www.desertcart.ma/products/742143888-luxspire-soap-dispenser-hand-soap-dispenser-with-replacement-pump-head",
        notes: "Retailer corroboration for the terrazzo-resin form and replacement pump; exact variation remains Amazon-verified."
      }]
    }
  }),
  replacement({
    styleSlug: "brass-terrazzo",
    rank: 5,
    replacesAsin: "B0864MF9HD",
    ownerRejectionReason: "The product does not match terrazzo and reads too coastal.",
    candidate: {
      style: "brass-terrazzo",
      rank: 5,
      asin: "B07T816XMV",
      slug: "bath-bliss-terrazzo-toilet-brush-holder",
      brand: "Bath Bliss",
      name: "Terrazzo Toilet Brush and Holder",
      category: "bathroom hardware",
      price: "$14.93",
      rationale: "The speckled terrazzo-look holder supplies a direct material cue without the nautical imagery of the rejected curtain.",
      whyUseful: "Fills a necessary cleaning-tool role while keeping the brush concealed in a compact decorative holder.",
      caveats: ["The terrazzo appearance is a product finish rather than confirmed quarried stone.", "Confirm dimensions and brush-head replacement options."],
      recommendation: "approve",
      supportingSources: [{
        sourceType: "retailer",
        title: "Bath Bliss terrazzo toilet brush and holder",
        url: "https://www.lowes.com/pd/Bath-Bliss-Bath-Bliss-Self-Closing-Lid-Toilet-Brush-and-Holder-in-Terz-Grey/1003050206",
        notes: "Retailer corroboration for the exact terrazzo-grey holder and self-closing-lid format."
      }]
    }
  }),
  replacement({
    styleSlug: "boho-earth-tones",
    rank: 1,
    replacesAsin: "B01J9Y164Q",
    ownerRejectionReason: "The colorway does not match Boho Earth Tones.",
    candidate: {
      style: "boho-earth-tones",
      rank: 1,
      asin: "B0D2KK6MNS",
      slug: "koufall-terracotta-rust-linen-blend-shower-curtain",
      brand: "KOUFALL",
      name: "Terracotta Rust Linen-Blend Shower Curtain",
      category: "bathroom textiles",
      price: "$27.99",
      rationale: "A broad terracotta-rust field anchors the palette in a warm mineral earth tone with quiet woven texture.",
      whyUseful: "Changes a large visual surface with one simple, reproducible color-and-texture treatment rather than a busy print.",
      caveats: ["The listing describes a 20% flax linen and 80% polyester blend, not pure linen.", "Confirm the 72 x 72-inch variation and included hooks."],
      recommendation: "approve",
      supportingSources: [{
        sourceType: "retailer",
        title: "KOUFALL terracotta rust shower curtain specifications",
        url: "https://www.ibspot.com/products/koufall-boho-shower-curtain-terracotta-rust-colored-linen-fabric-cloth-waterproof-western-bohemian-shower-curtain-set-with-hooks-for-bathroom-decor?vendor_id=383",
        notes: "Retailer corroboration for the 72 x 72-inch size, fiber blend, water-repellent treatment, color, and hooks."
      }]
    }
  }),
  replacement({
    styleSlug: "dark-moody",
    rank: 2,
    replacesAsin: "B07MH3C62G",
    ownerRejectionReason: "The product is too expensive.",
    candidate: {
      style: "dark-moody",
      rank: 2,
      asin: "B07V7QXSSQ",
      slug: "umbra-junip-soap-pump-black-chrome",
      brand: "Umbra",
      name: "Junip Soap Pump, Black and Chrome",
      category: "soap accessory",
      price: "$20.38",
      rationale: "The low black form and small chrome detail reinforce the dark palette without the rejected product's premium price.",
      whyUseful: "Provides a practical branded alternative at a substantially lower observed price while retaining a refined dark finish.",
      caveats: ["Only two units remained when observed.", "Umbra's own storefront showed this color unavailable or backordered, so Amazon replenishment is uncertain."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "manufacturer",
        title: "Umbra Junip Soap Pump",
        url: "https://uk.umbra.com/products/junip-soap-pump?variant=31217998626890",
        notes: "Brand source for the Junip form, material family, capacity, and care; brand-store availability differed from Amazon."
      }]
    }
  }),
  replacement({
    styleSlug: "dark-moody",
    rank: 5,
    replacesAsin: "B00HNMN4A6",
    ownerRejectionReason: "The product does not fit Dark & Moody and its quality is questionable.",
    candidate: {
      style: "dark-moody",
      rank: 5,
      asin: "B007T4AIKC",
      slug: "madison-park-amherst-black-shower-curtain",
      brand: "Madison Park",
      name: "Amherst Shower Curtain, Black",
      category: "bathroom textiles",
      price: "$18.99",
      rationale: "The black ground and restrained horizontal contrast create a moody large-scale backdrop without ornate patterning.",
      whyUseful: "Offers a lower-cost, simpler textile that is easier to coordinate and reproduce than the rejected jacquard design.",
      caveats: ["The observed Amazon buy box was Amazon Resale and fulfilled by Amazon; confirm item condition and a stable new-item seller before approval.", "A liner is not confirmed as included."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "retailer",
        title: "Madison Park Amherst shower curtain",
        url: "https://www.target.com/p/-/A-16843839",
        notes: "Retailer corroboration for the Amherst design family, polyester construction, dimensions, and care."
      }]
    }
  }),
  replacement({
    styleSlug: "warm-editorial",
    rank: 1,
    replacesAsin: "B0D231RK6C",
    ownerRejectionReason: "The item is questionable and has no reviews.",
    candidate: {
      style: "warm-editorial",
      rank: 1,
      asin: "B00FFDZUXY",
      slug: "idesign-kent-toilet-paper-canister-bronze",
      brand: "iDesign",
      name: "Kent Toilet Paper Reserve Canister, Bronze",
      category: "bathroom storage",
      price: "$15.99",
      rationale: "The softly reflective bronze cylinder adds the warm metallic note and composed utility of an editorial bathroom.",
      whyUseful: "Conceals one reserve roll in a small footprint and replaces an uncertain decorative object with recognizable bathroom utility.",
      caveats: ["The observed Amazon buy box was Amazon Resale; confirm new condition and seller before approval.", "The iDesign storefront showed the item sold out while Amazon displayed availability."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "manufacturer",
        title: "iDesign Kent Toilet Tissue Reserve Canister",
        url: "https://idesignhome.com/products/93390-kent-toilet-tissue-reserve-canister-bronze",
        notes: "Brand source for intended use, bronze finish, dimensions, and care; brand-store availability differed from Amazon."
      }]
    }
  }),
  replacement({
    styleSlug: "warm-editorial",
    rank: 5,
    replacesAsin: "B004SK6B8S",
    ownerRejectionReason: "The product is too expensive.",
    candidate: {
      style: "warm-editorial",
      rank: 5,
      asin: "B07K4WL86B",
      slug: "mygift-rustic-dark-torched-wood-tissue-box-cover",
      brand: "MyGift",
      name: "Rustic Dark Torched Wood Tissue Box Cover",
      category: "bathroom storage",
      price: "$27.99",
      rationale: "Dark torched wood supplies warm, tactile contrast and a styled countertop detail without the rejected premium price.",
      whyUseful: "Turns an ordinary tissue box into an intentional vanity accessory while keeping the form simple enough for consistent media.",
      caveats: ["Only one unit remained on Amazon when observed.", "Natural and torched-wood appearance varies; confirm tissue-box dimensions."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "manufacturer",
        title: "MyGift Rustic Dark Torched Wood Tissue Box Cover",
        url: "https://www.mygift.com/products/rustic-dark-torched-wood-tissue-box-cover",
        notes: "Brand source for exact design, dimensions, and material; it displayed in stock at a different price from Amazon."
      }]
    }
  }),
  replacement({
    styleSlug: "industrial-loft",
    rank: 4,
    replacesAsin: "B0747PQMS4",
    ownerRejectionReason: "The product is too expensive and does not fit Industrial Loft.",
    candidate: {
      style: "industrial-loft",
      rank: 4,
      asin: "B094HSCKMN",
      slug: "nearmoon-industrial-pipe-toilet-paper-holder-black",
      brand: "NearMoon",
      name: "Industrial Pipe Toilet Paper Holder, Black",
      category: "bathroom hardware",
      price: "$12.99",
      rationale: "A black pipe-style form communicates industrial utility more directly than the rejected slim storage cabinet.",
      whyUseful: "Solves a necessary hardware task with a strong style cue at a low observed price.",
      caveats: ["Only ten units remained when observed.", "Confirm wall material, anchors, fastener finish, and roll clearance before installation."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "manufacturer",
        title: "NearMoon bathroom hardware product catalog",
        url: "https://www.nearmoon.net/product-page",
        notes: "Brand catalog corroboration for NearMoon bathroom-hardware products; exact model and mounting kit remain Amazon-verified."
      }]
    }
  }),
  replacement({
    styleSlug: "coastal-calm",
    rank: 1,
    replacesAsin: "B07M8JH2SP",
    ownerRejectionReason: "The design is too complicated for consistent AI reproduction.",
    candidate: {
      style: "coastal-calm",
      rank: 1,
      asin: "B07W7FR5DK",
      slug: "lush-decor-ombre-stripe-shower-curtain-navy-multi",
      brand: "Lush Decor",
      name: "Ombre Stripe Yarn-Dyed Cotton Shower Curtain, Navy and Multi",
      category: "bathroom textiles",
      price: "$24.99",
      rationale: "Soft horizontal blue ombré stripes suggest water and horizon while staying calmer and simpler than the rejected illustrative scene.",
      whyUseful: "Provides a large coastal color cue with repeatable stripe geometry and a washable textile format.",
      caveats: ["Confirm the navy-and-multi variation and dimensions.", "The curtain is cotton and requires the care and liner guidance stated by the maker."],
      recommendation: "approve",
      supportingSources: [{
        sourceType: "manufacturer",
        title: "Lush Decor Ombre Stripe Yarn-Dyed Cotton Shower Curtain",
        url: "https://www.lushdecor.com/collections/coastal-shower-curtains-1/products/ombre-stripe-yarn-dyed-cotton-shower-curtain?variant=40259254976574",
        notes: "Brand source for the stripe design, cotton construction, dimensions, coastal collection, and care."
      }]
    }
  }),
  replacement({
    styleSlug: "coastal-calm",
    rank: 2,
    replacesAsin: "B0CQ724NXP",
    ownerRejectionReason: "The product is too expensive.",
    candidate: {
      style: "coastal-calm",
      rank: 2,
      asin: "B07ZS1PFC6",
      slug: "american-soft-linen-six-piece-towel-set-baby-blue",
      brand: "American Soft Linen",
      name: "590 GSM Six-Piece Towel Set, Baby Blue",
      category: "towel set",
      price: "$39.99",
      rationale: "The plain baby-blue pile carries a quiet coastal palette without a novelty pattern.",
      whyUseful: "Supplies a coordinated daily-use towel set at a lower observed price than the rejected option.",
      caveats: ["Only nine sets remained when observed.", "Confirm the exact six-piece composition, 590 GSM claim, and care instructions on the selected variation."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "manufacturer",
        title: "American Soft Linen six-piece Turkish towel set",
        url: "https://americansoftlinen.com/products/6-piece-turkish-towel-set",
        notes: "Brand source for six-piece set composition, cotton construction, dimensions, care, and color family; exact ASIN variation remains Amazon-verified."
      }]
    }
  }),
  replacement({
    styleSlug: "coastal-calm",
    rank: 4,
    replacesAsin: "B09R2HV6GG",
    ownerRejectionReason: "The product is too expensive and does not fit Coastal Calm.",
    candidate: {
      style: "coastal-calm",
      rank: 4,
      asin: "B00U281M4S",
      slug: "stonebriar-nautical-rope-mirror",
      brand: "Stonebriar",
      name: "Vintage Nautical Rope Mirror, 16.5 Inch",
      category: "bathroom mirror",
      price: "$44.60",
      rationale: "The round mirror and wrapped rope make a clear coastal cue at a smaller scale and lower price than the rejected shelf mirror.",
      whyUseful: "Adds a functional mirror plus tactile natural-fiber detail without consuming counter space.",
      caveats: ["Only one unit remained, with more listed as on the way.", "Confirm mirror diameter, hanging hardware, rope color, and suitability for the intended humid location."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "retailer",
        title: "Stonebriar small round wrapped-rope mirror",
        url: "https://www.walmart.ca/en/ip/Stonebriar-SB-5389A-Small-Round-Wrapped-Rope-Mirror-with-Hanging-Loop-Vintage-Nautical-Design-Brown/4YMNQ83QJ5K6",
        notes: "Retailer corroboration for the model, rope-wrapped design, size family, and hanging loop."
      }]
    }
  }),
  {
    id: "replacement_japandi_1",
    styleSlug: "japandi",
    rank: 1,
    replacesAsin: "B0BV1971T4",
    ownerRejectionReason: "The product is too expensive.",
    proposalStatus: "pending" as const,
    reuseExistingCanonical: true,
    proposedProduct: {
      ...approvedBambusi,
      crossStyleNotes: "Reuse the existing approved Bambüsi canonical product. Add Japandi as an additional style assignment; do not create a duplicate ASIN record.",
      styleAssignments: [
        ...approvedBambusi.styleAssignments,
        {
          styleSlug: "japandi",
          role: "additional" as const,
          rank: 1,
          rationale: "The restrained bamboo construction, slatted planes, and practical low form align naturally with a warm, pared-back Japandi bathroom."
        }
      ],
      updatedAt: OBSERVED_AT
    }
  },
  replacement({
    styleSlug: "japandi",
    rank: 2,
    replacesAsin: "B0B3HYSGCQ",
    ownerRejectionReason: "The product is too expensive.",
    candidate: {
      style: "japandi",
      rank: 2,
      asin: "B005KSTPLC",
      slug: "umbra-touch-soap-pump-grey",
      brand: "Umbra",
      name: "Touch Soap Pump, Grey",
      category: "soap accessory",
      price: "$20.95",
      rationale: "The soft grey rounded vessel is quiet, tactile, and visually simple enough to sit beside warm wood without clutter.",
      whyUseful: "Provides an established branded pump at a lower observed price than the rejected stoneware option.",
      caveats: ["Only nine units remained when observed.", "The product is molded plastic rather than ceramic or stone."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "manufacturer",
        title: "Umbra Touch Soap Pump",
        url: "https://www.umbra.com/products/touch-soap-pump",
        notes: "Brand source for material, capacity, dimensions, soft-touch finish, and care."
      }]
    }
  }),
  replacement({
    styleSlug: "japandi",
    rank: 4,
    replacesAsin: "B07WTCTNFF",
    ownerRejectionReason: "The product does not fit Japandi.",
    candidate: {
      style: "japandi",
      rank: 4,
      asin: "B09Q5P4V9B",
      slug: "zhws-white-bamboo-vanity-tray",
      brand: "ZHWS",
      name: "White Bamboo Vanity Tray, 11.3 x 4.4 Inch",
      category: "bathroom tray",
      price: "$12.99",
      rationale: "A slim bamboo tray in white adds calm linear organization and a small natural-material cue.",
      whyUseful: "Contains perfume, soap, or grooming items in a compact form that is more aligned with Japandi than the rejected steel amenity tray.",
      caveats: ["The brand has limited direct documentation.", "Confirm bamboo composition, coating, dimensions, water resistance, and seller before approval."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "retailer",
        title: "ZHWS bamboo bathroom vanity tray",
        url: "https://homenkitchenshop.com/products/bathroom-vanity-tray-bamboo-for-counter-wood-small-decorative-tray-dresser-top-perfume-home-decoration-11-3-l-x-4-4-w-1",
        notes: "Retailer corroboration for the bamboo description, white finish, dimensions, and vanity use."
      }]
    }
  }),
  replacement({
    styleSlug: "japandi",
    rank: 5,
    replacesAsin: "B0DWBYZNVK",
    ownerRejectionReason: "The product is too expensive.",
    candidate: {
      style: "japandi",
      rank: 5,
      asin: "B0B1XMRR6Z",
      slug: "aojezor-white-bamboo-slim-toilet-paper-cabinet",
      brand: "AOJEZOR",
      name: "White and Bamboo Slim Toilet Paper Storage Cabinet",
      category: "bathroom storage",
      price: "$24.98",
      rationale: "The narrow white body and bamboo top combine warm minimalism with small-bath utility.",
      whyUseful: "Adds concealed paper storage in a small footprint at a lower observed price than the rejected holder.",
      caveats: ["The white cabinet body is PVC; only the accent is bamboo.", "Confirm dimensions, assembly, stability, roll capacity, and clearance for the intended location."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "manufacturer",
        title: "AOJEZOR Bathroom Storage Cabinet",
        url: "https://aojezor.co/products/aojezor-bathroom-storage-cabinet-toilet-paper-holder-and-organizer-for-small-spaces-white",
        notes: "Brand source for PVC-and-bamboo materials, small-space use, care, and assembly context."
      }]
    }
  }),
  replacement({
    styleSlug: "vintage-eclectic",
    rank: 2,
    replacesAsin: "B09W42ND35",
    ownerRejectionReason: "The product does not have enough reviews and is too expensive.",
    candidate: {
      style: "vintage-eclectic",
      rank: 2,
      asin: "B07DVY2L2X",
      slug: "stonebriar-antique-gold-geometric-wire-mirror",
      brand: "Stonebriar",
      name: "Antique Gold Geometric Metal Wire Mirror, 28.3 Inch",
      category: "bathroom mirror",
      price: "$39.99",
      rationale: "The antique-gold wire frame supplies an eccentric vintage focal point without the rejected mirror's ornate resin mass.",
      whyUseful: "Adds a functional wall mirror with a clear eclectic silhouette at a lower observed price.",
      caveats: ["Confirm overall versus reflective dimensions, hanging hardware, and suitability for the intended humid location."],
      recommendation: "approve",
      supportingSources: [{
        sourceType: "retailer",
        title: "Stonebriar antique-gold geometric wire mirror",
        url: "https://www.target.com/p/-/A-53240182",
        notes: "Retailer corroboration for the exact design, antique-gold finish, dimensions, metal frame, and wall mounting."
      }]
    }
  }),
  replacement({
    styleSlug: "vintage-eclectic",
    rank: 3,
    replacesAsin: "B0003WN1R4",
    ownerRejectionReason: "The product is too expensive.",
    candidate: {
      style: "vintage-eclectic",
      rank: 3,
      asin: "B017W5HPGM",
      slug: "franklin-brass-kinla-towel-ring-oil-rubbed-bronze",
      brand: "Franklin Brass",
      name: "Kinla Towel Ring, Oil-Rubbed Bronze",
      category: "bathroom hardware",
      price: "$19.59",
      rationale: "The oil-rubbed bronze ring brings a traditional dark-metal detail that mixes comfortably with older and collected pieces.",
      whyUseful: "Replaces a costly brass towel ring with recognizable bath hardware at a lower observed price.",
      caveats: ["The observed Amazon buy box was Amazon Resale; confirm a new-condition seller before approval.", "Confirm mounting hardware, wall type, dimensions, and finish variation."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "retailer",
        title: "Franklin Brass Kinla towel ring",
        url: "https://www.lowes.com/pd/Franklin-Brass-Kinla-Towel-Ring-1-Per-Pkg/1000822888",
        notes: "Retailer corroboration for the Kinla model, oil-rubbed bronze finish, dimensions, and wall-mounted use."
      }]
    }
  }),
  replacement({
    styleSlug: "vintage-eclectic",
    rank: 4,
    replacesAsin: "B074C6QHWD",
    ownerRejectionReason: "The product does not fit Vintage Eclectic.",
    candidate: {
      style: "vintage-eclectic",
      rank: 4,
      asin: "B0731Z6255",
      slug: "laura-ashley-reversible-crochet-bath-rug-set-aqua",
      brand: "Laura Ashley",
      name: "Reversible Crochet Cotton Bath Rug Set, Aqua Blue",
      category: "bath mat",
      price: "$33.67",
      rationale: "The aqua color and crochet edge read as collected cottage-vintage detail rather than the rejected neutral medallion.",
      whyUseful: "Adds two coordinated washable floor textiles with a distinctive but reproducible edge treatment.",
      caveats: ["Confirm the exact two-piece set dimensions, backing behavior, floor compatibility, and care instructions.", "Cotton rugs can move on smooth floors unless paired with an appropriate non-slip layer."],
      recommendation: "approve_with_caveat",
      supportingSources: [{
        sourceType: "manufacturer",
        title: "Laura Ashley Reversible Crochet Beaded Bath Rug",
        url: "https://www.lauraashleyon.com/product/laura-ashley-reversible-crochet-beaded-bath-rug-17-in-x-24-in-aquaaqua/",
        notes: "Brand source for the aqua color, cotton construction, reversible design, crochet edge, dimensions, and care."
      }]
    }
  })
] as const;
