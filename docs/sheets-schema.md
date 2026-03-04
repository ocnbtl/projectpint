# Google Sheets Source-of-Truth Schema

Project Pint now uses a dual-layer model:
1. Legacy operational tabs (kept for CLI/report compatibility)
2. Evergreen command-center tabs (primary day-to-day workflow)

## Legacy Tabs

### 1) Content_Pins
`Content_ID, Created_At, Status, Hook_Class, Destination_Intent, Pillar, Topic, Destination_URL, Title, Caption_1, Caption_2, Caption_3, Description_With_Hashtags, Overlay_1, Overlay_2, Has_Text_Overlay, Primary_CTA, Visual_Preset, Image_Prompt, UTM_URL, Quality_Score, Quality_Flags, AutoFixSuggestions, Hook_Class_Uniqueness_Flag, Intent_Balance_Flag, Visual_Risk_Flags, Naturalness_Flag, Human_Approved, Scheduled_At, Posted_At`

### 2) Blog_Posts
`Blog_ID, Slug, Title, Pillar, Keyword_Target, Outline, Draft_Markdown, Internal_Links, CTA_Block, Status, Human_Approved, Published_At, Ad_Enabled, Contains_Affiliate_Links, Affiliate_Disclosure_Required`

### 3) URL_Inventory
`URL_ID, URL, Type, Pillar, Status, Last_Posted_At, Cooldown_Hours, Destination_Intent_Default, Priority`

### 4) Assets
`Asset_ID, Type, Drive_URL, Local_Path, Prompt_Preset, Prompt_Text, Status, Linked_Content_ID, Quality_Notes`

### 5) Experiments
`Experiment_ID, Week_Start, Hypothesis, Primary_Metric, Secondary_Metric, Success_Threshold, Status, Result_Summary`

### 6) Metrics_Weekly
`Week_Start, Content_ID, URL, Impressions, Saves, Pin_Clicks, Outbound_Clicks, CTR, Signup_Events, Affiliate_Clicks, Product_CTA_Clicks, Pageviews, RPM, Notes`

### 7) Leads
`Lead_ID, Email, Created_At, Source_URL, Pillar_Interest, Plant_Light, Plant_Humidity, Plant_Space, Klaviyo_Profile_ID, Consent_Text`

### 8) Products
`Product_ID, Name, Type, Status, Price_USD, Segment, Problem_Solved, Landing_URL, Email_Flow_Status, Supporting_Content_Status, Last_Updated`

### 9) Product_Ideas
`Idea_ID, Month, Name, Segment, Evidence, Differentiation, MVP_Scope, Pricing_Hypothesis, Upsell_Path, Recommended, Human_Approved`

### 10) Governance
`Entry_ID, Timestamp, Version, Section, Change_Summary, Reason, Approved_By, Content_Bible_Snapshot`

## Evergreen Command-Center Tabs

### Pins_Evergreen
`Pin_ID, Pin_Publish_Date, Pin_Publish_Time, Content_Area, Destination, Blog_ID, Media_Prompt, Media_URL, Pin_Overlay, Pin_Caption, Pin_CTA, Pin_URL, UTM_URL`

### Blogs_Evergreen
`Blog_ID, Blog_Publish_Date, Blog_Publish_Time, Content_Area, Blog_URL, Blog_Title, Blog_Keywords, Blog_Content, Related_Pins`

### Guides_Evergreen
`Guide_ID, Guide_Publish_Date, Guide_Publish_Time, Content_Area, Blog_ID, Guide_URL, Guide_Title, Guide_Keywords, Guide_Content, Related_Pins`

### Emails_Evergreen
`Email_ID, Email_Publish_Date, Email_Publish_Time, Content_Area, Blog_ID, Email_Subject, Email_Content`

### Customers_Evergreen
`User_ID, User_Email, User_Date_Email, User_Time_Email, Content_Area, Purchases`

### Products_Evergreen
`Product_ID, Product_Date, Product_Sales, Product_Revenue, Product_Link, Blog_ID, Guide_ID`

## Content_Area Values (Evergreen)
- Plants
- Mirror
- Storage
- Lighting
- Shower
- Renter
- DIY
- ExtremeBudget
