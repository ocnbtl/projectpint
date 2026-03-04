import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { hubs } from "../../lib/site-data";

export default function HubIndexPage() {
  return (
    <SiteShell>
      <div className="section-stack">
        <section className="panel areas-intro">
          <p className="eyebrow areas-eyebrow">Areas</p>
          <h1>Choose the bathroom area you want to improve first.</h1>
          <p>
            Pick one area, start small, and finish a real upgrade this week. Every path is built for real homes, real
            routines, and practical budgets.
          </p>
          <div className="cta-row">
            <Link href="/start-here" className="btn btn-accent">
              Start with guidance
            </Link>
            <Link href="/blog" className="btn btn-ghost">
              Read quick guides
            </Link>
          </div>
        </section>

        <section className="grid grid-3 areas-grid">
          {hubs.map((hub) => (
            <article key={hub.slug} className="card areas-card">
              <p className="areas-pill">{hub.title} area</p>
              <h3>{hub.title}</h3>
              <p className="path-card-summary">{hub.description}</p>
              <p className="benefit-highlight">Win today: {hub.outcome}</p>
              <Link href={`/hub/${hub.slug}`} className="btn btn-accent">
                Explore {hub.title}
              </Link>
            </article>
          ))}
        </section>
      </div>
    </SiteShell>
  );
}
