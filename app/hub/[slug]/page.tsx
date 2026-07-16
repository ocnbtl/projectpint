import Link from "next/link";
import { notFound } from "next/navigation";
import { AreaIcon } from "../../../components/AreaIcon";
import { SafeImage } from "../../../components/SafeImage";
import { SiteShell } from "../../../components/SiteShell";
import { estimateReadTimeMinutes, excerptFromMarkdown } from "../../../lib/content-render";
import { areaVisuals, inspirationStyles } from "../../../lib/redesign-data";
import { pageMetadata } from "../../../lib/seo";
import { blogMatchesArea, findGuidesForHub, hubs, readPublishedBlogs } from "../../../lib/site-data";

export const dynamic = "force-dynamic";

const STYLE_BY_AREA: Record<string, string[]> = {
  plants: ["spa-greenery", "japandi"],
  mirror: ["modern-marble", "minimalist-elegance"],
  storage: ["scandinavian-clean", "japandi"],
  lighting: ["warm-editorial", "dark-moody"],
  shower: ["spa-greenery", "coastal-calm"],
  renter: ["minimalist-elegance", "scandinavian-clean"],
  diy: ["industrial-loft", "brass-terrazzo"],
  "extreme-budget": ["boho-earth-tones", "warm-editorial"]
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = hubs.find((item) => item.slug === slug);
  if (!hub) return { robots: { index: false, follow: false } };

  return pageMetadata({
    title: `${hub.title} Bathroom Ideas`,
    description: `${hub.description} ${hub.outcome}`,
    path: `/areas/${hub.slug}`,
    image: areaVisuals[hub.area].image
  });
}

export default async function HubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = hubs.find((h) => h.slug === slug);
  if (!hub) return notFound();

  const visual = areaVisuals[hub.area];
  const blogs = await readPublishedBlogs();
  const relatedBlogs = blogs.filter((blog) => blogMatchesArea(blog, hub.area)).slice(0, 4);
  const guides = await findGuidesForHub(hub, 3);
  const resourceCards = [
    ...relatedBlogs.map((blog) => ({
      id: blog.Blog_ID,
      href: `/blog/${blog.Slug}`,
      title: blog.Title,
      excerpt: blog.editorial.excerpt || excerptFromMarkdown(blog.Draft_Markdown, 120),
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
  const relatedStyles = inspirationStyles.filter((style) => (STYLE_BY_AREA[hub.slug] ?? ["warm-editorial"]).includes(style.slug));
  const inspirationImages = Array.from(
    new Set([
      visual.image,
      ...relatedStyles.flatMap((style) => [
        style.cover,
        ...style.items
          .filter((item) => item.type === "image")
          .slice(1, 5)
          .map((item) => item.src)
      ]),
      ...inspirationStyles.slice(0, 4).map((style) => style.cover)
    ])
  ).slice(0, 14);

  return (
    <SiteShell>
      <section className="area-detail-hero" style={{ backgroundImage: `url(${visual.image})` }}>
        <div className="area-detail-hero-shade">
          <div className="container area-detail-copy" data-reveal="hero">
            <Link href="/areas" className="back-link">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m11 18-6-6 6-6" />
              </svg>
              <span>All Areas</span>
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
        <section className="area-detail-section" data-reveal>
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
                        <SafeImage src={resource.image} alt={`${resource.title} article`} loading="lazy" decoding="async" />
                      </span>
                      <span className="area-resource-meta">
                        <span>{resource.type}</span>
                        <span>{resource.readTime} min read</span>
                      </span>
                      <h3>{resource.title}</h3>
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
                    <SafeImage src={image} alt={`${hub.title} bathroom inspiration`} loading="lazy" decoding="async" />
                  </Link>
                ))}
              </div>
              <Link href="/inspiration" className="btn btn-ghost area-inspiration-button">
                Explore all style boards
              </Link>
            </aside>
          </div>
        </section>

        <section className="dark-cta" data-reveal>
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
