import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/SiteShell";
import { contentAreaLabel, contentAreaSlug } from "../../../lib/constants";
import { estimateReadTimeMinutes, excerptFromMarkdown } from "../../../lib/content-render";
import { areaVisuals } from "../../../lib/redesign-data";
import { contentAreaForBlog, findTagArchiveBySlug, tagsForBlog } from "../../../lib/site-data";

export const dynamic = "force-dynamic";

export default async function TagArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const archive = await findTagArchiveBySlug(slug);
  if (!archive) return notFound();
  const linkedArea = archive.blogs[0] ? contentAreaForBlog(archive.blogs[0]) : archive.guides[0]?.area ?? "DIY";

  return (
    <SiteShell>
      <section className="blog-index-hero tag-archive-hero">
        <div className="container blog-index-hero-inner">
          <p className="eyebrow">Tagged Articles</p>
          <h1>{archive.label}</h1>
          <p>
            Browse every published blog and guide connected to {archive.label.toLowerCase()} bathroom upgrades.
          </p>
          <div className="tag-archive-stats" aria-label="Archive counts">
            <span>{archive.blogs.length} blog posts</span>
            <span>{archive.guides.length} guides</span>
          </div>
        </div>
      </section>

      <div className="container site-page site-page-tight tag-archive-page">
        {archive.blogs.length > 0 ? (
          <section className="dd-section tag-archive-section">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Blog Posts</p>
                <h2>Articles for {archive.label}</h2>
              </div>
            </div>
            <div className="grid grid-3">
              {archive.blogs.map((blog) => {
                const area = contentAreaForBlog(blog);
                return (
                  <Link key={blog.Blog_ID} href={`/blog/${blog.Slug}`} className="blog-card-link">
                    <article className="blog-image-card">
                      <div className="blog-image-card-media">
                        <img src={areaVisuals[area].image} alt="" />
                      </div>
                      <div className="blog-image-card-copy">
                        <div className="blog-card-meta">
                          <span className="badge badge-muted">{contentAreaLabel(area)}</span>
                          <span className="blog-read-time">{estimateReadTimeMinutes(blog.Draft_Markdown)} min</span>
                        </div>
                        <h2>{blog.Title}</h2>
                        <p>{excerptFromMarkdown(blog.Draft_Markdown, 160)}</p>
                        <div className="tag-list blog-tag-list tag-list-compact">
                          {tagsForBlog(blog)
                            .slice(0, 3)
                            .map((tag) => (
                              <span key={`${blog.Blog_ID}-${tag}`} className="tag tag-muted">
                                {tag}
                              </span>
                            ))}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {archive.guides.length > 0 ? (
          <section className="dd-section tag-archive-section">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Guides</p>
                <h2>Step-by-step references</h2>
              </div>
            </div>
            <div className="grid grid-3">
              {archive.guides.map((guide) => (
                <Link key={guide.Guide_ID} href={`/guides/${guide.slug}`} className="blog-card-link">
                  <article className="blog-image-card">
                    <div className="blog-image-card-media">
                      <img src={areaVisuals[guide.area].image} alt="" />
                    </div>
                    <div className="blog-image-card-copy">
                      <div className="blog-card-meta">
                        <span className="badge badge-muted">{contentAreaLabel(guide.area)}</span>
                        <span className="blog-read-time">Guide</span>
                      </div>
                      <h2>{guide.title}</h2>
                      <p>{guide.summary}</p>
                      <div className="tag-list blog-tag-list tag-list-compact">
                        {guide.tags.slice(0, 3).map((tag) => (
                          <span key={`${guide.Guide_ID}-${tag}`} className="tag tag-muted">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className="tag-archive-back">
          <Link href="/blog" className="btn btn-secondary">
            Back to all articles
          </Link>
          <Link href={`/hub/${contentAreaSlug(linkedArea)}`} className="btn btn-accent">
            Browse this area
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
