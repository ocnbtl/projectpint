import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { loadServerStorageTab, saveServerStorageTab } from "./runtime-store.ts";

const OWNER_REVIEW_DECISIONS_TAB = "Affiliate_Owner_Review_Decisions";
const OWNER_REVIEW_BATCHES_TAB = "Affiliate_Owner_Review_Batches";
const DEFAULT_OUTPUT_PREFIX = "output/affiliate-pilot/v4/";
const batchIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,99}$/);
const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

const ownerReviewJobSchema = z.object({
  reviewNumber: z.number().int().positive(),
  sceneId: z.string().min(1).max(240).regex(/^[A-Za-z0-9:_-]+$/),
  jobId: z.string().min(1).max(300),
  asin: z.string().regex(/^[A-Z0-9]{10}$/),
  productName: z.string().min(1).max(240),
  brand: z.string().min(1).max(160),
  productSlug: z.string().min(1).max(200),
  productRole: z.string().min(1).max(200),
  styleSlug: z.string().min(1).max(160),
  slot: z.number().int().positive(),
  candidateOrdinal: z.number().int().positive(),
  candidatePath: z.string().min(1).max(800),
  ownerSelectedStorageKey: z.string().min(1).max(800),
  statusAtFreeze: z.literal("assistant_pass_owner_pending"),
  sourceOwnerReviewBatchId: batchIdSchema,
  sourceReviewNumber: z.number().int().positive(),
  candidateSha256: sha256Schema,
  amazonListingUrl: z.string().url(),
  replacementForFrozenSceneId: z.string().min(1).max(240).optional()
}).passthrough();

const ownerReviewIndexSchema = z.object({
  batchId: batchIdSchema,
  renderedAt: z.string().datetime(),
  candidateCount: z.number().int().positive(),
  contactSheets: z.array(z.string()),
  publicationStatus: z.literal("not_authorized_not_copied"),
  jobs: z.array(ownerReviewJobSchema)
}).passthrough();

export type OwnerReviewDecisionValue = "pending" | "approved" | "denied";

const ownerReviewDecisionEventSchema = z.object({
  from: z.enum(["pending", "approved", "denied"]),
  to: z.enum(["pending", "approved", "denied"]),
  note: z.string().max(2000),
  occurredAt: z.string().datetime()
});

const ownerReviewDecisionSchema = z.object({
  batchId: batchIdSchema,
  sceneId: z.string().min(1).max(240),
  reviewNumber: z.number().int().positive(),
  candidateSha256: sha256Schema,
  decision: z.enum(["pending", "approved", "denied"]),
  note: z.string().max(2000),
  decidedAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime(),
  revision: z.number().int().positive(),
  history: z.array(ownerReviewDecisionEventSchema).max(500)
});

type OwnerReviewJob = z.infer<typeof ownerReviewJobSchema>;
type OwnerReviewIndex = z.infer<typeof ownerReviewIndexSchema>;
export type OwnerReviewDecision = z.infer<typeof ownerReviewDecisionSchema>;

export interface OwnerReviewCandidate {
  reviewNumber: number;
  sceneId: string;
  asin: string;
  productName: string;
  brand: string;
  productSlug: string;
  productRole: string;
  styleSlug: string;
  slot: number;
  candidateOrdinal: number;
  candidateSha256: string;
  amazonListingUrl: string;
  ownerSelectedStorageKey: string;
  sourceOwnerReviewBatchId: string;
  sourceReviewNumber: number;
  replacementForFrozenSceneId?: string;
}

export interface OwnerReviewBatchSummary {
  batchId: string;
  renderedAt: string;
  candidateCount: number;
  productCount: number;
  styleCount: number;
  publicationStatus: "not_authorized_not_copied";
}

export interface OwnerReviewWorkspace {
  batch: OwnerReviewBatchSummary & { contactSheetCount: number };
  candidates: OwnerReviewCandidate[];
  decisions: OwnerReviewDecision[];
}

interface OwnerReviewAssetBase {
  candidateSha256: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  filename: string;
}

export type OwnerReviewAsset = OwnerReviewAssetBase & (
  | { source: "filesystem"; absolutePath: string }
  | { source: "supabase"; objectKey: string }
);

