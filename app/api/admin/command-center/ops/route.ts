import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminSessionValid } from "../../../../../lib/admin-auth";
import { runCommandCenterAction } from "../../../../../lib/command-center";
import { parseCommandCenterOperation } from "../../../../../lib/command-center-operations";
import { isJsonRequest, isSameOriginMutation } from "../../../../../lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!isSameOriginMutation(request)) return NextResponse.json({ ok: false, error: "Cross-site request rejected." }, { status: 403 });
  if (!isJsonRequest(request)) return NextResponse.json({ ok: false, error: "JSON request required." }, { status: 415 });

  try {
    const rawBody = await request.text();
    if (rawBody.length > 16_384) {
      return NextResponse.json({ ok: false, error: "Operation request is too large." }, { status: 413 });
    }
    const body = parseCommandCenterOperation(JSON.parse(rawBody));
    const result = await runCommandCenterAction(body.action, body.payload);
    if (result.ok === false) {
      return NextResponse.json({ ok: false, action: body.action, error: result.error ?? "Action failed", result }, { status: 400 });
    }
    return NextResponse.json({ ok: true, action: body.action, result });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, error: "Invalid operation request." }, { status: 400 });
    }
    console.error("Command center operation failed", error);
    return NextResponse.json({ ok: false, error: "Operation failed." }, { status: 500 });
  }
}
