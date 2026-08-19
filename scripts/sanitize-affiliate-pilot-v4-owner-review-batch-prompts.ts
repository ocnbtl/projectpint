import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type JsonRecord = Record<string, any>;

function argument(name: string): string {
  const prefix = `--${name}=`;
  const value = process.argv.slice(2).find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
  if (!value) throw new Error(`Missing --${name}=...`);
  return value;
}

function readJson(filePath: string): JsonRecord {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")) as JsonRecord;
}

function writeJsonAtomic(filePath: string, value: JsonRecord): void {
  const tempPath = `${filePath}.${process.pid}.reflection-sanitize.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function promptLine(prompt: string, prefix: string, fallback: string): string {
  return prompt.split("\n").find((line) => line.startsWith(prefix)) ?? fallback;
}

function compactBambusiPrompt(prompt: string): string {
  const sceneIdentity = promptLine(prompt, "Scene identity:", "Scene identity: owner-feedback retry.");
  const style = promptLine(prompt, "Style:", "Style: ordinary maintained residential bathroom.");
  const sceneDirection = promptLine(
    prompt,
    "Concrete scene direction:",
    "Concrete scene direction: a believable, modest residential bathroom with coherent fixtures and finishes."
  );
  const roomHistory = promptLine(
    prompt,
    "Room history and budget:",
    "Room history and budget: an incrementally updated real home bathroom, used since installation and not reset for a photograph."
  );
  const camera = promptLine(
    prompt,
    "Camera authenticity:",
    "Camera authenticity: an imperfect handheld phone snapshot with natural perspective, mixed bathroom light, fine shadow noise, and restrained dynamic range."
  );
  const everyday = promptLine(
    prompt,
    "Everyday evidence:",
    "Everyday evidence: sparse functional traces of ordinary use, kept away from both bench surfaces."
  );
  const material = promptLine(
    prompt,
    "Material emphasis:",
    "Material emphasis: ordinary ceramic, painted wood, tile, and textiles with nonrepeating wear."
  );

  return [
    "Use case: photorealistic-natural.",
    sceneIdentity,
    "Create one genuinely new, raw homeowner iPhone photo of an ordinary maintained bathroom. The room must look buildable, used, and naturally imperfect, never like a render, catalog set, luxury showroom, or staged social post.",
    "BINDING MANUFACTURER REFERENCE: copy the supplied Bambusi bench identity exactly. The reference is authoritative for silhouette, proportions, construction, bamboo color, and every countable part; it is not loose inspiration.",
    "Corrective reference pack: use the supplied exact Bambusi manufacturer image and validated product dossier as the binding identity source; do not use a generated reference atlas.",
    "HIGHEST-PRIORITY COUNT GATE: the top contains EXACTLY 8 separate narrow front-to-back bamboo slat boards with EXACTLY 7 open gaps. The lower shelf also contains EXACTLY 8 separate narrow front-to-back bamboo slat boards with EXACTLY 7 open gaps. The rounded perimeter rails are frames and are not slats. Silently count 1-2-3-4-5-6-7-8 on each surface before returning the image. If either surface is not exactly eight, discard and regenerate.",
    "Exact product geometry: one compact natural-bamboo Bambusi shower bench about 17 inches wide, 9 inches deep, and 17 inches high; rectangular eight-slat top; subtly bowed front apron; four separate straight slightly splayed legs; four small dark non-slip feet; open sides; one eight-slat lower shelf. No ninth slat, merged board, wide center slab, extra brace, curved leg, warped shelf, missing foot, duplicate bench, or logo-like mark.",
    "Product visibility: use a close three-quarter view that leaves the entire top and entire lower shelf bare, unobstructed, and easy to count. Keep all four feet supported on one level bathroom floor with realistic clearance and contact shadows. Do not place any towel, bottle, garment, basket, or other object on either slatted surface.",
    style,
    sceneDirection,
    roomHistory,
    camera,
    everyday,
    material,
    "Bathroom realism: use one coherent perspective, complete ordinary fixtures, plausible wet-zone junctions, natural phone exposure, surface variation, and nonrepeating bamboo grain that follows each separate board. The exact bench should be useful and incidental rather than hero-lit.",
    "Scene limits: exactly one featured bench; no people or hands; no wall mirror or reflective medicine cabinet; no duplicated fixtures; no plants, wall art, shelf display, candles, baskets, packaging, labels, pseudo-text, overlay, watermark, or coordinated decor kit. Keep all permitted everyday traces away from the bench.",
    "Owner-review semantics: assistant screening is provisional. The image is not owner-approved or publishable until the owner explicitly decides.",
    "Output: one image exactly 1024x1536 pixels in a 2:3 portrait frame."
  ].join("\n");
}

function compactHubbaPrompt(prompt: string): string {
  const sceneIdentity = promptLine(prompt, "Scene identity:", "Scene identity: owner-feedback retry.");
  const style = promptLine(prompt, "Style:", "Style: ordinary maintained residential bathroom.");
  const sceneDirection = promptLine(
    prompt,
    "Concrete scene direction:",
    "Concrete scene direction: a believable, modest residential bathroom with coherent fixtures and finishes."
  );
  const roomHistory = promptLine(
    prompt,
    "Room history and budget:",
    "Room history and budget: an incrementally updated real home bathroom, used since installation and not reset for a photograph."
  );
  const camera = promptLine(
    prompt,
    "Camera authenticity:",
    "Camera authenticity: an imperfect off-axis handheld phone snapshot with natural perspective, mixed bathroom light, fine shadow noise, and restrained dynamic range."
  );
  const everyday = promptLine(
    prompt,
    "Everyday evidence:",
    "Everyday evidence: sparse functional traces of ordinary use, kept visually secondary to the wall mirror."
  );
  const material = promptLine(
    prompt,
    "Material emphasis:",
    "Material emphasis: ordinary ceramic, painted wood, tile, and textiles with nonrepeating wear."
  );

  return [
    "Use case: photorealistic-natural.",
    sceneIdentity,
    "Create one genuinely new, raw homeowner iPhone photo of an ordinary maintained bathroom. The room must look buildable, used, and naturally imperfect, never like a render, catalog set, luxury showroom, or staged social post.",
    "BINDING MANUFACTURER REFERENCE: copy the supplied Umbra Hubba mirror identity exactly. The reference is authoritative for silhouette, proportions, shallow wall depth, brass color, and rim thickness; it is not loose inspiration.",
    "Corrective reference pack: use the supplied exact Umbra Hubba manufacturer image and validated product dossier as the binding identity source; do not use a generated substitute.",
    "HIGHEST-PRIORITY PRODUCT GATE: show exactly one Hubba arched wall mirror, approximately 34.25 inches wide by 36.25 inches high and 1.13 inches deep in world space. It has one smooth rounded arch across the top, straight side segments, softly rounded lower corners, one straight flat bottom, one large uninterrupted mirror pane, and one very thin continuous metallic-brass rim.",
    "OWNER-EVIDENCE PROPORTION GATE: prior owner-approved Hubba scenes used a natural vertical arch seen from a modest off-axis phone position, while a wider-looking mirror was denied. Preserve the documented object dimensions in the room, but allow honest perspective foreshortening so the projected mirror reads like the accepted vertical arches. Never render it squat, stretched wide, circular, or landscape-oriented.",
    "Forbidden mirror mutations: no tall narrow doorway shape, round mirror, semicircle with no straight sides, pill shape, pointed top, crest, bevel, shelf, hooks, segmented panes, ornate molding, thick gold frame, backlight, black rim, alternate finish, second mirror, reflected mirror, or medicine-cabinet seams.",
    "Mounting and scale: mount the complete mirror flat and level above one usable simple vanity with credible clearance, shallow contact shadow, and a believable 34-inch scale. Keep the whole perimeter visible and do not crop the arch or flat bottom. Use a modest off-axis phone view rather than a flattened front elevation.",
    "Reflection physics gate: the pane reflects only a sparse, ray-consistent view of one plain opposing wall and soft window light. Keep one exposure and perspective. Show no camera, person, phantom doorway, shower, toilet, second mirror, duplicate faucet, doubled light, drifting fixture, unexplained object, or texture discontinuity inside the reflection.",
    style,
    sceneDirection,
    roomHistory,
    camera,
    everyday,
    material,
    "Bathroom realism: use one coherent perspective, complete ordinary fixtures, plausible wet-zone junctions, aligned electrically plausible lights, natural phone exposure, small surface variation, and nonrepeating material texture. The exact mirror should be useful and naturally installed rather than hero-lit.",
    "Scene limits: exactly one featured mirror and one vanity; no people or hands; no duplicate fixtures; no plants, wall art, shelf display, candles, baskets, packaging, labels, pseudo-text, overlay, watermark, or coordinated decor kit.",
    "Owner-review semantics: assistant screening is provisional. The image is not owner-approved or publishable until the owner explicitly decides.",
    "Output: one image exactly 1024x1536 pixels in a 2:3 portrait frame."
  ].join("\n");
}

function sanitize(asin: string, prompt: string): string {
  if (asin === "B08TLP2D54") return compactHubbaPrompt(prompt);
  if (asin === "B0DC7VG6Z9") return compactBambusiPrompt(prompt);
  return prompt
    .split("\n")
    .filter(
      (line) =>
        !(/^\d+\)/.test(line) && /\bmirror(?:s|ed|ing)?\b/i.test(line)) &&
        !(
          asin === "B0DC7VG6Z9" &&
          (line.startsWith("Product contract:") || line.startsWith("Countable-feature audit:"))
        )
    )
    .map((line) => {
      if (line.startsWith("Camera authenticity:") && /\bmirror/i.test(line)) {
        return "Camera authenticity: off-axis view chosen to keep door, window, fixture, and room geometry physically coherent; ordinary mixed bathroom light with fine shadow noise and limited phone dynamic range. Reproduce a default iPhone HEIC/JPEG look with modest computational sharpening and local auto-HDR, slight edge distortion, imperfect leveling, fine luminance and chroma noise in shadows, mixed white balance when lights differ, and at least one partially clipped highlight or blocked shadow; no RAW processing, Lightroom grade, flash balancing, tripod precision, portrait-mode blur, or architectural correction.";
      }
      if (line.startsWith("Everyday evidence:") && /\bmirror/i.test(line)) {
        return line.replace(/(?:one )?faint toothpaste spot low on the mirror/gi, "one faint toothpaste spot beside the faucet");
      }
      if (line.startsWith("Concrete scene direction:") && /\bmirror/i.test(line)) {
        return line
          .replace(/a mismatched vintage mirror/gi, "one plain painted wall surface")
          .replace(/an aged nickel mirror/gi, "one plain painted wall surface");
      }
      if (line.startsWith("Material emphasis:") && /\bmirror/i.test(line)) {
        return "Material emphasis: ceramic, wood, glass windows, and textiles with correct thickness, edges, occlusion, and nonrepeating wear.";
      }
      if (line.startsWith("Physical plausibility:")) {
        return "Physical plausibility: use buildable household construction, functional wet-zone junctions, ordinary fixture clearances, complete recognizable fixtures, coherent door and window geometry, and fully supported objects. Do not place reflective wall glass or a reflective medicine-cabinet panel in the room.";
      }
      if (line.startsWith("Single-object gate:")) {
        return "Single-object gate: render exactly one featured product. Do not clone, reflect-duplicate, merge, or mutate its parts. Do not add duplicate faucets, handles, spouts, outlets, switches, hooks, lights, dispensers, or accessory fragments.";
      }
      if (line.startsWith("Reflection gate:")) {
        return "Reflective-wall gate: this featured product is not a wall reflector. Show no wall-mounted reflective glass, reflective medicine-cabinet panel, or vanity reflector anywhere in the room.";
      }
      return line
        .replace(/mirror-polished/gi, "high-polished")
        .replace(/mirror its handedness/gi, "reverse its handedness")
        .replace(/omit mirrors/gi, "use no reflective wall glass")
        .replace(/\bmirrors?\b/gi, "reflective wall glass");
    })
    .join("\n");
}

const batchId = argument("batch-id");
const version = argument("prompt-version");
const repositoryRoot = process.cwd();
const v4Root = path.join(repositoryRoot, "output", "affiliate-pilot", "v4");
const manifestPath = path.join(v4Root, "manifest.json");
const ledgerPath = path.join(v4Root, "execution-log.json");
const batchPath = path.join(v4Root, "private-evidence", "owner-review-batches", batchId, "batch.json");
const manifest = readJson(manifestPath);
const ledger = readJson(ledgerPath);
const batch = readJson(batchPath);
const jobs = manifest.jobs as JsonRecord[];
let amended = 0;
let hubbaCompacted = 0;
let alreadySanitized = 0;
let decidedPreserved = 0;

for (const frozen of batch.jobs as JsonRecord[]) {
  const job = jobs.find((entry) => entry.id === frozen.jobId && entry.sceneId === frozen.sceneId);
  if (!job) throw new Error(`${frozen.sceneId} is missing from the manifest.`);
  if (job.status !== "queued" || job.decisionStatus !== "queued") {
    decidedPreserved += 1;
    continue;
  }
  const nextPrompt = sanitize(String(job.asin), String(job.prompt));
  if (job.asin === "B08TLP2D54" && nextPrompt !== job.prompt) hubbaCompacted += 1;
  else if (nextPrompt === job.prompt) alreadySanitized += 1;
  const nextHash = sha256(nextPrompt);
  Object.assign(job, { prompt: nextPrompt, promptSha256: nextHash, promptVersion: version });
  Object.assign(frozen, { exactPrompt: nextPrompt, promptSha256: nextHash, promptVersion: version });
  if (job.asin === "B08TLP2D54") {
    const generationReferences = ((job.generationReferences ?? []) as JsonRecord[]).filter((reference) =>
      String(reference.path).endsWith("/umbra-manufacturer-02.jpg")
    );
    if (generationReferences.length !== 1) {
      throw new Error(`Expected one Hubba manufacturer generation reference for ${job.sceneId}.`);
    }
    Object.assign(job, { generationReferences });
    Object.assign(frozen, { generationReferences });
  }
  amended += 1;
}

if (amended === 0) {
  throw new Error(`${batchId} has no queued owner-review jobs to sanitize; no state was changed.`);
}

const occurredAt = new Date().toISOString();
batch.promptVersion = version;
batch.status = "generation_queued_prompt_conflict_sanitized";
batch.amendments = [
  ...((batch.amendments ?? []) as JsonRecord[]),
  {
    occurredAt,
    type: "owner_review_prompt_conflict_sanitized_and_compacted",
    promptVersion: version,
    frozenJobCount: amended,
    hubbaJobCountCompacted: hubbaCompacted,
    alreadySanitizedJobCount: alreadySanitized,
    decidedJobCountPreserved: decidedPreserved,
    reason: "Collapse accumulated retry history and preserve focused owner-confirmed Bambusi count and Hubba reflection identity gates."
  }
];
manifest.status = "owner_feedback_wave_d_generation_queued_prompt_conflict_sanitized";
ledger.status = "owner_feedback_wave_d_generation_queued_prompt_conflict_sanitized";
ledger.updatedAt = occurredAt;
ledger.events.push({
  type: "owner_review_batch_prompt_conflict_sanitized_and_compacted",
  occurredAt,
  status: "generation_queued",
  batchId,
  promptVersion: version,
  frozenJobCount: amended,
  hubbaJobCountCompacted: hubbaCompacted,
  alreadySanitizedJobCount: alreadySanitized,
  decidedJobCountPreserved: decidedPreserved
});

writeJsonAtomic(manifestPath, manifest);
writeJsonAtomic(ledgerPath, ledger);
writeJsonAtomic(batchPath, batch);
process.stdout.write(
  `${batchId}: compacted ${hubbaCompacted} queued Hubba prompts, sanitized ${amended - hubbaCompacted - alreadySanitized} queued non-Hubba prompts, retained ${alreadySanitized} unchanged queued prompts and preserved ${decidedPreserved} decided jobs; version ${version}.\n`
);
