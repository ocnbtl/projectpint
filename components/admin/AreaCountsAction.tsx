"use client";

import { useState } from "react";
import { COMMAND_CENTER_CONTENT_AREAS } from "../../lib/constants";

interface AreaCountsActionProps {
  action: string;
  label: string;
  mode?: "counts" | "checkbox";
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

export function AreaCountsAction({ action, label, mode = "counts" }: AreaCountsActionProps) {
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(COMMAND_CENTER_CONTENT_AREAS.map((area) => [area, 0]))
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  function setCount(area: string, value: string) {
    const parsed = Number(value);
    setCounts((current) => ({ ...current, [area]: Number.isFinite(parsed) && parsed >= 0 ? parsed : 0 }));
  }

  function setChecked(area: string, checked: boolean) {
    setCounts((current) => ({ ...current, [area]: checked ? 1 : 0 }));
  }

  async function submit() {
    try {
      setLoading(true);
      setStatus("Running...");
      const response = await fetch("/api/admin/command-center/ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload: { areaCounts: counts } })
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
    <div className="admin-area-action">
      <div className="admin-area-action-head">
        <h3>{label}</h3>
        <p className="small">
          {mode === "checkbox"
            ? "Select the areas you want included in the next draft batch."
            : "Set the number of rows you want generated for each area."}
        </p>
      </div>
      <div className="admin-area-grid">
        {COMMAND_CENTER_CONTENT_AREAS.map((area) => (
          <label key={area} className="admin-inline-label admin-area-card">
            <span>{area}</span>
            {mode === "checkbox" ? (
              <input
                type="checkbox"
                checked={(counts[area] ?? 0) > 0}
                onChange={(event) => setChecked(area, event.target.checked)}
              />
            ) : (
              <input
                type="number"
                min={0}
                step={1}
                value={counts[area] ?? 0}
                onChange={(event) => setCount(area, event.target.value)}
              />
            )}
          </label>
        ))}
      </div>
      <button type="button" className="btn btn-accent" onClick={submit} disabled={loading}>
        {loading ? "Running..." : label}
      </button>
      {status ? <p className="small admin-inline-status">{status}</p> : null}
    </div>
  );
}
