import type { ContentArea } from "./types.ts";

export const redesignImages = {
  hero:
    "https://images.unsplash.com/photo-1763485956070-431fca7bc030?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMGludGVyaW9yJTIwZGVzaWduJTIwZWRpdG9yaWFsJTIwd2FybXxlbnwxfHx8fDE3NzM4MTY5OTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  plants:
    "https://images.unsplash.com/photo-1750036015902-c6f5ebca924e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiYXRocm9vbSUyMHBsYW50cyUyMG5hdHVyYWwlMjBsaWdodHxlbnwxfHx8fDE3NzM4MTY5OTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  mirror:
    "/images/areas/mirror.jpg",
  storage:
    "/images/areas/storage.jpg",
  lighting:
    "https://images.unsplash.com/photo-1763485956236-397fc3f25d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMGxpZ2h0aW5nJTIwdmFuaXR5JTIwd2FybXxlbnwxfHx8fDE3NzM4MTY5OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  shower:
    "https://images.unsplash.com/photo-1706670368974-af427a98e816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG93ZXIlMjBoZWFkJTIwdXBncmFkZSUyMG1vZGVybnxlbnwxfHx8fDE3NzM4MTY5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  renter:
    "/images/areas/renter.jpg",
  diy:
    "https://images.unsplash.com/photo-1730407391205-d22f78c79f5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXklMjBiYXRocm9vbSUyMHJlbm92YXRpb24lMjB0b29sc3xlbnwxfHx8fDE3NzM4MTY5OTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  budget:
    "https://images.unsplash.com/photo-1628746234554-3bb28b7dfd17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWRnZXQlMjBiYXRocm9vbSUyMGRlY29yJTIwc2ltcGxlfGVufDF8fHx8MTc3MzgxNjk5OHww&ixlib=rb-4.1.0&q=80&w=1080",
  marble:
    "https://images.unsplash.com/photo-1658760046471-896cbc719c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBiYXRocm9vbSUyMG1hcmJsZSUyMGRlc2lnbnxlbnwxfHx8fDE3NzM4OTE5NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  spa:
    "https://images.unsplash.com/photo-1752769041878-f24e37fd6aea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBiYXRocm9vbSUyMGdyZWVuJTIwdGlsZXMlMjBwbGFudHMlMjBkZWNvcnxlbnwxfHx8fDE3NzM4OTE5Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  brass:
    "/images/inspiration/brass-terrazzo/cover.jpg",
  boho:
    "/images/inspiration/boho-earth-tones/cover.jpg",
  minimalist:
    "/images/inspiration/minimalist-elegance/cover.jpg",
  scandi:
    "https://images.unsplash.com/photo-1593069384905-41d812985992?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2FuZGluYXZpYW4lMjBiYXRocm9vbSUyMHBhbGUlMjB3b29kJTIwc3Vid2F5JTIwdGlsZXxlbnwxfHx8fDE3NzM4OTE5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  dark:
    "https://images.unsplash.com/photo-1663811396038-7a21d4eef49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGFjY2VudCUyMGJhdGhyb29tJTIwZGFyayUyMG1vb2R5JTIwZWxlZ2FudHxlbnwxfHx8fDE3NzM4OTE5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  industrial:
    "https://images.unsplash.com/photo-1445369265672-6ec4463fdb0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxpbmR1c3RyaWFsJTIwY29uY3JldGUlMjBiYXRocm9vbSUyMGRhcmt8ZW58MXx8fHwxNzgxMjcyNzk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  coastal:
    "https://images.unsplash.com/photo-1779942578833-5f00dc79d6d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxjb2FzdGFsJTIwYnJpZ2h0JTIwYWlyeSUyMGJhdGhyb29tfGVufDF8fHx8MTc4MTI3Mjc5NXww&ixlib=rb-4.1.0&q=80&w=1080",
  japandi:
    "https://images.unsplash.com/photo-1765278954186-ccbe4f2b78a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxqYXBhbmRpJTIwd29vZCUyMG1pbmltYWxpc3QlMjBiYXRocm9vbXxlbnwxfHx8fDE3ODEyNzI3OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
};

