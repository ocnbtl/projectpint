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
  const tempPath = `${filePath}.${process.pid}.owner-decisions.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function sha256File(filePath: string): string {
  return sha256(fs.readFileSync(filePath));
}

function repositoryPath(repositoryRoot: string, relativePath: string): string {
  const resolved = path.resolve(repositoryRoot, relativePath);
  const relative = path.relative(repositoryRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Evidence path leaves the repository: ${relativePath}`);
  }
  return resolved;
}

const decisionFile = path.resolve(argument("decision-file"));
if (!fs.existsSync(decisionFile) || !fs.statSync(decisionFile).isFile()) {
  throw new Error(`Decision export does not exist: ${decisionFile}`);
}

const repositoryRoot = process.cwd();
const outputRoot = path.join(repositoryRoot, "output");
const manifestPath = path.join(outputRoot, "affiliate-pilot", "v4", "manifest.json");
const ledgerPath = path.join(outputRoot, "affiliate-pilot", "v4", "execution-log.json");
const manifest = readJson(manifestPath);
const ledger = readJson(ledgerPath);
const exported = readJson(decisionFile);
const batchId = String(exported.batchId ?? "");
if (!/^[a-z0-9][a-z0-9-]*$/.test(batchId)) throw new Error(`Invalid exported batchId: ${batchId}`);

const reviewRoot = path.join(
  outputRoot,
  "affiliate-pilot",
  "v4",
  "private-evidence",
  "owner-review-batches",
  batchId
);
const batchPath = path.join(reviewRoot, "batch.json");
const reviewIndexPath = path.join(reviewRoot, "review-index.json");
const rawReceiptPath = path.join(reviewRoot, "owner-decisions-export.json");
const normalizedReceiptPath = path.join(reviewRoot, "owner-decision-receipt.json");
if (!fs.existsSync(batchPath) || !fs.existsSync(reviewIndexPath)) {
  throw new Error(`Frozen review evidence is missing for ${batchId}.`);
}
if (fs.existsSync(rawReceiptPath) || fs.existsSync(normalizedReceiptPath)) {
  throw new Error(`${batchId} already has preserved owner-decision evidence.`);
}

const batch = readJson(batchPath);
const reviewIndex = readJson(reviewIndexPath);
const frozenJobs = reviewIndex.jobs as JsonRecord[];
const decisions = exported.decisions as JsonRecord[];
const expectedCount = Number(batch.targetOwnerReviewCandidateCount);
if (!Array.isArray(decisions) || decisions.length !== expectedCount || frozenJobs.length !== expectedCount) {
  throw new Error(
    `${batchId} requires ${expectedCount} decisions for ${frozenJobs.length} frozen jobs; received ${decisions?.length}.`
  );
}

const reviewNumbers = new Set<number>();
const sceneIds = new Set<string>();
const normalizedDecisions = decisions.map((decision): JsonRecord => {
  const reviewNumber = Number(decision.reviewNumber);
  const sceneId = String(decision.sceneId ?? "");
  const value = String(decision.decision ?? "").toUpperCase();
  const note = String(decision.note ?? "").trim();
  if (!Number.isInteger(reviewNumber) || reviewNumber < 1 || reviewNumber > expectedCount) {
    throw new Error(`Invalid review number: ${decision.reviewNumber}`);
  }
  if (reviewNumbers.has(reviewNumber)) throw new Error(`Duplicate review number: ${reviewNumber}`);
  if (sceneIds.has(sceneId)) throw new Error(`Duplicate scene decision: ${sceneId}`);
  if (value !== "APPROVE" && value !== "DENY") {
    throw new Error(`${sceneId || `review ${reviewNumber}`} is not APPROVE or DENY.`);
  }
  if (value === "DENY" && !note) throw new Error(`${sceneId} is denied without an owner reason.`);
  const frozen = frozenJobs.find((job) => Number(job.reviewNumber) === reviewNumber);
  if (!frozen || frozen.sceneId !== sceneId) {
    throw new Error(`Review ${reviewNumber} does not match frozen scene ${sceneId}.`);
  }
  reviewNumbers.add(reviewNumber);
  sceneIds.add(sceneId);
  return { reviewNumber, sceneId, decision: value, note, frozen };
});

if (manifest.ownerSelectionRequired !== true || manifest.assistantAcceptanceIsFinal !== false) {
  throw new Error("Manifest owner-selection semantics are missing or unsafe.");
}
const identityCalls = ledger.identityGeneration?.calls as JsonRecord[] | undefined;
const lock = ledger.styledGeneration?.identityLock as JsonRecord | undefined;
const styledCalls = ledger.styledGeneration?.calls as JsonRecord[] | undefined;
if (!Array.isArray(identityCalls) || !lock || !Array.isArray(styledCalls)) {
  throw new Error("Generation ledger evidence is incomplete.");
}
if (lock.styledIdentityGenerationAllowed !== false || identityCalls.length !== Number(lock.identityCallCount)) {
  throw new Error("Identity-call ledger changed after the styled identity lock.");
}

