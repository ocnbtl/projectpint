import fs from "node:fs";
import path from "node:path";
import { excerptFromMarkdown, titleFromSlug } from "./content-render";
import type { BlogDraft, Pillar } from "./types";

export interface HubDefinition {
  slug: string;
  title: string;
  description: string;
  outcome: string;
  primaryPillar: Pillar;
  keywordHints: string[];
}

export interface MicroGuideItem {
  slug: string;
  title: string;
  summary: string;
}

export const hubs: HubDefinition[] = [
  {
    slug: "renter-friendly-upgrades",
    title: "Renter-Friendly Upgrades",
    description: "Temporary, removable, no-permit upgrades with visible improvement.",
    outcome: "Protect your deposit while making the bathroom easier to use.",
    primaryPillar: "RenterFriendly",
    keywordHints: ["renter", "no-drill", "removable", "temporary", "deposit"]
  },
  {
    slug: "budget-diy-transformations",
    title: "Budget DIY Transformations",
    description: "Low cost projects that have a noticeable before/after difference.",
    outcome: "Get a finished look without overspending.",
    primaryPillar: "BudgetDIY",
    keywordHints: ["budget", "under-75", "under", "refresh", "cheap"]
  },
  {
    slug: "small-bathroom-space-hacks",
    title: "Small Bathroom Space Hacks",
    description: "Layout strategies and tiny-space optimization for better bathroom flow.",
    outcome: "Stop bottlenecks around sink, shower, and storage zones.",
    primaryPillar: "SmallSpace",
    keywordHints: ["small", "tiny", "layout", "space", "flow"]
  },
  {
    slug: "storage-and-clutter-to-calm",
    title: "Keep the Kids Organized",
    description: "Parent-friendly setups for bath toys, toothbrushes, and school-morning routines.",
    outcome: "Cut bathroom chaos by giving each kid item a clear home.",
    primaryPillar: "StorageOrganization",
    keywordHints: ["storage", "organ", "bin", "label", "clutter", "vanity", "kids", "family"]
  },
  {
    slug: "styling-mirrors-lighting-color",
    title: "Styling: Mirrors, Lighting, Color",
    description: "Mirror, lighting, and color ideas to make your bathroom feel brighter and cohesive.",
    outcome: "Refresh your bathroom style with updates that fit your personal aesthetic.",
    primaryPillar: "Styling",
    keywordHints: ["color", "style", "mirror", "lighting", "backsplash", "texture"]
  },
  {
    slug: "bathroom-plants-biophilic-vibe",
    title: "Bathroom Plants",
    description: "Plant choices for humid bathrooms with renter-safe placement ideas.",
    outcome: "Add life to low light bathrooms with less plant failure.",
    primaryPillar: "PlantsBiophilic",
    keywordHints: ["plant", "humidity", "low-light", "biophilic", "shelf"]
  }
];

export function pillarLabel(pillar: Pillar): string {
  const labels: Record<Pillar, string> = {
    RenterFriendly: "Renter-Friendly",
    BudgetDIY: "Budget DIY",
    SmallSpace: "Small Space",
    StorageOrganization: "Storage & Organization",
    Styling: "Styling",
    PlantsBiophilic: "Plants & Biophilic"
  };
  return labels[pillar];
}

export function readBlogs(): BlogDraft[] {
  const p = path.join(process.cwd(), "data", "sheets", "Blog_Posts.json");
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as BlogDraft[];
  } catch {
    return [];
  }
}

export function readMicroGuides(): MicroGuideItem[] {
  const folder = path.join(process.cwd(), "micro_guides");
  if (!fs.existsSync(folder)) return [];

  return fs
    .readdirSync(folder)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(folder, file), "utf8");
      const titleLine = raw
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.startsWith("# "));
      const title = titleLine ? titleLine.slice(2).trim() : titleFromSlug(slug);
      return {
        slug,
        title,
        summary: excerptFromMarkdown(raw)
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function findMicroGuidesForHub(hub: HubDefinition, limit = 6): MicroGuideItem[] {
  const all = readMicroGuides();
  const matches = all.filter((guide) => {
    const haystack = `${guide.slug} ${guide.title}`.toLowerCase();
    return hub.keywordHints.some((token) => haystack.includes(token.toLowerCase()));
  });
  return matches.slice(0, limit);
}
