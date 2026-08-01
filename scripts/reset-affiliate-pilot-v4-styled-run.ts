import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { affiliateApprovedCohortFixture } from "../lib/affiliate-catalog.ts";
import {
  AFFILIATE_PILOT_V4_GENERATION_VERSION,
  buildAffiliatePilotV4ExecutionLog,
  buildAffiliatePilotV4Manifest
} from "../lib/affiliate-pilot-v4.ts";

type JsonRecord = Record<string, unknown>;

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, "output", "affiliate-pilot", "v4");
const supersededRoot = path.join(outputRoot, "superseded");
const manifestPath = path.join(outputRoot, "manifest.json");
const ledgerPath = path.join(outputRoot, "execution-log.json");
const apply = process.argv.includes("--apply");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")) as T;
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function safeSegment(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

function walkFiles(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  if (!fs.statSync(root).isDirectory()) return [root];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  });
}

function relativePosix(root: string, filePath: string): string {
  return path.relative(root, filePath).replaceAll("\\", "/");
}

if (!fs.existsSync(manifestPath) || !fs.existsSync(ledgerPath)) {
  throw new Error("V4 manifest and execution ledger must both exist before a full-run reset.");
}

const priorManifest = readJson<JsonRecord>(manifestPath);
const priorLedger = readJson<JsonRecord>(ledgerPath);
const priorGenerationVersion = String(priorManifest.generationVersion ?? "unknown-run");
const alreadyZeroReuse =
  priorGenerationVersion === AFFILIATE_PILOT_V4_GENERATION_VERSION &&
  priorManifest.reuseReviewedIdentityAssets === false &&
  Number(priorManifest.reusedIdentityCount ?? 0) === 0 &&
  Number(priorManifest.reusedStyledCount ?? priorManifest.reusableStyledCount ?? 0) === 0;

if (alreadyZeroReuse) {
  console.log(
    JSON.stringify(
      {
        status: "already-reset",
        generationVersion: priorGenerationVersion,
        identityAssetsReused: 0,
        styledAssetsReused: 0,
        action: "No files changed. Continue with exact-SKU dossier research."
      },
      null,
      2
    )
  );
  process.exit(0);
}

const requestedArchiveSlug = process.argv
  .find((argument) => argument.startsWith("--archive-slug="))
  ?.slice("--archive-slug=".length);
const archiveSlug =
  requestedArchiveSlug ??
  `${safeSegment(priorGenerationVersion)}-owner-superseded-${new Date()
    .toISOString()
    .slice(0, 10)}`;
const archiveRoot = path.join(supersededRoot, archiveSlug);
if (fs.existsSync(archiveRoot)) {
  throw new Error(`Refusing to overwrite superseded evidence: ${archiveRoot}`);
}

const priorManifestHash = sha256File(manifestPath);
const priorLedgerHash = sha256File(ledgerPath);
const activeEntries = fs
  .readdirSync(outputRoot, { withFileTypes: true })
  .filter((entry) => entry.name !== "superseded");
const priorStageDirectories = fs.existsSync(supersededRoot)
  ? fs
      .readdirSync(supersededRoot, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          entry.name.startsWith(priorGenerationVersion) &&
          entry.name !== archiveSlug
      )
  : [];
const activeFilesBefore = activeEntries.flatMap((entry) =>
  walkFiles(path.join(outputRoot, entry.name))
);
const priorStageFilesBefore = priorStageDirectories.flatMap((entry) =>
  walkFiles(path.join(supersededRoot, entry.name))
);
const sourceFilesBefore = [...activeFilesBefore, ...priorStageFilesBefore];
const sourceBytesBefore = sourceFilesBefore.reduce(
  (total, filePath) => total + fs.statSync(filePath).size,
  0
);

const ledgerCalls = Array.isArray(
  (priorLedger.styledGeneration as JsonRecord | undefined)?.calls
)
  ? (((priorLedger.styledGeneration as JsonRecord).calls as unknown[]) ?? [])
  : [];
