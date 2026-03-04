export const COMMAND_CENTER_COLUMNS = {
  pins: [
    "Pin_ID",
    "Pin_Publish_Date",
    "Pin_Publish_Time",
    "Content_Area",
    "Destination",
    "Blog_ID",
    "Media_Prompt",
    "Media_URL",
    "Pin_Overlay",
    "Pin_Caption",
    "Pin_CTA",
    "Pin_URL",
    "UTM_URL"
  ],
  blogs: [
    "Blog_ID",
    "Blog_Publish_Date",
    "Blog_Publish_Time",
    "Content_Area",
    "Blog_URL",
    "Blog_Title",
    "Blog_Keywords",
    "Blog_Content",
    "Related_Pins"
  ],
  guides: [
    "Guide_ID",
    "Guide_Publish_Date",
    "Guide_Publish_Time",
    "Content_Area",
    "Blog_ID",
    "Guide_URL",
    "Guide_Title",
    "Guide_Keywords",
    "Guide_Content",
    "Related_Pins"
  ],
  emails: [
    "Email_ID",
    "Email_Publish_Date",
    "Email_Publish_Time",
    "Content_Area",
    "Blog_ID",
    "Email_Subject",
    "Email_Content"
  ],
  customers: ["User_ID", "User_Email", "User_Date_Email", "User_Time_Email", "Content_Area", "Purchases"],
  products: ["Product_ID", "Product_Date", "Product_Sales", "Product_Revenue", "Product_Link", "Blog_ID", "Guide_ID"]
} as const;
