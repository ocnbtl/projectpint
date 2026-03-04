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
- `NEXT_PUBLIC_SITE_URL`
- `SHEETS_MODE` (`local` or `google`)
- Google Sheets vars if using `google`
- Klaviyo vars if using live email sync

## 4) Change admin password (any time)
1. Open `.env.local`
2. Update `ADMIN_PASSWORD`
3. Restart dev server

## 5) Verify app health
```bash
npm run build
npm test
```

## 6) Start local app
```bash
npm run dev -- -p 3001 -H localhost
```
Open:
- Public site: `http://localhost:3001`
- Admin login: `http://localhost:3001/admin/login`

## 7) First command-center run
1. Go to `/admin/blogs` and generate new blogs by area.
2. Go to `/admin/guides` and generate new guides by area.
3. Go to `/admin/pins` and generate 25 new pins.
4. Click `Generate overlay and CTA` for those pins.
5. Go to `/admin/emails` and generate promotional emails.
6. Generate email subjects.

## 8) Manual image workflow
1. Copy `Media_Prompt` from each pin row.
2. Generate image in Nano Banana.
3. Finalize visual in Canva.
4. Upload image to Drive.
5. Paste Drive URL into `Media_URL`.

## 9) Customer logging check
- Submit a test signup from the public site.
- Confirm new lead in `Leads` and new record in `Customers_Evergreen`.

## 10) Vercel preview deploy prep
```bash
git status -sb
npm run build
npm test
```
Then follow `docs/vercel-preview-runbook.md`.
