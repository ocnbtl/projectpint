interface UTMInput {
  destinationUrl: string;
  contentId: string;
  hookClass: string;
  intent: string;
}

export function buildUtmUrl(input: UTMInput): string {
  const url = new URL(input.destinationUrl, "https://projectpint.example.com");
  url.searchParams.set("utm_source", "pinterest");
  url.searchParams.set("utm_medium", "organic");
  url.searchParams.set("utm_campaign", "week1_growth");
  url.searchParams.set("utm_content", `${input.contentId}_${input.hookClass}_${input.intent}`.toLowerCase());
  return url.pathname + "?" + url.searchParams.toString();
}
