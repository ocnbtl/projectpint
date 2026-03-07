import { createSign } from "node:crypto";
import { execFileSync } from "node:child_process";
import type { SheetStoreAdapter } from "./types.ts";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

interface AccessTokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: AccessTokenCache | null = null;

function base64Url(input: string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function buildJwtAssertion(): string {
  const serviceEmail = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKeyRaw = requireEnv("GOOGLE_PRIVATE_KEY");
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceEmail,
    scope: GOOGLE_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedClaim = base64Url(JSON.stringify(claim));
  const unsigned = `${encodedHeader}.${encodedClaim}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey, "base64url");
  return `${unsigned}.${signature}`;
}

function curlJson(method: "GET" | "POST" | "PUT", url: string, headers: string[] = [], body?: string): unknown {
  const args: string[] = ["-s", "-X", method, url];
  for (const h of headers) args.push("-H", h);
  if (body !== undefined) args.push("-d", body);
  const out = execFileSync("curl", args, { encoding: "utf8" });
  try {
    const parsed = JSON.parse(out) as { error?: { message?: string; status?: string; code?: number } };
    if (parsed?.error) {
      const code = parsed.error.code ? `code=${parsed.error.code} ` : "";
      const status = parsed.error.status ? `status=${parsed.error.status} ` : "";
      const message = parsed.error.message ?? "Unknown Google API error";
      throw new Error(`Google API error (${code}${status}) for ${url}: ${message}`.trim());
    }
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Google API error")) throw error;
    throw new Error(`curl returned non-JSON response from ${url}: ${out.slice(0, 200)}`);
  }
}

function getAccessToken(): string {
  const now = Date.now();
  if (tokenCache && now < tokenCache.expiresAt - 30_000) return tokenCache.token;

  const assertion = buildJwtAssertion();
  const formBody =
    "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + encodeURIComponent(assertion);

  const json = curlJson("POST", GOOGLE_TOKEN_URL, ["Content-Type: application/x-www-form-urlencoded"], formBody) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!json.access_token) {
    throw new Error(`Failed to fetch Google token: ${json.error ?? "unknown"} ${json.error_description ?? ""}`);
  }

  tokenCache = {
    token: json.access_token,
    expiresAt: now + (json.expires_in ?? 3600) * 1000
  };
  return tokenCache.token;
}

function spreadsheetId(): string {
  return requireEnv("GOOGLE_SHEETS_ID");
}

function valuesGet(tabName: string): string[][] {
  const token = getAccessToken();
  const range = encodeURIComponent(`${tabName}!A:ZZ`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId()}/values/${range}`;
  const json = curlJson("GET", url, [`Authorization: Bearer ${token}`]) as { values?: string[][] };
  return json.values ?? [];
}

function valuesClear(tabName: string): void {
  const token = getAccessToken();
  const range = encodeURIComponent(`${tabName}!A:ZZ`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId()}/values/${range}:clear`;
  curlJson("POST", url, [`Authorization: Bearer ${token}`, "Content-Type: application/json"], "{}");
}

function valuesUpdate(tabName: string, values: string[][]): void {
  const token = getAccessToken();
  const range = encodeURIComponent(`${tabName}!A1`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId()}/values/${range}?valueInputOption=RAW`;
  const body = JSON.stringify({ majorDimension: "ROWS", values });
  curlJson("PUT", url, [`Authorization: Bearer ${token}`, "Content-Type: application/json"], body);
}

function rowsToValues<T>(rows: T[]): string[][] {
  if (rows.length === 0) return [[""]];
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row as Record<string, unknown>)))];
  const body = rows.map((row) => headers.map((h) => String((row as Record<string, unknown>)[h] ?? "")));
  return [headers, ...body];
}

function valuesToRows<T>(values: string[][]): T[] {
  if (values.length <= 1) return [];
  const [headers, ...rows] = values;
  return rows.map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx] ?? "";
    });
    return obj as T;
  });
}

export const googleSheetsAdapter: SheetStoreAdapter = {
  mode: "google",
  loadTab<T>(tabName: string): T[] {
    const values = valuesGet(tabName);
    return valuesToRows<T>(values);
  },
  saveTab<T>(tabName: string, rows: T[]): void {
    valuesClear(tabName);
    const values = rowsToValues(rows);
    valuesUpdate(tabName, values);
  }
};
