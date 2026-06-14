import { BlogIndexExplorer } from "../../components/BlogIndexExplorer";
import { SiteShell } from "../../components/SiteShell";
import { contentAreaLabel, contentAreaSlug } from "../../lib/constants";
import { estimateReadTimeMinutes, excerptFromMarkdown } from "../../lib/content-render";
import { areaVisuals } from "../../lib/redesign-data";
import { contentAreaForBlog, hubs, readBlogs, tagsForBlog } from "../../lib/site-data";

export const dynamic = "force-dynamic";

export default async function BlogIndex({
  searchParams
}: {
  searchParams: Promise<{ area?: string | string[] }>;
}) {
  const params = await searchParams;
  const areaParam = Array.isArray(params.area) ? params.area[0] : params.area;
  const rows = await readBlogs();
  const published = rows.filter((row) => row.Status === "published");
  const source = published.length > 0 ? published : rows;

  const blogs = source.map((row) => {
    const area = contentAreaForBlog(row);
    return {
      id: row.Blog_ID,
      slug: row.Slug,
      title: row.Title,
      excerpt: excerptFromMarkdown(row.Draft_Markdown, 160),
      tags: tagsForBlog(row),
      keyword: row.Keyword_Target,
      image: areaVisuals[area].image,
      areaLabel: contentAreaLabel(area),
      areaSlug: contentAreaSlug(area),
      readTime: estimateReadTimeMinutes(row.Draft_Markdown)
    };
  });
  const availableTags = Array.from(new Set(blogs.flatMap((blog) => blog.tags))).sort();
  const areaFilters = hubs.map((hub) => ({ label: hub.title, slug: hub.slug }));

  return (
    <SiteShell>
      <section className="blog-index-hero">
        <div className="container blog-index-hero-inner">
          <h1>Curated guides & articles to upgrade your bathroom</h1>
          <ol className="blog-intro-steps">
            <li>Find a relevant article and read in less than 10 minutes</li>
            <li>Follow the upgrade steps and finish your first bathroom upgrade this weekend... or tonight</li>
          </ol>
        </div>
      </section>
      <div className="container site-page site-page-tight">
        <BlogIndexExplorer
          blogs={blogs}
          availableTags={availableTags}
          areaFilters={areaFilters}
          initialArea={areaParam}
        />
      </div>
    </SiteShell>
  );
}
