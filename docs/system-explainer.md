# System Explainer

## High-Level Architecture
- Next.js App Router site (public + admin surfaces)
- Supabase-backed runtime storage for hosted app/admin data
- Local JSON fallback for local development
- Klaviyo integration for subscriptions
- CLI automation layer for legacy and review workflows

## Public Side
Core routes:
- `/`
- `/start-here`
- `/hub`, `/hub/[slug]`
- `/blog`, `/blog/[slug]`
- `/lead-magnets/plant-picker`
- `/products/[slug]`
- `/legal/*`

Public content strategy uses 8 areas:
- Plants, Mirror, Storage, Lighting, Shower, Renter, DIY, ExtremeBudget

## Admin Command Center
Protected routes under `/admin`:
- `/admin` Home (KPIs + quick actions)
- `/admin/pins`
- `/admin/blogs`
- `/admin/guides`
- `/admin/emails`
- `/admin/customers`
- `/admin/products`

Auth model:
- Login route: `/admin/login`
- Cookie: `admin_session`
- Password source: `ADMIN_PASSWORD` env var
- Session signing secret: `ADMIN_SESSION_SECRET` env var (falls back to `ADMIN_PASSWORD` locally if not set)
- Middleware protects `/admin/*` (except login)
- Sessions are signed, `httpOnly`, `sameSite=strict`, and time-limited
- API routes also validate session server-side

## Evergreen Data Tabs
Admin pages use these dedicated Supabase-backed datasets as the new evergreen operating model:
- `Pins_Evergreen`
- `Blogs_Evergreen`
- `Guides_Evergreen`
- `Emails_Evergreen`
- `Customers_Evergreen`
- `Products_Evergreen`

## Generation Actions (Admin Ops API)
Action endpoint: `POST /api/admin/command-center/ops`

Supported actions:
- `generate_new_pins`
- `generate_overlay_cta`
- `prepare_approved_pins_for_export`
- `generate_new_blogs`
- `generate_blog_titles_keywords`
- `update_blog_related_pins`
- `publish_approved_blogs`
- `generate_new_guides`
- `generate_guide_titles_keywords`
- `update_guide_related_pins`
- `publish_approved_guides`
- `generate_new_emails`
- `generate_email_subjects`
- `refresh_customers`
- `update_product_stats`

## Signup and Customer Flow
1. User submits email form (`/api/subscribe`).
2. Optional Klaviyo list job is called.
3. Lead row is saved to `Leads` in Supabase storage.
4. Customer row is upserted into `Customers_Evergreen` in Supabase storage with selected content areas.

## Visual Workflow (Manual by Design)
- Pin metadata, prompts, caption, and UTM are generated in admin pins table.
- Image generation and polishing are manual:
  - Prompt -> Nano Banana
  - Final polish -> Canva
  - Paste final URL into `Media_URL`
- Approved pin rows are then prepared for export directly from `Pins_Evergreen`.

## Evergreen -> Public Publish Bridge
- `Blogs_Evergreen` is the working table for blog drafting and review.
- `publish_approved_blogs` marks approved blog rows live for the public `/blog/*` routes.
- `Guides_Evergreen` is the working table for short companion content.
- `publish_approved_guides` marks approved guide rows live for the public `/guides/*` routes.
- `Pins_Evergreen` is the working table for pin drafting and manual visual prep.
- `prepare_approved_pins_for_export` finalizes destination URLs and export metadata directly on evergreen rows.

## Legacy CLI Layer (Still Active)
Legacy commands still support review/report/export loops and governance:
- `generate_blog_week`, `generate_pin_week`, `build_schedule_plan`, `render_review`, `weekly_ops_info`, etc.

Current contradiction to keep in mind:
- Admin command-center datasets now use dedicated Supabase tables.
- Some legacy CLI/report/export code still exists in the repo, but it is no longer part of the live production workflow.

This preserves the existing command surface while the new admin command center becomes primary for daily operations.
