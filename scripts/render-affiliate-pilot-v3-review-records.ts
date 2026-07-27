import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pilotRoot = path.join(root, "output", "affiliate-pilot", "v3");
const manifestPath = path.join(pilotRoot, "manifest.json");
const technicalQaPath = path.join(pilotRoot, "technical-qa.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
  totalCount: number;
  generationRequestedCount: number;
  jobs: Array<{
    asin: string;
    kind: "presentation" | "styled";
    sceneId: string | null;
    storageKey: string;
  }>;
};
const technicalQa = JSON.parse(fs.readFileSync(technicalQaPath, "utf8")) as {
  checkedTotal: number;
  missing: string[];
  duplicateHashes: unknown[];
  dimensionPassCount: number;
  presentationAlphaPassCount: number;
  comparisonPairCount: number;
};

const executionLog = {
  generatedAt: new Date().toISOString(),
  pilotVersion: "affiliate-pilot-v3",
  generationSurface: "built-in image-generation tool",
  requestedModel: "gpt-image-2",
  requestedQuality: "high",
  providerModelObserved: null,
  providerQualityObserved: null,
  providerRequestIdsObserved: false,
  billingObserved: false,
  finalAssetCount: 66,
  generatedFinalAssetCount: 63,
  reusedOwnerApprovedAssetCount: 3,
  totalGenerationCalls: 86,
  presentationGenerationCalls: 6,
  firstPassStyledCalls: 60,
  productOnlyIdentityCorrectionCalls: 20,
  callsBeyondGeneratedFinalAssets: 23,
  presentationAttempts: [
    {
      asin: "B08TLP2D54",
      attempts: 1,
      acceptedAttempt: 1,
      note: "The arched mirror presentation passed the first reviewed chroma generation."
    },
    {
      asin: "B07PFYZ3DP",
      attempts: 2,
      acceptedAttempt: 2,
      note:
        "The first cart anchor reversed the asymmetric shelf layout; the accepted retry restored the tall-left bay and short-right middle shelf."
    },
    {
      asin: "B07SG7BV11",
      attempts: 3,
      acceptedAttempt: 3,
      note:
        "Two floral-curtain anchors had incorrect top-opening counts; the accepted retry has exactly twelve openings."
    }
  ],
  styledAttempts: [
    {
      asin: "B0829N8C9G",
      firstPassCalls: 10,
      correctionCalls: 0,
      finalAttempt: "first_pass"
    },
    {
      asin: "B0D2KK6MNS",
      firstPassCalls: 10,
      correctionCalls: 0,
      finalAttempt: "first_pass"
    },
    {
      asin: "B0DC7VG6Z9",
      firstPassCalls: 10,
      correctionCalls: 10,
      finalAttempt: "product_only_identity_correction",
      rejectedEvidenceRoot:
        "affiliate-pilot/v3/rejected-first-pass/B0DC7VG6Z9"
    },
    {
      asin: "B08TLP2D54",
      firstPassCalls: 10,
      correctionCalls: 0,
      finalAttempt: "first_pass"
    },
    {
      asin: "B07PFYZ3DP",
      firstPassCalls: 10,
      correctionCalls: 10,
      finalAttempt: "product_only_identity_correction",
      rejectedEvidenceRoot:
        "affiliate-pilot/v3/rejected-first-pass/B07PFYZ3DP"
    },
    {
      asin: "B07SG7BV11",
      firstPassCalls: 10,
      correctionCalls: 0,
      finalAttempt: "first_pass"
    }
  ],
  finalManifestCountConfirmed: manifest.totalCount,
  manifestGenerationRequestedCount: manifest.generationRequestedCount,
  technicalQa: {
    checkedTotal: technicalQa.checkedTotal,
    missingCount: technicalQa.missing.length,
    duplicateHashCount: technicalQa.duplicateHashes.length,
    dimensionPassCount: technicalQa.dimensionPassCount,
    presentationAlphaPassCount: technicalQa.presentationAlphaPassCount,
    comparisonPairCount: technicalQa.comparisonPairCount
  }
};

