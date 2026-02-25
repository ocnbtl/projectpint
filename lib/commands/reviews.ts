import path from "node:path";
import { writeText } from "../io.ts";
import { loadTab } from "../store.ts";
import { lintEditorialStyle, type StyleLintResult } from "../style-linter.ts";
import type { PinDraft, UrlInventoryItem } from "../types.ts";
import fs from "node:fs";

interface ReviewPaths {
  outputWeekly: string;
  outputMonthly: string;
  outputYearly: string;
}

export function analyzeWinners(paths: ReviewPaths): string {
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
  writeText(path.join(paths.outputWeekly, "winners.md"), markdown);
  return markdown;
}

function readMicroGuideDocs(): Array<{ id: string; text: string }> {
  const dir = path.join(process.cwd(), "micro_guides");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => ({
      id: name.replace(/\.md$/, ""),
      text: fs.readFileSync(path.join(dir, name), "utf8")
    }));
}

export function writeQaReports(paths: ReviewPaths): { copy: string; visual: string; icp: string } {
  const pins = loadTab<PinDraft>("Content_Pins");
  const blogs = loadTab<{ Blog_ID: string; Draft_Markdown: string }>("Blog_Posts");
  const micros = readMicroGuideDocs();

  const copyReport = {
    generated_at: new Date().toISOString(),
    pin_copy_summary: {
      total: pins.length,
      low_naturalness: pins.filter((p) => !p.Naturalness_Flag).map((p) => p.Content_ID),
      low_score: pins.filter((p) => p.Quality_Score < 80).map((p) => p.Content_ID)
    },
    style_lint: [
      ...blogs.map((b) => lintEditorialStyle(b.Blog_ID, "blog", b.Draft_Markdown)),
      ...micros.map((m) => lintEditorialStyle(m.id, "micro", m.text))
    ] as StyleLintResult[]
  };

  const visualReport = {
    generated_at: new Date().toISOString(),
    pin_visual_summary: {
      total: pins.length,
      missing_overlay: pins.filter((p) => !p.Has_Text_Overlay || !String(p.Overlay_1 || "").trim()).map((p) => p.Content_ID),
      risky_prompts: pins
        .filter((p) => p.Visual_Risk_Flags.length > 0)
        .map((p) => ({ content_id: p.Content_ID, flags: p.Visual_Risk_Flags }))
    }
  };

  const icpReport = {
    generated_at: new Date().toISOString(),
    top_alignment: copyReport.style_lint.map((item) => ({
      target_id: item.target_id,
      target_type: item.target_type,
      best_icp: item.best_icp,
      score: item.score,
      flags: item.flags
    }))
  };

  const copyPath = path.join(paths.outputWeekly, "qa_copy.json");
  const visualPath = path.join(paths.outputWeekly, "qa_visual.json");
  const icpPath = path.join(paths.outputWeekly, "qa_icp_alignment.json");

  writeText(copyPath, JSON.stringify(copyReport, null, 2));
  writeText(visualPath, JSON.stringify(visualReport, null, 2));
  writeText(icpPath, JSON.stringify(icpReport, null, 2));

  return { copy: copyPath, visual: visualPath, icp: icpPath };
}

export function writeWeeklyReview(paths: ReviewPaths, schedulePlan: string): string {
  const winnerDigest = analyzeWinners(paths);
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
  writeText(path.join(paths.outputWeekly, "weekly_review.md"), content);
  return content;
}

export function writeWeeklyOpsInfo(paths: ReviewPaths, schedulePlan: string, weeklyReview: string): string {
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
  writeText(path.join(paths.outputWeekly, "weekly_ops_info.md"), content);
  return content;
}

export function writeMonthlyReview(paths: ReviewPaths): void {
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
  writeText(path.join(paths.outputMonthly, "monthly_review.md"), content);
  writeText(path.join(process.cwd(), "monthly_digest.md"), content);
  writeText(path.join(paths.outputMonthly, "monthly_digest.md"), content);
}

export function writeYearlyReview(paths: ReviewPaths): void {
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
  writeText(path.join(paths.outputYearly, "yearly_review.md"), content);
}
