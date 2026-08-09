import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminSessionValid } from "../../../../lib/admin-auth";
import {
  listOwnerReviewBatches,
  loadOwnerReviewWorkspace,
  OwnerReviewDecisionConflictError,
  OwnerReviewNotFoundError,
  OwnerReviewValidationError,
  saveOwnerReviewDecision
} from "../../../../lib/affiliate-owner-review";
import { isJsonRequest, isSameOriginMutation, PRIVATE_NO_STORE_HEADERS } from "../../../../lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const saveSchema = z.object({
  batchId: z.string().regex(/^[a-z0-9][a-z0-9-]{0,99}$/),
  sceneId: z.string().min(1).max(240),
  decision: z.enum(["pending", "approved", "denied"]),
  note: z.string().max(2000),
  expectedRevision: z.number().int().min(0)
}).strict();

export async function GET(request: Request) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: PRIVATE_NO_STORE_HEADERS });
  }
  try {
    const requested = new URL(request.url).searchParams.get("batch");
    const batches = await listOwnerReviewBatches();
    const selected = batches.find((batch) => batch.batchId === requested) ?? batches[0] ?? null;
    const workspace = selected ? await loadOwnerReviewWorkspace(selected.batchId) : null;
    return NextResponse.json({ ok: true, batches, workspace }, { headers: PRIVATE_NO_STORE_HEADERS });
  } catch (error) {
    console.error("Owner-review workspace load failed", error);
    return NextResponse.json({ ok: false, error: "Unable to load the owner-review workspace." }, { status: 500, headers: PRIVATE_NO_STORE_HEADERS });
  }
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
  if (Number.isFinite(contentLength) && contentLength > 50_000) {
    return NextResponse.json({ ok: false, error: "Request body is too large." }, { status: 413, headers: PRIVATE_NO_STORE_HEADERS });
  }

  try {
    const input = saveSchema.parse(await request.json());
    const decision = await saveOwnerReviewDecision(input);
    return NextResponse.json({ ok: true, decision }, { headers: PRIVATE_NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof OwnerReviewDecisionConflictError) {
      return NextResponse.json(
        { ok: false, error: error.message, conflict: true, current: error.current },
        { status: 409, headers: PRIVATE_NO_STORE_HEADERS }
      );
    }
    if (error instanceof OwnerReviewNotFoundError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404, headers: PRIVATE_NO_STORE_HEADERS });
    }
    if (error instanceof OwnerReviewValidationError || error instanceof z.ZodError) {
      const message = error instanceof z.ZodError ? error.issues[0]?.message ?? "Invalid decision." : error.message;
      return NextResponse.json({ ok: false, error: message }, { status: 422, headers: PRIVATE_NO_STORE_HEADERS });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400, headers: PRIVATE_NO_STORE_HEADERS });
    }
    console.error("Owner-review decision save failed", error);
    return NextResponse.json({ ok: false, error: "Unable to save the review decision." }, { status: 500, headers: PRIVATE_NO_STORE_HEADERS });
  }
}
