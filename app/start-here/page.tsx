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
        <section className="hero">
          <div className="hero-grid">
            <div>
              <p className="eyebrow">Start Here</p>
              <h1 className="start-here-title">
                Pick one clear lane and get your <span className="line-break">first bathroom win this week.</span>
              </h1>
              <p>
                You do not need a full remodel. Choose the lane that matches your current constraint, then execute one
                anchor fix plus one support move.
              </p>
              <div className="pill-row" aria-label="Start Here filters">
                <span className="pill">Renter-safe first</span>
                <span className="pill">Budget under $75/$150/$300</span>
                <span className="pill">Small-space routines</span>
              </div>
              <div className="cta-row">
                <Link href="/hub" className="btn btn-primary">
                  Browse all hubs
                </Link>
                <Link href="/lead-magnets/plant-picker" className="btn btn-secondary">
                  Try free plant picker
                </Link>
              </div>
            </div>
            <aside className="hero-card">
              <h3>How to use this page</h3>
              <ol>
                <li>Pick the lane closest to your current bottleneck.</li>
                <li>Finish one task in under 30 minutes first.</li>
                <li>Stack one follow-up move from that same lane.</li>
              </ol>
              <p className="small">Keep the scope tight for week one so the system sticks.</p>
            </aside>
          </div>
        </section>

        <section className="panel">
          <h2>Choose your starting lane</h2>
          <div className="grid grid-2">
            {starterHubs.map((hub) => (
              <article key={hub.slug} className="card card-soft path-card">
                <h3>{hub.title}</h3>
                <p className="path-card-summary">{hub.description}</p>
                <p className="benefit-highlight">First win: {hub.outcome}</p>
                <Link href={`/hub/${hub.slug}`} className="btn btn-accent">
                  Start this lane
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>After you choose</h2>
          <ol>
            <li>Read one related guide so your first task is clear before you shop.</li>
            <li>Use one budget lane and avoid mixing too many product categories at once.</li>
            <li>Track what changed this week, then repeat with the same lane next week.</li>
          </ol>
          <div className="cta-row">
            <Link href="/blog" className="btn btn-ghost">
              Read latest guides
            </Link>
            <Link href="/products/renter-bathroom-upgrade-blueprint" className="btn btn-accent">
              Preview renter blueprint
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
