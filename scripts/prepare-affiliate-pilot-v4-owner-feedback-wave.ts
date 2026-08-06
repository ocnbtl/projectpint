import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type JsonRecord = Record<string, any>;

const PROMPT_VERSION = "affiliate-pilot-owner-feedback-v4.72-wave-b";
const RETIRED_CART_ASIN = "B07PFYZ3DP";
const IDENTITY_REBUILD_ASIN = "B000MS63E2";

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
  const tempPath = `${filePath}.${process.pid}.feedback-wave.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function promptGuard(asin: string): string {
  const guards: Record<string, string> = {
    B0829N8C9G:
      "The OXO dispenser must share the room's exposure and white balance: no glowing steel, bright halo, independent product lighting, or fake edge contrast. Every nearby fixed fixture must be recognizable and physically complete; never substitute an overturned cup or ambiguous object for faucet hardware.",
    B0DC7VG6Z9:
      "The Bambusi bench has exactly eight distinct narrow top slats and exactly eight distinct narrow lower-shelf slats. Both counts must be visually auditable with no merged, hidden, extra, missing, or overly wide slats. If the model cannot satisfy 8-over-8 exactly, discard the output.",
    B00176AOKM:
      "Both metal extension arms of the Aquala caddy must rest visibly and securely on opposite dry bathtub rims with believable weight and contact shadows; no floating edge or impossible attachment. Spa Greenery must be unmistakable through a restrained green fixed finish plus one plausible living plant or clearly visible leafy exterior foliage.",
    B008X0VM0Q:
      "The Trinsic towel ring must be rigidly mounted, geometrically square, and level in the physical room even if the phone camera has slight roll. Door and fixture scale must remain ordinary and mutually coherent.",
    B08TLP2D54:
      "All vanity and mirror lights must be deliberately aligned, evenly mounted, electrically plausible, and free of doubled, drifting, or mismatched fixtures.",
    B07SG7BV11:
      "Preserve the exact Leah curtain print, panel count, hanging geometry, and textile scale that passed owner review; vary the real room and camera conditions without redesigning the curtain.",
    B0D2KK6MNS:
      "Preserve the exact terracotta linen-blend curtain color, weave, header, drape, and single-panel identity that passed owner review; vary the real room without beautifying it into a catalog set.",
    B0F3L72TC3:
      "Preserve one exact healthy Golden Pothos in its documented 10-inch hanging basket with believable vines, leaf variation, gravity, and support; do not clone leaves or add competing plants."
  };
  return guards[asin] ?? "Preserve exact product identity and correct physical installation before considering style.";
}

function feedbackPrompt(prompt: string, sceneId: string, asin: string, reasons: string[]): string {
  if (!prompt.includes("Decision semantics:")) throw new Error(`${sceneId} prompt lacks Decision semantics.`);
  const uniqueReasons = [...new Set(reasons.map((reason) => reason.trim()).filter(Boolean))];
  const feedback = uniqueReasons.length
    ? uniqueReasons.map((reason, index) => `${index + 1}) ${reason}`).join("\n")
    : "No product-specific denial was recorded in wave A; preserve the accepted identity standard while creating a materially new room.";
  const correction = [
    `Owner-feedback wave: ${sceneId}. Generate a genuinely new physical bathroom and phone photograph; do not repair or imitate any earlier image.`,
    `Owner denial evidence for this product: ${feedback}`,
    `Mandatory product correction: ${promptGuard(asin)}`,
    "Cross-image plausibility gate: every fixed object must have a recognizable household function, coherent scale, complete geometry, and buildable attachment. Reject ambiguous surrogate objects, impossible junctions, duplicate fixtures, and unexplained shapes.",
    "Style legibility gate: make the named style immediately legible through fixed architecture, finishes, proportions, and light while retaining an ordinary maintained home. Do not rely on a caption, a coordinated decor kit, or generic luxury materials.",
    "Owner-review semantics: assistant screening remains provisional; this candidate is neither approved nor publishable until the owner explicitly decides."
  ].join("\n");
  return prompt
    .replace(/^Scene identity: .*$/m, `Scene identity: ${sceneId}; owner-feedback corpus wave B.`)
    .replace("Decision semantics:", `${correction}\nDecision semantics:`);
}

function nextCandidateStorageKey(source: JsonRecord, candidateOrdinal: number): string {
  const current = String(source.storageKey);
  const next = current.replace(
    /scene-\d+-candidate-\d+\.png$/,
    `scene-${String(source.slot).padStart(2, "0")}-candidate-${String(candidateOrdinal).padStart(2, "0")}.png`
  );
  if (next === current) throw new Error(`Cannot derive replacement storage key from ${current}.`);
  return next;
}

const batchId = argument("batch-id");
const sourceBatchId = argument("source-batch-id", "v471-owner-review-001");
const count = Number.parseInt(argument("count", "50"), 10);
if (!/^[a-z0-9][a-z0-9-]*$/.test(batchId)) throw new Error("--batch-id must be a lowercase storage slug.");
if (!Number.isInteger(count) || count < 1) throw new Error("--count must be a positive integer.");

const repositoryRoot = process.cwd();
const v4Root = path.join(repositoryRoot, "output", "affiliate-pilot", "v4");
const manifestPath = path.join(v4Root, "manifest.json");
const ledgerPath = path.join(v4Root, "execution-log.json");
const sourceReceiptPath = path.join(
  v4Root,
  "private-evidence",
  "owner-review-batches",
  sourceBatchId,
  "owner-decision-receipt.json"
);
const batchRoot = path.join(v4Root, "private-evidence", "owner-review-batches", batchId);
const batchPath = path.join(batchRoot, "batch.json");
if (fs.existsSync(batchPath)) throw new Error(`Batch already exists: ${batchPath}`);

const manifest = readJson(manifestPath);
const ledger = readJson(ledgerPath);
const receipt = readJson(sourceReceiptPath);
const identityCalls = ledger.identityGeneration?.calls as JsonRecord[] | undefined;
const lock = ledger.styledGeneration?.identityLock as JsonRecord | undefined;
if (!Array.isArray(identityCalls) || !lock || identityCalls.length !== Number(lock.identityCallCount)) {
  throw new Error("Identity-lock evidence is missing or changed.");
}
if (lock.styledIdentityGenerationAllowed !== false) throw new Error("Styled identity generation is not locked.");

const products = manifest.products as JsonRecord[];
const jobs = manifest.jobs as JsonRecord[];
const styledJobs = jobs.filter((job) => job.kind === "styled");
const blockedAsins = new Set([RETIRED_CART_ASIN, IDENTITY_REBUILD_ASIN]);
const eligibleProducts = products.filter((product) => !blockedAsins.has(String(product.asin)));
if (count < eligibleProducts.length) throw new Error(`${count} jobs cannot cover ${eligibleProducts.length} products.`);

const cart = products.find((product) => product.asin === RETIRED_CART_ASIN);
const soapDish = products.find((product) => product.asin === IDENTITY_REBUILD_ASIN);
if (!cart || !soapDish) throw new Error("Owner-directed blocked products are missing.");
cart.approvalStatus = "owner_retired_pending_replacement";
cart.collectionStatus = "excluded_from_generation_pending_better_product";
cart.ownerDirective =
  "Remove and replace this cart with a different Amazon product because the listing reviews are weak and the product is expensive.";
soapDish.referencePackStatus = "owner_rejected_identity_rebuild_required";
soapDish.collectionStatus = "excluded_from_generation_pending_exact_identity_rebuild";
soapDish.ownerDirective =
  "Rebuild from the actual listing: the current generated slatted rectangular dish is the wrong product geometry.";

for (const job of styledJobs) {
  if (
    job.asin === RETIRED_CART_ASIN &&
    job.status === "queued" &&
    job.decisionStatus === "queued"
  ) {
    job.status = "product_retired_pending_replacement";
    job.decisionStatus = "product_retired_pending_replacement";
  }
  if (
    job.asin === IDENTITY_REBUILD_ASIN &&
    job.status === "queued" &&
    job.decisionStatus === "queued"
  ) {
    job.status = "blocked_identity_rebuild_required";
    job.decisionStatus = "blocked_identity_rebuild_required";
  }
  if (job.asin === IDENTITY_REBUILD_ASIN && job.status === "owner_accepted") {
    job.ownerSelectionUseStatus = "quarantined_identity_mismatch_revalidation_required";
  }
}

const ownerDeclines = (receipt.decisions as JsonRecord[]).filter(
  (decision) => decision.decision === "owner_declined" && !blockedAsins.has(String(decision.asin ?? ""))
);
const declineJobs = ownerDeclines
  .map((decision) => ({
    decision,
    job: styledJobs.find((job) => job.sceneId === decision.sceneId)
  }))
  .filter((entry): entry is { decision: JsonRecord; job: JsonRecord } => Boolean(entry.job))
  .filter((entry) => !blockedAsins.has(String(entry.job.asin)));
const feedbackByAsin = new Map<string, string[]>();
for (const { decision, job } of declineJobs) {
  const values = feedbackByAsin.get(String(job.asin)) ?? [];
  values.push(String(decision.reason));
  feedbackByAsin.set(String(job.asin), values);
}

const acceptedCount = (asin: string): number =>
  styledJobs.filter(
    (job) =>
      job.asin === asin &&
      job.status === "owner_accepted" &&
      job.ownerSelectionUseStatus !== "quarantined_identity_mismatch_revalidation_required"
  ).length;
const rankedProducts = [...eligibleProducts].sort(
  (left, right) => acceptedCount(String(left.asin)) - acceptedCount(String(right.asin)) ||
    String(left.asin).localeCompare(String(right.asin))
);
const basePerProduct = Math.floor(count / eligibleProducts.length);
const remainder = count % eligibleProducts.length;
const targets = new Map<string, number>(
  rankedProducts.map((product, index) => [String(product.asin), basePerProduct + (index < remainder ? 1 : 0)])
);

const styleOrder = [...new Set(styledJobs.map((job) => String(job.styleSlug)))];
const selected: JsonRecord[] = [];
const replacements: JsonRecord[] = [];
for (const product of eligibleProducts) {
  const asin = String(product.asin);
  const target = targets.get(asin)!;
  const reasons = feedbackByAsin.get(asin) ?? [];
  const productSelected: JsonRecord[] = [];
  const reservedKeys = new Set(
    styledJobs
      .filter((job) => job.asin === asin && job.status === "owner_accepted")
      .map((job) => String(job.ownerSelectedStorageKey))
  );

  for (const { decision, job: source } of declineJobs.filter((entry) => entry.job.asin === asin)) {
    if (productSelected.length >= target) break;
    const laneJobs = styledJobs.filter(
      (job) => job.asin === asin && job.styleSlug === source.styleSlug && Number(job.slot) === Number(source.slot)
    );
    const candidateOrdinal = Math.max(...laneJobs.map((job) => Number(job.candidateOrdinal))) + 1;
    const sceneId = `v4-${asin}-${source.styleSlug}-${String(source.slot).padStart(2, "0")}-candidate-${String(candidateOrdinal).padStart(2, "0")}`;
    const prompt = feedbackPrompt(String(source.prompt), sceneId, asin, reasons);
    const replacement: JsonRecord = {
      ...source,
      id: `${source.productId}:${source.styleSlug}:${source.slot}:candidate:${candidateOrdinal}`,
      sceneId,
      candidateOrdinal,
      storageKey: nextCandidateStorageKey(source, candidateOrdinal),
      promptVersion: PROMPT_VERSION,
      prompt,
      promptSha256: sha256(prompt),
      status: "queued",
      decisionStatus: "queued",
      generationStrategy: "fresh_owner_feedback_replacement_candidate",
      replacementForCandidateId: source.id,
      replacementForCandidateSha256: source.candidateSha256,
      replacementCause: "owner_feedback_wave_b",
      rootRevisionApplied: String(decision.reason),
      ownerDecisionAt: undefined,
      ownerDecisionReason: undefined,
      ownerAcceptedCandidateSha256: undefined,
      ownerDeclinedCandidateSha256: undefined,
      ownerReplacementRequired: undefined,
      ownerSelectionCopyStatus: undefined,
      ownerSelectedPrivatePath: undefined,
      ownerSelectionUseStatus: undefined,
      candidateSha256: undefined,
      generationEvidencePath: undefined
    };
    if (reservedKeys.has(String(replacement.ownerSelectedStorageKey))) {
      throw new Error(`${sceneId} collides with an accepted or selected owner lane.`);
    }
    reservedKeys.add(String(replacement.ownerSelectedStorageKey));
    jobs.push(replacement);
    styledJobs.push(replacement);
    replacements.push(replacement);
    productSelected.push(replacement);
  }

  const queuedByLane = new Map<string, JsonRecord>();
  for (const job of styledJobs.filter(
    (candidate) =>
      candidate.asin === asin && candidate.status === "queued" && candidate.decisionStatus === "queued"
  )) {
    const key = String(job.ownerSelectedStorageKey);
    const current = queuedByLane.get(key);
    if (!current || Number(job.candidateOrdinal) < Number(current.candidateOrdinal)) queuedByLane.set(key, job);
  }
  const queued = [...queuedByLane.values()]
    .filter((job) => !reservedKeys.has(String(job.ownerSelectedStorageKey)))
    .sort(
      (left, right) =>
        Number(left.slot) - Number(right.slot) ||
        styleOrder.indexOf(String(left.styleSlug)) - styleOrder.indexOf(String(right.styleSlug)) ||
        Number(left.candidateOrdinal) - Number(right.candidateOrdinal)
    );
  for (const job of queued) {
    if (productSelected.length >= target) break;
    const prompt = feedbackPrompt(String(job.prompt), String(job.sceneId), asin, reasons);
    job.promptVersion = PROMPT_VERSION;
    job.prompt = prompt;
    job.promptSha256 = sha256(prompt);
    job.generationStrategy = "owner_feedback_wave_b_new_style_candidate";
    job.rootRevisionApplied = reasons.length
      ? [...new Set(reasons)].join(" | ")
      : "Preserve wave-A accepted identity and realism while expanding style coverage.";
    reservedKeys.add(String(job.ownerSelectedStorageKey));
    productSelected.push(job);
  }
  if (productSelected.length !== target) {
    throw new Error(`${asin} selected ${productSelected.length} jobs; ${target} are required.`);
  }
  selected.push(...productSelected);
}

if (
  selected.length !== count ||
  new Set(selected.map((job) => job.sceneId)).size !== count ||
  new Set(selected.map((job) => job.ownerSelectedStorageKey)).size !== count
) {
  throw new Error(`Wave B must contain ${count} unique scenes and owner-selected lanes.`);
}

const occurredAt = new Date().toISOString();
fs.mkdirSync(batchRoot, { recursive: true });
const productByAsin = new Map(products.map((product) => [product.asin, product]));
const batch = {
  schemaVersion: "affiliate-pilot-v4-owner-review-batch-v2",
  batchId,
  sourceOwnerDecisionBatchId: sourceBatchId,
  sourceOwnerDecisionReceiptPath: path.relative(repositoryRoot, sourceReceiptPath).replace(/\\/g, "/"),
  createdAt: occurredAt,
  status: "generation_queued",
  targetOwnerReviewCandidateCount: count,
  targetPerProduct: Object.fromEntries(targets),
  finalLibraryTargetPerProductStyle: 10,
  promptVersion: PROMPT_VERSION,
  identityCallCountAtBatchFreeze: identityCalls.length,
  styledIdentityGenerationAllowed: false,
  excludedProducts: [
    { asin: RETIRED_CART_ASIN, reason: cart.ownerDirective },
    { asin: IDENTITY_REBUILD_ASIN, reason: soapDish.ownerDirective }
  ],
  selectionPolicy:
    "Eight generation-ready products; owner-declined lanes receive fresh replacements first, then unique lanes are chosen in slot-first style rotation. Lowest accepted products receive remainder jobs.",
  decisionSemantics:
    "Assistant screening is provisional. Only explicit owner_accepted or owner_declined decisions are final. This batch is private and not publishable.",
  ownerFeedbackSummary: Object.fromEntries(feedbackByAsin),
  replacementCount: replacements.length,
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

manifest.promptVersion = PROMPT_VERSION;
manifest.status = "owner_feedback_wave_b_generation_queued";
manifest.jobs = jobs;
ledger.styledGeneration.replacementQueued =
  Number(ledger.styledGeneration.replacementQueued ?? 0) + replacements.length;
ledger.updatedAt = occurredAt;
ledger.events.push({
  type: "owner_feedback_review_batch_prepared",
  occurredAt,
  batchId,
  sourceBatchId,
  selectedCount: selected.length,
  replacementCount: replacements.length,
  excludedAsins: [RETIRED_CART_ASIN, IDENTITY_REBUILD_ASIN],
  identityCallCount: identityCalls.length,
  styledIdentityGenerationCallCount: 0
});

writeJsonAtomic(batchPath, batch);
writeJsonAtomic(manifestPath, manifest);
writeJsonAtomic(ledgerPath, ledger);
process.stdout.write(
  `Prepared ${batchId}: ${selected.length} jobs across ${eligibleProducts.length} products, ${replacements.length} owner-feedback replacements, two blocked products excluded.\n`
);
