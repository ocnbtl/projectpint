import { NextResponse } from "next/server";
import { isAdminSessionValid } from "../../../../../lib/admin-auth";
import { runCommandCenterAction } from "../../../../../lib/command-center";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { action?: string; payload?: Record<string, unknown> };
  if (!body.action) {
    return NextResponse.json({ ok: false, error: "Missing action" }, { status: 400 });
  }

  const result = runCommandCenterAction(body.action, body.payload);
  if (result.ok === false) {
    return NextResponse.json({ ok: false, action: body.action, error: result.error ?? "Action failed", result }, { status: 400 });
  }
  return NextResponse.json({ ok: true, action: body.action, result });
}
