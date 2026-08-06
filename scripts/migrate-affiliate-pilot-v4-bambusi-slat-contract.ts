import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { affiliatePilotV4Selections } from "../data/affiliate-pilot.v4.ts";

type JsonRecord = Record<string, any>;

const ASIN = "B0DC7VG6Z9";

function readJson(filePath: string): JsonRecord {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")) as JsonRecord;
}

function writeJson(filePath: string, value: JsonRecord): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function replaceLine(prompt: string, label: string, value: string): string {
  const lines = prompt.split("\n");
  const index = lines.findIndex((line) => line.startsWith(`${label}:`));
  if (index < 0) throw new Error(`Missing ${label}: in queued Bambusi prompt.`);
  lines[index] = `${label}: ${value}`;
  return lines.join("\n");
}

const root = process.cwd();
const manifestPath = path.join(root, "output", "affiliate-pilot", "v4", "manifest.json");
const correctiveReferenceRelativePath =
  "output/affiliate-pilot/v4/private-evidence/product-sources/B0DC7VG6Z9/bambusi-manufacturer-04.jpg";
const correctiveReferencePath = path.join(root, ...correctiveReferenceRelativePath.split("/"));
const atlasRelativePath =
  "output/affiliate-pilot/v4/B0DC7VG6Z9/bambusi-bamboo-shower-bench-natural/identity/reference-atlas.png";
const atlasPath = path.join(root, ...atlasRelativePath.split("/"));
const manifest = readJson(manifestPath);
const selection = affiliatePilotV4Selections.find((candidate) => candidate.asin === ASIN);
if (!selection) throw new Error(`Missing canonical selection for ${ASIN}.`);

let updated = 0;
for (const job of manifest.jobs as JsonRecord[]) {
  if (job.kind !== "styled" || job.asin !== ASIN) continue;
  if (job.status !== "queued" || job.decisionStatus !== "queued") continue;
  let prompt = String(job.prompt);
  prompt = replaceLine(prompt, "Product contract", selection.identityPrompt);
  prompt = replaceLine(
    prompt,
    "Countable-feature audit",
    `${selection.countableFeatures.map((feature, index) => `${index + 1}) ${feature}`).join("; ")}.`
  );
  const promptLines = prompt.split("\n");
  const referenceIndex = promptLines.findIndex(
    (line) => line.startsWith("Reference pack:") || line.startsWith("Corrective reference pack:")
  );
  if (referenceIndex < 0) throw new Error("Missing queued Bambusi reference-pack line.");
  promptLines[referenceIndex] =
    `Corrective reference pack: use the exact manufacturer image at ${correctiveReferenceRelativePath} and the validated dossier at output/affiliate-pilot/v4/private-evidence/product-dossiers/B0DC7VG6Z9/dossier.json for product identity. The generated reference atlas is quarantined for future Bambusi calls because its top view mutated the verified eight-slat product into nine slats; do not use that atlas as visual guidance.`;
  prompt = promptLines.join("\n");
  prompt = prompt.replace(
    "may never conceal the nine-interior-slat identity in every image",
    "may never conceal the eight-top-slat or eight-lower-slat identity in any image"
  );
  const nextHash = createHash("sha256").update(prompt).digest("hex");
  if (prompt !== job.prompt || nextHash !== job.promptSha256) {
    job.prompt = prompt;
    job.promptSha256 = nextHash;
    job.productContractCorrection = "owner_verified_eight_top_and_eight_lower_slats";
    job.correctiveReferencePath = correctiveReferenceRelativePath;
    job.correctiveReferenceSha256 = createHash("sha256")
      .update(fs.readFileSync(correctiveReferencePath))
      .digest("hex");
    updated += 1;
  }
}

if (updated === 0) {
  throw new Error("No queued Bambusi prompt required the slat-contract migration.");
}
writeJson(manifestPath, manifest);
const quarantinePath = path.join(
  root,
  "output",
  "affiliate-pilot",
  "v4",
  "B0DC7VG6Z9",
  "bambusi-bamboo-shower-bench-natural",
  "identity",
  "reference-atlas-quarantine.json"
);
writeJson(quarantinePath, {
  schemaVersion: "affiliate-pilot-v4-reference-quarantine-v1",
  asin: ASIN,
  status: "quarantined_for_future_generation",
  reason: "The generated atlas top view contains nine slats and conflicts with the owner-verified exact listing identity of eight top and eight lower-shelf slats.",
  quarantinedReferencePath: atlasRelativePath,
  quarantinedReferenceSha256: createHash("sha256").update(fs.readFileSync(atlasPath)).digest("hex"),
  correctiveReferencePath: correctiveReferenceRelativePath,
  correctiveReferenceSha256: createHash("sha256")
    .update(fs.readFileSync(correctiveReferencePath))
    .digest("hex"),
  deletionPerformed: false
});
console.log(`Updated ${updated} queued Bambusi prompts to the owner-verified 8-over-8 contract.`);
