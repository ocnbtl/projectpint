import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { affiliateApprovedCohortFixture } from "../lib/affiliate-catalog.ts";
import {
  AFFILIATE_PILOT_V4_GENERATION_VERSION,
  AFFILIATE_PILOT_V4_PROMPT_VERSION,
  buildAffiliatePilotV4Manifest
} from "../lib/affiliate-pilot-v4.ts";

type PriorManifest = {
  generationVersion: string;
  promptVersion: string;
  products: Array<{ asin: string; slug: string }>;
  jobs: Array<{
    kind: "identity" | "styled";
    storageKey: string;
  }>;
};

type PriorLedger = Record<string, unknown> & {
  styledGeneration: {
    expected: number;
    accepted: number;
    rejectedAttempts: number;
    calls: unknown[];
    proofSet: unknown;
    setReviews: unknown[];
  };
};

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, "output", "affiliate-pilot", "v4");
const manifestPath = path.join(outputRoot, "manifest.json");
const ledgerPath = path.join(outputRoot, "execution-log.json");
const archiveSlug = "pilot-2026-07-27-run-04-ai-stock-baseline";
const archiveRoot = path.join(outputRoot, "superseded", archiveSlug);
const apply = process.argv.includes("--apply");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")) as T;
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function moveIfPresent(source: string, destination: string): boolean {
  if (!fs.existsSync(source)) return false;
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.renameSync(source, destination);
  return true;
}

if (!fs.existsSync(manifestPath) || !fs.existsSync(ledgerPath)) {
  throw new Error("V4 manifest and execution ledger must both exist before reset.");
}
if (fs.existsSync(archiveRoot)) {
  throw new Error(`Refusing to overwrite existing superseded evidence: ${archiveRoot}`);
}

const priorManifest = readJson<PriorManifest>(manifestPath);
const priorLedger = readJson<PriorLedger>(ledgerPath);
if (priorManifest.generationVersion !== "pilot-2026-07-27-run-04") {
  throw new Error(
    `Expected run-04 manifest before reset, received ${priorManifest.generationVersion}.`
  );
}

const acceptedStyleDirectories = priorManifest.products
  .map((product) => ({
    source: path.join(outputRoot, product.asin, product.slug, "styles"),
    destination: path.join(
      archiveRoot,
      "accepted",
      product.asin,
      product.slug,
      "styles"
    )
  }))
  .filter((entry) => fs.existsSync(entry.source));

const evidenceDirectories = [
  "contact-sheets",
  "in-progress",
  "rejected",
  "review-evidence"
]
  .map((name) => ({
    source: path.join(outputRoot, name),
    destination: path.join(archiveRoot, name)
  }))
  .filter((entry) => fs.existsSync(entry.source));

const identityJobs = priorManifest.jobs.filter((job) => job.kind === "identity");
const styledJobs = priorManifest.jobs.filter((job) => job.kind === "styled");
const identityPresentBefore = identityJobs.filter((job) =>
  fs.existsSync(path.join(repoRoot, "output", ...job.storageKey.split("/")))
).length;
const styledPresentBefore = styledJobs.filter((job) =>
  fs.existsSync(path.join(repoRoot, "output", ...job.storageKey.split("/")))
).length;

const plan = {
  apply,
  priorPromptVersion: priorManifest.promptVersion,
  priorGenerationVersion: priorManifest.generationVersion,
  nextPromptVersion: AFFILIATE_PILOT_V4_PROMPT_VERSION,
  nextGenerationVersion: AFFILIATE_PILOT_V4_GENERATION_VERSION,
  archiveRoot: path.relative(repoRoot, archiveRoot).replaceAll("\\", "/"),
  identityPresentBefore,
  styledPresentBefore,
  ledgerAcceptedBefore: priorLedger.styledGeneration.accepted,
  ledgerRejectedBefore: priorLedger.styledGeneration.rejectedAttempts,
  ledgerCallsBefore: priorLedger.styledGeneration.calls.length,
  acceptedStyleDirectories: acceptedStyleDirectories.length,
  evidenceDirectories: evidenceDirectories.map((entry) =>
    path.basename(entry.source)
  )
};

if (!apply) {
  console.log(JSON.stringify({ status: "dry-run", ...plan }, null, 2));
  process.exit(0);
}

if (identityPresentBefore !== identityJobs.length) {
  throw new Error(
    `Refusing reset because only ${identityPresentBefore}/${identityJobs.length} reviewed identity files are present.`
  );
}

