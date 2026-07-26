import { z } from "zod";
import { affiliateCandidateFixtureData as candidateFixture } from "../data/affiliate-candidates.v1.ts";
import { affiliateReplacementFixtureData as replacementFixture } from "../data/affiliate-replacements.v1.ts";
import { inspirationStyles } from "./redesign-data.ts";
import { loadServerStorageTab, saveServerStorageTab } from "./runtime-store.ts";

const STORAGE_TAB = "Affiliate_Catalog_V1";

export const AFFILIATE_WORKFLOW_STATUSES = [
  "research",
  "needs_approval",
  "approved",
  "reference_ready",
  "generating",
  "generation_failed",
  "media_qa",
  "publish_ready",
  "published",
  "unavailable",
  "retired"
] as const;

export const AFFILIATE_APPROVAL_STATUSES = [
  "pending",
  "approved",
  "approved_with_caveat",
  "rejected"
] as const;

export const AFFILIATE_MEDIA_STATUSES = [
  "not_started",
  "queued",
  "generating",
  "partial",
  "failed",
  "qa",
  "ready",
  "retired"
] as const;

export const AFFILIATE_CATEGORIES = [
  "bath mat",
  "bathroom storage",
  "bathroom wastebasket",
  "bathroom hardware",
  "bathroom lighting",
  "bathroom mirror",
  "bathroom seating",
  "bathroom tray",
  "bathroom textiles",
  "decorative accent",
  "live plant",
  "soap accessory",
  "surface finish",
  "towel set",
  "wall storage"
] as const;

const currentStyleSlugs = new Set(inspirationStyles.map((style) => style.slug));

function isCanonicalAmazonProductUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !/(^|\.)amazon\.com$/i.test(url.hostname)) return false;
    return /^\/(?:dp|gp\/product)\/[A-Z0-9]{10}(?:[/?]|$)/i.test(url.pathname);
  } catch {
    return false;
  }
}

function isAmazonAssociatesUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const hostname = url.hostname.toLowerCase();
    return hostname === "amzn.to" || hostname === "amazon.com" || hostname.endsWith(".amazon.com");
  } catch {
    return false;
  }
}

const nullableUrl = z.union([z.string().trim().url(), z.literal(""), z.null()]);

const researchSourceSchema = z.object({
  sourceType: z.enum(["amazon", "manufacturer", "retailer", "editorial", "community", "video"]),
  title: z.string().trim().min(1).max(240),
  url: z.string().trim().url(),
  observedAt: z.string().datetime({ offset: true }),
  privateReferenceOnly: z.boolean(),
  notes: z.string().trim().max(1200).default("")
}).strict();

const approvalDecisionSchema = z.object({
  decision: z.enum(AFFILIATE_APPROVAL_STATUSES),
  reason: z.string().trim().min(1).max(1200),
  decidedAt: z.string().datetime({ offset: true }),
  source: z.enum(["owner", "admin"])
}).strict();

const styleAssignmentSchema = z.object({
  styleSlug: z.string().trim().refine((value) => currentStyleSlugs.has(value), "Choose a current Inspiration style."),
  role: z.enum(["primary", "additional"]),
  rank: z.number().int().min(1).max(100),
  rationale: z.string().trim().min(1).max(800)
}).strict();

const mediaSetSchema = z.object({
  styleSlug: z.string().trim().refine((value) => currentStyleSlugs.has(value), "Choose a current Inspiration style."),
  status: z.enum(AFFILIATE_MEDIA_STATUSES),
  expectedCount: z.literal(5),
  readyCount: z.number().int().min(0).max(5),
  promptVersion: z.string().trim().min(1).max(80),
  generationVersion: z.string().trim().max(80),
  qaNotes: z.string().trim().max(1200),
  assets: z.array(z.object({
    slot: z.number().int().min(1).max(5),
    storageKey: z.string().trim().min(1).max(500),
    publicUrl: nullableUrl.optional(),
    alt: z.string().trim().max(300),
    status: z.enum(["planned", "generated", "failed", "qa_passed", "qa_failed", "retired"]),
    width: z.number().int().positive().nullable(),
    height: z.number().int().positive().nullable(),
    contentHash: z.string().trim().max(128),
    promptVersion: z.string().trim().min(1).max(80),
    generationVersion: z.string().trim().max(80)
  }).strict()).max(5)
}).strict();

