# Supabase Setup

Supabase is now the primary hosted storage layer for Diyesu Decor / Project Pint.

## What to create
Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor for the `projectpint` project.

This creates:
- dedicated admin tables:
  - `pins_evergreen`
  - `blogs_evergreen`
  - `guides_evergreen`
  - `inspiration_evergreen`
  - `emails_evergreen`
  - `customers_evergreen`
  - `products_evergreen`
  - `leads`

The command center now reads and writes the dedicated tables directly.

Direct mapping:
- `/admin/pins` <-> `pins_evergreen`
- `/admin/blogs` <-> `blogs_evergreen`
- `/admin/guides` <-> `guides_evergreen`
- `/admin/inspiration` <-> `inspiration_evergreen`
- `/admin/emails` <-> `emails_evergreen`
- `/admin/customers` <-> `customers_evergreen`
- `/admin/products` <-> `products_evergreen`
- public signup flow <-> `leads` and `customers_evergreen`

Current sync behavior:
- the command center loads each tab directly from its corresponding Supabase table
- edits, additions, and deletions autosave back to that Supabase table after a short pause
- `Save now` remains available as a manual flush
- this is direct persistence, but it is not multi-user realtime collaboration

## Why this shape
The current admin command center needed real tables for Pins, Blogs, Guides, Inspiration, Emails, Customers, Products, and Leads. Those are now the live storage model.

For an existing hosted project, apply `supabase/migrations/20260716_inspiration_evergreen.sql` before deploying the Inspiration admin workflow. The migration only creates and secures the new table; it does not create, edit, or delete editorial content. This repository change does not apply the migration automatically.

## Required env vars
- `STORAGE_MODE=supabase`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Where to find them
Supabase dashboard -> Project Settings -> API

Use:
- Project URL -> `SUPABASE_URL`
- preferred: Secret key -> `SUPABASE_SERVICE_ROLE_KEY`
- fallback: legacy `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY`

Do not expose this server key publicly.
The checked-in schema enables RLS and revokes `anon` and `authenticated` table privileges. The app uses a server-side secret key, so the hosted runtime continues to work while browser/public access stays blocked by both grants and RLS.

## Local usage
For local development you can either:
- keep `STORAGE_MODE=local` and use local JSON fallback
- set `STORAGE_MODE=supabase` to test against the live Supabase project

## Verification
After env vars are set:
1. Log into `/admin/login`
2. Open `/admin/blogs`
3. Add or edit a row
4. Wait for autosave or click `Save now`
5. In Supabase Table Editor, confirm rows appear in `blogs_evergreen`
6. Submit a public signup and confirm rows appear in `leads` and `customers_evergreen`
