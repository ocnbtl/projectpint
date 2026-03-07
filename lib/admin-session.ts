const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_VERSION = "v1";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

function getAdminSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() || getAdminPassword();
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function safeTextEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

async function signSessionPayload(payload: string): Promise<string> {
  const secret = getAdminSessionSecret();
  if (!secret) return "";

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(new Uint8Array(signature));
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(getAdminPassword());
}

export function getAdminSessionCookieName(): string {
  return ADMIN_SESSION_COOKIE;
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS
  };
}

export function getClearedAdminSessionCookie() {
  return {
    ...getAdminSessionCookieOptions(),
    value: "",
    maxAge: 0
  };
}

export async function validateAdminPassword(password: string): Promise<boolean> {
  const expected = getAdminPassword();
  return Boolean(expected && password && safeTextEqual(password, expected));
}

export async function createAdminSessionToken(now = Date.now()): Promise<string> {
  const expiresAt = now + ADMIN_SESSION_TTL_SECONDS * 1000;
  const payload = [ADMIN_SESSION_VERSION, String(expiresAt), crypto.randomUUID()].join(".");
  const signature = await signSessionPayload(payload);
  if (!signature) {
    throw new Error("Admin session secret is not configured.");
  }
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 4) return false;

  const [version, expiresAtRaw, nonce, providedSignature] = parts;
  if (version !== ADMIN_SESSION_VERSION || !nonce || !/^\d+$/.test(expiresAtRaw)) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) {
    return false;
  }

  const payload = [version, expiresAtRaw, nonce].join(".");
  const expectedSignature = await signSessionPayload(payload);
  return Boolean(expectedSignature && safeTextEqual(providedSignature, expectedSignature));
}
