import { AdminFrame } from "../../components/admin/AdminFrame";

export default function AdminLoading() {
  return (
    <AdminFrame>
      <section className="admin-state-panel" aria-busy="true" aria-live="polite">
        <div className="admin-state-spinner" aria-hidden="true" />
        <div>
          <h1>Loading command center</h1>
          <p>Retrieving the latest authorized workspace state.</p>
        </div>
      </section>
    </AdminFrame>
  );
}
