import { getSheetsAdapter } from "./sheets/index.ts";

const adapter = getSheetsAdapter();

export function storeMode(): string {
  return adapter.mode;
}

export function loadTab<T>(tabName: string): T[] {
  return adapter.loadTab<T>(tabName);
}

export function saveTab<T>(tabName: string, rows: T[]): void {
  adapter.saveTab<T>(tabName, rows);
}
