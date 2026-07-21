export const INSPIRATION_STYLE_OPTIONS = [
  { value: "minimalist-elegance", label: "Minimalist Elegance" },
  { value: "modern-marble", label: "Modern Marble" },
  { value: "spa-greenery", label: "Spa Greenery" },
  { value: "brass-terrazzo", label: "Brass & Terrazzo" },
  { value: "boho-earth-tones", label: "Boho Earth Tones" },
  { value: "scandinavian-clean", label: "Scandinavian Clean" },
  { value: "dark-moody", label: "Dark & Moody" },
  { value: "warm-editorial", label: "Warm Editorial" },
  { value: "industrial-loft", label: "Industrial Loft" },
  { value: "coastal-calm", label: "Coastal Calm" },
  { value: "japandi", label: "Japandi" },
  { value: "vintage-eclectic", label: "Vintage Eclectic" }
] as const;

export const INSPIRATION_STYLE_VALUES = INSPIRATION_STYLE_OPTIONS.map((option) => option.value);

export function inspirationStyleLabel(value: string): string {
  return INSPIRATION_STYLE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
