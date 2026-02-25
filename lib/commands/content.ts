import path from "node:path";
import { ensureDir, writeText } from "../io.ts";
import { loadTab, saveTab } from "../store.ts";
import type { UrlInventoryItem } from "../types.ts";

export function renderMicroGuide(slug: string, pillar: string): string {
  const title = slug
    .replace("/micro/", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
  const pillarLine: Record<string, string> = {
    RenterFriendly: "This mini guide is written for renters who want cleaner function without risking their deposit.",
    BudgetDIY: "This mini guide is for anyone who needs visual progress on a strict budget.",
    SmallSpace: "This mini guide helps when your bathroom feels crowded even after cleaning.",
    StorageOrganization: "This mini guide targets daily clutter loops that keep coming back.",
    Styling: "This mini guide helps you add personality without making the room feel busier.",
    PlantsBiophilic: "This mini guide helps you add plants that survive real bathroom conditions."
  };

  return `# ${title}

${pillarLine[pillar] ?? pillarLine.BudgetDIY}

## Quick Framing
Most people do too much at once and end up spending more without fixing daily friction. This guide keeps it simple: one pain point, one anchor fix, one support layer.

## What To Do In 45-90 Minutes
1. **Pick one friction point.**
Choose the thing that annoys you every day (counter clutter, weak lighting, nowhere for towels, etc.).

2. **Set the boundary first.**
- Budget: under $75 / $150 / $300
- Install mode: no-drill or drill-allowed
- Non-negotiable: easy cleanup and maintenance

3. **Install one anchor fix.**
Anchor fixes are changes you can feel immediately. Example: vertical storage, better task light placement, or a category tray system.

4. **Add one support habit.**
Labeling, category rules, or "reset in 2 minutes" keeps the upgrade working after week one.

## The Benefit You Should Notice
- Less visual noise when you walk in
- Faster daily routine
- Fewer impulse buys because decisions are clearer

## Common Mistakes
- Shopping before measuring
- Choosing pretty items that are hard to maintain
- Ignoring humidity when selecting materials

## Related Reads (Subtle Next Step)
If you want a broader path by budget and install type, check \`/start-here\`. If your next focus is plants, \`/lead-magnets/plant-picker\` is a practical follow-up.
`;
}

export function writeMicroGuidesForInventory(inventory: UrlInventoryItem[]): void {
  ensureDir(path.join(process.cwd(), "micro_guides"));
  const microRows = inventory.filter((item) => item.Type === "micro");
  for (const item of microRows) {
    const slug = item.URL.replace("/micro/", "");
    const content = renderMicroGuide(item.URL, item.Pillar);
    writeText(path.join(process.cwd(), "micro_guides", `${slug}.md`), content);
    writeText(path.join(process.cwd(), "blog_drafts", `${slug}.md`), content);
  }
}

export function generateMicroDestinations(n: number): void {
  const inventory = loadTab<UrlInventoryItem>("URL_Inventory");
  const existing = new Set(inventory.map((u) => u.URL));
  let counter = 1;
  while (n > 0) {
    const slug = `/micro/auto-generated-mini-guide-${counter}`;
    counter += 1;
    if (existing.has(slug)) continue;

    inventory.push({
      URL_ID: `URL-AUTO-${String(counter).padStart(3, "0")}`,
      URL: slug,
      Type: "micro",
      Pillar: "BudgetDIY",
      Status: "published",
      Last_Posted_At: "",
      Cooldown_Hours: 24,
      Destination_Intent_Default: "Teach",
      Priority: 40
    });

    const content = renderMicroGuide(slug, "BudgetDIY");
    ensureDir(path.join(process.cwd(), "blog_drafts"));
    ensureDir(path.join(process.cwd(), "micro_guides"));
    writeText(path.join(process.cwd(), "blog_drafts", `${slug.replace("/micro/", "")}.md`), content);
    writeText(path.join(process.cwd(), "micro_guides", `${slug.replace("/micro/", "")}.md`), content);
    n -= 1;
  }
  saveTab("URL_Inventory", inventory);
}
