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
  summaryCards?: AdminSheetSummaryCard[];
  children?: ReactNode;
}

export interface AdminSheetSummaryCard {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "green" | "gold" | "blue" | "brown";
}

export function AdminSheetWorkspace({
  tab,
  heroTitle,
  heroDescription,
  editorTitle,
  columns,
  initialRows,
  dateColumn,
  summaryCards = [],
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
        {summaryCards.length > 0 ? (
          <div className="admin-sheet-summary-grid" aria-label={`${heroTitle} summary`}>
            {summaryCards.map((card) => (
              <article key={card.label} className={`admin-sheet-summary-card admin-sheet-summary-${card.tone ?? "green"}`}>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
                {card.detail ? <span>{card.detail}</span> : null}
              </article>
            ))}
          </div>
        ) : null}
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
