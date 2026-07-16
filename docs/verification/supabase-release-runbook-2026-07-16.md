# Project Pint Supabase release runbook

Date: 2026-07-16

Production project: `projectpint` (`dlgwzvovucsaizxnyuut`, `us-east-2`)

Authority state: **APPLIED AND VERIFIED under the owner's explicit 2026-07-16 production authorization**

## Change set and execution order

1. `supabase/migrations/20260716_inspiration_evergreen.sql`
   - Creates the additive, initially empty `public.inspiration_evergreen` table.
   - Adds its update trigger, enables RLS, and revokes `anon`/`authenticated` privileges.
   - Creates, updates, and deletes no editorial rows.
2. `supabase/migrations/20260716_release_security_hardening.sql`
   - Sets fixed search paths on the two update-trigger functions.
   - Ensures RLS is enabled on the active tables and legacy `app_storage_tabs` table.
   - Revokes all table privileges from `anon` and `authenticated`.
   - Creates, updates, and deletes no rows.

Migration file SHA-256 values at execution:

- `20260716_inspiration_evergreen.sql`: `f24cded3f9be47aad85d9dbd4791cac9c0903778e0ea87a2021ab6a577cf119b`
- `20260716_release_security_hardening.sql`: `41bc15cfb5109b2df0dcfcdc6107e16615e03391c61d5fe8c1d9ad09fe502db4`

## Production baseline and recovery point

Fresh SQL evidence immediately before migration—not cached provider table estimates—established this baseline:

| Table | Rows | Pre-migration RLS | Pre-migration browser posture | Post-migration rows |
|---|---:|---:|---|---:|
| `app_storage_tabs` | 0 | disabled | broad grants; exposed | 0 |
| `pins_evergreen` | 0 | enabled | broad grants behind RLS | 0 |
| `blogs_evergreen` | 6 | enabled | broad grants behind RLS | 6 |
| `guides_evergreen` | 0 | enabled | broad grants behind RLS | 0 |
| `emails_evergreen` | 0 | enabled | broad grants behind RLS | 0 |
| `customers_evergreen` | 4 | enabled | broad grants behind RLS | 4 |
| `products_evergreen` | 0 | enabled | broad grants behind RLS | 0 |
| `leads` | 7 | enabled | broad grants behind RLS | 7 |
| `inspiration_evergreen` | absent | n/a | n/a | 0 |

The earlier `blogs=0`, `customers=3`, `leads=6` report snapshot had drifted before migration. It was not used for migration comparison and its difference is not a migration regression. `app_storage_tabs` was reconfirmed empty. The reviewed SQL contains no editorial DML or `truncate`.

The connected Supabase organization is on the Free plan, so automatic backups and PITR are unavailable. Neither `pg_dump` nor the Supabase CLI was available in the release environment, so the owner-approved targeted recovery hierarchy was used.

- Private package: `/private/tmp/project-pint-recovery-20260716T0515EDT`
- Directory permissions: `0700`; recovery files: `0600`
- Contents: private pre-migration rows, exact counts and hashes, schemas, RLS and policies, grants, functions and configuration, triggers, indexes, constraints, migration history, post-migration evidence, advisor output, and guarded rollback SQL
- Private row snapshot SHA-256: `a719f3da563d2e138facf2e5895bdd4509d0c8649d130f2cadd64e5897ee18db`
- Pre-migration count/hash evidence SHA-256: `35df4b89c40e4ad8cd7607d64be842e34520877c141e8898e802a0867c06116f`
- Guarded rollback SQL SHA-256: `64f65f143cfca15990db706acccd33ad363275918d306ca90381e0262e17a275`
- The package is outside the repository and must never be committed or uploaded as a build artifact.

## Executed preflight

1. Reconfirmed project ID `dlgwzvovucsaizxnyuut` and `ACTIVE_HEALTHY` provider state.
2. Re-read and hashed both SQL files from implementation commit `ff4629127497141fc419543f9a74dc1de690c09b`.
3. Re-ran table counts, stable row hashes, RLS/policies, grants, functions, and migration history.
4. Confirmed the application uses server-side `service_role`; neither migration revokes that role.
5. Created and validated the private targeted recovery package above.
6. Received explicit owner approval naming both migrations and their schema, RLS, grant, privilege, and function effects.

## Execution results

### 1. Inspiration content store

- Applied successfully and recorded as migration `20260716093525` (`inspiration_evergreen_20260716`).
- Created the intended 23-column table, primary-key constraint/index, update trigger, and RLS boundary.
- `anon` SELECT and `authenticated` INSERT were denied with PostgreSQL `42501`.
- `service_role` retained read/write access.
- Existing counts and stable row hashes were unchanged.

### 2. Release security hardening

- Applied successfully and recorded as migration `20260716093727` (`release_security_hardening_20260716`).
- Enabled RLS on all nine server-only tables and removed SELECT/INSERT/UPDATE/DELETE privileges from `anon` and `authenticated`.
- Preserved table privileges for `service_role`.
- Fixed both update functions to `search_path=pg_catalog, public`; both remain `SECURITY INVOKER`.
- Actual browser-role reads/writes against blogs, Inspiration, app storage, and leads were denied with PostgreSQL `42501`.
- A transactional service-role Inspiration insert/read/update/trigger/delete test passed and was rolled back; the table remained empty.
- Existing counts and stable row hashes were unchanged.

## Verified post-apply invariants

- `public.inspiration_evergreen` exists, is empty, has RLS enabled, has no browser policies, and grants no privilege to `anon` or `authenticated`.
- All nine server-only tables have RLS enabled and grant no table privilege to `anon` or `authenticated`.
- `app_storage_tabs` remains at zero rows.
- `service_role` retains the required table privileges.
- `set_row_updated_at()` and `set_app_storage_tabs_updated_at()` report `search_path=pg_catalog, public` and are not security-definer functions.
- Every pre-existing affected table retains its exact preflight row count and stable hash.
- Supabase security advisors report no warning, error, high, or critical finding. The nine informational `rls_enabled_no_policy` notices are intentional for server-only service-role tables.
- Supabase performance advisors report no finding.
- No real content, subscriber, contact, or email record was created for verification.

The guarded rollback script was executed inside a transaction through every reverse operation and ended with `ROLLBACK`. Follow-up checks proved `inspiration_evergreen` still exists with zero rows, `app_storage_tabs` remains protected, browser roles remain denied, and function search paths remain fixed. The script refuses to drop the additive Inspiration table if it contains content.

## Recovery and rollback posture

- Last-known-good application release: `0cda699fd90ed56c299561ffca99b2ac0c5dfd9e`.
- Application rollback is a Vercel redeploy of that immutable commit. The additive Inspiration table and fixed security posture should normally remain.
- Do not restore broad browser-role grants as a reflexive rollback; that would restore the known exposure.
- If a database-specific regression occurs, stop writes, preserve counts, and prefer the guarded narrow rollback or a forward repair. Do not perform a broad destructive restore when a narrow correction is sufficient.
- The private targeted package is the verified release recovery point.

## Stop conditions used during execution

Execution would have stopped for a target-project mismatch, unexpected DML/destructive DDL, unexplained count/hash change, lost `service_role` access, failed server-role transaction, missing recovery evidence, or missing authority.

None of these stop conditions occurred.
