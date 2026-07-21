import type { ContentArea } from "./types.ts";

export const redesignImages = {
  hero: "/images/home/hero.jpg",
  warmEditorial:
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
  id: string;
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

const collageShapes: InspirationShape[] = [
  "arch", "rounded", "tall", "wide", "circle", "polaroid",
  "rounded", "tall", "wide", "arch", "polaroid", "rounded"
];

function inspirationAsset(slug: string, name: string): string {
  return `/images/inspiration/${slug}/${name}.jpg`;
}

function amazonSearchUrl(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
}

function buildInspirationItems(
  slug: string,
  cover: string,
  products: [InspirationProductItem, InspirationProductItem]
): InspirationItem[] {
  const imageSequence = [cover, ...Array.from({ length: 11 }, (_, index) => inspirationAsset(slug, `detail-${index + 1}`))];
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
    imageItems[5],
    products[1],
    imageItems[6],
    imageItems[7],
    imageItems[8],
    imageItems[9],
    imageItems[10],
    imageItems[11]
  ];
}

export const areaVisuals: Record<ContentArea, { image: string; pageImage: string; tagline: string; icon: string }> = {
  Plants: { image: redesignImages.plants, pageImage: "/images/areas-page/plants.jpg", tagline: "Greenery that thrives in your space", icon: "sprout" },
  Mirror: { image: redesignImages.mirror, pageImage: "/images/areas-page/mirror.jpg", tagline: "The fastest visual upgrade", icon: "circle" },
  Storage: { image: redesignImages.storage, pageImage: "/images/areas-page/storage.jpg", tagline: "Tame the clutter for good", icon: "box" },
  Lighting: { image: redesignImages.lighting, pageImage: "/images/areas-page/lighting.jpg", tagline: "Set the right mood instantly", icon: "sun" },
  Shower: { image: redesignImages.shower, pageImage: "/images/areas-page/shower.jpg", tagline: "Upgrade your daily ritual", icon: "drop" },
  Renter: { image: redesignImages.renter, pageImage: "/images/areas-page/renter.jpg", tagline: "Zero damage, full transformation", icon: "home" },
  DIY: { image: redesignImages.diy, pageImage: "/images/areas-page/diy.jpg", tagline: "Weekend projects, real results", icon: "tool" },
  ExtremeBudget: { image: redesignImages.budget, pageImage: "/images/areas-page/extreme-budget.jpg", tagline: "Big impact, tiny spend", icon: "dollar" }
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
        id: "minimalist-elegance-1",
        name: "Matte white ceramic soap dispenser",
        retailer: "Amazon",
        url: amazonSearchUrl("matte white ceramic soap dispenser bathroom"),
        image: inspirationAsset("minimalist-elegance", "product-1"),
        imageAlt: "Minimal white soap dispenser style reference in a warm bathroom"
      },
      {
        type: "product",
        id: "minimalist-elegance-2",
        name: "White three-piece bathroom accessory set",
        retailer: "Amazon",
        url: amazonSearchUrl("white 3 piece bathroom accessory set minimalist"),
        image: inspirationAsset("minimalist-elegance", "product-2"),
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
        id: "modern-marble-1",
        name: "White marble soap dish",
        retailer: "Amazon",
        url: amazonSearchUrl("white marble soap dish bathroom"),
        image: inspirationAsset("modern-marble", "product-1"),
        imageAlt: "White marble soap dish style reference on a bathroom vanity"
      },
      {
        type: "product",
        id: "modern-marble-2",
        name: "Marble-look contact paper",
        retailer: "Amazon",
        url: amazonSearchUrl("waterproof marble contact paper bathroom vanity"),
        image: inspirationAsset("modern-marble", "product-2"),
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
        id: "spa-greenery-1",
        name: "Live golden pothos hanging basket",
        retailer: "Amazon",
        url: amazonSearchUrl("live golden pothos hanging basket plant"),
        image: inspirationAsset("spa-greenery", "product-1"),
        imageAlt: "Hanging golden pothos style reference beside a bathroom shower"
      },
      {
        type: "product",
        id: "spa-greenery-2",
        name: "Slatted teak bath mat",
        retailer: "Amazon",
        url: amazonSearchUrl("slatted teak bath mat shower"),
        image: inspirationAsset("spa-greenery", "product-2"),
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
        id: "brass-terrazzo-1",
        name: "Champagne bronze towel ring",
        retailer: "Amazon",
        url: amazonSearchUrl("champagne bronze bathroom towel ring"),
        image: inspirationAsset("brass-terrazzo", "product-1"),
        imageAlt: "Brass towel ring style reference against terrazzo bathroom tile"
      },
      {
        type: "product",
        id: "brass-terrazzo-2",
        name: "Terrazzo shower curtain",
        retailer: "Amazon",
        url: amazonSearchUrl("warm terrazzo shower curtain"),
        image: inspirationAsset("brass-terrazzo", "product-2"),
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
        id: "boho-earth-tones-1",
        name: "Boho border floral bath towel",
        retailer: "Amazon",
        url: amazonSearchUrl("boho floral bath towel rust cream"),
        image: inspirationAsset("boho-earth-tones", "product-1"),
        imageAlt: "Rust and cream floral-border bathroom towel style reference"
      },
      {
        type: "product",
        id: "boho-earth-tones-2",
        name: "Boho pom-pom shower curtain",
        retailer: "Amazon",
        url: amazonSearchUrl("boho pom pom shower curtain cream"),
        image: inspirationAsset("boho-earth-tones", "product-2"),
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
        id: "scandinavian-clean-1",
        name: "Bamboo shower bench",
        retailer: "Amazon",
        url: amazonSearchUrl("bamboo shower bench bathroom Scandinavian"),
        image: inspirationAsset("scandinavian-clean", "product-1"),
        imageAlt: "Bamboo bathroom bench style reference beside a shower"
      },
      {
        type: "product",
        id: "scandinavian-clean-2",
        name: "Gray-and-white textured bath mat",
        retailer: "Amazon",
        url: amazonSearchUrl("gray white textured bath mat Scandinavian"),
        image: inspirationAsset("scandinavian-clean", "product-2"),
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
        id: "dark-moody-1",
        name: "Ribbed black glass soap dispenser",
        retailer: "Amazon",
        url: amazonSearchUrl("ribbed black glass soap dispenser bathroom"),
        image: inspirationAsset("dark-moody", "product-1"),
        imageAlt: "Ribbed black glass soap pump style reference on a dark vanity"
      },
      {
        type: "product",
        id: "dark-moody-2",
        name: "Matte black bathroom accessory set",
        retailer: "Amazon",
        url: amazonSearchUrl("matte black bathroom accessory set"),
        image: inspirationAsset("dark-moody", "product-2"),
        imageAlt: "Matte black coordinated bathroom accessory set style reference"
      }
    ])
  },
  {
    slug: "warm-editorial",
    name: "Warm Editorial",
    description: "Plaster tones, soft light, and material softness. The signature Diyesu look.",
    cover: redesignImages.warmEditorial,
    accent: "#B8744A",
    items: buildInspirationItems("warm-editorial", redesignImages.warmEditorial, [
      {
        type: "product",
        id: "warm-editorial-1",
        name: "Beige ceramic soap dispenser",
        retailer: "Amazon",
        url: amazonSearchUrl("beige ceramic soap dispenser bathroom"),
        image: inspirationAsset("warm-editorial", "product-1"),
        imageAlt: "Warm beige ceramic soap dispenser style reference"
      },
      {
        type: "product",
        id: "warm-editorial-2",
        name: "Rustic warm-white ceramic vase",
        retailer: "Amazon",
        url: amazonSearchUrl("rustic warm white ceramic vase small"),
        image: inspirationAsset("warm-editorial", "product-2"),
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
        id: "industrial-loft-1",
        name: "Industrial pipe bathroom wall shelf",
        retailer: "Amazon",
        url: amazonSearchUrl("industrial pipe bathroom wall shelf wood black"),
        image: inspirationAsset("industrial-loft", "product-1"),
        imageAlt: "Black pipe and wood bathroom shelf style reference"
      },
      {
        type: "product",
        id: "industrial-loft-2",
        name: "Vintage Edison-style LED bulb",
        retailer: "Amazon",
        url: amazonSearchUrl("vintage Edison LED bulb warm bathroom vanity"),
        image: inspirationAsset("industrial-loft", "product-2"),
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
        id: "coastal-calm-1",
        name: "Coastal white soap pump",
        retailer: "Amazon",
        url: amazonSearchUrl("coastal white ceramic soap pump bathroom"),
        image: inspirationAsset("coastal-calm", "product-1"),
        imageAlt: "White coastal-style soap pump reference on a pale blue vanity"
      },
      {
        type: "product",
        id: "coastal-calm-2",
        name: "Blue striped cotton bath towel",
        retailer: "Amazon",
        url: amazonSearchUrl("blue striped cotton bath towel coastal"),
        image: inspirationAsset("coastal-calm", "product-2"),
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
        id: "japandi-1",
        name: "Four-piece bamboo bathroom accessory set",
        retailer: "Amazon",
        url: amazonSearchUrl("bamboo bathroom accessory set Japandi"),
        image: inspirationAsset("japandi", "product-1"),
        imageAlt: "Coordinated bamboo bathroom accessory set style reference"
      },
      {
        type: "product",
        id: "japandi-2",
        name: "Bamboo towel ladder and stool",
        retailer: "Amazon",
        url: amazonSearchUrl("bamboo towel ladder stool bathroom Japandi"),
        image: inspirationAsset("japandi", "product-2"),
        imageAlt: "Bamboo bathroom chair and towel rack style reference"
      }
    ])
  },
  {
    slug: "vintage-eclectic",
    name: "Vintage Eclectic",
    description: "Collected color, storied brass, and playful pattern. A bathroom that feels personal, layered, and one of a kind.",
    cover: inspirationAsset("vintage-eclectic", "cover"),
    accent: "#9A5E55",
    items: buildInspirationItems("vintage-eclectic", inspirationAsset("vintage-eclectic", "cover"), [
      {
        type: "product",
        id: "vintage-eclectic-1",
        name: "Vintage floral shower curtain",
        retailer: "Amazon",
        url: amazonSearchUrl("vintage floral shower curtain colorful"),
        image: inspirationAsset("vintage-eclectic", "product-1"),
        imageAlt: "Layered vintage floral shower curtain style reference"
      },
      {
        type: "product",
        id: "vintage-eclectic-2",
        name: "Antique brass wall mirror",
        retailer: "Amazon",
        url: amazonSearchUrl("antique brass wall mirror vintage bathroom"),
        image: inspirationAsset("vintage-eclectic", "product-2"),
        imageAlt: "Antique brass bathroom mirror style reference"
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
  return entry?.[1].image ?? redesignImages.warmEditorial;
}
