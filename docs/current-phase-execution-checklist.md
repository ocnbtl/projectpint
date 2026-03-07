# Current Phase Execution Checklist

## Goal
Stabilize and operationalize the new admin command-center workflow for pins, blogs, guides, emails, customers, and products.

## A. Platform Setup
1. Confirm local build/test:
- `npm run build`
- `npm test`

2. Confirm environment values:
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `STORAGE_MODE=supabase`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- Klaviyo vars (if live sync)

3. Confirm admin access:
- open `/admin/login`
- log in with `ADMIN_PASSWORD`

## B. Command-Center Validation
1. `/admin/blogs`
- Generate blogs by area.
- Generate blog titles and keywords.
- Set `Workflow_Status=approved` on ready rows.
- Publish approved blogs.
- Save and verify rows.

2. `/admin/guides`
- Generate guides by area.
- Generate guide titles and keywords.
- Update related pins.
- Set `Workflow_Status=approved` on ready rows.
- Publish approved guides.
- Save and verify rows.

3. `/admin/pins`
- Generate 25 pins.
- Generate overlay and CTA.
- Add media URLs after manual visual work.
- Set `Workflow_Status=approved` on ready rows.
- Prepare approved pins for export.
- Download the approved pins CSV if needed.

4. `/admin/emails`
- Generate promotional emails by area counts.
- Generate email subjects.
- Save.

5. `/admin/customers`
- Submit test signup on public site.
- Confirm row appears in `customers_evergreen`.

6. `/admin/products`
- Run `Update stats`.
- Confirm sales/revenue/blog/guide linkage fields update.

## C. Manual Visual + Posting Pass
1. For each pin row:
- Copy `Media_Prompt` -> generate image in Nano Banana.
- Polish image in Canva.
- Upload to Drive and fill `Media_URL`.

2. Publish pins and paste `Pin_URL`.

3. Save final table state.

## D. Production Readiness
1. Run pre-deploy checks:
- `git status -sb`
- `npm run build`
- `npm test`

2. Deploy preview and smoke test:
- `/`
- `/start-here`
- `/hub`
- `/blog`
- `/admin/login`
- `/legal/privacy`, `/legal/terms`, `/legal/affiliate-disclosure`

3. Confirm compliance copy and disclosures are intact.

## Completion Criteria
- Admin command center fully usable for weekly operations.
- 8 content areas live in strategy and hub surfaces.
- Signup writes to leads and customers evergreen.
- One full end-to-end batch generated, published from evergreen, exported, and QA-checked.
