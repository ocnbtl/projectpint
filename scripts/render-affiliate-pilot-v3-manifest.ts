import fs from "node:fs";
import path from "node:path";
import { affiliateApprovedCohortFixture } from "../lib/affiliate-catalog.ts";
import { buildAffiliatePilotV3Manifest } from "../lib/affiliate-pilot-v3.ts";

const manifest = buildAffiliatePilotV3Manifest(affiliateApprovedCohortFixture());
const outputPath = path.join(
  process.cwd(),
  "output",
  "affiliate-pilot",
  "v3",
  "manifest.json"
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(
  `Rendered ${manifest.totalCount} pilot v3 jobs (${manifest.generationRequestedCount} new generations) to ${outputPath}`
);
