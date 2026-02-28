import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { hubs } from "../../lib/site-data";

export default function StartHerePage() {
  const orderedSlugs = [
    "renter-friendly-upgrades",
    "small-bathroom-space-hacks",
    "budget-diy-transformations",
    "bathroom-plants-biophilic-vibe"
  ];
  const starterHubs = orderedSlugs
    .map((slug) => hubs.find((hub) => hub.slug === slug))
    .filter((hub): hub is (typeof hubs)[number] => Boolean(hub));

  return (
    <SiteShell>
      <div className="section-stack">
        <section className="hero hero-start-here">
          <div className="hero-start-wrap">
            <p className="eyebrow">Start Here</p>
            <h1 className="start-here-title">Pick a path and get your first bathroom win today.</h1>
            <p>Choose the path that matches your current constraints and get a solution that works for you.</p>
          </div>
        </section>

        <section className="panel">
          <div className="grid grid-2">
            {starterHubs.map((hub) => (
              <article key={hub.slug} className="card card-soft path-card">
                <div className="path-card-main">
                  <h3>{hub.title}</h3>
                  <p className="path-card-summary">{hub.description}</p>
                </div>
                <div className="path-card-action">
                  <p className="benefit-highlight">First win: {hub.outcome}</p>
                  <Link href={`/hub/${hub.slug}`} className="btn btn-accent">
                    Explore {hub.title}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
