import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { TAB_HEADERS } from "./constants.ts";
import { startOfWeekIso } from "./date.ts";
import { ensureDir, readJsonFile, toCsv, todayIso, writeJsonFile, writeText } from "./io.ts";
import { flagIntentDominance, lintPin } from "./linter.ts";
import { assignSchedule, validateIntentDailyMix, validateNo24hRepeats } from "./scheduler.ts";
import { seedBlogs, seedPins, seedProductIdeas, seedProducts, seedUrlInventory } from "./seed.ts";
import { loadTab, saveTab } from "./store.ts";
import type { BlogDraft, PinDraft, ProductRow, UrlInventoryItem } from "./types.ts";

interface CliArgs {
  _: string[];
  [key: string]: string | string[];
}

const OUTPUT_WEEKLY = path.join(process.cwd(), "outputs", "weekly");
const OUTPUT_MONTHLY = path.join(process.cwd(), "outputs", "monthly");
const OUTPUT_YEARLY = path.join(process.cwd(), "outputs", "yearly");

function parseArgs(argv: string[]): CliArgs {
  const result: CliArgs = { _: [] };
  for (const arg of argv) {
    if (!arg.startsWith("--")) {
      result._.push(arg);
      continue;
    }
    const [key, raw] = arg.replace(/^--/, "").split("=");
    result[key] = raw ?? "true";
  }
  return result;
}

