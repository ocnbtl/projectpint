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
    slug: "plants",
    title: "Plants",
    description: "Plant choices for humid bathrooms with low-maintenance placement ideas.",
    outcome: "Keep greenery alive in low light bathrooms with less trial and error.",
    primaryPillar: "PlantsBiophilic",
    keywordHints: ["plant", "humidity", "bathroom plant", "low light", "shelf"]
  },
  {
    slug: "mirror",
    title: "Mirror",
    description: "Mirror choices and placement tips that improve function and visual balance.",
    outcome: "Improve lighting bounce and daily routines with one mirror upgrade.",
    primaryPillar: "Styling",
    keywordHints: ["mirror", "placement", "reflection", "vanity", "frame"]
  },
  {
    slug: "storage",
    title: "Storage",
    description: "Storage systems that keep counters clear and routines simple.",
    outcome: "Cut clutter by giving each daily item a clear home.",
    primaryPillar: "StorageOrganization",
    keywordHints: ["storage", "organization", "clutter", "counter", "caddy"]
  },
  {
    slug: "lighting",
    title: "Lighting",
    description: "Bathroom lighting updates for better visibility and calmer style.",
    outcome: "Remove dark zones and get cleaner light around sink and shower.",
    primaryPillar: "Styling",
    keywordHints: ["lighting", "vanity light", "brightness", "bulb", "glow"]
  },
  {
    slug: "shower",
    title: "Shower",
    description: "Shower upgrades that improve comfort, flow, and cleanup.",
    outcome: "Make showers easier to use with better layout and grab zones.",
    primaryPillar: "SmallSpace",
    keywordHints: ["shower", "caddy", "shower storage", "shower routine", "soap"]
  },
  {
    slug: "renter",
    title: "Renter",
    description: "Renter safe upgrades that avoid permanent damage and permit issues.",
    outcome: "Improve your bathroom while protecting your deposit.",
    primaryPillar: "RenterFriendly",
    keywordHints: ["renter", "no drill", "temporary", "removable", "deposit"]
  },
  {
    slug: "diy",
    title: "DIY",
    description: "Step by step bathroom DIY projects for normal tools and schedules.",
    outcome: "Finish one practical project this week without guesswork.",
    primaryPillar: "BudgetDIY",
    keywordHints: ["diy", "project", "weekend", "tools", "step by step"]
  },
  {
    slug: "extreme-budget",
    title: "Extreme Budget",
    description: "Ultra low cost bathroom improvements with clear spending limits.",
    outcome: "Get visible results while keeping total cost tight.",
    primaryPillar: "BudgetDIY",
    keywordHints: ["budget", "cheap", "under 75", "low cost", "save money"]
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
