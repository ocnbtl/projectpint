import fs from "node:fs";
import path from "node:path";
import type { BlogDraft } from "./types";

export const hubs = [
  {
    slug: "renter-friendly-upgrades",
    title: "Renter-Friendly Upgrades",
    description: "Temporary, removable, no-permit upgrades that still create visual impact."
  },
  {
    slug: "budget-diy-transformations",
    title: "Budget DIY Transformations",
    description: "Low-cost bathroom projects with visible before/after change."
  },
  {
    slug: "small-bathroom-space-hacks",
    title: "Small Bathroom Space Hacks",
    description: "Layout tricks and tiny-space optimization for daily flow."
  },
  {
    slug: "storage-and-clutter-to-calm",
    title: "Storage + Clutter-to-Calm",
    description: "Systems that keep counters clear and routines simple."
  },
  {
    slug: "styling-mirrors-lighting-color",
    title: "Styling: Mirrors, Lighting, Color",
    description: "Maximalist-but-cheap styling systems with practical constraints."
  },
  {
    slug: "bathroom-plants-biophilic-vibe",
    title: "Bathroom Plants + Biophilic Vibe",
    description: "Low-light, humidity-friendly plants and renter-safe placement."
  }
];

export function readBlogs(): BlogDraft[] {
  const p = path.join(process.cwd(), "data", "sheets", "Blog_Posts.json");
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as BlogDraft[];
  } catch {
    return [];
  }
}
