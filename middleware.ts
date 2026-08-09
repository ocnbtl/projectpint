import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionCookieName, verifyAdminSessionToken } from "./lib/admin-session";

const KNOWN_ADMIN_PATHS = [
  /^\/admin\/?$/,
  /^\/admin\/login\/?$/,
  /^\/admin\/(?:affiliate-links|analytics|customers|emails|media-review|pins|products|users)\/?$/,
  /^\/admin\/(?:blogs|guides|inspiration)(?:\/[^/]+)?\/?$/,
  /^\/admin\/preview\/(?:blogs|guides|inspiration)\/[^/]+\/?$/
];

function isKnownAdminPath(pathname: string) {
  return KNOWN_ADMIN_PATHS.some((pattern) => pattern.test(pathname));
}

function adminNotFoundResponse() {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
  <title>Not found | Diyesu Decor Command Center</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:#f7f3ed;color:#2c2520;font-family:Arial,sans-serif}.shell{min-height:100vh}.sidebar{background:#2c2520;bottom:0;color:#fffdfa;left:0;padding:28px 20px;position:fixed;top:0;width:256px}.brand{color:#fffdfa;font-family:Georgia,serif;font-size:22px;margin:0}.sub{color:#d8cec4;font-size:12px;font-weight:700;letter-spacing:.12em;margin:7px 0 0;text-transform:uppercase}.main{margin-left:256px;min-height:100vh;padding:48px}.card{align-items:flex-start;background:#fffdfa;border:1px solid rgba(44,37,32,.1);border-radius:14px;box-shadow:0 16px 44px rgba(44,37,32,.08);display:flex;gap:28px;justify-content:space-between;max-width:880px;padding:36px}.eyebrow{color:#3f704e;font-size:12px;font-weight:800;letter-spacing:.14em;margin:0 0 12px;text-transform:uppercase}h1{font-family:Georgia,serif;font-size:clamp(32px,5vw,54px);line-height:1.02;margin:0 0 14px;max-width:650px}p{color:#6f6258;line-height:1.6;margin:0;max-width:590px}.button{background:#3f704e;border-radius:8px;color:#fffdfa;display:inline-flex;font-size:14px;font-weight:800;justify-content:center;padding:14px 18px;text-decoration:none;white-space:nowrap}.button:focus-visible{outline:3px solid #d4a87a;outline-offset:3px}@media(max-width:1023px){.sidebar{height:56px;padding:17px 20px;position:static;width:100%}.brand{font-size:17px}.sub{display:none}.main{margin-left:0;min-height:calc(100vh - 56px);padding:24px}.card{display:grid;padding:28px}}@media(max-width:520px){.main{padding:16px}.card{padding:24px 20px}.button{width:100%}}
  </style>
</head>
<body>
  <div class="shell">
    <aside class="sidebar"><p class="brand">Diyesu Decor</p><p class="sub">Command Center</p></aside>
    <main class="main"><section class="card"><div><p class="eyebrow">Not found</p><h1>That admin item is not available.</h1><p>It may have been removed or its identifier may have changed.</p></div><a class="button" href="/admin">Return to dashboard</a></section></main>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 404,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/html; charset=utf-8",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet"
    }
  });
}

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(getAdminSessionCookieName())?.value;
  if (!(await verifyAdminSessionToken(token))) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  if (!isKnownAdminPath(request.nextUrl.pathname)) {
    return adminNotFoundResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
