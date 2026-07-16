# Project Pint final parity and content-readiness matrix

Date: 2026-07-16

Implementation commit: `ff4629127497141fc419543f9a74dc1de690c09b` plus the evidence-only release record update

Production release status: **PRE-DEPLOYMENT CONDITIONAL GO**; production deployment and live verification remain pending

## Design source

- Hosted Figma Make artifact: `CDbFS62IpLGj1NVz9wiMdk`, **Diyesu Decor Website Redesign**, UI label **Version 15**.
- Approved checked-in export: `/Users/ocean/Documents/Project Pint/figma-make-source/Diyesu Decor Website Redesign.zip`.
- Export SHA-256: `2989e3992f925c6665cc50e95e3b5247d865f8eeb8bb3855b07da0b1a8a55f6a`.
- Export timestamp: 2026-06-13.
- Hosted freshness: **UNKNOWN / NOT CONFIRMED**. The signed-in surface exposed the Version 15 label but no immutable version identifier or trustworthy modification timestamp. Claims below are therefore parity against the latest accessible approved Version 15 surface and checked-in export, not a claim of universal pixel identity against an unverified later Figma revision.

Status meanings:

- **PASS**: implemented and supported by current source, tests, browser evidence, or an exact shared-template exemplar.
- **APPROVED EXCEPTION**: intentional behavior or a limitation in the available design evidence.
- **BLOCKED**: implementation exists locally but a required production mutation or external proof is still unavailable.

## Public route matrix

| Route or route family | Responsive and state coverage | Status | Evidence or exception |
|---|---|---:|---|
| `/` | 1440, 740, 390, 767/768; header, mobile menu, ticker, entrances, hover/focus/pressed, reduced motion | PASS | Matched Version 15 captures; current home also reads managed published inspiration without losing the static boards. |
| `/start-here` | 1440, 740, 390; typewriter/reveal, CTA states, reduced motion | PASS | Corrected ARIA semantics, contrast, timing, wrapping, and responsive spacing. |
| `/about` | 1440, 740, 390; FAQ, newsletter presentation, motion and contrast | PASS | Composite Axe and runtime diagnostics are clean. No real form submission was made. |
| `/areas` | 1440, 740, 390; card/grid and shared shell states | PASS | Exact responsive exemplar verified. |
| `/areas/[slug]`: `plants`, `mirror`, `storage`, `lighting`, `shower`, `renter`, `diy`, `extreme-budget` | Shared template; `plants` at 1440/740/390, every generated route at 1440 | PASS | All eight real slugs resolve with canonical metadata, images, no overflow, and the same verified template. |
| `/inspiration` | 1440, 740, 390; static plus managed-card states | PASS | Published managed entries merge with the eleven approved static boards. |
| `/inspiration/[slug]`: `minimalist-elegance`, `modern-marble`, `spa-greenery`, `brass-terrazzo`, `boho-earth-tones`, `scandinavian-clean`, `dark-moody`, `warm-editorial`, `industrial-loft`, `coastal-calm`, `japandi`, and managed published slugs | Shared detail template; static and managed exemplars at desktop/mobile; every current route at 1440 | PASS | Selected static-board products are preserved when managed editorial copy is present. |
| `/blog` | 1440, 740, 390; search, empty search, card states | PASS | Published-only selector, excerpts, media, taxonomy and intentional empty state verified. |
| `/blog/[slug]` | Published, unpublished/404, hero/media, metadata and wrapping states | PASS | Disposable local record proved save, preview, publish, public readback, draft isolation, restore, and unpublish. |
| `/guides/[slug]` | Published, unpublished/404, hero/media, metadata and wrapping states | PASS | Same snapshot-isolated workflow proved with a disposable local guide. There is intentionally no `/guides` index route. |
| `/tags/[slug]` | Published taxonomy route plus unknown 404 | PASS | Tags derive only from published editorial snapshots and carry canonical metadata. |
| `/blueprint` | 1440, 740, 390; size/step states, focus, active controls, reduced motion | PASS | Icon alignment, layering, responsive composition and interaction states match the approved tool frame. The headless-only black mobile band was isolated to Chromium `backdrop-filter` capture compositing; headed Chromium renders correctly. |
| `/plant-picker` | 1440, 740, 390; all steps, locked/results, modal, focus trap, body lock, Escape, pointer/keyboard, skip, reduced motion | PASS | Locked, modal-open and unlocked Axe scans are clean. Steamy ranks Pothos/Peace Lily first; Dry ranks Snake Plant/ZZ Plant first. |
| `/micro/[slug]`: `mini-bath-plant-shelf-layout`, `no-drill-art-layout-guide`, `one-hour-bathroom-reset`, `peel-stick-backsplash-cut-plan`, `removable-lighting-upgrade-checklist`, `renter-mirror-placement-map`, `tiny-vanity-top-organization-map`, `under-75-color-refresh-plan`, `under-sink-bin-label-system` | Shared template; representative 1440/740/390; every approved route at 1440 | PASS | Ten `auto-generated-*` drafts intentionally return 404 and are excluded from sitemap/indexing. |
| `/products/bathroom-plant-picks-upgrade` | 1440, 740, 390; offer/media/CTA states | PASS | Canonical product route and responsive treatment verified. |
| `/legal/privacy`, `/legal/terms`, `/legal/affiliate-disclosure` | All current pages at desktop; shared responsive template, metadata and social image | PASS | Legal template and footer links verified; privacy is the matched multi-width exemplar. |
| `/hub`, `/hub/[slug]`, `/lead-magnets/plant-picker`, `/products/renter-bathroom-upgrade-blueprint`, `/privacy`, `/terms`, `/affiliate` | Redirect response and destination | PASS | Seven intentional permanent aliases resolve to the canonical public routes. |
| Unknown or unpublished public route | Branded 404, no leaked draft content | PASS | Six representative unknown/unpublished dynamic paths returned the expected 404. |

