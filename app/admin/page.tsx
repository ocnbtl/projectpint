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
        <div className="admin-meta-row">
          <span className="admin-meta-pill">Manual visuals stay external</span>
          <span className="admin-meta-pill">Human approval before publish</span>
          <span className="admin-meta-pill">8-area model active</span>
        </div>
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
        <div className="admin-actions-inline">
          <OpsButton action="publish_approved_blogs" label="Publish approved blogs" />
          <OpsButton action="publish_approved_guides" label="Publish approved guides" variant="ghost" />
          <OpsButton action="prepare_approved_pins_for_export" label="Prepare approved pins" variant="ghost" />
        </div>
        <div className="admin-actions-inline">
          <OpsButton action="refresh_customers" label="Refresh customers from leads" />
          <OpsButton action="update_product_stats" label="Update product stats" />
        </div>
        <p className="small">
          Operator path: approve blogs, publish blogs, approve guides, publish guides, approve pins, prepare export,
          then use the manual visual and posting workflow.
        </p>
        <p className="small">
          Need to validate content before posting? Open <Link href="/review_pack.html">review_pack.html</Link>.
        </p>
      </section>
    </AdminFrame>
  );
}
