import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type JsonRecord = Record<string, any>;

const PROMPT_VERSION = "affiliate-pilot-owner-feedback-v4.73-wave-c";
const WAVE_LABEL = "wave C";
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

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function promptGuard(asin: string): string {
  const guards: Record<string, string> = {
    B0829N8C9G:
      "The OXO dispenser must share the room's exposure and white balance: no glowing steel, bright halo, independent product lighting, fake edge contrast, or washed-out pump top. Preserve the listing-accurate charcoal pump color and a short nearly horizontal spout that never points upward. Every nearby fixed fixture must be recognizable and physically complete; never substitute an overturned cup or ambiguous object for faucet hardware.",
    B0DC7VG6Z9:
      "The Bambusi bench has exactly eight distinct narrow top slats and exactly eight distinct narrow lower-shelf slats. Both counts must be visually auditable with even construction spacing and no merged, hidden, extra, missing, uneven, or overly wide slats. Each bamboo board needs its own subtle nonrepeating grain, color, end grain, and wear; no cloned or synthetic wood texture and no strange light leaking between slats. Some scenes may include one or two ordinary functional items such as a casually placed towel, brush, comb, or bottle, but they must not hide the 8-over-8 count or look staged. If the model cannot satisfy 8-over-8 exactly, discard the output.",
    B00176AOKM:
      "The Aquala caddy must span the tub rather than sit in the water: both metal extension arms rest visibly and securely on opposite dry bathtub rims with believable weight and contact shadows, with no floating edge, submerged tray, flying corner, or impossible attachment. Preserve the listing-accurate front hook and all support hardware; the hook must be present and visually coherent. Spa Greenery must be unmistakable through a restrained green fixed finish plus one plausible living plant or clearly visible leafy exterior foliage.",
    B008X0VM0Q:
      "The Trinsic towel ring must be rigidly mounted, geometrically square, and level in the physical room even if the phone camera has slight roll. Any mirror reflection must preserve its straight rigid geometry, mounting direction, scale, and location; nearby dispensers and accessories must be fully supported with contact shadows and never float. Door and fixture scale must remain ordinary and mutually coherent.",
    B08TLP2D54:
      "The Hubba mirror and every reflected doorway, wall, fixture, and object must obey one consistent room geometry and face the physically correct direction. All vanity and mirror lights must be deliberately aligned, evenly mounted, electrically plausible, and free of doubled, drifting, or mismatched fixtures. Do not add random cups, upside-down containers, or unexplained props.",
    B07SG7BV11:
      "Preserve the exact Leah curtain print, panel count, hanging geometry, and textile scale that passed owner review; vary the real room and camera conditions without redesigning the curtain. Curtain lighting must follow the room rather than glow or flatten artificially. Spa Greenery scenes need visible green fixed finishes or plausible living foliage. Hair ties and every small accessory must remain separate recognizable objects with no fused, mutated, or unexplained attachments.",
    B0D2KK6MNS:
      "Preserve the exact terracotta linen-blend curtain color, weave, drape, and single-panel identity that passed owner review. The header must show exactly twelve listing-accurate hanging holes or grommet positions, never 13, 18, 19, or another count. The bottom hem must hang with natural weight, small unrelated folds, and slight real-world irregularity rather than a ruler-straight synthetic line. Vary the real room without beautifying it into a catalog set.",
    B0F3L72TC3:
      "Preserve one exact healthy Golden Pothos in its documented 10-inch hanging basket with the listing-accurate top hanger, suspension junctions, and support geometry. Use believable vines, leaf variation, gravity, and support; do not clone leaves, simplify or redesign the hanger top, or add competing plants."
  };
  return guards[asin] ?? "Preserve exact product identity and correct physical installation before considering style.";
}

