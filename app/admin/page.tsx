import Link from "next/link";
import { AdminFrame } from "../../components/admin/AdminFrame";
import { OpsButton } from "../../components/admin/OpsButton";
import { commandCenterDashboardSnapshot, type CommandCenterActivity } from "../../lib/command-center";

export const dynamic = "force-dynamic";

function ActivityList({ title, items, emptyText }: { title: string; items: CommandCenterActivity[]; emptyText: string }) {
  return (
    <section className="admin-panel admin-activity-panel">
      <h2>{title}</h2>
      <div className="admin-activity-list">
        {items.length > 0 ? (
          items.map((item) => (
            <article key={`${item.label}-${item.detail}`} className="admin-activity-row">
              <span className={`admin-status-dot admin-status-${item.tone}`} aria-hidden="true" />
              <div>
                <h3>{item.label}</h3>
                <p>{item.detail}</p>
              </div>
            </article>
          ))
        ) : (
          <p className="small admin-empty-copy">{emptyText}</p>
        )}
      </div>
    </section>
  );
}

export default async function AdminPage() {
  const { kpis, activity, attention } = await commandCenterDashboardSnapshot();

  return (
    <AdminFrame>
      <section className="admin-panel admin-panel-hero">
        <p className="eyebrow admin-eyebrow">Command Center</p>
        <h1>Operations Dashboard</h1>
        <p>
          Manage evergreen pins, blogs, guides, emails, customers, and products from one workspace without reviving the
          old artifact-heavy operator flow.
        </p>
      </section>

      <section className="admin-kpi-grid" aria-label="Core KPIs">
        <article className="admin-kpi-card">
          <p className="small">Pins</p>
          <h2>{kpis.totalPins}</h2>
          <p className="small">{kpis.pinsReadyToSync} ready to export</p>
          <p className="small">{kpis.pinsMissingMedia} missing media URLs</p>
        </article>

        <article className="admin-kpi-card">
          <p className="small">Blogs</p>
          <h2>{kpis.totalBlogs}</h2>
          <p className="small">{kpis.blogsReadyToPublish} approved rows ready to publish</p>
        </article>

        <article className="admin-kpi-card">
          <p className="small">Guides</p>
          <h2>{kpis.totalGuides}</h2>
          <p className="small">{kpis.guidesReadyToPublish} approved rows ready to publish</p>
        </article>

        <article className="admin-kpi-card">
          <p className="small">Emails</p>
          <h2>{kpis.totalEmails}</h2>
          <p className="small">Newsletter rows in the content engine</p>
        </article>

        <article className="admin-kpi-card">
          <p className="small">Users</p>
          <h2>{kpis.totalCustomers}</h2>
          <p className="small">Signup leads available for review</p>
        </article>

        <article className="admin-kpi-card">
          <p className="small">Products</p>
          <h2>{kpis.totalProducts}</h2>
          <p className="small">Revenue tracked: ${kpis.totalRevenue}</p>
        </article>
      </section>

      <div className="admin-dashboard-grid">
        <ActivityList
          title="Needs Attention"
          items={attention}
          emptyText="No urgent command-center items are waiting right now."
        />
        <ActivityList title="Recent Runtime Signals" items={activity} emptyText="No activity is available yet." />
      </div>

      <section className="admin-panel">
        <div className="admin-section-head">
          <div>
            <h2>Quick Actions</h2>
            <p className="small">These buttons still use the live command-center operations API and human approval gates.</p>
          </div>
        </div>
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
