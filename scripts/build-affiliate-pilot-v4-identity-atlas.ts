import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import {
  countAffiliatePilotV4VisibleChromaPixels,
  type AffiliatePilotV4ChromaKey
} from "../lib/affiliate-pilot-v4-chroma.ts";

const require = createRequire(import.meta.url);
const sharp = require("sharp") as any;

const args = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const [key, ...rest] = argument.replace(/^--/, "").split("=");
    return [key, rest.join("=")];
  })
);
const asin = args.asin;
const audit = args.audit;
if (!asin || !audit?.trim()) {
  throw new Error("Usage: --asin=<ASIN> --audit=<full-size cross-view review>");
}

const views = ["presentation", "front", "back", "left", "right", "top", "bottom"];
const repositoryRoot = process.cwd();
const outputRoot = path.join(repositoryRoot, "output");
const manifestPath = path.join(outputRoot, "affiliate-pilot", "v4", "manifest.json");
const ledgerPath = path.join(outputRoot, "affiliate-pilot", "v4", "execution-log.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, "")) as {
  jobs: Array<Record<string, unknown>>;
};
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8").replace(/^\uFEFF/, "")) as Record<string, unknown> & {
  identityGeneration: Record<string, unknown> & {
    calls: Array<Record<string, unknown>>;
    postprocessingRevisions?: Array<Record<string, unknown>>;
  };
  events: Array<Record<string, unknown>>;
};
const jobs = manifest.jobs.filter((job) => job.kind === "identity" && job.asin === asin);
if (jobs.length !== 7) throw new Error(`Expected seven identity jobs for ${asin}; received ${jobs.length}.`);
const jobByView = new Map(jobs.map((job) => [String(job.identityView), job]));
const files: Array<{
  view: string;
  path: string;
  sha256: string;
  transparentPixels: number;
  width: number;
  height: number;
}> = [];

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

for (const view of views) {
  const job = jobByView.get(view);
  if (!job) throw new Error(`${asin} is missing ${view}.`);
  const passedCalls = ledger.identityGeneration.calls.filter(
    (call) => call.jobId === job.id && call.decision === "assistant_pass"
  );
  if (passedCalls.length !== 1) {
    throw new Error(`${asin} ${view} requires exactly one passed call; received ${passedCalls.length}.`);
  }
  const filePath = path.join(outputRoot, String(job.storageKey));
  if (!fs.existsSync(filePath)) throw new Error(`Missing transparent identity: ${filePath}`);
  const metadata = await sharp(filePath).metadata();
  if (metadata.width !== 1024 || metadata.height !== 1536 || !metadata.hasAlpha) {
    throw new Error(`${asin} ${view} must be a 1024x1536 alpha PNG.`);
  }
  const { data } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparentPixels = 0;
  for (let offset = 3; offset < data.length; offset += 4) {
    if (data[offset] === 0) transparentPixels += 1;
  }
  if (transparentPixels < 1024 * 1536 * 0.25) {
    throw new Error(`${asin} ${view} does not contain enough transparent background.`);
  }
  const visibleChromaPixels = countAffiliatePilotV4VisibleChromaPixels(
    data,
    String(job.chromaKeyHex) as AffiliatePilotV4ChromaKey
  );
  if (visibleChromaPixels !== 0) {
    throw new Error(`${asin} ${view} retains ${visibleChromaPixels} visible chroma pixels.`);
  }
  const observedHash = sha256File(filePath);
  const latestRevision = (ledger.identityGeneration.postprocessingRevisions ?? [])
    .filter((revision) => revision.jobId === job.id)
    .at(-1);
  const expectedHash = latestRevision?.outputSha256 ?? passedCalls[0].transparentOutputSha256;
  if (observedHash !== expectedHash) {
    throw new Error(`${asin} ${view} hash no longer matches its passed ledger call.`);
  }
  files.push({
    view,
    path: filePath,
    sha256: observedHash,
    transparentPixels,
    width: metadata.width,
    height: metadata.height
  });
}
if (new Set(files.map((file) => file.sha256)).size !== files.length) {
  throw new Error(`${asin} identity outputs contain duplicate hashes.`);
}

