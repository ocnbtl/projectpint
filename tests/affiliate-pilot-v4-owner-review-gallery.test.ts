import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const rendererSource = fs.readFileSync(
  new URL("../scripts/render-affiliate-pilot-v4-owner-review-batch.ts", import.meta.url),
  "utf8"
);

test("owner review notes preserve spaces while typing and normalize only on export", () => {
  assert.match(rendererSource, /note:e\.target\.value\};save\(\)/);
  assert.doesNotMatch(rendererSource, /note:e\.target\.value\.trim\(\)/);
  assert.match(rendererSource, /document\.activeElement!==note/);
  assert.match(rendererSource, /note:\(entry\.note\|\|''\)\.trim\(\)/);
});
