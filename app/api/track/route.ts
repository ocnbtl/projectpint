import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    event: "outbound_click" | "signup" | "affiliate_click" | "product_cta_click";
    contentId?: string;
    url?: string;
    meta?: Record<string, string | number | boolean>;
  };

  if (!body.event) {
    return NextResponse.json({ ok: false, error: "event is required" }, { status: 400 });
  }

  const p = path.join(process.cwd(), "data", "generated", "events.ndjson");
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.appendFileSync(p, `${JSON.stringify({ ...body, ts: new Date().toISOString() })}\n`);

  return NextResponse.json({ ok: true });
}
