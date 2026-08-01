import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp") as any;

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

function writeJson(filePath: string, value: JsonRecord): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const asin = argument("asin");
const styleSlug = argument("style");
const audit = argument("audit");
const repositoryRoot = process.cwd();
const outputRoot = path.join(repositoryRoot, "output");
const manifestPath = path.join(outputRoot, "affiliate-pilot", "v4", "manifest.json");
const ledgerPath = path.join(outputRoot, "affiliate-pilot", "v4", "execution-log.json");
const manifest = readJson(manifestPath);
const ledger = readJson(ledgerPath);
const lock = ledger.styledGeneration?.identityLock as JsonRecord | undefined;
if (!lock) throw new Error("Styled identity lock is missing.");
const identityCallCount = (ledger.identityGeneration.calls as JsonRecord[]).length;
if (identityCallCount !== lock.identityCallCount) {
  throw new Error("Identity-call ledger changed during styled generation.");
}

const setJobs = (manifest.jobs as JsonRecord[]).filter(
  (job) =>
    job.kind === "styled" &&
    job.asin === asin &&
    job.styleSlug === styleSlug &&
    job.decisionStatus === "assistant_pass_owner_pending"
);
const selectedJobs: JsonRecord[] = [];
for (let slot = 1; slot <= 5; slot += 1) {
  const candidates = setJobs
    .filter((job) => job.slot === slot)
    .sort((left, right) => Number(right.candidateOrdinal) - Number(left.candidateOrdinal));
  if (candidates.length === 0) throw new Error(`${asin}/${styleSlug} slot ${slot} has no assistant-pass owner-pending candidate.`);
  selectedJobs.push(candidates[0]);
}

for (const key of ["roomArchetypeId", "cameraId", "lightingId", "budgetId", "occupancyId", "materialId"]) {
  if (new Set(selectedJobs.map((job) => job.diversityPlan?.[key])).size !== 5) {
    throw new Error(`${asin}/${styleSlug} proof set does not contain five distinct ${key} values.`);
  }
}

const calls = ledger.styledGeneration.calls as JsonRecord[];
const files: JsonRecord[] = [];
for (const job of selectedJobs) {
  const call = calls.find((candidate) => candidate.jobId === job.id && candidate.decision === "assistant_pass_owner_pending");
  if (!call) throw new Error(`${job.sceneId} has no matching passed styled call.`);
  if (call.identityCallCountAtGeneration !== lock.identityCallCount || call.styledIdentityGenerationCallCount !== 0) {
    throw new Error(`${job.sceneId} was not generated under the locked no-new-identity condition.`);
  }
  const filePath = path.join(outputRoot, String(job.storageKey));
  if (!fs.existsSync(filePath) || sha256File(filePath) !== call.candidateSha256) {
    throw new Error(`${job.sceneId} candidate is missing or hash-invalid.`);
  }
  const metadata = await sharp(filePath).metadata();
  if (metadata.width !== 1024 || metadata.height !== 1536) {
    throw new Error(`${job.sceneId} is not 1024x1536.`);
  }
  files.push({
    sceneId: job.sceneId,
    slot: job.slot,
    candidateOrdinal: job.candidateOrdinal,
    path: path.relative(repositoryRoot, filePath).replace(/\\/g, "/"),
    sha256: call.candidateSha256,
    styledProviderCallOrdinal: call.providerCallOrdinal,
    diversityPlan: job.diversityPlan
  });
}
if (new Set(files.map((file) => file.sha256)).size !== 5) {
  throw new Error(`${asin}/${styleSlug} proof set must contain five unique candidate files.`);
}

const setReviews = ledger.styledGeneration.setReviews as JsonRecord[];
if (setReviews.some((review) => review.asin === asin && review.styleSlug === styleSlug)) {
  throw new Error(`${asin}/${styleSlug} already has a set review.`);
}
const occurredAt = new Date().toISOString();
const review = {
  asin,
  styleSlug,
  occurredAt,
  decision: "assistant_pass_owner_pending",
  audit,
  candidateCount: 5,
  uniqueHashCount: 5,
  identityCallCountAtUnlock: lock.identityCallCount,
  identityCallCountAfterProof: identityCallCount,
  identityGenerationCallsDuringStyledProof: 0,
  styledProviderCallOrdinals: files.map((file) => file.styledProviderCallOrdinal),
  files
};
setReviews.push(review);
ledger.styledGeneration.setReviews = setReviews;
ledger.styledGeneration.fiveSceneProof = ledger.styledGeneration.fiveSceneProof ?? review;
ledger.status = "five_scene_proof_complete_styled_generation_active";
ledger.updatedAt = occurredAt;
ledger.events.push({
  type: "five_scene_identity_pack_proof_completed",
  occurredAt,
  status: "assistant_pass_owner_pending",
  asin,
  styleSlug,
  candidateCount: 5,
  identityCallCountAtUnlock: lock.identityCallCount,
  identityCallCountAfterProof: identityCallCount,
  identityGenerationCallsDuringStyledProof: 0
});
manifest.status = "five_scene_proof_complete_styled_generation_active";
manifest.fiveSceneProof = {
  asin,
  styleSlug,
  occurredAt,
  decision: review.decision,
  identityGenerationCallsDuringStyledProof: 0,
  sceneIds: files.map((file) => file.sceneId)
};
writeJson(manifestPath, manifest);
writeJson(ledgerPath, ledger);
process.stdout.write(
  `${asin}/${styleSlug}: five-scene proof complete, 5/5 unique owner-pending candidates, identity calls ${identityCallCount}->${identityCallCount}, styled identity generation calls 0.\n`
);
