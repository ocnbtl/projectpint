import Link from "next/link";
import { AdminFrame } from "../../components/admin/AdminFrame";
import { OpsButton } from "../../components/admin/OpsButton";
import { commandCenterKpis } from "../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const kpis = await commandCenterKpis();

  return (
    <AdminFrame>
      <section className="admin-panel admin-panel-hero">
        <p className="eyebrow admin-eyebrow">Command Center</p>
        <h1>Diyesu Decor Operations</h1>
        <p>
          Manage evergreen pins, blogs, guides, emails, customers, and products from one workspace without reviving the
          old artifact-heavy operator flow.
        </p>
      </section>

      <section className="admin-kpi-grid" aria-label="Core KPIs">
        <article className="admin-kpi-card">
          <p className="small">Pins</p>
          <h2>{kpis.totalPins}</h2>
          <p className="small">Posted: {kpis.pinsPosted}</p>
          <p className="small">Missing media URLs: {kpis.pinsMissingMedia}</p>
          <p className="small">Ready to export: {kpis.pinsReadyToSync}</p>
        </article>

        <article className="admin-kpi-card">
          <p className="small">Blogs + Guides</p>
          <h2>
            {kpis.totalBlogs} / {kpis.totalGuides}
          </h2>
          <p className="small">Ready: {kpis.blogsReadyToPublish} blogs / {kpis.guidesReadyToPublish} guides</p>
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
        <div className="admin-quick-grid">
          <article className="admin-quick-card">
            <h3>Publish blogs</h3>
            <p className="small">Push approved blog rows live after final review.</p>
            <OpsButton action="publish_approved_blogs" label="Publish approved blogs" />
          </article>
          <article className="admin-quick-card">
            <h3>Publish guides</h3>
            <p className="small">Ship approved guide rows to the live guides route.</p>
            <OpsButton action="publish_approved_guides" label="Publish approved guides" variant="ghost" />
          </article>
          <article className="admin-quick-card">
            <h3>Prepare pins</h3>
            <p className="small">Finalize approved pins for manual CSV export and posting.</p>
            <OpsButton action="prepare_approved_pins_for_export" label="Prepare approved pins" variant="ghost" />
          </article>
          <article className="admin-quick-card">
            <h3>Refresh customers</h3>
            <p className="small">Pull new signups into the customers table before audience review.</p>
            <OpsButton action="refresh_customers" label="Refresh customers from leads" />
          </article>
          <article className="admin-quick-card">
            <h3>Update product stats</h3>
            <p className="small">Refresh product links, sales, and revenue fields in one pass.</p>
            <OpsButton action="update_product_stats" label="Update product stats" />
          </article>
          <article className="admin-quick-card admin-quick-card-link">
            <h3>Review pack</h3>
            <p className="small">Open the review pack when you want one more content quality pass before posting.</p>
            <Link href="/review_pack.html" className="btn btn-ghost">
              Open review pack
            </Link>
          </article>
        </div>
      </section>
    </AdminFrame>
  );
}
