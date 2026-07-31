import fs from "node:fs";
import path from "node:path";
import { affiliateApprovedCohortFixture } from "../lib/affiliate-catalog.ts";
import { buildAffiliatePilotV4Manifest } from "../lib/affiliate-pilot-v4.ts";

const manifest = buildAffiliatePilotV4Manifest(
  affiliateApprovedCohortFixture()
);
const outputPath = path.join(
  process.cwd(),
  "output",
  "affiliate-pilot",
  "v4",
  "manifest.json"
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(
  `Rendered the V4 realism-reset manifest: ${manifest.reusedIdentityCount} reviewed identity jobs reused, ${manifest.generationRequestedCount} styled finals queued, and ${manifest.supportReferenceGenerationRequestedCount} one-use textile support generations required at ${outputPath}`
);
