import type { AffiliateProduct } from "./affiliate-catalog.ts";
import { inspirationStyles } from "./redesign-data.ts";

export const AFFILIATE_MEDIA_PROMPT_VERSION = "affiliate-product-v1";
export const AFFILIATE_MEDIA_GENERATION_VERSION = "unassigned";
export const AFFILIATE_MEDIA_ASPECT = "2:3";
export const AFFILIATE_MEDIA_TARGET = { width: 1024, height: 1536 } as const;

export interface AffiliateMediaJob {
  id: string;
  productId: string;
  asin: string;
  kind: "presentation" | "styled";
  styleSlug: string | null;
  slot: number;
  storageKey: string;
  promptVersion: string;
  generationVersion: string;
  prompt: string;
  postprocess: "segment_to_transparent_webp" | "none";
  status: "blocked_approval" | "blocked_reference_rights";
}

function cleanSegment(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
}

export function affiliatePresentationKey(product: Pick<AffiliateProduct, "asin" | "slug">): string {
  return `affiliate-products/v1/${product.asin}/${cleanSegment(product.slug)}/presentation/product-transparent.webp`;
}

export function affiliateStyleMediaKey(
  product: Pick<AffiliateProduct, "asin" | "slug">,
  styleSlug: string,
  slot: number
): string {
  if (!Number.isInteger(slot) || slot < 1 || slot > 5) throw new Error("Style media slot must be between 1 and 5.");
  return `affiliate-products/v1/${product.asin}/${cleanSegment(product.slug)}/styles/${cleanSegment(styleSlug)}/scene-${String(slot).padStart(2, "0")}.webp`;
}

export function buildAffiliateMediaJobs(product: AffiliateProduct): AffiliateMediaJob[] {
  const approved =
    product.approvalStatus === "approved" || product.approvalStatus === "approved_with_caveat";
  const blockedStatus = approved ? "blocked_reference_rights" : "blocked_approval";
  const presentation: AffiliateMediaJob = {
    id: `${product.id}:presentation`,
    productId: product.id,
    asin: product.asin,
    kind: "presentation",
    styleSlug: null,
    slot: 0,
    storageKey: affiliatePresentationKey(product),
    promptVersion: AFFILIATE_MEDIA_PROMPT_VERSION,
    generationVersion: AFFILIATE_MEDIA_GENERATION_VERSION,
    prompt: [
      `Create a clean catalog presentation of ${product.name} by ${product.brand}.`,
      "Keep the product identity, proportions, material, finish, controls, and visible hardware faithful to the approved private reference set.",
      "Show one isolated product on an evenly lit plain white background, centered with generous safe area, no text, no logos added, no props, and no invented accessories.",
      "Keep a clean separation between the object and background for a reviewed segmentation pass that will create the transparent delivery asset.",
      `Output ${AFFILIATE_MEDIA_TARGET.width}x${AFFILIATE_MEDIA_TARGET.height} in a ${AFFILIATE_MEDIA_ASPECT} frame.`
    ].join(" "),
    postprocess: "segment_to_transparent_webp",
    status: blockedStatus
  };

  const styled = inspirationStyles.flatMap((style) =>
    Array.from({ length: 5 }, (_, index): AffiliateMediaJob => {
      const slot = index + 1;
      return {
        id: `${product.id}:${style.slug}:${slot}`,
        productId: product.id,
        asin: product.asin,
        kind: "styled",
        styleSlug: style.slug,
        slot,
        storageKey: affiliateStyleMediaKey(product, style.slug, slot),
        promptVersion: AFFILIATE_MEDIA_PROMPT_VERSION,
        generationVersion: AFFILIATE_MEDIA_GENERATION_VERSION,
        prompt: [
          `Place the approved product ${product.name} by ${product.brand} in a ${style.name} bathroom.`,
          `This is gallery view ${slot} of 5.`,
          "Preserve the exact product identity, proportions, material, finish, controls, and hardware from the approved private reference set.",
          "Make the product useful and visually legible in a realistic bathroom context; do not add unsupported features, branding, safety claims, or accessories.",
          `Output ${AFFILIATE_MEDIA_TARGET.width}x${AFFILIATE_MEDIA_TARGET.height} in a ${AFFILIATE_MEDIA_ASPECT} frame.`
        ].join(" "),
        postprocess: "none",
        status: blockedStatus
      };
    })
  );

  return [presentation, ...styled];
}

export function buildAffiliateMediaManifest(products: AffiliateProduct[]) {
  const eligibleProducts = products.filter(
    (product) => product.approvalStatus === "approved" || product.approvalStatus === "approved_with_caveat"
  );
  const excludedProducts = products
    .filter((product) => !eligibleProducts.includes(product))
    .map((product) => ({
      productId: product.id,
      asin: product.asin,
      approvalStatus: product.approvalStatus,
      reason: product.approvalHistory.at(-1)?.reason ?? "Product approval is incomplete."
    }));
  const jobs = eligibleProducts.flatMap(buildAffiliateMediaJobs);
  return {
    manifestVersion: 1,
    promptVersion: AFFILIATE_MEDIA_PROMPT_VERSION,
    generationVersion: AFFILIATE_MEDIA_GENERATION_VERSION,
    candidateCount: products.length,
    productCount: eligibleProducts.length,
    excludedCount: excludedProducts.length,
    presentationCount: eligibleProducts.length,
    styledCount: eligibleProducts.length * inspirationStyles.length * 5,
    totalCount: jobs.length,
    cohortReadyForPilot: products.length === 60 && excludedProducts.length === 0,
    generationAuthorized: false,
    excludedProducts,
    jobs
  };
}