export class OwnerReviewNotFoundError extends Error {}
export class OwnerReviewValidationError extends Error {}
export class OwnerReviewDecisionConflictError extends Error {
  readonly current: OwnerReviewDecision | null;

  constructor(message: string, current: OwnerReviewDecision | null) {
    super(message);
    this.current = current;
  }
}

function outputRoot(): string {
  const configured = process.env.AFFILIATE_PILOT_V4_OUTPUT_ROOT?.trim();
  return configured ? path.resolve(configured) : path.resolve(process.cwd(), "output", "affiliate-pilot", "v4");
}

export function getOwnerReviewSourceMode(): "filesystem" | "supabase" {
  return process.env.AFFILIATE_OWNER_REVIEW_SOURCE?.trim().toLowerCase() === "supabase"
    ? "supabase"
    : "filesystem";
}

function reviewBatchRoot(): string {
  return path.join(outputRoot(), "private-evidence", "owner-review-batches");
}

function safeBatchPath(batchId: string): string {
  const parsed = batchIdSchema.parse(batchId);
  const root = reviewBatchRoot();
  const resolved = path.resolve(root, parsed);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new OwnerReviewValidationError("Review batch path leaves the configured evidence root.");
  }
  return resolved;
}

function contentTypeFor(candidatePath: string): OwnerReviewAsset["contentType"] {
  const extension = path.extname(candidatePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".png") return "image/png";
  throw new OwnerReviewValidationError("Review candidate is not a supported image type.");
}

function resolveCandidatePath(candidatePath: string): string {
  const normalized = candidatePath.replaceAll("\\", "/");
  if (!normalized.startsWith(DEFAULT_OUTPUT_PREFIX)) {
    throw new OwnerReviewValidationError("Review candidate path is outside the affiliate-pilot V4 output lane.");
  }
  const relative = normalized.slice(DEFAULT_OUTPUT_PREFIX.length);
  const root = outputRoot();
  const resolved = path.resolve(root, relative);
  const rootRelative = path.relative(root, resolved);
  if (rootRelative.startsWith("..") || path.isAbsolute(rootRelative)) {
    throw new OwnerReviewValidationError("Review candidate path leaves the configured output root.");
  }
  return resolved;
}

function validateIndex(raw: unknown, requestedBatchId?: string, validateFilesystemPaths = true): OwnerReviewIndex {
  const index = ownerReviewIndexSchema.parse(raw);
  if (requestedBatchId && index.batchId !== requestedBatchId) {
    throw new OwnerReviewValidationError("Review index batch identity does not match its evidence directory.");
  }
  if (index.candidateCount !== index.jobs.length) {
    throw new OwnerReviewValidationError("Review index candidate count does not match its frozen jobs.");
  }

  const reviewNumbers = new Set<number>();
  const sceneIds = new Set<string>();
  const hashes = new Set<string>();
  for (const job of index.jobs) {
    if (reviewNumbers.has(job.reviewNumber)) throw new OwnerReviewValidationError(`Duplicate review number ${job.reviewNumber}.`);
    if (sceneIds.has(job.sceneId)) throw new OwnerReviewValidationError(`Duplicate scene ${job.sceneId}.`);
    if (hashes.has(job.candidateSha256)) throw new OwnerReviewValidationError(`Duplicate candidate hash for ${job.sceneId}.`);
    if (job.amazonListingUrl !== `https://www.amazon.com/dp/${job.asin}`) {
      throw new OwnerReviewValidationError(`Amazon listing does not match ASIN ${job.asin}.`);
    }
    if (!job.candidatePath.replaceAll("\\", "/").startsWith(DEFAULT_OUTPUT_PREFIX)) {
      throw new OwnerReviewValidationError("Review candidate path is outside the affiliate-pilot V4 output lane.");
    }
    if (validateFilesystemPaths) resolveCandidatePath(job.candidatePath);
    contentTypeFor(job.candidatePath);
    reviewNumbers.add(job.reviewNumber);
    sceneIds.add(job.sceneId);
    hashes.add(job.candidateSha256);
  }

  return index;
}

