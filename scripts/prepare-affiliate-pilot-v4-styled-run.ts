import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp") as any;

type JsonRecord = Record<string, any>;

const repositoryRoot = process.cwd();
const outputRoot = path.join(repositoryRoot, "output");
const manifestPath = path.join(outputRoot, "affiliate-pilot", "v4", "manifest.json");
const ledgerPath = path.join(outputRoot, "affiliate-pilot", "v4", "execution-log.json");

function readJson(filePath: string): JsonRecord {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")) as JsonRecord;
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function writeJson(filePath: string, value: JsonRecord): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const manifest = readJson(manifestPath);
const ledger = readJson(ledgerPath);
if (manifest.generationVersion !== ledger.generationVersion) {
  throw new Error("Manifest and execution ledger generation versions do not match.");
}

const identityJobs = (manifest.jobs as JsonRecord[]).filter((job) => job.kind === "identity");
const styledJobs = (manifest.jobs as JsonRecord[]).filter((job) => job.kind === "styled");
const identityCalls = ledger.identityGeneration?.calls as JsonRecord[];
const packs = ledger.identityGeneration?.packs as JsonRecord[];
if (identityJobs.length !== 70 || styledJobs.length < 600) {
  throw new Error(`Expected 70 identity jobs and at least 600 styled jobs; received ${identityJobs.length} and ${styledJobs.length}.`);
}
if (!Array.isArray(identityCalls) || identityCalls.length < 70) {
  throw new Error("Identity-call evidence is incomplete.");
}
if (!Array.isArray(packs) || packs.length !== 10) {
  throw new Error(`Exactly ten reviewed identity packs are required; received ${packs?.length ?? 0}.`);
}
if (ledger.identityGeneration.assistantPassed !== 70) {
  throw new Error(`Exactly 70 identity views must pass before styled work; received ${ledger.identityGeneration.assistantPassed}.`);
}

const packByAsin = new Map<string, JsonRecord>();
for (const pack of packs) {
  const asin = String(pack.asin);
  if (packByAsin.has(asin)) throw new Error(`Duplicate reviewed identity pack for ${asin}.`);
  if (pack.decision !== "assistant_pass" || pack.expectedViewCount !== 7 || pack.uniqueHashCount !== 7) {
    throw new Error(`${asin} is not a complete reviewed seven-view identity pack.`);
  }
  if (!Array.isArray(pack.files) || pack.files.length !== 7) {
    throw new Error(`${asin} does not contain seven reviewed identity files.`);
  }
  const atlasPath = path.join(repositoryRoot, String(pack.atlasPath));
  if (!fs.existsSync(atlasPath) || sha256File(atlasPath) !== pack.atlasSha256) {
    throw new Error(`${asin} atlas is missing or hash-invalid.`);
  }
  for (const file of pack.files as JsonRecord[]) {
    const filePath = path.join(repositoryRoot, String(file.path));
    if (!fs.existsSync(filePath) || sha256File(filePath) !== file.sha256) {
      throw new Error(`${asin} reviewed identity file is missing or hash-invalid: ${file.path}`);
    }
    const metadata = await sharp(filePath).metadata();
    if (metadata.width !== 1024 || metadata.height !== 1536 || !metadata.hasAlpha) {
      throw new Error(`${asin} reviewed identity file is not a 1024x1536 alpha PNG: ${file.path}`);
    }
  }
  packByAsin.set(asin, pack);
}

const identityCallCountAtUnlock = identityCalls.length;
const occurredAt = new Date().toISOString();
let unblockedCount = 0;
for (const job of styledJobs) {
  const pack = packByAsin.get(String(job.asin));
  if (!pack) throw new Error(`Styled job ${job.id} has no reviewed identity pack.`);
  if (job.status === "blocked_identity_pack") {
    job.status = "queued";
    job.decisionStatus = "queued";
    unblockedCount += 1;
  } else if (job.status !== "queued" && job.status !== "assistant_hard_reject" && job.status !== "assistant_pass_owner_pending") {
    throw new Error(`Styled job ${job.id} has unsupported status ${job.status}.`);
  }
  job.referencePackVersion = manifest.generationVersion;
  job.referencePackSha256 = pack.atlasSha256;
  job.identityCallCountAtUnlock = identityCallCountAtUnlock;
}

for (const product of manifest.products as JsonRecord[]) {
  const pack = packByAsin.get(String(product.asin));
  if (!pack) throw new Error(`Product ${product.asin} has no reviewed identity pack.`);
  product.referencePackStatus = "assistant_pass_reviewed";
  product.referencePackVersion = manifest.generationVersion;
  product.referencePackSha256 = pack.atlasSha256;
}

const priorLock = ledger.styledGeneration.identityLock as JsonRecord | undefined;
if (priorLock && priorLock.identityCallCount !== identityCallCountAtUnlock) {
  throw new Error("The existing styled identity lock does not match the current identity-call ledger.");
}
ledger.styledGeneration.identityLock = priorLock ?? {
  lockedAt: occurredAt,
  generationVersion: manifest.generationVersion,
  identityCallCount: identityCallCountAtUnlock,
  assistantPassedIdentityCount: ledger.identityGeneration.assistantPassed,
  reviewedPackCount: packs.length,
  atlasSha256ByAsin: Object.fromEntries(
    [...packByAsin.entries()].map(([asin, pack]) => [asin, pack.atlasSha256])
  ),
  styledIdentityGenerationAllowed: false
};
manifest.status = "styled_generation_queued";
manifest.identityCallCountAtStyledUnlock = identityCallCountAtUnlock;
manifest.reviewedIdentityPackCount = packs.length;
ledger.status = "styled_generation_queued";
ledger.updatedAt = occurredAt;
if (!(ledger.events as JsonRecord[]).some((event) => event.type === "styled_generation_unblocked")) {
  ledger.events.push({
    type: "styled_generation_unblocked",
    occurredAt,
    status: "queued",
    reviewedPackCount: packs.length,
    identityCallCountAtUnlock,
    styledJobCount: styledJobs.length,
    styledIdentityGenerationAllowed: false
  });
}

writeJson(manifestPath, manifest);
writeJson(ledgerPath, ledger);
process.stdout.write(
  `Styled run ready: ${packs.length}/10 reviewed packs, ${unblockedCount} jobs newly queued, ${styledJobs.length} total styled jobs, identity ledger locked at ${identityCallCountAtUnlock} calls.\n`
);
