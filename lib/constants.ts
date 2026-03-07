import type { ContentArea, DestinationIntent, HookClass, Pillar } from "./types.ts";

export const COMMAND_CENTER_CONTENT_AREAS: ContentArea[] = [
  "Plants",
  "Mirror",
  "Storage",
  "Lighting",
  "Shower",
  "Renter",
  "DIY",
  "ExtremeBudget"
] as const;

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

const CONTENT_AREA_LABELS: Record<ContentArea, string> = {
  Plants: "Plants",
  Mirror: "Mirror",
  Storage: "Storage",
  Lighting: "Lighting",
  Shower: "Shower",
  Renter: "Renter",
  DIY: "DIY",
  ExtremeBudget: "Extreme Budget"
};

const LEGACY_PILLAR_LABELS: Record<Pillar, string> = {
  RenterFriendly: "Renter-Friendly",
  BudgetDIY: "Budget DIY",
  SmallSpace: "Small Space",
  StorageOrganization: "Storage & Organization",
  Styling: "Styling",
  PlantsBiophilic: "Plants & Biophilic"
};

export const CONTENT_AREA_TO_LEGACY_PILLARS = {
  Plants: ["PlantsBiophilic"],
  Mirror: ["Styling"],
  Storage: ["StorageOrganization"],
  Lighting: ["Styling"],
  Shower: ["SmallSpace"],
  Renter: ["RenterFriendly"],
  DIY: ["BudgetDIY"],
  ExtremeBudget: ["BudgetDIY"]
} as const satisfies Record<ContentArea, readonly Pillar[]>;

export const LEGACY_PILLAR_TO_CONTENT_AREAS = {
  RenterFriendly: ["Renter"],
  BudgetDIY: ["DIY", "ExtremeBudget"],
  SmallSpace: ["Shower"],
  StorageOrganization: ["Storage"],
  Styling: ["Mirror", "Lighting"],
  PlantsBiophilic: ["Plants"]
} as const satisfies Record<Pillar, readonly ContentArea[]>;

function taxonomyKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildAliasEntries(): Array<[string, ContentArea]> {
  const entries: Array<[string, ContentArea]> = [];
  for (const area of COMMAND_CENTER_CONTENT_AREAS) {
    entries.push([taxonomyKey(area), area]);
    entries.push([taxonomyKey(contentAreaLabel(area)), area]);
    entries.push([taxonomyKey(contentAreaSlug(area)), area]);
  }
  for (const pillar of PILLARS) {
    entries.push([taxonomyKey(pillar), primaryContentAreaForPillar(pillar)]);
    entries.push([taxonomyKey(pillarLabel(pillar)), primaryContentAreaForPillar(pillar)]);
  }
  return entries;
}

const CONTENT_AREA_ALIASES = new Map<string, ContentArea>(buildAliasEntries());

export function isContentArea(value: string): value is ContentArea {
  return COMMAND_CENTER_CONTENT_AREAS.includes(value as ContentArea);
}

export function isLegacyPillar(value: string): value is Pillar {
  return PILLARS.includes(value as Pillar);
}

export function contentAreaLabel(area: ContentArea): string {
  return CONTENT_AREA_LABELS[area];
}

export function contentAreaSlug(area: ContentArea): string {
  return area === "ExtremeBudget" ? "extreme-budget" : area.toLowerCase();
}

export function pillarLabel(pillar: Pillar): string {
  return LEGACY_PILLAR_LABELS[pillar];
}

export function normalizeLegacyPillar(value: string): Pillar | null {
  const normalized = taxonomyKey(value.trim());
  if (!normalized) return null;
  return (
    PILLARS.find((pillar) => taxonomyKey(pillar) === normalized || taxonomyKey(pillarLabel(pillar)) === normalized) ?? null
  );
}

export function contentAreasForPillar(pillar: Pillar | string): ContentArea[] {
  const normalized = typeof pillar === "string" ? normalizeLegacyPillar(pillar) : pillar;
  return normalized ? [...LEGACY_PILLAR_TO_CONTENT_AREAS[normalized]] : [];
}

export function primaryContentAreaForPillar(pillar: Pillar | string): ContentArea {
  return contentAreasForPillar(pillar)[0] ?? "DIY";
}

export function legacyPillarsForArea(area: ContentArea | string): Pillar[] {
  const normalized = typeof area === "string" ? normalizeContentArea(area) : area;
  return normalized ? [...CONTENT_AREA_TO_LEGACY_PILLARS[normalized]] : [];
}

export function primaryLegacyPillarForArea(area: ContentArea | string): Pillar {
  return legacyPillarsForArea(area)[0] ?? "BudgetDIY";
}

export function normalizeContentArea(value: string): ContentArea | null {
  const normalized = taxonomyKey(value.trim());
  if (!normalized) return null;
  return CONTENT_AREA_ALIASES.get(normalized) ?? null;
}

export function normalizeContentAreas(values: Iterable<string>): ContentArea[] {
  const normalized = new Set<ContentArea>();
  for (const rawValue of values) {
    for (const value of String(rawValue)
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean)) {
      const pillarAreas = contentAreasForPillar(value);
      if (pillarAreas.length > 0) {
        for (const area of pillarAreas) normalized.add(area);
        continue;
      }
      const area = normalizeContentArea(value);
      if (area) normalized.add(area);
    }
  }
  return [...normalized];
}

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
  Governance: ["Entry_ID", "Timestamp", "Version", "Section", "Change_Summary", "Reason", "Approved_By", "Content_Bible_Snapshot"],
  Pins_Evergreen: [
    "Pin_ID",
    "Pin_Publish_Date",
    "Pin_Publish_Time",
    "Content_Area",
    "Workflow_Status",
    "Destination",
    "Blog_ID",
    "Media_Prompt",
    "Media_URL",
    "Pin_Overlay",
    "Pin_Caption",
    "Pin_CTA",
    "Pin_URL",
    "UTM_URL",
    "Prepared_For_Export_At"
  ],
  Blogs_Evergreen: [
    "Blog_ID",
    "Blog_Publish_Date",
    "Blog_Publish_Time",
    "Content_Area",
    "Workflow_Status",
    "Blog_URL",
    "Blog_Title",
    "Blog_Keywords",
    "Blog_Content",
    "Related_Pins",
    "Published_To_Public_At"
  ],
  Guides_Evergreen: [
    "Guide_ID",
    "Guide_Publish_Date",
    "Guide_Publish_Time",
    "Content_Area",
    "Workflow_Status",
    "Blog_ID",
    "Guide_URL",
    "Guide_Title",
    "Guide_Keywords",
    "Guide_Content",
    "Related_Pins",
    "Published_To_Public_At"
  ],
  Emails_Evergreen: [
    "Email_ID",
    "Email_Publish_Date",
    "Email_Publish_Time",
    "Content_Area",
    "Blog_ID",
    "Email_Subject",
    "Email_Content"
  ],
  Customers_Evergreen: [
    "User_ID",
    "User_Email",
    "User_Date_Email",
    "User_Time_Email",
    "Content_Area",
    "Purchases"
  ],
  Products_Evergreen: ["Product_ID", "Product_Date", "Product_Sales", "Product_Revenue", "Product_Link", "Blog_ID", "Guide_ID"]
};
