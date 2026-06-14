import { randomUUID } from "node:crypto";
import {
  COMMAND_CENTER_CONTENT_AREAS,
  contentAreaLabel,
  normalizeContentArea,
  normalizeContentAreas
} from "./constants.ts";
import { summarizeContentQuality } from "./content-quality.ts";
import { loadRuntimeTab, saveRuntimeTab } from "./runtime-store.ts";
import {
  allowedCtaUrls,
  buildBlogPromptPack,
  buildGuidePromptPack,
  formatWriterBrief,
  NEWSLETTER_FALLBACKS
} from "./writer-prompts.ts";

export type CommandCenterArea = (typeof COMMAND_CENTER_CONTENT_AREAS)[number];
export type WorkflowStatus = "draft" | "approved" | "queued" | "published" | "posted";

export interface PinEvergreenRow {
  Pin_ID: string;
  Pin_Publish_Date: string;
  Pin_Publish_Time: string;
  Content_Area: CommandCenterArea | string;
  Workflow_Status: WorkflowStatus | string;
  Destination: string;
  Blog_ID: string;
  Media_Prompt: string;
  Media_URL: string;
  Pin_Overlay: string;
  Pin_Caption: string;
  Pin_CTA: string;
  Pin_URL: string;
  UTM_URL: string;
  Prepared_For_Export_At: string;
}

export interface BlogEvergreenRow {
  Blog_ID: string;
  Blog_Publish_Date: string;
  Blog_Publish_Time: string;
  Content_Area: CommandCenterArea | string;
  Workflow_Status: WorkflowStatus | string;
  Blog_URL: string;
  Blog_Title: string;
  Blog_Keywords: string;
  Blog_Content: string;
  Writer_Brief: string;
  CTA_Target: string;
  Quality_Score: string;
  Quality_Checks: string;
  Related_Pins: string;
  Published_To_Public_At: string;
}

export interface GuideEvergreenRow {
  Guide_ID: string;
  Guide_Publish_Date: string;
  Guide_Publish_Time: string;
  Content_Area: CommandCenterArea | string;
  Workflow_Status: WorkflowStatus | string;
  Blog_ID: string;
  Guide_URL: string;
  Guide_Title: string;
  Guide_Keywords: string;
  Guide_Content: string;
  Writer_Brief: string;
  CTA_Target: string;
  Quality_Score: string;
  Quality_Checks: string;
  Related_Pins: string;
  Published_To_Public_At: string;
}

export interface EmailEvergreenRow {
  Email_ID: string;
  Email_Publish_Date: string;
  Email_Publish_Time: string;
  Content_Area: CommandCenterArea | string;
  Blog_ID: string;
  Email_Subject: string;
  Email_Content: string;
}

export interface CustomerEvergreenRow {
  User_ID: string;
  User_Email: string;
  User_Date_Email: string;
  User_Time_Email: string;
  Content_Area: string;
  Purchases: string;
}

export interface ProductEvergreenRow {
  Product_ID: string;
  Product_Date: string;
  Product_Sales: string;
  Product_Revenue: string;
  Product_Link: string;
  Blog_ID: string;
  Guide_ID: string;
}

export interface AreaCounts {
  Plants: number;
  Mirror: number;
  Storage: number;
  Lighting: number;
  Shower: number;
  Renter: number;
  DIY: number;
  ExtremeBudget: number;
}

export const DEFAULT_AREA_COUNTS: AreaCounts = {
  Plants: 0,
  Mirror: 0,
  Storage: 0,
  Lighting: 0,
  Shower: 0,
  Renter: 0,
  DIY: 0,
  ExtremeBudget: 0
};

const TAB_MAP = {
  pins: "Pins_Evergreen",
  blogs: "Blogs_Evergreen",
  guides: "Guides_Evergreen",
  emails: "Emails_Evergreen",
  customers: "Customers_Evergreen",
  products: "Products_Evergreen"
} as const;

type TabKey = keyof typeof TAB_MAP;

const PIN_HOOKS: Record<CommandCenterArea, string[]> = {
  Plants: [
    "Bathroom plants keep failing?",
    "Want plants that survive humidity?",
    "Low light bathroom still needs life?"
  ],
  Mirror: ["Mirror area still feels off?", "Need a mirror setup that works?", "Mirror glare ruining your routine?"],
  Storage: ["Storage still overflows each day?", "Tired of crowded bathroom counters?", "Need faster bathroom mornings?"],
  Lighting: ["Lighting feels too dim at night?", "Need brighter bathroom lighting?", "Bathroom shadows still frustrating?"],
  Shower: ["Shower area feels cramped?", "Need a cleaner shower routine?", "Shower storage keeps slipping?"],
  Renter: ["Renting and still want a better bathroom?", "Need renter safe upgrades that look good?", "Want upgrades without deposit risk?"],
  DIY: ["Need a simple DIY bathroom win?", "DIY bathroom project feels confusing?", "Want a clear DIY bathroom plan?"],
  ExtremeBudget: [
    "Need a bathroom reset on a tiny budget?",
    "Can you improve a bathroom under 75 dollars?",
    "Need budget bathroom results fast?"
  ]
};

const PIN_BENEFITS: Record<CommandCenterArea, string> = {
  Plants: "You get practical plant choices that keep the space calm and alive.",
  Mirror: "You get a mirror setup that improves light and daily flow.",
  Storage: "You get clear storage zones that reduce clutter and save time.",
  Lighting: "You get lighting that improves visibility and makes the room feel brighter.",
  Shower: "You get a shower setup that feels cleaner and easier to maintain.",
  Renter: "You get renter safe changes that improve function without risky installs.",
  DIY: "You get a step by step DIY path you can finish this week.",
  ExtremeBudget: "You get visible change without blowing your monthly budget."
};

const AREA_KEYWORDS: Record<CommandCenterArea, string[]> = {
  Plants: ["bathroom plants", "low light plants", "humidity plants", "plant placement"],
  Mirror: ["bathroom mirror", "mirror placement", "mirror lighting", "mirror style"],
  Storage: ["bathroom storage", "small storage", "counter organization", "cabinet organization"],
  Lighting: ["bathroom lighting", "vanity lighting", "soft lighting", "lighting upgrades"],
  Shower: ["shower upgrades", "shower storage", "shower routine", "small shower"],
  Renter: ["renter bathroom", "no drill bathroom", "temporary upgrades", "deposit safe"],
  DIY: ["bathroom DIY", "easy bathroom project", "weekend bathroom", "home DIY"],
  ExtremeBudget: ["budget bathroom", "under 75 bathroom", "cheap bathroom ideas", "low cost upgrades"]
};

const PROMPT_VARIANTS = [
  "white shower curtain with a matte black bar",
  "light sage towels near the sink",
  "wood tone shelf beside the mirror",
  "small ceramic planter on a vanity corner",
  "soft warm bulb near the mirror edge",
  "clear countertop with one tray organizer"
];

const PRODUCT_PRICES: Record<string, number> = {
  PRODUCT_0001: 29,
  PRODUCT_0002: 9,
  PRODUCT_0003: 19
};

interface EditorialProfile {
  pain: string;
  budgetRange: string;
  lowBudgetThreshold: string;
  installNote: string;
  tools: string;
  blogTime: string;
  guideTime: string;
  tradeoff: string;
  quickWin: string;
  blogTitles: string[];
  guideTitles: string[];
}

