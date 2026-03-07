import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { toCsv, writeText } from "../io.ts";
import { loadTab } from "../store.ts";
import type { BlogDraft, PinDraft } from "../types.ts";

interface AssetRow {
  Drive_URL: string;
  Local_Path: string;
  Linked_Content_ID: string;
}

interface ExportPaths {
  outputWeekly: string;
}

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function blogUrl(slug: string): string {
  return `/blog/${slug}`;
}

function firstPurposeSentence(markdown: string, fallback: string): string {
  const line = markdown
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item && !item.startsWith("#") && !item.startsWith("-"));
  return line ?? fallback;
}

export function writePinsExportCsv(maxPins = 200): void {
  const pins = loadTab<PinDraft>("Content_Pins").slice(0, maxPins);
  const assets = loadTab<AssetRow>("Assets");
  const mediaByPin = new Map(
    assets.map((asset) => [asset.Linked_Content_ID, asset.Drive_URL || asset.Local_Path || ""])
  );
  const rows = pins.map((pin) => ({
    Title: pin.Title,
    "Media URL": mediaByPin.get(pin.Content_ID) ?? "",
    "Pin URL": `https://projectpint.example.com${pin.UTM_URL}`,
    Description: pin.Description_With_Hashtags,
    Board: `Diyesu Decor ${pin.Pillar}`,
    "Publish date": pin.Scheduled_At || ""
  }));

  writeText(path.join(process.cwd(), "pins_export.csv"), toCsv(rows, ["Title", "Media URL", "Pin URL", "Description", "Board", "Publish date"]));
}

export function writeManualPackZip(paths: ExportPaths): void {
  ensureDir(paths.outputWeekly);
  const packDir = path.join(paths.outputWeekly, "manual_post_pack");
  ensureDir(packDir);
  const packZip = path.join(paths.outputWeekly, "manual_post_pack.zip");
  if (fs.existsSync(packZip)) fs.rmSync(packZip);

  const pins = loadTab<PinDraft>("Content_Pins");
  const blogs = loadTab<BlogDraft>("Blog_Posts");
  const assets = loadTab<AssetRow>("Assets");
  const blogByUrl = new Map(blogs.map((blog) => [blogUrl(blog.Slug), blog]));
  const blogByPillar = new Map<BlogDraft["Pillar"], BlogDraft>();
  for (const blog of blogs) {
    if (!blogByPillar.has(blog.Pillar)) blogByPillar.set(blog.Pillar, blog);
  }
  const defaultRelatedBlog = blogs[0];
  const mediaByPin = new Map(assets.map((asset) => [asset.Linked_Content_ID, asset.Drive_URL || asset.Local_Path || ""]));

  const resolveRelatedBlog = (pin: PinDraft, destination: string): BlogDraft | undefined =>
    blogByUrl.get(destination) ?? blogByPillar.get(pin.Pillar) ?? defaultRelatedBlog;

  const lines = pins
    .map(
      (p) => {
        const destination = p.Destination_URL || p.UTM_URL.split("?")[0];
        const blog = resolveRelatedBlog(p, destination);
        const purpose = blog ? firstPurposeSentence(blog.Draft_Markdown, `Practical guide for ${blog.Keyword_Target}.`) : "N/A";
        return `${p.Content_ID}
PIN_TITLE: ${p.Title}
DESTINATION_URL: ${destination}
RELATED_BLOG_URL: ${blog ? blogUrl(blog.Slug) : "N/A"}
RELATED_BLOG_TITLE: ${blog?.Title ?? "N/A"}
RELATED_BLOG_PURPOSE: ${purpose}
OVERLAY_TEXT_LINE_1: ${p.Overlay_1}
OVERLAY_TEXT_LINE_2: ${p.Overlay_2}
PIN_DESCRIPTION_COPY_PASTE: ${p.Description_With_Hashtags}
PIN_CTA: ${p.Primary_CTA}
NANO_BANANA_PROMPT_COPY_PASTE: ${p.Image_Prompt}
MEDIA_URL: ${mediaByPin.get(p.Content_ID) ?? ""}
UTM_URL: ${p.UTM_URL}
`;
      }
    )
    .join("\n");
  writeText(path.join(packDir, "captions_and_links.txt"), lines);

  const worksheetRows = pins.map((pin) => {
    const destination = pin.Destination_URL || pin.UTM_URL.split("?")[0];
    const blog = resolveRelatedBlog(pin, destination);
    return {
      Content_ID: pin.Content_ID,
      Destination_URL: destination,
      Related_Blog_URL: blog ? blogUrl(blog.Slug) : "",
      Related_Blog_Title: blog?.Title ?? "",
      Related_Blog_Keyword: blog?.Keyword_Target ?? "",
      Overlay_1: pin.Overlay_1,
      Overlay_2: pin.Overlay_2,
      Description_With_Hashtags: pin.Description_With_Hashtags,
      Primary_CTA: pin.Primary_CTA,
      Image_Prompt: pin.Image_Prompt,
      Media_URL: mediaByPin.get(pin.Content_ID) ?? "",
      UTM_URL: pin.UTM_URL
    };
  });
  writeText(
    path.join(packDir, "pin_copy_worksheet.csv"),
    toCsv(worksheetRows, [
      "Content_ID",
      "Destination_URL",
      "Related_Blog_URL",
      "Related_Blog_Title",
      "Related_Blog_Keyword",
      "Overlay_1",
      "Overlay_2",
      "Description_With_Hashtags",
      "Primary_CTA",
      "Image_Prompt",
      "Media_URL",
      "UTM_URL"
    ])
  );

  const blogPurposeRows = blogs.map((blog) => {
    const url = blogUrl(blog.Slug);
    const purpose = firstPurposeSentence(blog.Draft_Markdown, `Practical guide for ${blog.Keyword_Target}.`);
    const relatedPins = pins
      .filter((pin) => {
        const destination = pin.Destination_URL || pin.UTM_URL.split("?")[0];
        const related = resolveRelatedBlog(pin, destination);
        return related?.Slug === blog.Slug;
      })
      .map((pin) => pin.Content_ID)
      .join(", ");
    return {
      Blog_ID: blog.Blog_ID,
      Blog_Title: blog.Title,
      Blog_URL: url,
      Purpose: purpose,
      Keyword_Target: blog.Keyword_Target,
      Related_Pins: relatedPins || "none"
    };
  });
  writeText(
    path.join(packDir, "blog_purpose_map.csv"),
    toCsv(blogPurposeRows, ["Blog_ID", "Blog_Title", "Blog_URL", "Purpose", "Keyword_Target", "Related_Pins"])
  );

  const src = [
    path.join(process.cwd(), "pins_export.csv"),
    path.join(process.cwd(), "weekly_ops_info.md"),
    path.join(process.cwd(), "weekly_review.md"),
    path.join(process.cwd(), "review_pack.html")
  ]
    .filter((p) => fs.existsSync(p))
    .map((p) => `"${path.relative(process.cwd(), p)}"`)
    .join(" ");

  const packFiles = [
    path.join(packDir, "captions_and_links.txt"),
    path.join(packDir, "pin_copy_worksheet.csv"),
    path.join(packDir, "blog_purpose_map.csv")
  ]
    .map((p) => `"${path.relative(process.cwd(), p)}"`)
    .join(" ");

  try {
    execSync(`cd "${process.cwd()}" && zip -j -q "${packZip}" ${src} ${packFiles}`);
  } catch {
    writeText(path.join(paths.outputWeekly, "manual_post_pack.zip.README.txt"), "zip command unavailable; manual pack files are in outputs/weekly/manual_post_pack/");
  }
}

