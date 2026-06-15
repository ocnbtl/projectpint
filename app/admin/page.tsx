import Link from "next/link";
import { AdminFrame } from "../../components/admin/AdminFrame";
import { OpsButton } from "../../components/admin/OpsButton";
import { commandCenterDashboardSnapshot, type CommandCenterActivity } from "../../lib/command-center";

export const dynamic = "force-dynamic";

function MetricIcon({ name }: { name: string }) {
  switch (name) {
    case "pin":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 4 20 10l-3.2 1.4-3.7 7.6-2.1-2.1 2.4-5.8-5.8 2.4L5.5 11.4l7.6-3.7L14 4Z" />
        </svg>
      );
    case "file":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 4h8l4 4v12H6z" />
          <path d="M14 4v4h4M9 12h6M9 16h6" />
        </svg>
      );
    case "book":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5v-16Z" />
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 8H20" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M16 6.5a2.5 2.5 0 0 1 0 5M16.5 14a4.5 4.5 0 0 1 4 5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 8.5 12 5l7 3.5v7L12 19l-7-3.5v-7Z" />
          <path d="m5.5 8.8 6.5 3.3 6.5-3.3M12 12.1V19" />
        </svg>
      );
  }
}

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
  const metrics = [
    {
      label: "Pins",
      icon: "pin",
      total: kpis.totalPins,
      detail: `${kpis.pinsReadyToSync} ready to export`,
      subdetail: `${kpis.pinsMissingMedia} missing media URLs`,
      tone: "green"
    },
    {
      label: "Blogs",
      icon: "file",
      total: kpis.totalBlogs,
      detail: `${kpis.blogsReadyToPublish} approved`,
      subdetail: "rows ready to publish",
      tone: "gold"
    },
    {
      label: "Guides",
      icon: "book",
      total: kpis.totalGuides,
      detail: `${kpis.guidesReadyToPublish} approved`,
      subdetail: "rows ready to publish",
      tone: "blue"
    },
    {
      label: "Emails",
      icon: "mail",
      total: kpis.totalEmails,
      detail: "Newsletter rows",
      subdetail: "in the content engine",
      tone: "brown"
    },
    {
      label: "Users",
      icon: "users",
      total: kpis.totalCustomers,
      detail: "Signup leads",
      subdetail: "available for review",
      tone: "green"
    },
    {
      label: "Products",
      icon: "package",
      total: kpis.totalProducts,
      detail: `${kpis.totalRevenue} revenue`,
      subdetail: "tracked in products",
      tone: "gold"
    }
  ];

  return (
    <AdminFrame>
      <header className="admin-home-head">
        <div>
          <h1>Operations Dashboard</h1>
          <p>Welcome back. Here&apos;s the current state of your content engine.</p>
        </div>
        <Link href="/review_pack.html" className="btn btn-ghost admin-review-link">
          Review pack
        </Link>
      </header>

      <section className="admin-kpi-grid" aria-label="Core KPIs">
        {metrics.map((metric) => (
          <article key={metric.label} className="admin-kpi-card">
            <span className={`admin-kpi-icon admin-kpi-${metric.tone}`}>
              <MetricIcon name={metric.icon} />
            </span>
            <h2>{metric.total}</h2>
            <p className="admin-kpi-label">{metric.label}</p>
            <p className={`admin-kpi-detail admin-kpi-text-${metric.tone}`}>{metric.detail}</p>
            <p className="admin-kpi-subdetail">{metric.subdetail}</p>
          </article>
        ))}
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
            <p className="small">These still use the live command-center operations API and human approval gates.</p>
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
