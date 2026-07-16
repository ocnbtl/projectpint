import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/SiteShell";
import { inspirationStyles } from "../../../lib/redesign-data";

export function generateStaticParams() {
  return inspirationStyles.map((style) => ({ slug: style.slug }));
}

export default async function InspirationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const style = inspirationStyles.find((item) => item.slug === slug);
  if (!style) return notFound();

  return (
    <SiteShell>
      <section className="inspiration-detail-hero">
        <img src={style.cover} alt={`${style.name} bathroom inspiration`} />
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
                <img
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
