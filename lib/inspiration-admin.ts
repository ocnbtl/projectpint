import { createHash } from "node:crypto";
import { z } from "zod";
import { COMMAND_CENTER_CONTENT_AREAS } from "./constants.ts";
import { DEFAULT_EDITORIAL_METADATA, editorialMetadataSchema, type EditorialMetadata } from "./editorial-content.ts";
import {
  editableEditorialRows,
  isPublishedSnapshot,
  mergeEditorialAdminSave,
  publicEditorialRows,
  publishEditorialSnapshots,
  restoreEditorialSnapshot,
  unpublishEditorialSnapshot
} from "./editorial-publication.ts";
import { INSPIRATION_STYLE_VALUES } from "./inspiration-shared.ts";
import { loadRuntimeTab, saveRuntimeTab } from "./runtime-store.ts";

export const INSPIRATION_RUNTIME_TAB = "Inspiration_Evergreen";

export interface InspirationEvergreenRow extends Record<string, unknown> {
  Inspiration_ID: string;
  Inspiration_Publish_Date: string;
  Inspiration_Publish_Time: string;
  Content_Area: string;
  Workflow_Status: string;
  Inspiration_URL: string;
  Inspiration_Title: string;
  Inspiration_Style: string;
  Inspiration_Tags: string;
  Inspiration_Description: string;
  Inspiration_Body: string;
  Hero_Image_URL: string;
  Hero_Alt_Text: string;
  Hero_Caption: string;
  Hero_Credit: string;
  Hero_Rights_Status: string;
  SEO_Title: string;
  SEO_Description: string;
  Canonical_URL: string;
  Social_Image_URL: string;
  Indexable: string;
  Published_To_Public_At: string;
}

export interface InspirationEditorModel {
  kind: "inspiration";
  id: string;
  title: string;
  slug: string;
  style: string;
  area: string;
  workflowStatus: "draft" | "approved";
  publishDate: string;
  publishTime: string;
  keywords: string;
  body: string;
  writerBrief: string;
  ctaTarget: string;
  relatedBlogId: string;
  metadata: EditorialMetadata;
  revision: string;
  qualityScore: string;
  qualityChecks: string;
  publishedAt: string;
  hasPublishedVersion: boolean;
}

export interface PublicInspirationEntry {
  id: string;
  slug: string;
  title: string;
  style: string;
  tags: string[];
  area: string;
  description: string;
  body: string;
  heroImageUrl: string;
  heroAlt: string;
  heroCaption: string;
  heroCredit: string;
  metadata: EditorialMetadata;
  publishedAt: string;
}

const optionalDate = z.union([z.literal(""), z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use MM/DD/YYYY.")]);
const optionalTime = z.union([z.literal(""), z.string().regex(/^\d{2}:\d{2}$/, "Use a valid 24-hour time.")]);

export const inspirationEditorInputSchema = z.object({
  kind: z.literal("inspiration"),
  id: z.string().trim().max(120).default(""),
  title: z.string().trim().min(1).max(300),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase, hyphenated slug."),
  style: z.string().refine((value) => INSPIRATION_STYLE_VALUES.includes(value as (typeof INSPIRATION_STYLE_VALUES)[number]), "Choose an approved inspiration style."),
  area: z.string().refine((value) => COMMAND_CENTER_CONTENT_AREAS.includes(value as (typeof COMMAND_CENTER_CONTENT_AREAS)[number]), "Choose a valid content area."),
  workflowStatus: z.enum(["draft", "approved"]),
  publishDate: optionalDate,
  publishTime: optionalTime,
  keywords: z.string().trim().max(4_000).default(""),
  body: z.string().trim().min(1).max(200_000),
  writerBrief: z.string().max(100_000).default(""),
  ctaTarget: z.string().trim().max(2_048).default(""),
  relatedBlogId: z.string().trim().max(120).default(""),
  metadata: editorialMetadataSchema
});

export class InspirationConflictError extends Error {
  constructor() {
    super("This inspiration entry changed in another session. Reload it before saving again.");
    this.name = "InspirationConflictError";
  }
}

export class InspirationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InspirationValidationError";
  }
}

function revision(row: Record<string, unknown> | null): string {
  return createHash("sha256").update(JSON.stringify(row ?? null)).digest("hex");
}

function slugFromRow(row: InspirationEvergreenRow): string {
  return row.Inspiration_URL.split("?")[0]?.split("/").filter(Boolean).at(-1) ?? "";
}

