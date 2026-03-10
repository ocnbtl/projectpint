import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AdminSheetWorkspace } from "../../../components/admin/AdminSheetWorkspace";
import { OpsButton } from "../../../components/admin/OpsButton";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const rows = await loadEvergreenTab("products");

  return (
    <AdminFrame>
      <AdminSheetWorkspace
        tab="products"
        heroTitle="Products"
        heroDescription={
          <p>
            Track product launch date, links, sales, revenue, and content associations. Use update stats to refresh
            sales and linked content IDs.
          </p>
        }
        editorTitle="Products Evergreen"
        columns={[...COMMAND_CENTER_COLUMNS.products]}
        initialRows={rows}
        dateColumn="Product_Date"
      >
        <div className="admin-ops-grid">
          <OpsButton action="update_product_stats" label="Update stats" />
        </div>
      </AdminSheetWorkspace>
    </AdminFrame>
  );
}
