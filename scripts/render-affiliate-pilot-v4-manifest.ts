import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { affiliatePilotV4Selections } from "../data/affiliate-pilot.v4.ts";
import { affiliateApprovedCohortFixture } from "../lib/affiliate-catalog.ts";
import {
  validateAffiliatePilotV4Dossier,
  type AffiliatePilotV4ProductDossier
} from "../lib/affiliate-pilot-v4-dossiers.ts";
import {
  buildAffiliatePilotV4ExecutionLog,
  buildAffiliatePilotV4Manifest,
  type AffiliatePilotV4DossierReadiness
} from "../lib/affiliate-pilot-v4.ts";

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function loadDossierReadiness(): AffiliatePilotV4DossierReadiness {
  const readiness: Record<
    string,
    { status: "research_complete"; privateReferenceCount: number; dossierSha256: string }
  > = {};
  for (const selection of affiliatePilotV4Selections) {
    const dossierPath = path.join(
      process.cwd(),
      "output",
      "affiliate-pilot",
      "v4",
      "private-evidence",
      "product-dossiers",
      selection.asin,
      "dossier.json"
    );
    if (!fs.existsSync(dossierPath)) continue;
    const dossier = JSON.parse(
      fs.readFileSync(dossierPath, "utf8").replace(/^\uFEFF/, "")
    ) as AffiliatePilotV4ProductDossier;
    const validation = validateAffiliatePilotV4Dossier(dossier, selection.asin);
    if (!validation.valid) {
      throw new Error(
        `${selection.asin} dossier is present but invalid:\n${validation.errors.join("\n")}`
      );
    }
    for (const source of dossier.sources) {
      const snapshotPath = path.join(process.cwd(), source.snapshotPath);
      if (!fs.existsSync(snapshotPath) || sha256File(snapshotPath) !== source.snapshotSha256) {
        throw new Error(`${selection.asin} source snapshot is missing or hash-invalid: ${source.snapshotPath}`);
      }
    }
    for (const reference of dossier.privateReferences) {
      const referencePath = path.join(process.cwd(), reference.path);
      if (!fs.existsSync(referencePath) || sha256File(referencePath) !== reference.sha256) {
        throw new Error(`${selection.asin} private reference is missing or hash-invalid: ${reference.path}`);
      }
    }
    readiness[selection.asin] = {
      status: "research_complete",
      privateReferenceCount: dossier.privateReferences.length,
      dossierSha256: sha256File(dossierPath)
    };
  }
  return readiness;
}

const dossierReadiness = loadDossierReadiness();
const manifest = buildAffiliatePilotV4Manifest(
  affiliateApprovedCohortFixture(),
  dossierReadiness
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
const initializeLedger = process.argv.includes("--initialize-ledger");
let ledgerMessage = "execution ledger unchanged";
if (initializeLedger) {
  const ledgerPath = path.join(path.dirname(outputPath), "execution-log.json");
  const existing = fs.existsSync(ledgerPath)
    ? (JSON.parse(
        fs.readFileSync(ledgerPath, "utf8").replace(/^\uFEFF/, "")
      ) as Record<string, unknown>)
    : null;
  const existingIdentity = existing?.identityGeneration as
    | Record<string, unknown>
    | undefined;
  const existingStyled = existing?.styledGeneration as
    | Record<string, unknown>
    | undefined;
  const existingCallCount =
    (Array.isArray(existingIdentity?.calls) ? existingIdentity.calls.length : 0) +
    (Array.isArray(existingStyled?.calls) ? existingStyled.calls.length : 0);
  if (existingCallCount !== 0) {
    throw new Error(
      `Refusing to reinitialize a V4 ledger containing ${existingCallCount} generation call(s).`
    );
  }
  const existingOwnerReset = existing?.ownerReset as
    | Record<string, unknown>
    | undefined;
  const supersededEvidence = String(
    existingOwnerReset?.supersededEvidence ??
      "output/affiliate-pilot/v4/superseded/pilot-2026-07-31-run-05-owner-superseded"
  );
  const createdAt = String(existing?.createdAt ?? new Date().toISOString());
  const baseLedger = buildAffiliatePilotV4ExecutionLog(
    supersededEvidence,
    createdAt
  );
  const nextLedger = {
    ...baseLedger,
    updatedAt: new Date().toISOString(),
    status: manifest.status,
    sourceResearch: {
      expected: manifest.productCount,
      completed: manifest.sourceResearchCompletedCount,
      dossierHashes: Object.fromEntries(
        Object.entries(dossierReadiness).map(([asin, dossier]) => [
          asin,
          dossier.dossierSha256
        ])
      )
    },
    ownerReset: {
      ...baseLedger.ownerReset,
      ...(existingOwnerReset ?? {})
    },
    events:
      manifest.sourceResearchCompletedCount === manifest.productCount
        ? [
            ...baseLedger.events,
            {
              type: "exact_product_research_completed",
              occurredAt: new Date().toISOString(),
              status: "identity_generation_queued",
              decision:
                "Ten exact-product dossiers passed schema, claim-link, snapshot-hash, and private-reference-hash validation."
            }
          ]
        : baseLedger.events
  };
  fs.writeFileSync(
    ledgerPath,
    `${JSON.stringify(nextLedger, null, 2)}\n`,
    "utf8"
  );
  ledgerMessage = `execution ledger initialized at ${ledgerPath}`;
}
console.log(
  `Rendered the V4 run-06 evidence-pool manifest: ${manifest.sourceResearchCompletedCount}/${manifest.productCount} exact-SKU dossiers complete, ${manifest.identityCount} fresh identity jobs ${manifest.status === "identity_generation_queued" ? "queued" : "partly blocked on source evidence"}, ${manifest.styledCount} first-pass candidates blocked on new reference packs, zero prior assets reusable, zero support/room-plate/correction calls planned, and ${manifest.totalProviderGenerationRequestFloor} one-call generations in the identity-plus-first-pass floor at ${outputPath}; ${ledgerMessage}`
);
