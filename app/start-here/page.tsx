import Link from "next/link";
import { AreaIcon } from "../../components/AreaIcon";
import { SiteShell } from "../../components/SiteShell";
import { areaVisuals } from "../../lib/redesign-data";
import { blogMatchesArea, hubs, readBlogs, readGuides } from "../../lib/site-data";

export const dynamic = "force-dynamic";

function StepIcon({ name }: { name: "target" | "sparkles" | "hammer" }) {
  const paths = {
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </>
    ),
    sparkles: (
      <>
        <path d="M12 2l1.4 5.1L18 9l-4.6 1.9L12 16l-1.4-5.1L6 9l4.6-1.9L12 2Z" />
        <path d="M5 15l.7 2.1L8 18l-2.3.9L5 21l-.7-2.1L2 18l2.3-.9L5 15Z" />
        <path d="M19 14l.6 1.7 1.8.7-1.8.7L19 19l-.6-1.9-1.8-.7 1.8-.7L19 14Z" />
      </>
    ),
    hammer: (
      <>
        <path d="M14 5l5 5" />
        <path d="M11 8l5-5 3 3-5 5" />
        <path d="M13 10L5 18l-2-2 8-8" />
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
  const [blogs, guides] = await Promise.all([readBlogs(), readGuides()]);
  const publishedBlogs = blogs.filter((blog) => blog.Status === "published");
  const blogSource = publishedBlogs.length > 0 ? publishedBlogs : blogs;
  const publishedGuides = guides.filter((guide) => guide.status.trim().toLowerCase() === "published");
  const guideSource = publishedGuides.length > 0 ? publishedGuides : guides;
  const steps = [
    ["target", "Pick an area", "Choose the part of your bathroom that bugs you the most."],
    ["sparkles", "Browse ideas", "Find specific guides and product recommendations for that area."],
    ["hammer", "Make it happen", "Follow step-by-step plans and enjoy the upgrade."]
  ];

  return (
    <SiteShell>
      <section className="start-figma-hero">
        <div className="container">
          <p className="eyebrow blog-eyebrow">Welcome</p>
          <h1>Not sure where to start?</h1>
          <p>
            <span>We get it. There are a hundred things you could do to your bathroom.</span>
            <span>Let&apos;s find the one that makes the most sense for you right now.</span>
          </p>
        </div>
      </section>

      <div className="container start-figma-page">
        <section className="start-steps-section">
          <div className="start-section-head">
            <p className="eyebrow blog-eyebrow">How This Works</p>
            <h2>Three steps to see your first bathroom win</h2>
          </div>
          <div className="start-step-grid">
            {steps.map(([icon, title, copy]) => (
              <article key={title} className="start-step-card">
                <span>
                  <StepIcon name={icon as "target" | "sparkles" | "hammer"} />
                </span>
                <h2>{title}</h2>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="start-area-section">
          <div className="start-section-head">
            <div>
              <h2>Choose the first area you want to upgrade</h2>
              <p>Each area has curated articles, product recommendations, and quick-start guides.</p>
            </div>
          </div>
          <div className="start-area-list">
            {hubs.map((hub) => {
              const visual = areaVisuals[hub.area];
              const articleCount =
                blogSource.filter((blog) => blogMatchesArea(blog, hub.area)).length +
                guideSource.filter((guide) => guide.area === hub.area).length;
              return (
                <Link key={hub.slug} href={`/hub/${hub.slug}`} className="start-area-card">
                  <span className="start-area-icon">
                    <AreaIcon name={visual.icon} />
                  </span>
                  <span className="start-area-copy">
                    <span>
                      <strong>{hub.title}</strong>
                      <em>
                        {articleCount} {articleCount === 1 ? "article" : "articles"}
                      </em>
                    </span>
                    <small>{visual.tagline}</small>
                  </span>
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
        </section>

        <section className="start-picker-cta">
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
