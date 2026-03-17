import assert from "node:assert/strict";
import test from "node:test";
import { summarizeContentQuality } from "../lib/content-quality.ts";

test("quality check ignores dash characters inside markdown link URLs", () => {
  const content = `# Renter safe bathroom reset

## What this solves
You want a calmer daily routine in a small bathroom.

## Budget and tools
Budget range: $35 to $90.
Install note: keep the setup reversible and landlord safe.
Time and tools: 45 minutes; measuring tape, cloth, adhesive hooks.
Tradeoff: removable hardware is safer for your deposit, but it may hold less weight.

## Steps
1. Clear one crowded zone.
2. Test one renter safe fix.

## Quick checks
• Save time during the morning routine.
• Create less clutter after cleanup.

## Next step
If you want the next step, [Preview blueprint](/products/renter-bathroom-upgrade-blueprint).`;

  const result = summarizeContentQuality({
    id: "BLOG_9001",
    kind: "blog",
    title: "Renter safe bathroom reset",
    content,
    ctaUrl: "/products/renter-bathroom-upgrade-blueprint",
    existingTitles: [],
    allowedCtaUrls: ["/products/renter-bathroom-upgrade-blueprint", "https://diyesu.com/start-here", "/start-here"]
  });

  assert.ok(!result.blockingIssues.includes("visible_dash_characters"));
});

test("quality check blocks visible dash characters in prose", () => {
  const result = summarizeContentQuality({
    id: "GUIDE_9001",
    kind: "guide",
    title: "Quick mirror reset",
    content: `# Quick mirror reset

## Quick brief
Budget range: $25 to $60.
Install note: keep this renter-safe.
Time and tools: 35 minutes; cloth, level, measuring tape.
Tradeoff: bigger mirrors bounce more light, but they also show more splash.

## Plan
1. Fix the sink side glare.
2. Recheck the mirror height.

• Keep the counter calmer.
• Make the routine easier.`,
    ctaUrl: "https://diyesu.com/start-here",
    existingTitles: [],
    allowedCtaUrls: ["https://diyesu.com/start-here", "/start-here"]
  });

  assert.ok(result.blockingIssues.includes("visible_dash_characters"));
});

test("quality check warns on cheesy audience framing and unexplained acronyms", () => {
  const result = summarizeContentQuality({
    id: "BLOG_9002",
    kind: "blog",
    title: "Budget bathroom bulb upgrades",
    content: `# Budget bathroom bulb upgrades

This post is for the person who wants brighter lighting without wasting money.

## What matters most
CRI helps color, but many shoppers skip that detail.

## Steps
1. Check the bulb shape.
2. Buy matching bulbs.

• Keep the mirror area brighter.
• Spend less upfront when you can.`,
    ctaUrl: "https://diyesu.com/start-here",
    existingTitles: [],
    allowedCtaUrls: ["https://diyesu.com/start-here", "/start-here"]
  });

  assert.match(result.notes, /WARN no cheesy audience framing/);
  assert.match(result.notes, /WARN explain on first use: CRI/);
});
