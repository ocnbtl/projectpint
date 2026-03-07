import { notFound } from "next/navigation";
import { AdSlot } from "../../../components/AdSlot";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { SiteShell } from "../../../components/SiteShell";
import { shouldShowAffiliateDisclosure } from "../../../lib/affiliate";
import { readBlogs } from "../../../lib/site-data";

export async function generateStaticParams() {
  const blogs = await readBlogs();
  return blogs.map((b) => ({ slug: b.Slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blogs = await readBlogs();
  const blog = blogs.find((b) => b.Slug === slug);
  if (!blog) return notFound();
  const showAffiliateDisclosure = shouldShowAffiliateDisclosure({
    explicitFlag: blog.Affiliate_Disclosure_Required,
    containsAffiliateLinks: blog.Contains_Affiliate_Links,
    markdownOrText: blog.Draft_Markdown
  });

  return (
    <SiteShell>
      <article className="card">
        <h1>{blog.Title}</h1>
        <p className="small">Status: {blog.Status}</p>
        <pre style={{ whiteSpace: "pre-wrap" }}>{blog.Draft_Markdown}</pre>
      </article>
      {showAffiliateDisclosure ? <AffiliateDisclosure /> : null}
      <AdSlot enabled={blog.Ad_Enabled} slotId={`blog-${blog.Blog_ID}`} />
    </SiteShell>
  );
}
