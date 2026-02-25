export interface SheetStoreAdapter {
  mode: "local" | "google";
  loadTab<T>(tabName: string): T[];
  saveTab<T>(tabName: string, rows: T[]): void;
}
