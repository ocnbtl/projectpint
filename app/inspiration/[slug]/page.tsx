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

  const collage = [
    { type: "image", src: style.cover, label: "Main finish", shape: "arch" },
    { type: "image", src: redesignImages.plants, label: "Greenery", shape: "rounded" },
    { type: "product", name: "Starter accent set", price: "$25-75" },
    { type: "image", src: redesignImages.mirror, label: "Mirror zone", shape: "circle" },
    { type: "image", src: redesignImages.storage, label: "Storage", shape: "wide" },
    { type: "product", name: "Renter-safe upgrade", price: "$10-45" },
    { type: "image", src: redesignImages.lighting, label: "Lighting", shape: "tall" },
    { type: "image", src: redesignImages.shower, label: "Shower detail", shape: "polaroid" }
  ];

  return (
    <SiteShell>
      <section className="inspiration-detail-hero">
        <img src={style.cover} alt="" />
        <div className="inspiration-detail-shade">
          <div className="container inspiration-detail-copy">
            <Link href="/inspiration" className="back-link">
              All Styles
            </Link>
            <span style={{ backgroundColor: style.accent }} aria-hidden="true" />
            <h1>{style.name}</h1>
            <p>{style.description}</p>
          </div>
        </div>
      </section>

      <div className="container site-page inspiration-detail-page">
        <p className="inspiration-board-kicker">Pinned for you - scroll the board</p>
        <section className="inspiration-board">
          {collage.map((item, index) =>
            item.type === "product" ? (
              <article
                key={`${style.slug}-product-${index}`}
                className="inspiration-product-pin"
                style={{ transform: `rotate(${((index % 5) - 2) * 1.1}deg)` }}
              >
                <span style={{ backgroundColor: style.accent }}>Shop the look</span>
                <h2>{item.name}</h2>
                <p>{item.price}</p>
              </article>
            ) : (
              <figure
                key={`${style.slug}-image-${index}`}
                className={`inspiration-image-pin inspiration-image-${item.shape}`}
                style={{ transform: `rotate(${((index % 5) - 2) * 1.1}deg)` }}
              >
                <img src={item.src} alt="" />
                <figcaption>{item.label}</figcaption>
              </figure>
            )
          )}
        </section>

        <section className="inspiration-detail-cta">
          <p>Love this look? Get a personalized plan to recreate it on your budget.</p>
          <div className="cta-row">
            <Link href="/areas" className="btn btn-ghost">
              Browse areas
            </Link>
            <Link href="/blueprint" className="btn btn-accent">
              Build My Blueprint
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
