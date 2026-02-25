import fs from "node:fs";
import path from "node:path";

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonFile(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function writeText(filePath: string, value: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value);
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], headers: string[]): string {
  const esc = (v: unknown) => {
    const value = String(v ?? "").replace(/"/g, '""');
    return /[",\n]/.test(value) ? `"${value}"` : value;
  };
  const head = headers.join(",");
  const body = rows.map((row) => headers.map((h) => esc(row[h])).join(",")).join("\n");
  return `${head}\n${body}`;
}

export function todayIso(): string {
  return new Date().toISOString();
}
