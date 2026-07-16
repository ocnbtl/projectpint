import Link from "next/link";
import { AreaIcon } from "../../components/AreaIcon";
import { SafeImage } from "../../components/SafeImage";
import { SiteShell } from "../../components/SiteShell";
import { areaVisuals, redesignImages } from "../../lib/redesign-data";
import { pageMetadata } from "../../lib/seo";
import { blogMatchesArea, hubs, readPublishedBlogs, readPublishedGuides } from "../../lib/site-data";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "Bathroom Areas",
  description: "Browse bathroom ideas, guides, and upgrade plans by the part of the room you want to improve.",
  path: "/areas",
  image: redesignImages.hero
});

export default async function HubIndexPage() {
  const [blogSource, guideSource] = await Promise.all([readPublishedBlogs(), readPublishedGuides()]);

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
                  <SafeImage src={visual.image} alt={`${hub.title} bathroom inspiration`} loading="lazy" decoding="async" />
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
