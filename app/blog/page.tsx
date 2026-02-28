import { BlogIndexExplorer } from "../../components/BlogIndexExplorer";
import { SiteShell } from "../../components/SiteShell";
import { excerptFromMarkdown } from "../../lib/content-render";
import { pillarLabel, readBlogs } from "../../lib/site-data";

export default function BlogIndex() {
  const rows = readBlogs();
  const published = rows.filter((row) => row.Status === "published");
  const source = published.length > 0 ? published : rows;

  const blogs = source.map((row) => ({
    id: row.Blog_ID,
    slug: row.Slug,
    title: row.Title,
    excerpt: excerptFromMarkdown(row.Draft_Markdown, 160),
    tags: [pillarLabel(row.Pillar), row.Keyword_Target],
    keyword: row.Keyword_Target
  }));
  const availableTags = Array.from(new Set(blogs.flatMap((blog) => blog.tags))).sort();

  return (
    <SiteShell>
      <div className="section-stack">
        <section className="panel blog-hero">
          <p className="eyebrow blog-eyebrow">Guides</p>
          <h1>Diyesu Decor Blog</h1>
          <p>Fast, practical reads that help you finish bathroom upgrades with less guesswork.</p>
        </section>
        <BlogIndexExplorer blogs={blogs} availableTags={availableTags} />
      </div>
    </SiteShell>
  );
}