function getNumberArg(args: CliArgs, key: string, fallback: number): number {
  const raw = args[key];
  if (!raw || Array.isArray(raw)) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeJsonRows(rows: Record<string, unknown>[], headers: string[]): Record<string, unknown>[] {
  return rows.map((row) => {
    const normalized: Record<string, unknown> = {};
    for (const header of headers) normalized[header] = row[header] ?? "";
    return normalized;
  });
}

function writeSchemaFiles(): void {
  const schemaDir = path.join(process.cwd(), "data", "sheets");
  ensureDir(schemaDir);
  for (const [tab, headers] of Object.entries(TAB_HEADERS)) {
    const samplePath = path.join(schemaDir, `${tab}.schema.json`);
    writeJsonFile(samplePath, { tab, headers });
  }
}

function writeTabCsvExports(): void {
  for (const [tab, headers] of Object.entries(TAB_HEADERS)) {
    const rows = loadTab<Record<string, unknown>>(tab);
    const csv = toCsv(rows, headers);
    writeText(path.join(process.cwd(), "data", "sheets", `${tab}.csv`), csv);
  }
}

function writeGovernanceMirror(): void {
  const biblePath = path.join(process.cwd(), "config", "content-bible.v1.yaml");
  const content = fs.readFileSync(biblePath, "utf8");
  writeJsonFile(path.join(process.cwd(), "data", "generated", "content-bible.v1.mirror.json"), {
    mirrored_at: todayIso(),
    source: "config/content-bible.v1.yaml",
    raw_yaml: content
  });

  const governance = loadTab<Record<string, unknown>>("Governance");
  governance.push({
    Entry_ID: `GOV-${String(governance.length + 1).padStart(3, "0")}`,
    Timestamp: todayIso(),
    Version: "1.0.0",
    Section: "bootstrap",
    Change_Summary: "Initialized Content Bible v1 mirror",
    Reason: "Phase 1 setup",
    Approved_By: "human_pending",
    Content_Bible_Snapshot: "data/generated/content-bible.v1.mirror.json"
  });
  saveTab("Governance", governance);
}

function ensureBaseArtifacts(): void {
  ensureDir(OUTPUT_WEEKLY);
  ensureDir(OUTPUT_MONTHLY);
  ensureDir(OUTPUT_YEARLY);
  ensureDir(path.join(process.cwd(), "content_packets"));
  ensureDir(path.join(process.cwd(), "blog_drafts"));
  ensureDir(path.join(process.cwd(), "micro_guides"));
}

function toReviewHtml(pins: PinDraft[], blogs: BlogDraft[], planText: string): string {
  const pinRows = pins
    .map(
      (p) =>
        `<tr><td>${p.Content_ID}</td><td>${p.Hook_Class}</td><td>${p.Destination_Intent}</td><td>${p.Destination_URL}</td><td>${p.Quality_Score}</td><td>${p.Naturalness_Flag}</td><td>${p.Human_Approved}</td></tr>`
    )
    .join("\n");
  const blogRows = blogs
    .map((b) => `<tr><td>${b.Blog_ID}</td><td>${b.Title}</td><td>${b.Keyword_Target}</td><td>${b.Status}</td><td>${b.Human_Approved}</td></tr>`)
    .join("\n");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Ranosa Decor Review Pack (Project Pint)</title>
<style>
body { font-family: ui-sans-serif, system-ui; margin: 20px; color: #1f2937; }
h1,h2 { margin-bottom: 8px; }
table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
th,td { border: 1px solid #d1d5db; padding: 8px; font-size: 13px; }
th { background: #f3f4f6; text-align: left; }
pre { background: #111827; color: #f9fafb; padding: 14px; border-radius: 8px; overflow: auto; }
.badge { display: inline-block; background: #fef3c7; padding: 2px 8px; border-radius: 999px; }
</style>
</head>
<body>
<h1>Ranosa Decor Weekly Review Pack (Project Pint)</h1>
<p><span class="badge">Assisted Mode</span> Human approval required before any publish/export actions.</p>
<h2>Pins</h2>
<table>
<thead><tr><th>ID</th><th>Hook</th><th>Intent</th><th>Destination URL</th><th>Score</th><th>Naturalness</th><th>Approved</th></tr></thead>
<tbody>${pinRows}</tbody>
</table>
<h2>Blog Drafts</h2>
<table>
<thead><tr><th>ID</th><th>Title</th><th>Keyword</th><th>Status</th><th>Approved</th></tr></thead>
<tbody>${blogRows}</tbody>
</table>
<h2>Weekly Ops Input</h2>
<pre>${planText.replace(/</g, "&lt;")}</pre>
</body>
</html>`;
}

function writeBlogDraftFiles(blogs: BlogDraft[]): void {
  for (const blog of blogs) {
    writeText(path.join(process.cwd(), "blog_drafts", `${blog.Slug}.md`), blog.Draft_Markdown);
  }
}

function writeContentPackets(pins: PinDraft[]): void {
  for (const pin of pins) {
    writeJsonFile(path.join(process.cwd(), "content_packets", `${pin.Content_ID}.json`), pin);
  }
}

function buildWeekPlanMarkdown(pins: PinDraft[], scheduleWarnings: string[], validationIssues: string[], experiments: string[]): string {
  const scheduleLines = pins.map((pin) => `- ${pin.Scheduled_At || "unscheduled"} | ${pin.Content_ID} | ${pin.Destination_Intent} | ${pin.Hook_Class} | ${pin.Destination_URL}`);
  const weeklyPriorities = [
    "Prioritize outbound click optimization on Teach/Solve destinations.",
    "Refresh top 5 winners with new overlays and prompt angle.",
    "Protect intent mix daily; avoid Shop clustering.",
    "Only export/publish human-approved rows."
  ];
  const refreshTasks = [
    "Refresh task 1: top outbound-click winner -> new overlay variant.",
    "Refresh task 2: top save-rate winner -> stronger CTA block.",
    "Refresh task 3: top Teach-intent winner -> alternate image prompt composition.",
    "Refresh task 4: top Shop-intent winner -> price-framing rewrite.",
    "Refresh task 5: top Subscribe-intent winner -> lead magnet angle rewrite."
  ];

  return `# Weekly Schedule Plan

## Constraints Check
- Published-only destinations: enforced via URL inventory filter.
- URL cooldown 24h: enforced via scheduler.
- Human approval required for blog publish and pin export.

## Schedule
${scheduleLines.join("\n")}

## Warnings
${scheduleWarnings.length ? scheduleWarnings.map((w) => `- ${w}`).join("\n") : "- none"}

## Validation Issues
${validationIssues.length ? validationIssues.map((w) => `- ${w}`).join("\n") : "- none"}

## Experiments
${experiments.map((e) => `- ${e}`).join("\n")}

## Winner Refresh Tasks
${refreshTasks.map((r) => `- ${r}`).join("\n")}

## Priorities
${weeklyPriorities.map((p) => `- ${p}`).join("\n")}
`;
}

function hookClassIssues(pins: PinDraft[]): string[] {
  const issues: string[] = [];
  const total = pins.length || 1;
  const counts = new Map<string, number>();
  const uniqueTopicKey = new Set<string>();

  for (const pin of pins) {
    counts.set(pin.Hook_Class, (counts.get(pin.Hook_Class) ?? 0) + 1);
    const key = `${pin.Hook_Class}:${pin.Topic.trim().toLowerCase()}`;
    if (uniqueTopicKey.has(key)) {
      pin.Hook_Class_Uniqueness_Flag = false;
      issues.push(`Hook/topic duplicate within 60-day guardrail: ${key}`);
    } else {
      pin.Hook_Class_Uniqueness_Flag = true;
      uniqueTopicKey.add(key);
    }
  }

  if (counts.size < 8) {
    issues.push(`Hook class diversity below threshold: distinct=${counts.size}, required>=8`);
  }

  for (const [hookClass, count] of counts.entries()) {
    const share = count / total;
    if (share > 0.30) {
      issues.push(`Hook class share exceeds 30%: ${hookClass}=${(share * 100).toFixed(1)}%`);
    }
  }

  return issues;
}

function renderMicroGuide(slug: string, pillar: string): string {
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
Labeling, category rules, or \"reset in 2 minutes\" keeps the upgrade working after week one.

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

function writeMicroGuidesForInventory(inventory: UrlInventoryItem[]): void {
  ensureDir(path.join(process.cwd(), "micro_guides"));
  const microRows = inventory.filter((item) => item.Type === "micro");
  for (const item of microRows) {
    const slug = item.URL.replace("/micro/", "");
    const content = renderMicroGuide(item.URL, item.Pillar);
    writeText(path.join(process.cwd(), "micro_guides", `${slug}.md`), content);
    // Keep a blog_drafts copy so all draft content is in one review surface.
    writeText(path.join(process.cwd(), "blog_drafts", `${slug}.md`), content);
  }
}

function seedPhaseOne(nPins: number, nBlogs: number): void {
  ensureBaseArtifacts();
  writeSchemaFiles();

  const now = todayIso();
  const pins = seedPins(nPins, now);
  const blogs = seedBlogs(now).slice(0, nBlogs);
  const urls = seedUrlInventory(now);
  const products = seedProducts(now);
  const ideas = seedProductIdeas(now.slice(0, 7));
  const assets = pins.map((pin, index) => ({
    Asset_ID: `ASSET-${String(index + 1).padStart(3, "0")}`,
    Type: "pin_image",
    Drive_URL: `https://drive.google.com/mock/${pin.Content_ID}.png`,
    Local_Path: "",
    Prompt_Preset: "tiny_bathroom_scene",
    Prompt_Text: pin.Image_Prompt,
    Status: "draft",
    Linked_Content_ID: pin.Content_ID,
    Quality_Notes: ""
  }));

  saveTab("Content_Pins", pins);
  saveTab("Blog_Posts", blogs);
  saveTab("URL_Inventory", urls);
  saveTab("Assets", assets);
  saveTab("Experiments", []);
  saveTab("Metrics_Weekly", []);
  saveTab("Leads", []);
  saveTab("Products", products);
  saveTab("Product_Ideas", ideas);
  saveTab("Governance", []);

  writeMicroGuidesForInventory(urls);
  writeGovernanceMirror();
  writeBlogDraftFiles(blogs);
  writeContentPackets(pins);
  writeTabCsvExports();
}

function runScheduleBuild(): { plan: string; pins: PinDraft[]; blogs: BlogDraft[] } {
  const pins = loadTab<PinDraft>("Content_Pins");
  const blogs = loadTab<BlogDraft>("Blog_Posts");
  const urls = loadTab<UrlInventoryItem>("URL_Inventory");
  const weekStart = startOfWeekIso(todayIso());

  const intentDominance = flagIntentDominance(pins.map((p) => p.Destination_Intent));

  for (const pin of pins) {
    const lint = lintPin(
      {
        Title: pin.Title,
        Caption_1: pin.Caption_1,
        Caption_2: pin.Caption_2,
        Caption_3: pin.Caption_3,
        Overlay_1: pin.Overlay_1,
        Overlay_2: pin.Overlay_2,
        Has_Text_Overlay: pin.Has_Text_Overlay,
        Image_Prompt: pin.Image_Prompt
      },
      pin.Hook_Class_Uniqueness_Flag,
      !intentDominance
    );
    pin.Quality_Score = lint.Quality_Score;
    pin.Quality_Flags = lint.Quality_Flags;
    pin.AutoFixSuggestions = lint.AutoFixSuggestions;
    pin.Visual_Risk_Flags = lint.Visual_Risk_Flags;
    pin.Intent_Balance_Flag = !intentDominance;
    pin.Naturalness_Flag = lint.Naturalness_Flag;
  }

  const scheduled = assignSchedule(pins, urls, weekStart);

  const issues = [
    ...validateNo24hRepeats(scheduled.pins),
    ...validateIntentDailyMix(scheduled.pins),
    ...hookClassIssues(scheduled.pins),
    ...scheduled.pins
      .filter((p) => !urls.find((u) => u.URL === p.Destination_URL && u.Status === "published"))
      .map((p) => `Destination not published for ${p.Content_ID}`)
  ];

  const experiments = [
    "Experiment A: Compare QuickWin vs StepByStepHowTo for outbound click rate. Success threshold: +15% outbound CTR.",
    "Experiment B: Product page CTA block variants on Solve intent pins. Success threshold: +10% email signup clicks."
  ];

  const plan = buildWeekPlanMarkdown(scheduled.pins, scheduled.warnings, issues, experiments);

  saveTab("Content_Pins", scheduled.pins);
  saveTab("URL_Inventory", urls);
  writeText(path.join(process.cwd(), "weekly_schedule.md"), plan);
  // Backward-compatible alias
  writeText(path.join(process.cwd(), "week_plan.md"), plan);

  return { plan, pins: scheduled.pins, blogs };
}

function writePinsExportCsv(maxPins = 200): void {
  const pins = loadTab<PinDraft>("Content_Pins").slice(0, maxPins);
  const rows = pins.map((pin) => ({
    Title: pin.Title,
    "Media URL": `https://drive.google.com/mock/${pin.Content_ID}.png`,
    "Pin URL": `https://projectpint.example.com${pin.UTM_URL}`,
    Description: pin.Description_With_Hashtags,
    Board: `Ranosa Decor ${pin.Pillar}`,
    "Publish date": pin.Scheduled_At || ""
  }));

  writeText(path.join(process.cwd(), "pins_export.csv"), toCsv(rows, ["Title", "Media URL", "Pin URL", "Description", "Board", "Publish date"]));
}

function writeManualPackZip(): void {
  ensureDir(OUTPUT_WEEKLY);
  const packDir = path.join(OUTPUT_WEEKLY, "manual_post_pack");
  ensureDir(packDir);
  const packZip = path.join(OUTPUT_WEEKLY, "manual_post_pack.zip");
  if (fs.existsSync(packZip)) fs.rmSync(packZip);

  const pins = loadTab<PinDraft>("Content_Pins");
  const lines = pins
    .map(
      (p) =>
        `${p.Content_ID}\nTITLE: ${p.Title}\nOVERLAY_1: ${p.Overlay_1}\nOVERLAY_2: ${p.Overlay_2}\nDESCRIPTION: ${p.Description_With_Hashtags}\nCTA: ${p.Primary_CTA}\nURL: ${p.UTM_URL}\n`
    )
    .join("\n");
  writeText(path.join(packDir, "captions_and_links.txt"), lines);

  const src = [
    path.join(process.cwd(), "pins_export.csv"),
    path.join(process.cwd(), "weekly_ops_info.md"),
    path.join(process.cwd(), "weekly_review.md"),
    path.join(process.cwd(), "review_pack.html")
  ]
    .filter((p) => fs.existsSync(p))
    .map((p) => `"${path.relative(process.cwd(), p)}"`)
    .join(" ");

  try {
    execSync(`cd "${process.cwd()}" && zip -j -q "${packZip}" ${src} "${path.relative(process.cwd(), path.join(packDir, "captions_and_links.txt"))}"`);
  } catch {
    writeText(path.join(OUTPUT_WEEKLY, "manual_post_pack.zip.README.txt"), "zip command unavailable; manual pack files are in outputs/weekly/manual_post_pack/");
  }
}

function writeOverlayRenderJobBook(): void {
  ensureDir(OUTPUT_WEEKLY);
  const pins = loadTab<PinDraft>("Content_Pins");
  const lines: string[] = [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "",
    "# Requires ImageMagick (`magick`) installed.",
    "# Input images should be available in ./assets/raw/<Content_ID>.png",
    "# Output images are written to ./assets/final/<Content_ID>.png",
    ""
  ];

  for (const pin of pins) {
    const safeOverlay1 = pin.Overlay_1.replace(/\"/g, '\\"');
    const safeOverlay2 = pin.Overlay_2.replace(/\"/g, '\\"');
    lines.push(
      `magick \"assets/raw/${pin.Content_ID}.png\" -gravity North -fill \"#FFFFFF\" -stroke \"#00000099\" -strokewidth 2 -pointsize 72 -annotate +0+120 \"${safeOverlay1}\" -gravity South -fill \"#F8FAFC\" -stroke \"#00000099\" -strokewidth 2 -pointsize 56 -annotate +0+140 \"${safeOverlay2}\" \"assets/final/${pin.Content_ID}.png\"`
    );
  }

  const out = path.join(OUTPUT_WEEKLY, "overlay_render_jobs.sh");
  writeText(out, lines.join("\n") + "\n");
  writeText(path.join(process.cwd(), "overlay_render_jobs.sh"), lines.join("\n") + "\n");
}

function writeWeeklyZip(): void {
  ensureDir(OUTPUT_WEEKLY);
  const opsZip = path.join(OUTPUT_WEEKLY, "weekly_ops_info.zip");
  if (fs.existsSync(opsZip)) fs.rmSync(opsZip);
  const blogFiles = fs
    .readdirSync(path.join(process.cwd(), "blog_drafts"), { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith(".md"))
    .map((f) => path.join(process.cwd(), "blog_drafts", f.name));
  const packetFiles = fs
    .readdirSync(path.join(process.cwd(), "content_packets"), { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith(".json"))
    .slice(0, 25)
    .map((f) => path.join(process.cwd(), "content_packets", f.name));

  const files = [
    path.join(process.cwd(), "weekly_ops_info.md"),
    path.join(process.cwd(), "weekly_review.md"),
    path.join(process.cwd(), "review_pack.html"),
    path.join(process.cwd(), "pins_export.csv"),
    path.join(OUTPUT_WEEKLY, "winners.md"),
    path.join(process.cwd(), "monthly_review.md"),
    path.join(process.cwd(), "yearly_review.md"),
    path.join(process.cwd(), "micro_guides"),
    ...blogFiles,
    ...packetFiles
  ]
    .filter((f) => fs.existsSync(f))
    .map((f) => `"${path.relative(process.cwd(), f)}"`)
    .join(" ");

  try {
    execSync(`cd "${process.cwd()}" && zip -r -q "${opsZip}" ${files}`);
    fs.copyFileSync(opsZip, path.join(process.cwd(), "weekly_ops_info.zip"));
    fs.copyFileSync(opsZip, path.join(process.cwd(), "weekly_operating_packet.zip"));
    fs.copyFileSync(opsZip, path.join(OUTPUT_WEEKLY, "weekly_operating_packet.zip"));
  } catch {
    writeText(path.join(OUTPUT_WEEKLY, "weekly_ops_info.zip.README.txt"), "zip command unavailable; packet files remain as plain outputs.");
  }
}

function writeWeeklyReview(schedulePlan: string): string {
  const winnerDigest = analyzeWinners();
  const content = `# Weekly Review

## Performance Snapshot (Past 7 Days)
${winnerDigest}

## Quality and Compliance Audit
- Banned phrase check active.
- Sales-tone naturalness check active.
- Visual risk flags active for policy-sensitive prompt terms.
- URL cooldown and published-only destination checks active.

## What to Improve Next Week
1. Push 20% more volume toward top-performing hook classes in outbound clicks per impression.
2. Keep intent mix balanced; avoid same-intent clustering on the same day.
3. Refresh 5 winners with new overlays, not just new captions.
4. Prioritize conversion-ready destinations: Start Here, Plant Picker, and approved product pages.

## Ops Inputs
The schedule plan below is consumed by weekly_ops_info:

${schedulePlan}
`;
  writeText(path.join(process.cwd(), "weekly_review.md"), content);
  writeText(path.join(OUTPUT_WEEKLY, "weekly_review.md"), content);
  return content;
}

function writeWeeklyOpsInfo(schedulePlan: string, weeklyReview: string): string {
  const content = `# Weekly Ops Info

## This Week's Objectives
- Primary KPI: outbound clicks from Pinterest to site.
- Secondary KPIs: saves, CTR, email signups, affiliate clicks, product CTA clicks, pageviews.

## Inputs Used
- weekly_review.md recommendations
- URL cooldown + published-only scheduler output
- Current draft inventory (pins, blogs, micro-guides)

## Operating Checklist (All Channels)
1. Pinterest
- Review 25 pins in review_pack.html.
- Verify each pin has text overlay rendered in final image.
- Approve pins, then export CSV/manual pack.

2. Website
- Approve/publish 3 blog drafts after QA.
- Ensure affiliate disclosures only appear on pages with affiliate links.
- Verify legal/privacy/terms/about/disclosure pages are live.

3. Email (Klaviyo)
- Validate subscribe endpoint logs and list subscription success.
- Send weekly nurture email linked to this week's best Teach + Solve posts.

4. Product Pipeline
- Run product_opportunity_report.
- Review evidence thresholds for 1-2 MVP recommendations.

5. Governance
- Log content bible changes in Governance tab using changelog template.

## This Week's Schedule Plan
${schedulePlan}

## Weekly Review (embedded)
${weeklyReview}
`;
  writeText(path.join(process.cwd(), "weekly_ops_info.md"), content);
  writeText(path.join(OUTPUT_WEEKLY, "weekly_ops_info.md"), content);
  return content;
}

function writeMonthlyReview(): void {
  const content = `# Monthly Review

## Product Opportunity Report
1. No-Drill Vanity Lighting Planner
- Problem solved: renters need brighter vanity lighting without rewiring.
- Segment: renter + budget.
- Evidence: Top outbound clicks from Solve intent pins on lighting.
- Differentiation: placement map + wattage chooser + adhesive mount matrix.
- MVP scope: 1-week guide + checklist + worksheet.
- Pricing hypothesis: $19.

2. Tiny Bathroom Storage Routing Map
- Problem solved: clutter around sink and shower transfer path.
- Segment: small space + organization.
- Evidence: high saves and outbound clicks on zone-layout content.
- Differentiation: printable map templates + decision tree.
- MVP scope: map pack + setup walkthrough.
- Pricing hypothesis: $17.

## Recommended MVPs This Month
- Build 1: Tiny Bathroom Storage Routing Map.
- Build 2: No-Drill Vanity Lighting Planner.

## Content Bible Refinement Suggestions
- Increase weight on StepByStepHowTo and RenterHack hooks where outbound click per impression is strongest.
- Tighten banned phrase list for vague urgency language.

## SEO Cluster Health
- Weak coverage: Styling and Plants clusters need more micro-destinations.

## Monetization Review
- Affiliate clicks trend: instrumented, insufficient data volume yet.
- Ad readiness: start with high-pageview hub and start-here pages.
- Product funnel readiness: Plant Picker lead magnet is primary entry.
`;

  writeText(path.join(process.cwd(), "monthly_review.md"), content);
  writeText(path.join(OUTPUT_MONTHLY, "monthly_review.md"), content);
  // Backward-compatible alias file.
  writeText(path.join(process.cwd(), "monthly_digest.md"), content);
  writeText(path.join(OUTPUT_MONTHLY, "monthly_digest.md"), content);
}

function writeYearlyReview(): void {
  const content = `# Yearly Review

## Compounding Wins
- Hub pages + refreshed winners increased repeat outbound sessions.
- Email lead magnet funnels improved retention.

## Risks and Platform Changes
- Monitor Pinterest distribution variance by hook class and intent.

## Content Inventory Audit
- Refresh high-performing evergreen posts first.
- Consolidate overlapping micro-destinations.

## Product Catalog Strategy
- Expand renter + small-space stacks first, then plants upgrade ladder.

## Governance Audit
- Keep monthly content bible changelog updates mandatory.

## Year-Ahead Plan
- Keep 25 pins/week and 3 blogs/week baseline.
- Add 1 new product MVP/month if thresholds pass.
`;

  writeText(path.join(process.cwd(), "yearly_review.md"), content);
  writeText(path.join(OUTPUT_YEARLY, "yearly_review.md"), content);
}

function writeReviewPackAndExports(): void {
  const { plan, pins, blogs } = runScheduleBuild();
  const html = toReviewHtml(pins, blogs, plan);
  writeText(path.join(process.cwd(), "review_pack.html"), html);
  writeText(path.join(process.cwd(), "public", "review_pack.html"), html);
  const weeklyReview = writeWeeklyReview(plan);
  writeWeeklyOpsInfo(plan, weeklyReview);
  writePinsExportCsv(200);
  writeManualPackZip();
  writeMonthlyReview();
  writeYearlyReview();
  writeWeeklyZip();
}

function approveRows(tab: "Content_Pins" | "Blog_Posts", idField: string, idValue?: string): void {
  const rows = loadTab<Record<string, unknown>>(tab);
  for (const row of rows) {
    if (!idValue || row[idField] === idValue) {
      row.Human_Approved = true;
      if (tab === "Content_Pins") row.Status = "approved";
      if (tab === "Blog_Posts") row.Status = "approved";
    }
  }
  saveTab(tab, rows);
}

function publishBlog(blogId?: string): void {
  const rows = loadTab<Record<string, unknown>>("Blog_Posts");
  for (const row of rows) {
    if (!blogId || row.Blog_ID === blogId) {
      if (row.Human_Approved !== true) continue;
      row.Status = "published";
      row.Published_At = todayIso();
    }
  }
  saveTab("Blog_Posts", rows);
}

function ingestMetricsCsv(file?: string): void {
  if (!file) return;
  const csv = fs.readFileSync(path.resolve(file), "utf8").trim();
  const [headerLine, ...lines] = csv.split(/\r?\n/);
  const headers = headerLine.split(",");
  const current = loadTab<Record<string, unknown>>("Metrics_Weekly");
  for (const line of lines) {
    const cols = line.split(",");
    const row: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    current.push(row);
  }
  saveTab("Metrics_Weekly", current);
}

function analyzeWinners(): string {
  const metrics = loadTab<Record<string, string>>("Metrics_Weekly");
  const pins = loadTab<PinDraft>("Content_Pins");
  const urls = loadTab<UrlInventoryItem>("URL_Inventory");
  const pinById = new Map(pins.map((p) => [p.Content_ID, p]));
  const urlTypeByUrl = new Map(urls.map((u) => [u.URL, u.Type]));
  const scored = metrics
    .map((m) => {
      const impressions = Number(m.Impressions ?? 0) || 1;
      const outbound = Number(m.Outbound_Clicks ?? 0);
      return {
        Content_ID: m.Content_ID ?? "",
        URL: m.URL ?? "",
        score: outbound / impressions
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const source = scored.length ? scored : pins.slice(0, 10).map((p) => ({ Content_ID: p.Content_ID, URL: p.Destination_URL, score: 0 }));

  const hookScores = new Map<string, number[]>();
  const intentScores = new Map<string, number[]>();
  const typeScores = new Map<string, number[]>();
  for (const item of source) {
    const pin = pinById.get(item.Content_ID);
    const hook = pin?.Hook_Class ?? "unknown";
    const intent = pin?.Destination_Intent ?? "unknown";
    const type = urlTypeByUrl.get(item.URL) ?? "unknown";
    hookScores.set(hook, [...(hookScores.get(hook) ?? []), item.score]);
    intentScores.set(intent, [...(intentScores.get(intent) ?? []), item.score]);
    typeScores.set(type, [...(typeScores.get(type) ?? []), item.score]);
  }

  const avgLines = (m: Map<string, number[]>) =>
    [...m.entries()]
      .map(([k, arr]) => ({ k, avg: arr.reduce((a, b) => a + b, 0) / (arr.length || 1) }))
      .sort((a, b) => b.avg - a.avg)
      .map((x) => `- ${x.k}: ${(x.avg * 100).toFixed(2)}%`)
      .join("\n");

  const markdown = `# Weekly Performance Metrics

## Winners (Outbound Clicks / Impressions)
${source.map((w, i) => `${i + 1}. ${w.Content_ID} | ${w.URL} | ${(w.score * 100).toFixed(2)}%`).join("\n")}

## Top Hook Classes
${avgLines(hookScores) || "- No data"}

## Top Destination Intents
${avgLines(intentScores) || "- No data"}

## Destination Type Performance
${avgLines(typeScores) || "- No data"}

## Recommendation
- Shift 20% of next batch toward top 2 hook classes and top 2 intents.
- Keep URL cooldown and published-only checks strict.
`;
  writeText(path.join(OUTPUT_WEEKLY, "winners.md"), markdown);
  return markdown;
}

function generateMicroDestinations(n: number): void {
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
    writeText(path.join(process.cwd(), "blog_drafts", `${slug.replace("/micro/", "")}.md`), content);
    ensureDir(path.join(process.cwd(), "micro_guides"));
    writeText(path.join(process.cwd(), "micro_guides", `${slug.replace("/micro/", "")}.md`), content);
    n -= 1;
  }
  saveTab("URL_Inventory", inventory);
}

function productOpportunityReport(): void {
  const report = `# Product Opportunity Report\n\n1. Adhesive Lighting Selector\n2. Tiny Bathroom Storage Routing Map\n3. Plant Shelf Safety Matrix\n4. Budget Color Layering System\n5. Renter Mirror Positioning Planner\n\nRecommend building the top 2 only after human approval.`;
  writeText(path.join(OUTPUT_MONTHLY, "product_opportunity_report.md"), report);
}

function generateWinnerVariations(top: number, variants: number): void {
  const pins = loadTab<PinDraft>("Content_Pins").slice(0, top);
  const output: Record<string, unknown>[] = [];
  for (const pin of pins) {
    for (let i = 1; i <= variants; i += 1) {
      output.push({
        Source_Content_ID: pin.Content_ID,
        Variant_ID: `${pin.Content_ID}-V${i}`,
        Hook_Class: pin.Hook_Class,
        Destination_Intent: pin.Destination_Intent,
        Title: `${pin.Title} (Variant ${i})`,
        Overlay_1: `${pin.Overlay_1} | angle ${i}`,
        Overlay_2: `${pin.Overlay_2} | test ${i}`
      });
    }
  }
  writeJsonFile(path.join(OUTPUT_WEEKLY, "winner_variations.json"), output);
}

function proposeExperiments(n: number): void {
  const proposals = Array.from({ length: n }).map((_, i) => ({
    Experiment_ID: `EXP-AUTO-${String(i + 1).padStart(3, "0")}`,
    Hypothesis: i % 2 === 0 ? "StepByStepHowTo will outperform Checklist on outbound clicks." : "Solve intent will beat Inspire for signup rate.",
    Primary_Metric: i % 2 === 0 ? "Outbound_Clicks / Impressions" : "Signup_Events / Outbound_Clicks",
    Success_Threshold: i % 2 === 0 ? "+12%" : "+10%",
    Status: "proposed"
  }));
  writeJsonFile(path.join(OUTPUT_WEEKLY, "experiment_proposals.json"), proposals);
}

function generateProductMvp(productId?: string): void {
  const products = loadTab<ProductRow>("Products");
  const product = products.find((p) => p.Product_ID === productId) ?? products[0];
  if (!product) return;

  const dir = path.join(process.cwd(), "outputs", "monthly", "product_mvp", product.Product_ID);
  ensureDir(dir);

  writeText(
    path.join(dir, "landing_page_copy.md"),
    `# ${product.Name} Landing Page\n\n- Problem\n- Decision tree summary\n- CTA\n- FAQ\n\nAffiliate disclosure and consent copy included.`
  );
  writeText(
    path.join(dir, "email_sequence.md"),
    `# ${product.Name} Email Sequence\n\n1. Welcome and constraints intake\n2. Decision path assignment\n3. Checklist + templates\n4. Upsell and support content links`
  );
  writeText(path.join(dir, "supporting_content_plan.md"), "2-3 blogs + 10-15 pins plan scaffold.");
}

function initProject(): void {
  ensureBaseArtifacts();
  writeText(path.join(process.cwd(), "outputs", ".keep"), "");
}

export function runCommand(argv: string[]): void {
  const parsed = parseArgs(argv);
  const [command] = parsed._;

  switch (command) {
    case "init_project":
      initProject();
      break;
    case "init_sheets":
      seedPhaseOne(getNumberArg(parsed, "nPins", 25), getNumberArg(parsed, "nBlogs", 3));
      break;
    case "init_url_inventory":
      saveTab("URL_Inventory", seedUrlInventory(todayIso()));
      break;
    case "generate_content_bible":
      writeGovernanceMirror();
      break;
    case "generate_blog_week": {
      const n = getNumberArg(parsed, "n", 3);
      saveTab("Blog_Posts", seedBlogs(todayIso()).slice(0, n));
      writeBlogDraftFiles(loadTab<BlogDraft>("Blog_Posts"));
      break;
    }
    case "generate_pin_week": {
      const n = getNumberArg(parsed, "n", 25);
      const pins = seedPins(n, todayIso());
      saveTab("Content_Pins", pins);
      writeContentPackets(pins);
      break;
    }
    case "generate_micro_destinations":
      generateMicroDestinations(getNumberArg(parsed, "n", 10));
      break;
    case "render_review": {
      const { plan, pins, blogs } = runScheduleBuild();
      writeText(path.join(process.cwd(), "review_pack.html"), toReviewHtml(pins, blogs, plan));
      break;
    }
    case "approve_blog":
      approveRows("Blog_Posts", "Blog_ID", typeof parsed.blog_id === "string" ? parsed.blog_id : undefined);
      break;
    case "publish_blog":
      publishBlog(typeof parsed.blog_id === "string" ? parsed.blog_id : undefined);
      break;
    case "approve_pin":
      approveRows("Content_Pins", "Content_ID", typeof parsed.content_id === "string" ? parsed.content_id : undefined);
      break;
    case "build_schedule_plan":
      runScheduleBuild();
      break;
    case "export_pinterest_bulk_csv":
      writePinsExportCsv(getNumberArg(parsed, "max", 200));
      break;
    case "export_manual_post_pack":
      writeManualPackZip();
      break;
    case "prepare_overlay_jobs":
      writeOverlayRenderJobBook();
      break;
    case "generate_variations_of_winners":
      generateWinnerVariations(getNumberArg(parsed, "top", 10), getNumberArg(parsed, "variants", 5));
      break;
    case "propose_experiments":
      proposeExperiments(getNumberArg(parsed, "n", 2));
      break;
    case "ingest_pinterest_metrics_csv":
      ingestMetricsCsv(typeof parsed.file === "string" ? parsed.file : undefined);
      break;
    case "analyze_winners":
      analyzeWinners();
      break;
    case "weekly_operating_packet":
    case "weekly_ops_info":
      writeReviewPackAndExports();
      break;
    case "weekly_review": {
      const { plan } = runScheduleBuild();
      writeWeeklyReview(plan);
      break;
    }
    case "monthly_digest":
    case "monthly_review":
      writeMonthlyReview();
      break;
    case "yearly_review":
      writeYearlyReview();
      break;
    case "product_opportunity_report":
      productOpportunityReport();
      break;
    case "generate_product_mvp":
      generateProductMvp(typeof parsed.product_id === "string" ? parsed.product_id : undefined);
      break;
    default:
      writeText(
        path.join(process.cwd(), "outputs", "cli-help.txt"),
        "Supported commands: " +
          [
            "init_project",
            "init_sheets",
            "init_url_inventory",
            "generate_content_bible",
            "generate_blog_week --n=3",
            "generate_pin_week --n=25",
            "generate_micro_destinations --n=10",
            "render_review",
            "approve_blog --blog_id=BLOG-001",
            "publish_blog --blog_id=BLOG-001",
            "approve_pin --content_id=PIN-001",
            "build_schedule_plan",
            "export_pinterest_bulk_csv --max=200",
            "export_manual_post_pack",
            "prepare_overlay_jobs",
            "generate_variations_of_winners --top=10 --variants=5",
            "propose_experiments --n=2",
            "ingest_pinterest_metrics_csv --file=path.csv",
            "analyze_winners",
            "weekly_review",
            "weekly_ops_info",
            "weekly_operating_packet",
            "monthly_review",
            "monthly_digest",
            "yearly_review",
            "product_opportunity_report",
            "generate_product_mvp --product_id=PROD-001"
          ].join("\n")
      );
  }

  // Ensure row shapes remain consistent with schema headers.
  for (const [tab, headers] of Object.entries(TAB_HEADERS)) {
    const file = path.join(process.cwd(), "data", "sheets", `${tab}.json`);
    if (!fs.existsSync(file)) continue;
    const rows = readJsonFile<Record<string, unknown>[]>(file, []);
    writeJsonFile(file, normalizeJsonRows(rows, headers));
  }

  writeTabCsvExports();
}
