import { readdir } from "node:fs/promises";
import path from "node:path";
import type { MetadataRoute } from "next";
import { readPublicInspirationViews } from "../lib/inspiration-content";
import { absoluteUrl } from "../lib/seo";
import { hubs, readAllTagArchives, readPublishedBlogs, readPublishedGuides } from "../lib/site-data";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "/",
  "/start-here",
  "/inspiration",
  "/areas",
  "/blog",
  "/about",
  "/plant-picker",
  "/blueprint",
  "/legal/privacy",
  "/legal/terms",
  "/legal/affiliate-disclosure"
];

const PRODUCT_SLUGS = ["bathroom-plant-picks-upgrade"];

async function microGuideSlugs(): Promise<string[]> {
  try {
    const files = await readdir(path.join(process.cwd(), "micro_guides"));
    return files
      .filter((file) => file.endsWith(".md") && !file.startsWith("auto-generated-"))
      .map((file) => file.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

function validLastModified(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, guides, tags, inspiration, microSlugs] = await Promise.all([
    readPublishedBlogs(),
    readPublishedGuides(),
    readAllTagArchives(),
    readPublicInspirationViews(),
    microGuideSlugs()
  ]);

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_PATHS.map((pathname) => ({ url: absoluteUrl(pathname) })),
    ...hubs.map((hub) => ({ url: absoluteUrl(`/areas/${hub.slug}`) })),
    ...inspiration.filter((entry) => entry.metadata.indexable).map((entry) => ({
      url: absoluteUrl(`/inspiration/${entry.slug}`),
      lastModified: validLastModified(entry.publishedAt)
    })),
    ...PRODUCT_SLUGS.map((slug) => ({ url: absoluteUrl(`/products/${slug}`) })),
    ...microSlugs.map((slug) => ({ url: absoluteUrl(`/micro/${slug}`) })),
    ...blogs.filter((blog) => blog.editorial.indexable).map((blog) => ({
      url: absoluteUrl(`/blog/${blog.Slug}`),
      lastModified: validLastModified(blog.Published_At)
    })),
    ...guides.filter((guide) => guide.editorial.indexable).map((guide) => ({
      url: absoluteUrl(`/guides/${guide.slug}`),
      lastModified: validLastModified(guide.publishedAt)
    })),
    ...tags.map((tag) => ({ url: absoluteUrl(`/tags/${tag.slug}`) }))
  ];

  return entries.sort((a, b) => a.url.localeCompare(b.url));
}
