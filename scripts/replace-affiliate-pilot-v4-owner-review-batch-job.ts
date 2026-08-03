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
  const tempPath = `${filePath}.${process.pid}.replace.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

const batchId = argument("batch-id");
const reviewNumber = Number.parseInt(argument("review-number"), 10);
const replacementSceneId = argument("replacement-scene-id");
if (!Number.isInteger(reviewNumber) || reviewNumber < 1) throw new Error("Invalid --review-number.");

const repositoryRoot = process.cwd();
const v4Root = path.join(repositoryRoot, "output", "affiliate-pilot", "v4");
const manifest = readJson(path.join(v4Root, "manifest.json"));
const batchPath = path.join(
  v4Root,
  "private-evidence",
  "owner-review-batches",
  batchId,
  "batch.json"
);
const batch = readJson(batchPath);
const jobs = manifest.jobs as JsonRecord[];
const frozen = (batch.jobs as JsonRecord[]).find((job) => Number(job.reviewNumber) === reviewNumber);
if (!frozen) throw new Error(`${batchId} has no review number ${reviewNumber}.`);
const prior = jobs.find((job) => job.id === frozen.jobId && job.sceneId === frozen.sceneId);
const replacement = jobs.find((job) => job.kind === "styled" && job.sceneId === replacementSceneId);
if (!prior || !replacement) throw new Error("Prior or replacement manifest job is missing.");
if (prior.status !== "assistant_hard_reject" || prior.decisionStatus !== "assistant_hard_reject") {
  throw new Error(`${prior.sceneId} is not a preserved assistant hard reject.`);
}
if (
  replacement.asin !== prior.asin ||
  replacement.styleSlug !== prior.styleSlug ||
  Number(replacement.slot) !== Number(prior.slot) ||
  Number(replacement.candidateOrdinal) <= Number(prior.candidateOrdinal)
) {
  throw new Error(`${replacementSceneId} is not a later candidate in the same product/style/slot lane.`);
}
if (
  !["queued", "assistant_pass_owner_pending"].includes(replacement.status) ||
  replacement.status !== replacement.decisionStatus
) {
  throw new Error(`${replacementSceneId} is not queued or owner-pending.`);
}

let cursor: JsonRecord | undefined = replacement;
const visited = new Set<string>();
while (cursor?.replacementForCandidateId) {
  if (visited.has(cursor.id)) throw new Error("Replacement ancestry contains a cycle.");
  visited.add(cursor.id);
  if (cursor.replacementForCandidateId === prior.id) break;
  cursor = jobs.find((job) => job.id === cursor!.replacementForCandidateId);
}
if (cursor?.replacementForCandidateId !== prior.id) {
  throw new Error(`${replacementSceneId} does not descend from frozen scene ${prior.sceneId}.`);
}

const occurredAt = new Date().toISOString();
const priorSceneId = frozen.sceneId;
Object.assign(frozen, {
  sceneId: replacement.sceneId,
  jobId: replacement.id,
  asin: replacement.asin,
  styleSlug: replacement.styleSlug,
  slot: replacement.slot,
  candidateOrdinal: replacement.candidateOrdinal,
  promptVersion: replacement.promptVersion,
  promptSha256: replacement.promptSha256,
  exactPrompt: replacement.prompt,
  requestedModel: replacement.requestedModel,
  requestedQuality: replacement.requestedQuality,
  atlasPath: `output/${replacement.atlasStorageKey}`,
  atlasSha256: replacement.referencePackSha256,
  candidatePath: `output/${replacement.storageKey}`,
  ownerSelectedStorageKey: replacement.ownerSelectedStorageKey,
  statusAtFreeze: replacement.status,
  replacementForFrozenSceneId: priorSceneId
});
batch.amendments = [
  ...((batch.amendments ?? []) as JsonRecord[]),
  {
    occurredAt,
    reviewNumber,
    priorSceneId,
    replacementSceneId,
    reason: "Assistant hard reject preserved; owner-review slot reassigned to its materially different descendant candidate."
  }
];
writeJsonAtomic(batchPath, batch);
process.stdout.write(
  `${batchId} review ${reviewNumber}: ${priorSceneId} -> ${replacementSceneId} (${replacement.status}).\n`
);
