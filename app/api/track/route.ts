import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientAddress } from "../../../lib/rate-limit";

export const runtime = "nodejs";

const ALLOWED_EVENTS = new Set(["outbound_click", "signup", "affiliate_click", "product_cta_click"]);

export async function POST(request: Request) {
  const rate = checkRateLimit({
    key: `track:${getClientAddress(request.headers)}`,
    limit: 300,
    windowMs: 5 * 60 * 1000
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many tracking requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

  let body: {
    event: "outbound_click" | "signup" | "affiliate_click" | "product_cta_click";
    contentId?: string;
    url?: string;
    meta?: Record<string, string | number | boolean>;
  };

  try {
    body = (await request.json()) as {
      event: "outbound_click" | "signup" | "affiliate_click" | "product_cta_click";
      contentId?: string;
      url?: string;
      meta?: Record<string, string | number | boolean>;
    };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!body.event) {
    return NextResponse.json({ ok: false, error: "event is required" }, { status: 400 });
  }
  if (!ALLOWED_EVENTS.has(body.event)) {
    return NextResponse.json({ ok: false, error: "event is invalid" }, { status: 400 });
  }

  const p = path.join(process.cwd(), "data", "generated", "events.ndjson");
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.appendFileSync(p, `${JSON.stringify({ ...body, ts: new Date().toISOString() })}\n`);

  return NextResponse.json({ ok: true });
}
