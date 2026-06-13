import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/SiteShell";
import { areaVisuals, inspirationStyles } from "../../../lib/redesign-data";
import { blogMatchesArea, findGuidesForHub, hubs, readBlogs } from "../../../lib/site-data";

export const dynamic = "force-dynamic";

export default async function HubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = hubs.find((h) => h.slug === slug);
  if (!hub) return notFound();

  const visual = areaVisuals[hub.area];
  const blogs = await readBlogs();
  const relatedBlogs = blogs
    .filter((blog) => blog.Status === "published" && blogMatchesArea(blog, hub.area))
    .slice(0, 4);
  const guides = await findGuidesForHub(hub, 3);
  const featuredGuide = guides[0];

  return (
    <SiteShell>
      <section className="area-detail-hero" style={{ backgroundImage: `url(${visual.image})` }}>
        <div className="area-detail-hero-shade">
          <div className="container area-detail-copy">
            <Link href="/hub" className="back-link">
              All Areas
            </Link>
            <p className="eyebrow">Bathroom Area</p>
            <h1>{hub.title}</h1>
            <p>{visual.tagline}</p>
          </div>
        </div>
      </section>

      <div className="container site-page">
        <section className="split-feature split-feature-align-start">
          <div>
            <p className="eyebrow blog-eyebrow">Live Resources</p>
            <h2>{hub.description}</h2>
            <p>{hub.outcome}</p>
            <div className="link-list-card">
              <h3>Related reads</h3>
              {relatedBlogs.length > 0 ? (
                <ul>
                  {relatedBlogs.map((blog) => (
                    <li key={blog.Blog_ID}>
                      <Link href={`/blog/${blog.Slug}`}>{blog.Title}</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="small">No published posts in this area yet.</p>
              )}
            </div>
          </div>
          <aside className="masonry-preview">
            {inspirationStyles.slice(0, 4).map((style) => (
              <Link key={style.slug} href={`/inspiration/${style.slug}`}>
                <img src={style.cover} alt="" />
                <span>{style.name}</span>
              </Link>
            ))}
          </aside>
        </section>

        {featuredGuide ? (
          <section className="dd-section">
            <div className="dd-section-head">
              <div>
                <p className="eyebrow blog-eyebrow">Quick Guide</p>
                <h2>{featuredGuide.title}</h2>
              </div>
              <Link href={`/guides/${featuredGuide.slug}`} className="btn btn-ghost">
                Open guide
              </Link>
            </div>
            <article className="prose-card prose-card-compact">
              <p>{featuredGuide.summary}</p>
            </article>
          </section>
        ) : null}

        <section className="dark-cta">
          <div>
            <p className="eyebrow">Next Step</p>
            <h2>Turn this area into a budget-aware bathroom plan.</h2>
          </div>
          <Link href="/blueprint" className="btn btn-accent">
            Build Blueprint
          </Link>
        </section>
      </div>
    </SiteShell>
  );
}