const productVerdicts = [
  {
    asin: "B0829N8C9G",
    product: "OXO Stainless Steel Soap Dispenser",
    status: "pass_owner_review",
    strengths: [
      "Materially distinct bathrooms and viewpoints",
      "Supported props and coherent sink construction",
      "Improved shared room and product exposure",
      "Plausible mirrors and lived-in detail"
    ],
    unresolved: []
  },
  {
    asin: "B0D2KK6MNS",
    product: "KOUFALL Terracotta Rust Linen-Blend Shower Curtain",
    status: "conditional_owner_review",
    strengths: [
      "Improved room palette, lighting, camera, and architecture variety",
      "Straight rods, complete fixtures, and physically possible camera positions"
    ],
    unresolved: [
      "Several solid panels still settle into overly regular vertical folds"
    ]
  },
  {
    asin: "B0DC7VG6Z9",
    product: "Bambusi Bamboo Shower Bench",
    status: "conditional_owner_review",
    strengths: [
      "Product-only edit preserved the realistic room pass",
      "Improved nine-slat identity, matte bamboo, lower shelf, and collision behavior",
      "Varied shelf loads and surrounding props"
    ],
    unresolved: [
      "Countable top slats still require full-size human verification per image"
    ]
  },
  {
    asin: "B08TLP2D54",
    product: "Umbra Hubba Arched Wall Mirror, Brass",
    status: "pass_owner_review",
    strengths: [
      "Stable thin brass arch identity",
      "Supported sinks and plausible mounting",
      "No visible camera and generally coherent reflected geometry"
    ],
    unresolved: []
  },
  {
    asin: "B07PFYZ3DP",
    product: "Yamazaki Tower Slim Rolling Storage Cart, White",
    status: "blocked_identity",
    strengths: [
      "Useful room composition, placement, contact, and lived-in context",
      "One bounded product-only edit improved consistency"
    ],
    unresolved: [
      "Exact tall-left bay, short-right middle shelf, solid side, and caster topology remain unreliable",
      "Do not scale this product type under the current direct-generation workflow"
    ]
  },
  {
    asin: "B07SG7BV11",
    product: "Lush Decor Leah Floral Shower Curtain, Blue",
    status: "conditional_owner_review",
    strengths: [
      "Recognizable colorway across varied rooms",
      "Useful test of pattern deformation through fabric folds"
    ],
    unresolved: [
      "Prominent floral landmarks reveal motif repetition and drift",
      "Patterned textiles need a separate pattern-identity gate"
    ]
  }
];

const visualQa = {
  generatedAt: new Date().toISOString(),
  pilotVersion: "affiliate-pilot-v3",
  reviewMethod:
    "Full pilot, per-product, and v2-to-v3 contact sheets plus representative full-size scene inspection.",
  overallStatus: "blocked_owner_review_and_cart_identity",
  finalAssetCount: manifest.totalCount,
  counts: {
    passOwnerReview: productVerdicts.filter(
      (product) => product.status === "pass_owner_review"
    ).length,
    conditionalOwnerReview: productVerdicts.filter(
      (product) => product.status === "conditional_owner_review"
    ).length,
    blockedIdentity: productVerdicts.filter(
      (product) => product.status === "blocked_identity"
    ).length
  },
  globalImprovements: [
    "More plausible support, gravity, collision, and circulation",
    "More complete bathroom fixture construction",
    "More meaningful room, palette, lighting, camera, and prop variation",
    "More natural shared product and room exposure",
    "Explicit reflection and camera-position constraints"
  ],
  products: productVerdicts,
  scaleGate:
    "Owner review is required. Asymmetric multi-tier rigid products remain blocked until a stronger identity-lock workflow passes a separate small validation."
};

fs.writeFileSync(
  path.join(pilotRoot, "execution-log.json"),
  `${JSON.stringify(executionLog, null, 2)}\n`,
  "utf8"
);
fs.writeFileSync(
  path.join(pilotRoot, "visual-qa.json"),
  `${JSON.stringify(visualQa, null, 2)}\n`,
  "utf8"
);

console.log(
  JSON.stringify(
    {
      executionLog: path.join(pilotRoot, "execution-log.json"),
      visualQa: path.join(pilotRoot, "visual-qa.json"),
      generationCalls: executionLog.totalGenerationCalls,
      finalAssets: visualQa.finalAssetCount,
      productVerdicts: visualQa.counts
    },
    null,
    2
  )
);
