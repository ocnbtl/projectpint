import { AdminFrame } from "../../../components/admin/AdminFrame";
import { DataSheetEditor } from "../../../components/admin/DataSheetEditor";
import { OpsButton } from "../../../components/admin/OpsButton";
import { COMMAND_CENTER_COLUMNS } from "../../../lib/command-center-config";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const rows = loadEvergreenTab("products");

  return (
    <AdminFrame>
      <section className="admin-panel">
        <h1>Products</h1>
        <p>
          Track product launch date, links, sales, revenue, and content associations. Use update stats to refresh sales
          and linked content IDs.
        </p>
        <div className="admin-actions-inline">
          <OpsButton action="update_product_stats" label="Update stats" />
        </div>
      </section>

      <DataSheetEditor
        tab="products"
        title="Products Evergreen"
        columns={[...COMMAND_CENTER_COLUMNS.products]}
        initialRows={rows}
        dateColumn="Product_Date"
      />
    </AdminFrame>
  );
}
