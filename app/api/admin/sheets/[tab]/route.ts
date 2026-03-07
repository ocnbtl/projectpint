import { NextResponse } from "next/server";
import { isAdminSessionValid } from "../../../../../lib/admin-auth";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ tab: string }> };

export async function GET(_: Request, context: RouteContext) {
  if (!(await isAdminSessionValid())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { tab } = await context.params;
  return NextResponse.json(
    {
      ok: false,
      error: `Legacy sheets API is retired. ${tab} is no longer part of the live command-center workflow.`
    },
    { status: 410 }
  );
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminSessionValid())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { tab } = await context.params;
  await request.text();
  return NextResponse.json(
    {
      ok: false,
      error: `Legacy sheets API is retired. ${tab} can no longer be written through this route.`
    },
    { status: 410 }
  );
}
