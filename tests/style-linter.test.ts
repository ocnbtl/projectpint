import test from "node:test";
import assert from "node:assert/strict";
import { lintEditorialStyle } from "../lib/style-linter.ts";

test("style linter aligns renter-first content to ICP-1", () => {
  const text = `
You are a renter and need reversible upgrades that protect your deposit.
This no-drill plan helps reduce stress, save time, and create less clutter.
Use temporary hardware and landlord-safe adhesive options.
`;

  const result = lintEditorialStyle("BLOG-001", "blog", text);
  assert.equal(result.best_icp.icp_id, "ICP-1");
  assert.ok(result.score >= 70);
});

test("style linter flags hard-sell language", () => {
  const text = `
Buy now. Limited time. Act fast.
This guide is guaranteed to work for everyone.
`;

  const result = lintEditorialStyle("BLOG-002", "blog", text);
  assert.ok(result.flags.some((f) => f.startsWith("hard_sell_language")));
});

test("style linter flags weak benefit framing", () => {
  const text = `
Bathroom layout notes and materials list.
Shelf depth and paint options are included.
`;

  const result = lintEditorialStyle("MICRO-001", "micro", text);
  assert.ok(result.flags.includes("benefit_framing_weak"));
});