type InspirationShape = "rounded" | "tall" | "wide" | "circle" | "polaroid" | "arch";

type InspirationImageItem = {
  type: "image";
  shape: InspirationShape;
  src: string;
  label?: string;
};

type InspirationProductItem = {
  type: "product";
  name: string;
  retailer: string;
  url: string;
  image: string;
  imageAlt: string;
};

export type InspirationItem = InspirationImageItem | InspirationProductItem;

type InspirationStyle = {
  slug: string;
  name: string;
  description: string;
  cover: string;
  accent: string;
  items: InspirationItem[];
};

const collageShapes: InspirationShape[] = ["arch", "rounded", "tall", "wide", "circle", "polaroid", "rounded", "tall"];

function inspirationAsset(slug: string, name: "cover" | "detail-1" | "detail-2" | "detail-3"): string {
  return `/images/inspiration/${slug}/${name}.jpg`;
}

function buildInspirationItems(
  slug: string,
  cover: string,
  products: [InspirationProductItem, InspirationProductItem]
): InspirationItem[] {
  const details = [
    inspirationAsset(slug, "detail-1"),
    inspirationAsset(slug, "detail-2"),
    inspirationAsset(slug, "detail-3")
  ];
  const imageSequence = [cover, details[0], details[1], details[2], details[0], details[1], details[2], cover];
  const imageItems = imageSequence.map<InspirationImageItem>((src, index) => ({
    type: "image",
    shape: collageShapes[index],
    src,
    label: index === 0 ? "Featured look" : undefined
  }));

  return [
    imageItems[0],
    imageItems[1],
    products[0],
    imageItems[2],
    imageItems[3],
    imageItems[4],
    products[1],
    imageItems[5],
    imageItems[6],
    imageItems[7]
  ];
}

export const areaVisuals: Record<ContentArea, { image: string; tagline: string; icon: string }> = {
  Plants: { image: redesignImages.plants, tagline: "Greenery that thrives in your space", icon: "sprout" },
  Mirror: { image: redesignImages.mirror, tagline: "The fastest visual upgrade", icon: "circle" },
  Storage: { image: redesignImages.storage, tagline: "Tame the clutter for good", icon: "box" },
  Lighting: { image: redesignImages.lighting, tagline: "Set the right mood instantly", icon: "sun" },
  Shower: { image: redesignImages.shower, tagline: "Upgrade your daily ritual", icon: "drop" },
  Renter: { image: redesignImages.renter, tagline: "Zero damage, full transformation", icon: "home" },
  DIY: { image: redesignImages.diy, tagline: "Weekend projects, real results", icon: "tool" },
  ExtremeBudget: { image: redesignImages.budget, tagline: "Big impact, tiny spend", icon: "dollar" }
};

