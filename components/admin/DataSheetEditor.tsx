"use client";

import { useMemo, useState } from "react";

interface DataSheetEditorProps {
  tab: "pins" | "blogs" | "guides" | "emails" | "customers" | "products";
  title: string;
  columns: string[];
  initialRows: Record<string, unknown>[];
  dateColumn?: string;
}

function parseUsDate(value: string): Date | null {
  const trimmed = value.trim();
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (!match) return null;
  const [, mm, dd, yyyy] = match;
  const d = new Date(`${yyyy}-${mm}-${dd}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toWeekLabel(value: string): string {
  const d = parseUsDate(value);
  if (!d) return "Unknown week";
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  const yyyy = String(monday.getFullYear());
  return `Week of ${mm}/${dd}/${yyyy}`;
}

export function DataSheetEditor({ tab, title, columns, initialRows, dateColumn }: DataSheetEditorProps) {
  const [rows, setRows] = useState<Record<string, string>[]>(
    initialRows.map((row) =>
      Object.fromEntries(columns.map((column) => [column, String(row[column] ?? "")]))
    )
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("all");

  const weekOptions = useMemo(() => {
    if (!dateColumn) return [];
    const labels = new Set(
      rows
        .map((row) => row[dateColumn] ?? "")
        .filter(Boolean)
        .map((value) => toWeekLabel(value))
    );
    return Array.from(labels).sort((a, b) => (a > b ? -1 : 1));
  }, [rows, dateColumn]);

  const visibleRows = useMemo(() => {
    const indexed = rows.map((row, index) => ({ row, index }));
    if (!dateColumn || selectedWeek === "all") return indexed;
    return indexed.filter(({ row }) => toWeekLabel(row[dateColumn] ?? "") === selectedWeek);
  }, [rows, dateColumn, selectedWeek]);

  function updateCell(rowIndex: number, column: string, value: string) {
    setRows((current) => {
      const next = [...current];
      next[rowIndex] = { ...next[rowIndex], [column]: value };
      return next;
    });
  }

  function appendRow() {
    const blank = Object.fromEntries(columns.map((column) => [column, ""])) as Record<string, string>;
    setRows((current) => [...current, blank]);
  }

  async function saveRows() {
    try {
      setSaving(true);
      setStatus("Saving...");
      const response = await fetch(`/api/admin/command-center/${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows })
      });
      const body = (await response.json()) as { ok?: boolean; error?: string; saved?: number };
      if (!response.ok || !body.ok) {
        setStatus(`Save failed: ${body.error ?? "unknown error"}`);
        return;
      }
      setStatus(`Saved ${body.saved ?? rows.length} rows.`);
    } catch {
      setStatus("Save failed: network error.");
    } finally {
      setSaving(false);
    }
  }

  const isLongField = (column: string) =>
    ["Pin_Caption", "Pin_Overlay", "Media_Prompt", "Blog_Content", "Guide_Content", "Email_Content"].includes(column);

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h1>{title}</h1>
        <div className="admin-actions-inline">
          {dateColumn ? (
            <label className="admin-inline-label">
              Week filter
              <select value={selectedWeek} onChange={(event) => setSelectedWeek(event.target.value)}>
                <option value="all">All weeks</option>
                {weekOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button type="button" className="btn btn-ghost" onClick={appendRow}>
            Add row
          </button>
          <button type="button" className="btn btn-accent" onClick={saveRows} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
      {status ? <p className="small">{status}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(({ row, index: absoluteIndex }) => (
              <tr key={`${tab}-row-${absoluteIndex}`}>
                {columns.map((column) => (
                  <td key={`${tab}-${absoluteIndex}-${column}`}>
                    {isLongField(column) ? (
                      <textarea
                        value={row[column] ?? ""}
                        onChange={(event) => updateCell(absoluteIndex, column, event.target.value)}
                        rows={4}
                      />
                    ) : (
                      <input
                        value={row[column] ?? ""}
                        onChange={(event) => updateCell(absoluteIndex, column, event.target.value)}
                        type="text"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