## Admin route matrix

| Route or route family | States and workflows | Status | Evidence or exception |
|---|---|---:|---|
| `/admin/login` | Masked/revealed password, invalid/config/rate-limit handling, successful login, secure cookie, logged-out state | PASS | Authentication remains server-verified. Cookie is HttpOnly, Secure and SameSite Strict. No credential values are recorded here. |
| `/admin` | 1440, 740, 390; 1023/1024 shell change; real KPIs, empty activity, quick actions, confirmations | PASS | Synthetic analytics were removed; the dashboard reads the current backend. |
| `/admin/pins` | Desktop/tablet/mobile, empty/data table, operation feedback | PASS | Existing pin model and export workflow preserved. |
| `/admin/blogs` | Index, search/filter/sort/empty/data states, responsive table | PASS | Direct bulk publication and raw metadata bypasses are blocked. |
| `/admin/blogs/new`, `/admin/blogs/[id]` | Validation, generated/duplicate slug, save/readback, durable feedback, media rights, SEO, preview, publish, conflict, reload, restore, unpublish, unsaved changes | PASS | Disposable local `BLOG_*` fixtures proved snapshot isolation and persisted readback. |
| `/admin/guides` | Index, search/filter/sort/empty/data states, responsive table | PASS | Published-only public selector and focused editor navigation verified. |
| `/admin/guides/new`, `/admin/guides/[id]` | Same full editorial lifecycle as blogs, including publication date | PASS | Disposable local `GUIDE_*` fixture proved the workflow. |
| `/admin/inspiration` | Index, keyboard-scrollable responsive table, empty/data states | PASS | UI/local persistence pass; production `inspiration_evergreen` exists empty with the intended server-only boundary. |
| `/admin/inspiration/new`, `/admin/inspiration/[id]` | Validation, save/readback, media rights, SEO, preview, publish, conflict, restore, unpublish, unsaved changes | PASS | Disposable local `INSP_*` fixture proved the workflow; transactional production service-role CRUD passed and rolled back cleanly. |
| `/admin/preview/[kind]/[id]`, kinds `blogs`, `guides`, `inspiration` | Authenticated saved-draft preview, semantic hero, noindex, exactly one H1 | PASS | All three preview types resolve and strip a duplicate leading Markdown H1. |
| `/admin/emails` | Desktop/tablet/mobile, existing table operations and empty/data states | PASS | Existing content-engine behavior preserved. No real email was sent. |
| `/admin/users` | Desktop/tablet/mobile, search/sort and read-only customer review | PASS | Customer mutation controls were intentionally removed from this surface. |
| `/admin/customers` | Canonical redirect | PASS | Redirects to `/admin/users`. |
| `/admin/products` | Desktop/tablet/mobile, existing product model and operations | PASS | Existing products and revenue fields preserved; no fabricated values added. |
| `/admin/analytics` | Desktop/tablet/mobile; horizontally contained tabs at 390; empty/unavailable/readiness states | PASS | Zero serious/critical Axe findings after exact contrast fixes. No estimated analytics are shown. |
| Shared admin loading, error, dynamic-item not-found and unknown-route 404 | Branded, responsive, private/no-store, noindex; unknown path is a real 404 | PASS | The unknown-path response is auth-gated and non-hydrating to avoid Next streamed-status coercion. |
| Responsive admin navigation | Desktop sidebar; mobile drawer; open/close, backdrop, focus trap, Escape, body lock, restore, reduced motion | PASS | Exact 1023/1024 behavior and 390 screenshots verified. |

