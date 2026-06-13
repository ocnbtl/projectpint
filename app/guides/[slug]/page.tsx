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
      <section className="article-hero" style={{ backgroundImage: `url(${image})` }}>
        <div className="article-hero-shade">
          <div className="container article-hero-copy">
            <Link href="/hub" className="back-link">
              Back to Areas
            </Link>
            <div className="tag-list article-tag-list">
              {guide.tags.map((tag) => (
                <Link key={`${guide.Guide_ID}-${tag}`} href={tagPath(tag)} className="tag tag-link">
                  {tag}
                </Link>
              ))}
            </div>
            <h1>{titleBlock?.text ?? guide.title}</h1>
            <p>{readTimeMinutes} min read</p>
          </div>
        </div>
      </section>
      <article className="prose-card article-body-card">
        <MarkdownArticle blocks={contentBlocks} slug={slug} />
      </article>
    </SiteShell>
  );
}
