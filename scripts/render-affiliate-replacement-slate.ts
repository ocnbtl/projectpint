import fs from "node:fs";
import path from "node:path";
import { affiliateReplacementFixture } from "../lib/affiliate-catalog.ts";
import { inspirationStyles } from "../lib/redesign-data.ts";

const outputPath = path.join(process.cwd(), "docs", "affiliate-product-replacement-slate.md");
const observedDate = "July 26, 2026";
const proposals = affiliateReplacementFixture();
const styleNames = new Map(inspirationStyles.map((style) => [style.slug, style.name]));

if (proposals.length !== 19) throw new Error(`Expected 19 replacements, found ${proposals.length}.`);
if (new Set(proposals.map((proposal) => `${proposal.styleSlug}:${proposal.rank}`)).size !== 19) {
  throw new Error("Replacement style slots are not distinct.");
}

const recommendationCounts = {
  approve: proposals.filter((proposal) => proposal.proposedProduct.recommendation === "approve").length,
  approveWithCaveat: proposals.filter(
    (proposal) => proposal.proposedProduct.recommendation === "approve_with_caveat"
  ).length,
  replace: proposals.filter((proposal) => proposal.proposedProduct.recommendation === "replace").length
};
const decisionCounts = {
  approved: proposals.filter((proposal) => proposal.proposalStatus === "approved").length,
  approvedWithCaveat: proposals.filter(
    (proposal) => proposal.proposalStatus === "approved_with_caveat"
  ).length
};
const categories = [...new Set(proposals.map((proposal) => proposal.proposedProduct.category))]
  .map((category) => ({
    category,
    count: proposals.filter((proposal) => proposal.proposedProduct.category === category).length
  }))
  .sort((left, right) => right.count - left.count || left.category.localeCompare(right.category));
const volatileStockCount = proposals.filter((proposal) =>
  proposal.proposedProduct.caveats.some((caveat) =>
    /only \w+ units?|only \w+ sets?|buy box|availability|more listed as on the way/i.test(caveat)
  )
).length;

function recommendationLabel(value: "approve" | "approve_with_caveat" | "replace"): string {
  if (value === "approve_with_caveat") return "APPROVE WITH CAVEAT";
  return value.toUpperCase();
}

const lines = [
  "# Project Pint Affiliate Product Replacement Decision Record",
  "",
  `Research observation date: ${observedDate}`,
  "",
  "This record preserves the owner's approval of all 19 replacements for the rejected initial candidates. The 18 new ASINs now belong to the private local canonical cohort; the one cross-style reuse remains one canonical record. Prices, seller condition, and availability are point-in-time observations from the linked Amazon product pages and must be rechecked before reference capture or publication.",
  "",
  "## Compact summary",
  "",
  `- Rejected slots to fill: ${proposals.length}`,
  `- New canonical ASINs proposed: ${proposals.filter((proposal) => !proposal.reuseExistingCanonical).length}`,
  `- Existing canonical products reused: ${proposals.filter((proposal) => proposal.reuseExistingCanonical).length}`,
  `- Recommendation mix: ${recommendationCounts.approve} approve, ${recommendationCounts.approveWithCaveat} approve with caveat, ${recommendationCounts.replace} replace`,
  `- Owner decisions: ${decisionCounts.approved} approved, ${decisionCounts.approvedWithCaveat} approved with caveat`,
  `- Products with seller, low-stock, or availability caveats: ${volatileStockCount}`,
  "- Unavailable products when observed: 0",
  "- Slots without a defensible proposal: 0",
  "- Approved cohort: 59 canonical products filling 60 style slots",
  "- Generation status: 3,599 deterministic jobs are prepared and blocked on private-reference rights; generation is not authorized",
  "",
  "### Replacement category balance",
  "",
  "| Category | Count |",
  "| --- | ---: |",
  ...categories.map(({ category, count }) => `| ${category} | ${count} |`),
  "",
  "## Replacement review",
  ""
];

for (const style of inspirationStyles) {
  const styleProposals = proposals
    .filter((proposal) => proposal.styleSlug === style.slug)
    .sort((left, right) => left.rank - right.rank);
  if (styleProposals.length === 0) continue;

  lines.push(`## ${style.name}`, "");
  for (const proposal of styleProposals) {
    const product = proposal.proposedProduct;
    const assignment = product.styleAssignments.find(
      (candidate) => candidate.styleSlug === proposal.styleSlug && candidate.rank === proposal.rank
    )!;
    const sources = product.researchSources
      .map((source) => `[${source.title}](${source.url}) (${source.sourceType})`)
      .join("; ");
    const duplicateNote = proposal.reuseExistingCanonical
      ? `Reuse approved canonical ASIN \`${product.asin}\` and add ${style.name} as an additional style assignment. Do not create a duplicate product.`
      : "Approved as one new canonical record; no duplicate ASIN exists in the cohort.";

    lines.push(
      `### Slot ${proposal.rank}: ${product.brand} ${product.name}`,
      "",
      `- Replaces: \`${proposal.replacesAsin}\` — ${proposal.ownerRejectionReason}`,
      `- Proposed display name: ${product.brand} ${product.name}`,
      `- Direct Amazon listing: [${product.canonicalAmazonUrl}](${product.canonicalAmazonUrl})`,
      `- ASIN: \`${product.asin}\``,
      `- Category: ${product.category}`,
      `- Style fit: ${assignment.rationale}`,
      `- Why it is useful: ${product.recommendationRationale}`,
      `- Price and availability: ${product.priceObservation?.display ?? "Price not recorded"}; available to order on the specific Amazon listing when observed ${observedDate}. Recheck the seller, variation, price, and stock before private-reference capture.`,
      `- Important caveats or unknowns: ${product.caveats.join(" ")}`,
      `- Strongest supporting sources: ${sources}`,
      `- Duplicate or cross-style relevance: ${duplicateNote}`,
      `- Recommendation: **${recommendationLabel(product.recommendation)}**`,
      `- Owner decision: **${proposal.proposalStatus.replaceAll("_", " ").toUpperCase()}**`,
      `- Decision record: ${product.approvalHistory.at(-1)?.reason ?? "No owner decision recorded."}`,
      ""
    );
  }
}

lines.push(
  "## Decision status",
  "",
  "The owner approved all 19 replacements. Recorded seller, stock, variation, material, dimension, installation, and availability caveats remain part of each canonical record.",
  "",
  "Product selection is complete. This does not authorize production migration, production publication, Amazon Associates access, fabricated tracking links, paid generation, reference-image use without rights clearance, or the full product-media library.",
  ""
);

fs.writeFileSync(outputPath, `${lines.join("\n").trimEnd()}\n`, "utf8");
console.log(`Rendered ${proposals.length} replacement proposals to ${outputPath}`);