There are no discovered dedicated media-library, author, taxonomy, settings, or pagination routes. Those capabilities are intentionally represented by fields in the focused editors and by the existing table controls. The available approved Figma source did not distinguish additional standalone screens, so adding an unrelated CMS was not justified.

## API and system surface matrix

| Surface | Status | Verification note |
|---|---:|---|
| `POST /api/subscribe` | PASS | Validation, persistence, customer upsert and 303 redirect are covered by tests and disposable storage. No real subscriber was created. |
| `POST /api/track` | APPROVED EXCEPTION | Event allowlist, validation and rate limiting were source-reviewed. A valid production-style event was not emitted solely to avoid polluting analytics. |
| `POST /api/admin/login`, `POST /api/admin/logout` | PASS | Exact-origin mutation checks, bounded form handling, pre-parse rate limit, secure cookie and logout were verified. |
| `GET /api/admin/review-pack` | PASS | Authentication, private/no-store download and absence of the former public static asset verified. |
| `GET /api/admin/exports/pins` | PASS | Authenticated, no-store CSV path uses formula-neutralized serialization. |
| `GET|POST /api/admin/command-center/[tab]` | PASS | Exact table schemas, optimistic revisions, read-only customers and bounded writes covered by tests. |
| `POST /api/admin/command-center/ops` | PASS | Action-specific schemas, confirmations and allowed operations covered by tests. |
| `GET|POST /api/admin/editorial/[kind]` | PASS | Blogs/guides validation, conflicts and snapshot publication covered by tests and browser workflows. |
| `GET|POST /api/admin/inspiration` | PASS | Full local workflow passes; production schema/access exists and transactional service-role CRUD passed without retained data. |
| `GET|POST /api/admin/sheets/[tab]` | PASS | Authenticated legacy endpoint intentionally returns 410. |
| `/robots.txt` | PASS | Valid output; public routes allowed and `/admin`/`/api/admin` disallowed. |
| `/sitemap.xml` | PASS | Published-only public routes, approved micro guides, canonical areas and inspiration included; drafts/admin excluded. |
| `/rss.xml` | PASS | Published-only editorial feed and canonical URLs verified. |
| `/favicon.ico`, `/icon.svg` | PASS | Both resolve without the prior missing-favicon error. |
| Canonical, Open Graph, Twitter and structured metadata | PASS | Shared metadata envelope, default approved image, WebSite JSON-LD and Article JSON-LD verified. |

## Cross-route state matrix

