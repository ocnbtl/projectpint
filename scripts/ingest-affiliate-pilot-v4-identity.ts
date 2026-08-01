import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import {
  AFFILIATE_PILOT_V4_CHROMA_ALGORITHM_VERSION,
  convertAffiliatePilotV4ChromaToAlpha,
  type AffiliatePilotV4ChromaKey
} from "../lib/affiliate-pilot-v4-chroma.ts";

const require = createRequire(import.meta.url);
const sharp = require("sharp") as any;

type IdentityView =
  | "presentation"
  | "front"
  | "back"
  | "left"
  | "right"
  | "top"
  | "bottom";

const args = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const [key, ...rest] = argument.replace(/^--/, "").split("=");
    return [key, rest.join("=")];
  })
);
const asin = args.asin;
const view = args.view as IdentityView | undefined;
const inputPath = args.input ? path.resolve(args.input) : null;
const decision = args.decision;
const reason = args.reason;
const validViews = new Set<IdentityView>([
  "presentation",
  "front",
  "back",
  "left",
  "right",
  "top",
  "bottom"
]);
if (!asin || !view || !validViews.has(view) || !inputPath) {
  throw new Error("Usage: --asin=<ASIN> --view=<view> --input=<path> --decision=assistant_pass|assistant_hard_reject --reason=<audit>");
}
if (decision !== "assistant_pass" && decision !== "assistant_hard_reject") {
  throw new Error("Identity decision must be assistant_pass or assistant_hard_reject.");
}
if (!reason?.trim()) throw new Error("A concise full-size audit reason is required.");
if (!fs.existsSync(inputPath)) throw new Error(`Generated input is missing: ${inputPath}`);

const repositoryRoot = process.cwd();
const outputRoot = path.join(repositoryRoot, "output");
const manifestPath = path.join(outputRoot, "affiliate-pilot", "v4", "manifest.json");
const ledgerPath = path.join(outputRoot, "affiliate-pilot", "v4", "execution-log.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, "")) as {
  generationVersion: string;
  promptVersion: string;
  jobs: Array<Record<string, unknown>>;
};
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8").replace(/^\uFEFF/, "")) as Record<string, unknown> & {
  identityGeneration: {
    expected: number;
    generated: number;
    assistantPassed: number;
    ownerAccepted: number;
    calls: Array<Record<string, unknown>>;
  };
  events: Array<Record<string, unknown>>;
};
const job = manifest.jobs.find(
  (candidate) =>
    candidate.kind === "identity" && candidate.asin === asin && candidate.identityView === view
);
if (!job) throw new Error(`No identity job exists for ${asin} ${view}.`);
if (job.status !== "queued") throw new Error(`${asin} ${view} is not queued; current status is ${String(job.status)}.`);
if (!Array.isArray(ledger.identityGeneration.calls)) {
  throw new Error("Execution ledger identityGeneration.calls is invalid.");
}
const priorJobCalls = ledger.identityGeneration.calls.filter((call) => call.jobId === job.id);
if (priorJobCalls.some((call) => call.decision === "assistant_pass")) {
  throw new Error(`Execution ledger already contains a passed output for ${String(job.id)}.`);
}
const attemptOrdinal = priorJobCalls.length + 1;
if (attemptOrdinal > 2 && !args["root-revision"]?.trim()) {
  throw new Error(
    `Attempt ${attemptOrdinal} for ${String(job.id)} requires --root-revision=<documented contract change>.`
  );
}

const metadata = await sharp(inputPath).metadata();
const dimensionNormalizationRequired =
  metadata.width !== 1024 || metadata.height !== 1536;
