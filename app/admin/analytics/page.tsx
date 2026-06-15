import { AdminFrame } from "../../../components/admin/AdminFrame";
import { commandCenterDashboardSnapshot, type CommandCenterKpis } from "../../../lib/command-center";

export const dynamic = "force-dynamic";

function percent(value: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.min(100, Math.round((value / total) * 100));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

function analyticsCards(kpis: CommandCenterKpis) {
  return [
    {
      detail: `${kpis.pinsReadyToSync} approved, ${kpis.pinsMissingMedia} need media`,
      icon: "P",
      label: "Pinterest Pins",
      tone: "green",
      value: kpis.totalPins
    },
    {
      detail: `${kpis.blogsReadyToPublish} approved for human publish`,
      icon: "B",
      label: "Blog Posts",
      tone: "gold",
      value: kpis.totalBlogs
    },
    {
      detail: `${kpis.guidesReadyToPublish} guides ready for review`,
      icon: "G",
      label: "Guides",
      tone: "blue",
      value: kpis.totalGuides
    },
    {
      detail: `${kpis.totalEmails} email rows available`,
      icon: "E",
      label: "Email Queue",
      tone: "brown",
      value: kpis.totalEmails
    },
    {
      detail: `${kpis.totalCustomers} signup rows tracked`,
      icon: "U",
      label: "Users",
      tone: "green",
      value: kpis.totalCustomers
    },
    {
      detail: `${formatCurrency(kpis.totalRevenue)} tracked revenue`,
      icon: "$",
      label: "Products",
      tone: "gold",
      value: kpis.totalProducts
    }
  ];
}

export default async function AdminAnalyticsPage() {
  const snapshot = await commandCenterDashboardSnapshot();
  const { kpis } = snapshot;

  const cards = analyticsCards(kpis);
  const readiness = [
    {
      detail: `${kpis.pinsReadyToSync} of ${kpis.totalPins} pins are approved for manual export.`,
      label: "Pin export readiness",
      tone: "green",
      value: percent(kpis.pinsReadyToSync, kpis.totalPins)
    },
    {
      detail: `${kpis.blogsReadyToPublish} of ${kpis.totalBlogs} blog rows can move through publish approval.`,
      label: "Blog publish readiness",
      tone: "gold",
      value: percent(kpis.blogsReadyToPublish, kpis.totalBlogs)
    },
    {
      detail: `${kpis.guidesReadyToPublish} of ${kpis.totalGuides} guide rows can move through publish approval.`,
      label: "Guide publish readiness",
      tone: "blue",
      value: percent(kpis.guidesReadyToPublish, kpis.totalGuides)
    },
    {
      detail: `${kpis.pinsPosted} pins already have public URLs.`,
      label: "Pinterest live coverage",
      tone: "brown",
      value: percent(kpis.pinsPosted, kpis.totalPins)
    }
  ];

  const channelBars = [
    { label: "Pins", value: kpis.totalPins },
    { label: "Blogs", value: kpis.totalBlogs },
    { label: "Guides", value: kpis.totalGuides },
    { label: "Emails", value: kpis.totalEmails },
    { label: "Users", value: kpis.totalCustomers },
    { label: "Products", value: kpis.totalProducts }
  ];
  const maxChannelValue = Math.max(...channelBars.map((item) => item.value), 1);

  const gates = [
    {
      label: "Manual Pinterest export",
      metric: `${kpis.pinsReadyToSync} ready`,
      note: "Approved pins still wait for operator export and Pinterest compliance review."
    },
    {
      label: "Blog publish gate",
      metric: `${kpis.blogsReadyToPublish} ready`,
      note: "Approved blog rows publish only after human approval."
    },
    {
      label: "Guide publish gate",
      metric: `${kpis.guidesReadyToPublish} ready`,
      note: "Guide content keeps the same review path as the existing live workflow."
    },
    {
      label: "Visual production",
      metric: `${kpis.pinsMissingMedia} missing`,
      note: "Rows without media keep the manual Nano Banana and Canva handoff visible."
    }
  ];

  return (
    <AdminFrame>
      <section className="admin-analytics-hero">
        <div>
          <p className="admin-analytics-kicker">Analytics Dashboard</p>
          <h1>Performance Overview</h1>
          <p>
            Live command-center metrics from the current backend. The Figma mock dashboard has been connected to real
            publish, export, signup, and product rows.
          </p>
        </div>
        <div className="admin-analytics-filter" aria-label="Analytics view options">
          <span className="is-active">All</span>
          <span>Pins</span>
          <span>Blogs</span>
          <span>Emails</span>
          <span>Products</span>
        </div>
      </section>

      <section className="admin-analytics-kpi-grid" aria-label="Runtime analytics">
        {cards.map((card) => (
          <article key={card.label} className="admin-analytics-kpi">
            <span className={`admin-analytics-icon admin-kpi-${card.tone}`}>{card.icon}</span>
            <p>{card.label}</p>
            <h2>{card.value}</h2>
            <span>{card.detail}</span>
          </article>
        ))}
      </section>

      <section className="admin-analytics-grid">
        <article className="admin-analytics-panel admin-analytics-panel-large">
          <div className="admin-analytics-panel-head">
            <div>
              <h2>Content Pipeline</h2>
              <p>Current live rows by workflow area</p>
            </div>
            <span>Runtime</span>
          </div>
          <div className="admin-analytics-bars" aria-label="Content volume by channel">
            {channelBars.map((item) => (
              <div key={item.label} className="admin-analytics-bar-row">
                <span>{item.label}</span>
                <div className="admin-analytics-bar-track">
                  <i style={{ width: `${Math.max(8, percent(item.value, maxChannelValue))}%` }} />
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-analytics-panel">
          <div className="admin-analytics-panel-head">
            <div>
              <h2>Approval Readiness</h2>
              <p>Human gates stay active</p>
            </div>
          </div>
          <div className="admin-analytics-readiness">
            {readiness.map((item) => (
              <div key={item.label} className="admin-analytics-readiness-row">
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.detail}</p>
                </div>
                <strong>{item.value}%</strong>
                <div className="admin-analytics-progress">
                  <i className={`admin-analytics-progress-${item.tone}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-analytics-grid admin-analytics-grid-bottom">
        <article className="admin-analytics-panel">
          <div className="admin-analytics-panel-head">
            <div>
              <h2>Workflow Gates</h2>
              <p>Operational controls connected to the live backend</p>
            </div>
          </div>
          <div className="admin-analytics-gate-list">
            {gates.map((gate) => (
              <div key={gate.label} className="admin-analytics-gate">
                <div>
                  <h3>{gate.label}</h3>
                  <p>{gate.note}</p>
                </div>
                <strong>{gate.metric}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-analytics-panel">
          <div className="admin-analytics-panel-head">
            <div>
              <h2>Runtime Alerts</h2>
              <p>Generated from stored command-center rows</p>
            </div>
          </div>
          <div className="admin-analytics-alert-list">
            {[...snapshot.attention, ...snapshot.activity].slice(0, 6).map((item) => (
              <div key={`${item.label}-${item.detail}`} className={`admin-analytics-alert admin-alert-${item.tone}`}>
                <span />
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AdminFrame>
  );
}
