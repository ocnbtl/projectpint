import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownArticle } from "../../../components/MarkdownArticle";
import { SafeImage } from "../../../components/SafeImage";
import { SiteShell } from "../../../components/SiteShell";
import { estimateReadTimeMinutes, excerptFromMarkdown, markdownBlocks } from "../../../lib/content-render";
import { areaVisuals } from "../../../lib/redesign-data";
import { contentAreaForBlog, findGuideBySlug, readPublishedBlogs, readPublishedGuides } from "../../../lib/site-data";
import { articleJsonLd, jsonLd, pageMetadata } from "../../../lib/seo";
import { tagPath } from "../../../lib/tags";

export const dynamic = "force-dynamic";

function validPublishedTime(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function formatPublishedDate(value: string): string | null {
  const iso = validPublishedTime(value);
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await findGuideBySlug(slug);
  if (!guide) return { robots: { index: false, follow: false } };

  const approvedHero = guide.editorial.heroRights === "approved" ? guide.editorial.heroImageUrl : "";

  return pageMetadata({
    title: guide.editorial.seoTitle || guide.title,
    description: guide.editorial.seoDescription || guide.editorial.excerpt || guide.summary || excerptFromMarkdown(guide.content, 155),
    path: guide.editorial.canonicalUrl || `/guides/${guide.slug}`,
    image: guide.editorial.socialImageUrl || approvedHero || areaVisuals[guide.area].image,
    type: "article",
    publishedTime: validPublishedTime(guide.publishedAt),
    indexable: guide.editorial.indexable
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await findGuideBySlug(slug);
  if (!guide) return notFound();

  const blocks = markdownBlocks(guide.content);
  const readTimeMinutes = estimateReadTimeMinutes(guide.content);
  const titleBlock = blocks[0]?.type === "h1" ? blocks[0] : null;
  const articleTitle = titleBlock?.text ?? guide.title;
  const articleDescription = guide.editorial.excerpt || guide.summary || excerptFromMarkdown(guide.content, 155);
  const contentBlocks = titleBlock ? blocks.slice(1) : blocks;
  const approvedHero = guide.editorial.heroRights === "approved" ? guide.editorial.heroImageUrl : "";
  const image = approvedHero || areaVisuals[guide.area].image;
  const imageAlt = approvedHero ? guide.editorial.heroAlt : "";
  const publishedDate = formatPublishedDate(guide.publishedAt);
  const [blogs, guides] = await Promise.all([readPublishedBlogs(), readPublishedGuides()]);
  const relatedGuides = guides
    .filter((row) => row.slug !== guide.slug && row.area === guide.area)
    .slice(0, 2)
    .map((row) => ({
      id: row.Guide_ID,
      href: `/guides/${row.slug}`,
      title: row.title,
      excerpt: row.summary,
      image: areaVisuals[row.area].image
    }));
  const relatedBlogs = blogs
    .filter((row) => contentAreaForBlog(row) === guide.area)
    .slice(0, 2 - relatedGuides.length)
    .map((row) => ({
      id: row.Blog_ID,
      href: `/blog/${row.Slug}`,
      title: row.Title,
      excerpt: row.editorial.excerpt || excerptFromMarkdown(row.Draft_Markdown, 120),
      image: areaVisuals[contentAreaForBlog(row)].image
    }));
  const related = [...relatedGuides, ...relatedBlogs];
  const structuredArticle = articleJsonLd({
    title: articleTitle,
    description: articleDescription,
    path: guide.editorial.canonicalUrl || `/guides/${guide.slug}`,
    image,
    publishedTime: validPublishedTime(guide.publishedAt),
    authorName: guide.editorial.authorName
  });

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredArticle) }} />
      <section className="article-detail-hero article-detail-photo-hero">
        <SafeImage className="article-detail-hero-image" src={image} alt={imageAlt} priority />
        <div className="container article-detail-hero-inner">
          <div className="article-detail-copy">
            <Link href="/areas" className="back-link">
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
            <h1>{articleTitle}</h1>
            {guide.editorial.authorName ? <span className="article-author-byline">By {guide.editorial.authorName}</span> : null}
            {publishedDate ? <time className="article-author-byline" dateTime={guide.publishedAt}>{publishedDate}</time> : null}
            <span className="article-readtime-callout">
              <span className="article-readtime-kicker">Reading time</span>
              <strong>{readTimeMinutes} min read</strong>
            </span>
          </div>
        </div>
      </section>
      {approvedHero && (guide.editorial.heroCaption || guide.editorial.heroCredit) ? (
        <p className="article-hero-credit container">
          {guide.editorial.heroCaption}
          {guide.editorial.heroCaption && guide.editorial.heroCredit ? " · " : ""}
          {guide.editorial.heroCredit}
        </p>
      ) : null}
      <article className="article-body-card">
        <MarkdownArticle blocks={contentBlocks} slug={slug} />
        <div className="article-body-tags" aria-label="Guide tags">
          {guide.tags.map((tag) => (
            <Link key={`${guide.Guide_ID}-body-${tag}`} href={tagPath(tag)} className="tag tag-muted tag-link">
              {tag}
            </Link>
          ))}
        </div>
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
                    <SafeImage src={item.image} alt="" />
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
