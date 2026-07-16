"use client";

import { AdminFrame } from "../../components/admin/AdminFrame";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <AdminFrame>
      <section className="admin-state-panel is-error" role="alert">
        <div>
          <p className="eyebrow">Command center unavailable</p>
          <h1>This admin view could not be loaded.</h1>
          <p>No changes were made. Retry the protected request, or return to the dashboard.</p>
        </div>
        <button type="button" className="btn btn-accent" onClick={reset}>Try again</button>
      </section>
    </AdminFrame>
  );
}
