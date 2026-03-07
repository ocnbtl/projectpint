# Project Pint Setup Guide (Non-Engineer)

## 1) Open project folder
```bash
cd "/Users/ocean/Documents/Project Pint"
```

## 2) Install dependencies
```bash
npm install
```

## 3) Configure environment
```bash
cp .env.example .env.local
```
Set these in `.env.local`:
- `ADMIN_PASSWORD` (required for admin login)
- `ADMIN_SESSION_SECRET` (required for signed admin sessions in preview/production)
- `STORAGE_MODE` (`supabase` for hosted persistence, `local` for local fallback)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- Klaviyo vars if using live email sync

## 4) Change admin password (any time)
1. Open `.env.local`
2. Update `ADMIN_PASSWORD`
3. Update `ADMIN_SESSION_SECRET` if you want to rotate all active admin sessions
3. Restart dev server

## 5) Create Supabase storage tables
Open the Supabase SQL editor for `projectpint` and run the SQL from `supabase/schema.sql`.

This creates the dedicated command-center tables plus the compatibility table used by transitional legacy publish/export flows.

## 6) Verify app health
```bash
npm run build
npm test
```

## 7) Start local app
```bash
npm run dev -- -p 3001 -H localhost
```
Open:
- Public site: `http://localhost:3001`
- Admin login: `http://localhost:3001/admin/login`

## 8) First command-center run
1. Go to `/admin/blogs` and generate new blogs by area.
2. Go to `/admin/guides` and generate new guides by area.
3. Go to `/admin/pins` and generate 25 new pins.
4. Click `Generate overlay and CTA` for those pins.
5. Go to `/admin/emails` and generate promotional emails.
6. Generate email subjects.

## 9) Manual image workflow
1. Copy `Media_Prompt` from each pin row.
2. Generate image in Nano Banana.
3. Finalize visual in Canva.
4. Upload image to Drive.
5. Paste Drive URL into `Media_URL`.

## 10) Customer logging check
- Submit a test signup from the public site.
- Confirm new lead in `Leads` and new record in `Customers_Evergreen` inside Supabase storage.

## 11) Vercel preview deploy prep
```bash
git status -sb
npm run build
npm test
```
Then follow `docs/vercel-preview-runbook.md`.