const AREA_EDITORIAL_PROFILES: Record<CommandCenterArea, EditorialProfile> = {
  Plants: {
    pain: "bathroom plants keep yellowing, stretching, or looking tired",
    budgetRange: "$15 to $60",
    lowBudgetThreshold: "$25",
    installNote: "Use removable trays, sealed risers, or shelf styling that stays reversible for renters.",
    tools: "a microfiber cloth, basic scissors, a tray or saucer, and a measuring tape",
    blogTime: "30 to 75 minutes for setup plus a one week placement check",
    guideTime: "45 to 60 minutes",
    tradeoff: "Higher humidity helps some plants, but low light can still slow growth and limit placement options.",
    quickWin: "Move one plant out of direct shower spray and place it on the brightest consistent shelf or ledge first.",
    blogTitles: [
      "Low Light Bathroom Plants That Handle Humidity Without Fuss",
      "Bathroom Plant Fixes That Make Small Spaces Feel Calmer",
      "Simple Bathroom Plant Placement for Humid Rooms"
    ],
    guideTitles: [
      "Low Light Bathroom Plant Reset in Under One Hour",
      "Quick Bathroom Plant Placement Guide for Humid Spaces",
      "Bathroom Plant Setup for Small Shelves and Ledges"
    ]
  },
  Mirror: {
    pain: "mirror glare, awkward height, or dead space makes the sink harder to use",
    budgetRange: "$20 to $120",
    lowBudgetThreshold: "$35",
    installNote: "Start with renter safe frame changes, clip on lighting, or removable storage before drilling into tile.",
    tools: "a measuring tape, level, microfiber cloth, and optional adhesive hooks",
    blogTime: "45 to 90 minutes",
    guideTime: "45 to 60 minutes",
    tradeoff: "A larger mirror can bounce more light, but it can also show more splash and require steadier mounting.",
    quickWin: "Measure the mirror centerline before buying anything so the new layout improves both reflection and reach.",
    blogTitles: [
      "Bathroom Mirror Fixes That Improve Light and Daily Flow",
      "Mirror Placement Changes That Make Small Bathrooms Easier to Use",
      "Better Bathroom Mirror Setups for Renter Friendly Updates"
    ],
    guideTitles: [
      "Mirror Placement Reset for Better Bathroom Light",
      "Quick Mirror Styling Guide for a Calmer Sink Area",
      "One Hour Mirror Update for Small Bathroom Flow"
    ]
  },
  Storage: {
    pain: "counter clutter and crowded cabinets slow down your routine",
    budgetRange: "$10 to $80",
    lowBudgetThreshold: "$20",
    installNote: "Favor no drill shelves, caddies, baskets, and removable hooks before permanent hardware.",
    tools: "a measuring tape, basket or bin labels, a cleaning cloth, and optional adhesive strips",
    blogTime: "30 to 90 minutes",
    guideTime: "45 to 75 minutes",
    tradeoff: "Closed storage looks calmer, but open storage is often faster to access during busy mornings.",
    quickWin: "Clear one landing zone near the sink and rebuild it around only the items you use every day.",
    blogTitles: [
      "Small Bathroom Storage Fixes That Cut Counter Clutter",
      "Bathroom Storage Changes That Save Time Every Morning",
      "Storage Layout Fixes for Busy Bathrooms and Tight Spaces"
    ],
    guideTitles: [
      "Bathroom Storage Reset You Can Finish in Under One Hour",
      "Quick Small Bathroom Storage Guide for Daily Flow",
      "Counter Clutter Reset for Busy Bathroom Routines"
    ]
  },
  Lighting: {
    pain: "dim light and shadowy corners make the bathroom feel harder to use",
    budgetRange: "$15 to $90",
    lowBudgetThreshold: "$25",
    installNote: "Use bulb swaps, plug in options, or removable lighting before rewiring or changing permanent fixtures.",
    tools: "a step stool, fresh bulbs, a microfiber cloth, and a measuring tape",
    blogTime: "30 to 75 minutes",
    guideTime: "45 to 60 minutes",
    tradeoff: "Warmer light feels calmer, but cooler light can be better for grooming and mirror tasks.",
    quickWin: "Test bulb color and brightness first because that is often enough to make the room feel easier to use.",
    blogTitles: [
      "Bathroom Lighting Fixes That Make Mornings Easier",
      "Simple Lighting Upgrades for Better Mirror Routines",
      "Bathroom Lighting Changes That Feel Brighter Without a Remodel"
    ],
    guideTitles: [
      "Bathroom Lighting Reset for Clearer Mirror Routines",
      "Quick Vanity Lighting Guide for Small Bathrooms",
      "One Hour Bathroom Lighting Fix With Low Risk Installs"
    ]
  },
  Shower: {
    pain: "the shower zone feels crowded, messy, or harder to clean than it should",
    budgetRange: "$12 to $75",
    lowBudgetThreshold: "$20",
    installNote: "Use tension rods, hanging caddies, and removable hooks before any permanent wall mount.",
    tools: "a squeegee, measuring tape, removable hooks, and a cleaning cloth",
    blogTime: "30 to 90 minutes",
    guideTime: "45 to 75 minutes",
    tradeoff: "More storage helps daily flow, but too many products can make cleanup slower and the space feel tighter.",
    quickWin: "Remove anything you do not use every week before adding a new caddy or organizer.",
    blogTitles: [
      "Shower Storage Fixes That Make Cleanup Easier",
      "Small Bathroom Shower Upgrades for Faster Daily Routines",
      "Shower Organization Fixes That Reduce Visual Clutter"
    ],
    guideTitles: [
      "Shower Storage Reset for Faster Cleanup",
      "Quick Shower Guide for Small Bathroom Flow",
      "One Hour Shower Organization Fix for Daily Routines"
    ]
  },
  Renter: {
    pain: "you want the bathroom to work better without risking your deposit",
    budgetRange: "$20 to $100",
    lowBudgetThreshold: "$30",
    installNote: "Keep each change no drill, reversible, and landlord safe unless your lease clearly allows more.",
    tools: "a measuring tape, adhesive strips, rubbing alcohol, scissors, and a cloth",
    blogTime: "45 to 90 minutes",
    guideTime: "45 to 75 minutes",
    tradeoff: "Reversible upgrades are safer for your deposit, but they can be less durable than permanent hardware.",
    quickWin: "Pick the one bottleneck that annoys you every day and solve it with the lowest risk reversible fix first.",
    blogTitles: [
      "Renter Safe Bathroom Upgrades That Protect Your Deposit",
      "No Drill Bathroom Fixes That Still Feel Intentional",
      "Landlord Safe Bathroom Changes for Better Daily Flow"
    ],
    guideTitles: [
      "No Drill Bathroom Reset in Under One Hour",
      "Renter Safe Bathroom Upgrade Guide for One Quick Win",
      "Landlord Safe Bathroom Fix for Tighter Budgets"
    ]
  },
  DIY: {
    pain: "you want a practical DIY win but the order of operations feels fuzzy",
    budgetRange: "$25 to $150",
    lowBudgetThreshold: "$40",
    installNote: "Choose projects that use common tools and low risk finishes before trying anything permanent.",
    tools: "a screwdriver or drill, measuring tape, painter tape, and a cleaning cloth",
    blogTime: "60 to 120 minutes",
    guideTime: "45 to 90 minutes",
    tradeoff: "DIY usually saves money, but it often costs more time on prep, measuring, and cleanup.",
    quickWin: "Start with the change that improves function first so the styling choices are easier afterward.",
    blogTitles: [
      "DIY Bathroom Upgrades With Common Tools and a Clear Order",
      "Practical Bathroom DIY Projects for One Weekend Win",
      "Beginner Friendly Bathroom DIY Fixes That Actually Help"
    ],
    guideTitles: [
      "DIY Bathroom Quick Win With Common Tools",
      "One Hour Bathroom DIY Guide for Beginners",
      "Weekend Bathroom Project Prep Guide for Better Results"
    ]
  },
  ExtremeBudget: {
    pain: "the bathroom needs help, but the budget is tight enough that every purchase matters",
    budgetRange: "$5 to $40",
    lowBudgetThreshold: "$15",
    installNote: "Use reuse first swaps, thrifted pieces, and removable fixes before buying anything new.",
    tools: "a measuring tape, small screwdriver, scissors, and a cleaning cloth",
    blogTime: "30 to 75 minutes",
    guideTime: "45 to 60 minutes",
    tradeoff: "The lowest cost option can take longer to source, clean, or style well than a mid range fix.",
    quickWin: "Clean the zone first and test one low cost change before stacking several cheap purchases.",
    blogTitles: [
      "Bathroom Fixes Under 40 Dollars That Still Feel Intentional",
      "Extreme Budget Bathroom Changes That Make Daily Routines Easier",
      "Low Cost Bathroom Upgrades for Small Spaces and Tight Budgets"
    ],
    guideTitles: [
      "Bathroom Reset Under 40 Dollars and Under One Hour",
      "Extreme Budget Bathroom Guide for Quick Wins",
      "Low Cost Bathroom Fix You Can Finish Today"
    ]
  }
};

function noDashText(input: string): string {
  return input.replace(/[\u2013\u2014\-]/g, " ").replace(/\s{2,}/g, " ").trim();
}

function areaFromValue(value: string): CommandCenterArea {
  return normalizeContentArea(value) ?? "DIY";
}

function areaPhrase(area: CommandCenterArea): string {
  return area === "ExtremeBudget" ? "extreme budget" : area.toLowerCase();
}

