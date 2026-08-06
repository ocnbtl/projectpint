import fs from "node:fs";
import path from "node:path";

type JsonRecord = Record<string, any>;

function readJson(filePath: string): JsonRecord {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")) as JsonRecord;
}

function writeJson(filePath: string, value: JsonRecord): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const batchId = "v472-owner-review-002";
const reviewNumber = 1;
const sceneId = "v4-B0829N8C9G-minimalist-elegance-02-candidate-07";
const root = process.cwd();
const batchRoot = path.join(
  root,
  "output",
  "affiliate-pilot",
  "v4",
  "private-evidence",
  "owner-review-batches",
  batchId
);
const batchPath = path.join(batchRoot, "batch.json");
const amendmentPath = path.join(batchRoot, "generation-execution-amendment.json");
const batch = readJson(batchPath);
const job = (batch.jobs as JsonRecord[]).find(
  (candidate) => candidate.reviewNumber === reviewNumber && candidate.sceneId === sceneId
);
if (!job) throw new Error(`Could not find ${batchId} review ${reviewNumber} / ${sceneId}.`);

const amendmentRelativePath = path
  .relative(root, amendmentPath)
  .replace(/\\/g, "/");
writeJson(amendmentPath, {
  schemaVersion: "affiliate-pilot-v4-generation-execution-amendment-v1",
  batchId,
  reviewNumber,
  sceneId,
  executionPromptFidelity: "condensed_semantically_equivalent_not_byte_exact",
  exactExecutedPromptAvailable: false,
  intendedFrozenPromptSha256: job.promptSha256,
  disclosure:
    "The first Wave B built-in image-generation call used a condensed manual transcription of the frozen prompt. The exact executed text was not captured byte-for-byte. The frozen prompt remains in batch.json, but this call must not be represented as byte-exact prompt execution.",
  candidateStatus: "assistant_pass_owner_pending",
  publicationStatus: "not_authorized_not_publishable",
  remediation:
    "Retain the candidate for owner visual review with this explicit disclosure. All subsequent Wave B generation calls used their frozen manifest prompts directly."
});

job.generationExecutionPromptStatus = "condensed_semantically_equivalent_not_byte_exact";
job.generationExecutionAmendmentPath = amendmentRelativePath;
batch.generationEvidenceAmendmentPaths = Array.from(
  new Set([...(batch.generationEvidenceAmendmentPaths ?? []), amendmentRelativePath])
);
writeJson(batchPath, batch);
console.log(`Annotated ${batchId} review ${reviewNumber} with ${amendmentRelativePath}.`);
