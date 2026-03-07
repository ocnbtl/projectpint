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
The command center stores its live admin datasets in dedicated Supabase tables (hosted) or local JSON (local fallback):
- `Pins_Evergreen`
- `Blogs_Evergreen`
- `Guides_Evergreen`
- `Emails_Evergreen`
- `Customers_Evergreen`
- `Products_Evergreen`

Supporting signup storage also uses:
- `Leads`

Legacy CLI/governance references still exist in code, but they are no longer part of the live website/admin storage model.

## Quick Start
1. Install deps:
- `npm install`

2. Configure env:
- `cp .env.example .env.local`
- Set `ADMIN_PASSWORD` (required for `/admin`)
- Set `ADMIN_SESSION_SECRET` (required for production-grade admin sessions)
- Set `STORAGE_MODE=supabase` for hosted persistence
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (use a Supabase secret key if available)
- Set Klaviyo vars if you want live signup sync

3. Validate build/tests:
- `npm run build`
- `npm test`

4. Start local app:
- `npm run dev -- -p 3001 -H localhost`

5. Open:
- Public site: `http://localhost:3001`
- Admin login: `http://localhost:3001/admin/login`

## Supabase Storage
Hosted app/admin runtime now uses Supabase as the primary storage layer.

Current implementation detail:
- The command center datasets now write directly to dedicated tables such as `blogs_evergreen`, `pins_evergreen`, and `customers_evergreen`.
- `leads` is also a dedicated table for signup persistence.
- Public blogs and guides now read directly from evergreen Supabase data.
- Approved pins can now be exported directly from `/api/admin/exports/pins`.
- The live runtime no longer depends on `app_storage_tabs`.

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
- Export approved pins directly from admin after prep.

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
- Admin sessions are signed, `httpOnly`, `sameSite=strict`, and expire automatically.
- Set/change access via `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env.local` (local) and Vercel environment variables (hosted).

## Core CLI Commands (Still Supported)
- These remain compatibility tools. The website/admin runtime is now Supabase-backed.
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
- Supabase setup: `docs/supabase-setup.md`
- Supabase schema: `docs/supabase-schema.md`
- Legacy sheet schema reference: `docs/sheets-schema.md`
- Pin workflow: `docs/pin-production-workflow.md`
- Current checklist: `docs/current-phase-execution-checklist.md`
- Vercel preview runbook: `docs/vercel-preview-runbook.md`