const tileWidth = 512;
const tileHeight = 768;
const imageHeight = 704;
const composites: Array<{ input: Buffer; left: number; top: number }> = [];
for (const [index, file] of files.entries()) {
  const image = await sharp(file.path)
    .resize({ width: tileWidth - 32, height: imageHeight - 24, fit: "contain" })
    .flatten({ background: "#f4f1eb" })
    .extend({ top: 12, bottom: 12, left: 16, right: 16, background: "#f4f1eb" })
    .resize({ width: tileWidth, height: imageHeight, fit: "contain", background: "#f4f1eb" })
    .png()
    .toBuffer();
  const label = Buffer.from(
    `<svg width="${tileWidth}" height="${tileHeight - imageHeight}">
      <rect width="100%" height="100%" fill="#171717"/>
      <text x="16" y="27" fill="#ffffff" font-family="Arial" font-size="22">${index + 1}. ${file.view}</text>
      <text x="16" y="51" fill="#bdbdbd" font-family="Arial" font-size="15">${file.sha256.slice(0, 16)}</text>
    </svg>`
  );
  const left = (index % 3) * tileWidth;
  const top = Math.floor(index / 3) * tileHeight;
  composites.push({ input: image, left, top });
  composites.push({ input: label, left, top: top + imageHeight });
}

const atlasJob = jobs[0];
const atlasPath = path.join(outputRoot, String(atlasJob.atlasStorageKey));
if (fs.existsSync(atlasPath)) throw new Error(`Refusing to overwrite identity atlas: ${atlasPath}`);
fs.mkdirSync(path.dirname(atlasPath), { recursive: true });
await sharp({
  create: {
    width: tileWidth * 3,
    height: tileHeight * 3,
    channels: 3,
    background: "#d8d3ca"
  }
})
  .composite(composites)
  .png()
  .toFile(atlasPath);

const occurredAt = new Date().toISOString();
const review = {
  asin,
  occurredAt,
  decision: "assistant_pass",
  audit,
  atlasPath: path.relative(repositoryRoot, atlasPath).replace(/\\/g, "/"),
  atlasSha256: sha256File(atlasPath),
  files: files.map((file) => ({
    view: file.view,
    path: path.relative(repositoryRoot, file.path).replace(/\\/g, "/"),
    sha256: file.sha256,
    dimensions: { width: file.width, height: file.height },
    transparentPixels: file.transparentPixels
  })),
  uniqueHashCount: new Set(files.map((file) => file.sha256)).size,
  expectedViewCount: 7
};
const reviewRoot = path.join(
  outputRoot,
  "affiliate-pilot",
  "v4",
  "private-evidence",
  "identity-generation",
  asin
);
const reviewPath = path.join(reviewRoot, "identity-pack-review.json");
if (fs.existsSync(reviewPath)) throw new Error(`Refusing to overwrite identity review: ${reviewPath}`);
fs.writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");

const packs = Array.isArray(ledger.identityGeneration.packs)
  ? (ledger.identityGeneration.packs as Array<Record<string, unknown>>)
  : [];
if (packs.some((pack) => pack.asin === asin)) {
  throw new Error(`Execution ledger already contains an identity pack for ${asin}.`);
}
packs.push(review);
ledger.identityGeneration.packs = packs;
ledger.identityGeneration.reviewedPackCount = packs.length;
ledger.updatedAt = occurredAt;
ledger.events.push({
  type: "identity_pack_reviewed",
  occurredAt,
  status: "assistant_pass",
  asin,
  atlasSha256: review.atlasSha256
});
fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
process.stdout.write(
  `${asin}: seven-view atlas ${review.atlasSha256}, 7/7 unique 1024x1536 alpha outputs, assistant_pass.\n`
);
