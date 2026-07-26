import fs from "node:fs";
import path from "node:path";
import { affiliateApprovedCohortFixture } from "../lib/affiliate-catalog.ts";
import { buildAffiliatePilotManifest } from "../lib/affiliate-pilot.ts";

const manifest = buildAffiliatePilotManifest(affiliateApprovedCohortFixture());
const outputPath = path.join(process.cwd(), "output", "affiliate-pilot", "v1", "manifest.json");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Rendered ${manifest.totalCount} pilot jobs to ${outputPath}`);