function toEasternDateTime(date: Date): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);

  const lookup = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${lookup("month")}/${lookup("day")}/${lookup("year")}`,
    time: `${lookup("hour")}:${lookup("minute")}`
  };
}

function workflowStatusFrom(value: string): WorkflowStatus {
  const normalized = value.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (normalized === "approved" || normalized === "ready") return "approved";
  if (normalized === "queued" || normalized === "synced") return "queued";
  if (normalized === "posted" || normalized === "live") return "posted";
  if (normalized === "published") return "published";
  return "draft";
}

function isPublishableWorkflowStatus(value: string): boolean {
  const status = workflowStatusFrom(value);
  return status === "approved" || status === "published";
}

function isPinSyncableWorkflowStatus(value: string): boolean {
  const status = workflowStatusFrom(value);
  return status === "approved" || status === "queued" || status === "posted" || status === "published";
}

function isReadyForManualPublish(params: {
  title: string;
  content: string;
  qualityScore: string;
  qualityChecks: string;
}): boolean {
  const title = params.title.trim();
  const content = params.content.trim();
  const qualityChecks = params.qualityChecks.trim();
  const qualityScore = Number(params.qualityScore);
  if (!title || !content) return false;
  if (!Number.isFinite(qualityScore) || qualityScore < 80) return false;
  if (/^BLOCK\b/m.test(qualityChecks)) return false;
  if (/Awaiting pasted/i.test(qualityChecks)) return false;
  return true;
}

function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  if (slug) return slug;
  return fallback
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "content";
}

function parsePublishedAtIso(dateValue: string, timeValue: string): string {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateValue.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue.trim());
  if (!dateMatch) return new Date().toISOString();
  const [, mm, dd, yyyy] = dateMatch;
  const hours = timeMatch?.[1] ?? "12";
  const minutes = timeMatch?.[2] ?? "00";
  const parsed = new Date(`${yyyy}-${mm}-${dd}T${hours}:${minutes}:00-05:00`);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function overlayLines(overlay: string, area: CommandCenterArea): { line1: string; line2: string } {
  const topMatch = /top:\s*([^.]*)/i.exec(overlay);
  const bottomMatch = /bottom:\s*([^.]*)/i.exec(overlay);
  if (topMatch || bottomMatch) {
    return {
      line1: noDashText(topMatch?.[1] ?? `${contentAreaLabel(area)} bathroom win`),
      line2: noDashText(bottomMatch?.[1] ?? "Use one simple step today")
    };
  }

  const parts = overlay
    .split(/[.!?]/)
    .map((part) => noDashText(part))
    .filter(Boolean);
  return {
    line1: parts[0] ?? `${contentAreaLabel(area)} bathroom win`,
    line2: parts[1] ?? "Use one simple step today"
  };
}

function parseAreaCounts(input?: Partial<Record<string, unknown>>): AreaCounts {
  const next: AreaCounts = { ...DEFAULT_AREA_COUNTS };
  if (!input) return next;

  for (const area of COMMAND_CENTER_CONTENT_AREAS) {
    const value = Number(input[area] ?? 0);
    next[area] = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  }
  return next;
}

function nextSequentialId(prefix: string, pad: number, existingIds: string[]): string {
  const max = existingIds.reduce((best, id) => {
    const n = Number(String(id).replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(best, n) : best;
  }, 0);
  return `${prefix}${String(max + 1).padStart(pad, "0")}`;
}

function cycleAreas(count: number): CommandCenterArea[] {
  return Array.from({ length: count }).map((_, i) => COMMAND_CENTER_CONTENT_AREAS[i % COMMAND_CENTER_CONTENT_AREAS.length]);
}

function latestByArea<T extends { Content_Area?: string }>(rows: T[], area: CommandCenterArea): T | undefined {
  const scoped = rows.filter((row) => areaFromValue(String(row.Content_Area ?? "")) === area);
  return scoped[scoped.length - 1];
}

function destinationPathForBlog(blog: BlogEvergreenRow): string {
  if (blog.Blog_URL?.startsWith("/blog/")) return blog.Blog_URL;
  if (blog.Blog_URL) return `/blog/${slugify(blog.Blog_URL, blog.Blog_ID)}`;
  return `/blog/${slugify(blog.Blog_Title || blog.Blog_ID, blog.Blog_ID)}`;
}

function destinationPathForGuide(guide: GuideEvergreenRow): string {
  if (guide.Guide_URL?.startsWith("/guides/")) return guide.Guide_URL;
  if (guide.Guide_URL) return `/guides/${slugify(guide.Guide_URL, guide.Guide_ID)}`;
  return `/guides/${slugify(guide.Guide_Title || guide.Guide_ID, guide.Guide_ID)}`;
}

function generatePinCaption(area: CommandCenterArea, mode: "free" | "cost" | "both" | "none", index: number): string {
  const hooks = PIN_HOOKS[area];
  const hook = hooks[index % hooks.length];
  const benefit = PIN_BENEFITS[area];

  const pricingLine =
    mode === "free"
      ? "The linked guide is free, so you can start today without extra cost."
      : mode === "cost"
        ? "Most people can finish this update for under 75 dollars with common tools."
        : mode === "both"
          ? "The guide is free and the update can usually stay under 75 dollars."
          : "The plan is practical, clear, and built for real daily routines.";

  const closing = "Open the destination now, pick one step, and finish one useful change today.";
  return noDashText(`${hook} Diyesu Decor built this ${areaPhrase(area)} idea for real homes. ${benefit} ${pricingLine} ${closing}`);
}

function generatePinPrompt(area: CommandCenterArea, destination: string, pinId: string, index: number): string {
  const variant = PROMPT_VARIANTS[index % PROMPT_VARIANTS.length];
  return noDashText(
    `Create a photoreal vertical 2 by 3 Pinterest image for Diyesu Decor. Pin id ${pinId}. Content area ${area}. Destination reference ${destination}. Scene should show a real bathroom with ${variant}. No people. No face. No logo. No watermark. Leave clear safe space at top and bottom for text overlay.`
  );
}

function defaultPinOverlay(area: CommandCenterArea, caption: string, destination: string): string {
  const firstSentence = caption
    .split(/[.!?]/)
    .map((part) => part.trim())
    .find((part) => part.length > 0);
  const clipped = firstSentence ? firstSentence.slice(0, 72).trim() : `${area} bathroom win today`;
  const tail = destination.startsWith("GUIDE_")
    ? "Use one step in under one hour"
    : destination.startsWith("BLOG_")
      ? "Open the full plan and start today"
      : "Simple upgrades for real bathrooms";
  return noDashText(`Top: ${clipped}. Bottom: ${tail}.`);
}

function defaultPinCta(destination: string, area: CommandCenterArea): string {
  if (destination.startsWith("GUIDE_")) return noDashText(`Open the ${areaPhrase(area)} guide and finish one step now.`);
  if (destination.startsWith("BLOG_")) return noDashText(`Open the ${areaPhrase(area)} blog plan and follow the next step today.`);
  return "Open this plan now and start your next bathroom win.";
}

function editorialProfileFor(area: CommandCenterArea): EditorialProfile {
  return AREA_EDITORIAL_PROFILES[area];
}

export function buildBlogDraftContent(area: CommandCenterArea): string {
  const profile = editorialProfileFor(area);
  return noDashText(
    `# ${profile.blogTitles[0]}

If your ${profile.pain}, you do not need a full remodel to make progress. Start with one change that saves time, creates less clutter, and makes the bathroom feel calmer during your daily routine.

## What this post solves
You are working with real constraints, not a blank check. This draft is meant for renters, small bathrooms, and budget first households that need a more functional setup without unnecessary risk.

## Budget, install, and effort
Budget range: ${profile.budgetRange}.
Install note: ${profile.installNote}
Time and tools: ${profile.blogTime}; ${profile.tools}.
Tradeoff: ${profile.tradeoff}

## Start with this order
1. ${profile.quickWin}
2. Clear one zone that causes the most friction and keep only daily use items there.
3. Test the lowest risk option first so you can protect your deposit and avoid wasted spend.
4. Add one style move only after the room feels easier to use and easier to clean.
5. Check the setup after seven days and keep the version that reduces stress and supports a calmer routine.

## Budget tiers
1. Lowest spend: choose one improvement under ${profile.lowBudgetThreshold} that solves the main bottleneck first.
2. Mid range: pair one functional fix with one visual fix so the bathroom feels intentional without adding clutter.
3. Higher effort: only move to more permanent work if the durability gain is worth the extra install time.

## Next step
Use the matching guide in this area if you want a shorter 45 to 90 minute version. If you still need a broader bathroom reset path, continue with Start Here and keep any product purchases optional until the layout proves itself.`
  );
}

export function buildGuideDraftContent(area: CommandCenterArea): string {
  const profile = editorialProfileFor(area);
  return noDashText(
    `# ${profile.guideTitles[0]}

Use this quick guide when you want one visible improvement without turning the whole bathroom upside down.

## Quick brief
Budget range: ${profile.budgetRange}.
Install note: ${profile.installNote}
Time and tools: ${profile.guideTime}; ${profile.tools}.
Tradeoff: ${profile.tradeoff}

## 45 to 90 minute plan
1. Prep in 10 minutes: ${profile.quickWin}
2. Main change in 20 to 45 minutes: apply one reversible fix that improves daily flow and creates less clutter.
3. Reset in 10 minutes: put back only what you use every day so the room stays more functional.
4. Test in 5 minutes: make sure the change feels easier to maintain, easier to clean, and calmer to look at.

## Stop here if
The space already feels more useful, you saved time during the next routine, and the fix stays renter safe enough for your current setup. If not, adjust the layout before buying anything else.

## Next step
If this quick win helps, move to the related blog for the broader order of operations and keep the next purchase optional until the result holds up for a full week.`
  );
}

function emailDraftContent(area: CommandCenterArea, blogId: string): string {
  const intro = `Quick update from Diyesu Decor: this week we focused on ${areaPhrase(area)} upgrades that make daily routines easier.`;
  const value =
    "Choose one small change, complete it today, and keep the rest simple. You do not need a full remodel to feel a clear result.";
  const close = `If you want the full walkthrough, open our latest blog in this area: ${blogId}.`;
  return noDashText(`${intro}\n\n${value}\n\n${close}`);
}

function fallbackCtaForArea(area: CommandCenterArea): { label: string; url: string; reason: string } {
  if (area === "Plants") {
    return {
      label: "See the plant picks upgrade",
      url: "/products/bathroom-plant-picks-upgrade",
      reason: "Plants topics map cleanly to the plant upgrade product."
    };
  }

  if (area === "Renter") {
    return {
      label: "Preview the renter blueprint",
      url: "/products/renter-bathroom-upgrade-blueprint",
      reason: "Renter topics map directly to the blueprint product."
    };
  }

  return {
    label: "Start here for more bathroom tips",
    url: NEWSLETTER_FALLBACKS.general,
    reason: "No stronger product fit was selected, so use the newsletter path."
  };
}

function ctaOptionForUrl(area: CommandCenterArea, value: string): { label: string; url: string; reason: string } {
  const trimmed = value.trim();
  if (!trimmed) return fallbackCtaForArea(area);
  if (trimmed === "/products/bathroom-plant-picks-upgrade") {
    return {
      label: "See the plant picks upgrade",
      url: trimmed,
      reason: "Plants topics map cleanly to the plant upgrade product."
    };
  }
  if (trimmed === "/products/renter-bathroom-upgrade-blueprint") {
    return {
      label: "Preview the renter blueprint",
      url: trimmed,
      reason: "Renter safe and broader bathroom planning topics fit the blueprint."
    };
  }
  if (trimmed === "/lead-magnets/plant-picker") {
    return {
      label: "Get the free plant picker",
      url: trimmed,
      reason: "Plants content can softly close into the plant picker lead magnet."
    };
  }
  if (trimmed === "/start-here" || trimmed === NEWSLETTER_FALLBACKS.general) {
    return {
      label: "Start here for more bathroom tips",
      url: NEWSLETTER_FALLBACKS.general,
      reason: "General newsletter or path guidance is the clean fallback."
    };
  }
  return fallbackCtaForArea(area);
}

function parseKeywordEntries(value: string): string[] {
  return value
    .split(/[|,\n;]/g)
    .map((item) => sanitizeVisibleMarkdownSegment(item).trim())
    .filter(Boolean);
}

function ensureRowId(rawValue: string, prefix: string, pad: number, usedIds: Set<string>): string {
  const trimmed = rawValue.trim();
  if (trimmed && !usedIds.has(trimmed)) {
    usedIds.add(trimmed);
    return trimmed;
  }

  const next = nextSequentialId(prefix, pad, Array.from(usedIds));
  usedIds.add(next);
  return next;
}

function existingTitlesForArea<T extends { Content_Area?: string; Blog_Title?: string; Guide_Title?: string }>(
  rows: T[],
  area: CommandCenterArea,
  excludeTitle = ""
): string[] {
  return rows
    .filter((row) => areaFromValue(String(row.Content_Area ?? "")) === area)
    .map((row) => String(row.Blog_Title ?? row.Guide_Title ?? "").trim())
    .filter((title) => Boolean(title) && title !== excludeTitle);
}

function existingKeywordsForArea<T extends { Content_Area?: string; Blog_Keywords?: string; Guide_Keywords?: string }>(
  rows: T[],
  area: CommandCenterArea
): string[] {
  return rows
    .filter((row) => areaFromValue(String(row.Content_Area ?? "")) === area)
    .map((row) => String(row.Blog_Keywords ?? row.Guide_Keywords ?? "").trim())
    .filter(Boolean);
}

function recentAnglesForArea<T extends { Content_Area?: string; Blog_Title?: string; Guide_Title?: string }>(rows: T[], area: CommandCenterArea): string[] {
  return rows
    .filter((row) => areaFromValue(String(row.Content_Area ?? "")) === area)
    .slice(-10)
    .map((row) => String(row.Blog_Title ?? row.Guide_Title ?? "").trim())
    .filter(Boolean);
}

function sanitizeVisibleMarkdownSegment(segment: string): string {
  return segment
    .replace(/(^|\n)-\s+/g, "$1• ")
    .replace(/[\u2010-\u2015-]/g, " ")
    .replace(/[ \t]{2,}/g, " ");
}

function unwrapMarkdownFence(markdown: string): string {
  const trimmed = markdown.trim();
  const fenced = /^```(?:markdown|md)?\s*\n?([\s\S]*?)\n?```$/i.exec(trimmed);
  return fenced ? fenced[1].trim() : trimmed;
}

function sanitizeMarkdownForDisplay(markdown: string): string {
  const parts = unwrapMarkdownFence(markdown).split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts
    .map((part) => {
      const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (!match) return sanitizeVisibleMarkdownSegment(part);
      const [, label, url] = match;
      return `[${sanitizeVisibleMarkdownSegment(label).trim()}](${url.trim()})`;
    })
    .join("")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function applySoftCta(content: string, label: string, url: string): string {
  const linked = `[${sanitizeVisibleMarkdownSegment(label).trim()}](${url})`;
  const closing = `If you want the next step, ${linked}.`;
  if (content.includes(`](${url})`)) return content;
  if (/^## Next step\b/m.test(content)) {
    return content.replace(/^## Next step[\s\S]*$/m, `## Next step\n${closing}`).trim();
  }
  return `${content.trim()}\n\n## Next step\n${closing}`;
}

