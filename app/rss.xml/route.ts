import { excerptFromMarkdown } from "../../lib/content-render";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "../../lib/seo";
import { readPublishedBlogs } from "../../lib/site-data";

export const dynamic = "force-dynamic";

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rssDate(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toUTCString();
}

export async function GET() {
  const blogs = await readPublishedBlogs();
  const items = [...blogs]
    .sort((left, right) => {
      const leftTime = new Date(left.Published_At).getTime();
      const rightTime = new Date(right.Published_At).getTime();
      return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0) || left.Blog_ID.localeCompare(right.Blog_ID);
    })
    .map((blog) => {
      const link = absoluteUrl(`/blog/${blog.Slug}`);
      const publishedAt = rssDate(blog.Published_At);
      return [
        "<item>",
        `<title>${xmlEscape(blog.Title)}</title>`,
        `<link>${xmlEscape(link)}</link>`,
        `<guid isPermaLink="false">${xmlEscape(blog.Blog_ID)}</guid>`,
        `<description>${xmlEscape(blog.editorial.excerpt || excerptFromMarkdown(blog.Draft_Markdown, 220))}</description>`,
        publishedAt ? `<pubDate>${publishedAt}</pubDate>` : "",
        "</item>"
      ].join("");
    })
    .join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${xmlEscape(SITE_NAME)}</title>`,
    `<link>${xmlEscape(absoluteUrl("/"))}</link>`,
    `<atom:link href="${xmlEscape(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />`,
    `<description>${xmlEscape(SITE_DESCRIPTION)}</description>`,
    `<language>en-us</language>`,
    items,
    "</channel>",
    "</rss>"
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
