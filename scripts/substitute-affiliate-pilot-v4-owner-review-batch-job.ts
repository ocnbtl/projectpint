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
  const tempPath = `${filePath}.${process.pid}.substitute.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const batchId = argument("batch-id");
const reviewNumber = Number.parseInt(argument("review-number"), 10);
const replacementSceneId = argument("replacement-scene-id");
const reason = argument("reason");
if (!Number.isInteger(reviewNumber) || reviewNumber < 1) throw new Error("Invalid --review-number.");

const repositoryRoot = process.cwd();
const v4Root = path.join(repositoryRoot, "output", "affiliate-pilot", "v4");
const manifest = readJson(path.join(v4Root, "manifest.json"));
const batchPath = path.join(v4Root, "private-evidence", "owner-review-batches", batchId, "batch.json");
const batch = readJson(batchPath);
const jobs = manifest.jobs as JsonRecord[];
const frozen = (batch.jobs as JsonRecord[]).find((job) => Number(job.reviewNumber) === reviewNumber);
if (!frozen) throw new Error(`${batchId} has no review number ${reviewNumber}.`);
const prior = jobs.find((job) => job.id === frozen.jobId && job.sceneId === frozen.sceneId);
const replacement = jobs.find((job) => job.kind === "styled" && job.sceneId === replacementSceneId);
if (!prior || !replacement) throw new Error("Prior or replacement manifest job is missing.");
const replacementProduct = (manifest.products as JsonRecord[]).find(
  (product) => product.asin === replacement.asin
);
if (!replacementProduct) throw new Error(`Product metadata is missing for ${replacement.asin}.`);
if (prior.status !== "assistant_hard_reject" || prior.decisionStatus !== "assistant_hard_reject") {
  throw new Error(`${prior.sceneId} is not a preserved assistant hard reject.`);
}
if (
  replacement.status !== "assistant_pass_owner_pending" ||
  replacement.decisionStatus !== "assistant_pass_owner_pending"
) {
  throw new Error(`${replacementSceneId} is not assistant-pass owner-pending.`);
}
if ((batch.jobs as JsonRecord[]).some((job) => job !== frozen && job.sceneId === replacementSceneId)) {
  throw new Error(`${replacementSceneId} is already frozen elsewhere in ${batchId}.`);
}
if (
  (batch.jobs as JsonRecord[]).some(
    (job) => job !== frozen && job.ownerSelectedStorageKey === replacement.ownerSelectedStorageKey
  )
) {
  throw new Error(`${replacementSceneId} collides with an owner-review lane already in ${batchId}.`);
}

const correctiveReferenceByAsin: Record<string, string> = {
  B0DC7VG6Z9:
    "output/affiliate-pilot/v4/private-evidence/product-sources/B0DC7VG6Z9/bambusi-manufacturer-04.jpg",
  B0D2KK6MNS:
    "output/affiliate-pilot/v4/private-evidence/product-sources/B0D2KK6MNS/amazon-exact-asin-02.jpg"
};
const effectiveReferencePath =
  correctiveReferenceByAsin[String(replacement.asin)] ?? `output/${replacement.atlasStorageKey}`;
const absoluteReferencePath = path.join(repositoryRoot, effectiveReferencePath);
const candidatePath = path.join(repositoryRoot, "output", String(replacement.storageKey));
if (!fs.existsSync(absoluteReferencePath)) throw new Error(`Missing reference: ${effectiveReferencePath}`);
if (!fs.existsSync(candidatePath) || sha256File(candidatePath) !== replacement.candidateSha256) {
  throw new Error(`${replacementSceneId} candidate is missing or hash-invalid.`);
}

const occurredAt = new Date().toISOString();
const priorSceneId = frozen.sceneId;
const priorAsin = frozen.asin;
Object.assign(frozen, {
  sceneId: replacement.sceneId,
  jobId: replacement.id,
  asin: replacement.asin,
  styleSlug: replacement.styleSlug,
  slot: replacement.slot,
  candidateOrdinal: replacement.candidateOrdinal,
  productName: replacementProduct.productName,
  brand: replacementProduct.brand,
  productSlug: replacementProduct.slug,
  productRole: replacementProduct.productRole,
  promptVersion: replacement.promptVersion,
  promptSha256: replacement.promptSha256,
  exactPrompt: replacement.prompt,
  requestedModel: replacement.requestedModel,
  requestedQuality: replacement.requestedQuality,
  atlasPath: effectiveReferencePath,
  atlasSha256: sha256File(absoluteReferencePath),
  candidatePath: `output/${replacement.storageKey}`,
  ownerSelectedStorageKey: replacement.ownerSelectedStorageKey,
  statusAtFreeze: replacement.status,
  substitutionForFrozenSceneId: priorSceneId,
  substitutionReason: reason
});
batch.amendments = [
  ...((batch.amendments ?? []) as JsonRecord[]),
  {
    occurredAt,
    reviewNumber,
    priorSceneId,
    priorAsin,
    replacementSceneId,
    replacementAsin: replacement.asin,
    type: "cross_product_private_owner_review_substitution",
    reason
  }
];
writeJsonAtomic(batchPath, batch);
process.stdout.write(
  `${batchId} review ${reviewNumber}: ${priorSceneId} (${priorAsin}) -> ${replacementSceneId} (${replacement.asin}).\n`
);