function fallbackBlogContent(area: CommandCenterArea, ctaLabel: string, ctaUrl: string): string {
  const base = buildBlogDraftContent(area);
  const bulletSection = `\n\n## Keep these checks in mind\n• Stay within a budget that feels realistic for this month.\n• Choose the lowest risk install path first.\n• Keep the room easier to clean after the change.\n• Stop when the routine feels calmer and more functional.`;
  return applySoftCta(`${base}${bulletSection}`, ctaLabel, ctaUrl);
}

function fallbackGuideContent(area: CommandCenterArea, ctaLabel: string, ctaUrl: string): string {
  const base = buildGuideDraftContent(area);
  const bulletSection = `\n\n## Quick checks\n• Keep the setup renter safe.\n• Use the smallest useful budget first.\n• Make sure the change saves time or reduces clutter.`;
  return applySoftCta(`${base}${bulletSection}`, ctaLabel, ctaUrl);
}

function manualTopicPlaceholder(area: CommandCenterArea, kind: "blog" | "guide"): string {
  const areaLabel = contentAreaLabel(area);
  if (kind === "blog") {
    return `Add your exact ${areaLabel} blog title in Blog_Title before you send this prompt to ChatGPT.`;
  }
  return `Add your exact ${areaLabel} guide title in Guide_Title before you send this prompt to ChatGPT.`;
}

function inferPostType(title: string, fallback: "task_based" | "topic_based"): "task_based" | "topic_based" {
  const normalized = title.trim().toLowerCase();
  if (!normalized) return fallback;
  if (
    /^(how to|steps|step by step|install|set up|setup|organize|build|paint|clean|fix|mount|hang|choose|place)\b/.test(normalized) ||
    /\bwithout\b/.test(normalized)
  ) {
    return "task_based";
  }
  return "topic_based";
}

function writerKeywordPlan(rawKeywords: string): { primaryKeyword: string; secondaryKeywords: string[] } {
  const parsed = parseKeywordEntries(rawKeywords);
  return {
    primaryKeyword: parsed[0] ?? "",
    secondaryKeywords: parsed.slice(1, 4)
  };
}

function pendingWriterChecks(kind: "blog" | "guide", title: string, ctaUrl: string): string {
  const titleField = kind === "blog" ? "Blog_Title" : "Guide_Title";
  const contentField = kind === "blog" ? "Blog_Content" : "Guide_Content";
  const refreshLabel = kind === "blog" ? "Refresh blog QC" : "Refresh guide QC";
  const waitingTitle = title.trim() ? "" : `Add your manual topic in ${titleField} and save to refresh the prompt.\n`;
  return `${waitingTitle}Preferred CTA target: ${ctaUrl}\nNext step: paste the raw markdown from ChatGPT into ${contentField}, then run ${refreshLabel}.`;
}

function publishTimestamp(date: Date): string {
  const when = toEasternDateTime(date);
  return `${when.date} ${when.time} ET`;
}

function emailSubjectFor(area: CommandCenterArea, index: number): string {
  const choices: Record<CommandCenterArea, string[]> = {
    Plants: ["Plant picks that survive bathroom humidity", "Low light bathroom plant wins this week", "Easy bathroom plant plan for this week"],
    Mirror: ["Mirror upgrades that improve your mornings", "Quick mirror fixes that change bathroom flow", "Mirror and light update you can do today"],
    Storage: ["Storage moves that cut bathroom clutter", "One storage fix for easier mornings", "Bathroom organization plan for this week"],
    Lighting: ["Lighting upgrades for a brighter bathroom", "Simple lighting fixes for better routines", "Bathroom lighting plan you can finish today"],
    Shower: ["Shower setup improvements for this week", "One shower fix for cleaner routines", "Quick shower organization move for today"],
    Renter: ["Renter safe bathroom upgrades for this week", "No drill bathroom plan you can do today", "Deposit safe bathroom improvements"],
    DIY: ["Your next DIY bathroom win is ready", "DIY bathroom steps you can finish this week", "Simple DIY bathroom plan for today"],
    ExtremeBudget: ["Bathroom upgrades under 75 dollars", "Extreme budget bathroom plan for this week", "Low cost bathroom wins you can start now"]
  };
  return noDashText(choices[area][index % choices[area].length]);
}

export async function generateBlogDraftForRow(row: BlogEvergreenRow, blogs: BlogEvergreenRow[]): Promise<BlogEvergreenRow> {
  const area = areaFromValue(String(row.Content_Area));
  const ctaFallback = ctaOptionForUrl(area, String(row.CTA_Target ?? ""));
  const visibleTitles = existingTitlesForArea(blogs, area, row.Blog_Title);
  const visibleKeywords = existingKeywordsForArea(blogs, area);
  const recentAngles = recentAnglesForArea(blogs, area);
  const finalTitle = sanitizeVisibleMarkdownSegment(String(row.Blog_Title ?? "")).trim();
  const postType = inferPostType(finalTitle, "topic_based");
  const topicAngle = finalTitle || manualTopicPlaceholder(area, "blog");
  const targetReader = "Budget first renter or small space household";
  const { primaryKeyword, secondaryKeywords } = writerKeywordPlan(String(row.Blog_Keywords ?? ""));
  const mainConstraint = editorialProfileFor(area).pain;
  const desiredOutcome = "The reader should be able to act on the advice today.";
  const currentContent = String(row.Blog_Content ?? "").trim();
  const finalContent = currentContent ? sanitizeMarkdownForDisplay(currentContent) : "";
  const quality = finalContent
    ? summarizeContentQuality({
        id: row.Blog_ID,
        kind: "blog",
        title: finalTitle,
        content: finalContent,
        ctaUrl: ctaFallback.url,
        existingTitles: visibleTitles,
        allowedCtaUrls: allowedCtaUrls(area)
      })
    : null;
  const promptPack = buildBlogPromptPack({
    area,
    title: finalTitle,
    topicAngle,
    postType,
    targetReader,
    primaryKeyword,
    secondaryKeywords,
    mainConstraint,
    desiredOutcome,
    ctaUrl: ctaFallback.url,
    ctaLabel: ctaFallback.label,
    existingTitles: visibleTitles,
    existingKeywords: visibleKeywords,
    recentAngles
  });

  return {
    ...row,
    Blog_Title: finalTitle,
    Blog_Keywords: sanitizeVisibleMarkdownSegment(String(row.Blog_Keywords ?? "")).trim(),
    Blog_Content: finalContent,
    Writer_Brief: `${formatWriterBrief({
      area,
      topicAngle: sanitizeVisibleMarkdownSegment(topicAngle).trim(),
      postType,
      targetReader: sanitizeVisibleMarkdownSegment(targetReader).trim(),
      primaryKeyword: sanitizeVisibleMarkdownSegment(primaryKeyword).trim(),
      secondaryKeywords: secondaryKeywords.map((item) => sanitizeVisibleMarkdownSegment(item).trim()),
      mainConstraint: sanitizeVisibleMarkdownSegment(mainConstraint).trim(),
      desiredOutcome: sanitizeVisibleMarkdownSegment(desiredOutcome).trim(),
      ctaUrl: ctaFallback.url,
      ctaLabel: sanitizeVisibleMarkdownSegment(ctaFallback.label).trim()
    })}\n\nPrompt pack:\n${promptPack}`,
    CTA_Target: ctaFallback.url,
    Quality_Score: quality ? String(quality.score) : "",
    Quality_Checks: quality
      ? quality.notes
      : pendingWriterChecks("blog", finalTitle, ctaFallback.url)
  };
}

