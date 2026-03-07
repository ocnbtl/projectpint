# Supabase Storage Schema

## Dedicated runtime tables

These are now the primary live tables for the admin command center and signup storage:

Admin mapping:
- `/admin/pins` -> `pins_evergreen`
- `/admin/blogs` -> `blogs_evergreen`
- `/admin/guides` -> `guides_evergreen`
- `/admin/emails` -> `emails_evergreen`
- `/admin/customers` -> `customers_evergreen`
- `/admin/products` -> `products_evergreen`
- public signup -> `leads` and `customers_evergreen`

### `pins_evergreen`
- `Pin_ID` primary key
- `Pin_Publish_Date`
- `Pin_Publish_Time`
- `Content_Area`
- `Workflow_Status`
- `Destination`
- `Blog_ID`
- `Media_Prompt`
- `Media_URL`
- `Pin_Overlay`
- `Pin_Caption`
- `Pin_CTA`
- `Pin_URL`
- `UTM_URL`
- `Prepared_For_Export_At`
- `updated_at`

### `blogs_evergreen`
- `Blog_ID` primary key
- `Blog_Publish_Date`
- `Blog_Publish_Time`
- `Content_Area`
- `Workflow_Status`
- `Blog_URL`
- `Blog_Title`
- `Blog_Keywords`
- `Blog_Content`
- `Related_Pins`
- `Published_To_Public_At`
- `updated_at`

### `guides_evergreen`
- `Guide_ID` primary key
- `Guide_Publish_Date`
- `Guide_Publish_Time`
- `Content_Area`
- `Workflow_Status`
- `Blog_ID`
- `Guide_URL`
- `Guide_Title`
- `Guide_Keywords`
- `Guide_Content`
- `Related_Pins`
- `Published_To_Public_At`
- `updated_at`

### `emails_evergreen`
- `Email_ID` primary key
- `Email_Publish_Date`
- `Email_Publish_Time`
- `Content_Area`
- `Blog_ID`
- `Email_Subject`
- `Email_Content`
- `updated_at`

### `customers_evergreen`
- `User_ID` primary key
- `User_Email`
- `User_Date_Email`
- `User_Time_Email`
- `Content_Area`
- `Purchases`
- `updated_at`

### `products_evergreen`
- `Product_ID` primary key
- `Product_Date`
- `Product_Sales`
- `Product_Revenue`
- `Product_Link`
- `Blog_ID`
- `Guide_ID`
- `updated_at`

### `leads`
- `Lead_ID` primary key
- `Email`
- `Created_At`
- `Source_URL`
- `Pillar_Interest`
- `Plant_Light`
- `Plant_Humidity`
- `Plant_Space`
- `Klaviyo_Profile_ID`
- `Consent_Text`
- `updated_at`

## Why this split
This is the live website and command-center storage model. Legacy CLI/report code may still exist in the repo, but it is no longer the production data path.
