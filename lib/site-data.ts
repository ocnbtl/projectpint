import { contentAreasForPillar, primaryContentAreaForPillar, primaryLegacyPillarForArea } from "./constants.ts";
import { excerptFromMarkdown } from "./content-render.ts";
import { loadRuntimeTab } from "./runtime-store.ts";
import type { BlogDraft, ContentArea } from "./types.ts";

interface BlogEvergreenShape {
  Blog_ID: string;
  Blog_Publish_Date: string;
  Blog_Publish_Time: string;
  Content_Area: string;
  Workflow_Status: string;
  Blog_URL: string;
  Blog_Title: string;
  Blog_Keywords: string;
  Blog_Content: string;
  Related_Pins: string;
  Published_To_Public_At: string;
}

interface GuideEvergreenShape {
  Guide_ID: string;
  Guide_Publish_Date: string;
  Guide_Publish_Time: string;
  Content_Area: string;
  Workflow_Status: string;
  Blog_ID: string;
  Guide_URL: string;
  Guide_Title: string;
  Guide_Keywords: string;
  Guide_Content: string;
  Related_Pins: string;
  Published_To_Public_At: string;
}

export interface HubDefinition {
  slug: string;
  title: string;
  description: string;
  outcome: string;
  area: ContentArea;
  keywordHints: string[];
}

export interface PublicGuideItem {
  Guide_ID: string;
  slug: string;
  title: string;
  summary: string;
  area: ContentArea;
  content: string;
  relatedBlogId: string;
  status: string;
}

export const hubs: HubDefinition[] = [
  {
    slug: "plants",
    title: "Plants",
    description: "Plant choices for humid bathrooms with low-maintenance placement ideas.",
    outcome: "Keep greenery alive in low light bathrooms with less trial and error.",
    area: "Plants",
    keywordHints: ["plant", "humidity", "bathroom plant", "low light", "shelf"]
  },
  {
    slug: "mirror",
    title: "Mirror",
    description: "Mirror choices and placement tips that improve function and visual balance.",
    outcome: "Improve lighting bounce and daily routines with one mirror upgrade.",
    area: "Mirror",
    keywordHints: ["mirror", "placement", "reflection", "vanity", "frame"]
  },
  {
    slug: "storage",
    title: "Storage",
    description: "Storage systems that keep counters clear and routines simple.",
    outcome: "Cut clutter by giving each daily item a clear home.",
    area: "Storage",
    keywordHints: ["storage", "organization", "clutter", "counter", "caddy"]
  },
  {
    slug: "lighting",
    title: "Lighting",
    description: "Bathroom lighting updates for better visibility and calmer style.",
    outcome: "Remove dark zones and get cleaner light around sink and shower.",
    area: "Lighting",
    keywordHints: ["lighting", "vanity light", "brightness", "bulb", "glow"]
  },
  {
    slug: "shower",
    title: "Shower",
    description: "Shower upgrades that improve comfort, flow, and cleanup.",
    outcome: "Make showers easier to use with better layout and grab zones.",
    area: "Shower",
    keywordHints: ["shower", "caddy", "shower storage", "shower routine", "soap"]
  },
  {
    slug: "renter",
    title: "Renter",
    description: "Renter safe upgrades that avoid permanent damage and permit issues.",
    outcome: "Improve your bathroom while protecting your deposit.",
    area: "Renter",
    keywordHints: ["renter", "no drill", "temporary", "removable", "deposit"]
  },
  {
    slug: "diy",
    title: "DIY",
    description: "Step by step bathroom DIY projects for normal tools and schedules.",
    outcome: "Finish one practical project this week without guesswork.",
    area: "DIY",
    keywordHints: ["diy", "project", "weekend", "tools", "step by step"]
  },
  {
    slug: "extreme-budget",
    title: "Extreme Budget",
    description: "Ultra low cost bathroom improvements with clear spending limits.",
    outcome: "Get visible results while keeping total cost tight.",
    area: "ExtremeBudget",
    keywordHints: ["budget", "cheap", "under 75", "low cost", "save money"]
  }
];

function scoreHubKeywords(text: string, hub: HubDefinition): number {
  return hub.keywordHints.reduce((score, token) => score + Number(text.includes(token.toLowerCase())), 0);
}

