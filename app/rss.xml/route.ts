import { readBlogs } from "../../lib/site-data";

export async function GET() {
  const blogs = readBlogs();
  const items = blogs
    .map(
      (b) => `<item><title>${b.Title}</title><link>https://projectpint.example.com/blog/${b.Slug}</link><guid>${b.Blog_ID}</guid></item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Ranosa Decor</title><link>https://projectpint.example.com</link><description>DIY Bathroom Upgrades</description>${items}</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml"
    }
  });
}