function metadataFromRow(row: InspirationEvergreenRow): EditorialMetadata {
  return editorialMetadataSchema.parse({
    authorName: "",
    excerpt: row.Inspiration_Description,
    heroImageUrl: row.Hero_Image_URL,
    heroAlt: row.Hero_Alt_Text,
    heroCaption: row.Hero_Caption,
    heroCredit: row.Hero_Credit,
    heroRights: row.Hero_Rights_Status === "approved" ? "approved" : "unverified",
    seoTitle: row.SEO_Title,
    seoDescription: row.SEO_Description,
    canonicalUrl: row.Canonical_URL,
    socialImageUrl: row.Social_Image_URL,
    indexable: row.Indexable.trim().toLowerCase() !== "false"
  });
}

function modelFromRow(row: InspirationEvergreenRow, allRows: InspirationEvergreenRow[]): InspirationEditorModel {
  const sourceId = row.Inspiration_ID;
  const snapshotExists = allRows.some(
    (candidate) => isPublishedSnapshot("inspiration", candidate) && String(candidate.Inspiration_ID).endsWith(sourceId)
  );
  const rawStatus = row.Workflow_Status.trim().toLowerCase();
  return {
    kind: "inspiration",
    id: sourceId,
    title: row.Inspiration_Title,
    slug: slugFromRow(row),
    style: row.Inspiration_Style,
    area: row.Content_Area || "DIY",
    workflowStatus: rawStatus === "approved" || rawStatus === "published" ? "approved" : "draft",
    publishDate: row.Inspiration_Publish_Date,
    publishTime: row.Inspiration_Publish_Time,
    keywords: row.Inspiration_Tags,
    body: row.Inspiration_Body,
    writerBrief: "",
    ctaTarget: "",
    relatedBlogId: "",
    metadata: metadataFromRow(row),
    revision: revision(row),
    qualityScore: "",
    qualityChecks: "",
    publishedAt: row.Published_To_Public_At,
    hasPublishedVersion: snapshotExists || rawStatus === "published" || Boolean(row.Published_To_Public_At)
  };
}

function publicEntryFromRow(row: InspirationEvergreenRow): PublicInspirationEntry {
  const metadata = metadataFromRow(row);
  return {
    id: row.Inspiration_ID,
    slug: slugFromRow(row),
    title: row.Inspiration_Title,
    style: row.Inspiration_Style,
    tags: row.Inspiration_Tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    area: row.Content_Area,
    description: row.Inspiration_Description,
    body: row.Inspiration_Body,
    heroImageUrl: row.Hero_Image_URL,
    heroAlt: row.Hero_Alt_Text,
    heroCaption: row.Hero_Caption,
    heroCredit: row.Hero_Credit,
    metadata,
    publishedAt: row.Published_To_Public_At
  };
}

function nextId(rows: InspirationEvergreenRow[]): string {
  const max = rows.reduce((current, row) => {
    const value = Number(row.Inspiration_ID.replace(/\D/g, ""));
    return Number.isFinite(value) ? Math.max(current, value) : current;
  }, 0);
  return `INSP_${String(max + 1).padStart(4, "0")}`;
}

async function loadAllRows(): Promise<InspirationEvergreenRow[]> {
  return loadRuntimeTab<InspirationEvergreenRow>(INSPIRATION_RUNTIME_TAB);
}

export function blankInspirationModel(): InspirationEditorModel {
  return {
    kind: "inspiration",
    id: "",
    title: "",
    slug: "",
    style: INSPIRATION_STYLE_VALUES[0],
    area: "DIY",
    workflowStatus: "draft",
    publishDate: "",
    publishTime: "",
    keywords: "",
    body: "",
    writerBrief: "",
    ctaTarget: "",
    relatedBlogId: "",
    metadata: { ...DEFAULT_EDITORIAL_METADATA },
    revision: revision(null),
    qualityScore: "",
    qualityChecks: "",
    publishedAt: "",
    hasPublishedVersion: false
  };
}

export async function listInspirationEditorModels(): Promise<InspirationEditorModel[]> {
  const allRows = await loadAllRows();
  return editableEditorialRows("inspiration", allRows).map((row) => modelFromRow(row, allRows));
}

export async function loadInspirationEditorModel(sourceId: string): Promise<InspirationEditorModel | null> {
  if (sourceId === "new") return blankInspirationModel();
  const allRows = await loadAllRows();
  const row = editableEditorialRows("inspiration", allRows).find((item) => item.Inspiration_ID === sourceId);
  return row ? modelFromRow(row, allRows) : null;
}

