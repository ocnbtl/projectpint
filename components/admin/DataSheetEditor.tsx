"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const [dirty, setDirty] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [query, setQuery] = useState("");
  const rowsRef = useRef(rows);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

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
    const weekFiltered =
      !dateColumn || selectedWeek === "all"
        ? indexed
        : indexed.filter(({ row }) => toWeekLabel(row[dateColumn] ?? "") === selectedWeek);

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return weekFiltered;

    return weekFiltered.filter(({ row }) =>
      columns.some((column) => String(row[column] ?? "").toLowerCase().includes(normalizedQuery))
    );
  }, [rows, dateColumn, selectedWeek, query, columns]);

  function updateCell(rowIndex: number, column: string, value: string) {
    setRows((current) => {
      const next = [...current];
      next[rowIndex] = { ...next[rowIndex], [column]: value };
      return next;
    });
    setDirty(true);
    setStatus("Changes pending...");
  }

  function appendRow() {
    const blank = Object.fromEntries(columns.map((column) => [column, ""])) as Record<string, string>;
    setRows((current) => [...current, blank]);
    setDirty(true);
    setStatus("Changes pending...");
  }

  function deleteRow(rowIndex: number) {
    setRows((current) => current.filter((_, index) => index !== rowIndex));
    setDirty(true);
    setStatus("Changes pending...");
  }

  const saveRows = useCallback(async (snapshot = rowsRef.current, mode: "manual" | "auto" = "manual") => {
    const snapshotKey = JSON.stringify(snapshot);
    try {
      setSaving(true);
      setStatus(mode === "auto" ? "Autosaving..." : "Saving...");
      const response = await fetch(`/api/admin/command-center/${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: snapshot })
      });
      const body = (await response.json()) as { ok?: boolean; error?: string; saved?: number };
      if (!response.ok || !body.ok) {
        setStatus(`Save failed: ${body.error ?? "unknown error"}`);
        return;
      }
      if (JSON.stringify(rowsRef.current) === snapshotKey) {
        setDirty(false);
        setStatus(`Saved ${body.saved ?? snapshot.length} rows.`);
      } else {
        setStatus("Saved. More changes pending...");
      }
    } catch {
      setStatus("Save failed: network error.");
    } finally {
      setSaving(false);
    }
  }, [tab]);

  useEffect(() => {
    if (!dirty) return undefined;

    const timer = window.setTimeout(() => {
      void saveRows(rowsRef.current, "auto");
    }, 900);

    return () => window.clearTimeout(timer);
  }, [dirty, rows, saveRows]);

  const isLongField = (column: string) =>
    ["Pin_Caption", "Pin_Overlay", "Media_Prompt", "Blog_Content", "Guide_Content", "Email_Content"].includes(column);

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h1>{title}</h1>
          <div className="admin-meta-row">
            <span className="admin-meta-pill">{rows.length} total rows</span>
            <span className="admin-meta-pill">{visibleRows.length} visible</span>
            <span className="admin-meta-pill">{columns.length} columns</span>
          </div>
        </div>
        <div className="admin-actions-inline">
          <label className="admin-inline-label admin-search-label">
            Search rows
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search any column"
            />
          </label>
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
          <button type="button" className="btn btn-accent" onClick={() => void saveRows(rowsRef.current, "manual")} disabled={saving}>
            {saving ? "Saving..." : "Save now"}
          </button>
        </div>
      </div>
      <p className="small admin-table-note">Long-form fields stay editable here for manual review and approval. Changes autosave after a short pause.</p>
      {status ? <p className="small admin-inline-status">{status}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
              <th>Row</th>
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
                <td>
                  <button type="button" className="btn btn-ghost" onClick={() => deleteRow(absoluteIndex)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
