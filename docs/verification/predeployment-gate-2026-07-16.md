# Project Pint pre-deployment launch gate

## Gate identity

- **Gate:** Final Figma-parity and content-readiness release
- **Phase:** `PRE-DEPLOYMENT`
- **Scope:** Public redesign fidelity, responsive/motion finish, authenticated admin shell and editorial workflows, Inspiration content model, SEO/accessibility/security hardening
- **Mode:** Combined client website, web application, authenticated admin system, and Supabase-backed product
- **Risk level:** High; includes authentication, personal data, publishing workflows, and production schema/privilege changes
- **Target/environment:** Vercel production project `prj_fATwa8oY5QLKCHOgRo5867S4vkZE`; Supabase production project `dlgwzvovucsaizxnyuut`
- **Branch:** canonical `main`
- **Commit/artifact:** Locally committed release candidate based on `0cda699fd90ed56c299561ffca99b2ac0c5dfd9e`; the commit containing this report is the intended local artifact and remains unpushed
- **Domain:** `https://projectpint.vercel.app`
- **Timestamp:** 2026-07-16 05:07 EDT

## Launch matrix

| Category | Check | Criticality | Status | Evidence | Owner | Disposition / Action |
|---|---|---:|---:|---|---|---|
| Scope/source | Canonical repo, branch, upstream and release base | CRITICAL | PASSED | `/Users/ocean/Code/Project Pint`; `main`; `origin/main`; local/base/remote all `0cda699...` before commit | Release operator | Commit only intentional source; do not stage browser artifacts. |
| Scope/source | Approved design identity | HIGH | PASSED | Figma Make `CDbFS62IpLGj1NVz9wiMdk`, UI Version 15; checked-in export SHA-256 recorded in parity matrix | Design owner | Hosted freshness remains an explicit approved evidence limitation. |
| Scope/source | Current production artifact and rollback point | CRITICAL | PASSED | Vercel deployment `dpl_AFJ9Z8C1iEk7RbpjTY2NRtsfymje`, READY, production, exact Git SHA `0cda699...`, correct aliases | Release operator | Preserve as last-known-good; rollback requires separate production authority. |
| Functionality | Public routes, navigation, redirects, tools, dynamic templates and failure paths | CRITICAL | PASSED | 40 sitemap routes at 1440; 13 representative groups at 740/390; seven redirects; six intentional 404s; zero unexpected diagnostics | Build owner | No action. |
| Functionality | Auth/session/authorization and admin route boundaries | CRITICAL | PASSED | Secure-cookie login, logout, unauthorized redirect, private/no-store/noindex admin, exact-origin mutations, true authenticated unknown-path 404 | Build owner | No action. |
| Functionality | Editorial create/edit/preview/publish/unpublish/conflict workflows | CRITICAL | PASSED locally | Disposable local blog, guide and Inspiration records persisted and read back; public snapshots isolated from draft edits | Build owner | Production Inspiration persistence remains gated by schema application. |
| Visual fidelity | Public route/state parity at target widths | HIGH | PASSED | Final public screenshot matrix; breakpoint, motion, layering, crop, focus/pressed and reduced-motion checks | Design/build owner | Parity is limited to the named accessible Version 15 evidence. |
| Visual fidelity | Admin shell, indexes, editors, previews and responsive states | HIGH | PASSED | Full admin matrix plus 1023/1024 shell and final 390/1440 branded 404 captures | Design/build owner | Admin extensions absent from Figma use the approved shell language. |
| Accessibility | Structure, labels, contrast, keyboard/focus, dialogs, reduced motion | CRITICAL | PASSED | Composite public Axe matrix clean; representative admin Axe clean; Plant modal and admin drawer manually verified | Build owner | Automated checks do not replace future screen-reader user testing. |
| SEO/discovery | Metadata, canonicals, JSON-LD, RSS, sitemap, robots, redirects, 404s | HIGH | PASSED | Build routes plus public system matrix; admin excluded from indexing | Build owner | No action. |
| Performance/resilience | Production build, route weights, images, motion work and layout stability | HIGH | PASSED | Next 15.5.18 build: 34 generated static pages; exact Unsplash optimization allowlist; no overflow/unrevealed content | Build owner | Field performance for the new commit must be observed post-deploy. |
| Security/privacy | Release diff input/auth/export/media/headers review | CRITICAL | PASSED | Bounded schemas, CSV neutralization, HTTPS validation, CSP/nosniff/frame/referrer/permissions headers, private admin JSON | Security reviewer | No critical code finding remains. |
| Security/privacy | Production Supabase browser boundary | CRITICAL | BLOCKED | `app_storage_tabs`: RLS disabled, 0 rows, full `anon`/`authenticated` grants; active tables retain broad grants behind RLS; migration prepared but unapplied | Owner + release operator | Explicitly approve and apply both named migrations, then rerun advisors and invariants. |
| Security/privacy | Production login-abuse durability / Vercel firewall policy | HIGH | NOT VERIFIED | App limiter is in-memory; available Vercel integration does not expose firewall configuration | Owner / Vercel admin | Verify a provider-level rule or explicitly accept with owner/deadline/monitoring before GO. |
| Security/privacy | Production dependencies | MEDIUM | BLOCKED | `npm audit --omit=dev`: two moderate PostCSS advisories; offered fix force-installs breaking Next 9.3.3 | Owner + build owner | Do not use the unsafe force fix; document owner disposition or upgrade when a compatible patched Next chain exists. |
| Analytics/conversion | Analytics presence and safe conversion contracts | HIGH | PASSED | Vercel Analytics/Speed Insights present; tracking allowlist/rate limit reviewed; subscribe persistence covered by disposable tests | Build owner | No real production event or subscriber was created. |
| Monitoring/operations | Baseline provider health and error visibility | HIGH | PASSED | Current Vercel production READY; no runtime error cluster in last 24 hours | Operations owner | Run `post-launch-operations` only after a successful deployment. |
| Monitoring/operations | Database recovery readiness | CRITICAL | NOT VERIFIED | Non-destructive runbook prepared; provider backup/PITR state unavailable through current integration | Owner / Supabase admin | Confirm backup/PITR or explicitly authorize an acceptable recovery plan before migration. |
| Deployment | Production project, alias, runtime and source integration | CRITICAL | PASSED | Vercel project `projectpint`, Node 24.x, Git `main`, public alias confirmed | Release operator | Push only after a GO decision. |
| Deployment | Required production migrations applied in order | CRITICAL | BLOCKED | Supabase has no recorded migrations; `inspiration_evergreen` does not exist | Owner + release operator | Approve/apply, verify row counts/grants/RLS/functions, then rerun gate. |
| Content/approvals | Existing public content, legal/footer and approved assets | HIGH | PASSED | Live-derived counts/taxonomy preserved; legal links and approved media resolve; no claims/content fabricated | Content owner | Final editorial population is intentionally future work, not a foundation blocker. |
| Content/approvals | Content-entry foundation | HIGH | PASSED locally | Blog, guide and Inspiration editors cover title, slug, author, excerpt/body, media rights, status, SEO, canonical/social and previews | Content owner | Production Inspiration becomes ready only after its table exists. |
| Data integrity | Migration row safety, ordering and invariants | CRITICAL | BLOCKED | Both SQL files contain no row writes/deletes; baseline row counts recorded; apply and post-check not authorized | Owner + release operator | Follow the migration runbook after explicit approval. |