export const inspirationStyles: InspirationStyle[] = [
  {
    slug: "minimalist-elegance",
    name: "Minimalist Elegance",
    description: "Clean lines, calm palettes, and nothing you do not need. The art of the well-edited bathroom.",
    cover: redesignImages.minimalist,
    accent: "#8A7E74",
    items: buildInspirationItems("minimalist-elegance", redesignImages.minimalist, [
      {
        type: "product",
        name: "TACKAN white soap dispenser",
        retailer: "IKEA",
        url: "https://www.ikea.com/us/en/p/tackan-soap-dispenser-white-90322303/",
        image: inspirationAsset("minimalist-elegance", "detail-1"),
        imageAlt: "Minimal white soap dispenser style reference in a warm bathroom"
      },
      {
        type: "product",
        name: "STORAVAN three-piece bathroom set",
        retailer: "IKEA",
        url: "https://www.ikea.com/us/en/p/storavan-3-piece-bathroom-set-white-70429003/",
        image: inspirationAsset("minimalist-elegance", "detail-3"),
        imageAlt: "White coordinated bathroom accessory set style reference"
      }
    ])
  },
  {
    slug: "modern-marble",
    name: "Modern Marble",
    description: "Veined stone, cool tones, and a quietly luxe finish. Looks expensive, plays with peel-and-stick.",
    cover: redesignImages.marble,
    accent: "#7A8A94",
    items: buildInspirationItems("modern-marble", redesignImages.marble, [
      {
        type: "product",
        name: "White marble soap dish",
        retailer: "Target",
        url: "https://www.target.com/p/-/A-17247412",
        image: inspirationAsset("modern-marble", "detail-3"),
        imageAlt: "White marble soap dish style reference on a bathroom vanity"
      },
      {
        type: "product",
        name: "Marble-look contact paper",
        retailer: "The Home Depot",
        url: "https://www.homedepot.com/p/334377132",
        image: inspirationAsset("modern-marble", "detail-2"),
        imageAlt: "Marble-look vanity surface style reference"
      }
    ])
  },
  {
    slug: "spa-greenery",
    name: "Spa Greenery",
    description: "Lush plants, soft steam, and earthy green tile. Turn your morning routine into a retreat.",
    cover: redesignImages.spa,
    accent: "#5B8C6A",
    items: buildInspirationItems("spa-greenery", redesignImages.spa, [
      {
        type: "product",
        name: "Golden pothos hanging basket",
        retailer: "The Home Depot",
        url: "https://www.homedepot.com/p/314172361",
        image: inspirationAsset("spa-greenery", "detail-2"),
        imageAlt: "Hanging golden pothos style reference beside a bathroom shower"
      },
      {
        type: "product",
        name: "Original spa teak bath mat",
        retailer: "AquaTeak",
        url: "https://aquateak.com/the-original-spa-teak-bath-shower-mat/",
        image: inspirationAsset("spa-greenery", "detail-3"),
        imageAlt: "Slatted teak bath mat style reference outside a green tile shower"
      }
    ])
  },
  {
    slug: "brass-terrazzo",
    name: "Brass & Terrazzo",
    description: "Warm metals meet playful speckled surfaces. A confident, design-forward mix.",
    cover: redesignImages.brass,
    accent: "#C4936A",
    items: buildInspirationItems("brass-terrazzo", redesignImages.brass, [
      {
        type: "product",
        name: "Trinsic towel ring in Champagne Bronze",
        retailer: "Delta",
        url: "https://www.deltafaucet.com/bathroom/product/759460-CZ.html",
        image: inspirationAsset("brass-terrazzo", "detail-1"),
        imageAlt: "Brass towel ring style reference against terrazzo bathroom tile"
      },
      {
        type: "product",
        name: "Terrazzo shower curtain",
        retailer: "Target",
        url: "https://www.target.com/p/-/A-82032749",
        image: inspirationAsset("brass-terrazzo", "detail-2"),
        imageAlt: "Warm terrazzo-patterned shower curtain style reference"
      }
    ])
  },
  {
    slug: "boho-earth-tones",
    name: "Boho Earth Tones",
    description: "Woven baskets, rattan, and sun-baked clay. Relaxed texture layered on warm neutrals.",
    cover: redesignImages.boho,
    accent: "#B07A52",
    items: buildInspirationItems("boho-earth-tones", redesignImages.boho, [
      {
        type: "product",
        name: "Boho border floral bath towel",
        retailer: "Target",
        url: "https://www.target.com/p/-/A-90022216",
        image: inspirationAsset("boho-earth-tones", "detail-2"),
        imageAlt: "Rust and cream floral-border bathroom towel style reference"
      },
      {
        type: "product",
        name: "Boho pom-pom shower curtain",
        retailer: "Target",
        url: "https://www.target.com/p/-/A-82247912",
        image: inspirationAsset("boho-earth-tones", "detail-3"),
        imageAlt: "Off-white woven shower curtain with pom-pom edge style reference"
      }
    ])
  },
  {
    slug: "scandinavian-clean",
    name: "Scandinavian Clean",
    description: "Pale wood, subway tile, and uncluttered function. Cozy minimalism that just works.",
    cover: redesignImages.scandi,
    accent: "#A0907E",
    items: buildInspirationItems("scandinavian-clean", redesignImages.scandi, [
      {
        type: "product",
        name: "RÅGRUND bamboo bench",
        retailer: "IKEA",
        url: "https://www.ikea.com/us/en/p/ragrund-bench-bamboo-60549416/",
        image: inspirationAsset("scandinavian-clean", "detail-2"),
        imageAlt: "Bamboo bathroom bench style reference beside a shower"
      },
      {
        type: "product",
        name: "TOFTBO gray-white bath mat",
        retailer: "IKEA",
        url: "https://www.ikea.com/us/en/p/toftbo-bath-mat-gray-white-melange-40610363/",
        image: inspirationAsset("scandinavian-clean", "detail-3"),
        imageAlt: "Soft gray-and-white bathroom mat style reference"
      }
    ])
  },
  {
    slug: "dark-moody",
    name: "Dark & Moody",
    description: "Black accents, deep contrast, and dramatic lighting. Small space, big personality.",
    cover: redesignImages.dark,
    accent: "#4A4540",
    items: buildInspirationItems("dark-moody", redesignImages.dark, [
      {
        type: "product",
        name: "Ribbed glass soap pump in black",
        retailer: "Target",
        url: "https://www.target.com/p/-/A-87646697",
        image: inspirationAsset("dark-moody", "detail-2"),
        imageAlt: "Ribbed black glass soap pump style reference on a dark vanity"
      },
      {
        type: "product",
        name: "GANSJÖN three-piece bathroom set",
        retailer: "IKEA",
        url: "https://www.ikea.com/us/en/p/gansjoen-3-piece-bathroom-set-black-90587039/",
        image: inspirationAsset("dark-moody", "detail-3"),
        imageAlt: "Matte black coordinated bathroom accessory set style reference"
      }
    ])
  },
  {
    slug: "warm-editorial",
    name: "Warm Editorial",
    description: "Plaster tones, soft light, and material softness. The signature Diyesu look.",
    cover: redesignImages.hero,
    accent: "#B8744A",
    items: buildInspirationItems("warm-editorial", redesignImages.hero, [
      {
        type: "product",
        name: "EKOLN beige soap dispenser",
        retailer: "IKEA",
        url: "https://www.ikea.com/us/en/p/ekoln-soap-dispenser-beige-60493004/",
        image: inspirationAsset("warm-editorial", "detail-2"),
        imageAlt: "Warm beige ceramic soap dispenser style reference"
      },
      {
        type: "product",
        name: "Medium rustic ceramic vase",
        retailer: "Target",
        url: "https://www.target.com/p/-/A-94685983",
        image: inspirationAsset("warm-editorial", "detail-3"),
        imageAlt: "Rustic warm-white ceramic vase style reference on a bathroom shelf"
      }
    ])
  },
  {
    slug: "industrial-loft",
    name: "Industrial Loft",
    description: "Concrete, exposed metal, and raw edges. Urban grit balanced with warm utility.",
    cover: redesignImages.industrial,
    accent: "#6B6358",
    items: buildInspirationItems("industrial-loft", redesignImages.industrial, [
      {
        type: "product",
        name: "Pipe Decor bathroom wall shelf",
        retailer: "The Home Depot",
        url: "https://www.homedepot.com/p/323160431",
        image: inspirationAsset("industrial-loft", "detail-2"),
        imageAlt: "Black pipe and wood bathroom shelf style reference"
      },
      {
        type: "product",
        name: "Vintage Edison-style LED bulb",
        retailer: "The Home Depot",
        url: "https://www.homedepot.com/p/205891597",
        image: inspirationAsset("industrial-loft", "detail-3"),
        imageAlt: "Warm exposed-filament vanity bulb style reference"
      }
    ])
  },
  {
    slug: "coastal-calm",
    name: "Coastal Calm",
    description: "Breezy blues, sun-bleached textures, and a just-back-from-the-beach ease.",
    cover: redesignImages.coastal,
    accent: "#6FA0B5",
    items: buildInspirationItems("coastal-calm", redesignImages.coastal, [
      {
        type: "product",
        name: "Coastal white soap pump",
        retailer: "Target",
        url: "https://www.target.com/p/-/A-91973284",
        image: inspirationAsset("coastal-calm", "detail-2"),
        imageAlt: "White coastal-style soap pump reference on a pale blue vanity"
      },
      {
        type: "product",
        name: "SLÅNHÖSTMAL blue striped bath towel",
        retailer: "IKEA",
        url: "https://www.ikea.com/us/en/p/slanhoestmal-bath-towel-bright-blue-light-blue-stripe-60576037/",
        image: inspirationAsset("coastal-calm", "detail-3"),
        imageAlt: "Bright blue striped cotton bath towel style reference"
      }
    ])
  },
  {
    slug: "japandi",
    name: "Japandi",
    description: "Japanese restraint meets Scandinavian warmth. Natural wood, low contrast, total calm.",
    cover: redesignImages.japandi,
    accent: "#9C8B73",
    items: buildInspirationItems("japandi", redesignImages.japandi, [
      {
        type: "product",
        name: "DRAGAN four-piece bamboo bathroom set",
        retailer: "IKEA",
        url: "https://www.ikea.com/us/en/p/dragan-4-piece-bathroom-set-bamboo-40222607/",
        image: inspirationAsset("japandi", "detail-2"),
        imageAlt: "Coordinated bamboo bathroom accessory set style reference"
      },
      {
        type: "product",
        name: "RÅGRUND chair with towel rack",
        retailer: "IKEA",
        url: "https://www.ikea.com/us/en/p/ragrund-chair-with-towel-rack-bamboo-90253074/",
        image: inspirationAsset("japandi", "detail-3"),
        imageAlt: "Bamboo bathroom chair and towel rack style reference"
      }
    ])
  }
];

