import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AdminSheetWorkspace } from "../../../components/admin/AdminSheetWorkspace";
import { countRowsWith, sumNumberColumn, uniqueValueCount } from "../../../lib/admin-table-stats";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const rows = await loadEvergreenTab("customers");
  const purchases = sumNumberColumn(rows, "Purchases");

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
        summaryCards={[
          { label: "Users", value: rows.length.toLocaleString(), detail: "signup leads", tone: "green" },
          { label: "With Email", value: countRowsWith(rows, "User_Email").toLocaleString(), detail: "available contacts", tone: "blue" },
          { label: "Purchases", value: purchases.toLocaleString(), detail: "linked purchases", tone: "gold" },
          { label: "Areas", value: uniqueValueCount(rows, "Content_Area").toLocaleString(), detail: "captured interests", tone: "brown" }
        ]}
      />
    </AdminFrame>
  );
}
