import { NextResponse } from "next/server";
import { getAdminSessionCookieName, getClearedAdminSessionCookie } from "../../../../lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login?logged_out=1", request.url), { status: 303 });
  const cleared = getClearedAdminSessionCookie();
  response.cookies.set(getAdminSessionCookieName(), cleared.value, cleared);
  return response;
}
