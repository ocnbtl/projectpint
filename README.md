# Project Pint (`projectpint`)

Public brand: **Diyesu Decor**  
Tagline: **DIY Bathroom Upgrades**

Project Pint runs a Pinterest-first growth system:

**Pinterest pin -> blog/guide destination -> email signup -> product path**

## Current Product Surfaces
- Public site (customer-facing): landing pages, areas, blog, lead magnet, product pages, legal pages.
- Admin command center (password protected): `/admin`
  - Home
  - Pins
  - Blogs
  - Guides
  - Emails
  - Users
  - Products

## Content Areas (Current Strategy)
- Plants
- Mirror
- Storage
- Lighting
- Shower
- Renter
- DIY
- ExtremeBudget

## Admin Command Center Data Model
The command center stores evergreen datasets in Google Sheets/local JSON using these tabs:
- `Pins_Evergreen`
- `Blogs_Evergreen`
- `Guides_Evergreen`
- `Emails_Evergreen`
- `Customers_Evergreen`
- `Products_Evergreen`

Legacy operational tabs are still retained for CLI/governance compatibility:
- `Content_Pins`, `Blog_Posts`, `URL_Inventory`, `Assets`, `Experiments`, `Metrics_Weekly`, `Leads`, `Products`, `Product_Ideas`, `Governance`

## Quick Start
1. Install deps:
- `npm install`

2. Configure env:
- `cp .env.example .env.local`
- Set `ADMIN_PASSWORD` (required for `/admin`)
- Set Sheets/Klaviyo vars as needed

3. Validate build/tests:
- `npm run build`
- `npm test`

4. Start local app:
- `npm run dev -- -p 3001 -H localhost`

5. Open:
- Public site: `http://localhost:3001`
- Admin login: `http://localhost:3001/admin/login`

## Weekly Ops Flow (Current)
1. In admin `/admin/blogs`:
- Generate new blogs by area.
- Generate blog titles and keywords.

2. In admin `/admin/guides`:
- Generate new guides by area.
- Generate guide titles and keywords.

3. In admin `/admin/pins`:
- Generate new pins (25 rows).
- Generate overlay + CTA for latest 25.
- Manually add `Media_URL` (Nano Banana image link) and later `Pin_URL`.

4. In admin `/admin/emails`:
- Generate promotional emails by area count.
- Generate email subjects.

5. In admin `/admin/customers`:
- Verify new subscribers and area preferences are being logged.

6. In admin `/admin/products`:
- Run update stats and verify product linkages/revenue columns.

## Manual Visual Workflow (Current)
- Image generation is manual by design right now.
- Use each pin row's `Media_Prompt` in Nano Banana.
- Finalize visual in Canva.
- Upload image to Drive and paste URL into `Media_URL`.

## Security + Access
- Admin password value is never hardcoded.
- Set/change it via `ADMIN_PASSWORD` in `.env.local` (local) and Vercel environment variables (hosted).

## Core CLI Commands (Still Supported)
- `npm run init_sheets`
- `npm run generate_blog_week -- --n=3`
- `npm run generate_pin_week -- --n=25`
- `npm run build_schedule_plan`
- `npm run render_review`
- `npm run weekly_ops_info`
- `npm run monthly_review`
- `npm run yearly_review`

## Docs
- Setup: `docs/setup-guide.md`
- System explainer: `docs/system-explainer.md`
- Sheet schemas: `docs/sheets-schema.md`
- Pin workflow: `docs/pin-production-workflow.md`
- Current checklist: `docs/current-phase-execution-checklist.md`
- Vercel preview runbook: `docs/vercel-preview-runbook.md`
