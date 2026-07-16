import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFrame } from "../../../../../components/admin/AdminFrame";
import { MarkdownArticle } from "../../../../../components/MarkdownArticle";
import { markdownBlocks } from "../../../../../lib/content-render";
import { loadEditorialEditorModel } from "../../../../../lib/editorial-admin";
import { loadInspirationEditorModel } from "../../../../../lib/inspiration-admin";
import { inspirationStyleLabel } from "../../../../../lib/inspiration-shared";

export const dynamic = "force-dynamic";

export default async function AdminEditorialPreviewPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  if (kind !== "blogs" && kind !== "guides" && kind !== "inspiration") notFound();
  const model = kind === "inspiration"
    ? await loadInspirationEditorModel(id)
    : await loadEditorialEditorModel(kind, id);
  if (!model) notFound();
  const blocks = markdownBlocks(model.body);
  const contentBlocks = blocks[0]?.type === "h1" ? blocks.slice(1) : blocks;

  return (
    <AdminFrame>
      <section className="admin-preview-shell">
        <div className="admin-preview-toolbar">
          <div>
            <p className="eyebrow">Authenticated draft preview</p>
            <h1>{model.title}</h1>
            <p>This preview reads the saved draft. It does not publish or change the public snapshot.</p>
          </div>
          <Link className="btn btn-accent" href={`/admin/${kind}/${encodeURIComponent(model.id)}`}>Return to editor</Link>
        </div>
        <article className="admin-preview-article">
          {model.metadata.heroImageUrl ? (
            <div className="admin-preview-hero" role="img" aria-label={model.metadata.heroAlt || "Draft hero image"} style={{ backgroundImage: `url(${model.metadata.heroImageUrl})` }} />
          ) : null}
          <div className="admin-preview-meta">
            <span>{model.area}</span>
            {model.kind === "inspiration" ? <span>{inspirationStyleLabel(model.style)}</span> : null}
            {model.metadata.authorName ? <span>By {model.metadata.authorName}</span> : null}
            {model.publishDate ? <span>{model.publishDate}</span> : null}
          </div>
          {model.metadata.excerpt ? <p className="admin-preview-deck">{model.metadata.excerpt}</p> : null}
          <div className="article-body"><MarkdownArticle blocks={contentBlocks} slug={`preview-${model.slug}`} /></div>
        </article>
      </section>
    </AdminFrame>
  );
}