const pendingCalls = ledgerCalls.filter(
  (call) =>
    typeof call === "object" &&
    call !== null &&
    (call as JsonRecord).status === "pending_review"
);
const plan = {
  status: apply ? "ready-to-apply" : "dry-run",
  priorGenerationVersion,
  nextGenerationVersion: AFFILIATE_PILOT_V4_GENERATION_VERSION,
  archiveRoot: relativePosix(repoRoot, archiveRoot),
  priorManifestSha256: priorManifestHash,
  priorExecutionLogSha256: priorLedgerHash,
  sourceFileCount: sourceFilesBefore.length,
  sourceByteCount: sourceBytesBefore,
  activeRootEntries: activeEntries.map((entry) => entry.name),
  priorStageDirectories: priorStageDirectories.map((entry) => entry.name),
  pendingCallCount: pendingCalls.length,
  nextIdentityAssetsReused: 0,
  nextStyledAssetsReused: 0
};

if (!apply) {
  console.log(JSON.stringify(plan, null, 2));
  process.exit(0);
}

const moved: Array<{ source: string; destination: string }> = [];
try {
  fs.mkdirSync(archiveRoot, { recursive: true });
  for (const entry of priorStageDirectories) {
    const source = path.join(supersededRoot, entry.name);
    const destination = path.join(archiveRoot, "prior-stages", entry.name);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.renameSync(source, destination);
    moved.push({ source, destination });
  }
  for (const entry of activeEntries) {
    const source = path.join(outputRoot, entry.name);
    const destination = path.join(archiveRoot, entry.name);
    fs.renameSync(source, destination);
    moved.push({ source, destination });
  }

  const archivedFiles = walkFiles(archiveRoot).sort();
  const archivedBytes = archivedFiles.reduce(
    (total, filePath) => total + fs.statSync(filePath).size,
    0
  );
  if (
    archivedFiles.length !== sourceFilesBefore.length ||
    archivedBytes !== sourceBytesBefore
  ) {
    throw new Error(
      `Archive verification failed: expected ${sourceFilesBefore.length} files/${sourceBytesBefore} bytes, received ${archivedFiles.length}/${archivedBytes}.`
    );
  }

  const archivedAt = new Date().toISOString();
  const inventory = archivedFiles.map((filePath) => ({
    path: relativePosix(archiveRoot, filePath),
    bytes: fs.statSync(filePath).size,
    sha256: sha256File(filePath)
  }));
  const metadataPath = path.join(archiveRoot, "archive-metadata.json");
  fs.writeFileSync(
    metadataPath,
    `${JSON.stringify(
      {
        schemaVersion: "affiliate-pilot-superseded-archive-v1",
        archivedAt,
        disposition: "owner_superseded_full_restart",
        priorGenerationVersion,
        reason:
          "Owner required a full exact-product evidence and candidate-pool restart. No prior identity or styled output may be reused.",
        pendingCandidateDisposition:
          pendingCalls.length > 0 ? "superseded_unreviewed" : "none",
        priorManifestSha256: priorManifestHash,
        priorExecutionLogSha256: priorLedgerHash,
        archivedFileCountBeforeMetadata: archivedFiles.length,
        archivedByteCountBeforeMetadata: archivedBytes,
        inventory
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  const nextManifest = buildAffiliatePilotV4Manifest(
    affiliateApprovedCohortFixture()
  );
  const nextLedger = buildAffiliatePilotV4ExecutionLog(
    relativePosix(repoRoot, archiveRoot),
    archivedAt
  );
  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify(nextManifest, null, 2)}\n`,
    "utf8"
  );
  fs.writeFileSync(
    ledgerPath,
    `${JSON.stringify(nextLedger, null, 2)}\n`,
    "utf8"
  );

  console.log(
    JSON.stringify(
      {
        ...plan,
        status: "applied",
        archivedAt,
        archivedFileCount: walkFiles(archiveRoot).length,
        archiveMetadataSha256: sha256File(metadataPath),
        newManifestSha256: sha256File(manifestPath),
        newExecutionLogSha256: sha256File(ledgerPath)
      },
      null,
      2
    )
  );
} catch (error) {
  for (const move of moved.reverse()) {
    if (fs.existsSync(move.destination)) {
      fs.mkdirSync(path.dirname(move.source), { recursive: true });
      fs.renameSync(move.destination, move.source);
    }
  }
  if (fs.existsSync(archiveRoot) && walkFiles(archiveRoot).length === 0) {
    fs.rmSync(archiveRoot, { recursive: true });
  }
  throw error;
}
