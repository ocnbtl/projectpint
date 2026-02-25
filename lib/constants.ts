import type { DestinationIntent, HookClass, Pillar } from "./types.ts";

export const HOOK_CLASSES: HookClass[] = [
  "BeforeAfter",
  "Checklist",
  "MistakesToAvoid",
  "QuickWin",
  "BudgetBreakdown",
  "StepByStepHowTo",
  "ProductRoundup",
  "PlantPicker",
  "RenterHack",
  "SmallSpaceTrick",
  "StylingFormula",
  "MythBuster"
];

export const DESTINATION_INTENTS: DestinationIntent[] = ["Inspire", "Teach", "Solve", "Shop", "Subscribe"];

export const PILLARS: Pillar[] = [
  "RenterFriendly",
  "BudgetDIY",
  "SmallSpace",
  "StorageOrganization",
  "Styling",
  "PlantsBiophilic"
];

export const TAB_HEADERS: Record<string, string[]> = {
  Content_Pins: [
    "Content_ID",
    "Created_At",
    "Status",
    "Hook_Class",
    "Destination_Intent",
    "Pillar",
    "Topic",
    "Destination_URL",
    "Title",
    "Caption_1",
    "Caption_2",
    "Caption_3",
    "Description_With_Hashtags",
    "Overlay_1",
    "Overlay_2",
    "Has_Text_Overlay",
    "Primary_CTA",
    "Visual_Preset",
    "Image_Prompt",
    "UTM_URL",
    "Quality_Score",
    "Quality_Flags",
    "AutoFixSuggestions",
    "Hook_Class_Uniqueness_Flag",
    "Intent_Balance_Flag",
    "Visual_Risk_Flags",
    "Naturalness_Flag",
    "Human_Approved",
    "Scheduled_At",
    "Posted_At"
  ],
  Blog_Posts: [
    "Blog_ID",
    "Slug",
    "Title",
    "Pillar",
    "Keyword_Target",
    "Outline",
    "Draft_Markdown",
    "Internal_Links",
    "CTA_Block",
    "Status",
    "Human_Approved",
    "Published_At",
    "Ad_Enabled",
    "Contains_Affiliate_Links",
    "Affiliate_Disclosure_Required"
  ],
  URL_Inventory: [
    "URL_ID",
    "URL",
    "Type",
    "Pillar",
    "Status",
    "Last_Posted_At",
    "Cooldown_Hours",
    "Destination_Intent_Default",
    "Priority"
  ],
  Assets: [
    "Asset_ID",
    "Type",
    "Drive_URL",
    "Local_Path",
    "Prompt_Preset",
    "Prompt_Text",
    "Status",
    "Linked_Content_ID",
    "Quality_Notes"
  ],
  Experiments: [
    "Experiment_ID",
    "Week_Start",
    "Hypothesis",
    "Primary_Metric",
    "Secondary_Metric",
    "Success_Threshold",
    "Status",
    "Result_Summary"
  ],
  Metrics_Weekly: [
    "Week_Start",
    "Content_ID",
    "URL",
    "Impressions",
    "Saves",
    "Pin_Clicks",
    "Outbound_Clicks",
    "CTR",
    "Signup_Events",
    "Affiliate_Clicks",
    "Product_CTA_Clicks",
    "Pageviews",
    "RPM",
    "Notes"
  ],
  Leads: [
    "Lead_ID",
    "Email",
    "Created_At",
    "Source_URL",
    "Pillar_Interest",
    "Plant_Light",
    "Plant_Humidity",
    "Plant_Space",
    "Klaviyo_Profile_ID",
    "Consent_Text"
  ],
  Products: [
    "Product_ID",
    "Name",
    "Type",
    "Status",
    "Price_USD",
    "Segment",
    "Problem_Solved",
    "Landing_URL",
    "Email_Flow_Status",
    "Supporting_Content_Status",
    "Last_Updated"
  ],
  Product_Ideas: [
    "Idea_ID",
    "Month",
    "Name",
    "Segment",
    "Evidence",
    "Differentiation",
    "MVP_Scope",
    "Pricing_Hypothesis",
    "Upsell_Path",
    "Recommended",
    "Human_Approved"
  ],
  Governance: ["Entry_ID", "Timestamp", "Version", "Section", "Change_Summary", "Reason", "Approved_By", "Content_Bible_Snapshot"]
};
