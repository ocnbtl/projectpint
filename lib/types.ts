export type HookClass =
  | "BeforeAfter"
  | "Checklist"
  | "MistakesToAvoid"
  | "QuickWin"
  | "BudgetBreakdown"
  | "StepByStepHowTo"
  | "ProductRoundup"
  | "PlantPicker"
  | "RenterHack"
  | "SmallSpaceTrick"
  | "StylingFormula"
  | "MythBuster";

export type DestinationIntent = "Inspire" | "Teach" | "Solve" | "Shop" | "Subscribe";

export type ContentArea = "Plants" | "Mirror" | "Storage" | "Lighting" | "Shower" | "Renter" | "DIY" | "ExtremeBudget";

export type Pillar =
  | "RenterFriendly"
  | "BudgetDIY"
  | "SmallSpace"
  | "StorageOrganization"
  | "Styling"
  | "PlantsBiophilic";

export type UrlType = "blog" | "hub" | "start" | "lead" | "product" | "micro" | "affiliate";

export interface PinDraft {
  Content_ID: string;
  Created_At: string;
  Status: "draft" | "approved" | "scheduled" | "posted";
  Hook_Class: HookClass;
  Destination_Intent: DestinationIntent;
  Pillar: Pillar;
  Topic: string;
  Destination_URL: string;
  Title: string;
  Caption_1: string;
  Caption_2: string;
  Caption_3: string;
  Description_With_Hashtags: string;
  Overlay_1: string;
  Overlay_2: string;
  Has_Text_Overlay: boolean;
  Primary_CTA: string;
  Visual_Preset: string;
  Image_Prompt: string;
  UTM_URL: string;
  Quality_Score: number;
  Quality_Flags: string[];
  AutoFixSuggestions: string[];
  Hook_Class_Uniqueness_Flag: boolean;
  Intent_Balance_Flag: boolean;
  Visual_Risk_Flags: string[];
  Naturalness_Flag: boolean;
  Human_Approved: boolean;
  Scheduled_At: string;
  Posted_At: string;
}

export interface BlogDraft {
  Blog_ID: string;
  Slug: string;
  Title: string;
  Pillar: Pillar;
  Keyword_Target: string;
  Outline: string;
  Draft_Markdown: string;
  Internal_Links: string;
  CTA_Block: string;
  Status: "draft" | "approved" | "published";
  Human_Approved: boolean;
  Published_At: string;
  Ad_Enabled: boolean;
  Contains_Affiliate_Links: boolean;
  Affiliate_Disclosure_Required: boolean;
}

export interface UrlInventoryItem {
  URL_ID: string;
  URL: string;
  Type: UrlType;
  Pillar: Pillar;
  Status: "published" | "disabled";
  Last_Posted_At: string;
  Cooldown_Hours: number;
  Destination_Intent_Default: DestinationIntent;
  Priority: number;
}

export interface ProductRow {
  Product_ID: string;
  Name: string;
  Type: "paid" | "lead_magnet" | "upgrade";
  Status: "approved" | "idea" | "in_progress";
  Price_USD: string;
  Segment: string;
  Problem_Solved: string;
  Landing_URL: string;
  Email_Flow_Status: string;
  Supporting_Content_Status: string;
  Last_Updated: string;
}

export interface ProductIdea {
  Idea_ID: string;
  Month: string;
  Name: string;
  Segment: string;
  Evidence: string;
  Differentiation: string;
  MVP_Scope: string;
  Pricing_Hypothesis: string;
  Upsell_Path: string;
  Recommended: "yes" | "no";
  Human_Approved: boolean;
}

export interface LinterResult {
  Quality_Score: number;
  Quality_Flags: string[];
  AutoFixSuggestions: string[];
  Hook_Class_Uniqueness_Flag: boolean;
  Intent_Balance_Flag: boolean;
  Visual_Risk_Flags: string[];
  Naturalness_Flag: boolean;
}
