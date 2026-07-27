import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

type SharpPipeline = {
  composite(
    inputs: Array<{ input: Buffer; left: number; top: number }>
  ): SharpPipeline;
  flatten(options: { background: string }): SharpPipeline;
  jpeg(options: { quality: number; chromaSubsampling: string }): SharpPipeline;
  metadata(): Promise<{
    width?: number;
    height?: number;
    format?: string;
    channels?: number;
    hasAlpha?: boolean;
  }>;
  png(): SharpPipeline;
  resize(
    width: number,
    height: number,
    options: { fit: string; background: unknown }
  ): SharpPipeline;
  stats(): Promise<{ channels: Array<{ min: number; max: number }> }>;
  toBuffer(): Promise<Buffer>;
  toFile(outputPath: string): Promise<unknown>;
};

type SharpFactory = (
  input:
    | string
    | Buffer
    | {
        create: {
          width: number;
          height: number;
          channels: 4;
          background: string;
        };
      }
) => SharpPipeline;

const sharp = createRequire(import.meta.url)("sharp") as SharpFactory;

type PilotJob = {
  id: string;
  asin: string;
  kind: "presentation" | "styled";
  slot: number | null;
  storageKey: string;
  styleSlug: string | null;
};

type PilotProduct = {
  asin: string;
  slug: string;
};

type PilotManifest = {
  pilotVersion: string;
  totalCount: number;
  jobs: PilotJob[];
  products: PilotProduct[];
};

type ContactSheetJob = PilotJob & {
  labelOverride?: string;
};

const root = process.cwd();
const pilotVersion = process.argv[2];
const comparisonVersion = process.argv[3] ?? null;

if (!pilotVersion || !/^v\d+$/.test(pilotVersion)) {
  throw new Error(
    "Usage: node --import tsx scripts/qa-affiliate-pilot.ts <pilot-version> [comparison-version]"
  );
}
if (comparisonVersion && !/^v\d+$/.test(comparisonVersion)) {
  throw new Error(`Invalid comparison version: ${comparisonVersion}`);
}
if (comparisonVersion === pilotVersion) {
  throw new Error("The comparison version must differ from the target pilot version.");
}

const pilotRoot = path.join(root, "output", "affiliate-pilot", pilotVersion);
const manifestPath = path.join(pilotRoot, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as PilotManifest;
const contactRoot = path.join(pilotRoot, "contact-sheets");

fs.mkdirSync(contactRoot, { recursive: true });

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function labelFor(job: ContactSheetJob): string {
  if (job.labelOverride) return job.labelOverride;
  return job.kind === "presentation"
    ? `${job.asin} · presentation`
    : `${job.asin} · ${job.styleSlug} · ${String(job.slot).padStart(2, "0")}`;
}

async function makeTile(
  job: ContactSheetJob,
  width: number,
  height: number
): Promise<Buffer> {
  const labelHeight = 42;
  const imageHeight = height - labelHeight;
  const source = path.join(root, "output", job.storageKey);
  const image = await sharp(source)
    .resize(width, imageHeight, {
      fit: "contain",
      background: { r: 241, g: 239, b: 233, alpha: 1 }
    })
    .flatten({ background: "#f1efe9" })
    .png()
    .toBuffer();
  const label = Buffer.from(
    `<svg width="${width}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#171717"/>
      <text x="12" y="26" fill="#ffffff" font-family="Arial, sans-serif" font-size="14">${escapeXml(labelFor(job))}</text>
    </svg>`
  );

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: "#f1efe9"
    }
  })
    .composite([
      { input: image, left: 0, top: 0 },
      { input: label, left: 0, top: imageHeight }
    ])
    .png()
    .toBuffer();
}

async function makeSheet(
  jobs: ContactSheetJob[],
  columns: number,
  tileWidth: number,
  tileHeight: number,
  outputPath: string
): Promise<void> {
  const rows = Math.ceil(jobs.length / columns);
  const tiles = await Promise.all(
    jobs.map((job) => makeTile(job, tileWidth, tileHeight))
  );

  await sharp({
    create: {
      width: columns * tileWidth,
      height: rows * tileHeight,
      channels: 4,
      background: "#d8d4ca"
    }
  })
    .composite(
      tiles.map((input, index) => ({
        input,
        left: (index % columns) * tileWidth,
        top: Math.floor(index / columns) * tileHeight
      }))
    )
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
    .toFile(outputPath);
}

