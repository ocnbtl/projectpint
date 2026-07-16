# Project Pint pre-deployment launch gate

## Gate identity

- **Gate:** Final Figma-parity and content-readiness release
- **Phase:** `PRE-DEPLOYMENT`
- **Scope:** Public redesign fidelity, responsive/motion finish, authenticated admin shell and editorial workflows, Inspiration content model, SEO/accessibility/security hardening
- **Mode:** Combined client website, web application, authenticated admin system, and Supabase-backed product
- **Risk level:** High; includes authentication, personal data, publishing workflows, and production schema/privilege changes
- **Target/environment:** Vercel production project `prj_fATwa8oY5QLKCHOgRo5867S4vkZE`; Supabase production project `dlgwzvovucsaizxnyuut`
- **Branch:** canonical `main`
- **Commit/artifact:** Release commit `d1de7e75ab8d00c4eb73a024183de0a5b9b16dd6` plus the bounded verified-canonical correction discovered during its first live smoke; final immutable descendant must be verified after push
- **Domain:** `https://projectpint.vercel.app`
- **Timestamp:** 2026-07-16 07:25 EDT

## Launch matrix

| Category | Check | Criticality | Status | Evidence | Owner | Disposition / Action |
|---|---|---:|---:|---|---|---|
| Scope/source | Canonical repo, branch, upstream and release base | CRITICAL | PASSED | Clean isolated release clone from `/Users/ocean/Code/Project Pint`; `main`; candidate `ff46291...`; freshly fetched canonical `origin/main=0cda699...` before evidence commit | Release operator | Commit only the three intentional reports plus the public-safe security evidence; exclude browser/private artifacts. |
| Scope/source | Approved design identity | HIGH | PASSED | Figma Make `CDbFS62IpLGj1NVz9wiMdk`, UI Version 15; checked-in export SHA-256 recorded in parity matrix | Design owner | Hosted freshness remains an explicit approved evidence limitation. |
| Scope/source | Current production artifact and rollback point | CRITICAL | PASSED | Vercel deployment `dpl_AFJ9Z8C1iEk7RbpjTY2NRtsfymje`, READY, production, exact Git SHA `0cda699...` | Release operator | Preserve as last-known-good application rollback reference. |
| Functionality | Public routes, navigation, redirects, tools, dynamic templates and failure paths | CRITICAL | PASSED | 40 sitemap routes at 1440; 13 representative groups at 740/390; seven redirects; six intentional 404s; zero unexpected local diagnostics | Build owner | Rerun representative checks on the immutable production deployment. |
| Functionality | Auth/session/authorization and admin route boundaries | CRITICAL | PASSED | Secure-cookie login/logout, unauthorized redirect, private/no-store/noindex admin, exact-origin mutations, authenticated unknown-path 404 | Build owner | Rerun login, shell, route boundary, and server-backed read checks live. |
| Functionality | Editorial create/edit/preview/publish/unpublish/conflict workflows | CRITICAL | PASSED | Disposable local blog, guide and Inspiration workflows persisted/read back; production service-role Inspiration CRUD passed transactionally and rolled back | Build owner | Use no real editorial mutation for post-deploy checks unless a fully reversible isolated fixture is safe. |
| Visual fidelity | Public route/state parity at target widths | HIGH | PASSED | Final public screenshot matrix; breakpoint, motion, layering, crop, focus/pressed and reduced-motion checks | Design/build owner | Parity is limited to the named accessible Version 15 evidence. |
| Visual fidelity | Admin shell, indexes, editors, previews and responsive states | HIGH | PASSED | Full admin matrix plus 1023/1024 shell and final 390/1440 branded 404 captures | Design/build owner | Admin extensions absent from Figma use the approved shell language. |
| Accessibility | Structure, labels, contrast, keyboard/focus, dialogs, reduced motion | CRITICAL | PASSED | Composite public/admin Axe evidence clean; live WebKit exposed post-unmount drawer focus loss, now repaired with deferred restoration and covered by the 59-test suite | Build owner | Recheck Escape and menu-button focus on the replacement deployment; automated checks do not replace future screen-reader user testing. |
| SEO/discovery | Metadata, canonicals, JSON-LD, RSS, sitemap, robots, redirects, 404s | HIGH | PASSED | First live smoke exposed an inactive `diyesu.com` environment override; `resolveSiteOrigin` now accepts only the verified production alias, regression coverage passes, and the 34-page production build succeeds | Build owner | Verify canonical, sitemap, robots, RSS and structured metadata on the replacement deployment. |
| Performance/resilience | Production build, route weights, images, motion work and layout stability | HIGH | PASSED | Next 15.5.18 build: 34 generated static pages; exact Unsplash optimization allowlist; no local overflow/unrevealed content | Build owner | Observe field/runtime behavior post-deploy. |
| Security/privacy | Release diff input/auth/export/media/headers review | CRITICAL | PASSED | Bounded schemas, CSV neutralization, HTTPS validation, CSP/nosniff/frame/referrer/permissions headers, private admin JSON | Security reviewer | No critical code finding remains. |
| Security/privacy | Production Supabase browser boundary | CRITICAL | PASSED | Migrations `20260716093525` and `20260716093727`; nine RLS-enabled tables; zero browser grants; direct negative tests returned `42501`; service-role transaction passed | Release operator | Recheck advisors and server-backed application reads after deployment. |
| Security/privacy | Provider-level distributed rate limiting | HIGH | NOT VERIFIED | Vercel automatic DDoS applies; authenticated Firewall configuration remained unavailable, no rule was safely added, no active Cloudflare-proxied production hostname exists, and `*.vercel.app` remains direct | Owner + operations | Explicitly accepted conditional risk; monitor and revisit by the recorded deadline. |
| Security/privacy | Production dependencies | MEDIUM | BLOCKED | Fresh audit: two moderate findings, zero high/critical; both `GHSA-qx2v-qp2m-jg93` via `next@15.5.18 -> postcss@8.4.31`; offered force fix downgrades Next to 9.3.3 | Owner + build owner | Explicitly accepted deferral; monitor for a compatible Next/PostCSS update. |
| Analytics/conversion | Analytics presence and safe conversion contracts | HIGH | PASSED | Vercel Analytics/Speed Insights present; tracking allowlist and application limits reviewed; subscribe persistence covered by disposable tests | Build owner | Do not submit a real production subscriber during smoke checks. |
| Monitoring/operations | Baseline provider health and error visibility | HIGH | PASSED | Current Vercel production READY; fresh two-hour runtime-error query returned none | Operations owner | Begin immediate observation after the new immutable release is live. |
| Monitoring/operations | Database recovery readiness | CRITICAL | PASSED | Supabase Free plan has no automatic backup/PITR; private targeted package captures affected rows/schema/security/functions/structure/history plus guarded rollback; permissions and SHA-256 values recorded | Release operator | Keep the package private/outside Git; prefer narrow rollback or forward repair. |
| Deployment | Production project, alias, runtime and source integration | CRITICAL | PASSED | Vercel project `projectpint`, Node 24.x, Git `main`, public alias and old immutable release confirmed | Release operator | Push only the verified final commit and prove Vercel built that SHA. |
| Deployment | Required production migrations applied in order | CRITICAL | PASSED | Inspiration applied first, hardening second; migration history, schema, access matrix, negative tests, advisors, counts and rollback dry-run verified | Release operator | No further migration application is required. |
| Content/approvals | Existing public content, legal/footer and approved assets | HIGH | PASSED | Live-derived counts/taxonomy preserved; legal links and approved media resolve; no claims/content fabricated | Content owner | Final editorial population is intentionally future work. |
| Content/approvals | Content-entry foundation | HIGH | PASSED | Blog, guide and Inspiration editors cover core editorial, media-rights, publication, SEO, preview and conflict workflows; production Inspiration schema now exists | Content owner | Ready for live verification after deployment. |
| Data integrity | Migration row safety, ordering and invariants | CRITICAL | PASSED | Exact before/after counts and stable hashes match: app storage 0, pins 0, blogs 6, guides 0, emails 0, customers 4, products 0, leads 7; Inspiration created empty | Release operator | Preserve private evidence and compare live reads after deploy. |

