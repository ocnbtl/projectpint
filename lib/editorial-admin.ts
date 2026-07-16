import { createHash } from "node:crypto";
import { z } from "zod";
import { COMMAND_CENTER_CONTENT_AREAS } from "./constants.ts";
import {
  EvergreenConflictError,
  EvergreenValidationError,
  loadEvergreenTab,
  saveEvergreenTab,
  type BlogEvergreenRow,
  type GuideEvergreenRow
} from "./command-center.ts";
import {
  DEFAULT_EDITORIAL_METADATA,
  editorialMetadataSchema,
  parseEditorialDocument,
  serializeEditorialDocument,
  type EditorialMetadata
} from "./editorial-content.ts";
import type { EditorialTab } from "./editorial-publication.ts";

const optionalDate = z.union([z.literal(""), z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/)]);
const optionalTime = z.union([z.literal(""), z.string().regex(/^\d{2}:\d{2}$/)]);

export const editorialEditorInputSchema = z.object({
  kind: z.enum(["blogs", "guides"]),
  id: z.string().trim().max(120).default(""),
  title: z.string().trim().min(1).max(300),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
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

export type EditorialEditorInput = z.infer<typeof editorialEditorInputSchema>;

export interface EditorialEditorModel extends EditorialEditorInput {
  revision: string;
  qualityScore: string;
  qualityChecks: string;
  publishedAt: string;
  hasPublishedVersion: boolean;
}

function idKey(kind: EditorialTab): "Blog_ID" | "Guide_ID" {
  return kind === "blogs" ? "Blog_ID" : "Guide_ID";
}

function contentKey(kind: EditorialTab): "Blog_Content" | "Guide_Content" {
  return kind === "blogs" ? "Blog_Content" : "Guide_Content";
}

function titleKey(kind: EditorialTab): "Blog_Title" | "Guide_Title" {
  return kind === "blogs" ? "Blog_Title" : "Guide_Title";
}

function urlKey(kind: EditorialTab): "Blog_URL" | "Guide_URL" {
  return kind === "blogs" ? "Blog_URL" : "Guide_URL";
}

function nextEditorialId(kind: EditorialTab, rows: Record<string, unknown>[]): string {
  const prefix = kind === "blogs" ? "BLOG_" : "GUIDE_";
  const key = idKey(kind);
  const max = rows.reduce((current, row) => {
    const value = Number(String(row[key] ?? "").replace(/\D/g, ""));
    return Number.isFinite(value) ? Math.max(current, value) : current;
  }, 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

function slugFromRow(kind: EditorialTab, row: Record<string, unknown>): string {
  const path = String(row[urlKey(kind)] ?? "");
  const fromPath = path.split("?")[0]?.split("/").filter(Boolean).at(-1);
  if (fromPath) return fromPath;
  return String(row[titleKey(kind)] ?? row[idKey(kind)] ?? "content")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "content";
}

export function editorialRowRevision(row: Record<string, unknown> | null): string {
  return createHash("sha256").update(JSON.stringify(row ?? null)).digest("hex");
}

function modelFromRow(kind: EditorialTab, row: Record<string, unknown>): EditorialEditorModel {
  const document = parseEditorialDocument(String(row[contentKey(kind)] ?? ""));
  const rawStatus = String(row.Workflow_Status ?? "draft").trim().toLowerCase();
  const publishedAt = String(row.Published_To_Public_At ?? "");
  return {
    kind,
    id: String(row[idKey(kind)] ?? ""),
    title: String(row[titleKey(kind)] ?? ""),
    slug: slugFromRow(kind, row),
    area: String(row.Content_Area ?? "DIY"),
    workflowStatus: rawStatus === "approved" || rawStatus === "published" ? "approved" : "draft",
    publishDate: String(row[kind === "blogs" ? "Blog_Publish_Date" : "Guide_Publish_Date"] ?? ""),
    publishTime: String(row[kind === "blogs" ? "Blog_Publish_Time" : "Guide_Publish_Time"] ?? ""),
    keywords: String(row[kind === "blogs" ? "Blog_Keywords" : "Guide_Keywords"] ?? ""),
    body: document.body,
    writerBrief: String(row.Writer_Brief ?? ""),
    ctaTarget: String(row.CTA_Target ?? ""),
    relatedBlogId: kind === "guides" ? String(row.Blog_ID ?? "") : "",
    metadata: document.metadata,
    revision: editorialRowRevision(row),
    qualityScore: String(row.Quality_Score ?? ""),
    qualityChecks: String(row.Quality_Checks ?? ""),
    publishedAt,
    hasPublishedVersion: rawStatus === "published" || Boolean(publishedAt)
  };
}

export function blankEditorialModel(kind: EditorialTab): EditorialEditorModel {
  return {
    kind,
    id: "",
    title: "",
    slug: "",
    area: "DIY",
    workflowStatus: "draft",
    publishDate: "",
    publishTime: "",
    keywords: "",
    body: "",
    writerBrief: "",
    ctaTarget: "",
    relatedBlogId: "",
    metadata: DEFAULT_EDITORIAL_METADATA,
    revision: editorialRowRevision(null),
    qualityScore: "",
    qualityChecks: "",
    publishedAt: "",
    hasPublishedVersion: false
  };
}

export async function loadEditorialEditorModel(kind: EditorialTab, sourceId: string): Promise<EditorialEditorModel | null> {
  if (sourceId === "new") return blankEditorialModel(kind);
  const rows = await loadEvergreenTab(kind);
  const row = rows.find((item) => String(item[idKey(kind)] ?? "") === sourceId);
  return row ? modelFromRow(kind, row) : null;
}

export async function saveEditorialEditorModel(input: unknown, expectedRevision: string): Promise<EditorialEditorModel> {
  const parsed = editorialEditorInputSchema.parse(input);
  const kind = parsed.kind;
  const currentRows = await loadEvergreenTab(kind);
  const currentIndex = parsed.id ? currentRows.findIndex((row) => String(row[idKey(kind)] ?? "") === parsed.id) : -1;
  const currentRow = currentIndex >= 0 ? currentRows[currentIndex] : null;
  if (editorialRowRevision(currentRow) !== expectedRevision) throw new EvergreenConflictError();

  const sourceId = currentRow ? String(currentRow[idKey(kind)] ?? "") : nextEditorialId(kind, currentRows);
  const publicPath = `/${kind === "blogs" ? "blog" : "guides"}/${parsed.slug}`;
  const duplicate = currentRows.find((row) => String(row[idKey(kind)] ?? "") !== sourceId && slugFromRow(kind, row) === parsed.slug);
  if (duplicate) throw new EvergreenValidationError(`The slug ${parsed.slug} is already used by ${String(duplicate[idKey(kind)] ?? "another item")}.`);

  const nextRow: Record<string, unknown> = kind === "blogs"
    ? {
        ...(currentRow as BlogEvergreenRow | null),
        Blog_ID: sourceId,
        Blog_Publish_Date: parsed.publishDate,
        Blog_Publish_Time: parsed.publishTime,
        Content_Area: parsed.area,
        Workflow_Status: parsed.workflowStatus,
        Blog_URL: publicPath,
        Blog_Title: parsed.title,
        Blog_Keywords: parsed.keywords,
        Blog_Content: serializeEditorialDocument(parsed.body, parsed.metadata),
        Writer_Brief: parsed.writerBrief,
        CTA_Target: parsed.ctaTarget,
        Quality_Score: String(currentRow?.Quality_Score ?? ""),
        Quality_Checks: String(currentRow?.Quality_Checks ?? ""),
        Related_Pins: String(currentRow?.Related_Pins ?? ""),
        Published_To_Public_At: String(currentRow?.Published_To_Public_At ?? "")
      }
    : {
        ...(currentRow as GuideEvergreenRow | null),
        Guide_ID: sourceId,
        Guide_Publish_Date: parsed.publishDate,
        Guide_Publish_Time: parsed.publishTime,
        Content_Area: parsed.area,
        Workflow_Status: parsed.workflowStatus,
        Blog_ID: parsed.relatedBlogId,
        Guide_URL: publicPath,
        Guide_Title: parsed.title,
        Guide_Keywords: parsed.keywords,
        Guide_Content: serializeEditorialDocument(parsed.body, parsed.metadata),
        Writer_Brief: parsed.writerBrief,
        CTA_Target: parsed.ctaTarget,
        Quality_Score: String(currentRow?.Quality_Score ?? ""),
        Quality_Checks: String(currentRow?.Quality_Checks ?? ""),
        Related_Pins: String(currentRow?.Related_Pins ?? ""),
        Published_To_Public_At: String(currentRow?.Published_To_Public_At ?? "")
      };

  const nextRows = currentIndex >= 0
    ? currentRows.map((row, index) => index === currentIndex ? nextRow : row)
    : [...currentRows, nextRow];
  const savedRows = await saveEvergreenTab(kind, nextRows, currentRows);
  const saved = savedRows.find((row) => String(row[idKey(kind)] ?? "") === sourceId);
  if (!saved) throw new Error("Saved editorial row could not be reloaded.");
  return modelFromRow(kind, saved);
}

export function metadataFromEditorInput(input: EditorialEditorInput): EditorialMetadata {
  return editorialMetadataSchema.parse(input.metadata);
}
