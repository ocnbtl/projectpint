import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type JsonRecord = Record<string, any>;

const PROMPT_VERSION = "affiliate-pilot-owner-feedback-v4.79-wave-d-r3";
const WAVE_LABEL = "wave D";
const RETIRED_CART_ASIN = "B07PFYZ3DP";
const IDENTITY_REBUILD_ASIN = "B000MS63E2";
const FINAL_LIBRARY_TARGET_PER_PRODUCT_STYLE = 10;

const VERIFIED_REFERENCE_PATHS: Record<string, string[]> = {
  B00176AOKM: [
    "output/affiliate-pilot/v4/private-evidence/product-sources/B00176AOKM/umbra-manufacturer-02.jpg"
  ],
  B008X0VM0Q: [
    "output/affiliate-pilot/v4/private-evidence/product-sources/B008X0VM0Q/delta-manufacturer-01.webp"
  ],
  B07SG7BV11: [
    "output/affiliate-pilot/v4/private-evidence/product-sources/B07SG7BV11/lush-decor-manufacturer-01.jpg"
  ],
  B0829N8C9G: [
    "output/affiliate-pilot/v4/private-evidence/product-sources/B0829N8C9G/oxo-manufacturer-01.jpg"
  ],
  B08TLP2D54: [
    "output/affiliate-pilot/v4/private-evidence/product-sources/B08TLP2D54/umbra-manufacturer-02.jpg"
  ],
  B0D2KK6MNS: [
    "output/affiliate-pilot/v4/private-evidence/product-sources/B0D2KK6MNS/amazon-exact-asin-02.jpg",
    "output/affiliate-pilot/v4/private-evidence/product-sources/B0D2KK6MNS/amazon-exact-asin-06.jpg"
  ],
  B0DC7VG6Z9: [
    "output/affiliate-pilot/v4/private-evidence/product-sources/B0DC7VG6Z9/bambusi-manufacturer-04.jpg"
  ],
  B0F3L72TC3: [
    "output/affiliate-pilot/v4/private-evidence/product-sources/B0F3L72TC3/pricehistory-exact-asin-01.jpg"
  ]
};

const GLOBAL_OWNER_FEEDBACK_GATES = [
  "Exact-product gate: treat the supplied exact listing reference as an identity contract, not loose inspiration. Match the product's silhouette, proportions, countable parts, material transitions, color, orientation, and attachment before adding style.",
  "Installation and physics gate: the product and every permanent fixture must be supported, level where appropriate, attached to a plausible surface, and grounded by consistent contact shadows. No floating edges, impossible junctions, reversed hardware, or unsupported weight.",
  "Single-object gate: render exactly one featured product. Do not clone, mirror, merge, or mutate its parts. Do not add duplicate faucets, handles, spouts, outlets, switches, hooks, lights, dispensers, or accessory fragments.",
  "Room-coherence gate: use a real buildable bathroom with complete ordinary fixtures and one coherent camera perspective. Prefer simple nonrepeating stone, plaster, wood, or tile over countable geometric patterns that can warp.",
  "Reflection gate: omit mirrors unless the featured product is the Hubba mirror. For the Hubba mirror, keep the reflected scene simple and ray-consistent with the camera and room.",
  "Prop gate: use few ordinary, unlabeled props. No visible writing, pseudo-logos, garbled labels, coordinated decor kits, competing plants, or ambiguous objects near the featured product.",
  "Photographic realism gate: create a plausible handheld phone photograph with one exposure, one white balance, natural lens perspective, restrained dynamic range, mild lived-in irregularity, and no catalog glow, halo, excessive polish, or synthetic symmetry.",
  "Style gate: express the named style through architecture, fixed finishes, proportions, and available light. Style is subordinate to exact identity, physical validity, and an ordinary cared-for bathroom."
];

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

