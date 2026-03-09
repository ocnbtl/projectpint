import { notFound } from "next/navigation";
import { MarkdownArticle } from "../../../components/MarkdownArticle";
import { SiteShell } from "../../../components/SiteShell";
import { markdownBlocks } from "../../../lib/content-render";
import { findGuideBySlug, readGuides } from "../../../lib/site-data";

export async function generateStaticParams() {
  const guides = await readGuides();
  return guides.map((guide) => ({ slug: guide.slug }));
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await findGuideBySlug(slug);
  if (!guide) return notFound();

  const blocks = markdownBlocks(guide.content);

  return (
    <SiteShell>
      <article className="card prose-card">
        <MarkdownArticle blocks={blocks} slug={slug} />
      </article>
    </SiteShell>
  );
}