async function readLocalReviewIndex(batchId: string): Promise<OwnerReviewIndex> {
  const indexPath = path.join(safeBatchPath(batchId), "review-index.json");
  try {
    const raw = JSON.parse(await fs.readFile(indexPath, "utf8")) as unknown;
    return validateIndex(raw, batchId);
  } catch (error) {
    if (error instanceof OwnerReviewValidationError || error instanceof z.ZodError) throw error;
    throw new OwnerReviewNotFoundError(`Owner-review batch ${batchId} is unavailable.`);
  }
}

async function readHostedReviewIndexes(): Promise<OwnerReviewIndex[]> {
  const stored = await loadServerStorageTab<unknown>(OWNER_REVIEW_BATCHES_TAB);
  return stored.flatMap((entry) => {
    const parsed = ownerReviewIndexSchema.safeParse(entry);
    if (!parsed.success) return [];
    try {
      return [validateIndex(parsed.data, parsed.data.batchId, false)];
    } catch {
      return [];
    }
  });
}

async function readReviewIndex(batchId: string): Promise<OwnerReviewIndex> {
  const parsedBatchId = batchIdSchema.parse(batchId);
  if (getOwnerReviewSourceMode() === "filesystem") return readLocalReviewIndex(parsedBatchId);
  const index = (await readHostedReviewIndexes()).find((entry) => entry.batchId === parsedBatchId);
  if (!index) throw new OwnerReviewNotFoundError(`Owner-review batch ${parsedBatchId} is unavailable.`);
  return index;
}

function summarizeBatch(index: OwnerReviewIndex): OwnerReviewBatchSummary {
  return {
    batchId: index.batchId,
    renderedAt: index.renderedAt,
    candidateCount: index.candidateCount,
    productCount: new Set(index.jobs.map((job) => job.asin)).size,
    styleCount: new Set(index.jobs.map((job) => job.styleSlug)).size,
    publicationStatus: index.publicationStatus
  };
}

function publicCandidate(job: OwnerReviewJob): OwnerReviewCandidate {
  return {
    reviewNumber: job.reviewNumber,
    sceneId: job.sceneId,
    asin: job.asin,
    productName: job.productName,
    brand: job.brand,
    productSlug: job.productSlug,
    productRole: job.productRole,
    styleSlug: job.styleSlug,
    slot: job.slot,
    candidateOrdinal: job.candidateOrdinal,
    candidateSha256: job.candidateSha256,
    amazonListingUrl: job.amazonListingUrl,
    ownerSelectedStorageKey: job.ownerSelectedStorageKey,
    sourceOwnerReviewBatchId: job.sourceOwnerReviewBatchId,
    sourceReviewNumber: job.sourceReviewNumber,
    replacementForFrozenSceneId: job.replacementForFrozenSceneId
  };
}

async function loadAllDecisions(): Promise<OwnerReviewDecision[]> {
  const stored = await loadServerStorageTab<unknown>(OWNER_REVIEW_DECISIONS_TAB);
  return stored.flatMap((entry) => {
    const parsed = ownerReviewDecisionSchema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
}

export async function listOwnerReviewBatches(): Promise<OwnerReviewBatchSummary[]> {
  if (getOwnerReviewSourceMode() === "supabase") {
    return (await readHostedReviewIndexes())
      .map(summarizeBatch)
      .sort((left, right) => right.renderedAt.localeCompare(left.renderedAt) || right.batchId.localeCompare(left.batchId));
  }

  let entries;
  try {
    entries = await fs.readdir(reviewBatchRoot(), { withFileTypes: true });
  } catch {
    return [];
  }

  const summaries: Array<{ summary: OwnerReviewBatchSummary; sourceBatchIds: string[] }> = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !batchIdSchema.safeParse(entry.name).success) continue;
    try {
      const batchDirectory = safeBatchPath(entry.name);
      try {
        await fs.access(path.join(batchDirectory, "owner-decision-receipt.json"));
        continue;
      } catch {
        // No immutable receipt means the batch can still be reviewed.
      }
      let sourceBatchIds: string[] = [];
      try {
        const metadata = JSON.parse(await fs.readFile(path.join(batchDirectory, "batch.json"), "utf8")) as Record<string, unknown>;
        if (metadata.status === "owner_decisions_applied") continue;
        if (Array.isArray(metadata.sourceOwnerReviewBatchIds)) {
          sourceBatchIds = metadata.sourceOwnerReviewBatchIds.filter(
            (value): value is string => typeof value === "string" && batchIdSchema.safeParse(value).success
          );
        }
      } catch {
        // The validated review index remains the required source of truth.
      }
      summaries.push({ summary: summarizeBatch(await readLocalReviewIndex(entry.name)), sourceBatchIds });
    } catch {
      // Invalid or incomplete private evidence never enters the command-center queue.
    }
  }
  const supersededSourceBatches = new Set(summaries.flatMap((entry) => entry.sourceBatchIds));
  return summaries
    .map((entry) => entry.summary)
    .filter((summary) => !supersededSourceBatches.has(summary.batchId))
    .sort((left, right) => right.renderedAt.localeCompare(left.renderedAt) || right.batchId.localeCompare(left.batchId));
}