const DENIAL_TAXONOMY: Array<{ category: string; pattern: RegExp }> = [
  {
    category: "exact_product_identity_or_details",
    pattern:
      /product|identity|wrong (?:item|shape|color|size|proportion|orientation)|dispenser|pump|spout|caddy|tray|bench|slat|towel ring|mirror|curtain|grommet|hook|pothos|basket|hanger|plant/i
  },
  {
    category: "physical_geometry_or_support",
    pattern: /float|support|contact|weight|physics|impossible|geometry|warped|bent|tilt|level|attached|attachment|junction|merged|malformed|glitch|artifact/i
  },
  {
    category: "installation_or_orientation",
    pattern: /install|mount|orientation|direction|backward|reverse|rim|wall|rod|ceiling|span|upright|upside.down/i
  },
  {
    category: "duplicate_or_mutated_objects",
    pattern: /duplicat|double|extra|multiple|clone|mutat|fused|second |two (?:pump|spout|faucet|handle|ring|basket|plant)/i
  },
  {
    category: "texture_or_pattern_artifacts",
    pattern: /texture|pattern|tile|grain|fold|fabric|floral|repeat|seam|slab/i
  },
  {
    category: "fixture_or_architecture_errors",
    pattern: /fixture|faucet|handle|door|cabinet|drawer|vanity|toilet|shower|outlet|switch|architecture|countertop/i
  },
  {
    category: "exact_count_failure",
    pattern: /count|\b(?:eleven|twelve|thirteen|fourteen|11|12|13|14)\b|missing (?:hook|slat|opening)|too many (?:hook|slat|opening)/i
  },
  {
    category: "lighting_or_reflection",
    pattern: /light|exposure|white balance|glow|halo|reflection|reflected|mirror image|shadow/i
  },
  { category: "garbled_or_visible_text", pattern: /text|label|word|logo|letter|writing/i },
  { category: "style_miss", pattern: /style|not (?:spa|coastal|japandi|boho|industrial|vintage|minimal|scandinavian)/i }
];

function denialTaxonomyCounts(decisions: JsonRecord[]): Record<string, number> {
  const counts = Object.fromEntries(DENIAL_TAXONOMY.map(({ category }) => [category, 0])) as Record<
    string,
    number
  >;
  counts.other_review_detail = 0;
  for (const decision of decisions.filter((entry) => entry.decision === "owner_declined")) {
    const reason = String(decision.reason ?? "");
    const matches = DENIAL_TAXONOMY.filter(({ pattern }) => pattern.test(reason));
    if (!matches.length) counts.other_review_detail += 1;
    for (const { category } of matches) counts[category] += 1;
  }
  return counts;
}

