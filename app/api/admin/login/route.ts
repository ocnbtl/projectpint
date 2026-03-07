import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminSessionCookieName,
  getAdminSessionCookieOptions,
  isAdminAuthConfigured,
  validateAdminPassword
} from "../../../../lib/admin-session";
import { checkRateLimit, getClientAddress } from "../../../../lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const loginRateLimit = checkRateLimit({
    key: `admin-login:${getClientAddress(request.headers)}`,
    limit: 5,
    windowMs: 15 * 60 * 1000
  });

  if (!loginRateLimit.allowed) {
    return NextResponse.redirect(new URL("/admin/login?error=rate_limit", request.url), { status: 303 });
  }

  if (!isAdminAuthConfigured() || !(await validateAdminPassword(password))) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  response.cookies.set(getAdminSessionCookieName(), await createAdminSessionToken(), getAdminSessionCookieOptions());
  return response;
}
