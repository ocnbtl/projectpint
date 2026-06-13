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
    "https://images.unsplash.com/photo-1588296250512-b75a9e4b534e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2hvJTIwYmF0aHJvb20lMjB3b3ZlbiUyMGJhc2tldHMlMjBlYXJ0aCUyMHRvbmVzfGVufDF8fHx8MTc3Mzg5MTk3OHww&ixlib=rb-4.1.0&q=80&w=1080"
};

export const areaVisuals: Record<ContentArea, { image: string; tagline: string; icon: string }> = {
  Plants: { image: redesignImages.plants, tagline: "Greenery that thrives in your space", icon: "leaf" },
  Mirror: { image: redesignImages.mirror, tagline: "The fastest visual upgrade", icon: "circle" },
  Storage: { image: redesignImages.storage, tagline: "Tame the clutter for good", icon: "box" },
  Lighting: { image: redesignImages.lighting, tagline: "Set the right mood instantly", icon: "sun" },
  Shower: { image: redesignImages.shower, tagline: "Upgrade your daily ritual", icon: "drop" },
  Renter: { image: redesignImages.renter, tagline: "Zero damage, full transformation", icon: "home" },
  DIY: { image: redesignImages.diy, tagline: "Weekend projects, real results", icon: "tool" },
  ExtremeBudget: { image: redesignImages.budget, tagline: "Big impact, tiny spend", icon: "dollar" }
};

export const inspirationStyles = [
  {
    slug: "minimalist-elegance",
    name: "Minimalist Elegance",
    description: "Clean lines, calm palettes, and nothing you do not need.",
    cover: redesignImages.mirror,
    accent: "#8A7E74"
  },
  {
    slug: "modern-marble",
    name: "Modern Marble",
    description: "Veined stone, cool tones, and a quietly luxe finish.",
    cover: redesignImages.marble,
    accent: "#7A8A94"
  },
  {
    slug: "spa-greenery",
    name: "Spa Greenery",
    description: "Lush plants, soft steam, and earthy green tile.",
    cover: redesignImages.spa,
    accent: "#5B8C6A"
  },
  {
    slug: "brass-terrazzo",
    name: "Brass & Terrazzo",
    description: "Warm metals meet playful speckled surfaces.",
    cover: redesignImages.brass,
    accent: "#C4936A"
  },
  {
    slug: "boho-earth-tones",
    name: "Boho Earth Tones",
    description: "Woven baskets, rattan, and sun-baked clay.",
    cover: redesignImages.boho,
    accent: "#B07A52"
  },
  {
    slug: "warm-editorial",
    name: "Warm Editorial",
    description: "Plaster tones, soft light, and the signature Diyesu look.",
    cover: redesignImages.hero,
    accent: "#B8744A"
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