export function writeOverlayRenderJobBook(paths: ExportPaths): void {
  ensureDir(paths.outputWeekly);
  const pins = loadTab<PinDraft>("Content_Pins");
  const lines: string[] = [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "",
    "# Requires ImageMagick (`magick`) installed.",
    "# Input images should be available in ./assets/raw/<Content_ID>.png",
    "# Output images are written to ./assets/final/<Content_ID>.png",
    ""
  ];

  for (const pin of pins) {
    const safeOverlay1 = pin.Overlay_1.replace(/\"/g, '\\\"');
    const safeOverlay2 = pin.Overlay_2.replace(/\"/g, '\\\"');
    lines.push(
      `magick "assets/raw/${pin.Content_ID}.png" -gravity North -fill "#FFFFFF" -stroke "#00000099" -strokewidth 2 -pointsize 72 -annotate +0+120 "${safeOverlay1}" -gravity South -fill "#F8FAFC" -stroke "#00000099" -strokewidth 2 -pointsize 56 -annotate +0+140 "${safeOverlay2}" "assets/final/${pin.Content_ID}.png"`
    );
  }

  const script = lines.join("\n") + "\n";
  writeText(path.join(paths.outputWeekly, "overlay_render_jobs.sh"), script);
  writeText(path.join(process.cwd(), "overlay_render_jobs.sh"), script);
}

export function writeWeeklyZip(paths: ExportPaths): void {
  ensureDir(paths.outputWeekly);
  const opsZip = path.join(paths.outputWeekly, "weekly_ops_info.zip");
  if (fs.existsSync(opsZip)) fs.rmSync(opsZip);

  const blogFiles = fs
    .readdirSync(path.join(process.cwd(), "blog_drafts"), { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith(".md"))
    .map((f) => path.join(process.cwd(), "blog_drafts", f.name));

  const packetFiles = fs
    .readdirSync(path.join(process.cwd(), "content_packets"), { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith(".json"))
    .slice(0, 25)
    .map((f) => path.join(process.cwd(), "content_packets", f.name));

  const files = [
    path.join(process.cwd(), "weekly_ops_info.md"),
    path.join(process.cwd(), "weekly_review.md"),
    path.join(process.cwd(), "review_pack.html"),
    path.join(process.cwd(), "pins_export.csv"),
    path.join(paths.outputWeekly, "winners.md"),
    path.join(paths.outputWeekly, "qa_copy.json"),
    path.join(paths.outputWeekly, "qa_visual.json"),
    path.join(paths.outputWeekly, "qa_icp_alignment.json"),
    path.join(process.cwd(), "monthly_review.md"),
    path.join(process.cwd(), "yearly_review.md"),
    path.join(process.cwd(), "micro_guides"),
    ...blogFiles,
    ...packetFiles
  ]
    .filter((f) => fs.existsSync(f))
    .map((f) => `"${path.relative(process.cwd(), f)}"`)
    .join(" ");

  try {
    execSync(`cd "${process.cwd()}" && zip -r -q "${opsZip}" ${files}`);
    fs.copyFileSync(opsZip, path.join(process.cwd(), "weekly_ops_info.zip"));
    fs.copyFileSync(opsZip, path.join(process.cwd(), "weekly_operating_packet.zip"));
    fs.copyFileSync(opsZip, path.join(paths.outputWeekly, "weekly_operating_packet.zip"));
  } catch {
    writeText(path.join(paths.outputWeekly, "weekly_ops_info.zip.README.txt"), "zip command unavailable; packet files remain as plain outputs.");
  }
}
