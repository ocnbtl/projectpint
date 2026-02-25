# Project Pint (`projectpint`)

Internal codename: **Project Pint**
Public brand: **Ranosa Decor**
Tagline: **DIY Bathroom Upgrades**

Flow: **Pinterest -> Next.js site -> Klaviyo signup -> monetization (ads + affiliate + digital products)**

## Current State
- Foundations, governance, schema, and scheduling guardrails are implemented.
- Public site + admin scaffold are in place.
- Assisted mode is enforced for publish/export actions.
- Weekly/monthly/yearly review outputs are generated.

## Guardrails Enforced
- AI-generated visuals only (no real people, no brand-photo imitation).
- Human approval required for blog publishing and pin export.
- URL cooldown rule: no duplicate destination URL inside rolling 24h.
- Pins can only target `Status=published` URLs.
- Global disclosures + page-level affiliate disclosures when affiliate links are detected.

## Setup (Quick)
1. `npm install`
2. `cp .env.example .env.local`
3. Set `ADMIN_PASSWORD` in `.env.local`
4. Seed + generate outputs:
- `npm run init_project`
- `npm run init_sheets`
- `npm run weekly_ops_info`
5. Start app: `npm run dev`

## Primary CLI Commands
- `init_project`
- `init_sheets`
- `generate_content_bible`
- `generate_blog_week --n=3`
- `generate_pin_week --n=25`
- `generate_micro_destinations --n=10`
- `build_schedule_plan`
- `weekly_review`
- `weekly_ops_info`
- `monthly_review`
- `yearly_review`
- `export_pinterest_bulk_csv --max=200`
- `export_manual_post_pack`
- `prepare_overlay_jobs`
- `product_opportunity_report`

Legacy aliases are still supported: `weekly_operating_packet`, `monthly_digest`.

## Standard Output Artifacts
Generated at repo root:
- `review_pack.html`
- `weekly_review.md`
- `weekly_ops_info.md`
- `weekly_ops_info.zip`
- `pins_export.csv`
- `monthly_review.md`
- `yearly_review.md`

Generated content folders:
- `content_packets/`
- `blog_drafts/`
- `micro_guides/`
- `outputs/weekly/`
- `outputs/monthly/`
- `outputs/yearly/`

## Source-of-Truth Data
Google-Sheets-compatible tab files are generated in:
- `data/sheets/*.csv`
- `data/sheets/*.json`

Tabs:
1. Content_Pins
2. Blog_Posts
3. URL_Inventory
4. Assets
5. Experiments
6. Metrics_Weekly
7. Leads
8. Products
9. Product_Ideas
10. Governance

## Scheduler
Workflow file:
- `.github/workflows/projectpint-automation.yml`

Runs:
- Weekly: Monday 14:00 UTC
- Monthly: Day 1, 15:00 UTC
- Yearly: Jan 2, 16:00 UTC

## Docs
- Setup: `docs/setup-guide.md`
- Schema: `docs/sheets-schema.md`
- Governance log usage: `docs/governance-changelog-template.md`
- System explainer: `docs/system-explainer.md`
- Pin production workflow: `docs/pin-production-workflow.md`
- Research notes: `docs/research-notes.md`
- Style calibration: `docs/style-calibration.md`
