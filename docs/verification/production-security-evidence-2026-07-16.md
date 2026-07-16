# Project Pint production security and migration evidence

Date: 2026-07-16

This is the public-safe release evidence index. Private production-row recovery material is stored outside Git and is not reproduced here.

## Recovery

- Supabase project: `projectpint` (`dlgwzvovucsaizxnyuut`, `us-east-2`, `ACTIVE_HEALTHY`).
- Organization plan: Free; automatic backups and PITR are unavailable.
- Recovery method: complete targeted pre-migration package at `/private/tmp/project-pint-recovery-20260716T0515EDT`, directory mode `0700`, files mode `0600`.
- Private row snapshot SHA-256: `a719f3da563d2e138facf2e5895bdd4509d0c8649d130f2cadd64e5897ee18db`.
- Pre-migration counts/hashes SHA-256: `35df4b89c40e4ad8cd7607d64be842e34520877c141e8898e802a0867c06116f`.
- Rollback SQL SHA-256: `64f65f143cfca15990db706acccd33ad363275918d306ca90381e0262e17a275`.
- Guarded rollback dry-run: every reverse operation executed inside a transaction ending in `ROLLBACK`; follow-up state remained hardened and unchanged.

## Migration results

| Order | File | SHA-256 | Recorded version | Result |
|---:|---|---|---|---|
| 1 | `20260716_inspiration_evergreen.sql` | `f24cded3f9be47aad85d9dbd4791cac9c0903778e0ea87a2021ab6a577cf119b` | `20260716093525` | PASS |
| 2 | `20260716_release_security_hardening.sql` | `41bc15cfb5109b2df0dcfcdc6107e16615e03391c61d5fe8c1d9ad09fe502db4` | `20260716093727` | PASS |

Before/after row counts and stable hashes match for every pre-existing affected table: app storage 0, pins 0, blogs 6, guides 0, emails 0, customers 4, products 0, and leads 7. Inspiration was created with zero rows. Neither migration contains editorial DML.

All nine server-only tables now have RLS enabled and zero policies. `anon` and `authenticated` have no table privilege; `service_role` retains its required privileges. Direct browser-role negative tests against representative reads and writes returned PostgreSQL `42501`. A transactional service-role Inspiration CRUD/trigger test passed and rolled back, leaving zero records.

`set_row_updated_at()` and `set_app_storage_tabs_updated_at()` remain `SECURITY INVOKER` and now have configuration `search_path=pg_catalog, public`.

Post-migration Supabase security advisors returned only nine informational `rls_enabled_no_policy` notices, intentional for server-only service-role tables. There were no warning, error, high, or critical findings. Performance advisors returned no findings.

## Provider protection disposition

- Vercel automatic platform DDoS defense applies to the current project.
- Authenticated Firewall configuration could not be inspected through the available integration, and no provider rate-limit rule was added.
- If a free authenticated rule becomes safely available, the narrow target is exact method `POST` and path `/api/subscribe`, per source IP, at 8 requests per 10 minutes. This matches the sustained rate of the existing 12-per-15-minute application limit and does not touch admin, preview, deploy or monitoring traffic.
- Cloudflare is authoritative DNS for `diyesu.com`, but neither the apex nor `www` currently resolves to the production application. No active proxied custom production hostname or applicable Cloudflare WAF/bot/rate-limit protection was verified.
- The directly accessible `projectpint.vercel.app` and related Vercel aliases remain outside Cloudflare.
- The first live deployment exposed `NEXT_PUBLIC_SITE_URL=https://diyesu.com` in metadata despite the absent DNS. The application now accepts only the verified `https://projectpint.vercel.app` origin for canonicals, sitemap, RSS and structured data. A custom domain must be attached to Vercel and pass public DNS/TLS verification before it is added to the verified-origin set.

Owner disposition:

> ACCEPTED CONDITIONAL RISK — Project Pint is currently low-traffic and protected by Vercel’s automatic platform DDoS defenses, application-level validation and limiting, authenticated admin controls, and Supabase RLS. No Cloudflare-proxied production hostname is currently active, and the directly accessible `*.vercel.app` aliases remain exposed. Distributed provider-level rate limiting and Cloudflare proxying will be revisited as usage grows or before adding higher-risk public write endpoints.

## Dependency disposition

Fresh `npm audit --omit=dev` reports two moderate findings and zero high/critical findings. Both are the same PostCSS advisory, `GHSA-qx2v-qp2m-jg93` (CWE-79, CVSS 6.1), through `next@15.5.18 -> postcss@8.4.31`. Application source does not import PostCSS, and no demonstrated remotely exploitable production path was found. The only automated remediation offered is a breaking forced downgrade to Next `9.3.3`, which is prohibited and was not run.

The owner accepts this as a noncritical release condition. Maintenance follow-up: upgrade to a compatible upstream Next dependency chain that resolves PostCSS `>=8.5.10`, then rerun the full build, browser and audit gates. Review no later than 2026-08-16, and escalate sooner if severity becomes high/critical or a remotely exploitable path is demonstrated.

## Remaining noncritical application follow-up

`POST /api/subscribe` currently performs read/append/full-table synchronization for Leads and Customers. Concurrent signups can race and lose an update. Provider/application limiting reduces likelihood but does not remove it. Replace this path with atomic database upserts before material traffic growth; this is pre-existing and is not a migration regression.