fs.mkdirSync(archiveRoot, { recursive: true });
const priorManifestHash = sha256File(manifestPath);
const priorLedgerHash = sha256File(ledgerPath);

for (const entry of acceptedStyleDirectories) {
  moveIfPresent(entry.source, entry.destination);
}
for (const entry of evidenceDirectories) {
  moveIfPresent(entry.source, entry.destination);
}
moveIfPresent(manifestPath, path.join(archiveRoot, "manifest.json"));
moveIfPresent(ledgerPath, path.join(archiveRoot, "execution-log.json"));

for (const fileName of ["technical-qa.json", "visual-qa.json"]) {
  moveIfPresent(
    path.join(outputRoot, fileName),
    path.join(archiveRoot, fileName)
  );
}

const resetAt = new Date().toISOString();
const nextManifest = buildAffiliatePilotV4Manifest(
  affiliateApprovedCohortFixture()
);
fs.writeFileSync(
  manifestPath,
  `${JSON.stringify(nextManifest, null, 2)}\n`,
  "utf8"
);

const nextLedger = {
  ...priorLedger,
  schemaVersion: "affiliate-pilot-execution-log-v4.1",
  createdAt: resetAt,
  updatedAt: resetAt,
  promptVersion: AFFILIATE_PILOT_V4_PROMPT_VERSION,
  generationVersion: AFFILIATE_PILOT_V4_GENERATION_VERSION,
  providerModelObserved: null,
  providerQualityObserved: null,
  providerRequestIdsObserved: [],
  billingObserved: null,
  realismReset: {
    resetAt,
    scope: "all 600 styled bathroom scenes",
    reviewedIdentitiesReused: identityJobs.length,
    supersededEvidence:
      path.relative(repoRoot, archiveRoot).replaceAll("\\", "/"),
    priorManifestSha256: priorManifestHash,
    priorExecutionLogSha256: priorLedgerHash,
    priorAcceptedStyled: priorLedger.styledGeneration.accepted,
    priorRejectedAttempts: priorLedger.styledGeneration.rejectedAttempts,
    priorCalls: priorLedger.styledGeneration.calls.length,
    reason:
      "Owner rejected the run for AI-stock polish, repeated room and lighting formulas, procedural materials, copy-pasted textile folds, and excessive retries."
  },
  styledGeneration: {
    expected: 600,
    accepted: 0,
    rejectedAttempts: 0,
    calls: [],
    proofSet: null,
    setReviews: []
  },
  events: [
    {
      type: "styled_run_reset",
      occurredAt: resetAt,
      decision:
        "Preserved run-04 evidence, retained 70 reviewed identity assets, and reset every styled storage key for the realism-first run-05."
    }
  ]
};
fs.writeFileSync(
  ledgerPath,
  `${JSON.stringify(nextLedger, null, 2)}\n`,
  "utf8"
);

fs.writeFileSync(
  path.join(archiveRoot, "baseline-metadata.json"),
  `${JSON.stringify(
    {
      ...plan,
      appliedAt: resetAt,
      priorManifestSha256: priorManifestHash,
      priorExecutionLogSha256: priorLedgerHash,
      recovery:
        "Move archived accepted styles and evidence back to their original paths only after removing the run-05 counterparts."
    },
    null,
    2
  )}\n`,
  "utf8"
);

const styledPresentAfter = nextManifest.jobs
  .filter((job) => job.kind === "styled")
  .filter((job) =>
    fs.existsSync(path.join(repoRoot, "output", ...job.storageKey.split("/")))
  ).length;
const identityPresentAfter = nextManifest.jobs
  .filter((job) => job.kind === "identity")
  .filter((job) =>
    fs.existsSync(path.join(repoRoot, "output", ...job.storageKey.split("/")))
  ).length;

if (identityPresentAfter !== 70 || styledPresentAfter !== 0) {
  throw new Error(
    `Reset verification failed: identity ${identityPresentAfter}/70, styled ${styledPresentAfter}/600. Superseded evidence remains at ${archiveRoot}.`
  );
}

console.log(
  JSON.stringify(
    {
      status: "applied",
      ...plan,
      identityPresentAfter,
      styledPresentAfter,
      newManifestSha256: sha256File(manifestPath),
      newLedgerSha256: sha256File(ledgerPath)
    },
    null,
    2
  )
);