## Completed fixes

- Completed the Version 15 public fidelity pass across motion, states, breakpoints, contrast, media, layering and shared shell.
- Completed the responsive authenticated admin shell, content indexes/editors/previews, real analytics states, safe operations and managed Inspiration workflow.
- Added published-snapshot isolation, metadata envelopes, media-rights gates, duplicate-slug/conflict handling and unsaved-change protection.
- Added sitemap/robots, canonical social metadata, structured data, RSS consistency, security headers and server-only review-pack access.
- Prevented an inactive or unverified custom-domain environment override from becoming the live canonical origin; updated the environment contract and regression test.
- Deferred mobile admin drawer focus restoration until after its unmount commit so Escape reliably returns focus to the menu button across browser engines.
- Applied and verified the owner-approved production Inspiration and security-hardening migrations without changing editorial rows.
- Created and verified a private targeted recovery package and guarded rollback dry-run.

## Blockers

- **Code:** None.
- **Infrastructure:** No critical blocker. Vercel Firewall configuration remains unavailable and no active Cloudflare-proxied hostname was found; this is an accepted noncritical condition.
- **Client/input:** None.

## Conditional-risk acceptance

| Risk | Criticality | Disposition | Decision-maker | Acceptance evidence | Owner | Deadline | Monitoring plan |
|---|---:|---|---|---|---|---|---|
| Provider-level distributed rate limiting and absent Cloudflare proxy | HIGH | Accepted for this low-traffic release; no Vercel Hobby rule was guessed or potentially billed. Direct Vercel aliases remain exposed. | Ocean / project owner | Explicit 2026-07-16 authorization and supplied acceptance language | Ocean + operations maintainer | Before adding any higher-risk public write endpoint or material traffic growth; formal review no later than 2026-10-16 | Review Vercel runtime errors/traffic and subscribe abuse signals after release and during monthly maintenance; configure exact `POST /api/subscribe` limiting when authenticated free-plan configuration is safely available. |
| Moderate PostCSS advisory | MEDIUM | Accepted and deferred; do not run the breaking Next 9.3.3 force fix. | Ocean / project owner | Explicit 2026-07-16 advisory disposition | Build maintainer | On the first compatible upstream Next/PostCSS fix; audit review no later than 2026-08-16 | Run `npm audit --omit=dev` during dependency maintenance; escalate if severity becomes high/critical or a remotely exploitable application path is demonstrated. |

