import { NextResponse } from "next/server";
import { isAdminSessionValid } from "../../../../../lib/admin-auth";
import { listApprovedPinsForExport } from "../../../../../lib/command-center";
import { toCsv } from "../../../../../lib/io";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listApprovedPinsForExport();
  const csv = toCsv(rows, [
    "Pin_ID",
    "Title",
    "Media URL",
    "Destination URL",
    "Pin URL",
    "Description",
    "Board",
    "Publish date",
    "Overlay",
    "CTA",
    "Prompt",
    "UTM_URL"
  ]);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="approved-pins.csv"',
      "Cache-Control": "no-store"
    }
  });
}
