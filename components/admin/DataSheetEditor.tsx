"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { parseKeywordTags } from "../../lib/tags";

interface DataSheetEditorProps {
  tab: "pins" | "blogs" | "guides" | "emails" | "customers" | "products";
  title: string;
  columns: string[];
  initialRows: Record<string, unknown>[];
  dateColumn?: string;
  showSummary?: boolean;
  onStatsChange?: (stats: DataSheetStats) => void;
}

export interface DataSheetStats {
  totalRows: number;
  visibleRows: number;
  columnCount: number;
}

const LONG_FIELD_COLUMNS = new Set([
  "Pin_Caption",
  "Pin_Overlay",
  "Media_Prompt",
  "Blog_Content",
  "Guide_Content",
  "Email_Content",
  "Writer_Brief",
  "Quality_Checks"
]);

const KEYWORD_TOKEN_COLUMNS = new Set(["Blog_Keywords", "Guide_Keywords"]);

const MIN_COLUMN_WIDTH = 140;
const ROW_ACTION_COLUMN_WIDTH = 120;

function defaultColumnWidth(column: string): number {
  if (column === "Writer_Brief") return 500;
  if (column === "Blog_Content" || column === "Guide_Content") return 460;
  if (column === "Email_Content" || column === "Quality_Checks") return 380;
  if (column === "Pin_Caption" || column === "Pin_Overlay" || column === "Media_Prompt") return 320;
  if (column.endsWith("_Date")) return 160;
  if (column.endsWith("_Time")) return 140;
  if (column.endsWith("_ID")) return 140;
  if (column.endsWith("_URL") || column === "CTA_Target" || column === "Product_Link") return 220;
  if (column === "Workflow_Status") return 180;
  if (column === "Content_Area") return 160;
  if (LONG_FIELD_COLUMNS.has(column)) return 320;
  return 200;
}

function sanitizeColumnWidths(columns: string[], value: unknown): Record<string, number> {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    columns.map((column) => {
      const raw = Number(source[column]);
      return [column, Number.isFinite(raw) ? Math.max(MIN_COLUMN_WIDTH, raw) : defaultColumnWidth(column)];
    })
  );
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

function normalizeRowsForColumns(columns: string[], sourceRows: Record<string, unknown>[]): Record<string, string>[] {
  return sourceRows.map((row) =>
    Object.fromEntries(columns.map((column) => [column, String(row[column] ?? "")]))
  );
}

function serializeKeywordTags(tags: string[]): string {
  return tags.join(", ");
}

function formatColumnLabel(column: string): string {
  return column.replace(/_/g, " ");
}

