# Project Pint Setup Guide (Non-Engineer)

## 1) Install tools
- Install Node.js 25+.
- Open Terminal.

## 2) Open project folder
- `cd "/Users/ocean/Documents/Project Pint"`

## 3) Install dependencies
- `npm install`

## 4) Configure environment
- `cp .env.example .env.local`
- Edit `.env.local`:
  - `ADMIN_PASSWORD` (required)
  - `KLAVIYO_PRIVATE_API_KEY` and `KLAVIYO_LIST_ID` (optional for live list sync)

## 5) Generate Week 1 baseline
Run in order:
1. `npm run init_project`
2. `npm run init_sheets`
3. `npm run weekly_ops_info`

## 6) Review and approve
- Open `review_pack.html`
- Review `weekly_review.md`
- Review `weekly_ops_info.md`
- Approve blog rows and pin rows before publish/export

## 7) Start website
- `npm run dev`
- Open:
  - Public site: `http://localhost:3000`
  - Admin: `http://localhost:3000/admin`

## 8) Weekly operations
1. `npm run weekly_review`
2. `npm run weekly_ops_info`
3. Approve pins/blogs
4. `npm run export_pinterest_bulk_csv`
5. Optional: `npm run export_manual_post_pack`

## 9) Monthly operations
- `npm run monthly_review`
- `npm run product_opportunity_report`

## 10) Yearly operations
- `npm run yearly_review`
