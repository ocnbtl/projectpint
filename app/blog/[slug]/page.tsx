import { notFound } from "next/navigation";
import Link from "next/link";
import { AdSlot } from "../../../components/AdSlot";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { MarkdownArticle } from "../../../components/MarkdownArticle";
import { SiteShell } from "../../../components/SiteShell";
import { shouldShowAffiliateDisclosure } from "../../../lib/affiliate";
import { markdownBlocks } from "../../../lib/content-render";
import { readBlogs, tagsForBlog } from "../../../lib/site-data";
import { tagPath } from "../../../lib/tags";

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
  const blocks = markdownBlocks(blog.Draft_Markdown);

  return (
    <SiteShell>
      <article className="card prose-card">
        <p className="small">Status: {blog.Status}</p>
        <div className="tag-list article-tag-list">
          {tagsForBlog(blog).map((tag) => (
            <Link key={`${blog.Blog_ID}-${tag}`} href={tagPath(tag)} className="tag tag-link">
              {tag}
            </Link>
          ))}
        </div>
        <MarkdownArticle blocks={blocks} slug={slug} />
      </article>
      {showAffiliateDisclosure ? <AffiliateDisclosure /> : null}
      <AdSlot enabled={blog.Ad_Enabled} slotId={`blog-${blog.Blog_ID}`} />
    </SiteShell>
  );
}
