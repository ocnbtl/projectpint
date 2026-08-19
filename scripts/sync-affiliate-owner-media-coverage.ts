import fs from "node:fs";
import path from "node:path";
import { saveOwnerMediaCoverage } from "../lib/affiliate-media-coverage.ts";

function argument(name: string, fallback?: string): string {
  const prefix = `--${name}=`;
  const value = process.argv.slice(2).find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing --${name}=...`);
}

const sourcePath = path.resolve(
  process.cwd(),
  argument("source", "output/affiliate-pilot/v4/private-evidence/owner-media-coverage.json")
);
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "")) as unknown;
const saved = await saveOwnerMediaCoverage(source);
process.stdout.write(
  `Synchronized owner media coverage ${saved.currentGenerationBatchId}: ${saved.totals.usableApprovedEligibleProducts} usable, ${saved.totals.queuedInCurrentBatch} queued.\n`
);
