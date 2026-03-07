# Vercel Preview Deploy Runbook

Use this checklist to deploy a preview safely after local changes.

## 1) Local preflight
Run these in `/Users/ocean/Documents/Project Pint`:

```bash
git status -sb
npm run build
npm test
```

Expected:
- clean working tree (or only intentional committed changes)
- build succeeds
- tests pass

Known warning (allowed):
- `lib/seed.ts` has unused `nowIso` lint warnings.

## 2) Required Vercel environment variables
Set these in Vercel Project Settings -> Environment Variables for **Preview**:

- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `STORAGE_MODE`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `KLAVIYO_PRIVATE_API_KEY`
- `KLAVIYO_LIST_ID`

Notes:
- Keep secrets only in Vercel env settings, never in repo.
- `ADMIN_SESSION_SECRET` should be a long random string, separate from `ADMIN_PASSWORD`.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only. Do not expose it as a public env var.
- For preview URLs, set `NEXT_PUBLIC_SITE_URL` to the active Vercel preview URL if needed.

## 3) Trigger preview deploy
- Push commits to GitHub.
- Open or update a PR (or push to branch tracked by Vercel previews).
- Wait for Vercel build to complete.

## 4) Preview smoke checks
Verify on the preview URL:

- `/`
- `/start-here`
- `/hub`
- `/hub/renter`
- `/about`
- `/legal/privacy`
- `/legal/terms`
- `/legal/affiliate-disclosure`

Functional checks:
- Nav and footer links work on desktop and mobile widths.
- `POST /api/subscribe` succeeds from homepage and plant picker forms.
- Affiliate disclosure appears where affiliate links exist.
- Footer global disclosure and legal links remain visible.

## 5) Merge gate
Do not merge until:
- preview build is green,
- manual smoke checks pass,
- compliance/disclosure copy is intact.
