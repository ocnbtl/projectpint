import { AdminFrame } from "../../../components/admin/AdminFrame";
import { DataSheetEditor } from "../../../components/admin/DataSheetEditor";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const rows = await loadEvergreenTab("customers");

  return (
    <AdminFrame>
      <section className="admin-panel admin-panel-hero">
        <p className="eyebrow admin-eyebrow">Users</p>
        <h1>Users</h1>
        <p>
          This table auto-syncs from signup leads and stores user email, signup date/time, selected content areas, and
          purchase IDs.
        </p>
        <div className="admin-meta-row">
          <span className="admin-meta-pill">Signup sync</span>
          <span className="admin-meta-pill">8-area preferences</span>
        </div>
      </section>

      <DataSheetEditor
        tab="customers"
        title="Customers Evergreen"
        columns={[...COMMAND_CENTER_COLUMNS.customers]}
        initialRows={rows}
        dateColumn="User_Date_Email"
      />
    </AdminFrame>
  );
}
