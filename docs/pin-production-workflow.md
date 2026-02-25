# Pin Production Workflow (Low-Cost, Human-or-AI)

## Objective
Produce Pinterest-ready pins with:
- AI-generated image
- required text overlay rendered onto image
- title, description, hashtags, CTA
- policy and quality checks

## Cost-Minimized Stack
- Planning/metadata: existing CLI + local files (no additional cost).
- Image generation: use one of:
  - Local model pipeline (lowest recurring cost; highest setup effort).
  - Low-cost API generation (pay-per-image, easier setup).
- Overlay rendering: local open-source tooling (ImageMagick or Sharp).
- Export: existing CSV/manual pack commands.

## Base Creative Specs
- Aspect ratio target: 2:3 vertical.
- Keep overlay text inside safe margins (top and bottom clear zones).

## Workflow
1. Generate weekly planning content
- `npm run weekly_ops_info`
- Review `weekly_review.md` + `weekly_ops_info.md`.

2. Generate pin metadata
- `npm run generate_pin_week --n=25`
- Each pin has hook class, intent, overlays, CTA, description with hashtags.

3. Create images (human or AI)
- Use each pin's `Image_Prompt` and `Visual_Preset`.
- Save image paths in `Assets` tab (`Drive_URL` or `Local_Path`).

4. Render text overlay onto final image
- Required before approval/export.
- Generate command book: `npm run prepare_overlay_jobs`
- Overlay text source:
  - `Overlay_1` = primary stop-scroll headline
  - `Overlay_2` = secondary qualifier
- Keep high contrast and safe margins.

5. QA gates
- Copy QA: banned phrases, naturalness, CTA pressure, specificity.
- Visual QA: no logos/people/artifacts, readable overlays, realistic geometry.

6. Approval
- Human approves pin rows.

7. Export
- Bulk CSV: `npm run export_pinterest_bulk_csv`
- Manual pack: `npm run export_manual_post_pack`

## Role Separation (Critical)
- Overlay text: hook promise for visual stop-scroll.
- Title: search/discovery relevance.
- Description + hashtags: context + indexing + CTA.
- CTA: one explicit next action aligned to destination intent.

## Minimum QA Acceptance Criteria
- `Has_Text_Overlay = true`
- Overlay lengths in policy bounds
- No banned phrase flags
- `Quality_Score >= 80`
- No blocking visual risk flags

## Human-Only Fallback
If image automation fails:
1. Use the same `Overlay_1`/`Overlay_2` text manually in your editor.
2. Keep exact filename matching `Content_ID`.
3. Upload to Drive and update `Assets` row.
4. Proceed with normal export flow.
