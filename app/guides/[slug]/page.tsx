import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownArticle } from "../../../components/MarkdownArticle";
import { SiteShell } from "../../../components/SiteShell";
import { estimateReadTimeMinutes, markdownBlocks } from "../../../lib/content-render";
import { areaVisuals } from "../../../lib/redesign-data";
import { findGuideBySlug } from "../../../lib/site-data";
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
    </SiteShell>
  );
}
