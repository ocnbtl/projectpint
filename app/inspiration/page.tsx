import Link from "next/link";
import { SafeImage } from "../../components/SafeImage";
import { SiteShell } from "../../components/SiteShell";
import { readPublicInspirationViews } from "../../lib/inspiration-content";
import { inspirationStyles } from "../../lib/redesign-data";
import { pageMetadata } from "../../lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Bathroom Inspiration",
  description: "Explore curated bathroom style boards with attainable ideas for function, comfort, and budget.",
  path: "/inspiration",
  image: inspirationStyles[0]?.cover
});

export default async function InspirationPage() {
  const styles = await readPublicInspirationViews();
  return (
    <SiteShell>
      <section className="inspiration-figma-hero">
        <div className="container" data-reveal="hero">
          <p className="eyebrow blog-eyebrow">Visual Inspiration</p>
          <h1>Find your bathroom&apos;s style</h1>
          <p>
            Browse curated boards by style. Click any style to find more ideas, complete with visuals and the best
            products to recreate them.
          </p>
        </div>
      </section>

      <div className="container site-page inspiration-figma-page">
        <section className="inspiration-style-grid" aria-label="Bathroom inspiration styles">
          {styles.map((style, index) => {
            const thumbs = style.items
              .filter((item) => item.type === "image")
              .slice(1, 4)
              .map((item) => item.src);
            return (
              <Link
                key={style.slug}
                href={`/inspiration/${style.slug}`}
                className="inspiration-style-tile"
                data-reveal
                style={{ transitionDelay: `${index * 40}ms` }}
              >
                <SafeImage src={style.cover} alt={style.coverAlt} loading="lazy" decoding="async" />
                <span className="inspiration-style-shade" aria-hidden="true" />
                <span className="inspiration-style-title">
                  <i style={{ backgroundColor: style.accent }} />
                  <h2>{style.name}</h2>
                </span>
                <span className="inspiration-style-preview">
                  <span>
                    {thumbs.map((src, thumbIndex) => (
                      <SafeImage key={`${style.slug}-${thumbIndex}`} src={src} alt="" loading="lazy" decoding="async" />
                    ))}
                  </span>
                  <em>
                    Explore board
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </em>
                </span>
              </Link>
            );
          })}
        </section>
      </div>
    </SiteShell>
  );
}
