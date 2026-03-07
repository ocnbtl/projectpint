import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/SiteShell";
import { contentAreaLabel } from "../../../lib/constants";
import { blogMatchesArea, findGuidesForHub, hubs, readBlogs } from "../../../lib/site-data";

export function generateStaticParams() {
  return hubs.map((hub) => ({ slug: hub.slug }));
}

export default async function HubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = hubs.find((h) => h.slug === slug);
  if (!hub) return notFound();
  const blogs = await readBlogs();
  const relatedBlogs = blogs
    .filter((blog) => blog.Status === "published" && blogMatchesArea(blog, hub.area))
    .slice(0, 4);
  const guides = await findGuidesForHub(hub, 4);

  return (
    <SiteShell>
      <div className="section-stack">
        <section className="hero">
          <div className="hero-grid">
            <div>
              <p className="eyebrow">Area</p>
              <h1>{hub.title}</h1>
              <p>{hub.description}</p>
              <p className="home-hero-cta">Primary win: {hub.outcome}</p>
              <div className="pill-row" aria-label="Hub details">
                <span className="pill">Area: {contentAreaLabel(hub.area)}</span>
                <span className="pill">Budget-aware sequencing</span>
                <span className="pill">Renter-safe by default</span>
              </div>
              <div className="cta-row">
                <Link href="/start-here" className="btn btn-primary">
                  Compare paths
                </Link>
                <Link href="/lead-magnets/plant-picker" className="btn btn-secondary">
                  Get free plant picker
                </Link>
              </div>
            </div>
            <aside className="hero-card">
              <h3>Run this hub weekly</h3>
              <ol>
                <li>Choose one anchor fix for this week.</li>
                <li>Add one support layer only after the anchor is done.</li>
                <li>Track the routine impact before adding more tasks.</li>
              </ol>
            </aside>
          </div>
        </section>

        <section className="grid grid-2">
          <article className="card">
            <h2>Related reads</h2>
            {relatedBlogs.length > 0 ? (
              <ul>
                {relatedBlogs.map((blog) => (
                  <li key={blog.Blog_ID}>
                    <Link href={`/blog/${blog.Slug}`}>{blog.Title}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small">
                No published posts in this area yet. Use Start Here and browse available hubs while we publish more
                coverage.
              </p>
            )}
          </article>

          <article className="card">
            <h2>Quick guides</h2>
            {guides.length > 0 ? (
              <ul>
                {guides.map((guide) => (
                  <li key={guide.slug}>
                    <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small">Guide pack for this area is in progress. Check back soon.</p>
            )}
          </article>
        </section>

        <section className="panel">
          <h2>Keep exploring</h2>
          <p>After your first win, choose one of these next moves:</p>
          <div className="cta-row">
            <Link href="/blog" className="btn btn-ghost">
              Browse blog library
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
