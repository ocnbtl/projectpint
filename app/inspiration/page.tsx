import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { inspirationStyles } from "../../lib/redesign-data";

export default function InspirationPage() {
  return (
    <SiteShell>
      <section className="inspiration-figma-hero">
        <div className="container">
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
          {inspirationStyles.map((style) => {
            const thumbs = style.items
              .filter((item) => item.type === "image")
              .slice(1, 4)
              .map((item) => item.src);
            return (
              <Link key={style.slug} href={`/inspiration/${style.slug}`} className="inspiration-style-tile">
                <img src={style.cover} alt="" />
                <span className="inspiration-style-shade" aria-hidden="true" />
                <span className="inspiration-style-title">
                  <i style={{ backgroundColor: style.accent }} />
                  <strong>{style.name}</strong>
                </span>
                <span className="inspiration-style-preview">
                  <span>
                    {thumbs.map((src, thumbIndex) => (
                      <img key={`${style.slug}-${thumbIndex}`} src={src} alt="" />
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
