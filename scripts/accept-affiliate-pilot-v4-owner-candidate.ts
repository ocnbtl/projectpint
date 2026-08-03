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
  const tempPath = `${filePath}.${process.pid}.owner-accept.tmp`;
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

const sceneId = argument("scene-id");
const reason = argument("reason");
const repositoryRoot = process.cwd();
const outputRoot = path.join(repositoryRoot, "output");
const manifestPath = path.join(outputRoot, "affiliate-pilot", "v4", "manifest.json");
const ledgerPath = path.join(outputRoot, "affiliate-pilot", "v4", "execution-log.json");
const manifest = readJson(manifestPath);
const ledger = readJson(ledgerPath);

if (manifest.ownerSelectionRequired !== true || manifest.assistantAcceptanceIsFinal !== false) {
  throw new Error("Manifest owner-selection semantics are missing or unsafe.");
}

const jobs = manifest.jobs as JsonRecord[];
const job = jobs.find((candidate) => candidate.kind === "styled" && candidate.sceneId === sceneId);
if (!job) throw new Error(`No styled job exists for scene ${sceneId}.`);
if (job.status !== "assistant_pass_owner_pending" || job.decisionStatus !== "assistant_pass_owner_pending") {
  throw new Error(`${sceneId} is not owner-pending; current state is ${job.status}/${job.decisionStatus}.`);
}
if (job.ownerApprovalRequired !== true) throw new Error(`${sceneId} does not require explicit owner approval.`);
if (!job.candidateSha256 || !job.generationEvidencePath || !job.storageKey || !job.ownerSelectedStorageKey) {
  throw new Error(`${sceneId} is missing candidate, evidence, or owner-selection metadata.`);
}

const identityCalls = ledger.identityGeneration?.calls as JsonRecord[] | undefined;
const lock = ledger.styledGeneration?.identityLock as JsonRecord | undefined;
if (!Array.isArray(identityCalls) || !lock) throw new Error("Styled identity-lock evidence is missing.");
if (lock.styledIdentityGenerationAllowed !== false || identityCalls.length !== Number(lock.identityCallCount)) {
  throw new Error("Identity-call ledger changed after the styled identity lock.");
}
if (Number(job.identityCallCountAtUnlock) !== identityCalls.length) {
  throw new Error(`${sceneId} does not reference the current identity-lock boundary.`);
}

const candidatePath = repositoryPath(repositoryRoot, path.join("output", String(job.storageKey)));
if (!fs.existsSync(candidatePath) || sha256File(candidatePath) !== job.candidateSha256) {
  throw new Error(`${sceneId} candidate is missing or hash-invalid.`);
}

const generationEvidencePath = repositoryPath(repositoryRoot, String(job.generationEvidencePath));
if (!fs.existsSync(generationEvidencePath)) throw new Error(`${sceneId} generation evidence is missing.`);
const generationEvidence = readJson(generationEvidencePath);
if (
  generationEvidence.sceneId !== sceneId ||
  generationEvidence.jobId !== job.id ||
  generationEvidence.decision !== "assistant_pass_owner_pending" ||
  generationEvidence.candidateSha256 !== job.candidateSha256 ||
  generationEvidence.promptSha256 !== job.promptSha256 ||
  sha256(String(generationEvidence.exactPrompt)) !== job.promptSha256 ||
  Number(generationEvidence.identityCallCountAtGeneration) !== identityCalls.length ||
  Number(generationEvidence.styledIdentityGenerationCallCount) !== 0
) {
  throw new Error(`${sceneId} generation evidence does not match the pending candidate contract.`);
}

const styledCalls = ledger.styledGeneration?.calls as JsonRecord[] | undefined;
if (!Array.isArray(styledCalls)) throw new Error("Styled call evidence is missing.");
const matchingCalls = styledCalls.filter(
  (call) =>
    call.jobId === job.id &&
    call.sceneId === sceneId &&
    call.decision === "assistant_pass_owner_pending" &&
    call.candidateSha256 === job.candidateSha256
);
if (matchingCalls.length !== 1) throw new Error(`${sceneId} must have exactly one matching pending styled call.`);
const call = matchingCalls[0];
if (
  Number(call.identityCallCountAtGeneration) !== identityCalls.length ||
  Number(call.styledIdentityGenerationCallCount) !== 0
) {
  throw new Error(`${sceneId} styled-call identity evidence is invalid.`);
}

const ownerDecisions = (ledger.styledGeneration.ownerDecisions ?? []) as JsonRecord[];
if (ownerDecisions.some((decision) => decision.sceneId === sceneId)) {
  throw new Error(`${sceneId} already has an owner decision.`);
}
const recordedOwnerAccepted = Number(ledger.styledGeneration.ownerAccepted ?? 0);
const acceptedDecisionCount = ownerDecisions.filter((decision) => decision.decision === "owner_accepted").length;
if (recordedOwnerAccepted !== acceptedDecisionCount) {
  throw new Error(
    `Owner-accepted counter drift: counter=${recordedOwnerAccepted}, decisions=${acceptedDecisionCount}.`
  );
}

const occurredAt = new Date().toISOString();
const ownerDecision = {
  sceneId,
  candidateSha256: job.candidateSha256,
  decision: "owner_accepted",
  occurredAt,
  reason,
  candidatePath: path.relative(repositoryRoot, candidatePath).replace(/\\/g, "/"),
  ownerSelectedStorageKey: job.ownerSelectedStorageKey,
  publicationStatus: "not_authorized_not_copied"
};

job.status = "owner_accepted";
job.decisionStatus = "owner_accepted";
job.ownerDecisionAt = occurredAt;
job.ownerDecisionReason = reason;
job.ownerAcceptedCandidateSha256 = job.candidateSha256;
job.ownerSelectionCopyStatus = "not_copied_publication_not_authorized";
ledger.styledGeneration.ownerAccepted = recordedOwnerAccepted + 1;
ledger.styledGeneration.ownerDecisions = [...ownerDecisions, ownerDecision];
ledger.updatedAt = occurredAt;
ledger.events.push({
  type: "styled_candidate_owner_accepted",
  occurredAt,
  status: "owner_accepted",
  sceneId,
  asin: job.asin,
  styleSlug: job.styleSlug,
  slot: job.slot,
  candidateOrdinal: job.candidateOrdinal,
  candidateSha256: job.candidateSha256,
  ownerSelectedStorageKey: job.ownerSelectedStorageKey,
  publicationStatus: "not_authorized_not_copied"
});

writeJsonAtomic(manifestPath, manifest);
writeJsonAtomic(ledgerPath, ledger);
process.stdout.write(
  `${sceneId}: owner_accepted; verified ${job.candidateSha256}; owner-selected publication path not copied.\n`
);
