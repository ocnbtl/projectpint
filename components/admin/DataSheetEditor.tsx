"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { COMMAND_CENTER_CONTENT_AREAS } from "../../lib/constants";
import { parseKeywordTags } from "../../lib/tags";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

interface DataSheetEditorProps {
  tab: "pins" | "blogs" | "guides" | "emails" | "customers" | "products";
  title: string;
  columns: string[];
  initialRows: Record<string, unknown>[];
  dateColumn?: string;
  showSummary?: boolean;
  showTitle?: boolean;
  readOnly?: boolean;
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
const ROW_SELECT_COLUMN_WIDTH = 54;

const DISPLAY_COLUMN_LABELS: Record<string, string> = {
  Blog_Publish_Date: "Date",
  Blog_Publish_Time: "Time",
  Content_Area: "Area",
  Workflow_Status: "Status",
  Blog_Title: "Title",
  Blog_URL: "URL",
  Blog_Keywords: "Keywords",
  Quality_Score: "QC",
  Related_Pins: "Pins",
  Published_To_Public_At: "Published",
  Guide_Publish_Date: "Date",
  Guide_Publish_Time: "Time",
  Guide_Title: "Title",
  Guide_URL: "URL",
  Guide_Keywords: "Keywords",
  Pin_ID: "Pin ID",
  Pin_Publish_Date: "Date",
  Pin_Publish_Time: "Time",
  Media_Prompt: "Media Prompt",
  Pin_Overlay: "Overlay",
  Pin_Caption: "Caption",
  Pin_CTA: "CTA",
  Prepared_For_Export_At: "Prepared",
  Email_ID: "Email ID",
  Email_Publish_Date: "Date",
  Email_Publish_Time: "Time",
  Email_Subject: "Subject",
  Email_Content: "Content",
  User_ID: "User ID",
  User_Email: "Email",
  User_Date_Email: "Signup",
  User_Time_Email: "Time",
  Product_ID: "Product ID",
  Product_Date: "Date",
  Product_Sales: "Sales",
  Product_Revenue: "Revenue",
  Product_Link: "Link",
};

function defaultColumnWidth(column: string): number {
  if (column === "Quality_Score") return 72;
  if (column === "Related_Pins") return 72;
  if (column === "Published_To_Public_At" || column === "Prepared_For_Export_At") return 128;
  if (column === "Content_Area") return 118;
  if (column === "Workflow_Status") return 132;
  if (column === "Blog_Publish_Date" || column === "Guide_Publish_Date" || column === "Pin_Publish_Date" || column === "Email_Publish_Date" || column === "Product_Date" || column === "User_Date_Email") return 124;
  if (column === "Blog_Title" || column === "Guide_Title") return 210;
  if (column === "Blog_URL" || column === "Guide_URL") return 180;
  if (column === "Blog_Keywords" || column === "Guide_Keywords") return 160;
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

function formatColumnLabel(column: string, tab?: DataSheetEditorProps["tab"]): string {
  if (column === "Blog_ID") return tab === "blogs" ? "Blog ID" : "Blog";
  if (column === "Guide_ID") return tab === "guides" ? "Guide ID" : "Guide";
  return DISPLAY_COLUMN_LABELS[column] ?? column.replace(/_/g, " ");
}

function isFocusedEditorialBody(tab: DataSheetEditorProps["tab"], column: string): boolean {
  return (tab === "blogs" && column === "Blog_Content") || (tab === "guides" && column === "Guide_Content");
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
  showTitle = true,
  readOnly = false,
  onStatsChange
}: DataSheetEditorProps) {
  const [rows, setRows] = useState<Record<string, string>[]>(
    normalizeRowsForColumns(columns, initialRows)
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [dirty, setDirty] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(() => new Set());
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => sanitizeColumnWidths(columns, null));
  const [columnWidthsReady, setColumnWidthsReady] = useState(false);
  const rowsRef = useRef(rows);
  const baseRowsRef = useRef(normalizeRowsForColumns(columns, initialRows));
  const resizeStateRef = useRef<{ column: string; startX: number; startWidth: number } | null>(null);
  const columnStorageKey = `command-center:${tab}:column-widths`;

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useUnsavedChangesGuard(dirty || saving);

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

  const visibleRowIndexes = useMemo(() => visibleRows.map(({ index }) => index), [visibleRows]);
  const allVisibleRowsSelected = !readOnly && visibleRowIndexes.length > 0 && visibleRowIndexes.every((index) => selectedRows.has(index));
  const someVisibleRowsSelected = !readOnly && visibleRowIndexes.some((index) => selectedRows.has(index));

  const tableMinWidth = useMemo(
    () => columns.reduce((total, column) => total + (columnWidths[column] ?? defaultColumnWidth(column)), 0) + ROW_ACTION_COLUMN_WIDTH + (readOnly ? 0 : ROW_SELECT_COLUMN_WIDTH),
    [columnWidths, columns, readOnly]
  );

  useEffect(() => {
    onStatsChange?.({
      totalRows: rows.length,
      visibleRows: visibleRows.length,
      columnCount: columns.length
    });
  }, [columns.length, onStatsChange, rows.length, visibleRows.length]);

  function updateCell(rowIndex: number, column: string, value: string) {
    if (readOnly) return;
    setRows((current) => {
      const next = [...current];
      next[rowIndex] = { ...next[rowIndex], [column]: value };
      return next;
    });
    setDirty(true);
    setConflict(false);
    setStatus("Changes pending...");
  }

  function appendRow() {
    if (readOnly) return;
    const blank = Object.fromEntries(columns.map((column) => [column, ""])) as Record<string, string>;
    setRows((current) => [...current, blank]);
    setDirty(true);
    setConflict(false);
    setStatus("Changes pending...");
  }

  function deleteRow(rowIndex: number) {
    if (readOnly) return;
    const targetRow = rowsRef.current[rowIndex] ?? {};
    const label = tab === "blogs"
      ? targetRow.Blog_Title
      : tab === "guides"
        ? targetRow.Guide_Title
        : String(Object.values(targetRow)[0] ?? "");
    if (!window.confirm(`Delete ${label || `row ${rowIndex + 1}`}? This takes effect after the table is saved.`)) return;
    setRows((current) => current.filter((_, index) => index !== rowIndex));
    setSelectedRows((current) => new Set(
      Array.from(current)
        .filter((index) => index !== rowIndex)
        .map((index) => (index > rowIndex ? index - 1 : index))
    ));
    setDirty(true);
    setConflict(false);
    setStatus("Changes pending...");
  }

  function toggleRowSelection(rowIndex: number) {
    if (readOnly) return;
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(rowIndex)) next.delete(rowIndex);
      else next.add(rowIndex);
      return next;
    });
  }

  function toggleVisibleSelection() {
    if (readOnly || visibleRowIndexes.length === 0) return;
    setSelectedRows((current) => {
      const next = new Set(current);
      if (allVisibleRowsSelected) visibleRowIndexes.forEach((index) => next.delete(index));
      else visibleRowIndexes.forEach((index) => next.add(index));
      return next;
    });
  }

  function deleteSelectedRows() {
    if (readOnly || selectedRows.size === 0) return;
    const count = selectedRows.size;
    if (!window.confirm(`Delete ${count} selected ${count === 1 ? "row" : "rows"}? This takes effect after the table is saved.`)) return;
    setRows((current) => current.filter((_, index) => !selectedRows.has(index)));
    setSelectedRows(new Set());
    setDirty(true);
    setConflict(false);
    setStatus(`${count} ${count === 1 ? "row" : "rows"} removed. Changes pending...`);
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
    if (readOnly) return;
    const snapshotKey = JSON.stringify(snapshot);
    try {
      setSaving(true);
      setStatus(mode === "auto" ? "Autosaving..." : "Saving...");
      const response = await fetch(`/api/admin/command-center/${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: snapshot, baseRows: baseRowsRef.current })
      });
      const body = (await response.json()) as { ok?: boolean; error?: string; saved?: number; rows?: Record<string, unknown>[]; conflict?: boolean };
      if (!response.ok || !body.ok) {
        setConflict(response.status === 409 || body.conflict === true);
        setStatus(`Save failed: ${body.error ?? "unknown error"}`);
        return;
      }
      if (JSON.stringify(rowsRef.current) === snapshotKey) {
        if (Array.isArray(body.rows)) {
          const normalizedRows = normalizeRowsForColumns(columns, body.rows);
          baseRowsRef.current = normalizedRows;
          rowsRef.current = normalizedRows;
          setRows(normalizedRows);
          setSelectedRows(new Set());
        }
        setDirty(false);
        setConflict(false);
        setStatus(`Saved ${body.saved ?? snapshot.length} rows.`);
      } else {
        setStatus("Saved. More changes pending...");
      }
    } catch {
      setStatus("Save failed: network error.");
    } finally {
      setSaving(false);
    }
  }, [columns, readOnly, tab]);

  const reloadCurrentRows = useCallback(async () => {
    try {
      setStatus("Reloading current rows...");
      const response = await fetch(`/api/admin/command-center/${tab}`, { cache: "no-store" });
      const body = (await response.json()) as { ok?: boolean; error?: string; rows?: Record<string, unknown>[] };
      if (!response.ok || !body.ok || !Array.isArray(body.rows)) {
        setStatus(`Reload failed: ${body.error ?? "unknown error"}`);
        return;
      }
      const normalizedRows = normalizeRowsForColumns(columns, body.rows);
      baseRowsRef.current = normalizedRows;
      rowsRef.current = normalizedRows;
      setRows(normalizedRows);
      setSelectedRows(new Set());
      setDirty(false);
      setConflict(false);
      setStatus("Current rows reloaded.");
    } catch {
      setStatus("Reload failed: network error.");
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
    if (!dirty || readOnly || conflict) return undefined;

    const timer = window.setTimeout(() => {
      void saveRows(rowsRef.current, "auto");
    }, 900);

    return () => window.clearTimeout(timer);
  }, [conflict, dirty, readOnly, rows, saveRows]);

  return (
    <section className="admin-panel admin-datasheet-panel">
      <div className={`admin-panel-header admin-datasheet-head${showTitle ? "" : " is-compact"}`}>
        {showTitle ? (
          <div className="admin-datasheet-title">
            <h2>{title}</h2>
            {showSummary ? (
              <div className="admin-meta-row">
                <span className="admin-meta-pill">{rows.length} total rows</span>
                <span className="admin-meta-pill">{visibleRows.length} visible</span>
                <span className="admin-meta-pill">{columns.length} columns</span>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="admin-actions-inline admin-datasheet-toolbar" aria-label={`${title} controls`}>
          <label className="admin-inline-label admin-search-label admin-datasheet-control">
            <span className="admin-sr-only">Search rows</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
            />
          </label>
          {dateColumn && weekOptions.length > 0 ? (
            <label className="admin-inline-label admin-filter-label admin-datasheet-control">
              <span>Week filter</span>
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
          {readOnly ? (
            <span className="admin-save-pill">Read-only customer data</span>
          ) : (
            <>
              <button type="button" className="btn btn-ghost admin-toolbar-button" onClick={appendRow}>
                <span className="admin-action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </span>
                Add row
              </button>
              {selectedRows.size > 0 ? (
                <button
                  type="button"
                  className="btn btn-ghost admin-toolbar-button admin-bulk-delete-button"
                  onClick={deleteSelectedRows}
                >
                  <span className="admin-action-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M6 6l1 14h10l1-14" />
                    </svg>
                  </span>
                  Delete {selectedRows.size}
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-accent admin-toolbar-button"
                onClick={() => void saveRows(rowsRef.current, "manual")}
                disabled={saving}
              >
                <span className="admin-action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12.5 10 17l9-10" />
                  </svg>
                </span>
                {saving ? "Saving..." : "Save now"}
              </button>
            </>
          )}
        </div>
      </div>
      {showTitle ? (
        <div className="admin-table-status-row">
          <p className="small admin-table-note">
            {readOnly
              ? "Customer records are visible for audience review but cannot be edited or deleted from this workspace."
              : "Long-form fields stay editable here for manual review and approval. Changes autosave after a short pause. Drag a header edge to resize each column."}
          </p>
          <span className={`admin-save-pill${dirty ? " is-dirty" : ""}`}>
            {dirty ? "Autosave pending" : "Saved state current"}
          </span>
        </div>
      ) : dirty ? (
        <div className="admin-table-status-row admin-table-status-row-compact">
          <span className="admin-save-pill is-dirty">Autosave pending</span>
        </div>
      ) : null}
      {status ? (
        <div className="admin-inline-status-row" aria-live="polite">
          <p className="small admin-inline-status">{status}</p>
          {conflict ? (
            <button type="button" className="btn btn-ghost admin-toolbar-button" onClick={() => void reloadCurrentRows()}>
              Reload current rows
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="admin-table-wrap">
        <table className="admin-table" style={{ minWidth: `${tableMinWidth}px` }}>
          <colgroup>
            {!readOnly ? <col style={{ width: `${ROW_SELECT_COLUMN_WIDTH}px` }} /> : null}
            {columns.map((column) => (
              <col key={column} style={{ width: `${columnWidths[column] ?? defaultColumnWidth(column)}px` }} />
            ))}
            <col style={{ width: `${ROW_ACTION_COLUMN_WIDTH}px` }} />
          </colgroup>
          <thead>
            <tr>
              {!readOnly ? (
                <th className="admin-table-select-heading">
                  <label className="admin-row-checkbox admin-row-checkbox-header">
                    <input
                      type="checkbox"
                      checked={allVisibleRowsSelected}
                      ref={(node) => {
                        if (node) node.indeterminate = someVisibleRowsSelected && !allVisibleRowsSelected;
                      }}
                      onChange={toggleVisibleSelection}
                      aria-label={allVisibleRowsSelected ? "Clear selection for visible rows" : "Select all visible rows"}
                    />
                    <span aria-hidden="true" />
                  </label>
                </th>
              ) : null}
              {columns.map((column) => (
                <th key={column}>
                  <div className="admin-table-header-cell">
                    <button
                      type="button"
                      className="admin-sort-button"
                      onClick={() => toggleSort(column)}
                      aria-label={`Sort by ${column}`}
                    >
                      <span>{formatColumnLabel(column, tab)}</span>
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
                <div className="admin-table-header-cell admin-table-header-cell-static admin-row-action-heading">
                  <span className="admin-sr-only">Row actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td className="admin-table-empty" colSpan={columns.length + 1 + (readOnly ? 0 : 1)}>
                  No rows match the current search or week filter.
                </td>
              </tr>
            ) : (
              visibleRows.map(({ row, index: absoluteIndex }) => (
                <tr key={`${tab}-row-${absoluteIndex}`} className={selectedRows.has(absoluteIndex) ? "is-selected" : undefined}>
                  {!readOnly ? (
                    <td className="admin-table-select-cell">
                      <label className="admin-row-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(absoluteIndex)}
                          onChange={() => toggleRowSelection(absoluteIndex)}
                          aria-label={`Select row ${absoluteIndex + 1}`}
                        />
                        <span aria-hidden="true" />
                      </label>
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td key={`${tab}-${absoluteIndex}-${column}`}>
                      {column === "Workflow_Status" ? (
                        <select
                          value={row[column] ?? "draft"}
                          onChange={(event) => updateCell(absoluteIndex, column, event.target.value)}
                          aria-label={`${formatColumnLabel(column, tab)} for row ${absoluteIndex + 1}`}
                          disabled={readOnly}
                        >
                          <option value="draft">Draft</option>
                          <option value="approved">Approved</option>
                          {tab === "pins" ? <option value="queued">Queued</option> : null}
                          {tab === "pins" ? <option value="published">Published</option> : null}
                          {(tab === "blogs" || tab === "guides") && row[column] === "published" ? (
                            <option value="published" disabled>Published — use focused editor</option>
                          ) : null}
                          {tab === "pins" ? <option value="posted">Posted</option> : null}
                        </select>
                      ) : column === "Content_Area" ? (
                        <select
                          value={row[column] ?? ""}
                          onChange={(event) => updateCell(absoluteIndex, column, event.target.value)}
                          aria-label={`${formatColumnLabel(column, tab)} for row ${absoluteIndex + 1}`}
                          disabled={readOnly}
                        >
                          <option value="">Choose area</option>
                          {COMMAND_CENTER_CONTENT_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
                        </select>
                      ) : isFocusedEditorialBody(tab, column) ? (
                        <div className="admin-editorial-cell-locked">
                          <strong>Managed in the focused editor</strong>
                          <span>Use the row action to edit body copy and protected metadata.</span>
                        </div>
                      ) : KEYWORD_TOKEN_COLUMNS.has(column) && !readOnly ? (
                        <KeywordTokenField value={row[column] ?? ""} onChange={(value) => updateCell(absoluteIndex, column, value)} />
                      ) : LONG_FIELD_COLUMNS.has(column) ? (
                        <textarea
                          value={row[column] ?? ""}
                          onChange={(event) => updateCell(absoluteIndex, column, event.target.value)}
                          aria-label={`${formatColumnLabel(column, tab)} for row ${absoluteIndex + 1}`}
                          rows={4}
                          readOnly={readOnly}
                        />
                      ) : (
                        <input
                          value={row[column] ?? ""}
                          onChange={(event) => updateCell(absoluteIndex, column, event.target.value)}
                          aria-label={`${formatColumnLabel(column, tab)} for row ${absoluteIndex + 1}`}
                          type={column.endsWith("_URL") || column === "CTA_Target" || column === "Product_Link" ? "url" : column.endsWith("_Time") ? "time" : "text"}
                          inputMode={column.endsWith("_Sales") || column.endsWith("_Revenue") || column === "Purchases" ? "decimal" : undefined}
                          readOnly={readOnly}
                        />
                      )}
                    </td>
                  ))}
                  <td className="admin-table-row-cell">
                    <div className="admin-row-actions">
                      {(tab === "blogs" || tab === "guides") && row[tab === "blogs" ? "Blog_ID" : "Guide_ID"] ? (
                        <Link
                          className="admin-row-icon-button"
                          href={`/admin/${tab}/${encodeURIComponent(row[tab === "blogs" ? "Blog_ID" : "Guide_ID"] ?? "")}`}
                          aria-label={`Open ${tab === "blogs" ? "blog" : "guide"} editor for row ${absoluteIndex + 1}`}
                          title="Open focused editor"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 20h4l11-11-4-4L4 16v4Z" />
                            <path d="m13.5 6.5 4 4" />
                          </svg>
                        </Link>
                      ) : null}
                      {!readOnly ? (
                        <button
                          type="button"
                          className="admin-row-icon-button"
                          onClick={() => deleteRow(absoluteIndex)}
                          aria-label={`Delete row ${absoluteIndex + 1}`}
                          title="Delete row"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M6 6l1 14h10l1-14" />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="admin-table-footer">
        <span>
          {visibleRows.length} of {rows.length} rows{selectedRows.size > 0 ? ` · ${selectedRows.size} selected` : ""}
        </span>
        <span>{sortKey ? `Sorted by ${formatColumnLabel(sortKey, tab)}` : "No sort applied"}</span>
      </div>
    </section>
  );
}
