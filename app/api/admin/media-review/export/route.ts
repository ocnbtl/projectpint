import { NextResponse } from "next/server";
import { isAdminSessionValid } from "../../../../../lib/admin-auth";
import {
  OwnerReviewNotFoundError,
  OwnerReviewValidationError,
  ownerReviewDecisionExport
} from "../../../../../lib/affiliate-owner-review";
import { PRIVATE_NO_STORE_HEADERS } from "../../../../../lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: PRIVATE_NO_STORE_HEADERS });
  }
  const batchId = new URL(request.url).searchParams.get("batch") ?? "";
  try {
    const exported = await ownerReviewDecisionExport(batchId);
    return new Response(`${JSON.stringify(exported, null, 2)}\n`, {
      status: 200,
      headers: {
        ...PRIVATE_NO_STORE_HEADERS,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exported.batchId}-decisions.json"`,
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    if (error instanceof OwnerReviewNotFoundError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404, headers: PRIVATE_NO_STORE_HEADERS });
    }
    if (error instanceof OwnerReviewValidationError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 409, headers: PRIVATE_NO_STORE_HEADERS });
    }
    console.error("Owner-review export failed", error);
    return NextResponse.json({ ok: false, error: "Unable to export review decisions." }, { status: 500, headers: PRIVATE_NO_STORE_HEADERS });
  }
}
