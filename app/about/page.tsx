import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";

export default function AboutPage() {
  return (
    <SiteShell>
      <div className="section-stack">
        <section className="panel">
          <div className="about-header">
            <span className="brand-mark about-mark" aria-hidden="true" />
            <div>
              <p className="about-tagline">
                <span className="about-tagline-dot" aria-hidden="true" />
                Diyesu Decor
              </p>
              <h1>About Diyesu Decor</h1>
            </div>
          </div>
          <p>
            Diyesu Decor publishes practical, renter-aware bathroom upgrade systems for budget-first households. We focus
            on small-space function, low-cost style, and repeatable decision frameworks that reduce guesswork.
          </p>
          <p>
            Public brand: Diyesu Decor. Internal project codename: Project Pint. Tagline: DIY Bathroom Upgrades.
          </p>
        </section>

        <section className="grid grid-3">
          <article className="card">
            <h3>Who this is for</h3>
            <p>Renters and small-space homes that need safe, practical improvements without full renovation scope.</p>
          </article>
          <article className="card">
            <h3>How we publish</h3>
            <p>
              Content is generated and reviewed in assisted workflows. Key outputs and outbound publishing require human
              approval before release.
            </p>
          </article>
          <article className="card">
            <h3>Disclosure standard</h3>
            <p>
              Some links may be affiliate links. Global disclosure is shown in the site footer, with page-level
              disclosure blocks where affiliate links are present.
            </p>
          </article>
        </section>

        <section className="panel">
          <h2>Start here</h2>
          <p>
            If you are new, pick a constraint-based path first. Then move into hub content, blog walkthroughs, and the
            free plant picker lead magnet.
          </p>
          <div className="cta-row">
            <Link href="/start-here" className="btn btn-accent">
              Open Start Here
            </Link>
            <Link href="/hub" className="btn btn-ghost">
              Browse all hubs
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
