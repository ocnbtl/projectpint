import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import nextConfig from "../next.config.ts";
import { DEFAULT_EDITORIAL_METADATA } from "../lib/editorial-content.ts";
import { normalizeImageSource } from "../lib/image-source.ts";
import { pageMetadata, PRODUCTION_SITE_ORIGIN, resolveSiteOrigin } from "../lib/seo.ts";
import { publishedBlogs, publishedGuides, type PublicGuideItem } from "../lib/site-data.ts";
import type { BlogDraft } from "../lib/types.ts";

function blog(status: BlogDraft["Status"], id: string): BlogDraft {
  return {
    Blog_ID: id,
    Slug: id.toLowerCase(),
    Title: id,
    Pillar: "BudgetDIY",
    Keyword_Target: "bathroom",
    Outline: "",
    Draft_Markdown: `# ${id}`,
    Internal_Links: "",
    CTA_Block: "",
    Status: status,
    Human_Approved: status !== "draft",
    Published_At: "",
    Ad_Enabled: false,
    Contains_Affiliate_Links: false,
    Affiliate_Disclosure_Required: false
  };
}

function guide(status: string, id: string): PublicGuideItem {
  return {
    Guide_ID: id,
    slug: id.toLowerCase(),
    title: id,
    summary: "",
    area: "DIY",
    content: `# ${id}`,
    keywords: [],
    tags: [],
    relatedBlogId: "",
    status,
    publishedAt: "",
    editorial: DEFAULT_EDITORIAL_METADATA
  };
}

test("public editorial selectors never fall back to draft or approved rows", () => {
  assert.deepEqual(
    publishedBlogs([blog("draft", "DRAFT"), blog("approved", "APPROVED"), blog("published", "PUBLISHED")]).map(
      (row) => row.Blog_ID
    ),
    ["PUBLISHED"]
  );
  assert.deepEqual(
    publishedGuides([guide("draft", "DRAFT"), guide(" APPROVED ", "APPROVED"), guide(" Published ", "PUBLISHED")]).map(
      (row) => row.Guide_ID
    ),
    ["PUBLISHED"]
  );
});

test("SEO metadata uses the verified production alias and can explicitly disable indexing", () => {
  assert.equal(resolveSiteOrigin(undefined), PRODUCTION_SITE_ORIGIN);
  assert.equal(resolveSiteOrigin("not a url"), PRODUCTION_SITE_ORIGIN);
  assert.equal(resolveSiteOrigin("http://localhost:3000"), PRODUCTION_SITE_ORIGIN);
  assert.equal(resolveSiteOrigin("https://projectpint.example.com"), PRODUCTION_SITE_ORIGIN);
  assert.equal(resolveSiteOrigin("https://diyesu.com"), PRODUCTION_SITE_ORIGIN);
  assert.equal(resolveSiteOrigin(PRODUCTION_SITE_ORIGIN), PRODUCTION_SITE_ORIGIN);

  const metadata = pageMetadata({
    title: "Private preview",
    description: "Not indexable",
    path: "/preview",
    indexable: false
  });
  assert.equal(metadata.alternates?.canonical, `${PRODUCTION_SITE_ORIGIN}/preview`);
  assert.deepEqual(metadata.robots, { index: false, follow: false });
  const twitter = metadata.twitter as { card?: string; images?: unknown } | undefined;
  assert.equal(twitter?.card, "summary_large_image");
  assert.ok(Array.isArray(metadata.openGraph?.images));
  assert.ok(Array.isArray(twitter?.images));
});

