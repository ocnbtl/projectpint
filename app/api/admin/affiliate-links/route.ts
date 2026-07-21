import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAdminSessionValid } from "../../../../lib/admin-auth";
import {
  AffiliateLinkConflictError,
  readAffiliateLinks,
  saveAffiliateLinks
} from "../../../../lib/affiliate-links";
import { isJsonRequest, isSameOriginMutation, PRIVATE_NO_STORE_HEADERS } from "../../../../lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: PRIVATE_NO_STORE_HEADERS });
  }
  const rows = await readAffiliateLinks();
  return NextResponse.json({ ok: true, rows }, { headers: PRIVATE_NO_STORE_HEADERS });
}

export async function POST(request: Request) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: PRIVATE_NO_STORE_HEADERS });
  }
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ ok: false, error: "Cross-site request rejected." }, { status: 403, headers: PRIVATE_NO_STORE_HEADERS });
  }
  if (!isJsonRequest(request)) {
    return NextResponse.json({ ok: false, error: "JSON request required." }, { status: 415, headers: PRIVATE_NO_STORE_HEADERS });
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 1_000_000) {
    return NextResponse.json({ ok: false, error: "Request body is too large." }, { status: 413, headers: PRIVATE_NO_STORE_HEADERS });
  }

  try {
    const body = (await request.json()) as { rows?: unknown; baseRows?: unknown };
    const rows = await saveAffiliateLinks(body.rows, body.baseRows);
    return NextResponse.json({ ok: true, saved: rows.length, rows }, { headers: PRIVATE_NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof AffiliateLinkConflictError) {
      return NextResponse.json({ ok: false, error: error.message, conflict: true }, { status: 409, headers: PRIVATE_NO_STORE_HEADERS });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message ?? "Invalid affiliate link rows." }, { status: 422, headers: PRIVATE_NO_STORE_HEADERS });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400, headers: PRIVATE_NO_STORE_HEADERS });
    }
    console.error("Affiliate link save failed", error);
    return NextResponse.json({ ok: false, error: "Unable to save affiliate links." }, { status: 500, headers: PRIVATE_NO_STORE_HEADERS });
  }
}
