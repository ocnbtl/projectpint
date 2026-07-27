import fs from "node:fs";
import path from "node:path";
import { affiliateApprovedCohortFixture } from "../lib/affiliate-catalog.ts";
import { buildAffiliatePilotV2Manifest } from "../lib/affiliate-pilot-v2.ts";

const manifest = buildAffiliatePilotV2Manifest(affiliateApprovedCohortFixture());
const outputPath = path.join(process.cwd(), "output", "affiliate-pilot", "v2", "manifest.json");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(
  `Rendered ${manifest.totalCount} pilot v2 jobs (${manifest.generationRequestedCount} new generations) to ${outputPath}`
);
