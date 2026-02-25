export interface IcpAlignmentScore {
  icp_id: "ICP-1" | "ICP-2" | "ICP-3";
  label: string;
  matched_terms: string[];
  score: number;
}
type IcpId = IcpAlignmentScore["icp_id"];

export interface StyleLintResult {
  target_id: string;
  target_type: "blog" | "micro";
  score: number;
  flags: string[];
  suggestions: string[];
  icp_alignment: IcpAlignmentScore[];
  best_icp: IcpAlignmentScore;
}

const HARD_SELL_TERMS = [
  "buy now",
  "last chance",
  "limited time",
  "must buy",
  "act fast",
  "guaranteed",
  "don't miss out"
];

const BENEFIT_TERMS = [
  "save time",
  "faster",
  "calm",
  "calmer",
  "less clutter",
  "easier",
  "reduce stress",
  "daily routine",
  "more functional"
];

const ICP_TERMS: Record<IcpId, { label: string; terms: string[] }> = {
  "ICP-1": {
    label: "Constraint-First Renter",
    terms: ["renter", "deposit", "no-drill", "reversible", "landlord", "temporary", "damage"]
  },
  "ICP-2": {
    label: "Small-Space Systems Optimizer",
    terms: ["small bathroom", "tiny", "layout", "flow", "counter", "zone", "storage", "clutter"]
  },
  "ICP-3": {
    label: "Style-Forward Budget Decorator",
    terms: ["style", "color", "personality", "visual", "budget", "decor", "cohesive", "texture"]
  }
};

export function lintEditorialStyle(targetId: string, targetType: "blog" | "micro", text: string): StyleLintResult {
  const lower = text.toLowerCase();
  const flags: string[] = [];
  const suggestions: string[] = [];

  const benefitHits = BENEFIT_TERMS.filter((term) => lower.includes(term));
  if (benefitHits.length < 2) {
    flags.push("benefit_framing_weak");
    suggestions.push("Add at least 2 concrete reader benefits (time, stress, clutter, routine). ");
  }

  const hardSellHits = HARD_SELL_TERMS.filter((term) => lower.includes(term));
  if (hardSellHits.length > 0) {
    flags.push(`hard_sell_language:${hardSellHits.join("|")}`);
    suggestions.push("Replace sales-pressure language with practical, optional next-step wording.");
  }

  if (!lower.includes("you")) {
    flags.push("not_reader_addressed");
    suggestions.push("Address the reader directly using second-person language.");
  }

  const icpAlignment: IcpAlignmentScore[] = (Object.keys(ICP_TERMS) as IcpId[]).map((icpId) => {
    const matched = ICP_TERMS[icpId].terms.filter((term) => lower.includes(term));
    const score = Math.min(100, Math.round((matched.length / ICP_TERMS[icpId].terms.length) * 100));
    return {
      icp_id: icpId,
      label: ICP_TERMS[icpId].label,
      matched_terms: matched,
      score
    };
  });

  const bestIcp = [...icpAlignment].sort((a, b) => b.score - a.score)[0];

  let score = 100;
  score -= Math.max(0, 2 - benefitHits.length) * 10;
  score -= hardSellHits.length * 12;
  if (!lower.includes("you")) score -= 8;
  if (bestIcp.score < 25) {
    flags.push("icp_alignment_weak");
    suggestions.push("Use language signals from one primary ICP more explicitly.");
    score -= 12;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    target_id: targetId,
    target_type: targetType,
    score,
    flags,
    suggestions,
    icp_alignment: icpAlignment,
    best_icp: bestIcp
  };
}