function promptGuard(asin: string): string {
  const guards: Record<string, string> = {
    B0829N8C9G:
      "Render one OXO Good Grips 12-ounce stainless dispenser, upright on a dry level counter: a tall slender tapered brushed-steel body, clear nonslip base ring, one charcoal pump, and one short nearly horizontal charcoal spout facing into the room. The pump is not a faucet, cap, double spout, upward nozzle, or broad mushroom. Match the room's exposure and white balance with no glowing steel, halo, independent product lighting, or washed-out pump top. Keep nearby faucet hardware simple, recognizable, complete, and spatially separate.",
    B0DC7VG6Z9:
      "Render one exact compact Bambusi bamboo shower bench, about 17 by 9 by 17 inches, level on the floor. It has exactly eight distinct narrow top slats, exactly eight distinct narrow lower-shelf slats, seven even gaps on each surface, a subtly bowed front apron, and four separate straight slightly splayed legs with small dark feet. No curved legs, center slab, merged boards, extra braces, warped shelf, or missing foot. Both 8-over-8 counts must remain visually auditable. Each board has subtle nonrepeating bamboo grain and end grain. At most one simple towel or bottle may appear, and it cannot obscure the count.",
    B00176AOKM:
      "Render one exact Umbra Aquala bamboo bath caddy, roughly 28.13 by 8.63 inches and extendable to 37 inches. Its long bamboo board runs along the tub's long axis while its two chrome extension arms bridge the short dimension: one arm must visibly rest on each opposite dry rim edge. Use a close three-quarter view that proves both contacts, weight, and contact shadows. Preserve the listing layout: book support, wine-glass slot, cup recess, phone slot, and coherent front hooks and extension hardware in their real positions. No long-way span, submerged tray, floating arm, flying corner, decorative dots, invented wire loop, or impossible attachment.",
    B008X0VM0Q:
      "Render one exact Delta Trinsic Champagne Bronze towel ring: a rigid squared C-shaped metal bar, round wall escutcheon, horizontal top arm, vertical right side, horizontal lower arm, one opening only on the left, and one short upward stop at the lower-left tip. It must never become a closed square, double rail, round loop, left-mounted reverse, or extra bar. Mount the round escutcheon flush to one wall, keep the bar level, and hang one ordinary towel from the lower arm without changing the geometry. Omit mirrors and nearby dispensers.",
    B08TLP2D54:
      "Render one exact Umbra Hubba brass wall mirror at 34.25 inches wide by 36.25 inches high: a broad nearly square arch with rounded top corners, short straight sides, softly rounded bottom corners, and a very thin brass rim. It must not become a tall narrow doorway shape, a semicircle, a pill, or an overly wide landscape arch. Mount it flat above a simple vanity. Keep the reflected scene sparse and ray-consistent: one plain opposing wall or window and no reflected doorway, shower, second mirror, doubled light, drifting fixture, or unreadable vanity object.",
    B07SG7BV11:
      "Render one exact 72-by-72-inch Lush Decor Leah shower curtain in the blue colorway: one white fabric panel with the listing-accurate large watercolor flowers in deep teal, aqua, gray, and muted taupe at the same motif scale. Show exactly twelve reinforced header openings and exactly twelve separate ordinary hooks, evenly spaced; count them before accepting. No orange colorway, redesigned flowers, extra panel, top band, fused hooks, hidden thirteenth hook, repeated motif seam, or glowing fabric. Keep adjacent fixtures and accessories simple and separate.",
    B0D2KK6MNS:
      "Render one exact 72-by-72-inch KOUFALL terracotta rust linen-blend shower curtain: one solid-color textured panel, no print, no decorative top band, and a plain weighted hem. Show exactly twelve reinforced metal grommet openings and exactly twelve separate silver ball-bead hooks, evenly spaced; count them before accepting. Preserve the warm muted terracotta color, visible linen-like weave, natural weight, and small nonrepeating folds. No 11th or 13th opening, fused hooks, duplicate panel, repeated fold stamp, ruler-straight hem, or catalog glow.",
    B0F3L72TC3:
      "Render one exact healthy Golden Pothos in its documented 10-inch black ribbed plastic hanging basket. Preserve three distinct hanger straps attached at three basket points, converging into one central junction and one top hook that is visibly attached to a real ceiling hook or wall bracket. The basket must hang freely with believable gravity; varied heart-shaped green-and-gold leaves and a few vines descend naturally. No floor pot, white planter, missing strap, free-floating hook, doubled basket, cloned leaves, rod collision, light collision, or competing plant."
  };
  return guards[asin] ?? "Preserve exact product identity and correct physical installation before considering style.";
}

function sanitizeNonHubbaReflectionConflict(asin: string, prompt: string): string {
  if (asin === "B08TLP2D54") return prompt;
  return prompt
    .split("\n")
    .filter(
      (line) =>
        !(/^\d+\)/.test(line) && /\bmirror(?:s|ed|ing)?\b/i.test(line)) &&
        !(
          asin === "B0DC7VG6Z9" &&
          (line.startsWith("Product contract:") || line.startsWith("Countable-feature audit:"))
        )
    )
    .map((line) => {
      if (line.startsWith("Camera authenticity:") && /\bmirror/i.test(line)) {
        return "Camera authenticity: off-axis view chosen to keep door, window, fixture, and room geometry physically coherent; ordinary mixed bathroom light with fine shadow noise and limited phone dynamic range. Reproduce a default iPhone HEIC/JPEG look with modest computational sharpening and local auto-HDR, slight edge distortion, imperfect leveling, fine luminance and chroma noise in shadows, mixed white balance when lights differ, and at least one partially clipped highlight or blocked shadow; no RAW processing, Lightroom grade, flash balancing, tripod precision, portrait-mode blur, or architectural correction.";
      }
      if (line.startsWith("Everyday evidence:") && /\bmirror/i.test(line)) {
        return line.replace(/(?:one )?faint toothpaste spot low on the mirror/gi, "one faint toothpaste spot beside the faucet");
      }
      if (line.startsWith("Concrete scene direction:") && /\bmirror/i.test(line)) {
        return line
          .replace(/a mismatched vintage mirror/gi, "one plain painted wall surface")
          .replace(/an aged nickel mirror/gi, "one plain painted wall surface");
      }
      if (line.startsWith("Material emphasis:") && /\bmirror/i.test(line)) {
        return "Material emphasis: ceramic, wood, glass windows, and textiles with correct thickness, edges, occlusion, and nonrepeating wear.";
      }
      if (line.startsWith("Physical plausibility:")) {
        return "Physical plausibility: use buildable household construction, functional wet-zone junctions, ordinary fixture clearances, complete recognizable fixtures, coherent door and window geometry, and fully supported objects. Do not place reflective wall glass or a reflective medicine-cabinet panel in the room.";
      }
      if (line.startsWith("Single-object gate:")) {
        return "Single-object gate: render exactly one featured product. Do not clone, reflect-duplicate, merge, or mutate its parts. Do not add duplicate faucets, handles, spouts, outlets, switches, hooks, lights, dispensers, or accessory fragments.";
      }
      if (line.startsWith("Reflection gate:")) {
        return "Reflective-wall gate: this featured product is not a wall reflector. Show no wall-mounted reflective glass, reflective medicine-cabinet panel, or vanity reflector anywhere in the room.";
      }
      return line
        .replace(/mirror-polished/gi, "high-polished")
        .replace(/mirror its handedness/gi, "reverse its handedness")
        .replace(/omit mirrors/gi, "use no reflective wall glass")
        .replace(/\bmirrors?\b/gi, "reflective wall glass");
    })
    .join("\n");
}

