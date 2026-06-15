"use client";

import { useState, type ReactNode } from "react";

interface AdminGenerateDisclosureProps {
  label: string;
  children: ReactNode;
}

export function AdminGenerateDisclosure({ label, children }: AdminGenerateDisclosureProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-generate-disclosure">
      <button
        type="button"
        className="btn btn-accent admin-action-button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="admin-action-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </span>
        {label}
      </button>
      {open ? <div className="admin-generate-panel">{children}</div> : null}
    </div>
  );
}
