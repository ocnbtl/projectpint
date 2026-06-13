import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { areaVisuals } from "../../lib/redesign-data";
import { hubs } from "../../lib/site-data";

export default function StartHerePage() {
  const steps = [
    ["Pick the constraint", "Budget, rental rules, low light, clutter, or the one area that bothers you most."],
    ["Choose one area", "Stay inside the 8-area model so articles, guides, pins, and products stay aligned."],
    ["Finish one win", "Start with the smallest visible improvement before layering more style."]
  ];

  return (
    <SiteShell>
      <div className="container site-page">
        <section className="soft-hero">
          <p className="eyebrow blog-eyebrow">Start Here</p>
          <h1>Not sure where to start?</h1>
          <p>
            Diyesu Decor helps you pick the right first bathroom upgrade for your budget, rental rules, space, and
            patience level.
          </p>
        </section>

        <section className="dd-section">
          <div className="step-grid">
            {steps.map(([title, copy], index) => (
              <article key={title} className="step-card">
                <span>{index + 1}</span>
                <h2>{title}</h2>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dd-section">
          <div className="dd-section-head">
            <div>
              <p className="eyebrow blog-eyebrow">Choose Your Lane</p>
              <h2>Start with the area that matches today&apos;s limit.</h2>
            </div>
          </div>
          <div className="area-photo-grid area-photo-grid-large">
            {hubs.map((hub) => {
              const visual = areaVisuals[hub.area];
              return (
                <Link key={hub.slug} href={`/hub/${hub.slug}`} className="area-photo-card">
                  <img src={visual.image} alt="" />
                  <span className="area-photo-card-shade" aria-hidden="true" />
                  <span className="area-photo-card-copy">
                    <strong>{hub.title}</strong>
                    <span>{hub.outcome}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="dark-cta">
          <div>
            <p className="eyebrow">Fastest Free Tool</p>
            <h2>Want the easiest first win? Match a plant to your bathroom.</h2>
          </div>
          <Link href="/plant-picker" className="btn btn-accent">
            Free Plant Picker
          </Link>
        </section>
      </div>
    </SiteShell>
  );
}
