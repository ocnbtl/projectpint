import { notFound } from "next/navigation";
import { AdSlot } from "../../../components/AdSlot";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { SiteShell } from "../../../components/SiteShell";
import { shouldShowAffiliateDisclosure } from "../../../lib/affiliate";
import { readBlogs } from "../../../lib/site-data";

export function generateStaticParams() {
  return readBlogs().map((b) => ({ slug: b.Slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const blog = readBlogs().find((b) => b.Slug === params.slug);
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
