import type { ContentArea } from "./types.ts";

export const redesignImages = {
  hero:
    "https://images.unsplash.com/photo-1763485956070-431fca7bc030?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMGludGVyaW9yJTIwZGVzaWduJTIwZWRpdG9yaWFsJTIwd2FybXxlbnwxfHx8fDE3NzM4MTY5OTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  plants:
    "https://images.unsplash.com/photo-1750036015902-c6f5ebca924e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiYXRocm9vbSUyMHBsYW50cyUyMG5hdHVyYWwlMjBsaWdodHxlbnwxfHx8fDE3NzM4MTY5OTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  mirror:
    "https://images.unsplash.com/photo-1758239873506-82d0e76244f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJhdGhyb29tJTIwbWlycm9yJTIwcmVub3ZhdGlvbnxlbnwxfHx8fDE3NzM4MTY5OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  storage:
    "https://images.unsplash.com/photo-1721742736274-011e6677db65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMHN0b3JhZ2UlMjBvcmdhbml6YXRpb24lMjBzaGVsdmVzfGVufDF8fHx8MTc3MzgxNjk5NXww&ixlib=rb-4.1.0&q=80&w=1080",
  lighting:
    "https://images.unsplash.com/photo-1763485956236-397fc3f25d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMGxpZ2h0aW5nJTIwdmFuaXR5JTIwd2FybXxlbnwxfHx8fDE3NzM4MTY5OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  shower:
    "https://images.unsplash.com/photo-1706670368974-af427a98e816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG93ZXIlMjBoZWFkJTIwdXBncmFkZSUyMG1vZGVybnxlbnwxfHx8fDE3NzM4MTY5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  renter:
    "https://images.unsplash.com/photo-1765556556784-7656ee0a1bd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYmF0aHJvb20lMjB3aGl0ZSUyMHRpbGUlMjBjbGVhbnxlbnwxfHx8fDE3NzM4MTY5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  diy:
    "https://images.unsplash.com/photo-1730407391205-d22f78c79f5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXklMjBiYXRocm9vbSUyMHJlbm92YXRpb24lMjB0b29sc3xlbnwxfHx8fDE3NzM4MTY5OTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  budget:
    "https://images.unsplash.com/photo-1628746234554-3bb28b7dfd17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWRnZXQlMjBiYXRocm9vbSUyMGRlY29yJTIwc2ltcGxlfGVufDF8fHx8MTc3MzgxNjk5OHww&ixlib=rb-4.1.0&q=80&w=1080",
  marble:
    "https://images.unsplash.com/photo-1658760046471-896cbc719c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBiYXRocm9vbSUyMG1hcmJsZSUyMGRlc2lnbnxlbnwxfHx8fDE3NzM4OTE5NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  spa:
    "https://images.unsplash.com/photo-1752769041878-f24e37fd6aea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjBiYXRocm9vbSUyMGdyZWVuJTIwdGlsZXMlMjBwbGFudHMlMjBkZWNvcnxlbnwxfHx8fDE3NzM4OTE5Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  brass:
    "https://images.unsplash.com/photo-1768203633862-dd904d900704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBiYXRocm9vbSUyMGJyYXNzJTIwZml4dHVyZXMlMjB0ZXJyYXp6b3xlbnwxfHx8fDE3NzM4OTE5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  boho:
    "https://images.unsplash.com/photo-1588296250512-b75a9e4b534e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2hvJTIwYmF0aHJvb20lMjB3b3ZlbiUyMGJhc2tldHMlMjBlYXJ0aCUyMHRvbmVzfGVufDF8fHx8MTc3Mzg5MTk3OHww&ixlib=rb-4.1.0&q=80&w=1080",
  minimalist:
    "https://images.unsplash.com/photo-1506331959731-780370962434?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd2hpdGUlMjBiYXRocm9vbSUyMGZyZWVzdGFuZGluZyUyMHR1YnxlbnwxfHx8fDE3NzM4OTE5Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
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

const collageImages = [
  "https://images.unsplash.com/photo-1645567455251-334ed4702f9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMHNoZWxmJTIwZGVjb3IlMjBhY2Nlc3Nvcmllc3xlbnwxfHx8fDE3ODEyNjgzODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1595515770338-e4d3c5d8dd91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxiYXRocm9vbSUyMHNoZWxmJTIwZGVjb3IlMjBhY2Nlc3Nvcmllc3xlbnwxfHx8fDE3ODEyNjgzODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1773565744218-d8d11de58362?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxiYXRocm9vbSUyMHNoZWxmJTIwZGVjb3IlMjBhY2Nlc3Nvcmllc3xlbnwxfHx8fDE3ODEyNjgzODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1595515770345-0497f6f13692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxiYXRocm9vbSUyMHNoZWxmJTIwZGVjb3IlMjBhY2Nlc3Nvcmllc3xlbnwxfHx8fDE3ODEyNjgzODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1780544241838-7b54189f01b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxiYXRocm9vbSUyMHNoZWxmJTIwZGVjb3IlMjBhY2Nlc3Nvcmllc3xlbnwxfHx8fDE3ODEyNjgzODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1780952934157-f541e70c7ece?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxiYXRocm9vbSUyMHNoZWxmJTIwZGVjb3IlMjBhY2Nlc3Nvcmllc3xlbnwxfHx8fDE3ODEyNjgzODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1651513825857-9fda9d5729fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiYXRocm9vbSUyMHRvd2VscyUyMGNhbmRsZXMlMjBzdHlsaW5nfGVufDF8fHx8MTc4MTI2ODM4NXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1611818830473-ab5d21f401ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxiYXRocm9vbSUyMHRvd2VscyUyMGNhbmRsZXMlMjBzdHlsaW5nfGVufDF8fHx8MTc4MTI2ODM4NXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1700918232124-f64da19e73eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxiYXRocm9vbSUyMHRvd2VscyUyMGNhbmRsZXMlMjBzdHlsaW5nfGVufDF8fHx8MTc4MTI2ODM4NXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1768413292047-116be08f120c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxiYXRocm9vbSUyMHRvd2VscyUyMGNhbmRsZXMlMjBzdHlsaW5nfGVufDF8fHx8MTc4MTI2ODM4NXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1765745520336-88acf0b84fe4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxiYXRocm9vbSUyMHRvd2VscyUyMGNhbmRsZXMlMjBzdHlsaW5nfGVufDF8fHx8MTc4MTI2ODM4NXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1765745518752-68a289300789?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxiYXRocm9vbSUyMHRvd2VscyUyMGNhbmRsZXMlMjBzdHlsaW5nfGVufDF8fHx8MTc4MTI2ODM4NXww&ixlib=rb-4.1.0&q=80&w=1080",
  redesignImages.plants,
  redesignImages.mirror,
  redesignImages.storage,
  redesignImages.lighting,
  redesignImages.shower,
  redesignImages.renter
];

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
  price: string;
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

const collageShapes: InspirationShape[] = ["rounded", "tall", "wide", "circle", "polaroid", "arch", "rounded", "tall"];

function buildInspirationItems(cover: string, seed: number, products: { name: string; price: string }[]): InspirationItem[] {
  const items: InspirationItem[] = [{ type: "image", shape: "arch", src: cover, label: "Featured look" }];

  for (let index = 0; index < 14; index += 1) {
    if (index % 4 === 2 && products.length > 0) {
      const product = products[(seed + index) % products.length];
      items.push({ type: "product", name: product.name, price: product.price });
    } else {
      items.push({
        type: "image",
        shape: collageShapes[(seed + index) % collageShapes.length],
        src: collageImages[(seed * 3 + index * 5) % collageImages.length]
      });
    }
  }

  return items;
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
    items: buildInspirationItems(redesignImages.minimalist, 1, [
      { name: "Frosted glass soap pump", price: "$14" },
      { name: "Matte white toothbrush cup", price: "$9" },
      { name: "Linen waffle hand towel", price: "$18" }
    ])
  },
  {
    slug: "modern-marble",
    name: "Modern Marble",
    description: "Veined stone, cool tones, and a quietly luxe finish. Looks expensive, plays with peel-and-stick.",
    cover: redesignImages.marble,
    accent: "#7A8A94",
    items: buildInspirationItems(redesignImages.marble, 2, [
      { name: "Marble-look contact paper", price: "$22" },
      { name: "Carrara tray", price: "$28" },
      { name: "Brushed nickel hooks", price: "$12" }
    ])
  },
  {
    slug: "spa-greenery",
    name: "Spa Greenery",
    description: "Lush plants, soft steam, and earthy green tile. Turn your morning routine into a retreat.",
    cover: redesignImages.spa,
    accent: "#5B8C6A",
    items: buildInspirationItems(redesignImages.spa, 3, [
      { name: "Hanging pothos planter", price: "$16" },
      { name: "Eucalyptus shower bundle", price: "$11" },
      { name: "Teak bath mat", price: "$34" }
    ])
  },
  {
    slug: "brass-terrazzo",
    name: "Brass & Terrazzo",
    description: "Warm metals meet playful speckled surfaces. A confident, design-forward mix.",
    cover: redesignImages.brass,
    accent: "#C4936A",
    items: buildInspirationItems(redesignImages.brass, 4, [
      { name: "Brass towel ring", price: "$24" },
      { name: "Terrazzo soap dish", price: "$15" },
      { name: "Gold-framed mirror", price: "$48" }
    ])
  },
  {
    slug: "boho-earth-tones",
    name: "Boho Earth Tones",
    description: "Woven baskets, rattan, and sun-baked clay. Relaxed texture layered on warm neutrals.",
    cover: redesignImages.boho,
    accent: "#B07A52",
    items: buildInspirationItems(redesignImages.boho, 5, [
      { name: "Woven seagrass basket", price: "$19" },
      { name: "Terracotta planter", price: "$13" },
      { name: "Tasseled cotton towel", price: "$21" }
    ])
  },
  {
    slug: "scandinavian-clean",
    name: "Scandinavian Clean",
    description: "Pale wood, subway tile, and uncluttered function. Cozy minimalism that just works.",
    cover: redesignImages.scandi,
    accent: "#A0907E",
    items: buildInspirationItems(redesignImages.scandi, 6, [
      { name: "Birch step stool", price: "$29" },
      { name: "Ceramic tumbler set", price: "$16" },
      { name: "Cotton bath rug", price: "$24" }
    ])
  },
  {
    slug: "dark-moody",
    name: "Dark & Moody",
    description: "Black accents, deep contrast, and dramatic lighting. Small space, big personality.",
    cover: redesignImages.dark,
    accent: "#4A4540",
    items: buildInspirationItems(redesignImages.dark, 7, [
      { name: "Matte black faucet kit", price: "$39" },
      { name: "Smoked glass jar", price: "$12" },
      { name: "Charcoal waffle towel", price: "$20" }
    ])
  },
  {
    slug: "warm-editorial",
    name: "Warm Editorial",
    description: "Plaster tones, soft light, and material softness. The signature Diyesu look.",
    cover: redesignImages.hero,
    accent: "#B8744A",
    items: buildInspirationItems(redesignImages.hero, 8, [
      { name: "Plaster soap dispenser", price: "$17" },
      { name: "Stoneware vase", price: "$22" },
      { name: "Boucle bath stool", price: "$45" }
    ])
  },
  {
    slug: "industrial-loft",
    name: "Industrial Loft",
    description: "Concrete, exposed metal, and raw edges. Urban grit balanced with warm utility.",
    cover: redesignImages.industrial,
    accent: "#6B6358",
    items: buildInspirationItems(redesignImages.industrial, 9, [
      { name: "Iron pipe shelf", price: "$32" },
      { name: "Concrete soap tray", price: "$14" },
      { name: "Edison vanity bulb", price: "$11" }
    ])
  },
  {
    slug: "coastal-calm",
    name: "Coastal Calm",
    description: "Breezy blues, sun-bleached textures, and a just-back-from-the-beach ease.",
    cover: redesignImages.coastal,
    accent: "#6FA0B5",
    items: buildInspirationItems(redesignImages.coastal, 10, [
      { name: "Jute storage basket", price: "$18" },
      { name: "Driftwood bath tray", price: "$26" },
      { name: "Striped cotton towel", price: "$19" }
    ])
  },
  {
    slug: "japandi",
    name: "Japandi",
    description: "Japanese restraint meets Scandinavian warmth. Natural wood, low contrast, total calm.",
    cover: redesignImages.japandi,
    accent: "#9C8B73",
    items: buildInspirationItems(redesignImages.japandi, 11, [
      { name: "Hinoki wood bath mat", price: "$38" },
      { name: "Stoneware dispenser", price: "$16" },
      { name: "Linen robe", price: "$42" }
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
