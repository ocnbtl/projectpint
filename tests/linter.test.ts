import test from "node:test";
import assert from "node:assert/strict";
import { lintPin } from "../lib/linter.ts";

test("lintPin blocks missing overlay text", () => {
  const result = lintPin({
    Title: "Bathroom upgrade under $75",
    Caption_1: "Save time with this bathroom reset under $75.",
    Caption_2: "Reduce clutter and keep mornings easier.",
    Caption_3: "Read the full guide.",
    Overlay_1: "",
    Overlay_2: "",
    Has_Text_Overlay: false,
    Image_Prompt: "AI bathroom scene, no logos, no people"
  });

  assert.ok(result.Quality_Flags.includes("blocking:missing_overlay_text"));
});

test("lintPin recognizes explicit visual risk terms", () => {
  const result = lintPin({
    Title: "Bathroom reset under $75",
    Caption_1: "Save time with one fix under $75.",
    Caption_2: "Keep counters calmer and routines easier.",
    Caption_3: "See full steps.",
    Overlay_1: "Reset under $75",
    Overlay_2: "Renter-safe",
    Has_Text_Overlay: true,
    Image_Prompt: "AI bathroom scene with a real person and visible logo"
  });

  assert.ok(result.Visual_Risk_Flags.some((f) => f.includes("real person")));
  assert.ok(result.Visual_Risk_Flags.some((f) => f.includes("logo")));
});

test("lintPin does not flag negated visual risk terms", () => {
  const result = lintPin({
    Title: "Bathroom reset under $75",
    Caption_1: "Save time with one fix under $75.",
    Caption_2: "Keep counters calmer and routines easier.",
    Caption_3: "See full steps.",
    Overlay_1: "Reset under $75",
    Overlay_2: "Renter-safe",
    Has_Text_Overlay: true,
    Image_Prompt: "AI bathroom scene, no logo, no watermark, no real person"
  });

  assert.equal(result.Visual_Risk_Flags.length, 0);
});

test("lintPin marks sales-heavy copy as naturalness risk", () => {
  const result = lintPin({
    Title: "Must buy bathroom hack now now!!!",
    Caption_1: "Limited time secret trick under $75.",
    Caption_2: "Guaranteed instant result.",
    Caption_3: "Act fast.",
    Overlay_1: "Hack under $75",
    Overlay_2: "Do it now",
    Has_Text_Overlay: true,
    Image_Prompt: "AI bathroom scene"
  });

  assert.equal(result.Naturalness_Flag, false);
  assert.ok(result.Quality_Flags.some((f) => f.includes("sales_tone_risk")));
});