export const plantMatches = [
  {
    name: "Pothos",
    fit: "Low to medium light",
    note: "Trails from shelves, tolerates humidity, and forgives imperfect watering."
  },
  {
    name: "Snake Plant",
    fit: "Low light and small floors",
    note: "Architectural, durable, and easy to place beside a vanity or toilet."
  },
  {
    name: "Boston Fern",
    fit: "Bright humidity",
    note: "Best near a shower or window where steam keeps the fronds lush."
  },
  {
    name: "ZZ Plant",
    fit: "Low maintenance corners",
    note: "Slow growing, glossy, and tolerant of dry spells between watering."
  }
];

export const blueprintSteps = [
  { key: "budget", title: "Budget", options: ["Under $75", "Under $150", "Under $300"] },
  { key: "type", title: "Type", options: ["Rental", "Owned"] },
  { key: "focus", title: "Focus", options: ["Storage", "Lighting", "Plants", "Mirror", "Shower"] },
  { key: "size", title: "Size", options: ["Tiny", "Small", "Standard"] },
  { key: "style", title: "Style", options: ["Warm Editorial", "Spa Greenery", "Modern Marble", "Boho Earth"] }
];

export function areaImageForSlug(slug: string): string {
  const entry = Object.entries(areaVisuals).find(([area]) =>
    area === "ExtremeBudget" ? slug === "extreme-budget" : area.toLowerCase() === slug
  );
  return entry?.[1].image ?? redesignImages.hero;
}
