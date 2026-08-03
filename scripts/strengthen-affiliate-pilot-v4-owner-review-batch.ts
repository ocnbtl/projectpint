import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type JsonRecord = Record<string, any>;
const PROMPT_VARIANT = "affiliate-pilot-lived-in-iphone-realism-v4.71-batch-guard-01";

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
  const tempPath = `${filePath}.${process.pid}.guard.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function strengthen(prompt: string): string {
  const guard = [
    "Batch anti-staging gate: depict a plainly functional bathroom before considering style. The style must come from fixed architecture, fixed finishes, proportions, and light, never from a movable decor kit.",
    "Movable-object ceiling: the Everyday evidence line is exhaustive. Render exactly those three functional traces and zero other movable decor. Unless Everyday evidence explicitly names one, include no plant, vase, branch, framed art, candle, tray, basket, shelf display, folded-towel stack, robe, slippers, decorative bottle, or coordinated accessory.",
    "Secondary-object and text gate: no competing dispenser, pump bottle, branded package, label, label-shaped mark, or pseudo-text. Any required secondary container is single, plain, unlabeled, partly used, and visually incidental.",
    "Ordinary-room gate: retain mixed-age fixed finishes, small maintenance inconsistencies, and unstyled empty space. Do not add decor to make the frame attractive."
  ].join("\n");
  if (!prompt.includes("Everyday evidence:")) throw new Error("Prompt is missing Everyday evidence.");
  if (!prompt.includes("Constraints:")) throw new Error("Prompt is missing Constraints.");
  return prompt
    .replace("Everyday evidence:", `${guard}\nEveryday evidence:`)
    .replace(
      "Constraints:",
      "Batch final check: if any unassigned plant, wall art, shelf display, candle, basket, decorative container, label, pseudo-text, or coordinated prop appears, discard the image instead of returning it.\nConstraints:"
    );
}

const batchId = argument("batch-id");
const repositoryRoot = process.cwd();
const v4Root = path.join(repositoryRoot, "output", "affiliate-pilot", "v4");
const manifestPath = path.join(v4Root, "manifest.json");
const ledgerPath = path.join(v4Root, "execution-log.json");
const batchPath = path.join(
  v4Root,
  "private-evidence",
  "owner-review-batches",
  batchId,
  "batch.json"
);
const manifest = readJson(manifestPath);
const ledger = readJson(ledgerPath);
const batch = readJson(batchPath);
const manifestJobs = manifest.jobs as JsonRecord[];
const identityCalls = ledger.identityGeneration?.calls as JsonRecord[] | undefined;
const lock = ledger.styledGeneration?.identityLock as JsonRecord | undefined;
if (!Array.isArray(identityCalls) || !lock || identityCalls.length !== Number(lock.identityCallCount)) {
  throw new Error("Identity-lock evidence is missing or changed.");
}

const strengthenedSceneIds: string[] = [];
for (const frozen of batch.jobs as JsonRecord[]) {
  const job = manifestJobs.find((candidate) => candidate.sceneId === frozen.sceneId);
  if (!job) throw new Error(`Missing manifest job ${frozen.sceneId}.`);
  if (job.status !== "queued" || job.decisionStatus !== "queued") continue;
  if (
    job.promptSha256 !== frozen.promptSha256 ||
    job.promptVersion !== frozen.promptVersion ||
    job.prompt !== frozen.exactPrompt
  ) {
    throw new Error(`${job.sceneId} changed after batch freeze.`);
  }
  if (job.promptVersion === PROMPT_VARIANT) continue;
  const prompt = strengthen(String(job.prompt));
  const promptSha256 = sha256(prompt);
  job.promptVersion = PROMPT_VARIANT;
  job.prompt = prompt;
  job.promptSha256 = promptSha256;
  frozen.promptVersion = PROMPT_VARIANT;
  frozen.exactPrompt = prompt;
  frozen.promptSha256 = promptSha256;
  strengthenedSceneIds.push(job.sceneId);
}
if (strengthenedSceneIds.length === 0) throw new Error("No queued frozen jobs were eligible for strengthening.");

const occurredAt = new Date().toISOString();
batch.promptGuard = {
  variant: PROMPT_VARIANT,
  occurredAt,
  strengthenedCount: strengthenedSceneIds.length,
  reason:
    "Early batch outputs repeated staged plants, shelves, coordinated objects, and pseudo-label containers despite the general v4.71 anti-staging language. The batch guard makes the assigned everyday traces exhaustive and adds a zero-decor/text return gate."
};
batch.status = "generation_queued_prompt_guard_applied";
ledger.updatedAt = occurredAt;
ledger.events.push({
  type: "owner_review_batch_prompt_guard_applied",
  occurredAt,
  batchId,
  promptVariant: PROMPT_VARIANT,
  strengthenedCount: strengthenedSceneIds.length,
  identityCallCount: identityCalls.length,
  styledIdentityGenerationCallCount: 0
});

writeJsonAtomic(manifestPath, manifest);
writeJsonAtomic(batchPath, batch);
writeJsonAtomic(ledgerPath, ledger);
process.stdout.write(
  `Applied ${PROMPT_VARIANT} to ${strengthenedSceneIds.length} queued jobs in ${batchId}; identity calls unchanged at ${identityCalls.length}.\n`
);
