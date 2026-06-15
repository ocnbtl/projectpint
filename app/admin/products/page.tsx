import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AdminSheetWorkspace } from "../../../components/admin/AdminSheetWorkspace";
import { OpsButton } from "../../../components/admin/OpsButton";
import { formatMoney, sumNumberColumn } from "../../../lib/admin-table-stats";
import { ADMIN_TABLE_COLUMNS } from "../../../lib/admin-table-view";
import { loadEvergreenTab } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const rows = await loadEvergreenTab("products");
  const totalRevenue = sumNumberColumn(rows, "Product_Revenue");
  const totalSales = sumNumberColumn(rows, "Product_Sales");

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
        columns={[...ADMIN_TABLE_COLUMNS.products]}
        initialRows={rows}
        dateColumn="Product_Date"
        summaryCards={[
          { label: "Total Revenue", value: formatMoney(totalRevenue), detail: "tracked in products", tone: "green" },
          { label: "Total Sales", value: totalSales.toLocaleString(), detail: "from customer purchases", tone: "gold" },
          { label: "Products", value: rows.length.toLocaleString(), detail: "evergreen offers", tone: "blue" }
        ]}
      >
        <div className="admin-ops-grid">
          <OpsButton action="update_product_stats" label="Update stats" />
        </div>
      </AdminSheetWorkspace>
    </AdminFrame>
  );
}
