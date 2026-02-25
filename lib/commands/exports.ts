import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { toCsv, writeText } from "../io.ts";
import { loadTab } from "../store.ts";
import type { PinDraft } from "../types.ts";

interface ExportPaths {
  outputWeekly: string;
}

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writePinsExportCsv(maxPins = 200): void {
  const pins = loadTab<PinDraft>("Content_Pins").slice(0, maxPins);
  const rows = pins.map((pin) => ({
    Title: pin.Title,
    "Media URL": `https://drive.google.com/mock/${pin.Content_ID}.png`,
    "Pin URL": `https://projectpint.example.com${pin.UTM_URL}`,
    Description: pin.Description_With_Hashtags,
    Board: `Ranosa Decor ${pin.Pillar}`,
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
  const lines = pins
    .map(
      (p) =>
        `${p.Content_ID}\nTITLE: ${p.Title}\nOVERLAY_1: ${p.Overlay_1}\nOVERLAY_2: ${p.Overlay_2}\nDESCRIPTION: ${p.Description_With_Hashtags}\nCTA: ${p.Primary_CTA}\nURL: ${p.UTM_URL}\n`
    )
    .join("\n");
  writeText(path.join(packDir, "captions_and_links.txt"), lines);

  const src = [
    path.join(process.cwd(), "pins_export.csv"),
    path.join(process.cwd(), "weekly_ops_info.md"),
    path.join(process.cwd(), "weekly_review.md"),
    path.join(process.cwd(), "review_pack.html")
  ]
    .filter((p) => fs.existsSync(p))
    .map((p) => `"${path.relative(process.cwd(), p)}"`)
    .join(" ");

  try {
    execSync(`cd "${process.cwd()}" && zip -j -q "${packZip}" ${src} "${path.relative(process.cwd(), path.join(packDir, "captions_and_links.txt"))}"`);
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
