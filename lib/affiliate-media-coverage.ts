import { z } from "zod";
import { loadServerStorageTab, saveServerStorageTab } from "./runtime-store.ts";

const STORAGE_TAB = "Affiliate_Owner_Media_Coverage_V1";

const styleCoverageSchema = z.object({
  approvedUsable: z.number().int().nonnegative(),
  queuedInCurrentBatch: z.number().int().nonnegative(),
  stillNeededBeforeBatch: z.number().int().nonnegative(),
  projectedStillNeededIfAllApproved: z.number().int().nonnegative(),
  setForTarget: z.boolean()
}).strict();

const productCoverageSchema = z.object({
  asin: z.string().regex(/^[A-Z0-9]{10}$/),
  productName: z.string().min(1),
  approvedUsable: z.number().int().nonnegative(),
  queuedInCurrentBatch: z.number().int().nonnegative(),
  targetAcrossStyles: z.number().int().positive(),
  stillNeededBeforeBatch: z.number().int().nonnegative(),
  projectedStillNeededIfAllApproved: z.number().int().nonnegative(),
  setAcrossAllStyles: z.boolean(),
  styles: z.record(z.string(), styleCoverageSchema)
}).strict();

const ownerMediaCoverageSchema = z.object({
  schemaVersion: z.literal("affiliate-pilot-v4-owner-media-coverage-v1"),
  generatedAt: z.string().datetime({ offset: true }),
  sourceOwnerDecisionBatchId: z.string().min(1),
  currentGenerationBatchId: z.string().min(1),
  finalLibraryTargetPerProductStyle: z.number().int().positive(),
  styleOrder: z.array(z.string().min(1)).min(1),
  totals: z.object({
    ownerSelectedPrivateCopiesAllProducts: z.number().int().nonnegative(),
    usableApprovedEligibleProducts: z.number().int().nonnegative(),
    queuedInCurrentBatch: z.number().int().nonnegative(),
    eligibleProducts: z.number().int().nonnegative(),
    excludedProducts: z.number().int().nonnegative()
  }).strict(),
  excludedProducts: z.array(z.object({
    asin: z.string().regex(/^[A-Z0-9]{10}$/),
    reason: z.string().min(1)
  }).strict()),
  products: z.array(productCoverageSchema)
}).strict();

export type OwnerMediaCoverage = z.infer<typeof ownerMediaCoverageSchema>;

export function parseOwnerMediaCoverage(value: unknown): OwnerMediaCoverage {
  return ownerMediaCoverageSchema.parse(value);
}
export async function readOwnerMediaCoverage(): Promise<OwnerMediaCoverage | null> {
  try {
    const stored = await loadServerStorageTab<unknown>(STORAGE_TAB);
    if (!stored[0]) return null;
    return parseOwnerMediaCoverage(stored[0]);
  } catch (error) {
    console.error("Owner media coverage is unavailable or invalid.", error);
    return null;
  }
}

export async function saveOwnerMediaCoverage(value: unknown): Promise<OwnerMediaCoverage> {
  const coverage = parseOwnerMediaCoverage(value);
  await saveServerStorageTab(STORAGE_TAB, [coverage]);
  return coverage;
}
