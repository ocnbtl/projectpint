import { notFound } from "next/navigation";
import Link from "next/link";
import { AdSlot } from "../../../components/AdSlot";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { MarkdownArticle } from "../../../components/MarkdownArticle";
import { SafeImage } from "../../../components/SafeImage";
import { SiteShell } from "../../../components/SiteShell";
import { shouldShowAffiliateDisclosure } from "../../../lib/affiliate";
import { estimateReadTimeMinutes, excerptFromMarkdown, markdownBlocks } from "../../../lib/content-render";
import { areaVisuals } from "../../../lib/redesign-data";
import { contentAreaForBlog, readPublishedBlogs, tagsForBlog } from "../../../lib/site-data";
import { articleJsonLd, jsonLd, pageMetadata } from "../../../lib/seo";
import { tagPath } from "../../../lib/tags";

export const dynamic = "force-dynamic";

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5v5l3.5 2" />
    </svg>
  );
}

function formatPublishedDate(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function validPublishedTime(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blogs = await readPublishedBlogs();
  const blog = blogs.find((item) => item.Slug === slug);
  if (!blog) return { robots: { index: false, follow: false } };

  const area = contentAreaForBlog(blog);
  const approvedHero = blog.editorial.heroRights === "approved" ? blog.editorial.heroImageUrl : "";
  return pageMetadata({
    title: blog.editorial.seoTitle || blog.Title,
    description: blog.editorial.seoDescription || blog.editorial.excerpt || excerptFromMarkdown(blog.Draft_Markdown, 155),
    path: blog.editorial.canonicalUrl || `/blog/${blog.Slug}`,
    image: blog.editorial.socialImageUrl || approvedHero || areaVisuals[area].image,
    type: "article",
    publishedTime: validPublishedTime(blog.Published_At),
    indexable: blog.editorial.indexable
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blogs = await readPublishedBlogs();
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
  const articleTitle = titleBlock?.text ?? blog.Title;
  const articleDescription = blog.editorial.excerpt || excerptFromMarkdown(blog.Draft_Markdown, 155);
  const contentBlocks = titleBlock ? blocks.slice(1) : blocks;
  const tags = tagsForBlog(blog);
  const area = contentAreaForBlog(blog);
  const approvedHero = blog.editorial.heroRights === "approved" ? blog.editorial.heroImageUrl : "";
  const image = approvedHero || areaVisuals[area].image;
  const imageAlt = approvedHero ? blog.editorial.heroAlt : "";
  const publishedDate = formatPublishedDate(blog.Published_At);
  const related = blogs
    .filter((row) => row.Blog_ID !== blog.Blog_ID)
    .sort((a, b) => Number(contentAreaForBlog(b) === area) - Number(contentAreaForBlog(a) === area))
    .slice(0, 2);
  const structuredArticle = articleJsonLd({
    title: articleTitle,
    description: articleDescription,
    path: blog.editorial.canonicalUrl || `/blog/${blog.Slug}`,
    image,
    publishedTime: validPublishedTime(blog.Published_At),
    authorName: blog.editorial.authorName
  });

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredArticle) }} />
      <section className="article-detail-hero article-detail-photo-hero">
        <SafeImage className="article-detail-hero-image" src={image} alt={imageAlt} priority />
        <div className="container article-detail-hero-inner">
          <div className="article-detail-copy">
            <Link href="/blog" className="back-link">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m11 18-6-6 6-6" />
              </svg>
              <span>Back to Blog</span>
            </Link>
            <div className="article-detail-meta-row">
              {tags[0] ? (
                <Link href={tagPath(tags[0])} className="tag tag-link">
                  {tags[0]}
                </Link>
              ) : null}
              <span className="article-detail-meta-item">
                <ClockIcon />
                {readTimeMinutes} min read
              </span>
              {publishedDate ? <time dateTime={blog.Published_At}>{publishedDate}</time> : null}
              {blog.editorial.authorName ? <span>By {blog.editorial.authorName}</span> : null}
            </div>
            <h1>{articleTitle}</h1>
          </div>
        </div>
      </section>
      {approvedHero && (blog.editorial.heroCaption || blog.editorial.heroCredit) ? (
        <p className="article-hero-credit container">
          {blog.editorial.heroCaption}
          {blog.editorial.heroCaption && blog.editorial.heroCredit ? " · " : ""}
          {blog.editorial.heroCredit}
        </p>
      ) : null}
      <article className="article-body-card">
        <MarkdownArticle blocks={contentBlocks} slug={slug} />
        <div className="article-body-tags" aria-label="Article tags">
          {tags.map((tag) => (
            <Link key={`${blog.Blog_ID}-body-${tag}`} href={tagPath(tag)} className="tag tag-muted tag-link">
              {tag}
            </Link>
          ))}
        </div>
        <div className="article-blueprint-cta">
          <h2>Want a personalized upgrade plan?</h2>
          <p>The Bathroom Upgrade Blueprint gives you step-by-step recommendations for your budget.</p>
          <Link href="/blueprint" className="btn btn-accent">
            Learn About the Blueprint
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </article>
      {related.length > 0 ? (
        <section className="article-related-section">
          <div className="container article-next-section">
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
                        <SafeImage src={areaVisuals[relatedArea].image} alt="" />
                      </span>
                      <span className="article-related-copy">
                        <strong>{item.Title}</strong>
                        <span>{item.editorial.excerpt || excerptFromMarkdown(item.Draft_Markdown, 120)}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}
      {showAffiliateDisclosure ? <AffiliateDisclosure /> : null}
      <AdSlot enabled={blog.Ad_Enabled} slotId={`blog-${blog.Blog_ID}`} />
    </SiteShell>
  );
}
