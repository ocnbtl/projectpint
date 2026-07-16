import { inspirationStyles, type InspirationItem } from "./redesign-data.ts";
import { DEFAULT_EDITORIAL_METADATA, type EditorialMetadata } from "./editorial-content.ts";
import { readPublishedManagedInspirations } from "./inspiration-admin.ts";
import { inspirationStyleLabel } from "./inspiration-shared.ts";

export interface PublicInspirationView {
  source: "static" | "managed";
  id: string;
  slug: string;
  name: string;
  description: string;
  body: string;
  style: string;
  tags: string[];
  area: string;
  cover: string;
  coverAlt: string;
  caption: string;
  credit: string;
  accent: string;
  items: InspirationItem[];
  metadata: EditorialMetadata;
  publishedAt: string;
}

function staticViews(): PublicInspirationView[] {
  return inspirationStyles.map((style) => ({
    source: "static",
    id: `static-${style.slug}`,
    slug: style.slug,
    name: style.name,
    description: style.description,
    body: "",
    style: style.slug,
    tags: [],
    area: "DIY",
    cover: style.cover,
    coverAlt: `${style.name} bathroom inspiration`,
    caption: "",
    credit: "",
    accent: style.accent,
    items: style.items,
    metadata: DEFAULT_EDITORIAL_METADATA,
    publishedAt: ""
  }));
}

export async function readPublicInspirationViews(): Promise<PublicInspirationView[]> {
  const managed = await readPublishedManagedInspirations();
  const staticEntries = staticViews();
  if (managed.length === 0) return staticEntries;

  const staticBySlug = new Map(staticEntries.map((entry) => [entry.slug, entry]));
  const managedViews = managed.map((entry): PublicInspirationView => {
    const styleFallback = staticBySlug.get(entry.style);
    return {
      source: "managed",
      id: entry.id,
      slug: entry.slug,
      name: entry.title,
      description: entry.description,
      body: entry.body,
      style: entry.style,
      tags: entry.tags,
      area: entry.area,
      cover: entry.heroImageUrl,
      coverAlt: entry.heroAlt,
      caption: entry.heroCaption,
      credit: entry.heroCredit,
      accent: styleFallback?.accent ?? "#5B8C6A",
      items: styleFallback?.items ?? [],
      metadata: entry.metadata,
      publishedAt: entry.publishedAt
    };
  });
  const managedBySlug = new Map(managedViews.map((entry) => [entry.slug, entry]));
  const merged = staticEntries.map((entry) => managedBySlug.get(entry.slug) ?? entry);
  const additions = managedViews
    .filter((entry) => !staticBySlug.has(entry.slug))
    .sort((left, right) => left.name.localeCompare(right.name));
  return [...merged, ...additions];
}

export async function findPublicInspirationView(slug: string): Promise<PublicInspirationView | undefined> {
  return (await readPublicInspirationViews()).find((entry) => entry.slug === slug);
}

export function inspirationStyleName(entry: PublicInspirationView): string {
  return inspirationStyleLabel(entry.style);
}
