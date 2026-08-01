import assert from "node:assert/strict";
import test from "node:test";
import {
  AFFILIATE_PILOT_V4_CHROMA_ALGORITHM_VERSION,
  convertAffiliatePilotV4ChromaToAlpha
} from "../lib/affiliate-pilot-v4-chroma.ts";

test("global chroma alpha clears an enclosed green opening without erasing its brown ring", () => {
  const width = 5;
  const height = 5;
  const data = new Uint8Array(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const offset = pixel * 4;
    data.set([0, 255, 0, 255], offset);
  }
  const brown = [150, 90, 40, 255];
  for (let y = 1; y <= 3; y += 1) {
    for (let x = 1; x <= 3; x += 1) {
      if (x === 2 && y === 2) continue;
      data.set(brown, (y * width + x) * 4);
    }
  }

  const stats = convertAffiliatePilotV4ChromaToAlpha(
    data,
    width,
    height,
    "#00ff00"
  );

  assert.equal(AFFILIATE_PILOT_V4_CHROMA_ALGORITHM_VERSION, "affiliate-pilot-global-chroma-alpha-v2");
  assert.equal(data[(2 * width + 2) * 4 + 3], 0);
  assert.equal(data[(2 * width + 1) * 4 + 3], 255);
  assert.equal(stats.visibleChromaPixelCountAfter, 0);
  assert.equal(stats.transparentPixelCount, 17);
});

test("global chroma alpha supports the magenta key reserved for green products", () => {
  const data = new Uint8Array([255, 0, 255, 255, 20, 160, 30, 255]);
  const stats = convertAffiliatePilotV4ChromaToAlpha(data, 2, 1, "#ff00ff");
  assert.equal(data[3], 0);
  assert.equal(data[7], 255);
  assert.equal(stats.visibleChromaPixelCountAfter, 0);
});
