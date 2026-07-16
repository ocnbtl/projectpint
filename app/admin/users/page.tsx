import { AdminFrame } from "../../../components/admin/AdminFrame";
import { OpsButton } from "../../../components/admin/OpsButton";
import { ReadOnlyCustomersTable } from "../../../components/admin/ReadOnlyCustomersTable";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const rows = await loadEvergreenTab("customers");

  return (
    <AdminFrame>
      <section className="admin-sheet-hero">
        <div className="admin-hero-head">
          <div className="admin-hero-copy">
            <h1>Users</h1>
            <div className="admin-hero-description">
              <p>Synced customer data from signups and lead magnets.</p>
            </div>
          </div>
        </div>
        <div className="admin-hero-body">
          <div className="admin-ops-grid">
            <OpsButton action="refresh_customers" label="Refresh Customers" icon="refresh" variant="ghost" />
          </div>
        </div>
      </section>
      <ReadOnlyCustomersTable initialRows={rows} />
    </AdminFrame>
  );
}