function feedbackPrompt(
  prompt: string,
  sceneId: string,
  asin: string,
  reasons: string[],
  approvals: string[]
): string {
  if (!prompt.includes("Decision semantics:")) throw new Error(`${sceneId} prompt lacks Decision semantics.`);
  const uniqueReasons = [...new Set(reasons.map((reason) => reason.trim()).filter(Boolean))];
  const feedback = uniqueReasons.length
    ? uniqueReasons.map((reason, index) => `${index + 1}) ${reason}`).join("\n")
    : "No product-specific denial was recorded in the source review batch; preserve the accepted identity standard while creating a materially new room.";
  const uniqueApprovals = [...new Set(approvals.map((reason) => reason.trim()).filter(Boolean))];
  const approvalEvidence = uniqueApprovals.length
    ? uniqueApprovals.map((reason, index) => `${index + 1}) ${reason}`).join("\n")
    : "No detailed positive note was recorded; preserve every previously accepted product and realism trait.";
  const correction = [
    `Owner-feedback ${WAVE_LABEL}: ${sceneId}. Generate a genuinely new physical bathroom and phone photograph; do not repair or imitate any earlier image.`,
    `Owner denial evidence for this product: ${feedback}`,
    `Owner approval evidence to preserve: ${approvalEvidence}`,
    `Mandatory product correction: ${promptGuard(asin)}`,
    "Cross-image plausibility gate: every fixed object must have a recognizable household function, coherent scale, complete geometry, and buildable attachment. Reject ambiguous surrogate objects, impossible junctions, duplicate fixtures, and unexplained shapes.",
    "Style legibility gate: make the named style immediately legible through fixed architecture, finishes, proportions, and light while retaining an ordinary maintained home. Do not rely on a caption, a coordinated decor kit, or generic luxury materials.",
    "Owner-review semantics: assistant screening remains provisional; this candidate is neither approved nor publishable until the owner explicitly decides."
  ].join("\n");
  const withSceneIdentity = prompt.replace(
    /^Scene identity: .*$/m,
    `Scene identity: ${sceneId}; owner-feedback corpus ${WAVE_LABEL}.`
  );
  const withVerifiedReference =
    asin === "B0DC7VG6Z9"
      ? withSceneIdentity.replace(
          /^Reference pack: .*$/m,
          "Reference pack: use the owner-verified Bambusi manufacturer listing image at output/affiliate-pilot/v4/private-evidence/product-sources/B0DC7VG6Z9/bambusi-manufacturer-04.jpg for exact 8-over-8 identity. The older generated atlas is quarantined and must not be used. Use the validated dossier only for supporting textual identity. Do not copy the listing backdrop, lighting, or pose."
        )
      : asin === "B0D2KK6MNS"
        ? withSceneIdentity.replace(
            /^Reference pack: .*$/m,
            "Reference pack: use the exact Amazon listing scene at output/affiliate-pilot/v4/private-evidence/product-sources/B0D2KK6MNS/amazon-exact-asin-02.jpg together with the listing grommet close-up at output/affiliate-pilot/v4/private-evidence/product-sources/B0D2KK6MNS/amazon-exact-asin-06.jpg. The older generated atlas is quarantined because it depicts an incorrect header count and must not be used. Preserve exactly twelve reinforced metal grommet holes and twelve silver ball-bead hooks. Do not copy the listing backdrop, lighting, or pose."
          )
        : withSceneIdentity;
  return withVerifiedReference
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
const avoidBatchId = argument("avoid-batch-id", "");
const extraExcludedAsins = new Set(
  argument("exclude-asins", "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);
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
const avoidBatch = avoidBatchId
  ? readJson(path.join(v4Root, "private-evidence", "owner-review-batches", avoidBatchId, "batch.json"))
  : null;
const avoidedOwnerSelectedKeys = new Set(
  ((avoidBatch?.jobs ?? []) as JsonRecord[]).map((job) => String(job.ownerSelectedStorageKey))
);
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
const blockedAsins = new Set([RETIRED_CART_ASIN, IDENTITY_REBUILD_ASIN, ...extraExcludedAsins]);
const eligibleProducts = products.filter((product) => !blockedAsins.has(String(product.asin)));
if (count < eligibleProducts.length) throw new Error(`${count} jobs cannot cover ${eligibleProducts.length} products.`);

const cart = products.find((product) => product.asin === RETIRED_CART_ASIN);
const soapDish = products.find((product) => product.asin === IDENTITY_REBUILD_ASIN);
if (!cart || !soapDish) throw new Error("Owner-directed blocked products are missing.");
cart.approvalStatus = "owner_retired_pending_replacement";
cart.collectionStatus = "excluded_from_generation_pending_better_product";
cart.ownerDirective =
  "Keep the original cart retired. The proposed SPACEKEEPER replacement (ASIN B07QRH2PZS) is also owner-rejected because its design is too complex to reproduce accurately and consistently. Do not generate either cart; research a simpler replacement and obtain owner approval before identity work.";
cart.rejectedReplacementCandidates = [
  {
    asin: "B07QRH2PZS",
    productName: "SPACEKEEPER rolling storage cart",
    status: "owner_rejected_topology_too_complex",
    reason: "Design is too complex to replicate accurately and consistently."
  }
];
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
const approvalFeedbackByAsin = new Map<string, string[]>();
for (const decision of (receipt.decisions as JsonRecord[]).filter(
  (entry) => entry.decision === "owner_accepted"
)) {
  const job = styledJobs.find((candidate) => candidate.sceneId === decision.sceneId);
  const reason = String(decision.reason ?? "").trim();
  if (!job || blockedAsins.has(String(job.asin)) || /^Owner approved review \d+ in /i.test(reason)) continue;
  const values = approvalFeedbackByAsin.get(String(job.asin)) ?? [];
  values.push(reason);
  approvalFeedbackByAsin.set(String(job.asin), values);
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
  const approvals = approvalFeedbackByAsin.get(asin) ?? [];
  const productSelected: JsonRecord[] = [];
  const reservedKeys = new Set(
    styledJobs
      .filter((job) => job.asin === asin && job.status === "owner_accepted")
      .map((job) => String(job.ownerSelectedStorageKey))
  );
  for (const key of avoidedOwnerSelectedKeys) reservedKeys.add(key);

  for (const { decision, job: source } of declineJobs.filter((entry) => entry.job.asin === asin)) {
    if (productSelected.length >= target) break;
    if (reservedKeys.has(String(source.ownerSelectedStorageKey))) continue;
    const laneJobs = styledJobs.filter(
      (job) => job.asin === asin && job.styleSlug === source.styleSlug && Number(job.slot) === Number(source.slot)
    );
    const candidateOrdinal = Math.max(...laneJobs.map((job) => Number(job.candidateOrdinal))) + 1;
    const sceneId = `v4-${asin}-${source.styleSlug}-${String(source.slot).padStart(2, "0")}-candidate-${String(candidateOrdinal).padStart(2, "0")}`;
    const prompt = feedbackPrompt(String(source.prompt), sceneId, asin, reasons, approvals);
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
      replacementCause: "owner_feedback_wave_c",
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
    const prompt = feedbackPrompt(String(job.prompt), String(job.sceneId), asin, reasons, approvals);
    job.promptVersion = PROMPT_VERSION;
    job.prompt = prompt;
    job.promptSha256 = sha256(prompt);
    job.generationStrategy = "owner_feedback_wave_c_new_style_candidate";
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
  avoidedOwnerReviewBatchId: avoidBatchId || null,
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
    { asin: IDENTITY_REBUILD_ASIN, reason: soapDish.ownerDirective },
    ...[...extraExcludedAsins].map((asin) => ({
      asin,
      reason: "Temporarily excluded from this batch by explicit preparation argument."
    }))
  ],
  selectionPolicy:
    "Eight generation-ready products; owner-declined lanes receive fresh replacements first, then unique lanes are chosen in slot-first style rotation. Lowest accepted products receive remainder jobs.",
  decisionSemantics:
    "Assistant screening is provisional. Only explicit owner_accepted or owner_declined decisions are final. This batch is private and not publishable.",
  ownerFeedbackSummary: Object.fromEntries(feedbackByAsin),
  ownerApprovalEvidenceSummary: Object.fromEntries(approvalFeedbackByAsin),
  replacementCount: replacements.length,
  jobs: selected.map((job, index) => {
    const product = productByAsin.get(job.asin)!;
    const referencePath =
      job.asin === "B0DC7VG6Z9"
        ? "output/affiliate-pilot/v4/private-evidence/product-sources/B0DC7VG6Z9/bambusi-manufacturer-04.jpg"
        : job.asin === "B0D2KK6MNS"
          ? "output/affiliate-pilot/v4/private-evidence/product-sources/B0D2KK6MNS/amazon-exact-asin-02.jpg"
          : `output/${job.atlasStorageKey}`;
    const absoluteReferencePath = path.join(repositoryRoot, referencePath);
    if (!fs.existsSync(absoluteReferencePath)) {
      throw new Error(`Missing generation reference for ${job.sceneId}: ${referencePath}`);
    }
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
      atlasPath: referencePath,
      atlasSha256: sha256File(absoluteReferencePath),
      candidatePath: `output/${job.storageKey}`,
      ownerSelectedStorageKey: job.ownerSelectedStorageKey,
      statusAtFreeze: job.status
    };
  })
};

manifest.promptVersion = PROMPT_VERSION;
manifest.status = "owner_feedback_wave_c_generation_queued";
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
  excludedAsins: [...blockedAsins],
  identityCallCount: identityCalls.length,
  styledIdentityGenerationCallCount: 0
});

writeJsonAtomic(batchPath, batch);
writeJsonAtomic(manifestPath, manifest);
writeJsonAtomic(ledgerPath, ledger);
process.stdout.write(
  `Prepared ${batchId}: ${selected.length} jobs across ${eligibleProducts.length} products, ${replacements.length} owner-feedback replacements, ${blockedAsins.size} products excluded.\n`
);