export async function loadOwnerReviewWorkspace(batchId: string): Promise<OwnerReviewWorkspace> {
  const index = await readReviewIndex(batchId);
  const jobsByScene = new Map(index.jobs.map((job) => [job.sceneId, job]));
  const decisions = (await loadAllDecisions())
    .filter((decision) => {
      const job = jobsByScene.get(decision.sceneId);
      return decision.batchId === batchId
        && job?.reviewNumber === decision.reviewNumber
        && job.candidateSha256 === decision.candidateSha256;
    })
    .sort((left, right) => left.reviewNumber - right.reviewNumber);

  return {
    batch: { ...summarizeBatch(index), contactSheetCount: index.contactSheets.length },
    candidates: index.jobs.map(publicCandidate),
    decisions
  };
}

export async function saveOwnerReviewDecision(input: {
  batchId: string;
  sceneId: string;
  decision: OwnerReviewDecisionValue;
  note: string;
  expectedRevision: number;
}): Promise<OwnerReviewDecision> {
  const index = await readReviewIndex(input.batchId);
  const candidate = index.jobs.find((job) => job.sceneId === input.sceneId);
  if (!candidate) throw new OwnerReviewNotFoundError("The selected review candidate is not part of this frozen batch.");
  if (!Number.isInteger(input.expectedRevision) || input.expectedRevision < 0) {
    throw new OwnerReviewValidationError("Decision revision is invalid.");
  }

  const note = input.note.trim();
  if (note.length > 2000) throw new OwnerReviewValidationError("Decision notes must be 2,000 characters or fewer.");
  if (input.decision === "denied" && !note) {
    throw new OwnerReviewValidationError("A rejection reason is required before denying an image.");
  }

  const all = await loadAllDecisions();
  const existingIndex = all.findIndex((decision) => decision.batchId === input.batchId && decision.sceneId === input.sceneId);
  const existing = existingIndex >= 0 ? all[existingIndex]! : null;
  const currentRevision = existing?.revision ?? 0;
  if (currentRevision !== input.expectedRevision) {
    throw new OwnerReviewDecisionConflictError("This image was updated in another command-center session.", existing);
  }

  const occurredAt = new Date().toISOString();
  const next: OwnerReviewDecision = {
    batchId: input.batchId,
    sceneId: candidate.sceneId,
    reviewNumber: candidate.reviewNumber,
    candidateSha256: candidate.candidateSha256,
    decision: input.decision,
    note,
    decidedAt: input.decision === "pending" ? null : occurredAt,
    updatedAt: occurredAt,
    revision: currentRevision + 1,
    history: [
      ...(existing?.history ?? []),
      {
        from: existing?.decision ?? "pending",
        to: input.decision,
        note,
        occurredAt
      }
    ]
  };
  ownerReviewDecisionSchema.parse(next);

  if (existingIndex >= 0) all[existingIndex] = next;
  else all.push(next);
  all.sort((left, right) => left.batchId.localeCompare(right.batchId) || left.reviewNumber - right.reviewNumber);
  await saveServerStorageTab(OWNER_REVIEW_DECISIONS_TAB, all);
  return next;
}

