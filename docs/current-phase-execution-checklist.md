# Current Phase Execution Checklist (Reality to Revenue)

## Scope
This checklist covers the immediate execution phase after repo setup: credential wiring, first validated run, first assisted publish cycle, and weekly loop activation.

## Ownership Legend
- `Codex`: tasks I can execute in-repo.
- `You`: tasks requiring account access, browser actions, billing, or external approvals.

## A. Credential and Platform Setup (You)
1. Create a Google Sheet for Project Pint source-of-truth.
- Name suggestion: `Project Pint - Source of Truth`.
- Create tabs exactly: `Content_Pins`, `Blog_Posts`, `URL_Inventory`, `Assets`, `Experiments`, `Metrics_Weekly`, `Leads`, `Products`, `Product_Ideas`, `Governance`.

2. Create a Google Cloud service account.
- Google Cloud Console -> Service Accounts -> Create account.
- Generate JSON key (download once).

3. Share the Google Sheet with service-account email.
- Role: Editor.
- This is mandatory for `SHEETS_MODE=google` writes.

4. Add Google env vars in local `.env`.
- `SHEETS_MODE=google`
- `GOOGLE_SHEETS_ID=<sheet_id_from_url>`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account-email>`
- `GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
- Important: keep escaped `\n` line breaks in `.env`.

5. Create/confirm Klaviyo list and private API key.
- Create one list for lead capture.
- Capture:
  - `KLAVIYO_PRIVATE_API_KEY`
  - `KLAVIYO_LIST_ID`

6. Add remaining env vars in local `.env`.
- `ADMIN_PASSWORD=<strong_password>`
- `NEXT_PUBLIC_SITE_URL=<your_domain_or_vercel_url>`
- plus Klaviyo vars from step 5.

7. Add same env vars in Vercel project settings.
- Vercel -> Project -> Settings -> Environment Variables.
- Add to Production + Preview as needed.

## B. In-Repo Validation Run (Codex + You)
1. Install dependencies.
- Command: `npm install`
- Owner: You (one-time machine setup).

2. Seed and generate operating artifacts.
- Commands:
  - `npm run init_sheets`
  - `npm run weekly_ops_info`
  - `npm run monthly_review`
  - `npm run yearly_review`
- Owner: Codex can run these once env is ready.

3. Run test suite.
- Command: `npm test`
- Owner: Codex.

4. Validate Google mode read/write.
- Command sequence:
  - `SHEETS_MODE=google npm run init_sheets`
  - `SHEETS_MODE=google npm run weekly_ops_info`
- Owner: Codex (after your credentials are present).

## C. First Assisted Publishing Week (You)
1. Review packet and approve selected rows.
- Open `review_pack.html`.
- Approve 3 blog drafts and 25 pins (or your chosen subset).

2. Publish blogs.
- Use CLI approval/publish commands or site/admin workflow.
- Confirm published pages are live and have legal/disclosure compliance.

3. Prepare and post pins.
- Run export workflow:
  - `npm run prepare_overlay_jobs`
  - execute generated overlay script on raw images
  - `npm run export_pinterest_bulk_csv`
- Upload via Pinterest bulk uploader or manual posting pack.

4. Enforce hard constraints manually during first cycle.
- Never post same destination URL inside 24h.
- Never post pins pointing to draft/unpublished URLs.
- Keep assisted approval gate active.

## D. Metrics and Feedback Loop (You + Codex)
1. Export Pinterest metrics weekly and ingest.
- Command: `npm run ingest_pinterest_metrics_csv -- --file=<path_to_csv>`

2. Generate winner analysis and next packet.
- Commands:
  - `npm run analyze_winners`
  - `npm run weekly_ops_info`

3. Apply recommendations to next week before posting.
- Use `weekly_review.md` + `weekly_ops_info.md` as the operating source.

## E. Automation Activation (Codex + You)
1. Enable GitHub Actions in repo settings.
- Owner: You.

2. Add secrets for workflows (if needed).
- Owner: You.

3. Confirm weekly/monthly/yearly workflow runs produce artifacts.
- Owner: Codex validates outputs in repo; You confirm GitHub Actions run health.

## Fast Completion Criteria
- Google + Klaviyo + Vercel envs set.
- `npm test` passes.
- `weekly_ops_info.md` and packet files regenerate cleanly.
- First 25-pin week published with no URL cooldown violations.
- Metrics imported and at least one winner-analysis loop completed.