export async function generateGuideDraftForRow(
  row: GuideEvergreenRow,
  guides: GuideEvergreenRow[],
  blogs: BlogEvergreenRow[]
): Promise<GuideEvergreenRow> {
  const area = areaFromValue(String(row.Content_Area));
  const ctaFallback = ctaOptionForUrl(area, String(row.CTA_Target ?? ""));
  const visibleTitles = existingTitlesForArea(guides, area, row.Guide_Title);
  const visibleKeywords = existingKeywordsForArea(guides, area);
  const parentBlog = blogs.find((blog) => blog.Blog_ID === row.Blog_ID);
  const finalTitle = sanitizeVisibleMarkdownSegment(String(row.Guide_Title ?? "")).trim();
  const postType = inferPostType(finalTitle, "task_based");
  const topicAngle = finalTitle || manualTopicPlaceholder(area, "guide");
  const targetReader = "Budget first renter or small space household";
  const { primaryKeyword, secondaryKeywords } = writerKeywordPlan(String(row.Guide_Keywords ?? ""));
  const mainConstraint = editorialProfileFor(area).pain;
  const desiredOutcome = "The reader should finish one useful quick win in one sitting.";
  const currentContent = String(row.Guide_Content ?? "").trim();
  const finalContent = currentContent ? sanitizeMarkdownForDisplay(currentContent) : "";
  const quality = finalContent
    ? summarizeContentQuality({
        id: row.Guide_ID,
        kind: "guide",
        title: finalTitle,
        content: finalContent,
        ctaUrl: ctaFallback.url,
        existingTitles: visibleTitles,
        allowedCtaUrls: allowedCtaUrls(area)
      })
    : null;
  const promptPack = buildGuidePromptPack({
    area,
    title: finalTitle,
    topicAngle,
    postType,
    targetReader,
    primaryKeyword,
    secondaryKeywords,
    mainConstraint,
    desiredOutcome,
    ctaUrl: ctaFallback.url,
    ctaLabel: ctaFallback.label,
    existingTitles: visibleTitles,
    existingKeywords: visibleKeywords,
    linkedBlogTitle: parentBlog?.Blog_Title,
    linkedBlogUrl: parentBlog?.Blog_URL || (parentBlog ? destinationPathForBlog(parentBlog) : ""),
    linkedBlogSummary: parentBlog?.Blog_Content?.slice(0, 240)
  });

  return {
    ...row,
    Guide_Title: finalTitle,
    Guide_Keywords: sanitizeVisibleMarkdownSegment(String(row.Guide_Keywords ?? "")).trim(),
    Guide_Content: finalContent,
    Writer_Brief: `${formatWriterBrief({
      area,
      topicAngle: sanitizeVisibleMarkdownSegment(topicAngle).trim(),
      postType,
      targetReader: sanitizeVisibleMarkdownSegment(targetReader).trim(),
      primaryKeyword: sanitizeVisibleMarkdownSegment(primaryKeyword).trim(),
      secondaryKeywords: secondaryKeywords.map((item) => sanitizeVisibleMarkdownSegment(item).trim()),
      mainConstraint: sanitizeVisibleMarkdownSegment(mainConstraint).trim(),
      desiredOutcome: sanitizeVisibleMarkdownSegment(desiredOutcome).trim(),
      ctaUrl: ctaFallback.url,
      ctaLabel: sanitizeVisibleMarkdownSegment(ctaFallback.label).trim()
    })}\n\nPrompt pack:\n${promptPack}`,
    CTA_Target: ctaFallback.url,
    Quality_Score: quality ? String(quality.score) : "",
    Quality_Checks: quality
      ? quality.notes
      : pendingWriterChecks("guide", finalTitle, ctaFallback.url)
  };
}

export async function refreshBlogQualityChecks(): Promise<{ updated: number; belowThreshold: number }> {
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  let belowThreshold = 0;

  for (const row of blogs) {
    const area = areaFromValue(String(row.Content_Area));
    const quality = summarizeContentQuality({
      id: row.Blog_ID,
      kind: "blog",
      title: String(row.Blog_Title ?? ""),
      content: String(row.Blog_Content ?? ""),
      ctaUrl: String(row.CTA_Target ?? fallbackCtaForArea(area).url),
      existingTitles: existingTitlesForArea(blogs, area, row.Blog_Title),
      allowedCtaUrls: allowedCtaUrls(area)
    });
    row.Quality_Score = String(quality.score);
    row.Quality_Checks = quality.notes;
    if (quality.score < 80 || quality.blockingIssues.length > 0) belowThreshold += 1;
  }

  await saveRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs, blogs);
  return { updated: blogs.length, belowThreshold };
}

export async function refreshGuideQualityChecks(): Promise<{ updated: number; belowThreshold: number }> {
  const guides = await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides);
  let belowThreshold = 0;

  for (const row of guides) {
    const area = areaFromValue(String(row.Content_Area));
    const quality = summarizeContentQuality({
      id: row.Guide_ID,
      kind: "guide",
      title: String(row.Guide_Title ?? ""),
      content: String(row.Guide_Content ?? ""),
      ctaUrl: String(row.CTA_Target ?? fallbackCtaForArea(area).url),
      existingTitles: existingTitlesForArea(guides, area, row.Guide_Title),
      allowedCtaUrls: allowedCtaUrls(area)
    });
    row.Quality_Score = String(quality.score);
    row.Quality_Checks = quality.notes;
    if (quality.score < 80 || quality.blockingIssues.length > 0) belowThreshold += 1;
  }

  await saveRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides, guides);
  return { updated: guides.length, belowThreshold };
}

export async function loadEvergreenTab(key: TabKey): Promise<Record<string, unknown>[]> {
  return loadRuntimeTab<Record<string, unknown>>(TAB_MAP[key]);
}

export async function saveEvergreenTab(key: TabKey, rows: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  if (key === "blogs") {
    const usedIds = new Set<string>();
    const normalizedRows: BlogEvergreenRow[] = rows.map((row) => ({
      Blog_ID: ensureRowId(String(row.Blog_ID ?? ""), "BLOG_", 4, usedIds),
      Blog_Publish_Date: String(row.Blog_Publish_Date ?? ""),
      Blog_Publish_Time: String(row.Blog_Publish_Time ?? ""),
      Content_Area: areaFromValue(String(row.Content_Area ?? "")),
      Workflow_Status: String(row.Workflow_Status ?? "draft"),
      Blog_URL: String(row.Blog_URL ?? ""),
      Blog_Title: String(row.Blog_Title ?? ""),
      Blog_Keywords: String(row.Blog_Keywords ?? ""),
      Blog_Content: String(row.Blog_Content ?? ""),
      Writer_Brief: String(row.Writer_Brief ?? ""),
      CTA_Target: String(row.CTA_Target ?? ""),
      Quality_Score: String(row.Quality_Score ?? ""),
      Quality_Checks: String(row.Quality_Checks ?? ""),
      Related_Pins: String(row.Related_Pins ?? ""),
      Published_To_Public_At: String(row.Published_To_Public_At ?? "")
    }));
    const nextRows = await Promise.all(normalizedRows.map((row) => generateBlogDraftForRow(row, normalizedRows)));
    await saveRuntimeTab(TAB_MAP[key], nextRows);
    return nextRows as unknown as Record<string, unknown>[];
  }

  if (key === "guides") {
    const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
    const usedIds = new Set<string>();
    const normalizedRows: GuideEvergreenRow[] = rows.map((row) => ({
      Guide_ID: ensureRowId(String(row.Guide_ID ?? ""), "GUIDE_", 4, usedIds),
      Guide_Publish_Date: String(row.Guide_Publish_Date ?? ""),
      Guide_Publish_Time: String(row.Guide_Publish_Time ?? ""),
      Content_Area: areaFromValue(String(row.Content_Area ?? "")),
      Workflow_Status: String(row.Workflow_Status ?? "draft"),
      Blog_ID: String(row.Blog_ID ?? ""),
      Guide_URL: String(row.Guide_URL ?? ""),
      Guide_Title: String(row.Guide_Title ?? ""),
      Guide_Keywords: String(row.Guide_Keywords ?? ""),
      Guide_Content: String(row.Guide_Content ?? ""),
      Writer_Brief: String(row.Writer_Brief ?? ""),
      CTA_Target: String(row.CTA_Target ?? ""),
      Quality_Score: String(row.Quality_Score ?? ""),
      Quality_Checks: String(row.Quality_Checks ?? ""),
      Related_Pins: String(row.Related_Pins ?? ""),
      Published_To_Public_At: String(row.Published_To_Public_At ?? "")
    }));
    const nextRows = await Promise.all(normalizedRows.map((row) => generateGuideDraftForRow(row, normalizedRows, blogs)));
    await saveRuntimeTab(TAB_MAP[key], nextRows);
    return nextRows as unknown as Record<string, unknown>[];
  }

  await saveRuntimeTab(TAB_MAP[key], rows);
  return rows;
}

export async function bootstrapEvergreenProducts(): Promise<void> {
  const existing = await loadRuntimeTab<ProductEvergreenRow>(TAB_MAP.products);
  if (existing.length > 0) return;
  const now = toEasternDateTime(new Date());
  await saveRuntimeTab<ProductEvergreenRow>(TAB_MAP.products, [
    {
      Product_ID: "PRODUCT_0001",
      Product_Date: now.date,
      Product_Sales: "0",
      Product_Revenue: "0",
      Product_Link: "",
      Blog_ID: "",
      Guide_ID: ""
    },
    {
      Product_ID: "PRODUCT_0002",
      Product_Date: now.date,
      Product_Sales: "0",
      Product_Revenue: "0",
      Product_Link: "",
      Blog_ID: "",
      Guide_ID: ""
    }
  ]);
}

