const AFFILIATE_DOMAINS = ["amazon.com", "amzn.to", "shareasale.com", "impact.com", "awin1.com", "cj.com"];
const AFFILIATE_PARAM_REGEX = /[?&](tag|aff|affiliate|ref|utm_affiliate)=/i;

export function detectAffiliateLinksInText(text: string): boolean {
  const lower = text.toLowerCase();
  if (AFFILIATE_PARAM_REGEX.test(lower)) return true;
  return AFFILIATE_DOMAINS.some((domain) => lower.includes(domain));
}

export function shouldShowAffiliateDisclosure(input: {
  explicitFlag?: boolean;
  containsAffiliateLinks?: boolean;
  markdownOrText?: string;
  linkUrls?: string[];
}): boolean {
  if (input.explicitFlag === true) return true;
  if (input.containsAffiliateLinks === true) return true;
  if (input.markdownOrText && detectAffiliateLinksInText(input.markdownOrText)) return true;
  if ((input.linkUrls ?? []).some((u) => detectAffiliateLinksInText(u))) return true;
  return false;
}
