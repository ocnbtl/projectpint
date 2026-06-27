import { notFound } from "next/navigation";
import Link from "next/link";
import { AdSlot } from "../../../components/AdSlot";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { MarkdownArticle } from "../../../components/MarkdownArticle";
import { SiteShell } from "../../../components/SiteShell";
import { shouldShowAffiliateDisclosure } from "../../../lib/affiliate";
import { estimateReadTimeMinutes, excerptFromMarkdown, markdownBlocks } from "../../../lib/content-render";
import { areaVisuals } from "../../../lib/redesign-data";
import { contentAreaForBlog, readBlogs, tagsForBlog } from "../../../lib/site-data";
import { tagPath } from "../../../lib/tags";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blogs = await readBlogs();
  const blog = blogs.find((b) => b.Slug === slug);
  if (!blog) return notFound();

  const showAffiliateDisclosure = shouldShowAffiliateDisclosure({
    explicitFlag: blog.Affiliate_Disclosure_Required,
    containsAffiliateLinks: blog.Contains_Affiliate_Links,
    markdownOrText: blog.Draft_Markdown
  });
  const blocks = markdownBlocks(blog.Draft_Markdown);
  const readTimeMinutes = estimateReadTimeMinutes(blog.Draft_Markdown);
  const titleBlock = blocks[0]?.type === "h1" ? blocks[0] : null;
  const contentBlocks = titleBlock ? blocks.slice(1) : blocks;
  const tags = tagsForBlog(blog);
  const area = contentAreaForBlog(blog);
  const image = areaVisuals[area].image;
  const publicBlogs = blogs.filter((row) => row.Status === "published");
  const relatedSource = publicBlogs.length > 0 ? publicBlogs : blogs;
  const related = relatedSource
    .filter((row) => row.Blog_ID !== blog.Blog_ID)
    .sort((a, b) => Number(contentAreaForBlog(b) === area) - Number(contentAreaForBlog(a) === area))
    .slice(0, 2);

  return (
    <SiteShell>
      <section className="article-detail-hero article-detail-photo-hero" style={{ backgroundImage: `url(${image})` }}>
        <div className="container article-detail-hero-inner">
          <div className="article-detail-copy">
            <Link href="/blog" className="back-link">
              Back to Blog
            </Link>
            <p className="article-detail-kicker">Evergreen Article</p>
            <div className="tag-list article-tag-list">
              {tags.map((tag) => (
                <Link key={`${blog.Blog_ID}-${tag}`} href={tagPath(tag)} className="tag tag-link">
                  {tag}
                </Link>
              ))}
            </div>
            <h1>{titleBlock?.text ?? blog.Title}</h1>
            <span className="article-readtime-callout">
              <span className="article-readtime-kicker">Reading time</span>
              <strong>{readTimeMinutes} min read</strong>
            </span>
          </div>
        </div>
      </section>
      <article className="article-body-card">
        <MarkdownArticle blocks={contentBlocks} slug={slug} />
      </article>
      <section className="article-next-section">
        <div className="article-blueprint-cta">
          <div>
            <h2>Want a personalized upgrade plan?</h2>
            <p>The Bathroom Upgrade Blueprint turns your budget, constraints, and style into a step-by-step plan.</p>
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
              {related.map((item) => {
                const relatedArea = contentAreaForBlog(item);
                return (
                  <Link key={item.Blog_ID} href={`/blog/${item.Slug}`} className="article-related-card">
                    <span className="article-related-media">
                      <img src={areaVisuals[relatedArea].image} alt="" />
                    </span>
                    <span className="article-related-copy">
                      <strong>{item.Title}</strong>
                      <span>{excerptFromMarkdown(item.Draft_Markdown, 120)}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>
      {showAffiliateDisclosure ? <AffiliateDisclosure /> : null}
      <AdSlot enabled={blog.Ad_Enabled} slotId={`blog-${blog.Blog_ID}`} />
    </SiteShell>
  );
}
