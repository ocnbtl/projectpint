export const AFFILIATE_PILOT_V4_DOSSIER_SCHEMA_VERSION =
  "affiliate-pilot-product-dossier-v4.1";

export const affiliatePilotV4DossierClaimSections = [
  "exactSkuIdentity",
  "materials",
  "finish",
  "dimensions",
  "topology",
  "countableFeatures",
  "patternOrGrain",
  "mountingOrSupport",
  "orientationAndHandedness",
  "hiddenGeometry"
] as const;

export type AffiliatePilotV4DossierClaimSection =
  (typeof affiliatePilotV4DossierClaimSections)[number];

export type AffiliatePilotV4DossierClaimBlock = {
  claims: string[];
  sourceIds: string[];
  confidence: "confirmed" | "bounded_inference";
};

export type AffiliatePilotV4DossierSource = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  accessedAt: string;
  sourceType: string;
  exactSkuMatch: boolean;
  claims: string[];
  snapshotPath: string;
  snapshotSha256: string;
};

export type AffiliatePilotV4PrivateReference = {
  path: string;
  sha256: string;
  sourceId: string;
  role:
    | "canonical_product"
    | "alternate_angle"
    | "topology"
    | "material_pattern"
    | "mounting_context"
    | "botanical_variation_boundary";
};

export type AffiliatePilotV4ProductDossier = {
  schemaVersion: typeof AFFILIATE_PILOT_V4_DOSSIER_SCHEMA_VERSION;
  asin: string;
  researchedAt: string;
  [key: string]: unknown;
  exactSkuIdentity: AffiliatePilotV4DossierClaimBlock;
  materials: AffiliatePilotV4DossierClaimBlock;
  finish: AffiliatePilotV4DossierClaimBlock;
  dimensions: AffiliatePilotV4DossierClaimBlock;
  topology: AffiliatePilotV4DossierClaimBlock;
  countableFeatures: AffiliatePilotV4DossierClaimBlock;
  patternOrGrain: AffiliatePilotV4DossierClaimBlock;
  mountingOrSupport: AffiliatePilotV4DossierClaimBlock;
  orientationAndHandedness: AffiliatePilotV4DossierClaimBlock;
  hiddenGeometry: AffiliatePilotV4DossierClaimBlock;
  explicitUnknowns: Array<{
    field: string;
    handling: string;
    identityCritical: boolean;
  }>;
  contradictions: Array<{
    field: string;
    observation: string;
    resolution: string;
    status: "resolved" | "bounded";
  }>;
  sources: AffiliatePilotV4DossierSource[];
  privateReferences: AffiliatePilotV4PrivateReference[];
  readiness: {
    status: "research_complete";
    blockers: string[];
  };
};

