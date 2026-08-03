import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp") as any;

type JsonRecord = Record<string, any>;

function argument(name: string, required = true): string | null {
  const prefix = `--${name}=`;
  const value = process.argv.slice(2).find((entry) => entry.startsWith(prefix))?.slice(prefix.length) ?? null;
  if (required && !value) throw new Error(`Missing --${name}=...`);
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

const sceneId = argument("scene-id")!;
const inputPath = path.resolve(argument("input")!);
const decision = argument("decision")!;
const audit = argument("reason")!;
const rejectionCause = argument("cause", false);
const rootRevision = argument("root-revision", false);
if (decision !== "assistant_pass_owner_pending" && decision !== "assistant_hard_reject") {
  throw new Error("--decision must be assistant_pass_owner_pending or assistant_hard_reject.");
}
if (decision === "assistant_hard_reject" && !rejectionCause) {
  throw new Error("--cause=... is required for an assistant hard reject.");
}
if (!fs.existsSync(inputPath)) throw new Error(`Input image does not exist: ${inputPath}`);

const repositoryRoot = process.cwd();
const outputRoot = path.join(repositoryRoot, "output");
const manifestPath = path.join(outputRoot, "affiliate-pilot", "v4", "manifest.json");
const ledgerPath = path.join(outputRoot, "affiliate-pilot", "v4", "execution-log.json");
const manifest = readJson(manifestPath);
const ledger = readJson(ledgerPath);
const jobs = manifest.jobs as JsonRecord[];
const job = jobs.find((candidate) => candidate.kind === "styled" && candidate.sceneId === sceneId);
if (!job) throw new Error(`No styled job exists for scene ${sceneId}.`);
if (job.status !== "queued" || job.decisionStatus !== "queued") {
  throw new Error(`${sceneId} is not queued; current state is ${job.status}/${job.decisionStatus}.`);
}

const lock = ledger.styledGeneration?.identityLock as JsonRecord | undefined;
if (!lock) throw new Error("Styled generation is not identity-locked; run prepare:styled:affiliate-pilot-v4 first.");
const currentIdentityCallCount = (ledger.identityGeneration.calls as JsonRecord[]).length;
if (lock.styledIdentityGenerationAllowed !== false || currentIdentityCallCount !== lock.identityCallCount) {
  throw new Error("Identity-call ledger changed after styled unlock; styled generation is blocked.");
}
const pack = (ledger.identityGeneration.packs as JsonRecord[]).find((candidate) => candidate.asin === job.asin);
if (!pack || pack.decision !== "assistant_pass" || pack.atlasSha256 !== job.referencePackSha256) {
  throw new Error(`${sceneId} does not reference the current reviewed identity atlas.`);
}
const atlasPath = path.join(repositoryRoot, String(pack.atlasPath));
if (!fs.existsSync(atlasPath) || sha256File(atlasPath) !== pack.atlasSha256) {
  throw new Error(`${sceneId} reviewed atlas is missing or hash-invalid.`);
}

const metadata = await sharp(inputPath).metadata();
if (metadata.format !== "png") {
  throw new Error(`${sceneId} provider output must be a PNG.`);
}
if (
  decision === "assistant_pass_owner_pending" &&
  (metadata.width !== 1024 || metadata.height !== 1536)
) {
  throw new Error(`${sceneId} owner-pending provider output must be exactly 1024x1536.`);
}
const inputSha256 = sha256File(inputPath);
const candidatePath = path.join(outputRoot, String(job.storageKey));
if (fs.existsSync(candidatePath)) throw new Error(`Candidate output already exists: ${candidatePath}`);

const replacementOptions = {
  room: [
    "compact basement shower room built around a shallow window well",
    "narrow 1980s hall bathroom retaining its original enamel tub",
    "small postwar bungalow bathroom with an offset linen alcove",
    "modest ranch ensuite with a long, asymmetric circulation path",
    "century-home bathroom adapted around original door and window casings",
    "compact apartment bathroom shaped by a masonry service chase"
  ],
  camera: [
    "chest-height iPhone 11 main-camera view from the sink side with a clipped door casing and slight roll",
    "casual iPhone 12 main-camera view from beside the tub, avoiding a centered one-point composition",
    "quick doorway-side iPhone SE view angled across the short dimension with imperfect leveling",
    "waist-height iPhone 13 mini wide-camera view from the vanity return with retained edge stretch",
    "off-center iPhone 11 snapshot from an open circulation pocket with one foreground interruption",
    "slightly elevated iPhone 12 snapshot looking diagonally past a retained fixture without architectural correction"
  ],
  lighting: [
    "cool overcast window light mixed imperfectly with one neutral ceiling practical",
    "rainy-morning window light with a weak warm doorway spill",
    "soft noon light through privacy glass with restrained ceiling fill",
    "single warm ceiling globe balanced against dim blue evening window light",
    "early-morning side light with ordinary phone highlight clipping near the window",
    "diffuse north-window light with a modest warm vanity-lamp color shift"
  ],
  budget: [
    "modest owner-maintained room with the original fixture layout and a careful DIY refresh",
    "attainable mid-range update that retains one visibly older built-in element",
    "low-cost repair-and-paint refresh using ordinary off-the-shelf finishes",
    "practical family-budget renovation that prioritizes durability over decorative matching",
    "incremental update assembled over several years without a coordinated suite",
    "restrained rental-friendly refresh with reversible hardware and textiles"
  ],
  occupancy: [
    "one damp towel, a partly opened window, and dried water spots beside the faucet",
    "one supported garment, a shifted bath mat, and a plain hair tie on a dry ledge",
    "one used washcloth on a dry ledge, one open cabinet door, and a small wastebasket edge cropped low",
    "two nonmatching grooming clues partly below the sightline and one faint toothpaste spot low on the mirror",
    "one casually reused towel, an open interior door, and a few water drops on the shower sill",
    "one displaced mat, the cropped edge of a laundry hamper, and one cabinet pull with softened touch wear"
  ],
  material: [
    "roller-stippled painted plaster and small-format matte floor tile with irregular but coherent grout",
    "original ceramic wall tile beside newer sheet flooring with plausible seams, water spotting, and unrelated wear",
    "laminate cabinetry, enamel, and brush-painted walls with isolated touch-up sheen and ordinary edge wear",
    "privacy glass, ceramic tile, and board-built painted wood with correct thickness, unique grain, and joinery",
    "matte porcelain floor tile and retained glazed wall tile with distinct installation and cleaning histories",
    "brush-painted trim, nonrepeating vinyl floor pattern, softened high-touch edges, and honestly aged grout"
  ]
} as const;

function replacementChoice(values: readonly string[], seed: string, offset: number): string {
  return values[Number.parseInt(seed.slice(offset, offset + 4), 16) % values.length];
}

function replacePromptLine(prompt: string, label: string, value: string): string {
  const prefix = `${label}:`;
  const lines = prompt.split("\n");
  const index = lines.findIndex((line) => line.startsWith(prefix));
  if (index < 0) throw new Error(`Cannot build replacement prompt; missing ${prefix}`);
  lines[index] = `${prefix} ${value}.`;
  return lines.join("\n");
}

function buildReplacementJob(sourceJob: JsonRecord): JsonRecord {
  const siblingJobs = jobs.filter(
    (candidate) =>
      candidate.kind === "styled" &&
      candidate.asin === sourceJob.asin &&
      candidate.styleSlug === sourceJob.styleSlug &&
      candidate.slot === sourceJob.slot
  );
  const candidateOrdinal = Math.max(...siblingJobs.map((candidate) => Number(candidate.candidateOrdinal))) + 1;
  const paddedSlot = String(sourceJob.slot).padStart(2, "0");
  const paddedOrdinal = String(candidateOrdinal).padStart(2, "0");
  const replacementSceneId = `v4-${sourceJob.asin}-${sourceJob.styleSlug}-${paddedSlot}-candidate-${paddedOrdinal}`;
  const corpusSeed = createHash("sha256")
    .update(`${sourceJob.sceneId}:${inputSha256}:${candidateOrdinal}:materially-different-replacement`)
    .digest("hex")
    .slice(0, 20);
  const diversityPlan = {
    corpusSeed,
    themeDirectionId: sourceJob.diversityPlan?.themeDirectionId,
    themeDirection: sourceJob.diversityPlan?.themeDirection,
    roomArchetypeId: `replacement-room-${corpusSeed}`,
    roomArchetype: replacementChoice(replacementOptions.room, corpusSeed, 0),
    cameraId: `replacement-camera-${corpusSeed}`,
    camera: replacementChoice(replacementOptions.camera, corpusSeed, 4),
    lightingId: `replacement-light-${corpusSeed}`,
    lighting: replacementChoice(replacementOptions.lighting, corpusSeed, 8),
    budgetId: `replacement-budget-${corpusSeed}`,
    budget: replacementChoice(replacementOptions.budget, corpusSeed, 12),
    occupancyId: `replacement-occupancy-${corpusSeed}`,
    occupancy: replacementChoice(replacementOptions.occupancy, corpusSeed, 16),
    materialId: `replacement-material-${corpusSeed}`,
    material: replacementChoice(replacementOptions.material, corpusSeed, 2)
  };
  let prompt = String(sourceJob.prompt)
    .replace(
      /^Scene identity: .*$/m,
      `Scene identity: ${replacementSceneId}; corpus diversity seed: ${corpusSeed}.`
    );
  if (String(sourceJob.promptVersion).startsWith("affiliate-pilot-lived-in-iphone-realism-v4.71")) {
    prompt = replacePromptLine(
      prompt,
      "Room history and budget",
      `${diversityPlan.roomArchetype}; ${diversityPlan.budget}. The room has been used since installation and was not reset for this photograph`
    );
    prompt = replacePromptLine(
      prompt,
      "Camera authenticity",
      `${diversityPlan.camera}; ${diversityPlan.lighting}. Reproduce a default iPhone HEIC/JPEG look with modest computational sharpening, local auto-HDR, slight edge distortion, imperfect leveling, fine shadow noise, mixed white balance, and at least one clipped highlight or blocked shadow; no RAW processing, Lightroom grade, tripod precision, portrait blur, or architectural correction`
    );
    prompt = replacePromptLine(
      prompt,
      "Everyday evidence",
      `${diversityPlan.occupancy}. These clues are functional and uncoordinated; never align, color-match, center, or style them`
    );
    prompt = replacePromptLine(prompt, "Material emphasis", diversityPlan.material);
  } else if (sourceJob.promptVersion === "affiliate-pilot-photographic-realism-v4.70") {
    prompt = replacePromptLine(
      prompt,
      "Room and budget",
      `${diversityPlan.roomArchetype}; ${diversityPlan.budget}`
    );
    prompt = replacePromptLine(
      prompt,
      "Camera and exposure",
      `${diversityPlan.camera}; ${diversityPlan.lighting}. Use ordinary deep focus, mild phone sharpening, faint shadow noise, limited highlight recovery, imperfect verticals, and no synthetic depth blur or cinematic grade`
    );
    prompt = replacePromptLine(
      prompt,
      "Human trace cap",
      `${diversityPlan.occupancy}. Use only these clues. Unless the concrete scene direction explicitly requires one, do not add the recurring staging kit of plant, vase, branch, framed art, candle, tray, folded-towel stack, woven basket, slippers, robe, styled bottle grouping, or coordinated spa vignette`
    );
    prompt = replacePromptLine(
      prompt,
      "Material truth",
      `${diversityPlan.material}. Preserve real thickness, seams, grout depth, board direction, fabric gravity, and nonrepeating wear. No cloned folds, tiled veins, repeated fractals, or blanket gloss`
    );
  } else {
    prompt = replacePromptLine(prompt, "Room archetype", diversityPlan.roomArchetype);
    prompt = replacePromptLine(prompt, "Budget lane", diversityPlan.budget);
    prompt = replacePromptLine(prompt, "Camera", diversityPlan.camera);
    prompt = replacePromptLine(prompt, "Lighting", diversityPlan.lighting);
    prompt = replacePromptLine(prompt, "Occupancy direction", diversityPlan.occupancy);
    prompt = replacePromptLine(prompt, "Material focus", diversityPlan.material);
  }
  const separation =
    `Replacement separation: this fills the missing slot left by ${sourceJob.sceneId}. Create a genuinely different physical bathroom, layout, palette, camera position, lighting pattern, and activity trace; do not reconstruct the rejected candidate. Preserve the exact product contract and correct the audited rejection cause: ${rejectionCause}.`;
  const rootRevisionDirective = rootRevision
    ? `Root-cause revision for the next candidate: ${rootRevision}. This correction is mandatory and takes priority over incidental styling choices.`
    : null;
  prompt = prompt.replace(
    "Decision semantics:",
    `${separation}${rootRevisionDirective ? `\n${rootRevisionDirective}` : ""}\nDecision semantics:`
  );
  return {
    ...sourceJob,
    id: `${sourceJob.productId}:${sourceJob.styleSlug}:${sourceJob.slot}:candidate:${candidateOrdinal}`,
    candidateOrdinal,
    sceneId: replacementSceneId,
    storageKey: String(sourceJob.storageKey).replace(
      /scene-\d{2}-candidate-\d{2}\.png$/,
      `scene-${paddedSlot}-candidate-${paddedOrdinal}.png`
    ),
    prompt,
    promptSha256: createHash("sha256").update(prompt).digest("hex"),
    status: "queued",
    decisionStatus: "queued",
    diversityPlan,
    generationStrategy: "fresh_materially_different_replacement_room_candidate",
    replacementForCandidateId: sourceJob.id,
    replacementForCandidateSha256: inputSha256,
    replacementCause: rejectionCause,
    rootRevisionApplied: rootRevision,
    candidateSha256: undefined,
    generationEvidencePath: undefined
  };
}

let replacementJob: JsonRecord | null = null;
if (decision === "assistant_hard_reject") {
  const priorSameCauseCount = (ledger.styledGeneration.calls as JsonRecord[]).filter(
    (candidate) =>
      candidate.decision === "assistant_hard_reject" &&
      candidate.asin === job.asin &&
      candidate.styleSlug === job.styleSlug &&
      candidate.slot === job.slot &&
      candidate.rejectionCause === rejectionCause
  ).length;
  const repeatedSameCauseLimit = Number(manifest.executionPolicy.repeatedSameCauseLimit ?? 2);
  const sameCauseCountAfterThisRejection = priorSameCauseCount + 1;
  if (sameCauseCountAfterThisRejection >= repeatedSameCauseLimit && !rootRevision) {
    throw new Error(
      `Queuing the next candidate after ${sameCauseCountAfterThisRejection} ${rejectionCause} failures in this slot requires --root-revision=...`
    );
  }
  replacementJob = buildReplacementJob(job);
  replacementJob.sameCauseFailureCountBeforeGeneration = sameCauseCountAfterThisRejection;
}
fs.mkdirSync(path.dirname(candidatePath), { recursive: true });
fs.copyFileSync(inputPath, candidatePath);

const attemptLabel = `scene-${String(job.slot).padStart(2, "0")}-candidate-${String(job.candidateOrdinal).padStart(2, "0")}`;
const evidenceRoot = path.join(
  outputRoot,
  "affiliate-pilot",
  "v4",
  "private-evidence",
  "styled-generation",
  String(job.asin),
  String(job.styleSlug)
);
fs.mkdirSync(evidenceRoot, { recursive: true });
const evidencePath = path.join(evidenceRoot, `${attemptLabel}-provider.png`);
const generationPath = path.join(evidenceRoot, `${attemptLabel}-generation.json`);
if (fs.existsSync(evidencePath) || fs.existsSync(generationPath)) {
  throw new Error(`Styled evidence already exists for ${sceneId}.`);
}
fs.copyFileSync(inputPath, evidencePath);

const occurredAt = new Date().toISOString();
const calls = ledger.styledGeneration.calls as JsonRecord[];
const call = {
  providerCallOrdinal: calls.length + 1,
  occurredAt,
  jobId: job.id,
  sceneId: job.sceneId,
  asin: job.asin,
  styleSlug: job.styleSlug,
  slot: job.slot,
  candidateOrdinal: job.candidateOrdinal,
  promptVersion: job.promptVersion,
  generationVersion: job.generationVersion,
  promptSha256: job.promptSha256,
  requestedModel: job.requestedModel,
  requestedQuality: job.requestedQuality,
  providerModelObserved: null,
  providerQualityObserved: null,
  providerRequestIdObserved: null,
  referenceAtlasPath: pack.atlasPath,
  referenceAtlasSha256: pack.atlasSha256,
  identityCallCountAtGeneration: currentIdentityCallCount,
  styledIdentityGenerationCallCount: 0,
  generatedSourcePath: inputPath,
  evidencePath: path.relative(repositoryRoot, evidencePath).replace(/\\/g, "/"),
  candidatePath: path.relative(repositoryRoot, candidatePath).replace(/\\/g, "/"),
  candidateSha256: inputSha256,
  dimensions: { width: metadata.width, height: metadata.height },
  decision,
  audit,
  rejectionCause,
  rootRevision
};
fs.writeFileSync(
  generationPath,
  `${JSON.stringify({ ...call, exactPrompt: job.prompt, diversityPlan: job.diversityPlan }, null, 2)}\n`,
  "utf8"
);
calls.push(call);
ledger.styledGeneration.calls = calls;
ledger.styledGeneration.generated = Number(ledger.styledGeneration.generated ?? 0) + 1;
job.status = decision;
job.decisionStatus = decision;
job.candidateSha256 = inputSha256;
job.generationEvidencePath = path.relative(repositoryRoot, generationPath).replace(/\\/g, "/");

if (decision === "assistant_pass_owner_pending") {
  ledger.styledGeneration.assistantPassedOwnerPending =
    Number(ledger.styledGeneration.assistantPassedOwnerPending ?? 0) + 1;
} else {
  ledger.styledGeneration.assistantHardRejected =
    Number(ledger.styledGeneration.assistantHardRejected ?? 0) + 1;
  ledger.styledGeneration.replacementNeeded = Number(ledger.styledGeneration.replacementNeeded ?? 0) + 1;
  ledger.styledGeneration.replacementQueued = Number(ledger.styledGeneration.replacementQueued ?? 0) + 1;
  jobs.push(replacementJob!);
  manifest.styledReplacementGenerationRequestedCount =
    Number(manifest.styledReplacementGenerationRequestedCount ?? 0) + 1;
}
ledger.updatedAt = occurredAt;
ledger.status = "styled_generation_active";
ledger.events.push({
  type: "styled_candidate_reviewed",
  occurredAt,
  status: decision,
  sceneId,
  asin: job.asin,
  styleSlug: job.styleSlug,
  slot: job.slot,
  candidateOrdinal: job.candidateOrdinal,
  candidateSha256: inputSha256,
  identityCallCountAtGeneration: currentIdentityCallCount,
  styledIdentityGenerationCallCount: 0,
  rejectionCause,
  replacementSceneId: replacementJob?.sceneId ?? null
});
if (replacementJob) {
  ledger.events.push({
    type: "styled_replacement_queued",
    occurredAt,
    status: "queued",
    sceneId: replacementJob.sceneId,
    replacementForSceneId: sceneId,
    replacementForCandidateSha256: inputSha256,
    rejectionCause,
    diversityPlan: replacementJob.diversityPlan
  });
}
manifest.status = "styled_generation_active";

writeJson(manifestPath, manifest);
writeJson(ledgerPath, ledger);
process.stdout.write(
  `${sceneId}: ${decision}; styled call ${call.providerCallOrdinal}, identity calls unchanged at ${currentIdentityCallCount}, output ${inputSha256}.${replacementJob ? ` Replacement queued: ${replacementJob.sceneId}.` : ""}\n`
);
