import path from "node:path";
import { readJsonFile, writeJsonFile } from "../io.ts";
import type { SheetStoreAdapter } from "./types.ts";

const base = path.join(process.cwd(), "data", "sheets");

function tabPath(tabName: string): string {
  return path.join(base, `${tabName}.json`);
}

export const localSheetsAdapter: SheetStoreAdapter = {
  mode: "local",
  loadTab<T>(tabName: string): T[] {
    return readJsonFile<T[]>(tabPath(tabName), []);
  },
  saveTab<T>(tabName: string, rows: T[]): void {
    writeJsonFile(tabPath(tabName), rows);
  }
};
