# Pin Production Workflow (Current: Manual Visuals + Automated Copy)

## Objective
Generate 25 Pinterest-ready pins with:
- destination mapping (blog or guide)
- prompt, caption, overlay, CTA, and UTM
- manual visual generation and final polish
- clean row tracking from draft to posted

## Where Work Happens
- Admin command center: `/admin/pins`
- Data tab: `Pins_Evergreen`

## Step-by-Step

## 1) Generate a new batch
In `/admin/pins`, click:
- `Generate new pins`

This fills:
- `Pin_ID`
- `Pin_Publish_Date`
- `Pin_Publish_Time`
- `Content_Area`
- `Destination`
- `Blog_ID`
- `Media_Prompt`
- `Pin_Caption`
- `UTM_URL`

Left blank intentionally:
- `Media_URL`
- `Pin_Overlay`
- `Pin_CTA`
- `Pin_URL`

## 2) Generate overlay and CTA
Click:
- `Generate overlay and CTA`

This fills `Pin_Overlay` and `Pin_CTA` for the latest 25 rows.

## 3) Generate visuals manually
For each pin row:
1. Copy `Media_Prompt`.
2. Paste into Nano Banana.
3. Finalize style in Canva.
4. Upload final image to Drive.
5. Paste link into `Media_URL`.

## 4) Publish pins
After posting each pin on Pinterest:
- Paste live post URL into `Pin_URL`.

## 5) Save and verify
- Click `Save changes`.
- Spot-check that each posted row has:
  - `Media_URL`
  - `Pin_URL`
  - correct `UTM_URL`

## Copy Rules (Enforced by Strategy)
- Caption sounds human and natural.
- No hashtags in evergreen pin captions.
- No dash characters in generated copy style.
- Caption target length: roughly 150 to 300 characters.

## Suggested QA Before Posting
- Hook is strong in first line.
- Overlay text is readable at mobile size.
- CTA matches destination type (guide vs blog).
- UTM URL opens correct destination.
- Image and caption both match the selected content area.
