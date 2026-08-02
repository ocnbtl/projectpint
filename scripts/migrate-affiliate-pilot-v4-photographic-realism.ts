import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { affiliateApprovedCohortFixture } from "../lib/affiliate-catalog.ts";
import { buildAffiliatePilotV4Manifest } from "../lib/affiliate-pilot-v4.ts";

type JsonRecord = Record<string, any>;

const APPLY_FLAG = "--apply-owner-feedback";
const EXPECTED_OLD_PROMPT_VERSION = "affiliate-pilot-evidence-pool-v4.61";
const EXPECTED_NEW_PROMPT_VERSION = "affiliate-pilot-photographic-realism-v4.70";
const OWNER_REASON =
  "Owner declined the first fifteen run-06 passes as a corpus: they still looked synthetic, repeated beige-white-wood rooms and the same plant-towel-rug staging grammar, lacked strong theme separation, and made products look enlarged or pasted in.";

function readJson(filePath: string): JsonRecord {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")) as JsonRecord;
}

function writeJsonAtomic(filePath: string, value: JsonRecord): void {
  const tempPath = `${filePath}.v470.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function key(job: JsonRecord): string {
  return `${job.asin}:${job.styleSlug}:${job.slot}`;
}

function nextCandidatePath(storageKey: string, slot: number, ordinal: number): string {
  const next = storageKey.replace(
    /scene-\d{2}-candidate-\d{2}\.png$/,
    `scene-${String(slot).padStart(2, "0")}-candidate-${String(ordinal).padStart(2, "0")}.png`
  );
  if (next === storageKey) throw new Error(`Unable to version candidate path ${storageKey}.`);
  return next;
}

if (!process.argv.includes(APPLY_FLAG)) {
  throw new Error(`Refusing to mutate run evidence without ${APPLY_FLAG}.`);
}

const repositoryRoot = process.cwd();
const v4Root = path.join(repositoryRoot, "output", "affiliate-pilot", "v4");
const manifestPath = path.join(v4Root, "manifest.json");
const ledgerPath = path.join(v4Root, "execution-log.json");
const manifest = readJson(manifestPath);
const ledger = readJson(ledgerPath);

if (manifest.generationVersion !== "pilot-2026-08-01-run-06") {
  throw new Error(`Unexpected generation version ${manifest.generationVersion}.`);
}
if (
  manifest.promptVersion !== EXPECTED_OLD_PROMPT_VERSION &&
  manifest.promptVersion !== EXPECTED_NEW_PROMPT_VERSION
) {
  throw new Error(`Unexpected active prompt version ${manifest.promptVersion}.`);
}
if (manifest.promptVersion === EXPECTED_NEW_PROMPT_VERSION) {
  throw new Error("The photographic-realism migration is already applied.");
}

const templates = buildAffiliatePilotV4Manifest(affiliateApprovedCohortFixture());
if (templates.promptVersion !== EXPECTED_NEW_PROMPT_VERSION) {
  throw new Error(`Source templates are not at ${EXPECTED_NEW_PROMPT_VERSION}.`);
}
const templateByKey = new Map(
  (templates.jobs as JsonRecord[])
    .filter((job) => job.kind === "styled")
    .map((job) => [key(job), job])
);

const jobs = manifest.jobs as JsonRecord[];
const queuedBaseJobs = jobs.filter(
  (job) =>
    job.kind === "styled" &&
    job.status === "queued" &&
    job.decisionStatus === "queued" &&
    Number(job.candidateOrdinal) === 1
);
const queuedReplacementJobs = jobs.filter(
  (job) => job.kind === "styled" && job.status === "queued" && Number(job.candidateOrdinal) > 1
);
const ownerPending = jobs.filter(
  (job) =>
    job.kind === "styled" &&
    job.status === "assistant_pass_owner_pending" &&
    job.decisionStatus === "assistant_pass_owner_pending"
);

if (queuedBaseJobs.length !== 585 || queuedReplacementJobs.length !== 0 || ownerPending.length !== 15) {
  throw new Error(
    `Expected the verified batch boundary of 585 queued base jobs, zero queued replacements, and 15 owner-pending jobs; received ${queuedBaseJobs.length}, ${queuedReplacementJobs.length}, and ${ownerPending.length}.`
  );
}

const snapshotRoot = path.join(
  v4Root,
  "private-evidence",
  "prompt-calibration",
  "affiliate-pilot-photographic-realism-v4.70",
  "pre-migration"
);
if (fs.existsSync(snapshotRoot)) {
  throw new Error(`Refusing to overwrite existing pre-migration evidence at ${snapshotRoot}.`);
}
fs.mkdirSync(snapshotRoot, { recursive: true });
fs.copyFileSync(manifestPath, path.join(snapshotRoot, "manifest-v4.61.json"));
fs.copyFileSync(ledgerPath, path.join(snapshotRoot, "execution-log-v4.61.json"));

for (const job of queuedBaseJobs) {
  const template = templateByKey.get(key(job));
  if (!template) throw new Error(`Missing v4.70 template for ${key(job)}.`);
  job.promptVersion = template.promptVersion;
  job.prompt = template.prompt;
  job.promptSha256 = template.promptSha256;
  job.qaFocus = template.qaFocus;
  job.diversityPlan = template.diversityPlan;
}

const occurredAt = new Date().toISOString();
const replacements: JsonRecord[] = [];
for (const sourceJob of ownerPending) {
  const template = templateByKey.get(key(sourceJob));
  if (!template) throw new Error(`Missing v4.70 template for ${key(sourceJob)}.`);
  const siblings = jobs.filter(
    (candidate) =>
      candidate.kind === "styled" &&
      candidate.asin === sourceJob.asin &&
      candidate.styleSlug === sourceJob.styleSlug &&
      Number(candidate.slot) === Number(sourceJob.slot)
  );
  const candidateOrdinal = Math.max(
    ...siblings.map((candidate) => Number(candidate.candidateOrdinal))
  ) + 1;
  const sceneId = `v4-${sourceJob.asin}-${sourceJob.styleSlug}-${String(sourceJob.slot).padStart(2, "0")}-candidate-${String(candidateOrdinal).padStart(2, "0")}`;
  let prompt = String(template.prompt).replace(
    /^Scene identity: .*$/m,
    `Scene identity: ${sceneId}; corpus diversity seed: ${template.diversityPlan.corpusSeed}.`
  );
  prompt = prompt.replace(
    "Decision semantics:",
    `Owner-feedback replacement: ${sourceJob.sceneId} was declined under the corpus-wide photographic-realism reset. Generate a genuinely new bathroom from the v4.70 concrete direction; do not repair or imitate the declined image.\nDecision semantics:`
  );
  sourceJob.status = "owner_declined";
  sourceJob.decisionStatus = "owner_declined";
  sourceJob.ownerDecisionAt = occurredAt;
  sourceJob.ownerDecisionReason = OWNER_REASON;
  replacements.push({
    ...sourceJob,
    ...template,
    id: `${sourceJob.productId}:${sourceJob.styleSlug}:${sourceJob.slot}:candidate:${candidateOrdinal}`,
    candidateOrdinal,
    sceneId,
    storageKey: nextCandidatePath(
      String(sourceJob.storageKey),
      Number(sourceJob.slot),
      candidateOrdinal
    ),
    referencePackVersion: sourceJob.referencePackVersion,
    referencePackSha256: sourceJob.referencePackSha256,
    identityCallCountAtUnlock: sourceJob.identityCallCountAtUnlock,
    prompt,
    promptSha256: sha256(prompt),
    status: "queued",
    decisionStatus: "queued",
    generationStrategy: "fresh_owner_feedback_replacement_room_candidate",
    replacementForCandidateId: sourceJob.id,
    replacementForCandidateSha256: sourceJob.candidateSha256,
    replacementCause: "owner_global_photographic_realism_reset",
    ownerDecisionAt: undefined,
    ownerDecisionReason: undefined,
    candidateSha256: undefined,
    generationEvidencePath: undefined
  });
}
jobs.push(...replacements);

for (const review of (ledger.styledGeneration.setReviews ?? []) as JsonRecord[]) {
  if (review.decision === "assistant_pass_owner_pending") {
    review.ownerStatus = "owner_declined";
    review.ownerDecisionAt = occurredAt;
    review.ownerDecisionReason = OWNER_REASON;
  }
}

manifest.promptVersion = templates.promptVersion;
manifest.contract = templates.contract;
manifest.visualQaRubric = templates.visualQaRubric;
manifest.styledReplacementGenerationRequestedCount =
  Number(manifest.styledReplacementGenerationRequestedCount ?? 0) + replacements.length;
manifest.status = "styled_generation_queued";
manifest.jobs = jobs;

ledger.updatedAt = occurredAt;
ledger.status = "styled_generation_queued";
ledger.styledGeneration.ownerDeclined =
  Number(ledger.styledGeneration.ownerDeclined ?? 0) + ownerPending.length;
ledger.styledGeneration.replacementNeeded =
  Number(ledger.styledGeneration.replacementNeeded ?? 0) + replacements.length;
ledger.styledGeneration.replacementQueued =
  Number(ledger.styledGeneration.replacementQueued ?? 0) + replacements.length;
ledger.events.push({
  type: "owner_photographic_realism_feedback_recorded",
  occurredAt,
  priorPromptVersion: EXPECTED_OLD_PROMPT_VERSION,
  activePromptVersion: EXPECTED_NEW_PROMPT_VERSION,
  ownerDeclinedSceneIds: ownerPending.map((job) => job.sceneId),
  queuedReplacementSceneIds: replacements.map((job) => job.sceneId),
  migratedQueuedBaseJobCount: queuedBaseJobs.length,
  reason: OWNER_REASON
});

writeJsonAtomic(manifestPath, manifest);
writeJsonAtomic(ledgerPath, ledger);
process.stdout.write(
  `Applied ${EXPECTED_NEW_PROMPT_VERSION}: migrated ${queuedBaseJobs.length} queued base prompts, owner-declined ${ownerPending.length} prior passes, and queued ${replacements.length} fresh replacements.\n`
);