const affiliateProductSchema = z.object({
  id: z.string().trim().regex(/^prod_[a-z0-9_]+$/, "Use a stable prod_ identifier."),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug."),
  asin: z.string().trim().regex(/^[A-Z0-9]{10}$/, "ASIN must be 10 uppercase letters or numbers."),
  canonicalAmazonUrl: z.string().trim().refine(isCanonicalAmazonProductUrl, "Use a canonical amazon.com /dp/ASIN product URL."),
  associatesUrl: nullableUrl.refine((value) => !value || isAmazonAssociatesUrl(value), "Use an Amazon or amzn.to Associates URL."),
  brand: z.string().trim().min(1).max(140),
  manufacturer: z.string().trim().max(140),
  category: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(220),
  recommendation: z.enum(["approve", "approve_with_caveat", "replace"]),
  recommendationRationale: z.string().trim().min(1).max(1200),
  caveats: z.array(z.string().trim().min(1).max(600)).max(12),
  crossStyleNotes: z.string().trim().min(1).max(600),
  workflowStatus: z.enum(AFFILIATE_WORKFLOW_STATUSES),
  approvalStatus: z.enum(AFFILIATE_APPROVAL_STATUSES),
  approvalHistory: z.array(approvalDecisionSchema).max(100),
  availabilityStatus: z.enum(["verified_available", "uncertain", "unavailable"]),
  availabilityObservedAt: z.string().datetime({ offset: true }),
  priceObservation: z.object({
    display: z.string().trim().max(80),
    observedAt: z.string().datetime({ offset: true }),
    sourceUrl: z.string().trim().url()
  }).nullable(),
  researchSources: z.array(researchSourceSchema).min(1).max(20),
  styleAssignments: z.array(styleAssignmentSchema).min(1).max(12),
  transparentPresentation: z.object({
    status: z.enum(AFFILIATE_MEDIA_STATUSES),
    storageKey: z.string().trim().max(500),
    publicUrl: nullableUrl.optional(),
    alt: z.string().trim().max(300),
    promptVersion: z.string().trim().min(1).max(80),
    generationVersion: z.string().trim().max(80),
    qaNotes: z.string().trim().max(1200)
  }).strict(),
  mediaSets: z.array(mediaSetSchema).max(12),
  referenceReadiness: z.enum(["missing", "partial", "ready", "blocked_rights"]),
  mediaCompleteness: z.enum(["not_started", "partial", "complete"]),
  imageQaStatus: z.enum(["not_started", "in_progress", "passed", "failed"]),
  publicationReadiness: z.enum(["blocked", "ready"]),
  visibility: z.enum(["private", "preview", "public"]),
  unavailable: z.boolean(),
  retired: z.boolean(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true })
}).strict().superRefine((product, context) => {
  const canonicalAsin = product.canonicalAmazonUrl.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1]?.toUpperCase();
  if (canonicalAsin !== product.asin) {
    context.addIssue({ code: "custom", path: ["canonicalAmazonUrl"], message: "Canonical Amazon URL ASIN must match the product ASIN." });
  }
  if (product.styleAssignments.filter((assignment) => assignment.role === "primary").length !== 1) {
    context.addIssue({ code: "custom", path: ["styleAssignments"], message: "Each product needs exactly one primary style." });
  }
  const latestDecision = product.approvalHistory.at(-1)?.decision;
  if (latestDecision && latestDecision !== product.approvalStatus) {
    context.addIssue({ code: "custom", path: ["approvalHistory"], message: "Latest approval history decision must match approval status." });
  }
  if (product.visibility === "public") {
    if (product.approvalStatus !== "approved" && product.approvalStatus !== "approved_with_caveat") {
      context.addIssue({ code: "custom", path: ["visibility"], message: "Public products must be approved." });
    }
    if (!product.associatesUrl) {
      context.addIssue({ code: "custom", path: ["associatesUrl"], message: "Public products need a user-supplied Associates URL." });
    }
    if (product.publicationReadiness !== "ready" || product.mediaCompleteness !== "complete" || product.imageQaStatus !== "passed") {
      context.addIssue({ code: "custom", path: ["publicationReadiness"], message: "Public products need complete, QA-passed media." });
    }
  }
});

const catalogSchema = z.array(affiliateProductSchema).max(1000).superRefine((products, context) => {
  const identityFields = [
    ["id", new Map<string, number>()],
    ["slug", new Map<string, number>()],
    ["asin", new Map<string, number>()],
    ["canonicalAmazonUrl", new Map<string, number>()]
  ] as const;

  products.forEach((product, index) => {
    identityFields.forEach(([field, seen]) => {
      const value = String(product[field]).toLowerCase();
      const prior = seen.get(value);
      if (prior !== undefined) {
        context.addIssue({
          code: "custom",
          path: [index, field],
          message: `Duplicate ${field}: also used by row ${prior + 1}.`
        });
      } else {
        seen.set(value, index);
      }
    });
  });
});

