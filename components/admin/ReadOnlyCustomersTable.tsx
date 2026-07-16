"use client";

import { useMemo, useState } from "react";

interface ReadOnlyCustomersTableProps {
  initialRows: Record<string, unknown>[];
}

type CustomerRow = {
  User_ID: string;
  User_Email: string;
  User_Date_Email: string;
  User_Time_Email: string;
  Content_Area: string;
  Purchases: string;
};

type SortKey = keyof CustomerRow;

const COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: "User_ID", label: "User ID" },
  { key: "User_Email", label: "Email" },
  { key: "User_Date_Email", label: "Signup" },
  { key: "User_Time_Email", label: "Time" },
  { key: "Content_Area", label: "Area" },
  { key: "Purchases", label: "Purchases" }
];

function normalizeRows(rows: Record<string, unknown>[]): CustomerRow[] {
  return rows.map((row) => ({
    User_ID: String(row.User_ID ?? ""),
    User_Email: String(row.User_Email ?? ""),
    User_Date_Email: String(row.User_Date_Email ?? ""),
    User_Time_Email: String(row.User_Time_Email ?? ""),
    Content_Area: String(row.Content_Area ?? ""),
    Purchases: String(row.Purchases ?? "")
  }));
}

export function ReadOnlyCustomersTable({ initialRows }: ReadOnlyCustomersTableProps) {
  const rows = useMemo(() => normalizeRows(initialRows), [initialRows]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("User_Date_Email");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? rows.filter((row) => Object.values(row).some((value) => value.toLowerCase().includes(normalizedQuery)))
      : rows;

    return [...filtered].sort((left, right) => {
      const comparison = left[sortKey].localeCompare(right[sortKey], undefined, {
        numeric: true,
        sensitivity: "base"
      });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [query, rows, sortDirection, sortKey]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  }

  return (
    <section className="admin-panel admin-datasheet-panel admin-readonly-panel">
      <div className="admin-datasheet-head is-compact">
        <div className="admin-datasheet-toolbar admin-readonly-toolbar" aria-label="User table controls">
          <label className="admin-inline-label admin-search-label admin-datasheet-control">
            <span className="admin-sr-only">Search users</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users..."
            />
          </label>
          <span className="admin-readonly-badge" role="status">Read only</span>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table admin-readonly-table">
          <caption className="admin-sr-only">Read-only customer signup records</caption>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column.key} scope="col">
                  <button
                    type="button"
                    className="admin-sort-button"
                    onClick={() => toggleSort(column.key)}
                    aria-label={`Sort by ${column.label}`}
                    aria-pressed={sortKey === column.key}
                  >
                    <span>{column.label}</span>
                    <span className="admin-sort-indicator" aria-hidden="true">
                      {sortKey === column.key ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td className="admin-table-empty" colSpan={COLUMNS.length}>
                  {rows.length === 0 ? "No customer records are available yet." : "No users match this search."}
                </td>
              </tr>
            ) : (
              visibleRows.map((row, index) => (
                <tr key={row.User_ID || `${row.User_Email}-${index}`}>
                  <td>{row.User_ID || "—"}</td>
                  <td>{row.User_Email || "—"}</td>
                  <td>{row.User_Date_Email || "—"}</td>
                  <td>{row.User_Time_Email || "—"}</td>
                  <td><span className="admin-status-chip">{row.Content_Area || "Not selected"}</span></td>
                  <td className={Number(row.Purchases) > 0 ? "is-green" : undefined}>{row.Purchases || "0"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="admin-table-footer">
        <span>{visibleRows.length} of {rows.length} users</span>
        <span>Signup records cannot be edited or deleted here</span>
      </div>
    </section>
  );
}
