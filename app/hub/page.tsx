import Link from "next/link";
import { AreaIcon } from "../../components/AreaIcon";
import { SiteShell } from "../../components/SiteShell";
import { areaVisuals } from "../../lib/redesign-data";
import { blogMatchesArea, hubs, readBlogs, readGuides } from "../../lib/site-data";

export const dynamic = "force-dynamic";

export default async function HubIndexPage() {
  const [blogs, guides] = await Promise.all([readBlogs(), readGuides()]);
  const publishedBlogs = blogs.filter((blog) => blog.Status === "published");
  const blogSource = publishedBlogs.length > 0 ? publishedBlogs : blogs;
  const publishedGuides = guides.filter((guide) => guide.status.trim().toLowerCase() === "published");
  const guideSource = publishedGuides.length > 0 ? publishedGuides : guides;

  return (
    <SiteShell>
      <section className="areas-index-hero">
        <div className="container areas-index-hero-inner" data-reveal="hero">
          <p className="areas-kicker">Browse by Area</p>
          <h1>Every part of your bathroom, covered</h1>
          <p>Pick an area to explore curated articles, product recommendations, upgrade plans, and tips tailored to your space + budget.</p>
        </div>
      </section>

      <div className="container site-page areas-index-page">
        <section className="areas-overview-grid" aria-label="Bathroom areas">
            {hubs.map((hub, index) => {
              const visual = areaVisuals[hub.area];
              const resourceCount =
                blogSource.filter((blog) => blogMatchesArea(blog, hub.area)).length +
                guideSource.filter((guide) => guide.area === hub.area).length;
              return (
                <Link
                  key={hub.slug}
                  href={`/areas/${hub.slug}`}
                  className="area-overview-card"
                  data-reveal
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <img src={visual.image} alt={`${hub.title} bathroom inspiration`} loading="lazy" decoding="async" />
                  <span className="area-overview-shade" aria-hidden="true" />
                  <div className="area-overview-copy">
                    <div className="area-overview-head">
                      <span className="area-icon-bubble">
                        <AreaIcon name={visual.icon} />
                      </span>
                      <div>
                        <h2>{hub.title}</h2>
                        <span>{visual.tagline}</span>
                      </div>
                    </div>
                    <span className="area-resource-count">
                      {resourceCount} {resourceCount === 1 ? "article" : "articles"}
                    </span>
                  </div>
                </Link>
              );
            })}
        </section>
      </div>
    </SiteShell>
  );
}
