# Legacy Sheets Reference

Google Sheets is no longer the primary hosted storage path for Project Pint.

Current source of truth for hosted app/admin runtime:
- `docs/supabase-schema.md`
- `supabase/schema.sql`

More specifically:
- command-center datasets now use dedicated Supabase tables
- legacy bridge datasets still use compatibility storage during transition

Why this file still exists:
- legacy CLI compatibility
- historical tab naming reference
- transition documentation while old 6-pillar/CLI paths still coexist with the evergreen admin model

The dataset names themselves still matter:
- `Content_Pins`
- `Blog_Posts`
- `URL_Inventory`
- `Assets`
- `Experiments`
- `Metrics_Weekly`
- `Leads`
- `Products`
- `Product_Ideas`
- `Governance`
- `Pins_Evergreen`
- `Blogs_Evergreen`
- `Guides_Evergreen`
- `Emails_Evergreen`
- `Customers_Evergreen`
- `Products_Evergreen`