test("public motion and responsive controls keep accessible semantics and stable pressed geometry", () => {
  const homeSource = fs.readFileSync(path.join(process.cwd(), "app", "page.tsx"), "utf8");
  const plantPickerSource = fs.readFileSync(path.join(process.cwd(), "components", "PlantPickerTool.tsx"), "utf8");
  const typewriterSource = fs.readFileSync(path.join(process.cwd(), "components", "TypewriterEyebrow.tsx"), "utf8");
  const cssSource = fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");

  assert.doesNotMatch(homeSource, /<p\s+aria-label=/);
  assert.match(homeSource, /screen-reader-text/);
  assert.doesNotMatch(typewriterSource, /typewriter-text"\s+aria-label=/);
  assert.match(typewriterSource, /screen-reader-text/);
  assert.match(plantPickerSource, /unlockButtonRef\.current\?\.isConnected/);
  assert.match(cssSource, /\.btn:active:not\(:disabled\)/);
  assert.match(cssSource, /\.plant-lock-button:active[\s\S]*translate\(-50%, -50%\) scale\(0\.99\)/);
  assert.match(cssSource, /\.plant-match-card\.is-locked\s*\{[\s\S]*filter:\s*blur\(4px\);/);
});

test("final public polish keeps the supplied brand, requested icons, and responsive layout contracts", () => {
  const homeSource = fs.readFileSync(path.join(process.cwd(), "app", "page.tsx"), "utf8");
  const startSource = fs.readFileSync(path.join(process.cwd(), "app", "start-here", "page.tsx"), "utf8");
  const areaIconSource = fs.readFileSync(path.join(process.cwd(), "components", "AreaIcon.tsx"), "utf8");
  const brandSource = fs.readFileSync(path.join(process.cwd(), "components", "BrandMarks.tsx"), "utf8");
  const shellSource = fs.readFileSync(path.join(process.cwd(), "components", "SiteShell.tsx"), "utf8");
  const markSource = fs.readFileSync(path.join(process.cwd(), "public", "brand", "diyesu-mark.svg"), "utf8");
  const iconSource = fs.readFileSync(path.join(process.cwd(), "app", "icon.svg"), "utf8");
  const cssSource = fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");

  assert.match(homeSource, /home-inspo-group/);
  assert.match(homeSource, /actually thrive, with placement tips included/);
  assert.match(startSource, /rect x="3" y="4" width="18" height="16"/);
  assert.match(startSource, /m13\.5 3\.5 7 7/);
  assert.match(areaIconSource, /m13\.5 3\.5 7 7/);
  assert.match(brandSource, /M5 19c9\.5 0 14-5\.6 14-14/);
  assert.match(shellSource, /href="\/admin\/login">Admin/);
  assert.match(markSource, /#eac530/);
  assert.match(markSource, /#3f704e/);
  assert.match(iconSource, /id="favicon-rounded-corners"/);
  assert.match(iconSource, /rx="150"/);
  assert.match(cssSource, /\.inspiration-style-preview img\s*\{[\s\S]*height:\s*auto/);
  assert.match(cssSource, /\.inspiration-detail-copy p\s*\{[\s\S]*white-space:\s*nowrap/);
  assert.match(cssSource, /\.area-overview-card:nth-last-child\(2\):nth-child\(3n \+ 1\)/);
  assert.match(cssSource, /about-style-rainbow/);
});

test("editorial images only use the optimizer when they match its exact remote pattern", () => {
  assert.equal(normalizeImageSource("https://images.unsplash.com/photo-123?fit=crop").optimize, true);
  assert.equal(normalizeImageSource("https://images.unsplash.com/custom/file.jpg").optimize, false);
  assert.equal(normalizeImageSource("https://images.unsplash.com:444/photo-123").optimize, false);
  assert.equal(normalizeImageSource("https://cdn.example.com/editorial.jpg").optimize, false);
  assert.deepEqual(normalizeImageSource("http://example.com/unsafe.jpg"), {
    src: "/brand/diyesu-mark.svg",
    optimize: true
  });
});

test("legacy public URLs permanently redirect to canonical routes", async () => {
  assert.equal(typeof nextConfig.redirects, "function");
  const redirects = await (nextConfig.redirects as () => Promise<Array<{ source: string; destination: string; permanent: boolean }>>)();
  const bySource = new Map(redirects.map((redirect) => [redirect.source, redirect]));

  assert.deepEqual(bySource.get("/hub"), { source: "/hub", destination: "/areas", permanent: true });
  assert.deepEqual(bySource.get("/lead-magnets/plant-picker"), {
    source: "/lead-magnets/plant-picker",
    destination: "/plant-picker",
    permanent: true
  });
  assert.deepEqual(bySource.get("/privacy"), { source: "/privacy", destination: "/legal/privacy", permanent: true });
});

test("the generated review pack is no longer a public static asset", () => {
  const publicPack = path.join(process.cwd(), "public", "review_pack.html");
  const routeSource = fs.readFileSync(path.join(process.cwd(), "app", "api", "admin", "review-pack", "route.ts"), "utf8");
  const commandSource = fs.readFileSync(path.join(process.cwd(), "lib", "commands.ts"), "utf8");

  assert.equal(fs.existsSync(publicPack), false);
  assert.match(routeSource, /isAdminSessionValid/);
  assert.match(routeSource, /private, no-store/);
  assert.doesNotMatch(commandSource, /path\.join\(process\.cwd\(\), "public", "review_pack\.html"\)/);
});

test("RSS and metadata routes are wired to published-only content and the canonical origin", () => {
  const rssSource = fs.readFileSync(path.join(process.cwd(), "app", "rss.xml", "route.ts"), "utf8");
  const sitemapSource = fs.readFileSync(path.join(process.cwd(), "app", "sitemap.ts"), "utf8");
  const robotsSource = fs.readFileSync(path.join(process.cwd(), "app", "robots.ts"), "utf8");
  const microSource = fs.readFileSync(path.join(process.cwd(), "app", "micro", "[slug]", "page.tsx"), "utf8");

  assert.match(rssSource, /readPublishedBlogs/);
  assert.doesNotMatch(rssSource, /projectpint\.example\.com/);
  assert.match(sitemapSource, /readPublishedBlogs/);
  assert.match(sitemapSource, /readPublishedGuides/);
  assert.match(robotsSource, /\/admin/);
  assert.match(robotsSource, /sitemap\.xml/);
  assert.match(sitemapSource, /auto-generated-/);
  assert.match(microSource, /UNAPPROVED_MICRO_PREFIX/);
});
