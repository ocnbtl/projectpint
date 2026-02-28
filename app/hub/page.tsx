import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { hubs, pillarLabel } from "../../lib/site-data";

export default function HubIndexPage() {
  return (
    <SiteShell>
      <div className="section-stack">
        <section className="hero">
          <div className="hero-grid">
            <div>
              <p className="eyebrow">Hub Directory</p>
              <h1>Pick the hub that matches your bathroom constraint.</h1>
              <p>
                Each hub groups practical blog posts and micro-guides so Pinterest traffic lands on clear next steps, not
                scattered ideas.
              </p>
              <div className="cta-row">
                <Link href="/start-here" className="btn btn-primary">
                  Use Start Here
                </Link>
                <Link href="/blog" className="btn btn-secondary">
                  Browse blog posts
                </Link>
              </div>
            </div>
            <aside className="hero-card">
              <h3>What to expect</h3>
              <ol>
                <li>One core outcome per hub.</li>
                <li>Renter-safe defaults and budget-aware options.</li>
                <li>Published destinations only for outbound sharing.</li>
              </ol>
            </aside>
          </div>
        </section>

        <section className="grid grid-3">
          {hubs.map((hub) => (
            <article key={hub.slug} className="card card-soft path-card hub-card">
              <p className="small">{pillarLabel(hub.primaryPillar)}</p>
              <h3>{hub.title}</h3>
              <p className="path-card-summary">{hub.description}</p>
              <p className="benefit-highlight">Outcome: {hub.outcome}</p>
              <Link href={`/hub/${hub.slug}`} className="btn btn-accent">
                Open hub path
              </Link>
            </article>
          ))}
        </section>

        <section className="panel">
          <h2>Publishing guardrails</h2>
          <ul>
            <li>Pins should link only to published destinations.</li>
            <li>Routing and copy stay renter-first and budget-first.</li>
            <li>Posting remains assisted and policy-safe, not unofficially automated.</li>
          </ul>
        </section>
      </div>
    </SiteShell>
  );
}