## Completed fixes

- Completed the Version 15 public fidelity pass across motion, states, breakpoints, contrast, media, layering and shared shell.
- Completed the responsive authenticated admin shell, read-only users surface, real analytics states, safe operations, editorial editors and managed Inspiration workflow.
- Added published-snapshot isolation, metadata envelopes, media-rights gates, duplicate-slug/conflict handling and unsaved-change protection.
- Added sitemap/robots, canonical social metadata, structured data, RSS consistency, security headers and server-only review-pack access.
- Closed code-level input, CSV, media URL, origin, cache and admin 404 issues; final local gates and browser diagnostics are green.

## Blockers

- **Code:** None that can be safely fixed without a production dependency or owner decision.
- **Infrastructure:** Supabase migrations unapplied; production backup/PITR not verified; Vercel firewall/rate-limit policy not visible through the integration.
- **Client/input:** Explicit approval to mutate production Supabase schema/RLS/privileges and an owner disposition for the two moderate dependency advisories are missing.

## Conditional-risk acceptance

None. The agent cannot accept the unresolved security, recovery, or dependency risks for the owner.

## Rollback and observation

- **Last-known-good:** Vercel deployment `dpl_AFJ9Z8C1iEk7RbpjTY2NRtsfymje`, commit `0cda699fd90ed56c299561ffca99b2ac0c5dfd9e`.
- **Rollback procedure or gap:** Redeploy the last-known-good immutable commit with separate rollback authority. The additive Inspiration table and fixed security posture should remain; database recovery follows the reviewed runbook. Provider backup/PITR is not yet verified.
- **Baseline health:** Current production deployment READY; no Vercel runtime errors in the last 24 hours.
- **Monitoring owner and escalation:** `post-launch-operations` after deployment; owner/Vercel/Supabase administrators for provider or access issues.
- **Observation window and checks:** Immediate route/admin/runtime/log/asset/overflow/motion checks after release, followed by the formal post-deployment gate.
- **Test artifacts or residue:** Disposable local fixture records only under `/private/tmp`; no production form, subscriber, content, email or analytics writes. Browser evidence is untracked.

## Final decision

`NO-GO`

The local release candidate is functionally and visually ready, but production may not be changed or deployed while the required Supabase table/security migrations lack explicit approval, production recovery evidence remains unverified, and the current production database exposes the legacy `app_storage_tabs` table to browser roles. This is a pre-deployment decision; it does not claim the new release is live.

## Plain-English summary

The site and admin application are finished and verified locally, but the release must pause before push/deployment. The remaining work is production-specific: approve and safely apply the two reviewed Supabase migrations, verify recovery and firewall assumptions, rerun this gate, then publish and perform the live post-deployment checks.
