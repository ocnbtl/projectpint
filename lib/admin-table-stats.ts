export function sumNumberColumn(rows: Record<string, unknown>[], column: string): number {
  return rows.reduce((sum, row) => {
    const raw = row[column];
    const value = typeof raw === "number" ? raw : Number(String(raw ?? "").replace(/[$,]/g, ""));
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);
}

export function countRowsWith(rows: Record<string, unknown>[], column: string): number {
  return rows.filter((row) => String(row[column] ?? "").trim().length > 0).length;
}

export function countRowsMatching(rows: Record<string, unknown>[], column: string, expected: string): number {
  const normalizedExpected = expected.trim().toLowerCase();
  return rows.filter((row) => String(row[column] ?? "").trim().toLowerCase() === normalizedExpected).length;
}

export function uniqueValueCount(rows: Record<string, unknown>[], column: string): number {
  const values = rows
    .map((row) => String(row[column] ?? "").trim())
    .filter(Boolean);
  return new Set(values).size;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}
