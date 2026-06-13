import { notFound } from "next/navigation";
import Link from "next/link";
import { AdSlot } from "../../../components/AdSlot";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { MarkdownArticle } from "../../../components/MarkdownArticle";
import { SiteShell } from "../../../components/SiteShell";
import { shouldShowAffiliateDisclosure } from "../../../lib/affiliate";
import { estimateReadTimeMinutes, markdownBlocks } from "../../../lib/content-render";
import { areaVisuals } from "../../../lib/redesign-data";
import { contentAreaForBlog, readBlogs, tagsForBlog } from "../../../lib/site-data";
import { tagPath } from "../../../lib/tags";

export const dynamic = "force-dynamic";

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
  const readTimeMinutes = estimateReadTimeMinutes(blog.Draft_Markdown);
  const titleBlock = blocks[0]?.type === "h1" ? blocks[0] : null;
  const contentBlocks = titleBlock ? blocks.slice(1) : blocks;
  const tags = tagsForBlog(blog);
  const image = areaVisuals[contentAreaForBlog(blog)].image;

  return (
    <SiteShell>
      <section className="article-hero" style={{ backgroundImage: `url(${image})` }}>
        <div className="article-hero-shade">
          <div className="container article-hero-copy">
            <Link href="/blog" className="back-link">
              Back to Blog
            </Link>
            <div className="tag-list article-tag-list">
              {tags.map((tag) => (
                <Link key={`${blog.Blog_ID}-${tag}`} href={tagPath(tag)} className="tag tag-link">
                  {tag}
                </Link>
              ))}
            </div>
            <h1>{titleBlock?.text ?? blog.Title}</h1>
            <p>{readTimeMinutes} min read</p>
          </div>
        </div>
      </section>
      <article className="prose-card article-body-card">
        <MarkdownArticle blocks={contentBlocks} slug={slug} />
      </article>
      {showAffiliateDisclosure ? <AffiliateDisclosure /> : null}
      <AdSlot enabled={blog.Ad_Enabled} slotId={`blog-${blog.Blog_ID}`} />
    </SiteShell>
  );
}