| Concern | Status | Evidence |
|---|---:|---|
| 1440 desktop, 740 tablet, 390 mobile | PASS | All public route families and every main admin surface have matched screenshots or an exact shared-template exemplar. |
| 767/768 public navigation and 1023/1024 admin navigation | PASS | Above/below breakpoint screenshots and interaction checks. |
| Hover, focus, pressed, selected, disabled, open and closed | PASS | Shared controls plus tool/admin-specific controls checked in browser. |
| Loading, empty, validation, success, error, conflict and unavailable | PASS | Admin boundaries and disposable editorial workflows exercised. |
| Entrances, reveal, typewriter, ticker, modal and drawer motion | PASS | Timing/geometry inspected; no unnecessary new continuous work. |
| `prefers-reduced-motion` | PASS | Typewriter completes immediately, cursor and transitions stop, modal/drawer animations stop, geometry remains stable. |
| Keyboard order, modal focus trap, body lock, Escape and focus restoration | PASS | Plant Picker and admin drawer verified with pointer and keyboard activation. |
| Horizontal overflow, broken images, unrevealed content, console/page errors and unexpected failed responses | PASS | Final local browser matrices report zero unexpected diagnostics. |
| Representative Axe serious/critical scan | PASS | Composite public matrix and representative authenticated admin routes are clean. |
| Media loading, crop, alt, caption, credit and rights gate | PASS | `SafeImage` restricts optimizer use to exact approved Unsplash paths; publication requires approved hero rights when a social image is used. |

## Approved exceptions and accepted release conditions

1. **APPROVED EXCEPTION — design freshness:** hosted Figma freshness is `UNKNOWN / NOT CONFIRMED`; Version 15 and the checked-in export are the strongest available source.
2. **APPROVED EXCEPTION — Plant Picker behavior:** humidity-based priority is intentionally preserved even though the prototype did not model it reliably.
3. **APPROVED EXCEPTION — dynamic copy:** data-backed blog, guide, tag and managed-inspiration copy cannot have fixed-copy Figma parity; their shared templates, wrapping, media and representative states are the parity target.
4. **ACCEPTED CONDITION — dependency advisory:** `next@15.5.18` resolves `postcss@8.4.31`, producing two moderate `GHSA-qx2v-qp2m-jg93` findings and zero high/critical findings. `npm audit` offers only a breaking forced change to `next@9.3.3`; the owner explicitly accepted deferral until a compatible upstream fix exists.
5. **ACCEPTED CONDITIONAL RISK — distributed limiting:** the application limiter is in-memory. Authenticated Vercel Firewall configuration was unavailable, no paid or potentially billable rule was guessed, no active Cloudflare-proxied production hostname was found, and the direct `*.vercel.app` aliases remain exposed. The owner accepted this for the current low-traffic release with review before higher-risk public writes or material growth and no later than 2026-10-16.
6. **RESOLVED — production schema/security:** `20260716_inspiration_evergreen.sql` and `20260716_release_security_hardening.sql` were applied in order as migrations `20260716093525` and `20260716093727`. Counts/hashes were preserved, browser roles were denied, service-role access passed, function search paths were fixed, and Supabase advisors returned no warning/error/high/critical finding.
7. **PROVIDER EVIDENCE — Cloudflare:** `diyesu.com` uses Cloudflare nameservers, but the apex has no A/AAAA record and `www` is NXDOMAIN. It is not an active proxied production hostname, no Cloudflare WAF/bot/rate protection covers the current release, and the public Vercel aliases remain directly accessible.

## Evidence index

- `output/playwright/figma-v15-public-final/`
- `output/playwright/admin-shell-final/`
- `output/playwright/inspiration-readiness/`
- `output/playwright/final-public-matrix/`
- `output/playwright/final-public-matrix/post-fix-final-3029/`
- `output/playwright/final-admin-matrix/`
- `output/playwright/final-admin-matrix/post-fix-final/`
- `output/playwright/final-admin-matrix/post-fix-final-3033/` (13/13 true-404, contrast, Axe and diagnostic checks)
- `docs/verification/production-security-evidence-2026-07-16.md`
- `docs/verification/supabase-release-runbook-2026-07-16.md`
- `docs/verification/predeployment-gate-2026-07-16.md`

These generated browser artifacts are intentionally untracked and must not be staged. The parity matrix itself is source documentation and should be committed with the implementation.