export async function saveInspirationEditorModel(input: unknown, expectedRevision: string): Promise<InspirationEditorModel> {
  const parsed = inspirationEditorInputSchema.parse(input);
  const allRows = await loadAllRows();
  const editableRows = editableEditorialRows("inspiration", allRows);
  const currentIndex = parsed.id ? editableRows.findIndex((row) => row.Inspiration_ID === parsed.id) : -1;
  const currentRow = currentIndex >= 0 ? editableRows[currentIndex] : null;
  if (revision(currentRow) !== expectedRevision) throw new InspirationConflictError();

  const sourceId = currentRow?.Inspiration_ID ?? nextId(editableRows);
  const duplicate = editableRows.find((row) => row.Inspiration_ID !== sourceId && slugFromRow(row) === parsed.slug);
  if (duplicate) throw new InspirationValidationError(`The slug ${parsed.slug} is already used by ${duplicate.Inspiration_ID}.`);

  const nextRow: InspirationEvergreenRow = {
    ...(currentRow ?? {}),
    Inspiration_ID: sourceId,
    Inspiration_Publish_Date: parsed.publishDate,
    Inspiration_Publish_Time: parsed.publishTime,
    Content_Area: parsed.area,
    Workflow_Status: parsed.workflowStatus,
    Inspiration_URL: `/inspiration/${parsed.slug}`,
    Inspiration_Title: parsed.title,
    Inspiration_Style: parsed.style,
    Inspiration_Tags: parsed.keywords,
    Inspiration_Description: parsed.metadata.excerpt,
    Inspiration_Body: parsed.body,
    Hero_Image_URL: parsed.metadata.heroImageUrl,
    Hero_Alt_Text: parsed.metadata.heroAlt,
    Hero_Caption: parsed.metadata.heroCaption,
    Hero_Credit: parsed.metadata.heroCredit,
    Hero_Rights_Status: parsed.metadata.heroRights,
    SEO_Title: parsed.metadata.seoTitle,
    SEO_Description: parsed.metadata.seoDescription,
    Canonical_URL: parsed.metadata.canonicalUrl,
    Social_Image_URL: parsed.metadata.socialImageUrl,
    Indexable: String(parsed.metadata.indexable),
    Published_To_Public_At: currentRow?.Published_To_Public_At ?? ""
  };
  const nextEditable = currentIndex >= 0
    ? editableRows.map((row, index) => index === currentIndex ? nextRow : row)
    : [...editableRows, nextRow];
  const nextRows = mergeEditorialAdminSave("inspiration", allRows, nextEditable);
  await saveRuntimeTab(INSPIRATION_RUNTIME_TAB, nextRows);
  return modelFromRow(nextRow, nextRows);
}

export async function publishInspirationItem(sourceId: string): Promise<void> {
  const allRows = await loadAllRows();
  const row = editableEditorialRows("inspiration", allRows).find((item) => item.Inspiration_ID === sourceId);
  if (!row) throw new InspirationValidationError(`No inspiration entry exists with ID ${sourceId}.`);
  if (!["approved", "published"].includes(row.Workflow_Status.trim().toLowerCase())) {
    throw new InspirationValidationError("Set the workflow status to approved before publishing.");
  }
  const metadata = metadataFromRow(row);
  const missing = [
    !row.Inspiration_Title && "title",
    !slugFromRow(row) && "slug",
    !row.Inspiration_Style && "style",
    !row.Inspiration_Description && "description",
    !row.Inspiration_Body && "body",
    !metadata.heroImageUrl && "hero image",
    !metadata.heroAlt && "hero alt text",
    metadata.heroRights !== "approved" && "confirmed image rights"
  ].filter(Boolean);
  if (missing.length > 0) throw new InspirationValidationError(`Add ${missing.join(", ")} before publishing.`);

  const publishedAt = new Date().toISOString();
  const nextRows = publishEditorialSnapshots("inspiration", allRows, [sourceId], publishedAt);
  await saveRuntimeTab(INSPIRATION_RUNTIME_TAB, nextRows);
}

export async function unpublishInspirationItem(sourceId: string): Promise<void> {
  const allRows = await loadAllRows();
  const exists = editableEditorialRows("inspiration", allRows).some((row) => row.Inspiration_ID === sourceId);
  if (!exists) throw new InspirationValidationError(`No inspiration entry exists with ID ${sourceId}.`);
  await saveRuntimeTab(INSPIRATION_RUNTIME_TAB, unpublishEditorialSnapshot("inspiration", allRows, sourceId));
}

export async function restoreInspirationItem(sourceId: string): Promise<void> {
  const allRows = await loadAllRows();
  const nextRows = restoreEditorialSnapshot("inspiration", allRows, sourceId);
  if (JSON.stringify(nextRows) === JSON.stringify(allRows)) {
    throw new InspirationValidationError("No published snapshot is available to restore.");
  }
  await saveRuntimeTab(INSPIRATION_RUNTIME_TAB, nextRows);
}

export async function readPublishedManagedInspirations(): Promise<PublicInspirationEntry[]> {
  return publicEditorialRows("inspiration", await loadAllRows()).map(publicEntryFromRow);
}