export async function generateNewPins(count = 25): Promise<{ created: number }> {
  const pins = await loadRuntimeTab<PinEvergreenRow>(TAB_MAP.pins);
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  const guides = await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides);

  const latestStamp = new Date();
  const areas = cycleAreas(count);
  const newRows: PinEvergreenRow[] = [];

  for (let i = 0; i < count; i += 1) {
    const area = areas[i];
    const pinId = nextSequentialId("PIN_", 4, [...pins, ...newRows].map((row) => row.Pin_ID));
    const slot = new Date(latestStamp.getTime() + i * 3 * 60 * 60 * 1000);
    const { date, time } = toEasternDateTime(slot);

    const relatedBlog = latestByArea(blogs, area) ?? blogs[blogs.length - 1];
    const relatedGuide = latestByArea(guides, area) ?? guides[guides.length - 1];
    const useGuide = Boolean(relatedGuide) && i % 2 === 1;

    const destination = useGuide ? relatedGuide.Guide_ID : relatedBlog?.Blog_ID ?? "";
    const blogId = relatedBlog?.Blog_ID ?? relatedGuide?.Blog_ID ?? "";
    const destinationPath = useGuide
      ? destinationPathForGuide(relatedGuide as GuideEvergreenRow)
      : relatedBlog
        ? destinationPathForBlog(relatedBlog)
        : "/start-here";

    const pricingMode = i % 5 === 0 ? "free" : i % 5 === 1 ? "cost" : i % 5 === 2 ? "both" : "none";
    const utm = `${destinationPath}?utm_source=pinterest&utm_medium=organic&utm_campaign=evergreen&utm_content=${pinId.toLowerCase()}`;

    newRows.push({
      Pin_ID: pinId,
      Pin_Publish_Date: date,
      Pin_Publish_Time: time,
      Content_Area: area,
      Workflow_Status: "draft",
      Destination: destination,
      Blog_ID: blogId,
      Media_Prompt: generatePinPrompt(area, destination || destinationPath, pinId, i),
      Media_URL: "",
      Pin_Overlay: "",
      Pin_Caption: generatePinCaption(area, pricingMode, i),
      Pin_CTA: "",
      Pin_URL: "",
      UTM_URL: utm,
      Prepared_For_Export_At: ""
    });
  }

  await saveRuntimeTab<PinEvergreenRow>(TAB_MAP.pins, [...pins, ...newRows]);
  return { created: newRows.length };
}

export async function generatePinOverlayAndCta(lastCount = 25): Promise<{ updated: number }> {
  const pins = await loadRuntimeTab<PinEvergreenRow>(TAB_MAP.pins);
  const target = pins.slice(-lastCount);

  for (const row of target) {
    const area = areaFromValue(String(row.Content_Area));
    row.Pin_Overlay = defaultPinOverlay(area, String(row.Pin_Caption ?? ""), String(row.Destination));
    row.Pin_CTA = defaultPinCta(String(row.Destination), area);
  }

  await saveRuntimeTab<PinEvergreenRow>(TAB_MAP.pins, pins);
  return { updated: target.length };
}

export async function generateNewBlogs(areaCounts?: Partial<Record<string, unknown>>): Promise<{ created: number }> {
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  const counts = parseAreaCounts(areaCounts);
  const now = new Date();
  const created: BlogEvergreenRow[] = [];

  for (const area of COMMAND_CENTER_CONTENT_AREAS) {
    const count = counts[area];
    for (let i = 0; i < count; i += 1) {
      const id = nextSequentialId("BLOG_", 4, [...blogs, ...created].map((row) => row.Blog_ID));
      const slot = new Date(now.getTime() + (created.length + 1) * 6 * 60 * 60 * 1000);
      const { date, time } = toEasternDateTime(slot);
      created.push({
        Blog_ID: id,
        Blog_Publish_Date: date,
        Blog_Publish_Time: time,
        Content_Area: area,
        Workflow_Status: "draft",
        Blog_URL: "",
        Blog_Title: "",
        Blog_Keywords: "",
        Blog_Content: "",
        Writer_Brief: "",
        CTA_Target: "",
        Quality_Score: "",
        Quality_Checks: "",
        Related_Pins: "",
        Published_To_Public_At: ""
      });
    }
  }

  const nextRows = [...blogs, ...created];
  const hydrated = await Promise.all(nextRows.map((row) => generateBlogDraftForRow(row, nextRows)));
  await saveRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs, hydrated);
  return { created: created.length };
}

export async function generateBlogTitlesAndKeywords(): Promise<{ updated: number }> {
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  let updated = 0;
  const nextBlogs = [...blogs];

  for (let index = 0; index < nextBlogs.length; index += 1) {
    const row = nextBlogs[index];
    const generated = await generateBlogDraftForRow(row, nextBlogs);
    nextBlogs[index] = generated;
    updated += 1;
  }

  await saveRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs, nextBlogs);
  return { updated };
}

export async function updateBlogRelatedPins(): Promise<{ updated: number }> {
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  const pins = await loadRuntimeTab<PinEvergreenRow>(TAB_MAP.pins);

  blogs.forEach((blog) => {
    const related = pins
      .filter((pin) => pin.Blog_ID === blog.Blog_ID || pin.Destination === blog.Blog_ID)
      .map((pin) => pin.Pin_ID)
      .join(", ");
    blog.Related_Pins = related;
  });

  await saveRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs, blogs);
  return { updated: blogs.length };
}

export async function generateNewGuides(areaCounts?: Partial<Record<string, unknown>>): Promise<{ created: number }> {
  const guides = await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides);
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  const counts = parseAreaCounts(areaCounts);
  const now = new Date();
  const created: GuideEvergreenRow[] = [];

  for (const area of COMMAND_CENTER_CONTENT_AREAS) {
    const count = counts[area];
    for (let i = 0; i < count; i += 1) {
      const id = nextSequentialId("GUIDE_", 4, [...guides, ...created].map((row) => row.Guide_ID));
      const slot = new Date(now.getTime() + (created.length + 1) * 2 * 60 * 60 * 1000);
      const { date, time } = toEasternDateTime(slot);
      const blog = latestByArea(blogs, area) ?? blogs[blogs.length - 1];
      const linkedBlogId = blog?.Blog_ID ?? "";

      created.push({
        Guide_ID: id,
        Guide_Publish_Date: date,
        Guide_Publish_Time: time,
        Content_Area: area,
        Workflow_Status: "draft",
        Blog_ID: linkedBlogId,
        Guide_URL: "",
        Guide_Title: "",
        Guide_Keywords: "",
        Guide_Content: "",
        Writer_Brief: "",
        CTA_Target: "",
        Quality_Score: "",
        Quality_Checks: "",
        Related_Pins: "",
        Published_To_Public_At: ""
      });
    }
  }

  const nextRows = [...guides, ...created];
  const hydrated = await Promise.all(nextRows.map((row) => generateGuideDraftForRow(row, nextRows, blogs)));
  await saveRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides, hydrated);
  return { created: created.length };
}

export async function generateGuideTitlesAndKeywords(): Promise<{ updated: number }> {
  const guides = await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides);
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  let updated = 0;
  const nextGuides = [...guides];

  for (let index = 0; index < nextGuides.length; index += 1) {
    const row = nextGuides[index];
    if (!row.Guide_ID) row.Guide_ID = nextSequentialId("GUIDE_", 4, nextGuides.map((x) => x.Guide_ID));
    if (!row.Guide_Publish_Date || !row.Guide_Publish_Time) {
      const { date, time } = toEasternDateTime(new Date(Date.now() + index * 60 * 60 * 1000));
      row.Guide_Publish_Date = date;
      row.Guide_Publish_Time = time;
    }

    const generated = await generateGuideDraftForRow(row, nextGuides, blogs);
    nextGuides[index] = generated;
    updated += 1;
  }

  await saveRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides, nextGuides);
  return { updated };
}

export async function updateGuideRelatedPins(): Promise<{ updated: number }> {
  const guides = await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides);
  const pins = await loadRuntimeTab<PinEvergreenRow>(TAB_MAP.pins);

  guides.forEach((guide) => {
    const related = pins
      .filter((pin) => pin.Destination === guide.Guide_ID || (guide.Blog_ID && pin.Blog_ID === guide.Blog_ID))
      .map((pin) => pin.Pin_ID)
      .join(", ");
    guide.Related_Pins = related;
  });

  await saveRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides, guides);
  return { updated: guides.length };
}

export async function generateNewEmails(areaCounts?: Partial<Record<string, unknown>>): Promise<{ created: number }> {
  const emails = await loadRuntimeTab<EmailEvergreenRow>(TAB_MAP.emails);
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  const counts = parseAreaCounts(areaCounts);
  const now = new Date();
  const created: EmailEvergreenRow[] = [];

  for (const area of COMMAND_CENTER_CONTENT_AREAS) {
    const count = counts[area];
    for (let i = 0; i < count; i += 1) {
      const id = nextSequentialId("EMAIL_", 4, [...emails, ...created].map((row) => row.Email_ID));
      const slot = new Date(now.getTime() + (created.length + 1) * 24 * 60 * 60 * 1000);
      const { date, time } = toEasternDateTime(slot);
      const blog = latestByArea(blogs, area) ?? blogs[blogs.length - 1];
      const blogId = blog?.Blog_ID ?? "";

      created.push({
        Email_ID: id,
        Email_Publish_Date: date,
        Email_Publish_Time: time,
        Content_Area: area,
        Blog_ID: blogId,
        Email_Subject: "",
        Email_Content: emailDraftContent(area, blogId || "BLOG_0000")
      });
    }
  }

  await saveRuntimeTab<EmailEvergreenRow>(TAB_MAP.emails, [...emails, ...created]);
  return { created: created.length };
}

export async function generateEmailSubjects(): Promise<{ updated: number }> {
  const emails = await loadRuntimeTab<EmailEvergreenRow>(TAB_MAP.emails);
  let updated = 0;

  emails.forEach((row, index) => {
    if (!row.Email_Subject) {
      row.Email_Subject = emailSubjectFor(areaFromValue(String(row.Content_Area)), index);
      updated += 1;
    }
  });

  await saveRuntimeTab<EmailEvergreenRow>(TAB_MAP.emails, emails);
  return { updated };
}

function publishedBlogById(blogs: BlogEvergreenRow[]): Map<string, BlogEvergreenRow> {
  return new Map(blogs.map((blog) => [blog.Blog_ID, blog]));
}

function publishedGuideById(guides: GuideEvergreenRow[]): Map<string, GuideEvergreenRow> {
  return new Map(guides.map((guide) => [guide.Guide_ID, guide]));
}

function resolvePinDestinationPath(pin: PinEvergreenRow, blogs: BlogEvergreenRow[], guides: GuideEvergreenRow[]): string {
  if (pin.Destination.startsWith("/")) return pin.Destination;

  const blog = publishedBlogById(blogs).get(pin.Destination) ?? publishedBlogById(blogs).get(pin.Blog_ID);
  if (blog) return destinationPathForBlog(blog);

  const guide = publishedGuideById(guides).get(pin.Destination);
  if (guide?.Guide_URL) return destinationPathForGuide(guide);

  if (pin.UTM_URL.startsWith("/")) return pin.UTM_URL.split("?")[0] ?? "";
  return "";
}

