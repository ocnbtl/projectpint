import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownArticle } from "../../../components/MarkdownArticle";
import { SiteShell } from "../../../components/SiteShell";
import { estimateReadTimeMinutes, excerptFromMarkdown, markdownBlocks } from "../../../lib/content-render";
import { areaVisuals } from "../../../lib/redesign-data";
import { contentAreaForBlog, findGuideBySlug, readBlogs, readGuides } from "../../../lib/site-data";
import { tagPath } from "../../../lib/tags";

export const dynamic = "force-dynamic";

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await findGuideBySlug(slug);
  if (!guide) return notFound();

  const blocks = markdownBlocks(guide.content);
  const readTimeMinutes = estimateReadTimeMinutes(guide.content);
  const titleBlock = blocks[0]?.type === "h1" ? blocks[0] : null;
  const contentBlocks = titleBlock ? blocks.slice(1) : blocks;
  const image = areaVisuals[guide.area].image;
  const [blogs, guides] = await Promise.all([readBlogs(), readGuides()]);
  const publicBlogs = blogs.filter((row) => row.Status === "published");
  const blogSource = publicBlogs.length > 0 ? publicBlogs : blogs;
  const publicGuides = guides.filter((row) => row.status.trim().toLowerCase() === "published");
  const guideSource = publicGuides.length > 0 ? publicGuides : guides;
  const relatedGuides = guideSource
    .filter((row) => row.slug !== guide.slug && row.area === guide.area)
    .slice(0, 2)
    .map((row) => ({
      id: row.Guide_ID,
      href: `/guides/${row.slug}`,
      title: row.title,
      excerpt: row.summary,
      image: areaVisuals[row.area].image
    }));
  const relatedBlogs = blogSource
    .filter((row) => contentAreaForBlog(row) === guide.area)
    .slice(0, 2 - relatedGuides.length)
    .map((row) => ({
      id: row.Blog_ID,
      href: `/blog/${row.Slug}`,
      title: row.Title,
      excerpt: excerptFromMarkdown(row.Draft_Markdown, 120),
      image: areaVisuals[contentAreaForBlog(row)].image
    }));
  const related = [...relatedGuides, ...relatedBlogs];

  return (
    <SiteShell>
      <section className="article-detail-hero">
        <div className="container article-detail-hero-inner">
          <div className="article-detail-copy">
            <Link href="/hub" className="back-link">
              Back to Areas
            </Link>
            <p className="article-detail-kicker">Bathroom Guide</p>
            <div className="tag-list article-tag-list">
              {guide.tags.map((tag) => (
                <Link key={`${guide.Guide_ID}-${tag}`} href={tagPath(tag)} className="tag tag-link">
                  {tag}
                </Link>
              ))}
            </div>
            <h1>{titleBlock?.text ?? guide.title}</h1>
            <span className="article-readtime-callout">
              <span className="article-readtime-kicker">Reading time</span>
              <strong>{readTimeMinutes} min read</strong>
            </span>
          </div>
          <div className="article-detail-media" style={{ backgroundImage: `url(${image})` }} aria-hidden="true" />
        </div>
      </section>
      <article className="article-body-card">
        <MarkdownArticle blocks={contentBlocks} slug={slug} />
      </article>
      <section className="article-next-section">
        <div className="article-blueprint-cta">
          <div>
            <h2>Want a personalized upgrade plan?</h2>
            <p>The Bathroom Upgrade Blueprint turns this guide into a budget-aware plan for your exact bathroom.</p>
          </div>
          <Link href="/blueprint" className="btn btn-accent">
            Build My Blueprint
          </Link>
        </div>
        {related.length > 0 ? (
          <div className="article-related-block">
            <div className="article-related-head">
              <p className="areas-kicker">Keep Reading</p>
              <h2>More from this area</h2>
            </div>
            <div className="article-related-grid">
              {related.map((item) => (
                <Link key={item.id} href={item.href} className="article-related-card">
                  <span className="article-related-media">
                    <img src={item.image} alt="" />
                  </span>
                  <span className="article-related-copy">
                    <strong>{item.title}</strong>
                    <span>{item.excerpt}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </SiteShell>
  );
}
