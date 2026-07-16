import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminSessionCookieName,
  getAdminSessionCookieOptions,
  isAdminAuthConfigured,
  validateAdminPassword
} from "../../../../lib/admin-session";
import { checkRateLimit, getClientAddress } from "../../../../lib/rate-limit";
import { isSameOriginMutation } from "../../../../lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), { status: 303 });
  }
  const loginRateLimit = checkRateLimit({
    key: `admin-login:${getClientAddress(request.headers)}`,
    limit: 5,
    windowMs: 15 * 60 * 1000
  });

  if (!loginRateLimit.allowed) {
    return NextResponse.redirect(new URL("/admin/login?error=rate_limit", request.url), {
      status: 303,
      headers: { "Retry-After": String(loginRateLimit.retryAfterSeconds) }
    });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 4_096) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!isAdminAuthConfigured()) {
    return NextResponse.redirect(new URL("/admin/login?error=config", request.url), { status: 303 });
  }

  if (!(await validateAdminPassword(password))) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  response.cookies.set(getAdminSessionCookieName(), await createAdminSessionToken(), getAdminSessionCookieOptions());
  return response;
}