function pinCaptionParts(pin: PinEvergreenRow, area: CommandCenterArea): { title: string; caption1: string; caption2: string; caption3: string } {
  const sentences = noDashText(pin.Pin_Caption)
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const overlay = overlayLines(pin.Pin_Overlay, area);
  const fallbackTitle = overlay.line1 || `${contentAreaLabel(area)} bathroom win`;

  return {
    title: fallbackTitle,
    caption1: sentences[0] ?? `${contentAreaLabel(area)} bathroom update you can start today.`,
    caption2: sentences[1] ?? overlay.line2,
    caption3: noDashText(pin.Pin_CTA || sentences[2] || "Open the plan and start today.")
  };
}

export async function publishApprovedBlogsToPublic(): Promise<Record<string, unknown>> {
  const blogsEvergreen = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  const syncedAt = publishTimestamp(new Date());
  let published = 0;
  let updated = 0;
  let skipped = 0;
  let blocked = 0;

  for (const row of blogsEvergreen) {
    if (!isPublishableWorkflowStatus(String(row.Workflow_Status ?? ""))) {
      skipped += 1;
      continue;
    }

    if (
      !isReadyForManualPublish({
        title: String(row.Blog_Title ?? ""),
        content: String(row.Blog_Content ?? ""),
        qualityScore: String(row.Quality_Score ?? ""),
        qualityChecks: String(row.Quality_Checks ?? "")
      })
    ) {
      blocked += 1;
      continue;
    }

    const blogPath = destinationPathForBlog(row);
    if (workflowStatusFrom(String(row.Workflow_Status ?? "")) === "published") updated += 1;
    else published += 1;

    row.Blog_URL = blogPath;
    row.Workflow_Status = "published";
    row.Published_To_Public_At = syncedAt;
  }

  await saveRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs, blogsEvergreen);
  return {
    published,
    updated,
    skipped,
    blocked,
    totalPublicBlogs: blogsEvergreen.filter((blog) => workflowStatusFrom(String(blog.Workflow_Status)) === "published").length
  };
}

export async function publishApprovedGuidesToPublic(): Promise<Record<string, unknown>> {
  const guidesEvergreen = await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides);
  const syncedAt = publishTimestamp(new Date());
  let published = 0;
  let updated = 0;
  let skipped = 0;
  let blocked = 0;

  for (const row of guidesEvergreen) {
    if (!isPublishableWorkflowStatus(String(row.Workflow_Status ?? ""))) {
      skipped += 1;
      continue;
    }

    if (
      !isReadyForManualPublish({
        title: String(row.Guide_Title ?? ""),
        content: String(row.Guide_Content ?? ""),
        qualityScore: String(row.Quality_Score ?? ""),
        qualityChecks: String(row.Quality_Checks ?? "")
      })
    ) {
      blocked += 1;
      continue;
    }

    const guidePath = destinationPathForGuide(row);
    if (workflowStatusFrom(String(row.Workflow_Status ?? "")) === "published") updated += 1;
    else published += 1;

    row.Guide_URL = guidePath;
    row.Workflow_Status = "published";
    row.Published_To_Public_At = syncedAt;
  }

  await saveRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides, guidesEvergreen);
  return {
    published,
    updated,
    skipped,
    blocked,
    totalPublicGuides: guidesEvergreen.filter((guide) => workflowStatusFrom(String(guide.Workflow_Status)) === "published").length
  };
}

export async function syncApprovedPinsToLegacy(): Promise<Record<string, unknown>> {
  const pinsEvergreen = await loadRuntimeTab<PinEvergreenRow>(TAB_MAP.pins);
  const publicBlogs = (await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs)).filter(
    (blog) => workflowStatusFrom(String(blog.Workflow_Status ?? "")) === "published"
  );
  const guidesEvergreen = (await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides)).filter((guide) => Boolean(guide.Guide_URL));
  const syncedAt = new Date().toISOString();
  let synced = 0;
  let updated = 0;
  let skipped = 0;
  const unresolvedDestinations: string[] = [];

  for (const row of pinsEvergreen) {
    if (!isPinSyncableWorkflowStatus(String(row.Workflow_Status ?? ""))) {
      skipped += 1;
      continue;
    }

    const missingFields = ["Media_URL", "Pin_Caption", "Pin_Overlay", "Pin_CTA"].filter((field) => !String(row[field as keyof PinEvergreenRow] ?? "").trim());
    if (missingFields.length > 0) {
      unresolvedDestinations.push(`${row.Pin_ID}:missing_${missingFields.join(",")}`);
      skipped += 1;
      continue;
    }

    const area = areaFromValue(String(row.Content_Area ?? ""));
    const destinationPath = resolvePinDestinationPath(row, publicBlogs, guidesEvergreen);
    if (!destinationPath) {
      unresolvedDestinations.push(row.Pin_ID);
      skipped += 1;
      continue;
    }

    const captions = pinCaptionParts(row, area);
    const overlay = overlayLines(row.Pin_Overlay, area);
    const utmUrl =
      row.UTM_URL.startsWith(destinationPath) || row.UTM_URL.startsWith(`${destinationPath}?`)
        ? row.UTM_URL
        : `${destinationPath}?utm_source=pinterest&utm_medium=organic&utm_campaign=evergreen&utm_content=${row.Pin_ID.toLowerCase().replace(/_/g, "-")}`;

    row.Destination = destinationPath;
    row.Pin_Overlay = `${overlay.line1}\n${overlay.line2}`.trim();
    row.Pin_Caption = noDashText(row.Pin_Caption || `${captions.caption1} ${captions.caption2}`);
    row.Pin_CTA = captions.caption3;
    row.UTM_URL = utmUrl;
    row.Prepared_For_Export_At = syncedAt;
    row.Workflow_Status = row.Pin_URL ? "posted" : "queued";
    if (row.Pin_URL) updated += 1;
    else synced += 1;
  }

  await saveRuntimeTab<PinEvergreenRow>(TAB_MAP.pins, pinsEvergreen);
  return {
    prepared: synced,
    updated,
    skipped,
    unresolvedDestinations,
    exportPath: "/api/admin/exports/pins"
  };
}

export async function listApprovedPinsForExport(): Promise<
  Array<{
    Pin_ID: string;
    Title: string;
    "Media URL": string;
    "Destination URL": string;
    "Pin URL": string;
    Description: string;
    Board: string;
    "Publish date": string;
    Overlay: string;
    CTA: string;
    Prompt: string;
    UTM_URL: string;
  }>
> {
  const pinsEvergreen = await loadRuntimeTab<PinEvergreenRow>(TAB_MAP.pins);
  const publicBlogs = (await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs)).filter(
    (blog) => workflowStatusFrom(String(blog.Workflow_Status ?? "")) === "published"
  );
  const publicGuides = (await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides)).filter(
    (guide) => workflowStatusFrom(String(guide.Workflow_Status ?? "")) === "published"
  );

  return pinsEvergreen
    .filter((pin) => {
      const status = workflowStatusFrom(String(pin.Workflow_Status ?? ""));
      return status === "approved" || status === "queued" || status === "posted";
    })
    .map((pin) => {
      const area = areaFromValue(String(pin.Content_Area ?? ""));
      const destinationPath = resolvePinDestinationPath(pin, publicBlogs, publicGuides) || pin.Destination;
      const captions = pinCaptionParts(pin, area);
      const publishedAt = parsePublishedAtIso(pin.Pin_Publish_Date, pin.Pin_Publish_Time);
      const utmUrl =
        pin.UTM_URL.startsWith(destinationPath) || pin.UTM_URL.startsWith(`${destinationPath}?`)
          ? pin.UTM_URL
          : `${destinationPath}?utm_source=pinterest&utm_medium=organic&utm_campaign=evergreen&utm_content=${pin.Pin_ID.toLowerCase().replace(/_/g, "-")}`;

      return {
        Pin_ID: pin.Pin_ID,
        Title: captions.title,
        "Media URL": pin.Media_URL,
        "Destination URL": destinationPath,
        "Pin URL": pin.Pin_URL || utmUrl,
        Description: noDashText(pin.Pin_Caption || `${captions.caption1} ${captions.caption2} ${captions.caption3}`),
        Board: `Diyesu Decor ${contentAreaLabel(area)}`,
        "Publish date": publishedAt,
        Overlay: pin.Pin_Overlay,
        CTA: pin.Pin_CTA || captions.caption3,
        Prompt: pin.Media_Prompt,
        UTM_URL: utmUrl
      };
    });
}

function nextCustomerId(existing: CustomerEvergreenRow[]): string {
  return nextSequentialId("USER_", 5, existing.map((row) => row.User_ID));
}

export async function upsertCustomerFromSignup(input: {
  email: string;
  contentAreas: string[];
  createdAtIso?: string;
}): Promise<CustomerEvergreenRow> {
  const rows = await loadRuntimeTab<CustomerEvergreenRow>(TAB_MAP.customers);
  const createdAt = input.createdAtIso ? new Date(input.createdAtIso) : new Date();
  const when = toEasternDateTime(createdAt);
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedAreas = normalizeContentAreas(input.contentAreas);

  const existing = rows.find((row) => row.User_Email.trim().toLowerCase() === normalizedEmail);
  const content = normalizedAreas.join(", ");

  if (existing) {
    existing.User_Date_Email = when.date;
    existing.User_Time_Email = when.time;
    existing.Content_Area = content || existing.Content_Area;
    await saveRuntimeTab<CustomerEvergreenRow>(TAB_MAP.customers, rows);
    return existing;
  }

  const created: CustomerEvergreenRow = {
    User_ID: nextCustomerId(rows),
    User_Email: input.email,
    User_Date_Email: when.date,
    User_Time_Email: when.time,
    Content_Area: content,
    Purchases: ""
  };
  await saveRuntimeTab<CustomerEvergreenRow>(TAB_MAP.customers, [...rows, created]);
  return created;
}

