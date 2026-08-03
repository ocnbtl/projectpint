import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { affiliateApprovedCohortFixture } from "../lib/affiliate-catalog.ts";
import { buildAffiliatePilotV4Manifest } from "../lib/affiliate-pilot-v4.ts";

type JsonRecord = Record<string, any>;

const APPLY_FLAG = "--apply-owner-feedback";
const EXPECTED_OLD_PROMPT_VERSION = "affiliate-pilot-photographic-realism-v4.70";
const EXPECTED_NEW_PROMPT_VERSION = "affiliate-pilot-lived-in-iphone-realism-v4.71";
const EXPECTED_OWNER_PENDING_SCENES = [
  "v4-B0DC7VG6Z9-japandi-02-candidate-02",
  "v4-B000MS63E2-modern-marble-03-candidate-02"
] as const;

const ownerFeedbackByScene: Record<string, string> = {
  "v4-B0DC7VG6Z9-japandi-02-candidate-02":
    "Owner rejected the Bambusi/Japandi candidate because the blue paint and bamboo bench finish look too perfect, the room does not look fully photorealistic or lived in, and the capture does not read as an ordinary iPhone photograph.",
  "v4-B000MS63E2-modern-marble-03-candidate-02":
    "Owner rejected the Creative Home/Modern Marble candidate because the wood cabinet grain looks too perfect, repetitive, and fractal; the room does not look fully photorealistic or lived in, and the capture does not read as an ordinary iPhone photograph."
};

const replacementOverrides: Record<string, JsonRecord> = {
  "v4-B0DC7VG6Z9-japandi-02-candidate-02": {
    roomArchetype: "small 1980s hall bathroom with a separate tub-shower, cramped vanity wall, older frosted window, and mixed-age repairs",
    camera: "quick chest-height iPhone 11 main 1x snapshot from the open doorway with slight clockwise roll, a clipped jamb, and converging verticals",
    lighting: "flat rainy-morning window light mixed unevenly with one weak warm ceiling globe, leaving a blocked corner and clipped privacy-glass highlight",
    budget: "owner-painted incremental refresh using the retained vanity and ordinary off-the-shelf finishes",
    occupancy: "one damp mismatched towel, a shifted rubber bath mat, and three dried water spots beside the tub control",
    material: "roller-stippled indigo paint with a small toe-kick scuff, aged cream tile with variable grout tone, and bamboo with distinct laminated strips, faint water spots, and nonuniform edge darkening"
  },
  "v4-B000MS63E2-modern-marble-03-candidate-02": {
    roomArchetype: "narrow late-1970s family bathroom with a retained enamel tub, offset medicine cabinet, clay-painted vanity, and a short reused green-marble backsplash strip",
    camera: "casual upper-waist iPhone SE main-camera snapshot from beside the door with a foreground casing edge, loose crop, and imperfect leveling",
    lighting: "uneven late-afternoon daylight through a practical shade with the room light off, producing shadow noise and one clipped window edge",
    budget: "attainable repair-and-paint update retaining the older cabinet box and mixed-age chrome hardware",
    occupancy: "one used soap bar, one hand towel hung at an unrelated angle, and a medicine-cabinet door left slightly open",
    material: "brush-painted clay cabinetry with visible stipple, isolated touch-up sheen, a softened pull edge, and no visible wood grain; unique dark-green marble veins appear only on the short backsplash"
  }
};

const extraEverydayClues = [
  "a faint toothpaste spot low on the mirror",
  "a few dried water spots beside the faucet",
  "one plain hair tie on a dry counter corner",
  "a small wastebasket edge cropped low in frame",
  "one cabinet pull with softened high-touch sheen",
  "one towel hook sitting a few millimeters off level"
] as const;

function readJson(filePath: string): JsonRecord {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")) as JsonRecord;
}

