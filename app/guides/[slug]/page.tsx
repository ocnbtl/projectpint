import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/SiteShell";
import { markdownBlocks } from "../../../lib/content-render";
import { findGuideBySlug, readGuides } from "../../../lib/site-data";

export async function generateStaticParams() {
  const guides = await readGuides();
  return guides.map((guide) => ({ slug: guide.slug }));
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await findGuideBySlug(slug);
  if (!guide) return notFound();

  const blocks = markdownBlocks(guide.content);

  return (
    <SiteShell>
      <article className="card prose-card">
        {blocks.map((block, index) => {
          if (block.type === "h1") return <h1 key={`${slug}-${index}`}>{block.text}</h1>;
          if (block.type === "h2") return <h2 key={`${slug}-${index}`}>{block.text}</h2>;
          if (block.type === "h3") return <h3 key={`${slug}-${index}`}>{block.text}</h3>;
          if (block.type === "ul") {
            return (
              <ul key={`${slug}-${index}`}>
                {block.items.map((item) => (
                  <li key={`${slug}-${index}-${item}`}>{item}</li>
                ))}
              </ul>
            );
          }
          if (block.type === "ol") {
            return (
              <ol key={`${slug}-${index}`}>
                {block.items.map((item) => (
                  <li key={`${slug}-${index}-${item}`}>{item}</li>
                ))}
              </ol>
            );
          }
          return <p key={`${slug}-${index}`}>{block.text}</p>;
        })}
      </article>
    </SiteShell>
  );
}
