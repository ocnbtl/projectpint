import type { DestinationIntent, LinterResult, PinDraft } from "./types.ts";

const BANNED_PHRASES = ["game changer", "luxury look for less", "perfect for everyone", "effortless transformation"];
const VISUAL_RISK_TERMS = ["logo", "celebrity", "real person", "brand photo", "watermark"];
const SALESY_TERMS = ["must buy", "don't miss out", "limited time", "guaranteed", "secret trick", "instant result"];
const CTA_HYPE_TERMS = ["now now", "buy today", "act fast"];
const BENEFIT_TERMS = ["save time", "less clutter", "calm", "calmer", "easier routine", "faster mornings", "less visual noise", "reduce stress"];

export function lintPin(
  pin: Pick<PinDraft, "Title" | "Caption_1" | "Caption_2" | "Caption_3" | "Image_Prompt" | "Overlay_1" | "Overlay_2" | "Has_Text_Overlay">,
  hookUnique = true,
  intentBalanced = true
): LinterResult {
  const flags: string[] = [];
  const fix: string[] = [];
  const visualFlags: string[] = [];

  const textBlob = `${pin.Title} ${pin.Caption_1} ${pin.Caption_2} ${pin.Caption_3}`.toLowerCase();

  for (const phrase of BANNED_PHRASES) {
    if (textBlob.includes(phrase)) {
      flags.push(`blocking:banned_phrase:${phrase}`);
      fix.push(`Replace phrase \"${phrase}\" with specific, measurable language.`);
    }
  }

  if (!/\$\d+/.test(textBlob)) {
    flags.push("non_blocking:no_budget_specificity");
    fix.push("Add one concrete budget range like $75, $150, or $300.");
  }

  if (!BENEFIT_TERMS.some((term) => textBlob.includes(term))) {
    flags.push("non_blocking:benefit_framing_weak");
    fix.push("Add one clear reader benefit (example: saves time, reduces clutter, calmer routine).");
  }

  if (!pin.Has_Text_Overlay || !pin.Overlay_1.trim()) {
    flags.push("blocking:missing_overlay_text");
    fix.push("Add primary overlay text (<=8 words) and ensure image text is rendered before export.");
  }

  if (pin.Overlay_1.trim().split(/\s+/).length > 8) {
    flags.push("non_blocking:overlay_primary_too_long");
    fix.push("Shorten Overlay_1 to 8 words or fewer.");
  }
  if (pin.Overlay_2.trim() && pin.Overlay_2.trim().split(/\s+/).length > 6) {
    flags.push("non_blocking:overlay_secondary_too_long");
    fix.push("Shorten Overlay_2 to 6 words or fewer.");
  }

  for (const term of SALESY_TERMS) {
    if (textBlob.includes(term)) {
      flags.push(`non_blocking:sales_tone_risk:${term}`);
      fix.push(`Replace sales-heavy phrase \"${term}\" with practical language tied to constraints.`);
    }
  }

  for (const term of CTA_HYPE_TERMS) {
    if (textBlob.includes(term)) {
      flags.push(`non_blocking:cta_hype_risk:${term}`);
      fix.push(`Use a grounded CTA instead of \"${term}\".`);
    }
  }

  const exclamationCount = (textBlob.match(/!/g) ?? []).length;
  if (exclamationCount > 1) {
    flags.push("non_blocking:excessive_exclamation");
    fix.push("Reduce exclamation marks to keep tone natural.");
  }

  for (const term of VISUAL_RISK_TERMS) {
    const promptLower = pin.Image_Prompt.toLowerCase();
    const explicitNegation = promptLower.includes(`no ${term}`) || promptLower.includes(`without ${term}`);
    if (promptLower.includes(term) && !explicitNegation) {
      visualFlags.push(`prompt_risk:${term}`);
      fix.push(`Remove visual risk term \"${term}\" from prompt.`);
    }
  }

  const naturalnessFlag = !flags.some((f) => f.includes("sales_tone_risk") || f.includes("cta_hype_risk") || f === "non_blocking:excessive_exclamation");

  let score = 100;
  score -= flags.length * 8;
  score -= visualFlags.length * 10;
  if (!hookUnique) score -= 12;
  if (!intentBalanced) score -= 8;
  if (!naturalnessFlag) score -= 6;
  score = Math.max(0, score);

  return {
    Quality_Score: score,
    Quality_Flags: flags,
    AutoFixSuggestions: fix,
    Hook_Class_Uniqueness_Flag: hookUnique,
    Intent_Balance_Flag: intentBalanced,
    Visual_Risk_Flags: visualFlags,
    Naturalness_Flag: naturalnessFlag
  };
}

export function flagIntentDominance(intents: DestinationIntent[]): boolean {
  const counts = intents.reduce<Record<string, number>>((acc, i) => {
    acc[i] = (acc[i] ?? 0) + 1;
    return acc;
  }, {});
  const total = intents.length || 1;
  return Object.values(counts).some((count) => count / total > 0.45);
}
