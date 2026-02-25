export function trackEvent(name: string, payload: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined") return;
  // Data layer-compatible event push for analytics providers.
  const globalObj = window as Window & { dataLayer?: unknown[] };
  globalObj.dataLayer = globalObj.dataLayer ?? [];
  globalObj.dataLayer.push({ event: name, ...payload });
}
