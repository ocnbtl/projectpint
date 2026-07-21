import { z } from "zod";
import { inspirationStyles, type InspirationItem } from "./redesign-data.ts";
import { loadServerStorageTab, saveServerStorageTab } from "./runtime-store.ts";

const STORAGE_TAB = "Affiliate_Links";

export const AFFILIATE_LINK_COLUMNS = [
  "Link_ID",
  "Style",
  "Style_Name",
  "Product_Name",
  "Product_URL",
  "Image_URL",
  "Image_Alt",
  "Status"
] as const;

export type AffiliateLinkRow = Record<(typeof AFFILIATE_LINK_COLUMNS)[number], string>;

const allowedStyles = new Set(inspirationStyles.map((style) => style.slug));
const rowSchema = z.object({
  Link_ID: z.string().trim().min(1).max(120),
  Style: z.string().trim().refine((value) => allowedStyles.has(value), "Choose a current Inspiration style."),
  Style_Name: z.string().trim().min(1).max(120),
  Product_Name: z.string().trim().min(1).max(180),
  Product_URL: z.string().trim().url().refine(isAllowedAmazonUrl, "Use an https Amazon or amzn.to product URL."),
  Image_URL: z.string().trim().refine(isAllowedImageUrl, "Use a local /images path or an https image URL."),
  Image_Alt: z.string().trim().min(1).max(240),
  Status: z.enum(["active", "draft"])
}).strict();

const rowsSchema = z.array(rowSchema).max(200).superRefine((rows, context) => {
  const ids = new Set<string>();
  rows.forEach((row, index) => {
    if (ids.has(row.Link_ID)) {
      context.addIssue({ code: "custom", path: [index, "Link_ID"], message: `Duplicate Link_ID: ${row.Link_ID}` });
    }
    ids.add(row.Link_ID);
  });
});

export class AffiliateLinkConflictError extends Error {}

function isAllowedAmazonUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const hostname = url.hostname.toLowerCase();
    return hostname === "amzn.to" || hostname === "amazon.com" || hostname.endsWith(".amazon.com");
  } catch {
    return false;
  }
}

function isAllowedImageUrl(value: string): boolean {
  if (value.startsWith("/images/")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function defaultRows(): AffiliateLinkRow[] {
  return inspirationStyles.flatMap((style) =>
    style.items.flatMap((item) => item.type === "product" ? [{
      Link_ID: item.id,
      Style: style.slug,
      Style_Name: style.name,
      Product_Name: item.name,
      Product_URL: item.url,
      Image_URL: item.image,
      Image_Alt: item.imageAlt,
      Status: "active"
    }] : [])
  );
}

export function parseAffiliateLinkRows(value: unknown): AffiliateLinkRow[] {
  return rowsSchema.parse(value) as AffiliateLinkRow[];
}

async function loadAffiliateLinksStrict(): Promise<AffiliateLinkRow[]> {
  const stored = await loadServerStorageTab<AffiliateLinkRow>(STORAGE_TAB);
  if (stored.length === 0) return defaultRows();
  return parseAffiliateLinkRows(stored);
}

export async function readAffiliateLinks(): Promise<AffiliateLinkRow[]> {
  try {
    return await loadAffiliateLinksStrict();
  } catch (error) {
    console.error("Affiliate link storage is unavailable or invalid; using approved defaults.", error);
    return defaultRows();
  }
}

export async function saveAffiliateLinks(rowsValue: unknown, baseRowsValue: unknown): Promise<AffiliateLinkRow[]> {
  const rows = parseAffiliateLinkRows(rowsValue);
  const baseRows = parseAffiliateLinkRows(baseRowsValue);
  const currentRows = await loadAffiliateLinksStrict();
  if (JSON.stringify(currentRows) !== JSON.stringify(baseRows)) {
    throw new AffiliateLinkConflictError("Affiliate links changed in another session. Reload the current rows before saving.");
  }
  await saveServerStorageTab(STORAGE_TAB, rows);
  return rows;
}

function withConfiguredAssociateTag(value: string): string {
  const tag = process.env.AMAZON_ASSOCIATES_TAG?.trim();
  if (!tag) return value;
  try {
    const url = new URL(value);
    if (url.hostname.toLowerCase() === "amzn.to") return value;
    if (url.searchParams.has("tag")) return value;
    url.searchParams.set("tag", tag);
    return url.toString();
  } catch {
    return value;
  }
}

export function isAmazonAssociatesTagConfigured(): boolean {
  return Boolean(process.env.AMAZON_ASSOCIATES_TAG?.trim());
}

export function applyAffiliateLinks(items: InspirationItem[], rows: AffiliateLinkRow[]): InspirationItem[] {
  const byId = new Map(rows.map((row) => [row.Link_ID, row]));
  return items.flatMap<InspirationItem>((item): InspirationItem[] => {
    if (item.type !== "product") return [item];
    const row = byId.get(item.id);
    if (!row) return [item];
    if (row.Status !== "active") return [];
    return [{
      ...item,
      name: row.Product_Name,
      retailer: "Amazon",
      url: withConfiguredAssociateTag(row.Product_URL),
      image: row.Image_URL,
      imageAlt: row.Image_Alt
    }];
  });
}