if (
  decision === "assistant_pass" &&
  (Math.abs((metadata.width ?? 0) - 1024) > 4 ||
    Math.abs((metadata.height ?? 0) - 1536) > 4)
) {
  throw new Error(
    `Generated identity differs too far from 1024x1536 for bounded normalization; received ${metadata.width}x${metadata.height}.`
  );
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const inputSha256 = sha256File(inputPath);
if (ledger.identityGeneration.calls.some((call) => call.inputSha256 === inputSha256)) {
  throw new Error(`Generated identity hash already appears in the execution ledger: ${inputSha256}.`);
}

const evidenceDirectory = path.join(
  outputRoot,
  "affiliate-pilot",
  "v4",
  "private-evidence",
  "identity-generation",
  asin
);
fs.mkdirSync(evidenceDirectory, { recursive: true });
const evidencePath = path.join(
  evidenceDirectory,
  `${view}-attempt-${String(attemptOrdinal).padStart(2, "0")}-${decision === "assistant_pass" ? "provider" : "rejected"}.png`
);
if (fs.existsSync(evidencePath)) throw new Error(`Refusing to overwrite identity evidence: ${evidencePath}`);
fs.copyFileSync(inputPath, evidencePath);

let outputPath: string | null = null;
let outputSha256: string | null = null;
let transparentPixelCount = 0;
let partialAlphaPixelCount = 0;
let visibleChromaPixelCountAfter = 0;
if (decision === "assistant_pass") {
  const storageKey = String(job.storageKey);
  outputPath = path.join(outputRoot, storageKey);
  if (fs.existsSync(outputPath)) throw new Error(`Refusing to overwrite identity output: ${outputPath}`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  let sourcePipeline = sharp(inputPath);
  if (dimensionNormalizationRequired) {
    sourcePipeline = sourcePipeline.resize(1024, 1536, { fit: "fill" });
  }
  const { data, info } = await sourcePipeline
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const chromaKeyHex = String(job.chromaKeyHex) as AffiliatePilotV4ChromaKey;
  if (chromaKeyHex !== "#00ff00" && chromaKeyHex !== "#ff00ff") {
    throw new Error(`Unsupported identity chroma key: ${chromaKeyHex}.`);
  }
  const chromaStats = convertAffiliatePilotV4ChromaToAlpha(
    data,
    info.width,
    info.height,
    chromaKeyHex
  );
  transparentPixelCount = chromaStats.transparentPixelCount;
  partialAlphaPixelCount = chromaStats.partialAlphaPixelCount;
  visibleChromaPixelCountAfter = chromaStats.visibleChromaPixelCountAfter;
  if (visibleChromaPixelCountAfter !== 0) {
    throw new Error(
      `Visible chroma remains after alpha conversion: ${visibleChromaPixelCountAfter} pixels.`
    );
  }
  await sharp(data, { raw: info }).png().toFile(outputPath);
  outputSha256 = sha256File(outputPath);
}

const dossierPath = path.join(
  outputRoot,
  "affiliate-pilot",
  "v4",
  "private-evidence",
  "product-dossiers",
  asin,
  "dossier.json"
);
const dossier = JSON.parse(fs.readFileSync(dossierPath, "utf8")) as {
  privateReferences: Array<{ path: string; sha256: string }>;
};
const occurredAt = new Date().toISOString();
const call = {
  providerCallOrdinal: ledger.identityGeneration.calls.length + 1,
  attemptOrdinal,
  occurredAt,
  jobId: job.id,
  asin,
  identityView: view,
  promptVersion: manifest.promptVersion,
  generationVersion: manifest.generationVersion,
  promptSha256: job.promptSha256,
  sourceDossierSha256: job.sourceDossierSha256,
  requestedModel: job.requestedModel,
  requestedQuality: job.requestedQuality,
  providerModelObserved: null,
  providerQualityObserved: null,
  providerRequestIdObserved: null,
  referenceInputs: dossier.privateReferences.slice(0, Number(job.referenceInputCount)),
  generatedSourcePath: inputPath,
  evidencePath: path.relative(repositoryRoot, evidencePath).replace(/\\/g, "/"),
  inputSha256,
  dimensions: { width: metadata.width, height: metadata.height },
  dimensionNormalizationRequired,
  normalizedDimensions:
    decision === "assistant_pass" ? { width: 1024, height: 1536 } : null,
  chromaKeyHex: job.chromaKeyHex,
  decision,
  audit: reason,
  rootRevision: args["root-revision"]?.trim() || null,
  transparentOutputPath: outputPath
    ? path.relative(repositoryRoot, outputPath).replace(/\\/g, "/")
    : null,
  transparentOutputSha256: outputSha256,
  transparentPixelCount,
  partialAlphaPixelCount,
  visibleChromaPixelCountAfter,
  chromaAlgorithmVersion:
    decision === "assistant_pass"
      ? AFFILIATE_PILOT_V4_CHROMA_ALGORITHM_VERSION
      : null
};
ledger.identityGeneration.calls.push(call);
ledger.identityGeneration.generated = ledger.identityGeneration.calls.length;
ledger.identityGeneration.assistantPassed = ledger.identityGeneration.calls.filter(
  (candidate) => candidate.decision === "assistant_pass"
).length;
ledger.updatedAt = occurredAt;
ledger.status =
  ledger.identityGeneration.assistantPassed === ledger.identityGeneration.expected
    ? "identity_pack_review_required"
    : "identity_generation_in_progress";
ledger.events.push({
  type: "identity_provider_call_recorded",
  occurredAt,
  status: decision,
  jobId: job.id,
  inputSha256,
  outputSha256
});
fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");

const sidecarPath = path.join(
  evidenceDirectory,
  `${view}-attempt-${String(attemptOrdinal).padStart(2, "0")}-generation.json`
);
fs.writeFileSync(sidecarPath, `${JSON.stringify(call, null, 2)}\n`, "utf8");
process.stdout.write(
  `${asin} ${view}: ${decision}; call ${String(call.providerCallOrdinal)}, input ${inputSha256}, output ${String(outputSha256)}\n`
);
