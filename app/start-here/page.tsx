import Link from "next/link";
import { AreaIcon } from "../../components/AreaIcon";
import { SiteShell } from "../../components/SiteShell";
import { TypewriterEyebrow } from "../../components/TypewriterEyebrow";
import { areaVisuals, redesignImages } from "../../lib/redesign-data";
import { pageMetadata } from "../../lib/seo";
import { blogMatchesArea, hubs, readPublishedBlogs, readPublishedGuides } from "../../lib/site-data";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "Start Here",
  description: "Choose the first bathroom area to improve and find practical articles, guides, and quick wins.",
  path: "/start-here",
  image: redesignImages.hero
});

function StepIcon({ name }: { name: "target" | "browse" | "hammer" }) {
  const paths = {
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </>
    ),
    browse: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8" cy="9" r="1.5" />
        <path d="m4 17 4.5-4.5 3 3 2.5-2.5 6 6" />
      </>
    ),
    hammer: (
      <>
        <path d="m13.5 3.5 7 7-3.5 3.5-2.25-2.25L6 20.5 3.5 18l8.75-8.75L10 7l3.5-3.5Z" />
      </>
    )
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default async function StartHerePage() {
  const [blogSource, guideSource] = await Promise.all([readPublishedBlogs(), readPublishedGuides()]);
  const steps = [
    ["target", "Pick an area", "Choose the part of your bathroom that bugs you the most."],
    ["browse", "Browse ideas", "Find specific guides and product recommendations for that area."],
    ["hammer", "Make it happen", "Follow our step-by-step plans and enjoy the upgrade."]
  ];

  return (
    <SiteShell>
      <section className="start-figma-hero">
        <div className="container" data-reveal="hero">
          <p className="eyebrow blog-eyebrow">
            <TypewriterEyebrow text="Welcome" />
          </p>
          <h1>Not sure where to start?</h1>
          <p>
            <span>We get it. There are a hundred things you could do to your bathroom.</span>
            <span>Let&apos;s find the one that makes the most sense for you right now.</span>
          </p>
        </div>
      </section>

      <div className="container start-figma-page">
        <section className="start-steps-section">
          <div className="start-section-head" data-reveal>
            <p className="eyebrow blog-eyebrow">How This Works</p>
            <h2>Three steps to see your first bathroom win</h2>
          </div>
          <div className="start-step-grid">
            {steps.map(([icon, title, copy], index) => (
              <article
                key={title}
                className="start-step-card"
                data-reveal
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <span>
                  <StepIcon name={icon as "target" | "browse" | "hammer"} />
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

      </div>

      <section className="start-area-section">
        <div className="container">
          <div className="start-section-head" data-reveal>
            <div>
              <h2>Choose the first area you want to upgrade</h2>
              <p>Each area has curated articles, product recommendations, and quick-start guides.</p>
            </div>
          </div>
          <div className="start-area-list">
            {hubs.map((hub, index) => {
              const visual = areaVisuals[hub.area];
              const articleCount =
                blogSource.filter((blog) => blogMatchesArea(blog, hub.area)).length +
                guideSource.filter((guide) => guide.area === hub.area).length;
              return (
                <Link
                  key={hub.slug}
                  href={`/areas/${hub.slug}`}
                  className="start-area-card"
                  data-reveal
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <span className="start-area-icon">
                    <AreaIcon name={visual.icon} />
                  </span>
                  <div className="start-area-copy">
                    <div>
                      <h3>{hub.title}</h3>
                      <span className="start-area-count">
                        {articleCount} {articleCount === 1 ? "article" : "articles"}
                      </span>
                    </div>
                    <small>{visual.tagline}</small>
                  </div>
                  <span className="start-area-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container start-picker-wrap">
        <section className="start-picker-cta" data-reveal>
          <div>
            <h2>Still deciding?</h2>
            <p>
              <span>Try our free Plant Picker tool.</span>
              <span>It&apos;s a quick win that makes any bathroom feel more alive.</span>
            </p>
          </div>
          <Link href="/plant-picker" className="btn btn-accent">
            Try the Plant Picker
            <svg className="btn-leaf-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 19c9.5 0 14-5.6 14-14-8.4 0-14 4.5-14 14Z" />
              <path d="M5 19c3-5 6.7-8 11-10" />
            </svg>
          </Link>
        </section>
      </div>
    </SiteShell>
  );
}
