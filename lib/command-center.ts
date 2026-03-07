import { randomUUID } from "node:crypto";
import {
  COMMAND_CENTER_CONTENT_AREAS,
  contentAreaLabel,
  normalizeContentArea,
  normalizeContentAreas
} from "./constants.ts";
import { loadRuntimeTab, saveRuntimeTab } from "./runtime-store.ts";

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

function blogDraftContent(area: CommandCenterArea): string {
  const intro = `If your ${areaPhrase(area)} setup feels frustrating, this guide gives you a practical path you can follow right away.`;
  const body =
    "Start by choosing one problem that slows your daily routine. Map the exact constraint, then apply one focused improvement. Keep the scope small so you can finish and keep momentum.";
  const steps =
    "Use this sequence: identify one pain point, set a clear budget range, gather only needed tools, complete one anchor change, then run a seven day check for real impact.";
  const close =
    "This post is built for renters, practical DIY work, and budget first decisions that still look intentional.";
  return noDashText(`${intro}\n\n${body}\n\n${steps}\n\n${close}`);
}

function guideDraftContent(area: CommandCenterArea, blogId: string): string {
  const intro = `This one hour ${areaPhrase(area)} guide is linked to ${blogId} and focuses on one clear improvement you can finish today.`;
  const steps =
    "Step one: gather materials in five minutes. Step two: prep the zone in ten minutes. Step three: complete one change in thirty minutes. Step four: cleanup and test in fifteen minutes.";
  const close = "If this worked, return to the related blog for the full plan and the next best step.";
  return noDashText(`${intro}\n\n${steps}\n\n${close}`);
}

function emailDraftContent(area: CommandCenterArea, blogId: string): string {
  const intro = `Quick update from Diyesu Decor: this week we focused on ${areaPhrase(area)} upgrades that make daily routines easier.`;
  const value =
    "Choose one small change, complete it today, and keep the rest simple. You do not need a full remodel to feel a clear result.";
  const close = `If you want the full walkthrough, open our latest blog in this area: ${blogId}.`;
  return noDashText(`${intro}\n\n${value}\n\n${close}`);
}

function blogTitleFor(area: CommandCenterArea, index: number): string {
  const templates: Record<CommandCenterArea, string[]> = {
    Plants: [
      "Bathroom Plants That Handle Low Light and Humidity",
      "Simple Plant Choices for Humid Bathrooms",
      "Plant Placement for Bathrooms That Stay Alive"
    ],
    Mirror: ["Mirror Upgrades That Improve Bathroom Flow", "Mirror Placement Fixes for Better Light", "Bathroom Mirror Changes That Feel Intentional"],
    Storage: ["Storage Zones That Cut Bathroom Clutter", "Bathroom Storage Moves That Save Time", "Simple Storage Layouts for Busy Bathrooms"],
    Lighting: ["Bathroom Lighting Fixes for Clearer Routines", "Lighting Upgrades That Improve Mirror Use", "Practical Bathroom Lighting for Daily Tasks"],
    Shower: ["Shower Setup Fixes for Cleaner Daily Flow", "Shower Storage That Stays Organized", "Shower Upgrades You Can Finish This Week"],
    Renter: [
      "Renter Safe Bathroom Upgrades You Can Start Today",
      "No Drill Bathroom Improvements for Renters",
      "Deposit Safe Bathroom Changes That Still Look Good"
    ],
    DIY: ["DIY Bathroom Upgrades with Clear Steps", "Weekend DIY Bathroom Plan for Beginners", "Practical DIY Bathroom Changes That Last"],
    ExtremeBudget: [
      "Bathroom Upgrades Under 75 Dollars That Work",
      "Low Cost Bathroom Fixes with Real Impact",
      "Extreme Budget Bathroom Changes You Can Finish Today"
    ]
  };
  return noDashText(templates[area][index % templates[area].length]);
}

function keywordsFor(area: CommandCenterArea): string {
  return AREA_KEYWORDS[area].slice(0, 4).map((kw) => noDashText(kw)).join(" | ");
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

export async function loadEvergreenTab(key: TabKey): Promise<Record<string, unknown>[]> {
  return loadRuntimeTab<Record<string, unknown>>(TAB_MAP[key]);
}

export async function saveEvergreenTab(key: TabKey, rows: Record<string, unknown>[]): Promise<void> {
  await saveRuntimeTab(TAB_MAP[key], rows);
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
        Blog_Content: blogDraftContent(area),
        Related_Pins: "",
        Published_To_Public_At: ""
      });
    }
  }

  await saveRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs, [...blogs, ...created]);
  return { created: created.length };
}

