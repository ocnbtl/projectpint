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
- `NEXT_PUBLIC_SITE_URL`
- `SHEETS_MODE`
- `GOOGLE_SHEETS_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `KLAVIYO_PRIVATE_API_KEY`
- `KLAVIYO_LIST_ID`

Notes:
- Keep secrets only in Vercel env settings, never in repo.
- `GOOGLE_PRIVATE_KEY` must preserve escaped newlines (`\n`).
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
- `/hub/renter-friendly-upgrades`
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