Accepted provider-risk statement:

> ACCEPTED CONDITIONAL RISK — Project Pint is currently low-traffic and protected by Vercel’s automatic platform DDoS defenses, application-level validation and limiting, authenticated admin controls, and Supabase RLS. No Cloudflare-proxied production hostname is currently active, and the directly accessible `*.vercel.app` aliases remain exposed. Distributed provider-level rate limiting and Cloudflare proxying will be revisited as usage grows or before adding higher-risk public write endpoints.

## Rollback and observation

- **Last-known-good:** Vercel deployment `dpl_AFJ9Z8C1iEk7RbpjTY2NRtsfymje`, commit `0cda699fd90ed56c299561ffca99b2ac0c5dfd9e`.
- **Rollback procedure or gap:** Redeploy the last-known-good immutable application commit if a release regression requires rollback. Retain the additive Inspiration table and hardening when possible; use guarded narrow database rollback or forward repair only for a database-specific regression.
- **Baseline health:** Existing production is READY and has no runtime error cluster in the fresh two-hour query.
- **Monitoring owner and escalation:** Project owner and release operator; Supabase/Vercel administrators for provider access issues.
- **Observation window and checks:** Immediate post-deploy route/admin/runtime/log/asset/overflow/motion checks, followed by the formal post-deployment gate and `post-launch-operations` immediate observation.
- **Test artifacts or residue:** Private recovery package only under `/private/tmp`; no production fixture, form submission, subscriber, email, or editorial record remains. Browser evidence is intentionally untracked.

## Final decision

`CONDITIONAL GO TO DEPLOY`

Every critical check is passed. The only unresolved checks are the two explicitly owner-accepted noncritical conditions above, each with an owner, deadline and monitoring plan. The exact final commit still must be pushed, built and verified on the public alias before production health can be claimed.

## Plain-English summary

The implementation, production database boundary, recovery posture and release checks are ready to publish. Deployment may proceed under the two documented noncritical conditions, after which the exact live commit and critical public/admin behavior must be verified.
