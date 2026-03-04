import { AdminFrame } from "../../../components/admin/AdminFrame";
import { DataSheetEditor } from "../../../components/admin/DataSheetEditor";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  const rows = loadEvergreenTab("customers");

  return (
    <AdminFrame>
      <section className="admin-panel">
        <h1>Users</h1>
        <p>
          This table auto-syncs from signup leads and stores user email, signup date/time, selected content areas, and
          purchase IDs.
        </p>
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
