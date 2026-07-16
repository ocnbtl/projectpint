"use client";

import { useId, useState } from "react";

interface OpsButtonProps {
  action: string;
  label: string;
  payload?: Record<string, unknown>;
  variant?: "accent" | "ghost";
  icon?: "plus" | "refresh" | "link" | "play" | "download";
  confirmMessage?: string;
}

const CONFIRM_ACTIONS = new Set([
  "generate_new_pins",
  "generate_overlay_cta",
  "prepare_approved_pins_for_export",
  "generate_email_subjects",
  "generate_blog_titles_keywords",
  "refresh_blog_quality_checks",
  "update_blog_related_pins",
  "generate_guide_titles_keywords",
  "refresh_guide_quality_checks",
  "update_guide_related_pins",
  "publish_approved_blogs",
  "publish_approved_guides",
  "refresh_customers",
  "update_product_stats"
]);

function summarizeResult(result: Record<string, unknown> | undefined): string {
  if (!result) return "Done.";
  const entries = Object.entries(result).filter(([, value]) => value !== undefined && value !== "");
  if (!entries.length) return "Done.";
  return entries
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" | ");
}

function ActionIcon({ name }: { name: NonNullable<OpsButtonProps["icon"]> }) {
  switch (name) {
    case "plus":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "link":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.1.2l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
          <path d="M14 11a5 5 0 0 0-7.1-.2l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" />
        </svg>
      );
    case "play":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m8 5 11 7-11 7V5Z" />
        </svg>
      );
    case "download":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v10" />
          <path d="m7 9 5 5 5-5" />
          <path d="M5 20h14" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 12a9 9 0 0 1-15.5 6.2" />
          <path d="M3 12a9 9 0 0 1 15.5-6.2" />
          <path d="M19 3v5h-5" />
          <path d="M5 21v-5h5" />
        </svg>
      );
  }
}

export function OpsButton({ action, label, payload, variant = "accent", icon, confirmMessage }: OpsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const statusId = useId();

  async function run() {
    const confirmation = confirmMessage ?? (
      CONFIRM_ACTIONS.has(action)
        ? `${label} will update stored command-center data. Continue?`
        : ""
    );
    if (confirmation && !window.confirm(confirmation)) {
      setStatus("Action cancelled. No changes were made.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Running...");
      const response = await fetch("/api/admin/command-center/ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload })
      });
      const body = (await response.json()) as { ok?: boolean; error?: string; result?: Record<string, unknown> };
      if (!response.ok || !body.ok) {
        setStatus(`Failed: ${body.error ?? "unknown error"}`);
        return;
      }
      setStatus(summarizeResult(body.result));
      window.setTimeout(() => window.location.reload(), 900);
    } catch {
      setStatus("Failed: network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-action-block">
      <button
        type="button"
        className={`btn ${variant === "accent" ? "btn-accent" : "btn-ghost"} admin-action-button`}
        onClick={run}
        disabled={loading}
        aria-describedby={status ? statusId : undefined}
      >
        {icon ? <span className="admin-action-icon"><ActionIcon name={icon} /></span> : null}
        {loading ? "Running..." : label}
      </button>
      {status ? (
        <p
          id={statusId}
          className="small admin-inline-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {status}
        </p>
      ) : null}
    </div>
  );
}