function inferBlogAreaFromKeywords(blog: Pick<BlogDraft, "Slug" | "Title" | "Keyword_Target">): ContentArea | null {
  const haystack = `${blog.Slug} ${blog.Title} ${blog.Keyword_Target}`.toLowerCase();
  let bestHub: HubDefinition | null = null;
  let bestScore = 0;

  for (const hub of hubs) {
    const score = scoreHubKeywords(haystack, hub);
    if (score > bestScore) {
      bestScore = score;
      bestHub = hub;
    }
  }

  return bestHub && bestScore > 0 ? bestHub.area : null;
}

export function contentAreaForBlog(blog: Pick<BlogDraft, "Pillar" | "Slug" | "Title" | "Keyword_Target">): ContentArea {
  return inferBlogAreaFromKeywords(blog) ?? primaryContentAreaForPillar(blog.Pillar);
}

export function blogMatchesArea(blog: Pick<BlogDraft, "Pillar" | "Slug" | "Title" | "Keyword_Target">, area: ContentArea): boolean {
  const inferred = inferBlogAreaFromKeywords(blog);
  if (inferred) return inferred === area;
  return contentAreasForPillar(blog.Pillar).includes(area);
}

function workflowToLegacyStatus(value: string): BlogDraft["Status"] {
  const normalized = value.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (normalized === "published") return "published";
  if (normalized === "approved") return "approved";
  return "draft";
}

function slugFromPathOrTitle(pathValue: string, fallback: string, id: string): string {
  if (pathValue.startsWith("/")) {
    return pathValue.split("/").filter(Boolean).at(-1) ?? id.toLowerCase();
  }
  const source = pathValue || fallback || id;
  return source
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function firstKeyword(value: string): string {
  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .find(Boolean) ?? "";
}

function mapEvergreenBlogToPublic(row: BlogEvergreenShape): BlogDraft {
  const area = (hubs.find((hub) => hub.area === row.Content_Area)?.area ?? "DIY") as ContentArea;
  const slug = slugFromPathOrTitle(row.Blog_URL, row.Blog_Title, row.Blog_ID);
  const title = row.Blog_Title || slug.replace(/-/g, " ");
  const keyword = firstKeyword(row.Blog_Keywords);

  return {
    Blog_ID: row.Blog_ID,
    Slug: slug,
    Title: title,
    Pillar: primaryLegacyPillarForArea(area),
    Keyword_Target: keyword,
    Outline: "Evergreen admin source",
    Draft_Markdown: row.Blog_Content || `# ${title}\n\nThis blog is being prepared.`,
    Internal_Links: "/start-here, /lead-magnets/plant-picker, /products/renter-bathroom-upgrade-blueprint",
    CTA_Block: "Subscribe for weekly renter safe bathroom plans.",
    Status: workflowToLegacyStatus(row.Workflow_Status),
    Human_Approved: row.Workflow_Status.trim().toLowerCase() !== "draft",
    Published_At: row.Published_To_Public_At || "",
    Ad_Enabled: true,
    Contains_Affiliate_Links: false,
    Affiliate_Disclosure_Required: false
  };
}

function mapEvergreenGuide(row: GuideEvergreenShape): PublicGuideItem {
  const area = (hubs.find((hub) => hub.area === row.Content_Area)?.area ?? "DIY") as ContentArea;
  const slug = slugFromPathOrTitle(row.Guide_URL, row.Guide_Title, row.Guide_ID);
  return {
    Guide_ID: row.Guide_ID,
    slug,
    title: row.Guide_Title || slug.replace(/-/g, " "),
    summary: excerptFromMarkdown(row.Guide_Content, 140),
    area,
    content: row.Guide_Content || `# ${row.Guide_Title || slug}\n\nThis guide is being prepared.`,
    relatedBlogId: row.Blog_ID,
    status: row.Workflow_Status
  };
}

export async function readBlogs(): Promise<BlogDraft[]> {
  const evergreen = await loadRuntimeTab<BlogEvergreenShape>("Blogs_Evergreen");
  return evergreen.map(mapEvergreenBlogToPublic);
}

export async function readGuides(): Promise<PublicGuideItem[]> {
  const evergreen = await loadRuntimeTab<GuideEvergreenShape>("Guides_Evergreen");
  return evergreen.map(mapEvergreenGuide);
}

export async function findGuidesForHub(hub: HubDefinition, limit = 6): Promise<PublicGuideItem[]> {
  const all = await readGuides();
  const published = all.filter((guide) => guide.status.trim().toLowerCase() === "published");
  const source = published.length > 0 ? published : all;
  return source.filter((guide) => guide.area === hub.area).slice(0, limit);
}

export async function findGuideBySlug(slug: string): Promise<PublicGuideItem | undefined> {
  const guides = await readGuides();
  return guides.find((guide) => guide.slug === slug);
}
