const FALLBACK_IMAGE = "/brand/diyesu-mark.svg";

export interface NormalizedImageSource {
  src: string;
  optimize: boolean;
}

export function normalizeImageSource(src: string): NormalizedImageSource {
  const value = src.trim();

  if (value.startsWith("/") && !value.startsWith("//")) {
    return { src: value, optimize: true };
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) {
      return { src: FALLBACK_IMAGE, optimize: true };
    }

    const isOptimizedUnsplashPhoto = url.hostname === "images.unsplash.com"
      && url.port === ""
      && url.pathname.startsWith("/photo-");
    return { src: url.toString(), optimize: isOptimizedUnsplashPhoto };
  } catch {
    return { src: FALLBACK_IMAGE, optimize: true };
  }
}
