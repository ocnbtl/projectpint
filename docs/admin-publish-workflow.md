# Admin Publish Workflow

## Goal
Use the admin command center as the working surface, then push only human-approved rows into the public-facing system.

## Current Pipeline
1. Draft content in evergreen tables under `/admin`.
2. Manually review and edit the rows.
3. Mark rows ready by setting `Workflow_Status`:
- Blogs and guides: `approved`
- Pins: `approved`
4. Run explicit publish/sync actions from admin.
5. Public site and export flows consume the evergreen output directly.

## Actual Operator Workflow

## 1) Blogs
- Open `/admin/blogs`.
- Generate blogs by area.
- Edit `Blog_Title`, `Blog_Keywords`, and `Blog_Content`.
- Set `Workflow_Status` to `approved` for rows ready to go live.
- Click `Publish approved blogs`.

Result:
- Approved rows are marked live in `Blogs_Evergreen`.
- Public `/blog/*` routes read that evergreen data directly.
- Blog rows move to `Workflow_Status=published`.

## 2) Guides
- Open `/admin/guides`.
- Generate guides by area.
- Edit `Guide_Title`, `Guide_Keywords`, and `Guide_Content`.
- Set `Workflow_Status` to `approved`.
- Click `Publish approved guides`.

Result:
- Approved rows are marked live in `Guides_Evergreen`.
- `Guide_URL` is stabilized as `/guides/<slug>`.
- Guide rows move to `Workflow_Status=published`.

Note:
- Public-facing guides now ship through `/guides/*`.
- `/micro/*` remains only as a compatibility redirect.

## 3) Pins
- Open `/admin/pins`.
- Generate pins after blogs and guides exist.
- Generate overlay and CTA copy.
- Edit copy as needed.
- Generate visuals manually in Nano Banana and polish in Canva.
- Fill `Media_URL`.
- Set `Workflow_Status` to `approved`.
- Click `Prepare approved pins for export`.

Result:
- Approved rows stay in `Pins_Evergreen`.
- Destination paths and UTM URLs are normalized directly on the evergreen rows.
- `Prepared_For_Export_At` is recorded for the batch.
- Pin rows move to `queued` unless `Pin_URL` is already present, in which case they move to `posted`.

## 4) Manual Posting
- Download the CSV from `/api/admin/exports/pins`.
- Post pins manually on Pinterest.
- Paste the live Pinterest URL into `Pin_URL`.
- Re-run `Prepare approved pins for export` if you want the queue/export state refreshed.

## What Stays Manual By Design
- Final image generation
- Canva finishing
- Pinterest posting
- Human approval before publish/export actions

## What Is Still Transitional
- Some legacy CLI/report tooling still reads compatibility datasets.
- The live website and admin workflow now read/write evergreen Supabase tables directly.
