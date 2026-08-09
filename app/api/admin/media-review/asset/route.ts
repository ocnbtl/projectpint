import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAdminSessionValid } from "../../../../../lib/admin-auth";
import {
  OwnerReviewNotFoundError,
  OwnerReviewValidationError,
  resolveOwnerReviewAsset,
  verifyOwnerReviewAsset
} from "../../../../../lib/affiliate-owner-review";
import { PRIVATE_NO_STORE_HEADERS } from "../../../../../lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: PRIVATE_NO_STORE_HEADERS });
  }
  const url = new URL(request.url);
  const batchId = url.searchParams.get("batch") ?? "";
  const sceneId = url.searchParams.get("scene") ?? "";
  if (!batchId || !sceneId) {
    return NextResponse.json({ ok: false, error: "Batch and scene are required." }, { status: 400, headers: PRIVATE_NO_STORE_HEADERS });
  }

  try {
    const asset = await resolveOwnerReviewAsset(batchId, sceneId);
    const buffer = await verifyOwnerReviewAsset(asset);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        ...PRIVATE_NO_STORE_HEADERS,
        "Content-Type": asset.contentType,
        "Content-Length": String(buffer.byteLength),
        "Content-Disposition": `inline; filename="${asset.filename}"`,
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    if (error instanceof OwnerReviewNotFoundError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404, headers: PRIVATE_NO_STORE_HEADERS });
    }
    if (error instanceof OwnerReviewValidationError || error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: "Review image failed its private-evidence validation." }, { status: 409, headers: PRIVATE_NO_STORE_HEADERS });
    }
    console.error("Owner-review image load failed", error);
    return NextResponse.json({ ok: false, error: "Unable to load the review image." }, { status: 500, headers: PRIVATE_NO_STORE_HEADERS });
  }
}
