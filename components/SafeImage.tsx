import Image, { type ImageProps } from "next/image";
import { normalizeImageSource } from "../lib/image-source";

type SafeImageProps = Omit<ImageProps, "src" | "width" | "height" | "unoptimized"> & {
  src: string;
  width?: number;
  height?: number;
};

/**
 * A layout-neutral Next Image wrapper for approved editorial media.
 *
 * Site-relative assets and the narrowly allowlisted Unsplash host use Next's
 * optimizer. Other valid HTTPS sources are loaded directly by the browser so
 * dynamic editorial media works without opening the optimizer to arbitrary
 * remote hosts. Invalid and non-HTTPS values fall back to the brand mark.
 */
export function SafeImage({ src, alt, width = 1600, height = 1200, ...props }: SafeImageProps) {
  const normalized = normalizeImageSource(src);

  return (
    <Image
      {...props}
      src={normalized.src}
      alt={alt}
      width={width}
      height={height}
      unoptimized={!normalized.optimize}
    />
  );
}
