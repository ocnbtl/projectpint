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

const QUICK_ACTIONS = [
  {
    action: "publish_approved_blogs",
    label: "Publish Approved Blogs",
    variant: "accent" as const,
    icon: "play" as const
  },
  {
    action: "publish_approved_guides",
    label: "Publish Approved Guides",
    variant: "accent" as const,
    icon: "play" as const
  },
  {
    action: "prepare_approved_pins_for_export",
    label: "Prepare Pins",
    variant: "ghost" as const,
    icon: "play" as const
  },
  {
    action: "refresh_customers",
    label: "Refresh Customers",
    variant: "ghost" as const,
    icon: "refresh" as const
  },
  {
    action: "update_product_stats",
    label: "Update Product Stats",
    variant: "ghost" as const,
    icon: "refresh" as const
  }
];

export default async function AdminPage() {
  const { kpis, activity, attention } = await commandCenterDashboardSnapshot();
  const recentSignals = [...attention, ...activity].slice(0, 5);
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
      subdetail: "tracked revenue",
      tone: "gold"
    }
  ];

  return (
    <AdminFrame>
      <div className="admin-home-page">
        <header className="admin-home-head">
          <div>
            <h1>Operations Dashboard</h1>
            <p>Welcome back. Here&apos;s the current state of your content engine.</p>
          </div>
        </header>

        <section className="admin-kpi-grid" aria-label="Core KPIs">
          {metrics.map((metric) => (
            <article key={metric.label} className="admin-kpi-card">
              <span className={`admin-kpi-icon admin-kpi-${metric.tone}`}>
                <MetricIcon name={metric.icon} />
              </span>
              <p className="admin-kpi-number">{metric.total}</p>
              <h2>{metric.label}</h2>
              <p className={`admin-kpi-detail admin-kpi-text-${metric.tone}`}>{metric.detail}</p>
              <p className="admin-kpi-subdetail">{metric.subdetail}</p>
            </article>
          ))}
        </section>

        <section className="admin-panel admin-home-actions-card">
          <h2>Quick Actions</h2>
          <div className="admin-home-actions-grid">
            {QUICK_ACTIONS.map((action) => (
              <OpsButton
                key={action.action}
                action={action.action}
                label={action.label}
                variant={action.variant}
                icon={action.icon}
              />
            ))}
            <Link href="/api/admin/review-pack" className="btn btn-ghost admin-home-action-link">
              <span className="admin-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 4v10" />
                  <path d="m7 9 5 5 5-5" />
                  <path d="M5 20h14" />
                </svg>
              </span>
              Download Review Pack
            </Link>
          </div>
        </section>

        <ActivityList
          title="Recent Activity"
          items={recentSignals}
          emptyText="No activity is available yet."
        />
      </div>
    </AdminFrame>
  );
}
