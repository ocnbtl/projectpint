import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ tab: string }> };

function isAllowed(tab: string): boolean {
  return [
    "Content_Pins",
    "Blog_Posts",
    "URL_Inventory",
    "Assets",
    "Experiments",
    "Metrics_Weekly",
    "Leads",
    "Products",
    "Product_Ideas",
    "Governance"
  ].includes(tab);
}

function pathFor(tab: string): string {
  return path.join(process.cwd(), "data", "sheets", `${tab}.json`);
}

async function authOk(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  return Boolean(process.env.ADMIN_PASSWORD && token && token === process.env.ADMIN_PASSWORD);
}

export async function GET(_: Request, context: RouteContext) {
  if (!(await authOk())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { tab } = await context.params;
  if (!isAllowed(tab)) return NextResponse.json({ ok: false, error: "Invalid tab" }, { status: 400 });

  const p = pathFor(tab);
  const data = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : [];
  return NextResponse.json({ ok: true, rows: data });
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await authOk())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { tab } = await context.params;
  if (!isAllowed(tab)) return NextResponse.json({ ok: false, error: "Invalid tab" }, { status: 400 });

  const body = (await request.json()) as { rows: unknown[] };
  const p = pathFor(tab);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(body.rows ?? [], null, 2));
  return NextResponse.json({ ok: true });
}
