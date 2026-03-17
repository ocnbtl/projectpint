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

test("quality check warns when long content sounds too stiff from low contraction use", () => {
  const result = summarizeContentQuality({
    id: "BLOG_9003",
    kind: "blog",
    title: "Bathroom bulb choices on a budget",
    content: `# Bathroom bulb choices on a budget

## Why people swap bulbs first
You need a practical change that improves the room fast. You want better light in the mirror, cleaner visibility near the sink, and less frustration during early routines. The room feels dim, the fixture is basic, and the budget is limited.

## Steps
1. Check the fixture.
2. Compare lumen output.
3. Pick a better color temperature.

• Budget range: $10 to $25.
• Time and tools: 20 minutes; step stool, cloth.
• Tradeoff: higher quality bulbs cost more up front but usually last longer.

## What to remember
You should test the light at night. You should keep the fixture clean. You should avoid buying the coldest bulb on the shelf when the room already feels stark. You should replace matching vanity bulbs together when possible.`,
    ctaUrl: "https://diyesu.com/start-here",
    existingTitles: [],
    allowedCtaUrls: ["https://diyesu.com/start-here", "/start-here"]
  });

  assert.match(result.notes, /WARN natural contraction mix/);
});
