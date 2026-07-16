import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "../../../components/MarkdownArticle";
import { SafeImage } from "../../../components/SafeImage";
import { SiteShell } from "../../../components/SiteShell";
import { markdownBlocks } from "../../../lib/content-render";
import { findPublicInspirationView } from "../../../lib/inspiration-content";
import { inspirationStyleName } from "../../../lib/inspiration-content";
import { articleJsonLd, jsonLd, pageMetadata } from "../../../lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const style = await findPublicInspirationView(slug);
  if (!style) return { robots: { index: false, follow: false } };

  return pageMetadata({
    title: style.metadata.seoTitle || `${style.name} Bathroom Inspiration`,
    description: style.metadata.seoDescription || style.description,
    path: style.metadata.canonicalUrl || `/inspiration/${style.slug}`,
    image: style.metadata.socialImageUrl || style.cover,
    type: style.source === "managed" ? "article" : "website",
    publishedTime: style.publishedAt || undefined,
    indexable: style.metadata.indexable
  });
}

export default async function InspirationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const style = await findPublicInspirationView(slug);
  if (!style) return notFound();
  const bodyBlocks = markdownBlocks(style.body);
  const contentBlocks = bodyBlocks[0]?.type === "h1" ? bodyBlocks.slice(1) : bodyBlocks;
  const structuredEntry = style.source === "managed" ? articleJsonLd({
    title: style.name,
    description: style.description,
    path: style.metadata.canonicalUrl || `/inspiration/${style.slug}`,
    image: style.cover,
    publishedTime: style.publishedAt || undefined
  }) : null;

  return (
    <SiteShell>
      {structuredEntry ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredEntry) }} /> : null}
      <section className="inspiration-detail-hero">
        <SafeImage src={style.cover} alt={style.coverAlt} priority />
        <div className="inspiration-detail-shade">
          <div className="container inspiration-detail-copy" data-reveal="hero">
            <Link href="/inspiration" className="back-link">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m11 18-6-6 6-6" />
              </svg>
              All Styles
            </Link>
            <span style={{ backgroundColor: style.accent }} aria-hidden="true" />
            <h1>{style.name}</h1>
            <p>{style.description}</p>
          </div>
        </div>
      </section>

      <div className="container site-page inspiration-detail-page">
        {style.source === "managed" ? (
          <section className="inspiration-managed-story" data-reveal>
            <div className="tag-list">
              <span className="tag">{inspirationStyleName(style)}</span>
              {style.tags.map((tag) => <span key={`${style.id}-${tag}`} className="tag tag-muted">{tag}</span>)}
            </div>
            <div className="inspiration-managed-prose"><MarkdownArticle blocks={contentBlocks} slug={`inspiration-${style.slug}`} /></div>
            {style.caption || style.credit ? <p className="inspiration-managed-credit">{style.caption}{style.caption && style.credit ? " · " : ""}{style.credit}</p> : null}
          </section>
        ) : null}

        {style.items.length > 0 ? (
          <>
            <p className="inspiration-board-kicker">Pinned for you &mdash; scroll the board</p>
            <section className="inspiration-board" data-reveal>
          {style.items.map((item, index) =>
            item.type === "product" ? (
              <article
                key={`${style.slug}-product-${index}`}
                className="inspiration-product-pin"
                style={{ transform: `rotate(${((index % 5) - 2) * 1.4}deg)` }}
              >
                <span style={{ backgroundColor: style.accent }}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 12V5a1 1 0 0 0-1-1h-7l-8 8 8 8 8-8Z" />
                    <circle cx="16" cy="8" r="1" />
                  </svg>
                  Shop the look
                </span>
                <h2>{item.name}</h2>
                <p>
                  {item.price}
                  <i aria-hidden="true">-&gt;</i>
                </p>
              </article>
            ) : (
              <figure
                key={`${style.slug}-image-${index}`}
                className={`inspiration-image-pin inspiration-image-${item.shape}`}
                style={{ transform: `rotate(${((index % 5) - 2) * 1.4}deg)` }}
              >
                <SafeImage
                  src={item.src}
                  alt={item.label || `${style.name} bathroom inspiration`}
                  loading="lazy"
                  decoding="async"
                />
                {item.label ? <figcaption>{item.label}</figcaption> : null}
              </figure>
            )
          )}
            </section>
          </>
        ) : null}

        <section className="inspiration-detail-cta" data-reveal>
          <p>Love this look? Get a personalized plan to recreate it on your budget.</p>
          <Link href="/blueprint" className="btn btn-accent">
            Build My Blueprint
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </section>
      </div>
    </SiteShell>
  );
}
