import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { readBlogs } from "../../lib/site-data";

export default function BlogIndex() {
  const blogs = readBlogs();

  return (
    <SiteShell>
      <div className="card">
        <h1>Blog</h1>
        <p>Assisted publishing: drafts require human approval before publish.</p>
      </div>
      <div className="grid" style={{ marginTop: 16 }}>
        {blogs.map((b) => (
          <article key={b.Blog_ID} className="card">
            <h3>
              <Link href={`/blog/${b.Slug}`}>{b.Title}</Link>
            </h3>
            <p className="small">Keyword: {b.Keyword_Target}</p>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
