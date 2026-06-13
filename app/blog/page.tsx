import { BlogIndexExplorer } from "../../components/BlogIndexExplorer";
import { SiteShell } from "../../components/SiteShell";
import { excerptFromMarkdown } from "../../lib/content-render";
import { areaVisuals } from "../../lib/redesign-data";
import { contentAreaForBlog, readBlogs, tagsForBlog } from "../../lib/site-data";

export const dynamic = "force-dynamic";

export default async function BlogIndex() {
  const rows = await readBlogs();
  const published = rows.filter((row) => row.Status === "published");
  const source = published.length > 0 ? published : rows;

  const blogs = source.map((row) => ({
    id: row.Blog_ID,
    slug: row.Slug,
    title: row.Title,
    excerpt: excerptFromMarkdown(row.Draft_Markdown, 160),
    tags: tagsForBlog(row),
    keyword: row.Keyword_Target,
    image: areaVisuals[contentAreaForBlog(row)].image
  }));
  const availableTags = Array.from(new Set(blogs.flatMap((blog) => blog.tags))).sort();

  return (
    <SiteShell>
      <div className="container site-page">
        <section className="soft-hero">
          <p className="eyebrow blog-eyebrow">Blog</p>
          <h1>Quick reads to upgrade your bathroom.</h1>
          <p>
            Practical articles from the live content system, grouped by area tags so every idea has a clear next step.
          </p>
        </section>
        <BlogIndexExplorer blogs={blogs} availableTags={availableTags} />
      </div>
    </SiteShell>
  );
}