const jobs = manifest.jobs as JsonRecord[];
const existingOwnerDecisions = (ledger.styledGeneration.ownerDecisions ?? []) as JsonRecord[];
const prepared = normalizedDecisions.map((entry): JsonRecord => {
  const frozen = entry.frozen as JsonRecord;
  const job = jobs.find((candidate) => candidate.kind === "styled" && candidate.sceneId === entry.sceneId);
  if (!job) throw new Error(`No styled manifest job exists for ${entry.sceneId}.`);
  if (job.status !== "assistant_pass_owner_pending" || job.decisionStatus !== "assistant_pass_owner_pending") {
    throw new Error(`${entry.sceneId} is not owner-pending: ${job.status}/${job.decisionStatus}.`);
  }
  if (job.ownerApprovalRequired !== true) throw new Error(`${entry.sceneId} lacks owner-approval semantics.`);
  if (existingOwnerDecisions.some((decision) => decision.sceneId === entry.sceneId)) {
    throw new Error(`${entry.sceneId} already has an owner decision.`);
  }
  if (
    job.promptSha256 !== frozen.promptSha256 ||
    job.candidateSha256 !== frozen.candidateSha256 ||
    job.ownerSelectedStorageKey !== frozen.ownerSelectedStorageKey
  ) {
    throw new Error(`${entry.sceneId} changed after the owner-review freeze.`);
  }

  const candidatePath = repositoryPath(repositoryRoot, path.join("output", String(job.storageKey)));
  if (!fs.existsSync(candidatePath) || sha256File(candidatePath) !== job.candidateSha256) {
    throw new Error(`${entry.sceneId} candidate is missing or hash-invalid.`);
  }
  const evidencePath = repositoryPath(repositoryRoot, String(job.generationEvidencePath));
  const evidence = readJson(evidencePath);
  if (
    evidence.sceneId !== entry.sceneId ||
    evidence.jobId !== job.id ||
    evidence.decision !== "assistant_pass_owner_pending" ||
    evidence.candidateSha256 !== job.candidateSha256 ||
    evidence.promptSha256 !== job.promptSha256 ||
    sha256(String(evidence.exactPrompt)) !== job.promptSha256 ||
    Number(evidence.identityCallCountAtGeneration) !== identityCalls.length ||
    Number(evidence.styledIdentityGenerationCallCount) !== 0
  ) {
    throw new Error(`${entry.sceneId} generation evidence does not match the frozen candidate.`);
  }
  const matchingCalls = styledCalls.filter(
    (call) =>
      call.jobId === job.id &&
      call.sceneId === entry.sceneId &&
      call.decision === "assistant_pass_owner_pending" &&
      call.candidateSha256 === job.candidateSha256
  );
  if (matchingCalls.length !== 1) {
    throw new Error(`${entry.sceneId} must have exactly one matching owner-pending provider call.`);
  }
  return { ...entry, job, candidatePath };
});

const occurredAt = new Date().toISOString();
const newOwnerDecisions: JsonRecord[] = [];
const newEvents: JsonRecord[] = [];
for (const entry of prepared) {
  const job = entry.job as JsonRecord;
  const accepted = entry.decision === "APPROVE";
  const reason = accepted
    ? entry.note || `Owner approved review ${entry.reviewNumber} in ${batchId}.`
    : entry.note;
  job.status = accepted ? "owner_accepted" : "owner_declined";
  job.decisionStatus = job.status;
  job.ownerDecisionAt = occurredAt;
  job.ownerDecisionReason = reason;
  if (accepted) {
    job.ownerAcceptedCandidateSha256 = job.candidateSha256;
    job.ownerSelectionCopyStatus = "pending_private_copy";
  } else {
    job.ownerDeclinedCandidateSha256 = job.candidateSha256;
    job.ownerReplacementRequired = true;
  }
  const ownerDecision = {
    batchId,
    reviewNumber: entry.reviewNumber,
    sceneId: entry.sceneId,
    candidateSha256: job.candidateSha256,
    decision: accepted ? "owner_accepted" : "owner_declined",
    occurredAt,
    reason,
    candidatePath: path.relative(repositoryRoot, entry.candidatePath).replace(/\\/g, "/"),
    ownerSelectedStorageKey: job.ownerSelectedStorageKey,
    publicationStatus: accepted ? "private_copy_pending_not_published" : "rejected_not_publishable"
  };
  newOwnerDecisions.push(ownerDecision);
  newEvents.push({
    type: accepted ? "styled_candidate_owner_accepted" : "styled_candidate_owner_declined",
    occurredAt,
    status: ownerDecision.decision,
    batchId,
    reviewNumber: entry.reviewNumber,
    sceneId: entry.sceneId,
    asin: job.asin,
    styleSlug: job.styleSlug,
    slot: job.slot,
    candidateOrdinal: job.candidateOrdinal,
    candidateSha256: job.candidateSha256,
    ownerSelectedStorageKey: job.ownerSelectedStorageKey,
    reason,
    publicationStatus: ownerDecision.publicationStatus
  });
}