export async function ownerReviewDecisionExport(batchId: string) {
  const workspace = await loadOwnerReviewWorkspace(batchId);
  const decisionByScene = new Map(workspace.decisions.map((decision) => [decision.sceneId, decision]));
  const pending = workspace.candidates.filter((candidate) => {
    const value = decisionByScene.get(candidate.sceneId)?.decision ?? "pending";
    return value === "pending";
  });
  if (pending.length > 0) {
    throw new OwnerReviewValidationError(`${pending.length} image${pending.length === 1 ? " is" : "s are"} still pending review.`);
  }

  return {
    schemaVersion: "affiliate-pilot-v4-owner-review-web-export-v1",
    batchId: workspace.batch.batchId,
    exportedAt: new Date().toISOString(),
    publicationStatus: "not_authorized_not_copied",
    decisions: workspace.candidates.map((candidate) => {
      const decision = decisionByScene.get(candidate.sceneId)!;
      return {
        reviewNumber: candidate.reviewNumber,
        sceneId: candidate.sceneId,
        decision: decision.decision === "approved" ? "APPROVE" : "DENY",
        note: decision.note
      };
    })
  };
}

export async function resolveOwnerReviewAsset(batchId: string, sceneId: string): Promise<OwnerReviewAsset> {
  const index = await readReviewIndex(batchId);
  const candidate = index.jobs.find((job) => job.sceneId === sceneId);
  if (!candidate) throw new OwnerReviewNotFoundError("Review image is unavailable.");
  const base: OwnerReviewAssetBase = {
    candidateSha256: candidate.candidateSha256,
    contentType: contentTypeFor(candidate.candidatePath),
    filename: `${candidate.sceneId}${path.extname(candidate.candidatePath).toLowerCase()}`
  };
  if (getOwnerReviewSourceMode() === "supabase") {
    return { ...base, source: "supabase", objectKey: ownerReviewHostedObjectKey(index.batchId, candidate) };
  }
  return { ...base, source: "filesystem", absolutePath: resolveCandidatePath(candidate.candidatePath) };
}

export async function verifyOwnerReviewAsset(asset: OwnerReviewAsset): Promise<Buffer> {
  let buffer: Buffer;
  if (asset.source === "supabase") {
    const response = await supabaseStorageRequest("download", asset.objectKey);
    if (await supabaseStorageObjectMissing(response)) throw new OwnerReviewNotFoundError("Review image file is unavailable.");
    if (!response.ok) throw new OwnerReviewValidationError(`Private review storage returned HTTP ${response.status}.`);
    buffer = Buffer.from(await response.arrayBuffer());
  } else {
    try {
      buffer = await fs.readFile(asset.absolutePath);
    } catch {
      throw new OwnerReviewNotFoundError("Review image file is unavailable.");
    }
  }
  const actualHash = createHash("sha256").update(buffer).digest("hex");
  if (actualHash !== asset.candidateSha256) {
    throw new OwnerReviewValidationError("Review image no longer matches its frozen candidate hash.");
  }
  return buffer;
}

function requireOwnerReviewEnv(name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY" | "AFFILIATE_REVIEW_MEDIA_BUCKET"): string {
  const value = process.env[name]?.trim();
  if (!value) throw new OwnerReviewValidationError(`Missing required env: ${name}`);
  return value;
}

