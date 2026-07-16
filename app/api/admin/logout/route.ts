import { NextResponse } from "next/server";
import { getAdminSessionCookieName, getClearedAdminSessionCookie } from "../../../../lib/admin-session";
import { isSameOriginMutation } from "../../../../lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ ok: false, error: "Cross-site request rejected." }, { status: 403 });
  const response = NextResponse.redirect(new URL("/admin/login?logged_out=1", request.url), { status: 303 });
  const cleared = getClearedAdminSessionCookie();
  response.cookies.set(getAdminSessionCookieName(), cleared.value, cleared);
  return response;
}
