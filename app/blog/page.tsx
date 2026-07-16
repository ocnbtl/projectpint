import { BlogIndexExplorer } from "../../components/BlogIndexExplorer";
import { SiteShell } from "../../components/SiteShell";
import { contentAreaLabel, contentAreaSlug } from "../../lib/constants";
import { estimateReadTimeMinutes, excerptFromMarkdown } from "../../lib/content-render";
import { areaVisuals } from "../../lib/redesign-data";
import { pageMetadata } from "../../lib/seo";
import { contentAreaForBlog, hubs, readPublishedBlogs, tagsForBlog } from "../../lib/site-data";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "Bathroom Articles",
  description: "Browse published bathroom DIY articles for renters, small spaces, and budget-first upgrades.",
  path: "/blog",
  image: areaVisuals.DIY.image
});

export default async function BlogIndex({
  searchParams
}: {
  searchParams: Promise<{ area?: string | string[] }>;
}) {
  const params = await searchParams;
  const areaParam = Array.isArray(params.area) ? params.area[0] : params.area;
  const source = await readPublishedBlogs();

  const blogs = source.map((row) => {
    const area = contentAreaForBlog(row);
    return {
      id: row.Blog_ID,
      slug: row.Slug,
      title: row.Title,
      excerpt: row.editorial.excerpt || excerptFromMarkdown(row.Draft_Markdown, 160),
      tags: tagsForBlog(row),
      keyword: row.Keyword_Target,
      image: areaVisuals[area].image,
      areaLabel: contentAreaLabel(area),
      areaSlug: contentAreaSlug(area),
      readTime: estimateReadTimeMinutes(row.Draft_Markdown)
    };
  });
  const fallbackBlogs = [
    {
      id: "fallback-plants",
      slug: "plants",
      href: "/areas/plants",
      title: "The easiest plants for a small bathroom",
      excerpt: "Start with resilient greenery that handles humidity, tight corners, and imperfect light.",
      tags: ["Plants", "Low light"],
      keyword: "bathroom plants",
      image: areaVisuals.Plants.image,
      areaLabel: "Plants",
      areaSlug: "plants",
      readTime: 4
    },
    {
      id: "fallback-mirror",
      slug: "mirror",
      href: "/areas/mirror",
      title: "Mirror upgrades that make a bathroom feel bigger",
      excerpt: "Use shape, scale, and simple frame details to change the room without a full renovation.",
      tags: ["Mirror", "Renter-safe"],
      keyword: "bathroom mirror upgrade",
      image: areaVisuals.Mirror.image,
      areaLabel: "Mirror",
      areaSlug: "mirror",
      readTime: 5
    },
    {
      id: "fallback-storage",
      slug: "storage",
      href: "/areas/storage",
      title: "Storage fixes that calm bathroom clutter",
      excerpt: "A practical starting point for shelves, bins, and vanity zones that stay usable.",
      tags: ["Storage", "Small spaces"],
      keyword: "bathroom storage",
      image: areaVisuals.Storage.image,
      areaLabel: "Storage",
      areaSlug: "storage",
      readTime: 5
    }
  ];
  const blogCards = blogs.length > 0 ? blogs : fallbackBlogs;
  const availableTags = Array.from(new Set(blogCards.flatMap((blog) => blog.tags))).sort();
  const areaFilters = hubs.map((hub) => ({ label: hub.title, slug: hub.slug }));

  return (
    <SiteShell>
      <BlogIndexExplorer
        blogs={blogCards}
        availableTags={availableTags}
        areaFilters={areaFilters}
        initialArea={areaParam}
      />
    </SiteShell>
  );
}
