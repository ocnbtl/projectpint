import fs from "node:fs";
import path from "node:path";

type JsonRecord = Record<string, any>;

function argument(name: string, fallback?: string): string {
  const prefix = `--${name}=`;
  const value = process.argv.slice(2).find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing --${name}=...`);
}

function readJson(filePath: string): JsonRecord {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")) as JsonRecord;
}

function writeJsonAtomic(filePath: string, value: JsonRecord): void {
  const tempPath = `${filePath}.${process.pid}.batch.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

const batchId = argument("batch-id");
const count = Number.parseInt(argument("count", "50"), 10);
if (!/^[a-z0-9][a-z0-9-]*$/.test(batchId)) throw new Error("--batch-id must be a lowercase storage slug.");
if (!Number.isInteger(count) || count < 1) throw new Error("--count must be a positive integer.");

const repositoryRoot = process.cwd();
const outputRoot = path.join(repositoryRoot, "output");
const manifestPath = path.join(outputRoot, "affiliate-pilot", "v4", "manifest.json");
const ledgerPath = path.join(outputRoot, "affiliate-pilot", "v4", "execution-log.json");
const manifest = readJson(manifestPath);
const ledger = readJson(ledgerPath);
const identityCalls = ledger.identityGeneration?.calls as JsonRecord[] | undefined;
const lock = ledger.styledGeneration?.identityLock as JsonRecord | undefined;
if (!Array.isArray(identityCalls) || !lock) throw new Error("Styled identity-lock evidence is missing.");
if (lock.styledIdentityGenerationAllowed !== false || identityCalls.length !== Number(lock.identityCallCount)) {
  throw new Error("Identity-call ledger changed after the styled identity lock.");
}

const products = manifest.products as JsonRecord[];
if (products.length !== 10) throw new Error(`Expected the ten-product pilot, received ${products.length} products.`);
if (count % products.length !== 0) {
  throw new Error(`Balanced batches require --count to be divisible by ${products.length}.`);
}
const perProduct = count / products.length;
const styledJobs = (manifest.jobs as JsonRecord[]).filter((job) => job.kind === "styled");
const styleOrder = [...new Set(styledJobs.map((job) => String(job.styleSlug)))];
const selected: JsonRecord[] = [];
for (const product of products) {
  const eligible = styledJobs
    .filter((job) => job.asin === product.asin && job.status === "queued" && job.decisionStatus === "queued")
    .sort((left, right) => {
      const leftHome = left.styleSlug === product.homeStyleSlug ? 0 : 1;
      const rightHome = right.styleSlug === product.homeStyleSlug ? 0 : 1;
      return (
        leftHome - rightHome ||
        styleOrder.indexOf(String(left.styleSlug)) - styleOrder.indexOf(String(right.styleSlug)) ||
        Number(left.slot) - Number(right.slot) ||
        Number(left.candidateOrdinal) - Number(right.candidateOrdinal)
      );
    });
  if (eligible.length < perProduct) {
    throw new Error(`${product.asin} has only ${eligible.length} queued jobs; ${perProduct} are required.`);
  }
  selected.push(...eligible.slice(0, perProduct));
}
if (selected.length !== count || new Set(selected.map((job) => job.sceneId)).size !== count) {
  throw new Error(`Batch selection must contain ${count} unique scenes.`);
}

const batchRoot = path.join(
  outputRoot,
  "affiliate-pilot",
  "v4",
  "private-evidence",
  "owner-review-batches",
  batchId
);
const batchPath = path.join(batchRoot, "batch.json");
if (fs.existsSync(batchPath)) throw new Error(`Batch already exists: ${batchPath}`);
fs.mkdirSync(batchRoot, { recursive: true });
const createdAt = new Date().toISOString();
const productByAsin = new Map(products.map((product) => [product.asin, product]));
const batch = {
  schemaVersion: "affiliate-pilot-v4-owner-review-batch-v1",
  batchId,
  createdAt,
  status: "generation_queued",
  targetOwnerReviewCandidateCount: count,
  targetPerProduct: perProduct,
  finalLibraryTargetPerProductStyle: 10,
  currentManifestWaveSlotsPerProductStyle: 5,
  promptVersion: manifest.promptVersion,
  generationVersion: manifest.generationVersion,
  identityCallCountAtBatchFreeze: identityCalls.length,
  styledIdentityGenerationAllowed: false,
  selectionPolicy:
    "Balanced across all ten products; prioritize each product's home style, then stable style/slot order; generate only queued jobs under the locked atlas.",
  decisionSemantics:
    "Assistant screening is provisional. Only explicit owner_accepted or owner_declined decisions are final selection evidence. Batch preparation does not publish or copy owner-selected assets.",
  jobs: selected.map((job, index) => {
    const product = productByAsin.get(job.asin)!;
    return {
      reviewNumber: index + 1,
      sceneId: job.sceneId,
      jobId: job.id,
      asin: job.asin,
      productName: product.productName,
      brand: product.brand,
      productSlug: product.slug,
      productRole: product.productRole,
      styleSlug: job.styleSlug,
      slot: job.slot,
      candidateOrdinal: job.candidateOrdinal,
      promptVersion: job.promptVersion,
      promptSha256: job.promptSha256,
      exactPrompt: job.prompt,
      requestedModel: job.requestedModel,
      requestedQuality: job.requestedQuality,
      atlasPath: `output/${job.atlasStorageKey}`,
      atlasSha256: job.referencePackSha256,
      candidatePath: `output/${job.storageKey}`,
      ownerSelectedStorageKey: job.ownerSelectedStorageKey,
      statusAtFreeze: job.status
    };
  })
};
writeJsonAtomic(batchPath, batch);
process.stdout.write(
  `Prepared ${batchId}: ${count} queued scenes, ${perProduct} per product, identity calls locked at ${identityCalls.length}; ${batchPath}.\n`
);
