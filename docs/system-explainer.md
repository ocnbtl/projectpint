# System Explainer

## Step-by-Step Workflow (Operator View)
1. Initialize project folders and seed data.
- Run: `npm run init_project`
- Run: `npm run init_sheets`

2. Generate and validate weekly plan inputs.
- Run: `npm run build_schedule_plan`
- This enforces published-only destinations + 24h URL cooldown.

3. Generate weekly analysis + action packet.
- Run: `npm run weekly_review`
- Run: `npm run weekly_ops_info`
- Output includes KPI review + concrete weekly checklist across Pinterest, website, email, and product tasks.

4. Generate content assets.
- Blog drafts are written to `blog_drafts/`
- Micro guides are written to `micro_guides/`
- Pin records are written to `data/sheets/Content_Pins.json` + `content_packets/`

5. Render pin overlays before posting.
- Run: `npm run prepare_overlay_jobs`
- Execute generated commands from `overlay_render_jobs.sh` (or `outputs/weekly/overlay_render_jobs.sh`) on raw images.

6. Human review + approval gate.
- Open `review_pack.html`
- Approve blog rows and pin rows before publish/export actions.

7. Export posting assets.
- Run: `npm run export_pinterest_bulk_csv`
- Optional manual pack: `npm run export_manual_post_pack`

8. Monthly and yearly review cycle.
- Run: `npm run monthly_review`
- Run: `npm run yearly_review`
- Feed findings back into Content Bible and Governance changelog.

---

## `lib/scheduler.ts`
Purpose: schedule enforcement engine.

What it does:
- Assigns destination URLs to pin records.
- Enforces published-only URL eligibility.
- Enforces rolling cooldown (`Cooldown_Hours`, default 24).
- Validates no destination URL repeats inside 24 hours.
- Flags daily intent stacking risk.

Why it matters:
- Prevents policy-risk posting behavior.
- Preserves destination diversity and content distribution quality.

## `lib/commands.ts`
Purpose: orchestration layer for CLI operations.

What it does:
- Seeds and normalizes source-of-truth tab data.
- Generates weekly/monthly/yearly review artifacts.
- Builds weekly execution packet (`weekly_ops_info`).
- Generates blog drafts and micro guides.
- Generates pin exports and manual posting packs.
- Writes Google-Sheets-compatible CSV exports per tab.

Why it matters:
- Centralizes automation logic so recurring execution is repeatable and auditable.

## `scripts/cli.ts`
Purpose: command entrypoint.

What it does:
- Reads command-line arguments.
- Calls `runCommand(...)` from `lib/commands.ts`.

Why it matters:
- Standardizes all operations under `npm run ...` commands.

## `package.json`
Purpose: runtime manifest + operations menu.

What it does:
- Defines runtime dependencies.
- Defines all operator-facing scripts (`weekly_ops_info`, `monthly_review`, exports, etc.).
- Provides a stable command surface for local and CI runs.

Why it matters:
- Non-engineer-friendly operational interface.

## Practical Improvement Recommendations
1. Split `lib/commands.ts` into smaller domain files (`commands/seed.ts`, `commands/reviews.ts`, `commands/exports.ts`).
2. Add unit tests for cooldown and linter edge cases.
3. Add a true Google Sheets adapter behind an interface (keep local JSON as fallback).
4. Add copy style QA reports by ICP (`qa_icp_alignment.json`) to reduce drift.