function KeywordTokenField({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const tokens = useMemo(() => parseKeywordTags(value), [value]);

  useEffect(() => {
    setDraft("");
  }, [value]);

  function commit(rawValue: string) {
    const nextTokens = parseKeywordTags(serializeKeywordTags([...tokens, ...parseKeywordTags(rawValue)]));
    setDraft("");
    if (serializeKeywordTags(nextTokens) !== serializeKeywordTags(tokens)) {
      onChange(serializeKeywordTags(nextTokens));
    }
  }

  function removeToken(index: number) {
    const nextTokens = tokens.filter((_, tokenIndex) => tokenIndex !== index);
    onChange(serializeKeywordTags(nextTokens));
  }

  return (
    <div className="admin-token-field">
      <div className="admin-token-list">
        {tokens.map((token, index) => (
          <button
            key={`${token}-${index}`}
            type="button"
            className="admin-token-chip"
            onClick={() => removeToken(index)}
            title={`Remove ${token}`}
          >
            <span>{token}</span>
            <span aria-hidden="true">×</span>
          </button>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (draft.trim()) commit(draft);
          }}
          onKeyDown={(event) => {
            if (event.key === "Tab" || event.key === "Enter" || event.key === ",") {
              if (draft.trim()) {
                event.preventDefault();
                commit(draft);
              }
              return;
            }

            if (event.key === "Backspace" && !draft && tokens.length > 0) {
              event.preventDefault();
              removeToken(tokens.length - 1);
            }
          }}
          placeholder={tokens.length > 0 ? "Add keyword" : "Add keyword and press Tab"}
          type="text"
        />
      </div>
    </div>
  );
}

export function DataSheetEditor({
  tab,
  title,
  columns,
  initialRows,
  dateColumn,
  showSummary = true,
  onStatsChange
}: DataSheetEditorProps) {
  const [rows, setRows] = useState<Record<string, string>[]>(
    normalizeRowsForColumns(columns, initialRows)
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [dirty, setDirty] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => sanitizeColumnWidths(columns, null));
  const [columnWidthsReady, setColumnWidthsReady] = useState(false);
  const rowsRef = useRef(rows);
  const resizeStateRef = useRef<{ column: string; startX: number; startWidth: number } | null>(null);
  const columnStorageKey = `command-center:${tab}:column-widths`;

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(columnStorageKey);
      const parsed = stored ? (JSON.parse(stored) as unknown) : null;
      setColumnWidths(sanitizeColumnWidths(columns, parsed));
    } catch {
      setColumnWidths(sanitizeColumnWidths(columns, null));
    } finally {
      setColumnWidthsReady(true);
    }
  }, [columnStorageKey, columns]);

  useEffect(() => {
    if (!columnWidthsReady || typeof window === "undefined") return;
    window.localStorage.setItem(columnStorageKey, JSON.stringify(columnWidths));
  }, [columnStorageKey, columnWidths, columnWidthsReady]);

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
    const filtered = !normalizedQuery
      ? weekFiltered
      : weekFiltered.filter(({ row }) =>
          columns.some((column) => String(row[column] ?? "").toLowerCase().includes(normalizedQuery))
        );

    if (!sortKey) return filtered;

    return [...filtered].sort((a, b) => {
      const aValue = a.row[sortKey] ?? "";
      const bValue = b.row[sortKey] ?? "";
      const comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [rows, dateColumn, selectedWeek, query, columns, sortDir, sortKey]);

  const tableMinWidth = useMemo(
    () => columns.reduce((total, column) => total + (columnWidths[column] ?? defaultColumnWidth(column)), 0) + ROW_ACTION_COLUMN_WIDTH,
    [columnWidths, columns]
  );

  useEffect(() => {
    onStatsChange?.({
      totalRows: rows.length,
      visibleRows: visibleRows.length,
      columnCount: columns.length
    });
  }, [columns.length, onStatsChange, rows.length, visibleRows.length]);

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

  function toggleSort(column: string) {
    setSortKey((current) => {
      if (current === column) {
        setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
        return current;
      }

      setSortDir("asc");
      return column;
    });
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
      const body = (await response.json()) as { ok?: boolean; error?: string; saved?: number; rows?: Record<string, unknown>[] };
      if (!response.ok || !body.ok) {
        setStatus(`Save failed: ${body.error ?? "unknown error"}`);
        return;
      }
      if (JSON.stringify(rowsRef.current) === snapshotKey) {
        if (Array.isArray(body.rows)) {
          const normalizedRows = normalizeRowsForColumns(columns, body.rows);
          rowsRef.current = normalizedRows;
          setRows(normalizedRows);
        }
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
  }, [columns, tab]);

  const handleResizeMove = useCallback((event: PointerEvent) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState) return;
    const nextWidth = Math.max(MIN_COLUMN_WIDTH, resizeState.startWidth + event.clientX - resizeState.startX);
    setColumnWidths((current) =>
      current[resizeState.column] === nextWidth ? current : { ...current, [resizeState.column]: nextWidth }
    );
  }, []);

  const stopResize = useCallback(() => {
    resizeStateRef.current = null;
    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup", stopResize);
    }
    document.body.classList.remove("admin-column-resizing");
  }, [handleResizeMove]);

  useEffect(() => stopResize, [stopResize]);

  const startResize = useCallback((column: string, event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    resizeStateRef.current = {
      column,
      startX: event.clientX,
      startWidth: columnWidths[column] ?? defaultColumnWidth(column)
    };
    document.body.classList.add("admin-column-resizing");
    window.addEventListener("pointermove", handleResizeMove);
    window.addEventListener("pointerup", stopResize, { once: true });
  }, [columnWidths, handleResizeMove, stopResize]);

  useEffect(() => {
    if (!dirty) return undefined;

    const timer = window.setTimeout(() => {
      void saveRows(rowsRef.current, "auto");
    }, 900);

    return () => window.clearTimeout(timer);
  }, [dirty, rows, saveRows]);

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h1>{title}</h1>
          {showSummary ? (
            <div className="admin-meta-row">
              <span className="admin-meta-pill">{rows.length} total rows</span>
              <span className="admin-meta-pill">{visibleRows.length} visible</span>
              <span className="admin-meta-pill">{columns.length} columns</span>
            </div>
          ) : null}
        </div>
        <div className="admin-actions-inline admin-datasheet-toolbar">
          <label className="admin-inline-label admin-search-label admin-datasheet-control">
            Search rows
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search any column"
            />
          </label>
          {dateColumn ? (
            <label className="admin-inline-label admin-filter-label admin-datasheet-control">
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
          <button type="button" className="btn btn-ghost admin-toolbar-button" onClick={appendRow}>
            Add row
          </button>
          <button
            type="button"
            className="btn btn-accent admin-toolbar-button"
            onClick={() => void saveRows(rowsRef.current, "manual")}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save now"}
          </button>
        </div>
      </div>
      <p className="small admin-table-note">
        Long-form fields stay editable here for manual review and approval. Changes autosave after a short pause. Drag
        a header edge to resize each column.
      </p>
      {status ? <p className="small admin-inline-status">{status}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table" style={{ minWidth: `${tableMinWidth}px` }}>
          <colgroup>
            {columns.map((column) => (
              <col key={column} style={{ width: `${columnWidths[column] ?? defaultColumnWidth(column)}px` }} />
            ))}
            <col style={{ width: `${ROW_ACTION_COLUMN_WIDTH}px` }} />
          </colgroup>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>
                  <div className="admin-table-header-cell">
                    <button
                      type="button"
                      className="admin-sort-button"
                      onClick={() => toggleSort(column)}
                      aria-label={`Sort by ${column}`}
                    >
                      <span>{formatColumnLabel(column)}</span>
                      <span className="admin-sort-indicator" aria-hidden="true">
                        {sortKey === column ? (sortDir === "asc" ? "^" : "v") : ""}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="admin-column-resizer"
                      aria-label={`Resize ${column} column`}
                      title={`Resize ${column} column`}
                      onPointerDown={(event) => startResize(column, event)}
                    />
                  </div>
                </th>
              ))}
              <th className="admin-table-row-heading">
                <div className="admin-table-header-cell admin-table-header-cell-static">
                  <span>Row</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td className="admin-table-empty" colSpan={columns.length + 1}>
                  No rows match the current search or week filter.
                </td>
              </tr>
            ) : (
              visibleRows.map(({ row, index: absoluteIndex }) => (
                <tr key={`${tab}-row-${absoluteIndex}`}>
                  {columns.map((column) => (
                    <td key={`${tab}-${absoluteIndex}-${column}`}>
                      {KEYWORD_TOKEN_COLUMNS.has(column) ? (
                        <KeywordTokenField value={row[column] ?? ""} onChange={(value) => updateCell(absoluteIndex, column, value)} />
                      ) : LONG_FIELD_COLUMNS.has(column) ? (
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
                  <td className="admin-table-row-cell">
                    <button type="button" className="btn btn-ghost" onClick={() => deleteRow(absoluteIndex)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="admin-table-footer">
        <span>
          {visibleRows.length} of {rows.length} rows
        </span>
        <span>{dirty ? "Autosave pending" : "Saved state current"}</span>
      </div>
    </section>
  );
}
