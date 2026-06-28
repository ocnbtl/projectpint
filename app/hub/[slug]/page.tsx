import Link from "next/link";
import { notFound } from "next/navigation";
import { AreaIcon } from "../../../components/AreaIcon";
import { SiteShell } from "../../../components/SiteShell";
import { estimateReadTimeMinutes, excerptFromMarkdown } from "../../../lib/content-render";
import { areaVisuals, inspirationStyles } from "../../../lib/redesign-data";
import { blogMatchesArea, findGuidesForHub, hubs, readBlogs } from "../../../lib/site-data";

export const dynamic = "force-dynamic";

const STYLE_BY_AREA: Record<string, string[]> = {
  plants: ["spa-greenery", "warm-editorial"],
  mirror: ["modern-marble", "minimalist-elegance"],
  storage: ["minimalist-elegance", "warm-editorial"],
  lighting: ["warm-editorial", "modern-marble"],
  shower: ["spa-greenery", "modern-marble"],
  renter: ["minimalist-elegance", "warm-editorial"],
  diy: ["brass-terrazzo", "warm-editorial"],
  "extreme-budget": ["boho-earth-tones", "warm-editorial"]
};

export default async function HubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = hubs.find((h) => h.slug === slug);
  if (!hub) return notFound();

  const visual = areaVisuals[hub.area];
  const blogs = await readBlogs();
  const publishedBlogs = blogs.filter((blog) => blog.Status === "published");
  const blogSource = publishedBlogs.length > 0 ? publishedBlogs : blogs;
  const relatedBlogs = blogSource.filter((blog) => blogMatchesArea(blog, hub.area)).slice(0, 4);
  const guides = await findGuidesForHub(hub, 3);
  const resourceCards = [
    ...relatedBlogs.map((blog) => ({
      id: blog.Blog_ID,
      href: `/blog/${blog.Slug}`,
      title: blog.Title,
      excerpt: excerptFromMarkdown(blog.Draft_Markdown, 120),
      readTime: estimateReadTimeMinutes(blog.Draft_Markdown),
      image: visual.image,
      type: "Article"
    })),
    ...guides.map((guide) => ({
      id: guide.Guide_ID,
      href: `/guides/${guide.slug}`,
      title: guide.title,
      excerpt: guide.summary,
      readTime: estimateReadTimeMinutes(guide.content),
      image: visual.image,
      type: "Guide"
    }))
  ].slice(0, 6);
  const inspirationImages = Array.from(
    new Set([
      visual.image,
      ...inspirationStyles
        .filter((style) => (STYLE_BY_AREA[hub.slug] ?? ["warm-editorial"]).includes(style.slug))
        .flatMap((style) => [style.cover]),
      ...inspirationStyles.slice(0, 4).map((style) => style.cover)
    ])
  ).slice(0, 8);

  return (
    <SiteShell>
      <section className="area-detail-hero" style={{ backgroundImage: `url(${visual.image})` }}>
        <div className="area-detail-hero-shade">
          <div className="container area-detail-copy">
            <Link href="/areas" className="back-link">
              All Areas
            </Link>
            <div className="area-detail-title-row">
              <span className="area-icon-bubble area-icon-bubble-large">
                <AreaIcon name={visual.icon} />
              </span>
              <div>
                <h1>{hub.title}</h1>
                <p>{visual.tagline}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container site-page">
        <section className="area-detail-section">
          <p className="area-detail-description">{hub.description} {hub.outcome}</p>

          <div className="area-detail-grid">
            <div className="area-resource-column">
              <div className="area-column-head">
                <div>
                  <p className="areas-kicker">Articles</p>
                  <h2>Guides &amp; Ideas</h2>
                </div>
                <Link href={`/blog?area=${hub.slug}`} className="area-more-link">
                  More
                  <span aria-hidden="true">-&gt;</span>
                </Link>
              </div>

              {resourceCards.length > 0 ? (
                <div className="area-resource-grid">
                  {resourceCards.map((resource) => (
                    <Link key={resource.id} href={resource.href} className="area-resource-card">
                      <span className="area-resource-media">
                        <img src={resource.image} alt="" />
                      </span>
                      <span className="area-resource-meta">
                        <span>{resource.type}</span>
                        <span>{resource.readTime} min read</span>
                      </span>
                      <strong>{resource.title}</strong>
                      <span>{resource.excerpt}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="area-empty-state">
                  <p>Articles for this area are coming soon.</p>
                </div>
              )}
            </div>

            <aside className="area-inspiration-column">
              <div className="area-column-head area-column-head-compact">
                <div>
                  <p className="areas-kicker">Inspiration</p>
                  <h2>Looks We Love</h2>
                </div>
                <Link href="/inspiration" className="area-more-link">
                  More
                  <span aria-hidden="true">-&gt;</span>
                </Link>
              </div>
              <div className="area-inspiration-masonry">
                {inspirationImages.map((image, index) => (
                  <Link key={`${image}-${index}`} href="/inspiration" className="area-inspiration-image">
                    <img src={image} alt="" />
                  </Link>
                ))}
              </div>
              <Link href="/inspiration" className="btn btn-ghost area-inspiration-button">
                Explore all style boards
              </Link>
            </aside>
          </div>
        </section>

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
