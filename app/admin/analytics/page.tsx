import { AdminFrame } from "../../../components/admin/AdminFrame";
import { commandCenterKpis } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const kpis = await commandCenterKpis();

  const cards = [
    {
      label: "Pins",
      value: kpis.totalPins,
      detail: `${kpis.pinsReadyToSync} ready to export, ${kpis.pinsMissingMedia} missing media URLs`
    },
    {
      label: "Blogs",
      value: kpis.totalBlogs,
      detail: `${kpis.blogsReadyToPublish} approved rows ready to publish`
    },
    {
      label: "Guides",
      value: kpis.totalGuides,
      detail: `${kpis.guidesReadyToPublish} approved rows ready to publish`
    },
    {
      label: "Customers",
      value: kpis.totalCustomers,
      detail: `${kpis.totalEmails} email rows in the command center`
    },
    {
      label: "Products",
      value: kpis.totalProducts,
      detail: `$${kpis.totalRevenue} tracked revenue`
    }
  ];

  return (
    <AdminFrame>
      <section className="admin-panel admin-panel-hero">
        <p className="eyebrow admin-eyebrow">Analytics</p>
        <h1>Runtime snapshot</h1>
        <p>
          Live command-center metrics from the current backend. Figma Make mock analytics are intentionally replaced
          with real stored rows and publish/export readiness.
        </p>
      </section>

      <section className="admin-kpi-grid" aria-label="Runtime analytics">
        {cards.map((card) => (
          <article key={card.label} className="admin-kpi-card">
            <p className="small">{card.label}</p>
            <h2>{card.value}</h2>
            <p className="small">{card.detail}</p>
          </article>
        ))}
      </section>
    </AdminFrame>
  );
}
