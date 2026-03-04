import { googleSheetsAdapter } from "./google-adapter.ts";
import { localSheetsAdapter } from "./local-adapter.ts";
import type { SheetStoreAdapter } from "./types.ts";

export function getSheetsAdapter(): SheetStoreAdapter {
  if (process.env.FORCE_LOCAL_SHEETS === "1") return localSheetsAdapter;
  const mode = (process.env.SHEETS_MODE ?? "local").toLowerCase();
  if (mode === "google") return googleSheetsAdapter;
  return localSheetsAdapter;
}
