import { readdir, readFile } from "fs/promises";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import path from "path";
import { MarkdownArticle } from "../../../components/MarkdownArticle";
import { SiteShell } from "../../../components/SiteShell";
import { contentAreaLabel, contentAreaSlug } from "../../../lib/constants";
import { estimateReadTimeMinutes, excerptFromMarkdown, markdownBlocks, titleFromSlug } from "../../../lib/content-render";
import { areaVisuals } from "../../../lib/redesign-data";
import { hubs } from "../../../lib/site-data";
import { tagPath } from "../../../lib/tags";
import type { ContentArea } from "../../../lib/types";

const MICRO_GUIDES_DIR = path.join(process.cwd(), "micro_guides");

async function readMicroGuide(slug: string): Promise<string | null> {
  try {
    return await readFile(path.join(MICRO_GUIDES_DIR, `${slug}.md`), "utf8");
  } catch {
    return null;
  }
}

function inferMicroArea(slug: string, markdown: string): ContentArea {
  const haystack = `${slug} ${markdown}`.toLowerCase();
  let bestArea: ContentArea = "DIY";
  let bestScore = 0;

  for (const hub of hubs) {
    const score = hub.keywordHints.reduce((total, token) => total + Number(haystack.includes(token.toLowerCase())), 0);
    if (score > bestScore) {
      bestScore = score;
      bestArea = hub.area;
    }
  }

  return bestArea;
}

export async function generateStaticParams() {
  try {
    const files = await readdir(MICRO_GUIDES_DIR);
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => ({
        slug: file.replace(/\.md$/, "")
      }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const markdown = await readMicroGuide(slug);
  if (!markdown) return {};

  const blocks = markdownBlocks(markdown);
  const titleBlock = blocks[0]?.type === "h1" ? blocks[0] : null;
  const title = titleBlock?.text ?? titleFromSlug(slug);
  return {
    title,
    description: excerptFromMarkdown(markdown, 155)
  };
}

export default async function MicroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const markdown = await readMicroGuide(slug);
  if (!markdown) return notFound();

  const blocks = markdownBlocks(markdown);
  const titleBlock = blocks[0]?.type === "h1" ? blocks[0] : null;
  const contentBlocks = titleBlock ? blocks.slice(1) : blocks;
  const title = titleBlock?.text ?? titleFromSlug(slug);
  const area = inferMicroArea(slug, markdown);
  const areaLabel = contentAreaLabel(area);
  const readTimeMinutes = estimateReadTimeMinutes(markdown);
  const visual = areaVisuals[area];
  const tags = [areaLabel, "Mini Guide"];

  return (
    <SiteShell>
      <section className="article-detail-hero article-detail-photo-hero" style={{ backgroundImage: `url(${visual.image})` }}>
        <div className="container article-detail-hero-inner">
          <div className="article-detail-copy">
            <Link href="/start-here" className="back-link">
              Back to Start Here
            </Link>
            <p className="article-detail-kicker">Bathroom Mini Guide</p>
            <div className="tag-list article-tag-list">
              {tags.map((tag) => (
                <Link key={`${slug}-${tag}`} href={tagPath(tag)} className="tag tag-link">
                  {tag}
                </Link>
              ))}
            </div>
            <h1>{title}</h1>
            <span className="article-readtime-callout">
              <span className="article-readtime-kicker">Reading time</span>
              <strong>{readTimeMinutes} min read</strong>
            </span>
          </div>
        </div>
      </section>

      <article className="article-body-card">
        <MarkdownArticle blocks={contentBlocks} slug={slug} />
      </article>

      <section className="article-next-section">
        <div className="article-blueprint-cta">
          <div>
            <h2>Turn this into a full bathroom plan</h2>
            <p>Use the Blueprint to adapt this mini guide to your budget, rental rules, room size, and upgrade timeline.</p>
          </div>
          <Link href="/blueprint" className="btn btn-accent">
            Build My Blueprint
          </Link>
        </div>
        <div className="article-related-block">
          <div className="article-related-head">
            <p className="areas-kicker">Explore Next</p>
            <h2>More practical bathroom help</h2>
          </div>
          <div className="article-related-grid">
            <Link href={`/areas/${contentAreaSlug(area)}`} className="article-related-card">
              <span className="article-related-media">
                <img src={visual.image} alt="" />
              </span>
              <span className="article-related-copy">
                <strong>{areaLabel} ideas</strong>
                <span>{visual.tagline} with articles, guides, and realistic upgrade paths.</span>
              </span>
            </Link>
            <Link href="/lead-magnets/plant-picker" className="article-related-card">
              <span className="article-related-media">
                <img src={areaVisuals.Plants.image} alt="" />
              </span>
              <span className="article-related-copy">
                <strong>Free Plant Picker</strong>
                <span>Answer a few bathroom questions and get plants that fit your light, humidity, and space.</span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