async function main(): Promise<void> {
  const missing = manifest.jobs
    .map((job) => path.join(root, "output", job.storageKey))
    .filter((source) => !fs.existsSync(source));
  if (missing.length > 0) {
    throw new Error(`Pilot assets are missing:\n${missing.join("\n")}`);
  }

  const technicalAssets = await Promise.all(
    manifest.jobs.map(async (job) => {
      const source = path.join(root, "output", job.storageKey);
      const bytes = fs.readFileSync(source);
      const metadata = await sharp(bytes).metadata();
      const stats = await sharp(bytes).stats();
      return {
        id: job.id,
        storageKey: job.storageKey,
        exists: true,
        bytes: bytes.length,
        sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha,
        alphaMin: stats.channels[3]?.min ?? null,
        alphaMax: stats.channels[3]?.max ?? null
      };
    })
  );

  const assetsByHash = new Map<string, (typeof technicalAssets)[number][]>();
  technicalAssets.forEach((asset) => {
    const assets = assetsByHash.get(asset.sha256) ?? [];
    assets.push(asset);
    assetsByHash.set(asset.sha256, assets);
  });
  const duplicateHashes = [...assetsByHash.entries()]
    .filter(([, assets]) => assets.length > 1)
    .map(([sha256, assets]) => ({
      sha256,
      ids: assets.map((asset) => asset.id)
    }));

  for (const product of manifest.products) {
    await makeSheet(
      manifest.jobs.filter((job) => job.asin === product.asin),
      3,
      320,
      500,
      path.join(contactRoot, `${product.asin}-${product.slug}.jpg`)
    );
  }
  await makeSheet(
    manifest.jobs,
    6,
    240,
    380,
    path.join(contactRoot, "pilot-all-33.jpg")
  );

  if (comparisonVersion) {
    const comparisonJobs = manifest.jobs
      .filter((job) => job.kind === "styled")
      .flatMap((job) => [
        {
          ...job,
          storageKey: job.storageKey.replace(
            `affiliate-pilot/${pilotVersion}/`,
            `affiliate-pilot/${comparisonVersion}/`
          ),
          labelOverride: `${comparisonVersion.toUpperCase()} · ${job.asin} · ${job.styleSlug} · ${String(job.slot).padStart(2, "0")}`
        },
        {
          ...job,
          labelOverride: `${pilotVersion.toUpperCase()} · ${job.asin} · ${job.styleSlug} · ${String(job.slot).padStart(2, "0")}`
        }
      ]);

    await makeSheet(
      comparisonJobs,
      6,
      240,
      380,
      path.join(
        contactRoot,
        `comparison-${comparisonVersion}-${pilotVersion}-all-30-pairs.jpg`
      )
    );
    for (const product of manifest.products) {
      await makeSheet(
        comparisonJobs.filter((job) => job.asin === product.asin),
        4,
        300,
        470,
        path.join(
          contactRoot,
          `comparison-${comparisonVersion}-${pilotVersion}-${product.asin}-${product.slug}.jpg`
        )
      );
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    pilotVersion: manifest.pilotVersion,
    comparisonVersion,
    manifestTotal: manifest.totalCount,
    checkedTotal: technicalAssets.length,
    missing,
    duplicateHashes,
    requiredDimensions: { width: 1024, height: 1536 },
    dimensionPassCount: technicalAssets.filter(
      (asset) => asset.width === 1024 && asset.height === 1536
    ).length,
    presentationAlphaPassCount: technicalAssets.filter(
      (asset) =>
        asset.id.endsWith(":presentation") &&
        asset.hasAlpha &&
        asset.alphaMin === 0 &&
        asset.alphaMax === 255
    ).length,
    assets: technicalAssets
  };
  fs.writeFileSync(
    path.join(pilotRoot, "technical-qa.json"),
    `${JSON.stringify(report, null, 2)}\n`
  );

  console.log(
    JSON.stringify(
      {
        checkedTotal: report.checkedTotal,
        missing: report.missing.length,
        duplicateHashes: report.duplicateHashes.length,
        dimensionPassCount: report.dimensionPassCount,
        presentationAlphaPassCount: report.presentationAlphaPassCount,
        contactRoot
      },
      null,
      2
    )
  );
}

await main();
