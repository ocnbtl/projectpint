import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAdminSessionValid } from "../../../../lib/admin-auth";
import {
  InspirationConflictError,
  InspirationValidationError,
  loadInspirationEditorModel,
  publishInspirationItem,
  restoreInspirationItem,
  saveInspirationEditorModel,
  unpublishInspirationItem
} from "../../../../lib/inspiration-admin";
import { isJsonRequest, isSameOriginMutation, PRIVATE_NO_STORE_HEADERS } from "../../../../lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InspirationAction = "save" | "publish" | "unpublish" | "restore";

function refreshPublicInspiration(slug?: string) {
  revalidatePath("/inspiration");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/inspiration/${slug}`);
}

export async function GET(request: Request) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: PRIVATE_NO_STORE_HEADERS });
  }
  const sourceId = new URL(request.url).searchParams.get("id") ?? "";
  if (!sourceId) {
    return NextResponse.json({ ok: false, error: "Missing inspiration ID" }, { status: 400, headers: PRIVATE_NO_STORE_HEADERS });
  }
  const model = await loadInspirationEditorModel(sourceId);
  return model
    ? NextResponse.json({ ok: true, model }, { headers: PRIVATE_NO_STORE_HEADERS })
    : NextResponse.json({ ok: false, error: "Inspiration entry not found" }, { status: 404, headers: PRIVATE_NO_STORE_HEADERS });
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

  let savedDraft: Awaited<ReturnType<typeof saveInspirationEditorModel>> | undefined;
  try {
    const body = (await request.json()) as {
      action?: InspirationAction;
      model?: Record<string, unknown>;
      revision?: string;
      id?: string;
    };
    const action = body.action ?? "save";
    let sourceId = String(body.id ?? body.model?.id ?? "");
    let slug = typeof body.model?.slug === "string" ? body.model.slug : undefined;

    if (action === "save" || action === "publish") {
      const saved = await saveInspirationEditorModel(
        { ...(body.model ?? {}), kind: "inspiration", workflowStatus: action === "publish" ? "approved" : body.model?.workflowStatus },
        String(body.revision ?? "")
      );
      savedDraft = saved;
      sourceId = saved.id;
      slug = saved.slug;
      if (action === "publish") await publishInspirationItem(sourceId);
    } else if (action === "unpublish") {
      if (!sourceId) throw new InspirationValidationError("Missing inspiration ID.");
      await unpublishInspirationItem(sourceId);
    } else if (action === "restore") {
      if (!sourceId) throw new InspirationValidationError("Missing inspiration ID.");
      await restoreInspirationItem(sourceId);
    } else {
      throw new InspirationValidationError("Unsupported inspiration action.");
    }

    const model = await loadInspirationEditorModel(sourceId);
    if (!model) throw new Error("Updated inspiration entry could not be loaded.");
    refreshPublicInspiration(slug ?? model.slug);
    return NextResponse.json({ ok: true, model, action }, { headers: PRIVATE_NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof InspirationConflictError) {
      return NextResponse.json({ ok: false, error: error.message, conflict: true }, { status: 409, headers: PRIVATE_NO_STORE_HEADERS });
    }
    if (error instanceof InspirationValidationError || error instanceof ZodError) {
      const message = error instanceof ZodError ? error.issues[0]?.message ?? "Invalid inspiration fields." : error.message;
      return NextResponse.json(savedDraft
        ? { ok: false, partial: true, model: savedDraft, error: `Draft saved, but publication was blocked: ${message}` }
        : { ok: false, error: message }, { status: 422, headers: PRIVATE_NO_STORE_HEADERS });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400, headers: PRIVATE_NO_STORE_HEADERS });
    }
    console.error("Inspiration action failed", error);
    return NextResponse.json(savedDraft
      ? { ok: false, partial: true, model: savedDraft, error: "Draft saved, but publication could not be completed." }
      : { ok: false, error: "Unable to complete the inspiration action." }, { status: 500, headers: PRIVATE_NO_STORE_HEADERS });
  }
}
