import { COMMAND_CENTER_COLUMNS } from "./command-center-config";

export const ADMIN_TABLE_COLUMNS = {
  blogs: [
    "Blog_ID",
    "Blog_Publish_Date",
    "Content_Area",
    "Workflow_Status",
    "Blog_Title",
    "Blog_URL",
    "Blog_Keywords",
    "Quality_Score",
    "Related_Pins",
    "Published_To_Public_At",
    "Blog_Publish_Time",
    "Blog_Content",
    "Writer_Brief",
    "CTA_Target",
    "Quality_Checks"
  ],
  guides: [
    "Guide_ID",
    "Guide_Publish_Date",
    "Content_Area",
    "Workflow_Status",
    "Blog_ID",
    "Guide_Title",
    "Guide_URL",
    "Guide_Keywords",
    "Quality_Score",
    "Related_Pins",
    "Published_To_Public_At",
    "Guide_Publish_Time",
    "Guide_Content",
    "Writer_Brief",
    "CTA_Target",
    "Quality_Checks"
  ],
  pins: [
    "Pin_ID",
    "Pin_Publish_Date",
    "Content_Area",
    "Workflow_Status",
    "Destination",
    "Blog_ID",
    "Media_Prompt",
    "Pin_Overlay",
    "Pin_Caption",
    "Pin_CTA",
    "Prepared_For_Export_At",
    "Media_URL",
    "Pin_URL",
    "UTM_URL",
    "Pin_Publish_Time"
  ],
  emails: [
    "Email_ID",
    "Email_Publish_Date",
    "Content_Area",
    "Blog_ID",
    "Email_Subject",
    "Email_Content",
    "Email_Publish_Time"
  ],
  customers: [...COMMAND_CENTER_COLUMNS.customers],
  products: [...COMMAND_CENTER_COLUMNS.products]
} as const;

