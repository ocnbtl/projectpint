import { NextResponse } from "next/server";
import { isAdminSessionValid } from "../../../../../lib/admin-auth";
import { loadEvergreenTab, saveEvergreenTab } from "../../../../../lib/command-center";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ tab: string }> };

type TabParam = "pins" | "blogs" | "guides" | "emails" | "customers" | "products";

function isAllowedTab(value: string): value is TabParam {
  return ["pins", "blogs", "guides", "emails", "customers", "products"].includes(value);
}

export async function GET(_: Request, context: RouteContext) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { tab } = await context.params;
  if (!isAllowedTab(tab)) {
    return NextResponse.json({ ok: false, error: "Invalid tab" }, { status: 400 });
  }

  const rows = await loadEvergreenTab(tab);
  return NextResponse.json({ ok: true, rows });
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { tab } = await context.params;
  if (!isAllowedTab(tab)) {
    return NextResponse.json({ ok: false, error: "Invalid tab" }, { status: 400 });
  }

  const body = (await request.json()) as { rows?: Record<string, unknown>[] };
  const rows = Array.isArray(body.rows) ? body.rows : [];
  await saveEvergreenTab(tab, rows);
  return NextResponse.json({ ok: true, saved: rows.length });
}
