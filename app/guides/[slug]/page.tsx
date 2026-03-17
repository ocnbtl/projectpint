import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownArticle } from "../../../components/MarkdownArticle";
import { SiteShell } from "../../../components/SiteShell";
import { estimateReadTimeMinutes, markdownBlocks } from "../../../lib/content-render";
import { findGuideBySlug, readGuides } from "../../../lib/site-data";
import { tagPath } from "../../../lib/tags";

export async function generateStaticParams() {
  const guides = await readGuides();
  return guides.map((guide) => ({ slug: guide.slug }));
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await findGuideBySlug(slug);
  if (!guide) return notFound();

  const blocks = markdownBlocks(guide.content);
  const readTimeMinutes = estimateReadTimeMinutes(guide.content);
  const titleBlock = blocks[0]?.type === "h1" ? blocks[0] : null;
  const contentBlocks = titleBlock ? blocks.slice(1) : blocks;

  return (
    <SiteShell>
      <article className="card prose-card">
        <div className="tag-list article-tag-list">
          {guide.tags.map((tag) => (
            <Link key={`${guide.Guide_ID}-${tag}`} href={tagPath(tag)} className="tag tag-link">
              {tag}
            </Link>
          ))}
        </div>
        {titleBlock ? <h1>{titleBlock.text}</h1> : null}
        <div className="article-readtime-callout" aria-label={`${readTimeMinutes} minute read`}>
          <span className="article-readtime-kicker">Quick read</span>
          <strong>{readTimeMinutes} min read</strong>
        </div>
        <MarkdownArticle blocks={contentBlocks} slug={slug} />
      </article>
    </SiteShell>
  );
}
