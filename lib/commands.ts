import fs from "node:fs";
import path from "node:path";
import { TAB_HEADERS } from "./constants.ts";
import { startOfWeekIso } from "./date.ts";
import { ensureDir, readJsonFile, toCsv, todayIso, writeJsonFile, writeText } from "./io.ts";
import { flagIntentDominance, lintPin } from "./linter.ts";
import { assignSchedule, validateIntentDailyMix, validateNo24hRepeats } from "./scheduler.ts";
import { seedBlogs, seedPins, seedProductIdeas, seedProducts, seedUrlInventory } from "./seed.ts";
import { loadTab, saveTab } from "./store.ts";
import { generateMicroDestinations, writeMicroGuidesForInventory } from "./commands/content.ts";
import { writeManualPackZip, writeOverlayRenderJobBook, writePinsExportCsv, writeWeeklyZip } from "./commands/exports.ts";
import { analyzeWinners, writeMonthlyReview, writeQaReports, writeWeeklyOpsInfo, writeWeeklyReview, writeYearlyReview } from "./commands/reviews.ts";
import type { BlogDraft, PinDraft, ProductRow, UrlInventoryItem } from "./types.ts";

interface CliArgs {
  _: string[];
  [key: string]: string | string[];
}

interface ReviewPaths {
  outputWeekly: string;
  outputMonthly: string;
  outputYearly: string;
}

const OUTPUT_WEEKLY = path.join(process.cwd(), "outputs", "weekly");
const OUTPUT_MONTHLY = path.join(process.cwd(), "outputs", "monthly");
const OUTPUT_YEARLY = path.join(process.cwd(), "outputs", "yearly");

function reviewPaths(): ReviewPaths {
  return {
    outputWeekly: OUTPUT_WEEKLY,
    outputMonthly: OUTPUT_MONTHLY,
    outputYearly: OUTPUT_YEARLY
  };
}

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
<title>Diyesu Decor Review Pack (Project Pint)</title>
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
<h1>Diyesu Decor Weekly Review Pack (Project Pint)</h1>
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

function seedPhaseOne(nPins: number, nBlogs: number): void {
  ensureBaseArtifacts();
  writeSchemaFiles();

  const now = todayIso();
  const pins = seedPins(nPins, now);
  const blogs = seedBlogs().slice(0, nBlogs);
  const urls = seedUrlInventory();
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
  writeText(path.join(process.cwd(), "week_plan.md"), plan);

  return { plan, pins: scheduled.pins, blogs };
}

function writeReviewPackAndExports(): void {
  const { plan, pins, blogs } = runScheduleBuild();
  const html = toReviewHtml(pins, blogs, plan);
  writeText(path.join(process.cwd(), "review_pack.html"), html);
  writeText(path.join(process.cwd(), "public", "review_pack.html"), html);

  const paths = reviewPaths();
  writeQaReports(paths);
  const weeklyReview = writeWeeklyReview(paths, plan);
  writeWeeklyOpsInfo(paths, plan, weeklyReview);

  writePinsExportCsv(200);
  writeManualPackZip({ outputWeekly: OUTPUT_WEEKLY });
  writeMonthlyReview(paths);
  writeYearlyReview(paths);
  writeWeeklyZip({ outputWeekly: OUTPUT_WEEKLY });
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

function writeHelpFile(): void {
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

export function runCommand(argv: string[]): void {
  const parsed = parseArgs(argv);
  const [command] = parsed._;
  const paths = reviewPaths();

  switch (command) {
    case "init_project":
      initProject();
      break;
    case "init_sheets":
      seedPhaseOne(getNumberArg(parsed, "nPins", 25), getNumberArg(parsed, "nBlogs", 3));
      break;
    case "init_url_inventory":
      saveTab("URL_Inventory", seedUrlInventory());
      break;
    case "generate_content_bible":
      writeGovernanceMirror();
      break;
    case "generate_blog_week": {
      const n = getNumberArg(parsed, "n", 3);
      saveTab("Blog_Posts", seedBlogs().slice(0, n));
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
      writeManualPackZip({ outputWeekly: OUTPUT_WEEKLY });
      break;
    case "prepare_overlay_jobs":
      writeOverlayRenderJobBook({ outputWeekly: OUTPUT_WEEKLY });
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
      analyzeWinners(paths);
      break;
    case "weekly_operating_packet":
    case "weekly_ops_info":
      writeReviewPackAndExports();
      break;
    case "weekly_review": {
      const { plan } = runScheduleBuild();
      writeQaReports(paths);
      writeWeeklyReview(paths, plan);
      break;
    }
    case "monthly_digest":
    case "monthly_review":
      writeMonthlyReview(paths);
      break;
    case "yearly_review":
      writeYearlyReview(paths);
      break;
    case "product_opportunity_report":
      productOpportunityReport();
      break;
    case "generate_product_mvp":
      generateProductMvp(typeof parsed.product_id === "string" ? parsed.product_id : undefined);
      break;
    default:
      writeHelpFile();
  }

  for (const [tab, headers] of Object.entries(TAB_HEADERS)) {
    const file = path.join(process.cwd(), "data", "sheets", `${tab}.json`);
    if (!fs.existsSync(file)) continue;
    const rows = readJsonFile<Record<string, unknown>[]>(file, []);
    writeJsonFile(file, normalizeJsonRows(rows, headers));
  }

  writeTabCsvExports();
}
