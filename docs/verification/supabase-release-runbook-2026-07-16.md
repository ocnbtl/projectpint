# Project Pint Supabase release runbook

Date: 2026-07-16

Production project: `projectpint` (`dlgwzvovucsaizxnyuut`, `us-east-2`)

Authority state: **DO NOT APPLY until the owner explicitly approves these production schema and privilege mutations**

## Change set and order

1. `supabase/migrations/20260716_inspiration_evergreen.sql`
   - Creates the additive, initially empty `public.inspiration_evergreen` table.
   - Adds its update trigger, enables RLS, and revokes `anon`/`authenticated` privileges.
   - Creates, updates, and deletes no editorial rows.
2. `supabase/migrations/20260716_release_security_hardening.sql`
   - Sets fixed search paths on the two update-trigger functions.
   - Ensures RLS is enabled on the active tables and the legacy `app_storage_tabs` table.
   - Revokes all table privileges from `anon` and `authenticated`.
   - Creates, updates, and deletes no rows.

## Current production baseline

Read-only Supabase evidence at 2026-07-16 05:00 EDT:

| Table | Rows | RLS | Policies | `anon` / `authenticated` posture |
|---|---:|---:|---:|---|
| `app_storage_tabs` | 0 | disabled | 0 | all table privileges granted; publicly exposed |
| `pins_evergreen` | 0 | enabled | 0 | all table privileges granted, with RLS denying browser access |
| `blogs_evergreen` | 0 | enabled | 0 | same |
| `guides_evergreen` | 0 | enabled | 0 | same |
| `emails_evergreen` | 0 | enabled | 0 | same |
| `customers_evergreen` | 3 | enabled | 0 | same |
| `products_evergreen` | 0 | enabled | 0 | same |
| `leads` | 6 | enabled | 0 | same |

Both `set_row_updated_at` and `set_app_storage_tabs_updated_at` currently have no fixed function configuration. Supabase reports the legacy table as an RLS error and reports both functions for mutable search paths.

## Required preflight

Before applying:

1. Reconfirm the exact project ID and `ACTIVE_HEALTHY` provider state.
2. Re-read the two SQL files from the intended immutable release commit.
3. Re-run table row counts, RLS/policy counts, table grants, and function configuration.
4. Confirm the application still uses the server-side service role for persistence; neither migration changes `service_role` privileges.
5. Confirm provider backup/PITR or another recovery snapshot if the owner requires it. Current backup/PITR status is **NOT VERIFIED** through the available integration.
6. Obtain explicit owner approval naming both migration files and acknowledging the privilege/RLS effect.

## Post-apply invariants

Immediately verify, before deploying application code:

- `public.inspiration_evergreen` exists, is empty, has RLS enabled, has no browser policies, and grants no privileges to `anon` or `authenticated`.
- All nine server-only tables grant no privileges to `anon` or `authenticated`.
- `app_storage_tabs` has RLS enabled and remains at its preflight row count.
- Both update functions report `search_path=pg_catalog, public`.
- Every pre-existing table retains its exact preflight row count.
- Supabase security advisors no longer report `rls_disabled_in_public`, GraphQL exposure for these tables, or mutable search paths.
- A read-only production admin login/dashboard/index smoke check succeeds through the service-role-backed application.
- No real content record, subscriber, contact, or email is created for verification.

## Recovery and rollback posture

- Last-known-good application release: `0cda699fd90ed56c299561ffca99b2ac0c5dfd9e`.
- Application rollback is a Vercel redeploy of that immutable commit and requires separate production rollback authority.
- The new Inspiration table is additive. Leave it in place during an application rollback; dropping it could destroy content entered after release.
- The RLS and grant changes intentionally close browser access. Do not restore the previous broad grants as a reflexive rollback; that would restore the known exposure.
- The server runtime uses `service_role`, which is not revoked. If the post-migration admin read smoke fails, first verify the production service-role environment and server logs rather than weakening RLS.
- The fixed function search paths are safe to retain during an application rollback.
- If a database recovery is genuinely required, stop writes, preserve row-count evidence, and use the provider backup/PITR path or an owner-approved forward repair. Backup/PITR availability is still a named preflight blocker.

## Stop conditions

Stop and do not deploy when any of these occurs:

- target project identity differs;
- a migration includes unexpected row mutation or destructive DDL;
- baseline row counts change before application;
- `service_role` is unavailable to the production runtime;
- a post-apply row count differs;
- the server-backed admin read smoke fails;
- required owner approval or recovery evidence is missing.
