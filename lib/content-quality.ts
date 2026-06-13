export interface ContentQualityInput {
  id: string;
  kind: "blog" | "guide";
  title: string;
  content: string;
  ctaUrl: string;
  existingTitles: string[];
  allowedCtaUrls: string[];
}

export interface ContentQualitySummary {
  score: number;
  notes: string;
  blockingIssues: string[];
}

const ACRONYM_ALLOWLIST = new Set(["DIY", "URL", "LED"]);
const CONTRACTION_RE = /\b(?:it'?s|you'?re|you'?ll|you'?ve|don'?t|doesn'?t|can'?t|won'?t|isn'?t|aren'?t|that'?s|there'?s|we'?re|we'?ll|they'?re)\b/i;

function stripMarkdownLinks(markdown: string): string {
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

function visibleText(markdown: string): string {
  return stripMarkdownLinks(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/[#*_>]/g, " ");
}

function hasVisibleDash(markdown: string): boolean {
  const text = visibleText(markdown);
  return /[\u2010-\u2015-]/.test(text);
}

function unexplainedAcronyms(markdown: string): string[] {
  const text = visibleText(markdown);
  const matches = text.match(/\b[A-Z]{2,}\b/g) ?? [];
  const unique = Array.from(new Set(matches)).filter((value) => !ACRONYM_ALLOWLIST.has(value));
  return unique.filter((value) => {
    const first = text.indexOf(value);
    if (first === -1) return false;
    const before = text.slice(Math.max(0, first - 80), first);
    const after = text.slice(first + value.length, first + value.length + 80);
    return !/\([A-Z]{2,}\)/.test(after) && !/[A-Z][a-z]+(?:\s+[A-Z]?[a-z]+){1,6}\s*\($/.test(before);
  });
}

function normalizedTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function summarizeContentQuality(input: ContentQualityInput): ContentQualitySummary {
  const blockingIssues: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  const content = input.content.trim();
  const text = visibleText(content);

  if (!input.title.trim()) {
    blockingIssues.push("missing_title");
    score -= 25;
  }

  if (!content) {
    blockingIssues.push("missing_content");
    score -= 35;
  }

  if (hasVisibleDash(content)) {
    blockingIssues.push("visible_dash_characters");
    score -= 20;
  }

  if (input.ctaUrl.trim() && input.allowedCtaUrls.length > 0 && !input.allowedCtaUrls.includes(input.ctaUrl.trim())) {
    blockingIssues.push("cta_url_not_allowed");
    score -= 15;
  }

  const duplicateTitle = normalizedTitle(input.title);
  if (duplicateTitle && input.existingTitles.some((title) => normalizedTitle(title) === duplicateTitle)) {
    blockingIssues.push("duplicate_title");
    score -= 15;
  }

  if (/\b(for the person who|for people who|for anyone who)\b/i.test(text)) {
    warnings.push("WARN no cheesy audience framing");
    score -= 5;
  }

  const acronyms = unexplainedAcronyms(content);
  if (acronyms.length > 0) {
    warnings.push(`WARN explain on first use: ${acronyms.join(", ")}`);
    score -= Math.min(10, acronyms.length * 3);
  }

  const wordCount = (text.match(/\b[\w']+\b/g) ?? []).length;
  const contractionCount = (text.match(new RegExp(CONTRACTION_RE.source, "gi")) ?? []).length;
  if (wordCount >= 90 && contractionCount === 0) {
    warnings.push("WARN natural contraction mix");
    score -= 5;
  }

  const lines = [
    ...blockingIssues.map((issue) => `BLOCK ${issue}`),
    ...warnings,
    blockingIssues.length === 0 ? "PASS no blocking quality issues" : ""
  ].filter(Boolean);

  return {
    score: Math.max(0, Math.min(100, score)),
    notes: lines.join("\n"),
    blockingIssues
  };
}
