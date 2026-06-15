import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { inspirationStyles, redesignImages } from "../../lib/redesign-data";

const thumbImages = [redesignImages.plants, redesignImages.mirror, redesignImages.storage, redesignImages.lighting];

export default function InspirationPage() {
  return (
    <SiteShell>
      <section className="inspiration-figma-hero">
        <div className="container">
          <p className="eyebrow blog-eyebrow">Visual Inspiration</p>
          <h1>Find your bathroom&apos;s style</h1>
          <p>
            Browse curated boards by style. Click any style to find more ideas, complete with visuals and the best
            starting points to recreate them.
          </p>
        </div>
      </section>

      <div className="container site-page inspiration-figma-page">
        <section className="inspiration-style-grid" aria-label="Bathroom inspiration styles">
          {inspirationStyles.map((style, index) => {
            const thumbs = [style.cover, thumbImages[index % thumbImages.length], thumbImages[(index + 1) % thumbImages.length]];
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
                  <em>Explore board</em>
                </span>
              </Link>
            );
          })}
        </section>
      </div>
    </SiteShell>
  );
}
