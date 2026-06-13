import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/SiteShell";
import { inspirationStyles, redesignImages } from "../../../lib/redesign-data";

export function generateStaticParams() {
  return inspirationStyles.map((style) => ({ slug: style.slug }));
}

export default async function InspirationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const style = inspirationStyles.find((item) => item.slug === slug);
  if (!style) return notFound();

  const collage = [style.cover, redesignImages.plants, redesignImages.mirror, redesignImages.storage, redesignImages.lighting, redesignImages.shower];

  return (
    <SiteShell>
      <section className="article-hero" style={{ backgroundImage: `url(${style.cover})` }}>
        <div className="article-hero-shade">
          <div className="container article-hero-copy">
            <Link href="/inspiration" className="back-link">
              All Inspiration
            </Link>
            <p className="eyebrow">Style Board</p>
            <h1>{style.name}</h1>
            <p>{style.description}</p>
          </div>
        </div>
      </section>

      <div className="container site-page">
        <section className="split-feature split-feature-align-start">
          <div>
            <p className="eyebrow blog-eyebrow">Translate the Look</p>
            <h2>Start with one finish, one storage move, and one lighting improvement.</h2>
            <p>
              This board is a visual planning aid. Use it with the live area library and blueprint flow to keep the
              upgrade practical.
            </p>
            <div className="cta-row">
              <Link href="/hub" className="btn btn-ghost">
                Browse areas
              </Link>
              <Link href="/blueprint" className="btn btn-accent">
                Build Blueprint
              </Link>
            </div>
          </div>
          <aside className="collage-grid">
            {collage.map((image, index) => (
              <img key={`${style.slug}-${index}`} src={image} alt="" />
            ))}
          </aside>
        </section>
      </div>
    </SiteShell>
  );
}
