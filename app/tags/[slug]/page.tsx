import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/SiteShell";
import { excerptFromMarkdown } from "../../../lib/content-render";
import { findTagArchiveBySlug, readAllTagArchives, tagsForBlog } from "../../../lib/site-data";
import { tagPath } from "../../../lib/tags";

export async function generateStaticParams() {
  const archives = await readAllTagArchives();
  return archives.map((archive) => ({ slug: archive.slug }));
}

export default async function TagArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const archive = await findTagArchiveBySlug(slug);
  if (!archive) return notFound();

  return (
    <SiteShell>
      <div className="section-stack">
        <section className="panel blog-hero">
          <p className="eyebrow blog-eyebrow">Tags</p>
          <h1>{archive.label}</h1>
          <p>
            Browse every published blog and guide tagged <strong>{archive.label}</strong>.
          </p>
        </section>

        {archive.blogs.length > 0 ? (
          <section className="panel">
            <h2>Blog posts</h2>
            <div className="grid grid-3">
              {archive.blogs.map((blog) => (
                <article key={blog.Blog_ID} className="card blog-card">
                  <div className="tag-list blog-tag-list tag-list-compact">
                    {tagsForBlog(blog).map((tag) => (
                      <Link key={`${blog.Blog_ID}-${tag}`} href={tagPath(tag)} className="tag tag-link">
                        {tag}
                      </Link>
                    ))}
                  </div>
                  <h3>
                    <Link href={`/blog/${blog.Slug}`}>{blog.Title}</Link>
                  </h3>
                  <p className="blog-card-excerpt">{excerptFromMarkdown(blog.Draft_Markdown, 160)}...</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {archive.guides.length > 0 ? (
          <section className="panel">
            <h2>Guides</h2>
            <div className="grid grid-3">
              {archive.guides.map((guide) => (
                <article key={guide.Guide_ID} className="card blog-card">
                  <div className="tag-list blog-tag-list tag-list-compact">
                    {guide.tags.map((tag) => (
                      <Link key={`${guide.Guide_ID}-${tag}`} href={tagPath(tag)} className="tag tag-link">
                        {tag}
                      </Link>
                    ))}
                  </div>
                  <h3>
                    <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                  </h3>
                  <p className="blog-card-excerpt">{guide.summary}...</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </SiteShell>
  );
}
