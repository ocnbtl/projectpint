import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAdminSessionValid } from "../../../../../lib/admin-auth";
import {
  EvergreenConflictError,
  EvergreenValidationError,
  loadEvergreenTab,
  saveEvergreenTab
} from "../../../../../lib/command-center";
import { parseCommandCenterRows } from "../../../../../lib/command-center-validation";
import { isJsonRequest, isSameOriginMutation, PRIVATE_NO_STORE_HEADERS } from "../../../../../lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ tab: string }> };

type TabParam = "pins" | "blogs" | "guides" | "emails" | "customers" | "products";

function isAllowedTab(value: string): value is TabParam {
  return ["pins", "blogs", "guides", "emails", "customers", "products"].includes(value);
}

export async function GET(_: Request, context: RouteContext) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: PRIVATE_NO_STORE_HEADERS });
  }

  const { tab } = await context.params;
  if (!isAllowedTab(tab)) {
    return NextResponse.json({ ok: false, error: "Invalid tab" }, { status: 400, headers: PRIVATE_NO_STORE_HEADERS });
  }

  const rows = await loadEvergreenTab(tab);
  return NextResponse.json({ ok: true, rows }, { headers: PRIVATE_NO_STORE_HEADERS });
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!isSameOriginMutation(request)) return NextResponse.json({ ok: false, error: "Cross-site request rejected." }, { status: 403 });
  if (!isJsonRequest(request)) return NextResponse.json({ ok: false, error: "JSON request required." }, { status: 415 });

  const { tab } = await context.params;
  if (!isAllowedTab(tab)) {
    return NextResponse.json({ ok: false, error: "Invalid tab" }, { status: 400 });
  }

  if (tab === "customers") {
    return NextResponse.json({ ok: false, error: "Customer records are read-only in the command center." }, { status: 405 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 5_000_000) {
    return NextResponse.json({ ok: false, error: "Request body is too large." }, { status: 413 });
  }

  try {
    const body = (await request.json()) as { rows?: unknown; baseRows?: unknown };
    const rows = parseCommandCenterRows(tab, body.rows);
    const baseRows = parseCommandCenterRows(tab, body.baseRows);
    const savedRows = await saveEvergreenTab(tab, rows, baseRows);
    return NextResponse.json({ ok: true, saved: savedRows.length, rows: savedRows });
  } catch (error) {
    if (error instanceof EvergreenConflictError) {
      return NextResponse.json({ ok: false, error: error.message, conflict: true }, { status: 409 });
    }
    if (error instanceof EvergreenValidationError || error instanceof ZodError) {
      const message = error instanceof ZodError ? error.issues[0]?.message ?? "Invalid rows." : error.message;
      return NextResponse.json({ ok: false, error: message }, { status: 422 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    }
    console.error("Command center save failed", error);
    return NextResponse.json({ ok: false, error: "Unable to save rows." }, { status: 500 });
  }
}