export type AffiliatePilotV4DossierValidation = {
  valid: boolean;
  errors: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyStrings(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

export function validateAffiliatePilotV4Dossier(
  value: unknown,
  expectedAsin?: string
): AffiliatePilotV4DossierValidation {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { valid: false, errors: ["Dossier must be a JSON object."] };
  }

  if (value.schemaVersion !== AFFILIATE_PILOT_V4_DOSSIER_SCHEMA_VERSION) {
    errors.push(`Unsupported dossier schemaVersion: ${String(value.schemaVersion)}.`);
  }
  if (typeof value.asin !== "string" || !/^B[A-Z0-9]{9}$/.test(value.asin)) {
    errors.push("Dossier ASIN must use the ten-character Amazon identifier format.");
  } else if (expectedAsin && value.asin !== expectedAsin) {
    errors.push(`Dossier ASIN ${value.asin} does not match expected ${expectedAsin}.`);
  }
  if (typeof value.researchedAt !== "string" || Number.isNaN(Date.parse(value.researchedAt))) {
    errors.push("Dossier researchedAt must be a valid timestamp.");
  }

  const sources = Array.isArray(value.sources) ? value.sources : [];
  const sourceIds = new Set<string>();
  let exactSkuSourceCount = 0;
  if (sources.length === 0) errors.push("Dossier must include at least one source.");
  for (const [index, source] of sources.entries()) {
    if (!isRecord(source)) {
      errors.push(`Source ${index + 1} must be an object.`);
      continue;
    }
    if (typeof source.id !== "string" || source.id.trim().length === 0) {
      errors.push(`Source ${index + 1} needs an id.`);
    } else if (sourceIds.has(source.id)) {
      errors.push(`Source id ${source.id} is duplicated.`);
    } else {
      sourceIds.add(source.id);
    }
    for (const field of ["title", "url", "publisher", "accessedAt", "sourceType", "snapshotPath"] as const) {
      if (typeof source[field] !== "string" || source[field].trim().length === 0) {
        errors.push(`Source ${String(source.id ?? index + 1)} needs ${field}.`);
      }
    }
    if (!isSha256(source.snapshotSha256)) {
      errors.push(`Source ${String(source.id ?? index + 1)} needs a lowercase SHA-256 snapshot hash.`);
    }
    if (!nonEmptyStrings(source.claims)) {
      errors.push(`Source ${String(source.id ?? index + 1)} needs claim links.`);
    }
    if (source.exactSkuMatch === true) exactSkuSourceCount += 1;
  }
  if (exactSkuSourceCount === 0) {
    errors.push("At least one source must match the exact SKU or approved exact variation.");
  }

  for (const sectionName of affiliatePilotV4DossierClaimSections) {
    const section = value[sectionName];
    if (!isRecord(section)) {
      errors.push(`${sectionName} must be a claim block.`);
      continue;
    }
    if (!nonEmptyStrings(section.claims)) {
      errors.push(`${sectionName} needs at least one claim.`);
    }
    if (!nonEmptyStrings(section.sourceIds)) {
      errors.push(`${sectionName} needs at least one source id.`);
    } else {
      for (const sourceId of section.sourceIds) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`${sectionName} cites missing source ${sourceId}.`);
        }
      }
    }
    if (section.confidence !== "confirmed" && section.confidence !== "bounded_inference") {
      errors.push(`${sectionName} has an unsupported confidence value.`);
    }
  }

  const privateReferences = Array.isArray(value.privateReferences)
    ? value.privateReferences
    : [];
  if (privateReferences.length === 0) {
    errors.push("Dossier must include at least one hashed private reference.");
  }
  const referencePaths = new Set<string>();
  for (const [index, reference] of privateReferences.entries()) {
    if (!isRecord(reference)) {
      errors.push(`Private reference ${index + 1} must be an object.`);
      continue;
    }
    if (typeof reference.path !== "string" || reference.path.trim().length === 0) {
      errors.push(`Private reference ${index + 1} needs a path.`);
    } else if (referencePaths.has(reference.path)) {
      errors.push(`Private reference path ${reference.path} is duplicated.`);
    } else {
      referencePaths.add(reference.path);
    }
    if (!isSha256(reference.sha256)) {
      errors.push(`Private reference ${index + 1} needs a lowercase SHA-256 hash.`);
    }
    if (typeof reference.sourceId !== "string" || !sourceIds.has(reference.sourceId)) {
      errors.push(`Private reference ${index + 1} cites a missing source.`);
    }
    if (typeof reference.role !== "string" || reference.role.trim().length === 0) {
      errors.push(`Private reference ${index + 1} needs a role.`);
    }
  }

  const unknowns = Array.isArray(value.explicitUnknowns) ? value.explicitUnknowns : [];
  for (const [index, unknown] of unknowns.entries()) {
    if (!isRecord(unknown)) {
      errors.push(`Explicit unknown ${index + 1} must be an object.`);
      continue;
    }
    if (unknown.identityCritical === true) {
      errors.push(`Identity-critical unknown remains unresolved: ${String(unknown.field ?? index + 1)}.`);
    }
    if (typeof unknown.handling !== "string" || unknown.handling.trim().length === 0) {
      errors.push(`Explicit unknown ${index + 1} needs a conservative handling rule.`);
    }
  }

  const contradictions = Array.isArray(value.contradictions) ? value.contradictions : [];
  for (const [index, contradiction] of contradictions.entries()) {
    if (!isRecord(contradiction)) {
      errors.push(`Contradiction ${index + 1} must be an object.`);
      continue;
    }
    if (contradiction.status !== "resolved" && contradiction.status !== "bounded") {
      errors.push(`Contradiction ${index + 1} needs a resolved or bounded status.`);
    }
    if (typeof contradiction.resolution !== "string" || contradiction.resolution.trim().length === 0) {
      errors.push(`Contradiction ${index + 1} needs a resolution.`);
    }
  }

  const readiness = value.readiness;
  if (!isRecord(readiness) || readiness.status !== "research_complete") {
    errors.push("Dossier readiness must be research_complete.");
  } else if (!Array.isArray(readiness.blockers) || readiness.blockers.length !== 0) {
    errors.push("A research_complete dossier cannot contain blockers.");
  }

  return { valid: errors.length === 0, errors };
}
