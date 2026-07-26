import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAdminSessionValid } from "../../../../lib/admin-auth";
import {
  AffiliateCatalogConflictError,
  readAffiliateCatalog,
  saveAffiliateCatalog
} from "../../../../lib/affiliate-catalog";
import { isJsonRequest, isSameOriginMutation, PRIVATE_NO_STORE_HEADERS } from "../../../../lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: PRIVATE_NO_STORE_HEADERS });
  }
  const products = await readAffiliateCatalog();
  return NextResponse.json({ ok: true, products }, { headers: PRIVATE_NO_STORE_HEADERS });
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
  if (Number.isFinite(contentLength) && contentLength > 4_000_000) {
    return NextResponse.json({ ok: false, error: "Request body is too large." }, { status: 413, headers: PRIVATE_NO_STORE_HEADERS });
  }

  try {
    const body = (await request.json()) as { products?: unknown; baseProducts?: unknown };
    const products = await saveAffiliateCatalog(body.products, body.baseProducts);
    return NextResponse.json({ ok: true, saved: products.length, products }, { headers: PRIVATE_NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof AffiliateCatalogConflictError) {
      return NextResponse.json({ ok: false, error: error.message, conflict: true }, { status: 409, headers: PRIVATE_NO_STORE_HEADERS });
    }
    if (error instanceof ZodError) {
      const issue = error.issues[0];
      const location = issue?.path.length ? ` (${issue.path.join(".")})` : "";
      return NextResponse.json(
        { ok: false, error: `${issue?.message ?? "Invalid affiliate catalog."}${location}` },
        { status: 422, headers: PRIVATE_NO_STORE_HEADERS }
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400, headers: PRIVATE_NO_STORE_HEADERS });
    }
    console.error("Affiliate catalog save failed", error);
    return NextResponse.json({ ok: false, error: "Unable to save the affiliate catalog." }, { status: 500, headers: PRIVATE_NO_STORE_HEADERS });
  }
}
