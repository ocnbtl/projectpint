import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { inspirationStyles } from "../../lib/redesign-data";

export default function InspirationPage() {
  return (
    <SiteShell>
      <div className="container site-page">
        <section className="soft-hero">
          <p className="eyebrow blog-eyebrow">Inspiration</p>
          <h1>Bathroom looks you can translate into real upgrades.</h1>
          <p>Browse visual directions first, then use the live areas and blueprint flow to turn the look into a plan.</p>
        </section>

        <section className="dd-section">
          <div className="inspiration-grid">
            {inspirationStyles.map((style) => (
              <Link key={style.slug} href={`/inspiration/${style.slug}`} className="inspiration-card">
                <img src={style.cover} alt="" />
                <span className="inspiration-card-copy">
                  <span style={{ backgroundColor: style.accent }} aria-hidden="true" />
                  <strong>{style.name}</strong>
                  <small>{style.description}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
