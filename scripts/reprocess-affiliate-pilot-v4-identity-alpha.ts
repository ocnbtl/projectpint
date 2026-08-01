import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import {
  AFFILIATE_PILOT_V4_CHROMA_ALGORITHM_VERSION,
  countAffiliatePilotV4VisibleChromaPixels,
  convertAffiliatePilotV4ChromaToAlpha,
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
const safeAreaView = args["safe-area-view"]?.trim() || null;
const safeAreaScale = Number(args["safe-area-scale"] ?? "0.88");
if (!asin || !audit?.trim()) {
  throw new Error(
    "Usage: --asin=<ASIN> --audit=<alpha defect and correction> [--safe-area-view=<view> --safe-area-scale=<0.5..1>]"
  );
}
if (safeAreaView && (!Number.isFinite(safeAreaScale) || safeAreaScale < 0.5 || safeAreaScale >= 1)) {
  throw new Error("--safe-area-scale must be at least 0.5 and less than 1.");
}

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
    packs?: Array<Record<string, unknown>>;
    supersededPacks?: Array<Record<string, unknown>>;
    postprocessingRevisions?: Array<Record<string, unknown>>;
  };
  events: Array<Record<string, unknown>>;
};
const jobs = manifest.jobs.filter((job) => job.kind === "identity" && job.asin === asin);
if (jobs.length !== 7) throw new Error(`Expected seven identity jobs for ${asin}.`);
if (safeAreaView && !jobs.some((job) => job.identityView === safeAreaView)) {
  throw new Error(`${asin} does not have identity view ${safeAreaView}.`);
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const revisions = ledger.identityGeneration.postprocessingRevisions ?? [];
const occurredAt = new Date().toISOString();
for (const job of jobs) {
  const passedCalls = ledger.identityGeneration.calls.filter(
    (call) => call.jobId === job.id && call.decision === "assistant_pass"
  );
  if (passedCalls.length !== 1) {
    throw new Error(`${String(job.id)} requires exactly one passed call.`);
  }
  if (revisions.some((revision) => revision.jobId === job.id)) {
    throw new Error(`${String(job.id)} already has an alpha postprocessing revision.`);
  }
  const call = passedCalls[0];
  const rawPath = path.join(repositoryRoot, String(call.evidencePath));
  const outputPath = path.join(outputRoot, String(job.storageKey));
  if (!fs.existsSync(rawPath) || !fs.existsSync(outputPath)) {
    throw new Error(`Missing raw evidence or transparent output for ${String(job.id)}.`);
  }
  const priorOutputSha256 = sha256File(outputPath);
  if (priorOutputSha256 !== call.transparentOutputSha256) {
    throw new Error(`${String(job.id)} prior output hash does not match its passed call.`);
  }
  let sourcePipeline = sharp(rawPath);
  const metadata = await sourcePipeline.metadata();
  if (metadata.width !== 1024 || metadata.height !== 1536) {
    sourcePipeline = sourcePipeline.resize(1024, 1536, { fit: "fill" });
  }
  const { data, info } = await sourcePipeline
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const chromaKeyHex = String(job.chromaKeyHex) as AffiliatePilotV4ChromaKey;
  convertAffiliatePilotV4ChromaToAlpha(
    data,
    info.width,
    info.height,
    chromaKeyHex
  );
  const view = String(job.identityView);
  let outputPipeline = sharp(data, { raw: info });
  let safeAreaNormalization: Record<string, unknown> | null = null;
  if (view === safeAreaView) {
    const resizedWidth = Math.round(info.width * safeAreaScale);
    const resizedHeight = Math.round(info.height * safeAreaScale);
    const left = Math.floor((info.width - resizedWidth) / 2);
    const right = info.width - resizedWidth - left;
    const top = Math.floor((info.height - resizedHeight) / 2);
    const bottom = info.height - resizedHeight - top;
    outputPipeline = outputPipeline.resize(resizedWidth, resizedHeight, {
      fit: "fill",
      kernel: "lanczos3"
    }).extend({
      top,
      bottom,
      left,
      right,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    });
    safeAreaNormalization = {
      version: "affiliate-pilot-centered-safe-area-v1",
      scale: safeAreaScale,
      resizedDimensions: { width: resizedWidth, height: resizedHeight },
      padding: { top, right, bottom, left }
    };
  }
  const { data: outputData, info: outputInfo } = await outputPipeline
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // Resampling an alpha edge can blend keyed RGB from transparent source pixels
  // back into a partially visible edge, so run the keyed-alpha pass once more on
  // the normalized buffer before enforcing the zero-visible-chroma invariant.
  convertAffiliatePilotV4ChromaToAlpha(
    outputData,
    outputInfo.width,
    outputInfo.height,
    chromaKeyHex
  );
  const visibleChromaPixelCountAfter = countAffiliatePilotV4VisibleChromaPixels(
    outputData,
    chromaKeyHex
  );
  if (visibleChromaPixelCountAfter !== 0) {
    throw new Error(`${String(job.id)} retains visible chroma after reprocessing.`);
  }
  const tempPath = `${outputPath}.alpha-v2.tmp.png`;
  if (fs.existsSync(tempPath)) throw new Error(`Temporary output already exists: ${tempPath}`);
  await sharp(outputData, {
    raw: {
      width: outputInfo.width,
      height: outputInfo.height,
      channels: 4
    }
  }).png().toFile(tempPath);
  let verified = await sharp(tempPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let decodedVisibleChromaPixelCount = countAffiliatePilotV4VisibleChromaPixels(
    verified.data,
    chromaKeyHex
  );
  if (decodedVisibleChromaPixelCount !== 0) {
    convertAffiliatePilotV4ChromaToAlpha(
      verified.data,
      verified.info.width,
      verified.info.height,
      chromaKeyHex
    );
    const repairedTempPath = `${outputPath}.alpha-v2-encoded-repair.tmp.png`;
    if (fs.existsSync(repairedTempPath)) {
      fs.rmSync(tempPath);
      throw new Error(`Temporary encoded repair already exists: ${repairedTempPath}`);
    }
    await sharp(verified.data, {
      raw: {
        width: verified.info.width,
        height: verified.info.height,
        channels: 4
      }
    }).png().toFile(repairedTempPath);
    fs.rmSync(tempPath);
    fs.renameSync(repairedTempPath, tempPath);
    verified = await sharp(tempPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    decodedVisibleChromaPixelCount = countAffiliatePilotV4VisibleChromaPixels(
      verified.data,
      chromaKeyHex
    );
  }
  if (decodedVisibleChromaPixelCount !== 0) {
    fs.rmSync(tempPath);
    throw new Error(
      `${String(job.id)} retains ${decodedVisibleChromaPixelCount} decoded visible chroma pixels after encoding.`
    );
  }
  let transparentPixelCount = 0;
  let partialAlphaPixelCount = 0;
  for (let offset = 3; offset < verified.data.length; offset += 4) {
    const alpha = verified.data[offset];
    if (alpha === 0) transparentPixelCount += 1;
    else if (alpha < 255) partialAlphaPixelCount += 1;
  }
  const outputSha256 = sha256File(tempPath);
  const evidenceDirectory = path.join(
    outputRoot,
    "affiliate-pilot",
    "v4",
    "private-evidence",
    "identity-generation",
    asin
  );
  const supersededPath = path.join(
    evidenceDirectory,
    `${view}-alpha-v1-superseded-${priorOutputSha256.slice(0, 12)}.png`
  );
  if (fs.existsSync(supersededPath)) {
    fs.rmSync(tempPath);
    throw new Error(`Superseded alpha evidence already exists: ${supersededPath}`);
  }
  fs.renameSync(outputPath, supersededPath);
  try {
    fs.renameSync(tempPath, outputPath);
  } catch (error) {
    fs.renameSync(supersededPath, outputPath);
    throw error;
  }
  const revision = {
    occurredAt,
    asin,
    jobId: job.id,
    identityView: view,
    algorithmVersion: AFFILIATE_PILOT_V4_CHROMA_ALGORITHM_VERSION,
    audit,
    rawEvidencePath: path.relative(repositoryRoot, rawPath).replace(/\\/g, "/"),
    priorOutputSha256,
    supersededOutputPath: path.relative(repositoryRoot, supersededPath).replace(/\\/g, "/"),
    outputPath: path.relative(repositoryRoot, outputPath).replace(/\\/g, "/"),
    outputSha256,
    transparentPixelCount,
    partialAlphaPixelCount,
    visibleChromaPixelCountAfter,
    safeAreaNormalization
  };
  revisions.push(revision);
  fs.writeFileSync(
    path.join(evidenceDirectory, `${view}-alpha-v2-revision.json`),
    `${JSON.stringify(revision, null, 2)}\n`,
    "utf8"
  );
}

const packs = ledger.identityGeneration.packs ?? [];
const packIndex = packs.findIndex((pack) => pack.asin === asin);
const hadPriorPack = packIndex >= 0;
if (packIndex >= 0) {
  const [pack] = packs.splice(packIndex, 1);
  const atlasPath = path.join(repositoryRoot, String(pack.atlasPath));
  const supersededAtlasPath = atlasPath.replace(/\.png$/, "-alpha-v1-superseded.png");
  if (fs.existsSync(supersededAtlasPath)) {
    throw new Error(`Superseded atlas already exists: ${supersededAtlasPath}`);
  }
  if (fs.existsSync(atlasPath)) fs.renameSync(atlasPath, supersededAtlasPath);
  const reviewRoot = path.join(
    outputRoot,
    "affiliate-pilot",
    "v4",
    "private-evidence",
    "identity-generation",
    asin
  );
  const reviewPath = path.join(reviewRoot, "identity-pack-review.json");
  const supersededReviewPath = path.join(
    reviewRoot,
    "identity-pack-review-alpha-v1-superseded.json"
  );
  if (fs.existsSync(supersededReviewPath)) {
    throw new Error(`Superseded review already exists: ${supersededReviewPath}`);
  }
  if (fs.existsSync(reviewPath)) fs.renameSync(reviewPath, supersededReviewPath);
  const supersededPacks = ledger.identityGeneration.supersededPacks ?? [];
  supersededPacks.push({
    ...pack,
    supersededAt: occurredAt,
    supersededReason: audit,
    supersededAtlasPath: path.relative(repositoryRoot, supersededAtlasPath).replace(/\\/g, "/")
  });
  ledger.identityGeneration.supersededPacks = supersededPacks;
  ledger.events.push({
    type: "identity_pack_superseded",
    occurredAt,
    status: "alpha_reprocessing_required",
    asin,
    priorAtlasSha256: pack.atlasSha256
  });
}
ledger.identityGeneration.packs = packs;
ledger.identityGeneration.reviewedPackCount = packs.length;
ledger.identityGeneration.postprocessingRevisions = revisions;
ledger.updatedAt = occurredAt;
ledger.events.push({
  type: "identity_alpha_reprocessed",
  occurredAt,
  status: "assistant_pass_pack_review_required",
  asin,
  algorithmVersion: AFFILIATE_PILOT_V4_CHROMA_ALGORITHM_VERSION,
  revisedViewCount: jobs.length,
  safeAreaView,
  safeAreaScale: safeAreaView ? safeAreaScale : null
});
fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
process.stdout.write(
  `${asin}: reprocessed ${jobs.length}/7 identity outputs with ${AFFILIATE_PILOT_V4_CHROMA_ALGORITHM_VERSION}; ${hadPriorPack ? "prior pack superseded and " : ""}review required.\n`
);
