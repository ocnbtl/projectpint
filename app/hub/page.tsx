import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { areaVisuals } from "../../lib/redesign-data";
import { hubs } from "../../lib/site-data";

export default function HubIndexPage() {
  return (
    <SiteShell>
      <div className="container site-page">
        <section className="soft-hero">
          <p className="eyebrow blog-eyebrow">Areas</p>
          <h1>Every part of your bathroom, covered.</h1>
          <p>
            Eight focused paths keep every public article, guide, pin, and product offer aligned around real bathroom
            problems.
          </p>
        </section>

        <section className="dd-section">
          <div className="area-photo-grid area-photo-grid-large">
            {hubs.map((hub) => {
              const visual = areaVisuals[hub.area];
              return (
                <Link key={hub.slug} href={`/hub/${hub.slug}`} className="area-photo-card area-photo-card-tall">
                  <img src={visual.image} alt="" />
                  <span className="area-photo-card-shade" aria-hidden="true" />
                  <span className="area-photo-card-copy">
                    <strong>{hub.title}</strong>
                    <span>{visual.tagline}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
