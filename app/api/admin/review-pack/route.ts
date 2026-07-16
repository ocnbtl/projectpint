import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminSessionValid } from "../../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const html = await readFile(path.join(process.cwd(), "review_pack.html"), "utf8");
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'attachment; filename="project-pint-review-pack.html"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY"
      }
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Review pack is not available." }, { status: 404 });
  }
}
