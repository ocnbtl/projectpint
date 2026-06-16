import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AdminSheetWorkspace } from "../../../components/admin/AdminSheetWorkspace";
import { OpsButton } from "../../../components/admin/OpsButton";
import { ADMIN_TABLE_COLUMNS } from "../../../lib/admin-table-view";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const rows = await loadEvergreenTab("customers");

  return (
    <AdminFrame>
      <AdminSheetWorkspace
        tab="customers"
        heroTitle="Users"
        heroDescription={
          <p>
            This table auto syncs from signup leads and stores user email, signup date and time, selected content
            areas, and purchase IDs.
          </p>
        }
        editorTitle="Customers Evergreen"
        columns={[...ADMIN_TABLE_COLUMNS.customers]}
        initialRows={rows}
        dateColumn="User_Date_Email"
      >
        <div className="admin-action-stack admin-figma-action-stack">
          <div className="admin-ops-grid">
            <OpsButton action="refresh_customers" label="Refresh Customers" icon="refresh" variant="ghost" />
          </div>
        </div>
      </AdminSheetWorkspace>
    </AdminFrame>
  );
}