function ownerReviewStorageHeaders(contentType?: OwnerReviewAsset["contentType"]): HeadersInit {
  const key = requireOwnerReviewEnv("SUPABASE_SERVICE_ROLE_KEY");
  const headers: HeadersInit = { apikey: key };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

function encodedStoragePath(value: string): string {
  return value.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

function reviewMediaBucket(): string {
  const bucket = requireOwnerReviewEnv("AFFILIATE_REVIEW_MEDIA_BUCKET");
  if (!/^[a-z0-9][a-z0-9._-]{0,62}$/.test(bucket)) {
    throw new OwnerReviewValidationError("AFFILIATE_REVIEW_MEDIA_BUCKET is invalid.");
  }
  return bucket;
}

async function supabaseStorageRequest(
  operation: "download" | "upload",
  objectKey: string,
  body?: Buffer,
  contentType?: OwnerReviewAsset["contentType"]
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  const baseUrl = requireOwnerReviewEnv("SUPABASE_URL").replace(/\/+$/, "");
  const bucket = reviewMediaBucket();
  const pathPrefix = operation === "download" ? "object/authenticated" : "object";
  try {
    return await fetch(`${baseUrl}/storage/v1/${pathPrefix}/${encodeURIComponent(bucket)}/${encodedStoragePath(objectKey)}`, {
      method: operation === "download" ? "GET" : "POST",
      headers: {
        ...ownerReviewStorageHeaders(contentType),
        ...(operation === "upload" ? { "x-upsert": "false", "cache-control": "0" } : {})
      },
      body: body ? new Uint8Array(body) : undefined,
      cache: "no-store",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function supabaseStorageObjectMissing(response: Response): Promise<boolean> {
  if (response.status === 404) return true;
  if (response.status !== 400) return false;
  try {
    const payload = await response.clone().json() as { code?: unknown; statusCode?: unknown };
    return payload.code === "NoSuchKey" || String(payload.statusCode) === "404";
  } catch {
    return false;
  }
}

export function ownerReviewHostedObjectKey(batchId: string, candidate: Pick<OwnerReviewJob, "sceneId" | "candidatePath">): string {
  const safeBatchId = batchIdSchema.parse(batchId);
  const sceneId = ownerReviewJobSchema.shape.sceneId.parse(candidate.sceneId);
  const extension = path.extname(candidate.candidatePath).toLowerCase();
  contentTypeFor(candidate.candidatePath);
  return `batches/${safeBatchId}/${sceneId}${extension}`;
}

export async function importOwnerReviewBatchToHostedStorage(
  batchId: string,
  onProgress?: (progress: { completed: number; total: number; sceneId: string; action: "uploaded" | "verified_existing" }) => void
) {
  if ((process.env.STORAGE_MODE ?? "local").trim().toLowerCase() !== "supabase") {
    throw new OwnerReviewValidationError("STORAGE_MODE must be supabase for a hosted owner-review import.");
  }
  const index = await readLocalReviewIndex(batchId);
  let uploaded = 0;
  let verifiedExisting = 0;
  for (const [position, candidate] of index.jobs.entries()) {
    const localAsset: OwnerReviewAsset = {
      source: "filesystem",
      absolutePath: resolveCandidatePath(candidate.candidatePath),
      candidateSha256: candidate.candidateSha256,
      contentType: contentTypeFor(candidate.candidatePath),
      filename: `${candidate.sceneId}${path.extname(candidate.candidatePath).toLowerCase()}`
    };
    const buffer = await verifyOwnerReviewAsset(localAsset);
    const objectKey = ownerReviewHostedObjectKey(index.batchId, candidate);
    const existing = await supabaseStorageRequest("download", objectKey);
    const existingMissing = await supabaseStorageObjectMissing(existing);
    let action: "uploaded" | "verified_existing";
    if (existing.ok) {
      const existingBuffer = Buffer.from(await existing.arrayBuffer());
      const existingHash = createHash("sha256").update(existingBuffer).digest("hex");
      if (existingHash !== candidate.candidateSha256) {
        throw new OwnerReviewValidationError(`Hosted object ${objectKey} already exists with different bytes.`);
      }
      verifiedExisting += 1;
      action = "verified_existing";
    } else if (existingMissing) {
      const response = await supabaseStorageRequest("upload", objectKey, buffer, localAsset.contentType);
      if (!response.ok) throw new OwnerReviewValidationError(`Upload failed for ${candidate.sceneId}: HTTP ${response.status}.`);
      uploaded += 1;
      action = "uploaded";
    } else {
      throw new OwnerReviewValidationError(`Private review storage returned HTTP ${existing.status}.`);
    }
    onProgress?.({ completed: position + 1, total: index.jobs.length, sceneId: candidate.sceneId, action });
  }

  const stored = await loadServerStorageTab<unknown>(OWNER_REVIEW_BATCHES_TAB);
  const retained = stored.filter((entry) => {
    const parsed = ownerReviewIndexSchema.safeParse(entry);
    return !parsed.success || parsed.data.batchId !== index.batchId;
  });
  await saveServerStorageTab(OWNER_REVIEW_BATCHES_TAB, [
    ...retained,
    {
      ...index,
      hostedMedia: {
        bucket: reviewMediaBucket(),
        importedAt: new Date().toISOString(),
        objectPrefix: `batches/${index.batchId}/`
      }
    }
  ]);
  return { batchId: index.batchId, candidateCount: index.jobs.length, uploaded, verifiedExisting };
}
