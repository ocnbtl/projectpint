"use client";

import { useState, type ReactNode } from "react";
import { DataSheetEditor, type DataSheetStats } from "./DataSheetEditor";

interface AdminSheetWorkspaceProps {
  tab: "pins" | "blogs" | "guides" | "emails" | "customers" | "products";
  heroTitle: string;
  heroDescription: ReactNode;
  editorTitle: string;
  columns: string[];
  initialRows: Record<string, unknown>[];
  dateColumn?: string;
  children?: ReactNode;
}

export function AdminSheetWorkspace({
  tab,
  heroTitle,
  heroDescription,
  editorTitle,
  columns,
  initialRows,
  dateColumn,
  children
}: AdminSheetWorkspaceProps) {
  const [stats, setStats] = useState<DataSheetStats>({
    totalRows: initialRows.length,
    visibleRows: initialRows.length,
    columnCount: columns.length
  });

  return (
    <>
      <section className="admin-panel admin-sheet-hero">
        <div className="admin-hero-head">
          <div className="admin-hero-copy">
            <h1>{heroTitle}</h1>
            <div className="admin-hero-description">{heroDescription}</div>
          </div>
          <div className="admin-sheet-stat-row" aria-label="Table summary">
            <span>{stats.totalRows} rows</span>
            <span>{stats.visibleRows} visible</span>
            <span>{stats.columnCount} columns</span>
          </div>
        </div>
        {children ? <div className="admin-hero-body">{children}</div> : null}
      </section>

      <DataSheetEditor
        tab={tab}
        title={editorTitle}
        columns={columns}
        initialRows={initialRows}
        dateColumn={dateColumn}
        showSummary={false}
        onStatsChange={setStats}
      />
    </>
  );
}