const replacementProposalSchema = z.object({
  id: z.string().trim().regex(/^replacement_[a-z0-9_-]+$/, "Use a stable replacement_ identifier."),
  styleSlug: z.string().trim().refine((value) => currentStyleSlugs.has(value), "Choose a current Inspiration style."),
  rank: z.number().int().min(1).max(100),
  replacesAsin: z.string().trim().regex(/^[A-Z0-9]{10}$/, "Replacement target ASIN must be 10 uppercase letters or numbers."),
  ownerRejectionReason: z.string().trim().min(1).max(1200),
  proposalStatus: z.enum(["pending", "approved", "approved_with_caveat", "rejected"]),
  reuseExistingCanonical: z.boolean(),
  proposedProduct: affiliateProductSchema
}).strict().superRefine((proposal, context) => {
  const targetAssignment = proposal.proposedProduct.styleAssignments.find(
    (assignment) => assignment.styleSlug === proposal.styleSlug && assignment.rank === proposal.rank
  );
  if (!targetAssignment) {
    context.addIssue({
      code: "custom",
      path: ["proposedProduct", "styleAssignments"],
      message: "Proposed product must include the replacement style and rank."
    });
  }
  if (proposal.proposalStatus !== proposal.proposedProduct.approvalStatus) {
    context.addIssue({
      code: "custom",
      path: ["proposedProduct", "approvalStatus"],
      message: "Replacement proposal and canonical product approval statuses must match."
    });
  }
});

const replacementQueueSchema = z.array(replacementProposalSchema).max(100).superRefine((proposals, context) => {
  const seenIds = new Map<string, number>();
  const seenSlots = new Map<string, number>();
  const seenReplacementAsins = new Map<string, number>();

  proposals.forEach((proposal, index) => {
    const slot = `${proposal.styleSlug}:${proposal.rank}`;
    for (const [path, value, seen] of [
      ["id", proposal.id, seenIds],
      ["styleSlot", slot, seenSlots],
      ["proposedAsin", proposal.proposedProduct.asin, seenReplacementAsins]
    ] as const) {
      const prior = seen.get(value);
      if (prior !== undefined && !(path === "proposedAsin" && proposal.reuseExistingCanonical)) {
        context.addIssue({
          code: "custom",
          path: [index, path === "styleSlot" ? "rank" : path === "proposedAsin" ? "proposedProduct" : "id"],
          message: `Duplicate replacement ${path}: also used by row ${prior + 1}.`
        });
      } else {
        seen.set(value, index);
      }
    }
  });
});

export type AffiliateProduct = z.infer<typeof affiliateProductSchema>;
export type AffiliateWorkflowStatus = AffiliateProduct["workflowStatus"];
export type AffiliateApprovalStatus = AffiliateProduct["approvalStatus"];
export type AffiliateReplacementProposal = z.infer<typeof replacementProposalSchema>;

export class AffiliateCatalogConflictError extends Error {}

export function parseAffiliateProduct(value: unknown): AffiliateProduct {
  return affiliateProductSchema.parse(value);
}

export function parseAffiliateCatalog(value: unknown): AffiliateProduct[] {
  return catalogSchema.parse(value);
}

export function affiliateCandidateFixture(): AffiliateProduct[] {
  return parseAffiliateCatalog(candidateFixture);
}

export function affiliateReplacementFixture(): AffiliateReplacementProposal[] {
  const proposals = replacementQueueSchema.parse(replacementFixture);
  const products = affiliateCandidateFixture();
  const productByAsin = new Map(products.map((product) => [product.asin, product]));

  proposals.forEach((proposal) => {
    const replaced = productByAsin.get(proposal.replacesAsin);
    if (!replaced || replaced.approvalStatus !== "rejected") {
      throw new Error(`Replacement ${proposal.id} must target a rejected catalog product.`);
    }
    const rejectedAssignment = replaced.styleAssignments.find(
      (assignment) => assignment.styleSlug === proposal.styleSlug && assignment.rank === proposal.rank
    );
    if (!rejectedAssignment) {
      throw new Error(`Replacement ${proposal.id} does not match the rejected product's style slot.`);
    }
    const latestReason = replaced.approvalHistory.at(-1)?.reason;
    if (latestReason !== proposal.ownerRejectionReason) {
      throw new Error(`Replacement ${proposal.id} does not preserve the owner's rejection reason.`);
    }

    const existingCanonical = productByAsin.get(proposal.proposedProduct.asin);
    if (proposal.reuseExistingCanonical) {
      if (!existingCanonical || existingCanonical.id !== proposal.proposedProduct.id) {
        throw new Error(`Replacement ${proposal.id} must reference an existing canonical product.`);
      }
    } else if (existingCanonical) {
      throw new Error(`Replacement ${proposal.id} duplicates an existing catalog ASIN.`);
    }
  });

  return proposals;
}

