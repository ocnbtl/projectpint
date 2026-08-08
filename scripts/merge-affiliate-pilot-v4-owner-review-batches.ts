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

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function writeJsonAtomic(filePath: string, value: JsonRecord): void {
  const tempPath = `${filePath}.${process.pid}.merge.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

const outputBatchId = argument("output-batch-id");
const sourceBatchIds = argument("source-batch-ids")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
if (!/^[a-z0-9][a-z0-9-]*$/.test(outputBatchId)) {
  throw new Error("--output-batch-id must be a lowercase storage slug.");
}
if (sourceBatchIds.length < 2 || new Set(sourceBatchIds).size !== sourceBatchIds.length) {
  throw new Error("--source-batch-ids must contain at least two unique batch IDs.");
}

const repositoryRoot = process.cwd();
const v4Root = path.join(repositoryRoot, "output", "affiliate-pilot", "v4");
const batchesRoot = path.join(v4Root, "private-evidence", "owner-review-batches");
const outputRoot = path.join(batchesRoot, outputBatchId);
const outputPath = path.join(outputRoot, "batch.json");
if (fs.existsSync(outputPath)) throw new Error(`Combined batch already exists: ${outputPath}`);

const manifest = readJson(path.join(v4Root, "manifest.json"));
const manifestJobs = manifest.jobs as JsonRecord[];
const sourceBatches = sourceBatchIds.map((batchId) => {
  const batch = readJson(path.join(batchesRoot, batchId, "batch.json"));
  if (batch.batchId !== batchId || !Array.isArray(batch.jobs)) {
    throw new Error(`Invalid source batch: ${batchId}`);
  }
  return batch;
});

const seenScenes = new Set<string>();
const seenStorageKeys = new Set<string>();
const seenCandidateHashes = new Set<string>();
const jobs = sourceBatches.flatMap((batch, sourceBatchIndex) =>
  (batch.jobs as JsonRecord[]).map((job, sourceJobIndex) => {
    const liveJob = manifestJobs.find(
      (candidate) => candidate.id === job.jobId && candidate.sceneId === job.sceneId
    );
    if (
      !liveJob ||
      liveJob.status !== "assistant_pass_owner_pending" ||
      liveJob.decisionStatus !== "assistant_pass_owner_pending"
    ) {
      throw new Error(`${job.sceneId} is not assistant-pass owner-pending in the current manifest.`);
    }
    const candidatePath = path.join(repositoryRoot, "output", String(liveJob.storageKey));
    if (!fs.existsSync(candidatePath)) throw new Error(`Missing candidate: ${candidatePath}`);
    const candidateSha256 = sha256File(candidatePath);
    if (candidateSha256 !== liveJob.candidateSha256) {
      throw new Error(`Candidate hash mismatch for ${job.sceneId}.`);
    }
    if (seenScenes.has(String(job.sceneId))) throw new Error(`Duplicate scene: ${job.sceneId}`);
    if (seenStorageKeys.has(String(job.ownerSelectedStorageKey))) {
      throw new Error(`Duplicate owner lane: ${job.ownerSelectedStorageKey}`);
    }
    if (seenCandidateHashes.has(candidateSha256)) throw new Error(`Duplicate candidate bytes: ${job.sceneId}`);
    seenScenes.add(String(job.sceneId));
    seenStorageKeys.add(String(job.ownerSelectedStorageKey));
    seenCandidateHashes.add(candidateSha256);
    return {
      ...job,
      reviewNumber:
        sourceBatches
          .slice(0, sourceBatchIndex)
          .reduce((count, source) => count + Number(source.jobs.length), 0) +
        sourceJobIndex +
        1,
      statusAtFreeze: "assistant_pass_owner_pending",
      sourceOwnerReviewBatchId: batch.batchId,
      sourceReviewNumber: job.reviewNumber,
      candidateSha256,
    };
  })
);

const occurredAt = new Date().toISOString();
const combinedBatch = {
  schemaVersion: "affiliate-pilot-v4-owner-review-combined-batch-v1",
  batchId: outputBatchId,
  sourceOwnerReviewBatchIds: sourceBatchIds,
  createdAt: occurredAt,
  status: "assistant_screened_owner_pending",
  targetOwnerReviewCandidateCount: jobs.length,
  finalLibraryTargetPerProductStyle: 10,
  selectionPolicy:
    "Concatenate the two screened private owner-review batches in source order, retaining exact provenance while requiring unique scenes, bytes, and owner-selected lanes.",
  decisionSemantics:
    "Assistant screening is provisional. Only explicit owner_accepted or owner_declined decisions are final. This combined batch is private and not publishable.",
  publicationStatus: "not_authorized_not_copied",
  jobs,
  amendments: [
    {
      occurredAt,
      type: "combined_private_owner_review_batch_created",
      sourceBatchIds,
      candidateCount: jobs.length,
    },
  ],
};

fs.mkdirSync(outputRoot, { recursive: true });
writeJsonAtomic(outputPath, combinedBatch);
process.stdout.write(
  `Prepared ${outputBatchId}: ${jobs.length} screened candidates from ${sourceBatchIds.join(", ")}.\n`
);
