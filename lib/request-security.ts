export const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache"
} as const;

function firstForwardedValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function isLoopbackHostname(hostname: string): boolean {
  return hostname === "localhost"
    || hostname.endsWith(".localhost")
    || hostname === "127.0.0.1"
    || hostname === "[::1]";
}

export function isSameOriginMutation(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase() ?? null;
  if (fetchSite === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) {
    return fetchSite === null || fetchSite === "same-origin" || fetchSite === "none";
  }

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const expectedHost = firstForwardedValue(request.headers.get("x-forwarded-host"))
      ?? firstForwardedValue(request.headers.get("host"))
      ?? requestUrl.host;
    const forwardedProtocol = firstForwardedValue(request.headers.get("x-forwarded-proto"));
    const protocol = forwardedProtocol ? `${forwardedProtocol.replace(/:$/, "")}:` : requestUrl.protocol;
    if (protocol !== "http:" && protocol !== "https:") return false;

    const expectedOrigin = new URL(`${protocol}//${expectedHost}`);
    if (expectedOrigin.protocol !== "https:" && !isLoopbackHostname(expectedOrigin.hostname)) return false;
    return originUrl.origin === expectedOrigin.origin;
  } catch {
    return false;
  }
}

export function isJsonRequest(request: Request): boolean {
  return request.headers.get("content-type")?.toLowerCase().startsWith("application/json") ?? false;
}