export async function refreshCustomersFromLeads(): Promise<{ added: number }> {
  const leads = await loadRuntimeTab<Record<string, string>>("Leads");
  const customers = await loadRuntimeTab<CustomerEvergreenRow>(TAB_MAP.customers);
  let nextRows = [...customers];
  let added = 0;

  for (const lead of leads) {
    const email = String(lead.Email ?? "").trim();
    if (!email) continue;
    const exists = nextRows.some((row) => row.User_Email.trim().toLowerCase() === email.toLowerCase());
    if (exists) continue;

    const created = await upsertCustomerFromSignup({
      email,
      createdAtIso: String(lead.Created_At ?? "") || undefined,
      contentAreas: normalizeContentAreas([String(lead.Pillar_Interest ?? "")])
    });
    nextRows = await loadRuntimeTab<CustomerEvergreenRow>(TAB_MAP.customers);
    if (created) added += 1;
  }

  return { added };
}

function inferProductLinks(productId: string, blogs: BlogEvergreenRow[], guides: GuideEvergreenRow[]): { blogIds: string; guideIds: string } {
  const key = productId === "PRODUCT_0001" ? "blueprint" : productId === "PRODUCT_0002" ? "plant" : "guide";
  const blogIds = blogs
    .filter((blog) => noDashText(`${blog.Blog_Title} ${blog.Blog_Content}`).toLowerCase().includes(key))
    .map((blog) => blog.Blog_ID)
    .join(", ");
  const guideIds = guides
    .filter((guide) => noDashText(`${guide.Guide_Title} ${guide.Guide_Content}`).toLowerCase().includes(key))
    .map((guide) => guide.Guide_ID)
    .join(", ");
  return { blogIds, guideIds };
}

export async function updateProductStats(): Promise<{ updated: number }> {
  await bootstrapEvergreenProducts();
  const products = await loadRuntimeTab<ProductEvergreenRow>(TAB_MAP.products);
  const customers = await loadRuntimeTab<CustomerEvergreenRow>(TAB_MAP.customers);
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  const guides = await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides);

  products.forEach((product) => {
    const sales = customers.reduce((sum, customer) => {
      const purchases = String(customer.Purchases ?? "")
        .split(/[;,]/)
        .map((item) => item.trim())
        .filter(Boolean);
      return sum + purchases.filter((id) => id === product.Product_ID).length;
    }, 0);

    const price = PRODUCT_PRICES[product.Product_ID] ?? 19;
    const revenue = sales * price;
    const links = inferProductLinks(product.Product_ID, blogs, guides);

    product.Product_Sales = String(sales);
    product.Product_Revenue = String(revenue);
    product.Blog_ID = links.blogIds;
    product.Guide_ID = links.guideIds;
    if (!product.Product_Date) product.Product_Date = toEasternDateTime(new Date()).date;
  });

  await saveRuntimeTab<ProductEvergreenRow>(TAB_MAP.products, products);
  return { updated: products.length };
}

export async function runCommandCenterAction(action: string, payload?: Record<string, unknown>): Promise<Record<string, unknown>> {
  switch (action) {
    case "generate_new_pins":
      return generateNewPins(Number(payload?.count ?? 25));
    case "generate_overlay_cta":
      return generatePinOverlayAndCta(Number(payload?.count ?? 25));
    case "generate_new_blogs":
      return generateNewBlogs(payload?.areaCounts as Partial<Record<string, unknown>>);
    case "generate_blog_titles_keywords":
      return generateBlogTitlesAndKeywords();
    case "refresh_blog_quality_checks":
      return refreshBlogQualityChecks();
    case "update_blog_related_pins":
      return updateBlogRelatedPins();
    case "publish_approved_blogs":
      return publishApprovedBlogsToPublic();
    case "generate_new_guides":
      return generateNewGuides(payload?.areaCounts as Partial<Record<string, unknown>>);
    case "generate_guide_titles_keywords":
      return generateGuideTitlesAndKeywords();
    case "refresh_guide_quality_checks":
      return refreshGuideQualityChecks();
    case "update_guide_related_pins":
      return updateGuideRelatedPins();
    case "publish_approved_guides":
      return publishApprovedGuidesToPublic();
    case "generate_new_emails":
      return generateNewEmails(payload?.areaCounts as Partial<Record<string, unknown>>);
    case "generate_email_subjects":
      return generateEmailSubjects();
    case "prepare_approved_pins_for_export":
      return syncApprovedPinsToLegacy();
    case "refresh_customers":
      return refreshCustomersFromLeads();
    case "update_product_stats":
      return updateProductStats();
    default:
      return { ok: false, error: `Unsupported action: ${action}`, requestId: randomUUID() };
  }
}

export interface CommandCenterKpis {
  totalPins: number;
  pinsMissingMedia: number;
  pinsPosted: number;
  pinsReadyToSync: number;
  totalBlogs: number;
  blogsReadyToPublish: number;
  totalGuides: number;
  guidesReadyToPublish: number;
  totalEmails: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
}

export interface CommandCenterActivity {
  label: string;
  detail: string;
  tone: "green" | "gold" | "blue" | "red" | "neutral";
}

export interface CommandCenterDashboardSnapshot {
  kpis: CommandCenterKpis;
  activity: CommandCenterActivity[];
  attention: CommandCenterActivity[];
}

function commandCenterKpisFromRows(params: {
  pins: PinEvergreenRow[];
  blogs: BlogEvergreenRow[];
  guides: GuideEvergreenRow[];
  emails: EmailEvergreenRow[];
  customers: CustomerEvergreenRow[];
  products: ProductEvergreenRow[];
}): CommandCenterKpis {
  const revenue = params.products.reduce((sum, product) => sum + (Number(product.Product_Revenue) || 0), 0);

  return {
    totalPins: params.pins.length,
    pinsMissingMedia: params.pins.filter((pin) => !pin.Media_URL).length,
    pinsPosted: params.pins.filter((pin) => Boolean(pin.Pin_URL)).length,
    pinsReadyToSync: params.pins.filter((pin) => workflowStatusFrom(String(pin.Workflow_Status ?? "")) === "approved").length,
    totalBlogs: params.blogs.length,
    blogsReadyToPublish: params.blogs.filter((blog) => workflowStatusFrom(String(blog.Workflow_Status ?? "")) === "approved").length,
    totalGuides: params.guides.length,
    guidesReadyToPublish: params.guides.filter((guide) => workflowStatusFrom(String(guide.Workflow_Status ?? "")) === "approved").length,
    totalEmails: params.emails.length,
    totalCustomers: params.customers.length,
    totalProducts: params.products.length,
    totalRevenue: revenue
  };
}

export async function commandCenterDashboardSnapshot(): Promise<CommandCenterDashboardSnapshot> {
  const pins = await loadRuntimeTab<PinEvergreenRow>(TAB_MAP.pins);
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  const guides = await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides);
  const emails = await loadRuntimeTab<EmailEvergreenRow>(TAB_MAP.emails);
  const customers = await loadRuntimeTab<CustomerEvergreenRow>(TAB_MAP.customers);
  const products = await loadRuntimeTab<ProductEvergreenRow>(TAB_MAP.products);

  const kpis = commandCenterKpisFromRows({ pins, blogs, guides, emails, customers, products });

  const attention: CommandCenterActivity[] = [
    kpis.pinsMissingMedia > 0
      ? {
          label: "Pins need visuals",
          detail: `${kpis.pinsMissingMedia} pin rows still need Media_URL before export.`,
          tone: "red"
        }
      : null,
    kpis.blogsReadyToPublish > 0
      ? {
          label: "Blogs ready for final publish",
          detail: `${kpis.blogsReadyToPublish} approved blog rows can be pushed live after review.`,
          tone: "green"
        }
      : null,
    kpis.guidesReadyToPublish > 0
      ? {
          label: "Guides ready for final publish",
          detail: `${kpis.guidesReadyToPublish} approved guide rows can be pushed live after review.`,
          tone: "green"
        }
      : null,
    kpis.pinsReadyToSync > 0
      ? {
          label: "Pins ready for export prep",
          detail: `${kpis.pinsReadyToSync} approved pins are waiting for the manual export gate.`,
          tone: "gold"
        }
      : null,
    kpis.totalCustomers > 0
      ? {
          label: "Signup table has leads",
          detail: `${kpis.totalCustomers} customer rows are available for audience review.`,
          tone: "blue"
        }
      : null
  ].filter(Boolean) as CommandCenterActivity[];

  const latestPublishedBlog = [...blogs].reverse().find((blog) => workflowStatusFrom(String(blog.Workflow_Status ?? "")) === "published");
  const latestPublishedGuide = [...guides].reverse().find((guide) => workflowStatusFrom(String(guide.Workflow_Status ?? "")) === "published");

  const activity: CommandCenterActivity[] = [
    latestPublishedBlog
      ? {
          label: "Latest blog published",
          detail: latestPublishedBlog.Blog_Title || latestPublishedBlog.Blog_ID,
          tone: "green"
        }
      : {
          label: "Blog publishing queue",
          detail: `${kpis.totalBlogs} blog rows are in the live command-center table.`,
          tone: "neutral"
        },
    latestPublishedGuide
      ? {
          label: "Latest guide published",
          detail: latestPublishedGuide.Guide_Title || latestPublishedGuide.Guide_ID,
          tone: "green"
        }
      : {
          label: "Guide publishing queue",
          detail: `${kpis.totalGuides} guide rows are in the live command-center table.`,
          tone: "neutral"
        },
    {
      label: "Pinterest export status",
      detail: `${kpis.pinsPosted} pins have public URLs; ${kpis.pinsReadyToSync} are approved for prep.`,
      tone: kpis.pinsReadyToSync > 0 ? "gold" : "neutral"
    },
    {
      label: "Product tracking",
      detail: `$${kpis.totalRevenue} revenue tracked across ${kpis.totalProducts} products.`,
      tone: kpis.totalRevenue > 0 ? "green" : "neutral"
    }
  ];

  return { kpis, activity, attention };
}

export async function commandCenterKpis(): Promise<CommandCenterKpis> {
  const snapshot = await commandCenterDashboardSnapshot();
  return snapshot.kpis;
}