export function affiliateApprovedCohortFixture(): AffiliateProduct[] {
  const initialProducts = affiliateCandidateFixture();
  const proposals = affiliateReplacementFixture();
  const acceptedProposals = proposals.filter(
    (proposal) =>
      proposal.proposalStatus === "approved" ||
      proposal.proposalStatus === "approved_with_caveat"
  );
  const reusedByAsin = new Map(
    acceptedProposals
      .filter((proposal) => proposal.reuseExistingCanonical)
      .map((proposal) => [proposal.proposedProduct.asin, proposal.proposedProduct])
  );
  const retainedProducts = initialProducts
    .filter((product) => product.approvalStatus !== "rejected")
    .map((product) => reusedByAsin.get(product.asin) ?? product);
  const newProducts = acceptedProposals
    .filter((proposal) => !proposal.reuseExistingCanonical)
    .map((proposal) => proposal.proposedProduct);

  return parseAffiliateCatalog([...retainedProducts, ...newProducts]);
}

async function loadCatalogStrict(): Promise<AffiliateProduct[]> {
  const stored = await loadServerStorageTab<AffiliateProduct>(STORAGE_TAB);
  return stored.length > 0 ? parseAffiliateCatalog(stored) : affiliateApprovedCohortFixture();
}

export async function readAffiliateCatalog(): Promise<AffiliateProduct[]> {
  try {
    return await loadCatalogStrict();
  } catch (error) {
    console.error("Affiliate catalog storage is unavailable or invalid; using the versioned approved cohort.", error);
    return affiliateApprovedCohortFixture();
  }
}

export async function saveAffiliateCatalog(productsValue: unknown, baseProductsValue: unknown): Promise<AffiliateProduct[]> {
  const products = parseAffiliateCatalog(productsValue);
  const baseProducts = parseAffiliateCatalog(baseProductsValue);
  const currentProducts = await loadCatalogStrict();
  if (JSON.stringify(currentProducts) !== JSON.stringify(baseProducts)) {
    throw new AffiliateCatalogConflictError("The affiliate catalog changed in another session. Reload before saving.");
  }
  await saveServerStorageTab(STORAGE_TAB, products);
  return products;
}

export async function readPublicAffiliateProduct(slug: string): Promise<AffiliateProduct | null> {
  const products = await readAffiliateCatalog();
  const product = products.find((candidate) => candidate.slug === slug);
  if (!product) return null;

  const localPreviewEnabled =
    process.env.NODE_ENV !== "production" && process.env.AFFILIATE_CATALOG_PREVIEW === "1";
  if (localPreviewEnabled) return product;

  const isApproved =
    product.approvalStatus === "approved" || product.approvalStatus === "approved_with_caveat";
  if (
    product.visibility !== "public" ||
    !isApproved ||
    !product.associatesUrl ||
    product.mediaCompleteness !== "complete" ||
    product.imageQaStatus !== "passed" ||
    product.publicationReadiness !== "ready" ||
    product.unavailable ||
    product.retired
  ) {
    return null;
  }
  return product;
}

export function catalogSummary(products: AffiliateProduct[]) {
  return {
    total: products.length,
    styleSlots: products.reduce((count, product) => count + product.styleAssignments.length, 0),
    pending: products.filter((product) => product.approvalStatus === "pending").length,
    approved: products.filter((product) => product.approvalStatus === "approved" || product.approvalStatus === "approved_with_caveat").length,
    rejected: products.filter((product) => product.approvalStatus === "rejected").length,
    unavailable: products.filter((product) => product.availabilityStatus !== "verified_available").length,
    mediaReady: products.filter((product) => product.publicationReadiness === "ready").length,
    categories: new Set(products.map((product) => product.category)).size,
    styles: new Set(products.flatMap((product) => product.styleAssignments.map((assignment) => assignment.styleSlug))).size
  };
}
