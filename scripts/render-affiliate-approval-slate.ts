import fs from "node:fs";
import path from "node:path";
import { affiliateCandidateFixtureData } from "../data/affiliate-candidates.v1.ts";
import { inspirationStyles } from "../lib/redesign-data.ts";

type Candidate = (typeof affiliateCandidateFixtureData)[number];

const outputPath = path.join(process.cwd(), "docs", "affiliate-product-approval-slate.md");
const observedDate = "July 25, 2026";
const products = affiliateCandidateFixtureData;
const styleNames = new Map(inspirationStyles.map((style) => [style.slug, style.name]));

if (products.length !== 60) throw new Error(`Expected 60 candidates, found ${products.length}.`);
if (new Set(products.map((product) => product.asin)).size !== 60) throw new Error("Candidate ASINs are not distinct.");
for (const style of inspirationStyles) {
  const count = products.filter((product) => product.styleAssignments[0]?.styleSlug === style.slug).length;
  if (count !== 5) throw new Error(`${style.name} has ${count} candidates instead of 5.`);
}

const categoryCounts = [...new Set(products.map((product) => product.category))]
  .map((category) => ({
    category,
    count: products.filter((product) => product.category === category).length
  }))
  .sort((left, right) => right.count - left.count || left.category.localeCompare(right.category));

const recommendationCounts = {
  approve: products.filter((product) => product.recommendation === "approve").length,
  approveWithCaveat: products.filter((product) => product.recommendation === "approve_with_caveat").length,
  replace: products.filter((product) => product.recommendation === "replace").length
};
const decisionCounts = {
  approved: products.filter((product) => product.approvalStatus === "approved").length,
  approvedWithCaveat: products.filter((product) => product.approvalStatus === "approved_with_caveat").length,
  rejected: products.filter((product) => product.approvalStatus === "rejected").length
};

function recommendationLabel(value: Candidate["recommendation"]): string {
  if (value === "approve_with_caveat") return "APPROVE WITH CAVEAT";
  return value.toUpperCase();
}

function sourceList(product: Candidate): string {
  return product.researchSources
    .map((source) => `[${source.title}](${source.url}) (${source.sourceType})`)
    .join("; ");
}

const lines: string[] = [
  "# Project Pint Initial Affiliate Product Approval Slate",
  "",
  `Research observation date: ${observedDate}`,
  "",
  "This is the approval artifact for the first catalog cohort, not a publication or purchasing instruction. Amazon prices and availability were observed from specific product-detail pages and are volatile. No ratings, review counts, durability claims, certifications, or Associates links have been invented. Manufacturer and retailer sources are specification evidence; Amazon is the recorded availability source.",
  "",
  "## Compact summary",
  "",
  `- Styles: ${inspirationStyles.length}`,
  `- Candidates: ${products.length}`,
  `- Distinct ASINs: ${new Set(products.map((product) => product.asin)).size}`,
  "- Duplicate canonical products: 0",
  `- Recommendation mix: ${recommendationCounts.approve} approve, ${recommendationCounts.approveWithCaveat} approve with caveat, ${recommendationCounts.replace} replace`,
  `- Owner decisions recorded: ${decisionCounts.approved} approved, ${decisionCounts.approvedWithCaveat} approved with caveat, ${decisionCounts.rejected} rejected`,
  `- Amazon availability observed: ${products.filter((product) => product.availabilityStatus === "verified_available").length} available, ${products.filter((product) => product.availabilityStatus === "uncertain").length} uncertain, ${products.filter((product) => product.availabilityStatus === "unavailable").length} unavailable`,
  "- Slots without a defensible candidate: 0",
  "- Product-media generation: rejected products excluded; approved products remain blocked on private-reference rights and complete-cohort approval",
  "",
  "Evidence corrections made before this slate: an unrelated marketplace bench ASIN was replaced by a Bambusi bench with brand documentation; a non-bath jute accent rug was replaced by a bath-specific Madison Park rug; an older poorly evidenced floral bath rug was replaced by a current Madison Park medallion bath rug; and the Ashfield mirror brand was corrected from Design Toscano to Touch of Class.",
  "",
  "Availability conflicts that deserve rechecking at approval time: Umbra Bellwood Organizer, Delta Trinsic towel rings, MyGift pipe shelf, SKL Home Smoke Blue towels, and Kate and Laurel Cates mirror were available on Amazon while their brand storefronts showed backorder, sold-out, or notification states.",
  "",
  "### Category balance",
  "",
  "| Category | Count |",
  "| --- | ---: |",
  ...categoryCounts.map(({ category, count }) => `| ${category} | ${count} |`),
  "",
  "## Candidate review",
  ""
];

for (const style of inspirationStyles) {
  const styleProducts = products
    .filter((product) => product.styleAssignments[0]?.styleSlug === style.slug)
    .sort((left, right) => (left.styleAssignments[0]?.rank ?? 0) - (right.styleAssignments[0]?.rank ?? 0));
  lines.push(`## ${style.name}`, "");
  for (const product of styleProducts) {
    const assignment = product.styleAssignments[0]!;
    lines.push(
      `### ${assignment.rank}. ${product.brand} ${product.name}`,
      "",
      `- Proposed display name: ${product.brand} ${product.name}`,
      `- Direct Amazon listing: [${product.canonicalAmazonUrl}](${product.canonicalAmazonUrl})`,
      `- ASIN: \`${product.asin}\``,
      `- Category: ${product.category}`,
      `- Style fit: ${assignment.rationale}`,
      `- Why it is useful: ${product.recommendationRationale}`,
      `- Price and availability: ${product.priceObservation?.display ?? "Price not recorded"}; available to order on the specific Amazon listing when observed ${observedDate}. Recheck before approval or publication.`,
      `- Important caveats or unknowns: ${product.caveats.join(" ")}`,
      `- Strongest supporting sources: ${sourceList(product)}`,
      `- Duplicate or cross-style relevance: ${product.crossStyleNotes}`,
      `- Recommendation: **${recommendationLabel(product.recommendation)}**`,
      `- Owner decision: **${product.approvalStatus.replaceAll("_", " ").toUpperCase()}**`,
      `- Decision record: ${product.approvalHistory.at(-1)?.reason ?? "No owner decision recorded."}`,
      ""
    );
  }
}

lines.push(
  "## Decision status",
  "",
  "The owner has decided all 60 initial candidates. Rejected candidates remain in this artifact with their reasons; they are not silently deleted or converted into replacements.",
  "",
  "The owner approved all 19 entries in the separate replacement record. Eighteen are new canonical products and one reuses the approved Bambüsi bench for an additional Japandi assignment, yielding 59 canonical products across 60 approved style slots.",
  "",
  "The next gated sequence is: recheck the approved ASINs and variations; receive the owner-supplied Associates URLs; resolve source-image/AI-reference rights; run the 33-image technical pilot; review product identity and segmentation QA; then return for explicit scale and spend authorization before the 3,599-image library.",
  ""
);

fs.writeFileSync(outputPath, `${lines.join("\n").trimEnd()}\n`, "utf8");
console.log(`Rendered ${products.length} candidates to ${outputPath}`);
