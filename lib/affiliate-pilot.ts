import {
  affiliatePilotV1Authorization,
  affiliatePilotV1Selections
} from "../data/affiliate-pilot.v1.ts";
import type { AffiliateProduct } from "./affiliate-catalog.ts";
import { buildAffiliateMediaJobs, type AffiliateMediaJob } from "./affiliate-media.ts";
import { inspirationStyles } from "./redesign-data.ts";

export const AFFILIATE_PILOT_VERSION = "affiliate-pilot-v1";
export const AFFILIATE_PILOT_PROMPT_VERSION = "affiliate-pilot-product-v1";
export const AFFILIATE_PILOT_GENERATION_VERSION = "pilot-2026-07-26-run-01";

export interface AffiliatePilotJob extends Omit<AffiliateMediaJob, "status"> {
  status: "queued";
  referenceInputCount: 1 | 2;
  requiresPromptCapture: true;
}

type AffiliatePilotSelection = (typeof affiliatePilotV1Selections)[number];

function buildAffiliatePilotPrompt(
  job: AffiliateMediaJob,
  selection: AffiliatePilotSelection
): string {
  if (job.kind === "presentation") {
    return [
      "Create one photorealistic Project Pint affiliate pilot product presentation using the approved private reference only to preserve exact product identity.",
      selection.identityPrompt,
      "Show one complete product by itself, centered with generous clearance on every side.",
      "Use an evenly lit, perfectly flat solid chroma green #00FF00 background with no gradient, floor line, horizon, vignette, reflections, props, people, packaging, text overlay, or watermark.",
      "Keep open product geometry separated from the background so a reviewed chroma-key pass can produce the transparent delivery asset.",
      "The final postprocessed delivery canvas must be 1024x1536 with transparency."
    ].join(" ");
  }

  return [
    "Create one photorealistic Project Pint affiliate pilot gallery image.",
    job.prompt,
    `Product identity invariant: ${selection.identityPrompt}`,
    "Use the approved private reference and reviewed presentation anchor only as identity references; do not copy their backgrounds.",
    "Keep the complete product visually legible, at believable bathroom scale, and in a safe functional location.",
    "Do not add packaging, people, hands, text overlays, watermarks, unsupported safety claims, or unsupported permanent accessories."
  ].join(" ");
}

export function buildAffiliatePilotManifest(products: AffiliateProduct[]) {
  const productByAsin = new Map(products.map((product) => [product.asin, product]));
  const currentStyleSlugs = new Set(inspirationStyles.map((style) => style.slug));
  const seenAsins = new Set<string>();
  const jobs: AffiliatePilotJob[] = [];

  const productsManifest = affiliatePilotV1Selections.map((selection) => {
    if (seenAsins.has(selection.asin)) {
      throw new Error(`Pilot product ASIN ${selection.asin} is duplicated.`);
    }
    seenAsins.add(selection.asin);

    const product = productByAsin.get(selection.asin);
    if (!product) throw new Error(`Pilot product ASIN ${selection.asin} is not in the approved cohort.`);
    if (product.approvalStatus !== "approved" && product.approvalStatus !== "approved_with_caveat") {
      throw new Error(`Pilot product ASIN ${selection.asin} is not approved.`);
    }
    if (selection.styleSlugs.length !== 2 || new Set(selection.styleSlugs).size !== 2) {
      throw new Error(`Pilot product ASIN ${selection.asin} must have two distinct style tests.`);
    }
    selection.styleSlugs.forEach((styleSlug) => {
      if (!currentStyleSlugs.has(styleSlug)) {
        throw new Error(`Pilot style ${styleSlug} is not a current Inspiration style.`);
      }
    });

    const selectedJobs = buildAffiliateMediaJobs(product)
      .filter(
        (job) =>
          job.kind === "presentation" ||
          (job.styleSlug !== null &&
            selection.styleSlugs.some((styleSlug) => styleSlug === job.styleSlug))
      )
      .map((job): AffiliatePilotJob => ({
        ...job,
        storageKey: job.storageKey
          .replace(/^affiliate-products\/v1\//, "affiliate-pilot/v1/")
          .replace(/\.webp$/, ".png"),
        promptVersion: AFFILIATE_PILOT_PROMPT_VERSION,
        generationVersion: AFFILIATE_PILOT_GENERATION_VERSION,
        prompt: buildAffiliatePilotPrompt(job, selection),
        referenceInputCount: job.kind === "presentation" ? 1 : 2,
        requiresPromptCapture: true,
        status: "queued"
      }));
    if (selectedJobs.length !== 11) {
      throw new Error(`Pilot product ASIN ${selection.asin} produced ${selectedJobs.length} jobs instead of 11.`);
    }
    jobs.push(...selectedJobs);

    return {
      ...selection,
      productId: product.id,
      slug: product.slug,
      productName: product.name,
      brand: product.brand,
      approvalStatus: product.approvalStatus,
      jobCount: selectedJobs.length
    };
  });

  if (jobs.length !== 33 || new Set(jobs.map((job) => job.id)).size !== 33) {
    throw new Error("The affiliate pilot must contain exactly 33 unique jobs.");
  }

  return {
    pilotVersion: AFFILIATE_PILOT_VERSION,
    manifestVersion: 1,
    promptVersion: jobs[0]?.promptVersion ?? "",
    generationVersion: jobs[0]?.generationVersion ?? "",
    ...affiliatePilotV1Authorization,
    executionLogRequired: true,
    productCount: productsManifest.length,
    presentationCount: jobs.filter((job) => job.kind === "presentation").length,
    styledCount: jobs.filter((job) => job.kind === "styled").length,
    totalCount: jobs.length,
    products: productsManifest,
    jobs
  };
}
