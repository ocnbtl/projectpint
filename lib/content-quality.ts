import { lintEditorialStyle } from "./style-linter.ts";

export type ContentKind = "blog" | "guide";

export interface ContentQualitySummary {
  score: number;
  notes: string;
  blockingIssues: string[];
}

const DASH_RE = /[\u2010-\u2015-]/;
const HARD_SELL_RE = /\b(buy now|last chance|limited time|must buy|act fast|guaranteed|don't miss out)\b/i;
const BANNED_STYLE_RE = /\bit is not\b.*\bit is\b/i;

function visibleText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[*`#>]/g, "")
    .replace(/\r/g, "")
    .trim();
}

function wordCount(text: string): number {
  return text
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function similarityScore(a: string, b: string): number {
  const tokensA = new Set(a.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const tokensB = new Set(b.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) overlap += 1;
  }
  return overlap / Math.max(tokensA.size, tokensB.size);
}

function hasConstraintLanguage(text: string): boolean {
  return /\b(renter|no drill|reversible|landlord safe|temporary|deposit|small bathroom|budget)\b/i.test(text);
}

function hasTimeAndTools(text: string): boolean {
  const hasTime = /\bminute|hour|minutes|hours\b/i.test(text);
  const hasTools = /\btools?|measuring tape|screwdriver|drill|cloth|scissors|adhesive\b/i.test(text);
  return hasTime && hasTools;
}

function hasTradeoff(text: string): boolean {
  return /\btradeoff|trade off|but\b/i.test(text);
}

export function summarizeContentQuality(params: {
  id: string;
  kind: ContentKind;
  title: string;
  content: string;
  ctaUrl: string;
  existingTitles: string[];
  allowedCtaUrls: string[];
}): ContentQualitySummary {
  const visible = visibleText(`${params.title}\n${params.content}`);
  const words = wordCount(visible);
  const style = lintEditorialStyle(params.id, params.kind === "blog" ? "blog" : "micro", visible);
  const notes: string[] = [];
  const blockingIssues: string[] = [];
  let score = 100;

  const minWords = params.kind === "blog" ? 900 : 350;
  const maxWords = params.kind === "blog" ? 2600 : 900;
  const withinRange = words >= minWords && words <= maxWords;
  notes.push(`${withinRange ? "PASS" : "WARN"} word count ${words} (${minWords} to ${maxWords} target)`);
  if (!withinRange) score -= 10;

  const hasHeading = /^##?\s/m.test(params.content);
  notes.push(`${hasHeading ? "PASS" : "WARN"} heading structure`);
  if (!hasHeading) score -= 8;

  const hasOrdered = /^\d+\.\s/m.test(params.content);
  notes.push(`${hasOrdered ? "PASS" : "WARN"} numbered list present`);
  if (!hasOrdered) score -= 8;

  const hasBullets = /^•\s/m.test(params.content);
  notes.push(`${hasBullets ? "PASS" : "WARN"} bullet list present`);
  if (!hasBullets) score -= 8;

  const hasBudget = /(?:\$|\bunder\s+\d|\b\d+\s+dollars\b|\b\d+\s+usd\b)/i.test(visible);
  notes.push(`${hasBudget ? "PASS" : "WARN"} budget detail present`);
  if (!hasBudget) score -= 8;

  const constraint = hasConstraintLanguage(visible);
  notes.push(`${constraint ? "PASS" : "WARN"} constraint language present`);
  if (!constraint) score -= 8;

  const toolsAndTime = hasTimeAndTools(visible);
  notes.push(`${toolsAndTime ? "PASS" : "WARN"} time and tools present`);
  if (!toolsAndTime) score -= 8;

  const tradeoff = hasTradeoff(visible);
  notes.push(`${tradeoff ? "PASS" : "WARN"} realistic tradeoff present`);
  if (!tradeoff) score -= 6;

  const visibleHasDash = DASH_RE.test(visible);
  notes.push(`${visibleHasDash ? "BLOCK" : "PASS"} no visible dash characters`);
  if (visibleHasDash) {
    blockingIssues.push("visible_dash_characters");
    score -= 20;
  }

  const hardSell = HARD_SELL_RE.test(visible);
  notes.push(`${hardSell ? "BLOCK" : "PASS"} no hard sell language`);
  if (hardSell) {
    blockingIssues.push("hard_sell_language");
    score -= 20;
  }

  const bannedStyle = BANNED_STYLE_RE.test(visible);
  notes.push(`${bannedStyle ? "BLOCK" : "PASS"} no formulaic contrast phrasing`);
  if (bannedStyle) {
    blockingIssues.push("formulaic_contrast_phrasing");
    score -= 18;
  }

  const ctaValid = params.allowedCtaUrls.includes(params.ctaUrl);
  notes.push(`${ctaValid ? "PASS" : "BLOCK"} CTA target is allowed`);
  if (!ctaValid) {
    blockingIssues.push("invalid_cta_target");
    score -= 20;
  }

  const internalLinkCount = (params.content.match(/\[[^\]]+\]\((\/[^)]+)\)/g) ?? []).length;
  notes.push(`${internalLinkCount <= 2 ? "PASS" : "WARN"} internal link count ${internalLinkCount}`);
  if (internalLinkCount > 2) score -= 5;

  const nearDuplicate = params.existingTitles.some((existing) => similarityScore(existing, params.title) >= 0.7);
  notes.push(`${nearDuplicate ? "WARN" : "PASS"} title uniqueness`);
  if (nearDuplicate) score -= 10;

  notes.push(`PASS style score ${style.score}`);
  score = Math.max(0, Math.min(100, Math.round((score + style.score) / 2)));
  if (style.flags.some((flag) => flag.startsWith("hard_sell_language"))) {
    blockingIssues.push("style_linter_hard_sell");
  }
  if (style.flags.includes("benefit_framing_weak")) {
    notes.push("WARN benefit framing is weak");
    score -= 8;
  }

  return {
    score: Math.max(0, score),
    notes: `Score: ${Math.max(0, score)}\n${notes.join("\n")}`,
    blockingIssues
  };
}
