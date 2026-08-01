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
const view = args.view;
const audit = args.audit;
if (!asin || !view || !audit?.trim()) {
  throw new Error("Usage: --asin=<ASIN> --view=<view> --audit=<decoded chroma defect and repair>");
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
    postprocessingRevisions?: Array<Record<string, unknown>>;
  };
  events: Array<Record<string, unknown>>;
};
const job = manifest.jobs.find(
  (candidate) =>
    candidate.kind === "identity" && candidate.asin === asin && candidate.identityView === view
);
if (!job) throw new Error(`No identity job exists for ${asin} ${view}.`);
if ((ledger.identityGeneration.packs ?? []).some((pack) => pack.asin === asin)) {
  throw new Error(`${asin} already has a reviewed pack; use the pack-aware reprocessor instead.`);
}
const passedCalls = ledger.identityGeneration.calls.filter(
  (call) => call.jobId === job.id && call.decision === "assistant_pass"
);
if (passedCalls.length !== 1) {
  throw new Error(`${String(job.id)} requires exactly one passed provider call.`);
}
const revisions = ledger.identityGeneration.postprocessingRevisions ?? [];
const priorRevision = revisions.filter((revision) => revision.jobId === job.id).at(-1);
if (!priorRevision) {
  throw new Error(`${String(job.id)} does not have a prior postprocessing revision to repair.`);
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const outputPath = path.join(outputRoot, String(job.storageKey));
if (!fs.existsSync(outputPath)) throw new Error(`Missing transparent identity: ${outputPath}`);
const priorOutputSha256 = sha256File(outputPath);
if (priorOutputSha256 !== priorRevision.outputSha256) {
  throw new Error(`${String(job.id)} current hash does not match its latest revision.`);
}
const chromaKeyHex = String(job.chromaKeyHex) as AffiliatePilotV4ChromaKey;
const decoded = await sharp(outputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
if (decoded.info.width !== 1024 || decoded.info.height !== 1536 || decoded.info.channels !== 4) {
  throw new Error(`${String(job.id)} must remain a 1024x1536 RGBA image.`);
}
const visibleChromaPixelCountBefore = countAffiliatePilotV4VisibleChromaPixels(
  decoded.data,
  chromaKeyHex
);
if (visibleChromaPixelCountBefore === 0) {
  throw new Error(`${String(job.id)} has no decoded visible chroma to repair.`);
}
convertAffiliatePilotV4ChromaToAlpha(
  decoded.data,
  decoded.info.width,
  decoded.info.height,
  chromaKeyHex
);

const evidenceDirectory = path.join(
  outputRoot,
  "affiliate-pilot",
  "v4",
  "private-evidence",
  "identity-generation",
  asin
);
const tempPath = `${outputPath}.visible-chroma-repair.tmp.png`;
if (fs.existsSync(tempPath)) throw new Error(`Temporary output already exists: ${tempPath}`);
await sharp(decoded.data, {
  raw: {
    width: decoded.info.width,
    height: decoded.info.height,
    channels: 4
  }
}).png().toFile(tempPath);
const verified = await sharp(tempPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const visibleChromaPixelCountAfter = countAffiliatePilotV4VisibleChromaPixels(
  verified.data,
  chromaKeyHex
);
if (visibleChromaPixelCountAfter !== 0) {
  fs.rmSync(tempPath);
  throw new Error(
    `${String(job.id)} retains ${visibleChromaPixelCountAfter} decoded visible chroma pixels after repair.`
  );
}
let transparentPixelCount = 0;
let partialAlphaPixelCount = 0;
for (let offset = 3; offset < verified.data.length; offset += 4) {
  const alpha = verified.data[offset];
  if (alpha === 0) transparentPixelCount += 1;
  else if (alpha < 255) partialAlphaPixelCount += 1;
}
if (transparentPixelCount < 1024 * 1536 * 0.25) {
  fs.rmSync(tempPath);
  throw new Error(`${String(job.id)} repair would fail the 25 percent transparent safe-area gate.`);
}
const supersededPath = path.join(
  evidenceDirectory,
  `${view}-visible-chroma-superseded-${priorOutputSha256.slice(0, 12)}.png`
);
if (fs.existsSync(supersededPath)) {
  fs.rmSync(tempPath);
  throw new Error(`Superseded chroma evidence already exists: ${supersededPath}`);
}
fs.renameSync(outputPath, supersededPath);
try {
  fs.renameSync(tempPath, outputPath);
} catch (error) {
  fs.renameSync(supersededPath, outputPath);
  throw error;
}

const occurredAt = new Date().toISOString();
const outputSha256 = sha256File(outputPath);
const revision = {
  occurredAt,
  asin,
  jobId: job.id,
  identityView: view,
  algorithmVersion: AFFILIATE_PILOT_V4_CHROMA_ALGORITHM_VERSION,
  revisionType: "decoded_visible_chroma_repair",
  audit,
  priorRevisionOutputSha256: priorRevision.outputSha256,
  priorOutputSha256,
  supersededOutputPath: path.relative(repositoryRoot, supersededPath).replace(/\\/g, "/"),
  outputPath: path.relative(repositoryRoot, outputPath).replace(/\\/g, "/"),
  outputSha256,
  transparentPixelCount,
  partialAlphaPixelCount,
  visibleChromaPixelCountBefore,
  visibleChromaPixelCountAfter
};
revisions.push(revision);
ledger.identityGeneration.postprocessingRevisions = revisions;
ledger.updatedAt = occurredAt;
ledger.events.push({
  type: "identity_visible_chroma_repaired",
  occurredAt,
  status: "assistant_pass_pack_review_required",
  asin,
  jobId: job.id,
  identityView: view,
  priorOutputSha256,
  outputSha256,
  visibleChromaPixelCountBefore,
  visibleChromaPixelCountAfter
});
fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
fs.writeFileSync(
  path.join(evidenceDirectory, `${view}-visible-chroma-revision.json`),
  `${JSON.stringify(revision, null, 2)}\n`,
  "utf8"
);
process.stdout.write(
  `${asin} ${view}: repaired ${visibleChromaPixelCountBefore} decoded visible chroma pixels; verified ${visibleChromaPixelCountAfter}.\n`
);
