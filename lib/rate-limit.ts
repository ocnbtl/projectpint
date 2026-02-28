interface RateLimitCheckInput {
  key: string;
  limit: number;
  windowMs: number;
}

interface RateLimitCheckResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const requestWindows = new Map<string, number[]>();

export function checkRateLimit({ key, limit, windowMs }: RateLimitCheckInput): RateLimitCheckResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = requestWindows.get(key) ?? [];
  const active = timestamps.filter((ts) => ts > windowStart);

  if (active.length >= limit) {
    const earliestActive = active[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((earliestActive + windowMs - now) / 1000));
    requestWindows.set(key, active);
    return { allowed: false, retryAfterSeconds };
  }

  active.push(now);
  requestWindows.set(key, active);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientAddress(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}
