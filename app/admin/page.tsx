import Link from "next/link";
import { AdminFrame } from "../../components/admin/AdminFrame";
import { OpsButton } from "../../components/admin/OpsButton";
import { commandCenterKpis } from "../../lib/command-center";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const kpis = commandCenterKpis();

  return (
    <AdminFrame>
      <section className="admin-panel">
        <p className="eyebrow admin-eyebrow">Command Center</p>
        <h1>Diyesu Decor Operations</h1>
        <p>
          Use the left navigation to manage evergreen pins, blogs, guides, promotional emails, customers, and product
          stats from one place.
        </p>
      </section>

      <section className="admin-kpi-grid" aria-label="Core KPIs">
        <article className="admin-kpi-card">
          <p className="small">Pins</p>
          <h2>{kpis.totalPins}</h2>
          <p className="small">Posted: {kpis.pinsPosted}</p>
          <p className="small">Missing media URLs: {kpis.pinsMissingMedia}</p>
        </article>

        <article className="admin-kpi-card">
          <p className="small">Blogs + Guides</p>
          <h2>
            {kpis.totalBlogs} / {kpis.totalGuides}
          </h2>
          <p className="small">Track related pins from each content record.</p>
        </article>

        <article className="admin-kpi-card">
          <p className="small">Email + Customers</p>
          <h2>
            {kpis.totalEmails} / {kpis.totalCustomers}
          </h2>
          <p className="small">Customer table refreshes from signup leads.</p>
        </article>

        <article className="admin-kpi-card">
          <p className="small">Products</p>
          <h2>{kpis.totalProducts}</h2>
          <p className="small">Revenue tracked: ${kpis.totalRevenue}</p>
        </article>
      </section>

      <section className="admin-panel">
        <h2>Quick Actions</h2>
        <div className="admin-actions-inline">
          <OpsButton action="refresh_customers" label="Refresh customers from leads" />
          <OpsButton action="update_product_stats" label="Update product stats" />
        </div>
        <p className="small">Admin access code is controlled by the `ADMIN_PASSWORD` value in `.env.local`.</p>
        <p className="small">
          Need to validate content before posting? Open <Link href="/review_pack.html">review_pack.html</Link>.
        </p>
      </section>
    </AdminFrame>
  );
}
