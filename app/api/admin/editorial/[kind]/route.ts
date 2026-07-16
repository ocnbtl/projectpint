import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAdminSessionValid } from "../../../../../lib/admin-auth";
import {
  EvergreenConflictError,
  EvergreenValidationError,
  publishEditorialItem,
  restoreEditorialItem,
  unpublishEditorialItem
} from "../../../../../lib/command-center";
import { loadEditorialEditorModel, saveEditorialEditorModel } from "../../../../../lib/editorial-admin";
import type { EditorialTab } from "../../../../../lib/editorial-publication";
import { isJsonRequest, isSameOriginMutation, PRIVATE_NO_STORE_HEADERS } from "../../../../../lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ kind: string }> };
type EditorialAction = "save" | "publish" | "unpublish" | "restore";

function isEditorialKind(value: string): value is EditorialTab {
  return value === "blogs" || value === "guides";
}

function revalidateEditorial(kind: EditorialTab, slug?: string) {
  revalidatePath("/");
  revalidatePath("/start-here");
  revalidatePath("/areas");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/${kind === "blogs" ? "blog" : "guides"}/${slug}`);
}

export async function GET(request: Request, context: RouteContext) {
  if (!(await isAdminSessionValid())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: PRIVATE_NO_STORE_HEADERS });
  const { kind } = await context.params;
  if (!isEditorialKind(kind)) return NextResponse.json({ ok: false, error: "Invalid editorial kind" }, { status: 400, headers: PRIVATE_NO_STORE_HEADERS });
  const sourceId = new URL(request.url).searchParams.get("id") ?? "";
  if (!sourceId) return NextResponse.json({ ok: false, error: "Missing editorial ID" }, { status: 400, headers: PRIVATE_NO_STORE_HEADERS });
  const model = await loadEditorialEditorModel(kind, sourceId);
  return model
    ? NextResponse.json({ ok: true, model }, { headers: PRIVATE_NO_STORE_HEADERS })
    : NextResponse.json({ ok: false, error: "Editorial item not found" }, { status: 404, headers: PRIVATE_NO_STORE_HEADERS });
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminSessionValid())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginMutation(request)) return NextResponse.json({ ok: false, error: "Cross-site request rejected." }, { status: 403 });
  if (!isJsonRequest(request)) return NextResponse.json({ ok: false, error: "JSON request required." }, { status: 415 });
  const { kind } = await context.params;
  if (!isEditorialKind(kind)) return NextResponse.json({ ok: false, error: "Invalid editorial kind" }, { status: 400 });

  let savedDraft: Awaited<ReturnType<typeof saveEditorialEditorModel>> | undefined;
  try {
    const body = (await request.json()) as {
      action?: EditorialAction;
      model?: Record<string, unknown>;
      revision?: string;
      id?: string;
    };
    const action = body.action ?? "save";
    let sourceId = String(body.id ?? body.model?.id ?? "");
    let slug = typeof body.model?.slug === "string" ? body.model.slug : undefined;

    if (action === "save" || action === "publish") {
      const modelInput = { ...(body.model ?? {}), kind, workflowStatus: action === "publish" ? "approved" : body.model?.workflowStatus };
      const saved = await saveEditorialEditorModel(modelInput, String(body.revision ?? ""));
      savedDraft = saved;
      sourceId = saved.id;
      slug = saved.slug;
      if (action === "publish") await publishEditorialItem(kind, sourceId);
    } else if (action === "unpublish") {
      if (!sourceId) throw new EvergreenValidationError("Missing editorial ID.");
      await unpublishEditorialItem(kind, sourceId);
    } else if (action === "restore") {
      if (!sourceId) throw new EvergreenValidationError("Missing editorial ID.");
      await restoreEditorialItem(kind, sourceId);
    } else {
      throw new EvergreenValidationError("Unsupported editorial action.");
    }

    const model = await loadEditorialEditorModel(kind, sourceId);
    if (!model) throw new Error("Updated editorial item could not be loaded.");
    revalidateEditorial(kind, slug ?? model.slug);
    return NextResponse.json({ ok: true, model, action });
  } catch (error) {
    if (error instanceof EvergreenConflictError) {
      return NextResponse.json({ ok: false, error: error.message, conflict: true }, { status: 409 });
    }
    if (error instanceof EvergreenValidationError || error instanceof ZodError) {
      const message = error instanceof ZodError ? error.issues[0]?.message ?? "Invalid editorial fields." : error.message;
      return NextResponse.json(savedDraft
        ? { ok: false, partial: true, model: savedDraft, error: `Draft saved, but publication was blocked: ${message}` }
        : { ok: false, error: message }, { status: 422 });
    }
    if (error instanceof SyntaxError) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    console.error("Editorial action failed", error);
    return NextResponse.json(savedDraft
      ? { ok: false, partial: true, model: savedDraft, error: "Draft saved, but publication could not be completed." }
      : { ok: false, error: "Unable to complete the editorial action." }, { status: 500 });
  }
}
