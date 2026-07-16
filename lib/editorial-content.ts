import { z } from "zod";

const EMPTY_URL = z.literal("");

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isSafeSameSitePath(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return false;
  try {
    const base = new URL("https://project-pint.invalid");
    const resolved = new URL(value, base);
    return resolved.origin === base.origin && !resolved.hash;
  } catch {
    return false;
  }
}

const HTTPS_PUBLIC_URL = z.string().trim().max(2048).refine(isHttpsUrl, "Use a valid HTTPS URL.");
const OPTIONAL_PUBLIC_URL = z.union([EMPTY_URL, HTTPS_PUBLIC_URL]);
const OPTIONAL_CANONICAL_URL = z.string().trim().max(2048).refine(
  (value) => value === "" || isSafeSameSitePath(value) || isHttpsUrl(value),
  "Use a same-site path beginning with / or a valid HTTPS URL."
);

export const editorialMetadataSchema = z.object({
  authorName: z.string().trim().max(120).default(""),
  excerpt: z.string().trim().max(280).default(""),
  heroImageUrl: OPTIONAL_PUBLIC_URL.default(""),
  heroAlt: z.string().trim().max(240).default(""),
  heroCaption: z.string().trim().max(280).default(""),
  heroCredit: z.string().trim().max(180).default(""),
  heroRights: z.enum(["unverified", "approved"]).default("unverified"),
  seoTitle: z.string().trim().max(70).default(""),
  seoDescription: z.string().trim().max(180).default(""),
  canonicalUrl: OPTIONAL_CANONICAL_URL.default(""),
  socialImageUrl: OPTIONAL_PUBLIC_URL.default(""),
  indexable: z.boolean().default(true)
}).superRefine((metadata, context) => {
  if (metadata.socialImageUrl && metadata.socialImageUrl !== metadata.heroImageUrl) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["socialImageUrl"],
      message: "Use the rights-confirmed hero image for social sharing, or leave the social image empty."
    });
  }
});

export type EditorialMetadata = z.infer<typeof editorialMetadataSchema>;

export const DEFAULT_EDITORIAL_METADATA: EditorialMetadata = editorialMetadataSchema.parse({});

const METADATA_PATTERN = /^<!-- project-pint:editorial:([A-Za-z0-9_-]+) -->\s*/;

export function parseEditorialDocument(markdown: string): { body: string; metadata: EditorialMetadata } {
  const match = METADATA_PATTERN.exec(markdown);
  if (!match) {
    return { body: markdown, metadata: DEFAULT_EDITORIAL_METADATA };
  }

  try {
    const decoded = Buffer.from(match[1], "base64url").toString("utf8");
    const metadata = editorialMetadataSchema.parse(JSON.parse(decoded));
    return { body: markdown.slice(match[0].length), metadata };
  } catch {
    return { body: markdown.slice(match[0].length), metadata: DEFAULT_EDITORIAL_METADATA };
  }
}

export function serializeEditorialDocument(body: string, input: unknown): string {
  const metadata = editorialMetadataSchema.parse(input);
  const encoded = Buffer.from(JSON.stringify(metadata), "utf8").toString("base64url");
  return `<!-- project-pint:editorial:${encoded} -->\n\n${body.trim()}`;
}

export function validateEditorialMediaForPublish(metadata: EditorialMetadata): string[] {
  const issues: string[] = [];
  if (metadata.heroImageUrl) {
    if (!metadata.heroAlt) issues.push("Hero image alt text is required before publishing.");
    if (metadata.heroRights !== "approved") issues.push("Hero image rights must be confirmed before publishing.");
  }
  if (metadata.socialImageUrl && metadata.socialImageUrl !== metadata.heroImageUrl) {
    issues.push("The social image must use the rights-confirmed hero image.");
  }
  return issues;
}