const allOwnerDecisions = [...existingOwnerDecisions, ...newOwnerDecisions];
const acceptedJobs = jobs.filter((job) => job.kind === "styled" && job.status === "owner_accepted");
const selectedKeys = new Set<string>();
let copiedApprovedCount = 0;
for (const job of acceptedJobs) {
  const selectedKey = String(job.ownerSelectedStorageKey ?? "");
  if (!selectedKey || selectedKeys.has(selectedKey)) {
    throw new Error(`Owner-selected storage key is missing or duplicated: ${selectedKey}`);
  }
  selectedKeys.add(selectedKey);
  const candidatePath = repositoryPath(repositoryRoot, path.join("output", String(job.storageKey)));
  const selectedPath = repositoryPath(repositoryRoot, path.join("output", selectedKey));
  if (!fs.existsSync(candidatePath) || sha256File(candidatePath) !== job.candidateSha256) {
    throw new Error(`${job.sceneId} cannot be copied because its candidate hash is invalid.`);
  }
  if (fs.existsSync(selectedPath) && sha256File(selectedPath) !== job.candidateSha256) {
    throw new Error(`${job.sceneId} would overwrite a different owner-selected asset at ${selectedKey}.`);
  }
  fs.mkdirSync(path.dirname(selectedPath), { recursive: true });
  if (!fs.existsSync(selectedPath)) fs.copyFileSync(candidatePath, selectedPath);
  if (sha256File(selectedPath) !== job.candidateSha256) {
    throw new Error(`${job.sceneId} private owner-selected copy failed hash verification.`);
  }
  job.ownerSelectionCopyStatus = "copied_private_publication_not_authorized";
  job.ownerSelectedPrivatePath = path.relative(repositoryRoot, selectedPath).replace(/\\/g, "/");
  const decision = allOwnerDecisions.find(
    (candidate) => candidate.sceneId === job.sceneId && candidate.decision === "owner_accepted"
  );
  if (decision) {
    decision.publicationStatus = "owner_selected_private_copy_not_published";
    decision.ownerSelectedPrivatePath = job.ownerSelectedPrivatePath;
  }
  copiedApprovedCount += 1;
}

ledger.styledGeneration.ownerDecisions = allOwnerDecisions;
ledger.styledGeneration.ownerAccepted = acceptedJobs.length;
ledger.styledGeneration.ownerDeclined = jobs.filter(
  (job) => job.kind === "styled" && job.status === "owner_declined"
).length;
ledger.styledGeneration.assistantPassedOwnerPending = jobs.filter(
  (job) => job.kind === "styled" && job.status === "assistant_pass_owner_pending"
).length;
ledger.styledGeneration.replacementNeeded =
  Number(ledger.styledGeneration.replacementNeeded ?? 0) +
  normalizedDecisions.filter((decision) => decision.decision === "DENY").length;
ledger.updatedAt = occurredAt;
ledger.events.push(...newEvents);

const approvedCount = normalizedDecisions.filter((decision) => decision.decision === "APPROVE").length;
const deniedCount = normalizedDecisions.length - approvedCount;
const sourceFileSha256 = sha256File(decisionFile);
const batchSha256BeforeDecisions = sha256File(batchPath);
const reviewIndexSha256 = sha256File(reviewIndexPath);
const receipt = {
  schemaVersion: "affiliate-pilot-v4-owner-decision-receipt-v1",
  batchId,
  importedAt: occurredAt,
  sourceFileName: path.basename(decisionFile),
  sourceFileSha256,
  batchSha256BeforeDecisions,
  reviewIndexSha256,
  summary: {
    total: normalizedDecisions.length,
    approved: approvedCount,
    denied: deniedCount,
    denialsWithReasons: normalizedDecisions.filter(
      (decision) => decision.decision === "DENY" && Boolean(decision.note)
    ).length,
    privateApprovedCopies: copiedApprovedCount,
    publicationStatus: "not_authorized_not_published"
  },
  decisions: newOwnerDecisions
};
batch.status = "owner_decisions_applied";
batch.ownerDecisionReceiptPath = path.relative(repositoryRoot, normalizedReceiptPath).replace(/\\/g, "/");
batch.ownerDecisionSummary = receipt.summary;

fs.copyFileSync(decisionFile, rawReceiptPath);
if (sha256File(rawReceiptPath) !== sourceFileSha256) throw new Error("Raw owner-decision receipt copy failed.");
writeJsonAtomic(normalizedReceiptPath, receipt);
writeJsonAtomic(batchPath, batch);
writeJsonAtomic(manifestPath, manifest);
writeJsonAtomic(ledgerPath, ledger);

process.stdout.write(
  `Applied ${batchId}: ${approvedCount} approved, ${deniedCount} denied, ${copiedApprovedCount} total private owner-selected copies; nothing published.\n`
);
