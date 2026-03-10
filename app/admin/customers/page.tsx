import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AdminSheetWorkspace } from "../../../components/admin/AdminSheetWorkspace";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
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
        columns={[...COMMAND_CENTER_COLUMNS.customers]}
        initialRows={rows}
        dateColumn="User_Date_Email"
      />
    </AdminFrame>
  );
}