export async function generateBlogTitlesAndKeywords(): Promise<{ updated: number }> {
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  let updated = 0;

  blogs.forEach((row, index) => {
    const area = areaFromValue(String(row.Content_Area));
    if (!row.Blog_Title) {
      row.Blog_Title = blogTitleFor(area, index);
      updated += 1;
    }
    if (!row.Blog_Keywords) {
      row.Blog_Keywords = keywordsFor(area);
    }
  });

  await saveRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs, blogs);
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
        Guide_Content: guideDraftContent(area, linkedBlogId || "BLOG_0000"),
        Related_Pins: "",
        Published_To_Public_At: ""
      });
    }
  }

  await saveRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides, [...guides, ...created]);
  return { created: created.length };
}

export async function generateGuideTitlesAndKeywords(): Promise<{ updated: number }> {
  const guides = await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides);
  let updated = 0;

  guides.forEach((row, index) => {
    const area = areaFromValue(String(row.Content_Area));
    if (!row.Guide_Title) {
      row.Guide_Title = noDashText(`${area} quick guide you can finish in under one hour`);
      updated += 1;
    }
    if (!row.Guide_Keywords) row.Guide_Keywords = keywordsFor(area);
    if (!row.Guide_Content) row.Guide_Content = guideDraftContent(area, row.Blog_ID || "BLOG_0000");
    if (!row.Guide_ID) row.Guide_ID = nextSequentialId("GUIDE_", 4, guides.map((x) => x.Guide_ID));
    if (!row.Guide_Publish_Date || !row.Guide_Publish_Time) {
      const { date, time } = toEasternDateTime(new Date(Date.now() + index * 60 * 60 * 1000));
      row.Guide_Publish_Date = date;
      row.Guide_Publish_Time = time;
    }
  });

  await saveRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides, guides);
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
  const syncedAt = new Date().toISOString();
  let published = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of blogsEvergreen) {
    if (!isPublishableWorkflowStatus(String(row.Workflow_Status ?? ""))) {
      skipped += 1;
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
  return { published, updated, skipped, totalPublicBlogs: blogsEvergreen.filter((blog) => workflowStatusFrom(String(blog.Workflow_Status)) === "published").length };
}

export async function publishApprovedGuidesToPublic(): Promise<Record<string, unknown>> {
  const guidesEvergreen = await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides);
  const syncedAt = new Date().toISOString();
  let published = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of guidesEvergreen) {
    if (!isPublishableWorkflowStatus(String(row.Workflow_Status ?? ""))) {
      skipped += 1;
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
    case "update_blog_related_pins":
      return updateBlogRelatedPins();
    case "publish_approved_blogs":
      return publishApprovedBlogsToPublic();
    case "generate_new_guides":
      return generateNewGuides(payload?.areaCounts as Partial<Record<string, unknown>>);
    case "generate_guide_titles_keywords":
      return generateGuideTitlesAndKeywords();
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

export async function commandCenterKpis(): Promise<Record<string, number>> {
  const pins = await loadRuntimeTab<PinEvergreenRow>(TAB_MAP.pins);
  const blogs = await loadRuntimeTab<BlogEvergreenRow>(TAB_MAP.blogs);
  const guides = await loadRuntimeTab<GuideEvergreenRow>(TAB_MAP.guides);
  const emails = await loadRuntimeTab<EmailEvergreenRow>(TAB_MAP.emails);
  const customers = await loadRuntimeTab<CustomerEvergreenRow>(TAB_MAP.customers);
  const products = await loadRuntimeTab<ProductEvergreenRow>(TAB_MAP.products);

  const revenue = products.reduce((sum, product) => sum + (Number(product.Product_Revenue) || 0), 0);

  return {
    totalPins: pins.length,
    pinsMissingMedia: pins.filter((pin) => !pin.Media_URL).length,
    pinsPosted: pins.filter((pin) => Boolean(pin.Pin_URL)).length,
    pinsReadyToSync: pins.filter((pin) => workflowStatusFrom(String(pin.Workflow_Status ?? "")) === "approved").length,
    totalBlogs: blogs.length,
    blogsReadyToPublish: blogs.filter((blog) => workflowStatusFrom(String(blog.Workflow_Status ?? "")) === "approved").length,
    totalGuides: guides.length,
    guidesReadyToPublish: guides.filter((guide) => workflowStatusFrom(String(guide.Workflow_Status ?? "")) === "approved").length,
    totalEmails: emails.length,
    totalCustomers: customers.length,
    totalProducts: products.length,
    totalRevenue: revenue
  };
}