function feedbackPrompt(
  prompt: string,
  sceneId: string,
  asin: string,
  reasons: string[],
  approvals: string[]
): string {
  const basePrompt = prompt.replace(
    /Owner-feedback wave [A-Z]:[\s\S]*?Owner-review semantics: assistant screening remains provisional; this candidate is neither approved nor publishable until the owner explicitly decides\.\n?/g,
    ""
  );
  if (!basePrompt.includes("Decision semantics:")) throw new Error(`${sceneId} prompt lacks Decision semantics.`);
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
    ...GLOBAL_OWNER_FEEDBACK_GATES,
    "Owner-review semantics: assistant screening remains provisional; this candidate is neither approved nor publishable until the owner explicitly decides."
  ].join("\n");
  const withSceneIdentity = basePrompt.replace(
    /^Scene identity: .*$/m,
    `Scene identity: ${sceneId}; owner-feedback corpus ${WAVE_LABEL}.`
  );
  const verifiedReferences = VERIFIED_REFERENCE_PATHS[asin];
  if (!verifiedReferences?.length) throw new Error(`${sceneId} lacks a verified exact-product reference.`);
  const withVerifiedReference = withSceneIdentity.replace(
    /^Reference pack: .*$/m,
    `Reference pack: use only these owner-verified exact listing references for product identity: ${verifiedReferences.join(
      ", "
    )}. Generated atlases and contextual advertisements are not identity references. Preserve the exact product but create a new room, composition, light, and camera position; do not copy a listing backdrop or pose.`
  );
  return sanitizeNonHubbaReflectionConflict(
    asin,
    withVerifiedReference.replace("Decision semantics:", `${correction}\nDecision semantics:`)
  );
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
const avoidBatchIds = argument("avoid-batch-id", "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
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
const refreshExisting = argument("refresh-existing", "false") === "true";
if (fs.existsSync(batchPath) && !refreshExisting) throw new Error(`Batch already exists: ${batchPath}`);

const manifest = readJson(manifestPath);
const ledger = readJson(ledgerPath);
const avoidBatches = avoidBatchIds.map((avoidBatchId) =>
  readJson(path.join(v4Root, "private-evidence", "owner-review-batches", avoidBatchId, "batch.json"))
);
const avoidedOwnerSelectedKeys = new Set(
  avoidBatches.flatMap((avoidBatch) =>
    ((avoidBatch?.jobs ?? []) as JsonRecord[]).map((job) => String(job.ownerSelectedStorageKey))
  )
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

if (refreshExisting) {
  const existingBatch = readJson(batchPath);
  if (existingBatch.status !== "generation_queued") {
    throw new Error(`Cannot refresh ${batchId} after generation has started.`);
  }
  const existingJobs = existingBatch.jobs as JsonRecord[];
  if (existingJobs.some((job) => fs.existsSync(path.join(repositoryRoot, String(job.candidatePath))))) {
    throw new Error(`Cannot refresh ${batchId}; at least one candidate file already exists.`);
  }
  for (const frozenJob of existingJobs) {
    const manifestJob = styledJobs.find((job) => job.sceneId === frozenJob.sceneId);
    if (!manifestJob) throw new Error(`Manifest job missing for ${frozenJob.sceneId}.`);
    const asin = String(manifestJob.asin);
    const prompt = feedbackPrompt(
      String(manifestJob.prompt),
      String(manifestJob.sceneId),
      asin,
      feedbackByAsin.get(asin) ?? [],
      approvalFeedbackByAsin.get(asin) ?? []
    );
    const promptSha256 = sha256(prompt);
    const referenceEvidence = (VERIFIED_REFERENCE_PATHS[asin] ?? []).map((referencePath) => {
      const absoluteReferencePath = path.join(repositoryRoot, referencePath);
      if (!fs.existsSync(absoluteReferencePath)) {
        throw new Error(`Missing generation reference for ${manifestJob.sceneId}: ${referencePath}`);
      }
      return { path: referencePath, sha256: sha256File(absoluteReferencePath) };
    });
    if (!referenceEvidence.length) throw new Error(`No verified references for ${manifestJob.sceneId}.`);
    manifestJob.promptVersion = PROMPT_VERSION;
    manifestJob.prompt = prompt;
    manifestJob.promptSha256 = promptSha256;
    frozenJob.promptVersion = PROMPT_VERSION;
    frozenJob.promptSha256 = promptSha256;
    frozenJob.exactPrompt = prompt;
    frozenJob.atlasPath = referenceEvidence[0].path;
    frozenJob.atlasSha256 = referenceEvidence[0].sha256;
    frozenJob.generationReferences = referenceEvidence;
  }
  const refreshedAt = new Date().toISOString();
  existingBatch.promptVersion = PROMPT_VERSION;
  existingBatch.refreshedAt = refreshedAt;
  existingBatch.ownerDenialTaxonomyCounts = denialTaxonomyCounts(receipt.decisions as JsonRecord[]);
  manifest.promptVersion = PROMPT_VERSION;
  manifest.status = "owner_feedback_wave_d_generation_queued";
  manifest.jobs = jobs;
  ledger.updatedAt = refreshedAt;
  ledger.events.push({
    type: "owner_feedback_review_batch_prompts_refreshed",
    occurredAt: refreshedAt,
    batchId,
    sourceBatchId,
    refreshedCount: existingJobs.length,
    identityCallCount: identityCalls.length,
    styledIdentityGenerationCallCount: 0
  });
  writeJsonAtomic(batchPath, existingBatch);
  writeJsonAtomic(manifestPath, manifest);
  writeJsonAtomic(ledgerPath, ledger);
  process.stdout.write(`Refreshed ${batchId}: ${existingJobs.length} unstarted jobs, prior feedback blocks replaced.\n`);
  process.exit(0);
}

const acceptedCount = (asin: string): number =>
  styledJobs.filter(
    (job) =>
      job.asin === asin &&
      job.status === "owner_accepted" &&
      job.ownerSelectionUseStatus !== "quarantined_identity_mismatch_revalidation_required"
  ).length;
const acceptedCountForStyle = (asin: string, styleSlug: string): number =>
  styledJobs.filter(
    (job) =>
      job.asin === asin &&
      job.styleSlug === styleSlug &&
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
  const selectedCountForStyle = (styleSlug: string): number =>
    productSelected.filter((job) => job.styleSlug === styleSlug).length;
  const coverageScore = (styleSlug: string): number =>
    acceptedCountForStyle(asin, styleSlug) + selectedCountForStyle(styleSlug);
  const compareCoverage = (left: JsonRecord, right: JsonRecord): number =>
    coverageScore(String(left.styleSlug)) - coverageScore(String(right.styleSlug)) ||
    styleOrder.indexOf(String(left.styleSlug)) - styleOrder.indexOf(String(right.styleSlug)) ||
    Number(left.slot) - Number(right.slot) ||
    Number(left.candidateOrdinal) - Number(right.candidateOrdinal) ||
    String(left.sceneId).localeCompare(String(right.sceneId));
  const reservedKeys = new Set(
    styledJobs
      .filter((job) => job.asin === asin && job.status === "owner_accepted")
      .map((job) => String(job.ownerSelectedStorageKey))
  );
  for (const key of avoidedOwnerSelectedKeys) reservedKeys.add(key);

  const remainingDeclines = declineJobs
    .filter((entry) => entry.job.asin === asin)
    .filter((entry) => !reservedKeys.has(String(entry.job.ownerSelectedStorageKey)));
  while (productSelected.length < target && remainingDeclines.length) {
    remainingDeclines.sort((left, right) => compareCoverage(left.job, right.job));
    const { decision, job: source } = remainingDeclines.shift()!;
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
      replacementCause: "owner_feedback_wave_d",
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
  const queued = [...queuedByLane.values()].filter(
    (job) => !reservedKeys.has(String(job.ownerSelectedStorageKey))
  );
  while (productSelected.length < target && queued.length) {
    queued.sort(compareCoverage);
    const job = queued.shift()!;
    const prompt = feedbackPrompt(String(job.prompt), String(job.sceneId), asin, reasons, approvals);
    job.promptVersion = PROMPT_VERSION;
    job.prompt = prompt;
    job.promptSha256 = sha256(prompt);
    job.generationStrategy = "owner_feedback_wave_d_coverage_gap_candidate";
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
    throw new Error(`${WAVE_LABEL} must contain ${count} unique scenes and owner-selected lanes.`);
}

const occurredAt = new Date().toISOString();
fs.mkdirSync(batchRoot, { recursive: true });
const productByAsin = new Map(products.map((product) => [product.asin, product]));
const usableApprovedJobs = styledJobs.filter(
  (job) =>
    job.status === "owner_accepted" &&
    job.ownerSelectionUseStatus !== "quarantined_identity_mismatch_revalidation_required"
);
const allOwnerSelectedJobs = styledJobs.filter((job) => job.status === "owner_accepted");
const denialCounts = denialTaxonomyCounts(receipt.decisions as JsonRecord[]);
const coverageProducts = eligibleProducts.map((product) => {
  const asin = String(product.asin);
  const accepted = usableApprovedJobs.filter((job) => job.asin === asin);
  const planned = selected.filter((job) => job.asin === asin);
  const styles = Object.fromEntries(
    styleOrder.map((styleSlug) => {
      const approvedUsable = accepted.filter((job) => job.styleSlug === styleSlug).length;
      const queuedInCurrentBatch = planned.filter((job) => job.styleSlug === styleSlug).length;
      return [
        styleSlug,
        {
          approvedUsable,
          queuedInCurrentBatch,
          stillNeededBeforeBatch: Math.max(0, FINAL_LIBRARY_TARGET_PER_PRODUCT_STYLE - approvedUsable),
          projectedStillNeededIfAllApproved: Math.max(
            0,
            FINAL_LIBRARY_TARGET_PER_PRODUCT_STYLE - approvedUsable - queuedInCurrentBatch
          ),
          setForTarget: approvedUsable >= FINAL_LIBRARY_TARGET_PER_PRODUCT_STYLE
        }
      ];
    })
  );
  const targetAcrossStyles = styleOrder.length * FINAL_LIBRARY_TARGET_PER_PRODUCT_STYLE;
  return {
    asin,
    productName: product.productName,
    approvedUsable: accepted.length,
    queuedInCurrentBatch: planned.length,
    targetAcrossStyles,
    stillNeededBeforeBatch: Math.max(0, targetAcrossStyles - accepted.length),
    projectedStillNeededIfAllApproved: Math.max(0, targetAcrossStyles - accepted.length - planned.length),
    setAcrossAllStyles: Object.values(styles).every((style: any) => style.setForTarget),
    styles
  };
});
const coverageReport = {
  schemaVersion: "affiliate-pilot-v4-owner-media-coverage-v1",
  generatedAt: occurredAt,
  sourceOwnerDecisionBatchId: sourceBatchId,
  currentGenerationBatchId: batchId,
  finalLibraryTargetPerProductStyle: FINAL_LIBRARY_TARGET_PER_PRODUCT_STYLE,
  styleOrder,
  totals: {
    ownerSelectedPrivateCopiesAllProducts: allOwnerSelectedJobs.length,
    usableApprovedEligibleProducts: usableApprovedJobs.filter((job) => !blockedAsins.has(String(job.asin))).length,
    queuedInCurrentBatch: selected.length,
    eligibleProducts: eligibleProducts.length,
    excludedProducts: blockedAsins.size
  },
  excludedProducts: [
    { asin: RETIRED_CART_ASIN, reason: cart.ownerDirective },
    { asin: IDENTITY_REBUILD_ASIN, reason: soapDish.ownerDirective },
    ...[...extraExcludedAsins].map((asin) => ({
      asin,
      reason: "Temporarily excluded from this batch by explicit preparation argument."
    }))
  ],
  products: coverageProducts
};
const batch = {
  schemaVersion: "affiliate-pilot-v4-owner-review-batch-v2",
  batchId,
  sourceOwnerDecisionBatchId: sourceBatchId,
  sourceOwnerDecisionReceiptPath: path.relative(repositoryRoot, sourceReceiptPath).replace(/\\/g, "/"),
  avoidedOwnerReviewBatchId: avoidBatchIds.length === 1 ? avoidBatchIds[0] : null,
  avoidedOwnerReviewBatchIds: avoidBatchIds,
  createdAt: occurredAt,
  status: "generation_queued",
  targetOwnerReviewCandidateCount: count,
  targetPerProduct: Object.fromEntries(targets),
  finalLibraryTargetPerProductStyle: FINAL_LIBRARY_TARGET_PER_PRODUCT_STYLE,
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
    "Eight generation-ready products; lowest-coverage products receive remainder jobs. Within each product, owner-declined lanes receive materially new replacements first and every choice is ranked by the lowest current usable product-style count, then deterministic style, slot, and candidate order. Accepted and avoided owner lanes remain reserved.",
  decisionSemantics:
    "Assistant screening is provisional. Only explicit owner_accepted or owner_declined decisions are final. This batch is private and not publishable.",
  ownerFeedbackSummary: Object.fromEntries(feedbackByAsin),
  ownerApprovalEvidenceSummary: Object.fromEntries(approvalFeedbackByAsin),
  ownerDenialTaxonomyCounts: denialCounts,
  coverageBeforeGeneration: coverageProducts,
  replacementCount: replacements.length,
  jobs: selected.map((job, index) => {
    const product = productByAsin.get(job.asin)!;
    const referencePaths = VERIFIED_REFERENCE_PATHS[String(job.asin)] ?? [];
    if (!referencePaths.length) throw new Error(`No verified references configured for ${job.sceneId}.`);
    const referenceEvidence = referencePaths.map((referencePath) => {
      const absoluteReferencePath = path.join(repositoryRoot, referencePath);
      if (!fs.existsSync(absoluteReferencePath)) {
        throw new Error(`Missing generation reference for ${job.sceneId}: ${referencePath}`);
      }
      return { path: referencePath, sha256: sha256File(absoluteReferencePath) };
    });
    if (referenceEvidence.some((reference) => reference.path.includes("/atlases/"))) {
      throw new Error(`${job.sceneId} must not use a generated atlas as an identity reference.`);
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
      atlasPath: referenceEvidence[0].path,
      atlasSha256: referenceEvidence[0].sha256,
      generationReferences: referenceEvidence,
      candidatePath: `output/${job.storageKey}`,
      ownerSelectedStorageKey: job.ownerSelectedStorageKey,
      statusAtFreeze: job.status
    };
  })
};

manifest.promptVersion = PROMPT_VERSION;
manifest.status = "owner_feedback_wave_d_generation_queued";
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
writeJsonAtomic(path.join(v4Root, "private-evidence", "owner-media-coverage.json"), coverageReport);
writeJsonAtomic(manifestPath, manifest);
writeJsonAtomic(ledgerPath, ledger);
process.stdout.write(
  `Prepared ${batchId}: ${selected.length} jobs across ${eligibleProducts.length} products, ${replacements.length} owner-feedback replacements, ${blockedAsins.size} products excluded.\n`
);
