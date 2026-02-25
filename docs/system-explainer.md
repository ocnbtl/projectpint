# System Explainer

## Workflow (Step-by-Step)
1. Initialize project and source-of-truth tabs.
- Run: `npm run init_project`
- Run: `npm run init_sheets`
- What this does: creates folders, seeds Google-Sheets-shaped tab data, and writes starter pins/blogs/products so you are not starting from blank.

2. Build the weekly schedule safely.
- Run: `npm run build_schedule_plan`
- What this does: assigns destination URLs only if they are `published` and outside cooldown; prevents 24h URL repeats and flags intent stacking.

3. Generate weekly review and ops instructions.
- Run: `npm run weekly_review`
- Run: `npm run weekly_ops_info`
- What this does: analyzes current data, writes next-week improvement guidance, and creates the operator checklist you execute.

4. Generate or refresh content inventory.
- Run: `npm run generate_blog_week -- --n=3`
- Run: `npm run generate_pin_week -- --n=25`
- Run: `npm run generate_micro_destinations -- --n=10`
- What this does: creates new drafts for blogs, pins, and micro guides so URL inventory stays deep enough for cooldown-safe posting.

5. Run copy + visual QA outputs.
- Auto-generated during `weekly_review` and `weekly_ops_info`.
- Files: `outputs/weekly/qa_copy.json`, `outputs/weekly/qa_visual.json`, `outputs/weekly/qa_icp_alignment.json`.
- What this does: gives structured pass/fail style checks, visual risk checks, and ICP-alignment checks before export.

6. Render overlay jobs for pin images.
- Run: `npm run prepare_overlay_jobs`
- What this does: generates a shell job file for text overlays so every pin image includes required in-image text before posting.

7. Human review gate.
- Open: `review_pack.html`
- What this does: final assisted-automation checkpoint before any publish/export; you approve rows that should move forward.

8. Approve and publish blogs.
- Run: `npm run approve_blog -- --blog_id=BLOG-001`
- Run: `npm run publish_blog -- --blog_id=BLOG-001`
- What this does: changes status in source-of-truth and marks publish timestamp only for approved rows.

9. Approve and export pin posting assets.
- Run: `npm run approve_pin -- --content_id=PIN-001`
- Run: `npm run export_pinterest_bulk_csv`
- Optional: `npm run export_manual_post_pack`
- What this does: creates Pinterest-ready CSV and manual pack without using unofficial posting automation.

10. Run monthly and yearly strategic loops.
- Run: `npm run monthly_review`
- Run: `npm run yearly_review`
- What this does: converts performance data into product opportunities, cluster decisions, and next-cycle roadmap changes.

11. Generate full packet deliverable.
- Run: `npm run weekly_operating_packet`
- What this does: bundles review + schedule + drafts + exports into `weekly_ops_info.zip`/`weekly_operating_packet.zip`.

---

## Command Reference (Plain Language)
- `init_project`: creates required output folders and baseline structure.
- `init_sheets`: seeds all tabs and starter content rows.
- `init_url_inventory`: resets URL inventory tab with starter published URLs.
- `generate_content_bible`: mirrors YAML bible into generated JSON + governance entry.
- `generate_blog_week --n=3`: writes N blog drafts.
- `generate_pin_week --n=25`: writes N pin rows + content packets.
- `generate_micro_destinations --n=10`: adds N micro URLs and writes micro guide drafts.
- `render_review`: creates `review_pack.html` from current rows.
- `approve_blog --blog_id=...`: marks blog rows approved.
- `publish_blog --blog_id=...`: marks approved blog rows published.
- `approve_pin --content_id=...`: marks pin rows approved.
- `build_schedule_plan`: assigns weekly slots with cooldown/published checks.
- `export_pinterest_bulk_csv --max=200`: outputs Pinterest bulk CSV.
- `export_manual_post_pack`: builds manual post zip with captions + links.
- `prepare_overlay_jobs`: writes overlay render script for image text.
- `ingest_pinterest_metrics_csv --file=...`: appends metric rows from CSV.
- `analyze_winners`: outputs winner analysis markdown.
- `weekly_review`: writes weekly review + QA JSON reports.
- `weekly_ops_info`: writes ops brief and zipped weekly packet.
- `monthly_review`: writes monthly review (plus backward-compatible monthly digest).
- `yearly_review`: writes yearly strategy review.
- `product_opportunity_report`: writes product-opportunity short report.
- `generate_product_mvp --product_id=...`: scaffolds product landing/email/supporting-content docs.

---

## Core Files (How You Use Them)
## `lib/commands.ts`
Purpose: central orchestrator.
What it does: routes CLI commands, coordinates scheduler/linter/review/export modules, and keeps tab files normalized.
How you use it: you do not edit rows manually first; run commands and let this file orchestrate repeatable operations.

## `lib/commands/content.ts`
Purpose: content-domain helpers.
What it does: generates micro destinations and writes micro-guide markdown files.
How you use it: called from CLI when you need to expand URL pool quickly.

## `lib/commands/exports.ts`
Purpose: export-domain helpers.
What it does: builds Pinterest CSV, manual posting pack, overlay render jobs, and weekly zip bundles.
How you use it: run export scripts after human approval.

## `lib/commands/reviews.ts`
Purpose: analysis/reporting-domain helpers.
What it does: winner analysis, weekly/monthly/yearly review writing, and QA JSON reports including ICP alignment.
How you use it: run weekly/monthly/yearly loops and read outputs before next batch generation.

## `scripts/cli.ts`
Purpose: single command entrypoint.
What it does: passes shell args into `runCommand(...)`.
How you use it: indirectly through `npm run <script>` commands.

## `package.json`
Purpose: operator command menu + dependency manifest.
What it does: defines scripts for every operational action and runtime/dev dependencies.
How you use it: this is your human-friendly interface; run scripts rather than calling internals directly.

---

## Implemented Recommendations (Status)
1. Split command logic into domain modules.
- Implemented: `lib/commands/content.ts`, `lib/commands/exports.ts`, `lib/commands/reviews.ts`.
- `lib/commands.ts` now acts as orchestration only.

2. Add unit tests for scheduler/linter edge cases.
- Implemented: `tests/scheduler.test.ts`, `tests/linter.test.ts`, `tests/style-linter.test.ts`.
- Run with: `npm test`.

3. Add Google Sheets adapter behind interface with local fallback.
- Implemented: `lib/sheets/google-adapter.ts` + `lib/sheets/local-adapter.ts` + `lib/sheets/index.ts`.
- Switch mode with env: `SHEETS_MODE=google` or `SHEETS_MODE=local`.

4. Add style/ICP QA reports for blogs/micro guides.
- Implemented: style linter in `lib/style-linter.ts` and weekly QA JSON outputs in `outputs/weekly/`.

---

## Output Paths You Should Watch Weekly
- `review_pack.html`
- `week_plan.md`
- `weekly_review.md`
- `weekly_ops_info.md`
- `pins_export.csv`
- `outputs/weekly/qa_copy.json`
- `outputs/weekly/qa_visual.json`
- `outputs/weekly/qa_icp_alignment.json`
- `weekly_ops_info.zip`
