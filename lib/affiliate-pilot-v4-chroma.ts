export type AffiliatePilotV4ChromaKey = "#00ff00" | "#ff00ff";

export const AFFILIATE_PILOT_V4_CHROMA_ALGORITHM_VERSION =
  "affiliate-pilot-global-chroma-alpha-v2";

function isChromaCandidate(
  data: Uint8Array,
  offset: number,
  chromaKeyHex: AffiliatePilotV4ChromaKey
): boolean {
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  return chromaKeyHex === "#00ff00"
    ? green > 115 && green > red * 1.22 && green > blue * 1.22
    : red > 115 && blue > 115 && Math.min(red, blue) > green * 1.22;
}

export function convertAffiliatePilotV4ChromaToAlpha(
  data: Uint8Array,
  width: number,
  height: number,
  chromaKeyHex: AffiliatePilotV4ChromaKey
): {
  transparentPixelCount: number;
  partialAlphaPixelCount: number;
  visibleChromaPixelCountAfter: number;
} {
  if (data.length !== width * height * 4) {
    throw new Error("RGBA buffer length does not match the supplied dimensions.");
  }
  const backgroundRgb =
    chromaKeyHex === "#00ff00" ? [0, 255, 0] : [255, 0, 255];
  let transparentPixelCount = 0;
  let partialAlphaPixelCount = 0;

  for (let offset = 0; offset < data.length; offset += 4) {
    if (!isChromaCandidate(data, offset, chromaKeyHex)) continue;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const chromaExcess =
      chromaKeyHex === "#00ff00"
        ? Math.max(0, green - Math.max(red, blue))
        : Math.max(0, Math.min(red, blue) - green);
    const alpha = Math.max(
      0,
      Math.min(255, 255 - Math.round((chromaExcess / 170) * 255))
    );
    data[offset + 3] = alpha;
    if (alpha === 0) transparentPixelCount += 1;
    if (alpha > 0 && alpha < 255) {
      partialAlphaPixelCount += 1;
      const normalizedAlpha = alpha / 255;
      data[offset] = Math.max(
        0,
        Math.min(
          255,
          Math.round(
            (red - backgroundRgb[0] * (1 - normalizedAlpha)) /
              normalizedAlpha
          )
        )
      );
      data[offset + 1] = Math.max(
        0,
        Math.min(
          255,
          Math.round(
            (green - backgroundRgb[1] * (1 - normalizedAlpha)) /
              normalizedAlpha
          )
        )
      );
      data[offset + 2] = Math.max(
        0,
        Math.min(
          255,
          Math.round(
            (blue - backgroundRgb[2] * (1 - normalizedAlpha)) /
              normalizedAlpha
          )
        )
      );
    }
  }

  let visibleChromaPixelCountAfter = 0;
  for (let offset = 0; offset < data.length; offset += 4) {
    if (
      data[offset + 3] > 0 &&
      isChromaCandidate(data, offset, chromaKeyHex)
    ) {
      visibleChromaPixelCountAfter += 1;
    }
  }
  return {
    transparentPixelCount,
    partialAlphaPixelCount,
    visibleChromaPixelCountAfter
  };
}

export function countAffiliatePilotV4VisibleChromaPixels(
  data: Uint8Array,
  chromaKeyHex: AffiliatePilotV4ChromaKey
): number {
  let count = 0;
  for (let offset = 0; offset < data.length; offset += 4) {
    if (
      data[offset + 3] > 0 &&
      isChromaCandidate(data, offset, chromaKeyHex)
    ) {
      count += 1;
    }
  }
  return count;
}
