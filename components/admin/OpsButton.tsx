"use client";

import { useState } from "react";

interface OpsButtonProps {
  action: string;
  label: string;
  payload?: Record<string, unknown>;
  variant?: "accent" | "ghost";
}

function summarizeResult(result: Record<string, unknown> | undefined): string {
  if (!result) return "Done.";
  const entries = Object.entries(result).filter(([, value]) => value !== undefined && value !== "");
  if (!entries.length) return "Done.";
  return entries
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" | ");
}

export function OpsButton({ action, label, payload, variant = "accent" }: OpsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function run() {
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
      window.location.reload();
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
      >
        {loading ? "Running..." : label}
      </button>
      {status ? <p className="small admin-inline-status">{status}</p> : null}
    </div>
  );
}
