# System Explainer

## High-Level Architecture
- Next.js App Router site (public + admin surfaces)
- Shared local/Google Sheets storage adapter (`SHEETS_MODE`)
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
- Middleware protects `/admin/*` (except login)
- API routes also validate session server-side

## Evergreen Data Tabs
Admin pages use these tabs as the new evergreen operating model:
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
- `generate_new_blogs`
- `generate_blog_titles_keywords`
- `update_blog_related_pins`
- `generate_new_guides`
- `generate_guide_titles_keywords`
- `update_guide_related_pins`
- `generate_new_emails`
- `generate_email_subjects`
- `refresh_customers`
- `update_product_stats`

## Signup and Customer Flow
1. User submits email form (`/api/subscribe`).
2. Optional Klaviyo list job is called.
3. Lead row is saved to `Leads`.
4. Customer row is upserted into `Customers_Evergreen` with selected content areas.

## Visual Workflow (Manual by Design)
- Pin metadata, prompts, caption, and UTM are generated in admin pins table.
- Image generation and polishing are manual:
  - Prompt -> Nano Banana
  - Final polish -> Canva
  - Paste final URL into `Media_URL`

## Legacy CLI Layer (Still Active)
Legacy commands still support review/report/export loops and governance:
- `generate_blog_week`, `generate_pin_week`, `build_schedule_plan`, `render_review`, `weekly_ops_info`, etc.

This preserves the existing command surface while the new admin command center becomes primary for daily operations.