function writeJsonAtomic(filePath: string, value: JsonRecord): void {
  const tempPath = `${filePath}.v471.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function key(job: JsonRecord): string {
  return `${job.asin}:${job.styleSlug}:${job.slot}`;
}

function replacePromptLine(prompt: string, label: string, value: string): string {
  const prefix = `${label}:`;
  const lines = prompt.split("\n");
  const index = lines.findIndex((line) => line.startsWith(prefix));
  if (index < 0) throw new Error(`Cannot migrate prompt; missing ${prefix}`);
  lines[index] = `${prefix} ${value}.`;
  return lines.join("\n");
}

function nextCandidatePath(storageKey: string, slot: number, ordinal: number): string {
  const next = storageKey.replace(
    /scene-\d{2}-candidate-\d{2}\.png$/,
    `scene-${String(slot).padStart(2, "0")}-candidate-${String(ordinal).padStart(2, "0")}.png`
  );
  if (next === storageKey) throw new Error(`Unable to version candidate path ${storageKey}.`);
  return next;
}

function upgradedEverydayEvidence(value: string, sceneId: string): string {
  const cleaned = value
    .replace(/; no other movable styling\.?$/i, "")
    .replace(/\. Use only these clues.*$/i, "")
    .replace(/\.$/, "");
  const clue = extraEverydayClues[Number.parseInt(sha256(sceneId).slice(0, 4), 16) % extraEverydayClues.length];
  return `${cleaned}; plus ${clue}`;
}

function applyDiversity(prompt: string, diversity: JsonRecord): string {
  let migrated = replacePromptLine(prompt, "Concrete scene direction", diversity.themeDirection);
  migrated = replacePromptLine(
    migrated,
    "Room history and budget",
    `${diversity.roomArchetype}; ${diversity.budget}. The room has been used since installation and was not reset for this photograph`
  );
  migrated = replacePromptLine(
    migrated,
    "Camera authenticity",
    `${diversity.camera}; ${diversity.lighting}. Reproduce a default iPhone HEIC/JPEG look with modest computational sharpening and local auto-HDR, slight edge distortion, imperfect leveling, fine luminance and chroma noise in shadows, mixed white balance when lights differ, and at least one partially clipped highlight or blocked shadow; no RAW processing, Lightroom grade, flash balancing, tripod precision, portrait-mode blur, or architectural correction`
  );
  migrated = replacePromptLine(
    migrated,
    "Everyday evidence",
    `${diversity.occupancy}. These clues are functional and uncoordinated; never align, color-match, center, or style them`
  );
  return replacePromptLine(migrated, "Material emphasis", diversity.material);
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
if (manifest.promptVersion !== EXPECTED_OLD_PROMPT_VERSION) {
  throw new Error(`Expected ${EXPECTED_OLD_PROMPT_VERSION}; received ${manifest.promptVersion}.`);
}

const jobs = manifest.jobs as JsonRecord[];
const queued = jobs.filter(
  (job) => job.kind === "styled" && job.status === "queued" && job.decisionStatus === "queued"
);
const ownerPending = jobs.filter(
  (job) =>
    job.kind === "styled" &&
    job.status === "assistant_pass_owner_pending" &&
    job.decisionStatus === "assistant_pass_owner_pending"
);
const hardRejected = jobs.filter((job) => job.kind === "styled" && job.status === "assistant_hard_reject");
const ownerDeclined = jobs.filter((job) => job.kind === "styled" && job.status === "owner_declined");
const actualPendingScenes = ownerPending.map((job) => job.sceneId).sort();
const expectedPendingScenes = [...EXPECTED_OWNER_PENDING_SCENES].sort();

if (
  jobs.length !== 696 ||
  queued.length !== 598 ||
  ownerPending.length !== 2 ||
  hardRejected.length !== 11 ||
  ownerDeclined.length !== 15 ||
  JSON.stringify(actualPendingScenes) !== JSON.stringify(expectedPendingScenes) ||
  (ledger.styledGeneration.calls as JsonRecord[]).length !== 28 ||
  (ledger.identityGeneration.calls as JsonRecord[]).length !== 104
) {
  throw new Error(
    `Unexpected v4.70 boundary: jobs=${jobs.length}, queued=${queued.length}, ownerPending=${ownerPending.length}, hardRejected=${hardRejected.length}, ownerDeclined=${ownerDeclined.length}, styledCalls=${(ledger.styledGeneration.calls as JsonRecord[]).length}, identityCalls=${(ledger.identityGeneration.calls as JsonRecord[]).length}, pendingScenes=${actualPendingScenes.join(",")}.`
  );
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

const snapshotRoot = path.join(
  v4Root,
  "private-evidence",
  "prompt-calibration",
  EXPECTED_NEW_PROMPT_VERSION,
  "pre-migration"
);
if (fs.existsSync(snapshotRoot)) {
  throw new Error(`Refusing to overwrite existing pre-migration evidence at ${snapshotRoot}.`);
}
fs.mkdirSync(snapshotRoot, { recursive: true });
fs.copyFileSync(manifestPath, path.join(snapshotRoot, "manifest-v4.70.json"));
fs.copyFileSync(ledgerPath, path.join(snapshotRoot, "execution-log-v4.70.json"));

for (const job of queued) {
  const template = templateByKey.get(key(job));
  if (!template) throw new Error(`Missing v4.71 template for ${key(job)}.`);
  const diversity = {
    ...job.diversityPlan,
    themeDirectionId: template.diversityPlan.themeDirectionId,
    themeDirection: template.diversityPlan.themeDirection,
    occupancy: upgradedEverydayEvidence(String(job.diversityPlan.occupancy), String(job.sceneId))
  };
  let prompt = String(template.prompt).replace(
    /^Scene identity: .*$/m,
    `Scene identity: ${job.sceneId}; corpus diversity seed: ${job.diversityPlan.corpusSeed}.`
  );
  prompt = applyDiversity(prompt, diversity);
  if (Number(job.candidateOrdinal) > 1) {
    prompt = prompt.replace(
      "Decision semantics:",
      `Replacement separation: this is a fresh physical bathroom for ${job.sceneId}; do not reconstruct, repair, or imitate any earlier candidate in this slot.\nDecision semantics:`
    );
  }
  job.promptVersion = EXPECTED_NEW_PROMPT_VERSION;
  job.prompt = prompt;
  job.promptSha256 = sha256(prompt);
  job.qaFocus = template.qaFocus;
  job.diversityPlan = diversity;
}

const occurredAt = new Date().toISOString();
const replacements: JsonRecord[] = [];
const ownerDecisions: JsonRecord[] = [];
for (const sourceJob of ownerPending) {
  const template = templateByKey.get(key(sourceJob));
  if (!template) throw new Error(`Missing v4.71 template for ${key(sourceJob)}.`);
  const override = replacementOverrides[sourceJob.sceneId];
  const ownerReason = ownerFeedbackByScene[sourceJob.sceneId];
  if (!override || !ownerReason) throw new Error(`Missing exact owner feedback for ${sourceJob.sceneId}.`);
  const siblings = jobs.filter(
    (candidate) =>
      candidate.kind === "styled" &&
      candidate.asin === sourceJob.asin &&
      candidate.styleSlug === sourceJob.styleSlug &&
      Number(candidate.slot) === Number(sourceJob.slot)
  );
  const candidateOrdinal = Math.max(...siblings.map((candidate) => Number(candidate.candidateOrdinal))) + 1;
  const sceneId = `v4-${sourceJob.asin}-${sourceJob.styleSlug}-${String(sourceJob.slot).padStart(2, "0")}-candidate-${String(candidateOrdinal).padStart(2, "0")}`;
  const corpusSeed = sha256(`${sourceJob.sceneId}:${candidateOrdinal}:owner-lived-in-iphone-v4.71`).slice(0, 20);
  const diversity = {
    ...template.diversityPlan,
    corpusSeed,
    roomArchetypeId: `owner-replacement-room-${corpusSeed}`,
    roomArchetype: override.roomArchetype,
    cameraId: `owner-replacement-camera-${corpusSeed}`,
    camera: override.camera,
    lightingId: `owner-replacement-light-${corpusSeed}`,
    lighting: override.lighting,
    budgetId: `owner-replacement-budget-${corpusSeed}`,
    budget: override.budget,
    occupancyId: `owner-replacement-occupancy-${corpusSeed}`,
    occupancy: override.occupancy,
    materialId: `owner-replacement-material-${corpusSeed}`,
    material: override.material
  };
  let prompt = String(template.prompt).replace(
    /^Scene identity: .*$/m,
    `Scene identity: ${sceneId}; corpus diversity seed: ${corpusSeed}.`
  );
  prompt = applyDiversity(prompt, diversity);
  prompt = prompt.replace(
    "Decision semantics:",
    `Owner-feedback replacement: ${sourceJob.sceneId} was explicitly declined for perfect or repetitive materials, insufficient lived-in evidence, and non-iPhone polish. Generate a genuinely different physical bathroom from scratch; do not repair, reconstruct, or imitate the declined image. The material and camera corrections in this v4.71 prompt are mandatory.\nDecision semantics:`
  );

  sourceJob.status = "owner_declined";
  sourceJob.decisionStatus = "owner_declined";
  sourceJob.ownerDecisionAt = occurredAt;
  sourceJob.ownerDecisionReason = ownerReason;
  ownerDecisions.push({
    sceneId: sourceJob.sceneId,
    candidateSha256: sourceJob.candidateSha256,
    decision: "owner_declined",
    occurredAt,
    reason: ownerReason
  });

  replacements.push({
    ...sourceJob,
    ...template,
    id: `${sourceJob.productId}:${sourceJob.styleSlug}:${sourceJob.slot}:candidate:${candidateOrdinal}`,
    candidateOrdinal,
    sceneId,
    storageKey: nextCandidatePath(String(sourceJob.storageKey), Number(sourceJob.slot), candidateOrdinal),
    referencePackVersion: sourceJob.referencePackVersion,
    referencePackSha256: sourceJob.referencePackSha256,
    identityCallCountAtUnlock: sourceJob.identityCallCountAtUnlock,
    promptVersion: EXPECTED_NEW_PROMPT_VERSION,
    prompt,
    promptSha256: sha256(prompt),
    qaFocus: template.qaFocus,
    diversityPlan: diversity,
    status: "queued",
    decisionStatus: "queued",
    generationStrategy: "fresh_owner_lived_in_iphone_replacement_candidate",
    replacementForCandidateId: sourceJob.id,
    replacementForCandidateSha256: sourceJob.candidateSha256,
    replacementCause: "owner_material_and_iphone_realism_rejection",
    rootRevisionApplied: ownerReason,
    ownerDecisionAt: undefined,
    ownerDecisionReason: undefined,
    candidateSha256: undefined,
    generationEvidencePath: undefined
  });
}
jobs.push(...replacements);

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
ledger.styledGeneration.ownerDecisions = [
  ...((ledger.styledGeneration.ownerDecisions ?? []) as JsonRecord[]),
  ...ownerDecisions
];
ledger.events.push({
  type: "owner_lived_in_iphone_realism_feedback_recorded",
  occurredAt,
  priorPromptVersion: EXPECTED_OLD_PROMPT_VERSION,
  activePromptVersion: EXPECTED_NEW_PROMPT_VERSION,
  ownerDecisions,
  queuedReplacementSceneIds: replacements.map((job) => job.sceneId),
  migratedQueuedJobCount: queued.length,
  reason:
    "Owner rejected both v4.70 pending candidates for perfect or repetitive materials, insufficient lived-in evidence, and captures that did not read as ordinary iPhone photographs."
});

writeJsonAtomic(manifestPath, manifest);
writeJsonAtomic(ledgerPath, ledger);
process.stdout.write(
  `Applied ${EXPECTED_NEW_PROMPT_VERSION}: migrated ${queued.length} queued prompts, owner-declined ${ownerPending.length} candidates, and queued ${replacements.length} fresh lived-in iPhone replacements.\n`
);
