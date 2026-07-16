import Link from "next/link";
import { AdminFrame } from "../../../components/admin/AdminFrame";
import {
  commandCenterDashboardSnapshot,
  loadEvergreenTab,
  type CommandCenterActivity,
  type CommandCenterKpis
} from "../../../lib/command-center";
import {
  COMMAND_CENTER_CONTENT_AREAS,
  contentAreaLabel,
  normalizeContentArea
} from "../../../lib/constants";
import type { ContentArea } from "../../../lib/types";

export const dynamic = "force-dynamic";

type Channel = "all" | "pins" | "blogs" | "emails" | "products";

interface AnalyticsPageProps {
  searchParams: Promise<{ channel?: string | string[] }>;
}

const CHANNELS: Array<{ key: Channel; label: string; icon: string }> = [
  { key: "all", label: "All", icon: "all" },
  { key: "pins", label: "Pins", icon: "pin" },
  { key: "blogs", label: "Blogs", icon: "file" },
  { key: "emails", label: "Emails", icon: "mail" },
  { key: "products", label: "Products", icon: "box" }
];

const AREA_COLORS: Record<ContentArea, string> = {
  Plants: "#5b8c6a",
  Mirror: "#7ba68a",
  Storage: "#8e7b6b",
  Lighting: "#d4a87a",
  Shower: "#6b9e7a",
  Renter: "#c4936a",
  DIY: "#a89080",
  ExtremeBudget: "#b8a99a"
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

function normalizeStatus(value: unknown) {
  return String(value ?? "draft").trim().toLowerCase() || "draft";
}

function normalizedArea(value: unknown): ContentArea {
  return normalizeContentArea(String(value ?? "")) ?? "DIY";
}

function dateToWeek(value: unknown) {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return "Unscheduled";
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const week = Math.max(1, Math.ceil(date.getUTCDate() / 7));
  return `W${week} ${month}`;
}

function qualityScore(row: Record<string, unknown>) {
  return Number(row.Quality_Score) || 0;
}

function relatedPins(row: Record<string, unknown>) {
  return Number(row.Related_Pins) || 0;
}

function AdminMetricCard({
  label,
  value,
  sub,
  trend
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "flat";
}) {
  return (
    <article className="admin-analytics-stat">
      <p>{label}</p>
      <div>
        <strong>{value}</strong>
        {trend ? <span className={`admin-analytics-trend is-${trend}`}>{trend === "up" ? "+" : trend === "down" ? "-" : "0"}</span> : null}
      </div>
      {sub ? <span>{sub}</span> : null}
    </article>
  );
}

function OverviewKpiIcon({ label, tone }: { label: string; tone: string }) {
  return <span className={`admin-analytics-icon admin-analytics-icon-${tone}`}>{label}</span>;
}

function ChannelTabs({ active }: { active: Channel }) {
  return (
    <nav className="admin-analytics-tabs" aria-label="Analytics channel">
      {CHANNELS.map((channel) => (
        <Link
          key={channel.key}
          href={channel.key === "all" ? "/admin/analytics" : `/admin/analytics?channel=${channel.key}`}
          className={channel.key === active ? "is-active" : ""}
          aria-current={channel.key === active ? "page" : undefined}
        >
          <span className={`admin-analytics-tab-icon icon-${channel.icon}`} aria-hidden="true" />
          {channel.label}
        </Link>
      ))}
    </nav>
  );
}

function OverviewHeader({ active }: { active: Channel }) {
  return (
    <section className="admin-analytics-overview-hero">
      <div>
        <p className="admin-analytics-kicker">Analytics Dashboard</p>
        <h1>Performance Overview</h1>
        <p>
          Live command-center metrics from the current backend. The Figma mock dashboard has been connected to real publish,
          export, signup, and product rows.
        </p>
      </div>
      <ChannelTabs active={active} />
    </section>
  );
}

function OverviewKpis({ kpis }: { kpis: CommandCenterKpis }) {
  const items = [
    {
      label: "Pinterest Pins",
      value: kpis.totalPins,
      detail: `${kpis.pinsReadyToSync} approved, ${kpis.pinsMissingMedia} need media`,
      icon: "P",
      tone: "green"
    },
    {
      label: "Blog Posts",
      value: kpis.totalBlogs,
      detail: `${kpis.blogsReadyToPublish} approved for human publish`,
      icon: "B",
      tone: "gold"
    },
    {
      label: "Guides",
      value: kpis.totalGuides,
      detail: `${kpis.guidesReadyToPublish} guides ready for review`,
      icon: "G",
      tone: "blue"
    },
    {
      label: "Email Queue",
      value: kpis.totalEmails,
      detail: `${kpis.totalEmails} email rows available`,
      icon: "E",
      tone: "brown"
    },
    {
      label: "Users",
      value: kpis.totalCustomers,
      detail: `${kpis.totalCustomers} signup rows tracked`,
      icon: "U",
      tone: "green"
    },
    {
      label: "Products",
      value: kpis.totalProducts,
      detail: `${formatCurrency(kpis.totalRevenue)} tracked revenue`,
      icon: "$",
      tone: "gold"
    }
  ];

  return (
    <section className="admin-analytics-kpi-grid" aria-label="Analytics overview KPIs">
      {items.map((item) => (
        <article key={item.label} className="admin-analytics-kpi">
          <OverviewKpiIcon label={item.icon} tone={item.tone} />
          <p>{item.label}</p>
          <h2>{item.value}</h2>
          <span>{item.detail}</span>
        </article>
      ))}
    </section>
  );
}

function BarChart({
  data,
  max
}: {
  data: Array<{ label: string; value: number }>;
  max?: number;
}) {
  const chartMax = Math.max(max ?? 0, ...data.map((item) => item.value), 1);
  return (
    <div className="admin-chart admin-chart-bars" aria-label="Bar chart">
      <div className="admin-chart-grid" aria-hidden="true" />
      {data.map((item) => (
        <div key={item.label} className="admin-chart-bar-item">
          <div className="admin-chart-bar-wrap">
            <span style={{ height: `${Math.max(4, (item.value / chartMax) * 100)}%` }} />
          </div>
          <p>{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function AreaTrendChart({ data }: { data: Array<{ label: string; created: number; prepared: number; published: number }> }) {
  const max = Math.max(...data.flatMap((item) => [item.created, item.prepared, item.published]), 1);
  const points = data
    .map((item, index) => {
      const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
      const y = 100 - (item.created / max) * 82;
      return `${x},${y}`;
    })
    .join(" ");
  const publishedPoints = data
    .map((item, index) => {
      const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
      const y = 100 - (item.published / max) * 82;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="admin-chart admin-chart-area">
      <svg viewBox="0 0 100 100" role="img" aria-label="Weekly production pipeline">
        <polyline points={`0,100 ${points} 100,100`} className="area-fill" />
        <polyline points={points} className="area-line area-line-created" />
        <polyline points={publishedPoints} className="area-line area-line-published" />
      </svg>
      <div className="admin-chart-xlabels">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
      <div className="admin-chart-legend">
        <span className="legend-created">created</span>
        <span className="legend-prepared">prepared</span>
        <span className="legend-published">published</span>
      </div>
    </div>
  );
}

function weeklyPipeline(rows: Record<string, unknown>[]) {
  const grouped = new Map<string, { label: string; created: number; prepared: number; published: number }>();
  for (const row of rows) {
    const label = dateToWeek(row.Pin_Publish_Date);
    const status = normalizeStatus(row.Workflow_Status);
    const current = grouped.get(label) ?? { label, created: 0, prepared: 0, published: 0 };
    current.created += 1;
    if (row.Prepared_For_Export_At || status === "approved" || status === "queued" || status === "posted" || status === "published") current.prepared += 1;
    if (row.Pin_URL || status === "posted" || status === "published") current.published += 1;
    grouped.set(label, current);
  }
  const data = [...grouped.values()];
  return data.length > 0 ? data.slice(-7) : [{ label: "No rows", created: 0, prepared: 0, published: 0 }];
}

function PinsAnalytics({ rows, kpis }: { rows: Record<string, unknown>[]; kpis: CommandCenterKpis }) {
  const prepared = rows.filter((row) => row.Prepared_For_Export_At || ["approved", "queued", "posted", "published"].includes(normalizeStatus(row.Workflow_Status))).length;
  const review = rows.filter((row) => normalizeStatus(row.Workflow_Status) === "review").length;
  const drafts = rows.filter((row) => normalizeStatus(row.Workflow_Status) === "draft").length;
  const statusData = [
    { label: "Draft", value: drafts },
    { label: "Review", value: review },
    { label: "Approved", value: kpis.pinsReadyToSync },
    { label: "Published", value: kpis.pinsPosted }
  ];
  return (
    <>
      <section className="admin-analytics-stat-grid is-five">
        <AdminMetricCard label="Total Pins" value={kpis.totalPins} />
        <AdminMetricCard label="Prepared" value={`${percent(prepared, kpis.totalPins)}%`} sub={`${prepared} of ${kpis.totalPins}`} />
        <AdminMetricCard label="Published" value={kpis.pinsPosted} />
        <AdminMetricCard label="In Review" value={review} />
        <AdminMetricCard label="Drafts" value={drafts} />
      </section>

      <section className="admin-analytics-chart-grid">
        <article className="admin-analytics-panel">
          <h2>Pipeline by Status</h2>
          <BarChart data={statusData} max={Math.max(4, ...statusData.map((item) => item.value))} />
        </article>
        <article className="admin-analytics-panel">
          <h2>Weekly Production Pipeline</h2>
          <AreaTrendChart data={weeklyPipeline(rows)} />
        </article>
      </section>

      <article className="admin-analytics-panel admin-analytics-unavailable" role="status">
        <span className="admin-analytics-unavailable-icon" aria-hidden="true">!</span>
        <div>
          <h2>Pin performance metrics are not connected</h2>
          <p>
            Impressions, saves, outbound clicks, closeups, and engagement rates do not currently come from a verified
            analytics source. No estimated or synthetic performance values are shown.
          </p>
          <p>
            Operational pin totals, workflow status, export readiness, and published URL coverage above remain based on
            stored command-center rows.
          </p>
        </div>
      </article>
    </>
  );
}

function AreaPill({ area }: { area: ContentArea }) {
  return (
    <span className="admin-area-pill">
      <i style={{ backgroundColor: AREA_COLORS[area] }} />
      {contentAreaLabel(area).toLowerCase()}
    </span>
  );
}


function BlogAnalytics({ rows }: { rows: Record<string, unknown>[] }) {
  const withQuality = rows.filter((row) => qualityScore(row) > 0);
  const avgQuality = withQuality.length ? Math.round(withQuality.reduce((sum, row) => sum + qualityScore(row), 0) / withQuality.length) : 0;
  const published = rows.filter((row) => normalizeStatus(row.Workflow_Status) === "published" || row.Published_To_Public_At).length;
  const linkedPins = rows.reduce((sum, row) => sum + relatedPins(row), 0);
  const qualityBars = withQuality.slice(0, 8).map((row) => ({
    label: String(row.Blog_Title ?? row.Blog_ID ?? "Blog").slice(0, 14),
    value: qualityScore(row)
  }));

  return (
    <>
      <section className="admin-analytics-stat-grid is-five">
        <AdminMetricCard label="Total Blogs" value={rows.length} />
        <AdminMetricCard label="Avg QC Score" value={avgQuality} sub={avgQuality >= 90 ? "Excellent" : avgQuality >= 80 ? "Good" : "Needs review"} />
        <AdminMetricCard label="Published" value={published} />
        <AdminMetricCard label="Total Linked Pins" value={linkedPins} />
        <AdminMetricCard label="Content Pipeline" value={Math.max(0, rows.length - published)} sub="In progress" />
      </section>
      <section className="admin-analytics-chart-grid">
        <article className="admin-analytics-panel">
          <h2>Quality Scores by Article</h2>
          <BarChart data={qualityBars.length ? qualityBars : [{ label: "No QC", value: 0 }]} max={100} />
        </article>
        <article className="admin-analytics-panel">
          <h2>Blog Workflow Pipeline</h2>
          <BarChart data={workflowBars(rows, "Published_To_Public_At")} />
        </article>
      </section>
      <ContentTable title="Blog Performance Queue" rows={rows} idKey="Blog_ID" titleKey="Blog_Title" areaKey="Content_Area" statusKey="Workflow_Status" />
    </>
  );
}

function EmailAnalytics({ rows }: { rows: Record<string, unknown>[] }) {
  const withSubject = rows.filter((row) => String(row.Email_Subject ?? "").trim()).length;
  const byArea = COMMAND_CENTER_CONTENT_AREAS.map((area) => ({
    label: contentAreaLabel(area),
    value: rows.filter((row) => normalizedArea(row.Content_Area) === area).length
  }));
  return (
    <>
      <section className="admin-analytics-stat-grid is-five">
        <AdminMetricCard label="Email Rows" value={rows.length} />
        <AdminMetricCard label="With Subject" value={withSubject} />
        <AdminMetricCard label="Draft Copy" value={rows.filter((row) => String(row.Email_Content ?? "").trim()).length} />
        <AdminMetricCard label="Areas Covered" value={byArea.filter((item) => item.value > 0).length} />
        <AdminMetricCard label="Ready Share" value={`${percent(withSubject, rows.length)}%`} />
      </section>
      <section className="admin-analytics-chart-grid">
        <article className="admin-analytics-panel">
          <h2>Email Coverage by Area</h2>
          <BarChart data={byArea} />
        </article>
        <article className="admin-analytics-panel">
          <h2>Email Operations</h2>
          <div className="admin-analytics-gate-list">
            <Gate label="Subject generation" note="Rows with subject lines can move into manual Klaviyo setup." metric={`${withSubject} ready`} />
            <Gate label="Content drafting" note="Email body copy remains connected to the existing content area workflow." metric={`${rows.length} rows`} />
          </div>
        </article>
      </section>
      <ContentTable title="Email Queue" rows={rows} idKey="Email_ID" titleKey="Email_Subject" areaKey="Content_Area" />
    </>
  );
}

function ProductAnalytics({ rows }: { rows: Record<string, unknown>[] }) {
  const revenue = rows.reduce((sum, row) => sum + (Number(row.Product_Revenue) || 0), 0);
  const sales = rows.reduce((sum, row) => sum + (Number(row.Product_Sales) || 0), 0);
  const linked = rows.filter((row) => row.Blog_ID || row.Guide_ID).length;
  return (
    <>
      <section className="admin-analytics-stat-grid is-five">
        <AdminMetricCard label="Products" value={rows.length} />
        <AdminMetricCard label="Revenue" value={formatCurrency(revenue)} />
        <AdminMetricCard label="Sales" value={sales} />
        <AdminMetricCard label="Linked Content" value={linked} />
        <AdminMetricCard label="Coverage" value={`${percent(linked, rows.length)}%`} />
      </section>
      <section className="admin-analytics-chart-grid">
        <article className="admin-analytics-panel">
          <h2>Product Revenue</h2>
          <BarChart data={rows.map((row) => ({ label: String(row.Product_ID ?? "Product"), value: Number(row.Product_Revenue) || 0 }))} />
        </article>
        <article className="admin-analytics-panel">
          <h2>Product Tracking</h2>
          <div className="admin-analytics-gate-list">
            <Gate label="Revenue tracking" note="Product rows stay tied to the existing product stats update action." metric={formatCurrency(revenue)} />
            <Gate label="Supporting content" note="Blog and guide references remain visible for operator review." metric={`${linked} linked`} />
          </div>
        </article>
      </section>
      <ContentTable title="Product Leaderboard" rows={rows} idKey="Product_ID" titleKey="Product_Link" metricKey="Product_Revenue" />
    </>
  );
}

function workflowBars(rows: Record<string, unknown>[], publishedKey?: string) {
  return [
    { label: "Draft", value: rows.filter((row) => normalizeStatus(row.Workflow_Status) === "draft").length },
    { label: "Review", value: rows.filter((row) => normalizeStatus(row.Workflow_Status) === "review").length },
    { label: "Approved", value: rows.filter((row) => normalizeStatus(row.Workflow_Status) === "approved").length },
    { label: "Published", value: rows.filter((row) => normalizeStatus(row.Workflow_Status) === "published" || (publishedKey ? row[publishedKey] : false)).length }
  ];
}

function Gate({ label, note, metric }: { label: string; note: string; metric: string }) {
  return (
    <div className="admin-analytics-gate">
      <div>
        <h3>{label}</h3>
        <p>{note}</p>
      </div>
      <strong>{metric}</strong>
    </div>
  );
}

function ContentTable({
  title,
  rows,
  idKey,
  titleKey,
  areaKey,
  statusKey,
  metricKey
}: {
  title: string;
  rows: Record<string, unknown>[];
  idKey: string;
  titleKey: string;
  areaKey?: string;
  statusKey?: string;
  metricKey?: string;
}) {
  return (
    <article className="admin-analytics-panel">
      <h2>{title}</h2>
      <div className="admin-analytics-table-wrap">
        <table className="admin-analytics-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              {areaKey ? <th>Area</th> : null}
              {statusKey ? <th>Status</th> : null}
              {metricKey ? <th>Metric</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 12).map((row, index) => (
              <tr key={`${row[idKey]}-${index}`}>
                <td>{String(row[idKey] ?? "")}</td>
                <td><strong>{String(row[titleKey] ?? "Untitled") || "Untitled"}</strong></td>
                {areaKey ? <td><AreaPill area={normalizedArea(row[areaKey])} /></td> : null}
                {statusKey ? <td><span className="admin-status-chip">{String(row[statusKey] ?? "draft")}</span></td> : null}
                {metricKey ? <td>{formatCurrency(Number(row[metricKey]) || 0)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function RuntimePanels({
  kpis,
  snapshot
}: {
  kpis: CommandCenterKpis;
  snapshot: { attention: CommandCenterActivity[]; activity: CommandCenterActivity[] };
}) {
  const channelBars = [
    { label: "Pins", value: kpis.totalPins },
    { label: "Blogs", value: kpis.totalBlogs },
    { label: "Guides", value: kpis.totalGuides },
    { label: "Emails", value: kpis.totalEmails },
    { label: "Users", value: kpis.totalCustomers },
    { label: "Products", value: kpis.totalProducts }
  ];
  const max = Math.max(...channelBars.map((item) => item.value), 1);
  const readiness = [
    { label: "Pin export readiness", value: percent(kpis.pinsReadyToSync, kpis.totalPins), detail: `${kpis.pinsReadyToSync} of ${kpis.totalPins} pins are approved for manual export.` },
    { label: "Blog publish readiness", value: percent(kpis.blogsReadyToPublish, kpis.totalBlogs), detail: `${kpis.blogsReadyToPublish} of ${kpis.totalBlogs} blog rows can move through publish approval.` },
    { label: "Guide publish readiness", value: percent(kpis.guidesReadyToPublish, kpis.totalGuides), detail: `${kpis.guidesReadyToPublish} of ${kpis.totalGuides} guide rows can move through publish approval.` },
    { label: "Pinterest live coverage", value: percent(kpis.pinsPosted, kpis.totalPins), detail: `${kpis.pinsPosted} pins already have public URLs.` }
  ];

  return (
    <section className="admin-analytics-runtime-grid">
      <article className="admin-analytics-panel">
        <div className="admin-analytics-panel-row">
          <div>
            <h2>Content Pipeline</h2>
            <p>Current live rows by workflow area</p>
          </div>
          <span className="admin-runtime-chip">Runtime</span>
        </div>
        <div className="admin-analytics-bars">
          {channelBars.map((item) => (
            <div key={item.label} className="admin-analytics-bar-row">
              <span>{item.label}</span>
              <div><i style={{ width: `${Math.max(8, percent(item.value, max))}%` }} /></div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </article>
      <article className="admin-analytics-panel">
        <h2>Approval Readiness</h2>
        <p>Human gates stay active</p>
        <div className="admin-analytics-readiness">
          {readiness.map((item) => (
            <div key={item.label} className="admin-analytics-readiness-row">
              <div>
                <h3>{item.label}</h3>
                <p>{item.detail}</p>
              </div>
              <strong>{item.value}%</strong>
              <span><i style={{ width: `${item.value}%` }} /></span>
            </div>
          ))}
        </div>
      </article>
      <article className="admin-analytics-panel">
        <h2>Workflow Gates</h2>
        <p>Operational controls connected to the live backend</p>
        <div className="admin-analytics-gate-list">
          <Gate label="Manual Pinterest export" note="Approved pins still wait for operator export and Pinterest compliance review." metric={`${kpis.pinsReadyToSync} ready`} />
          <Gate label="Blog publish gate" note="Approved blog rows publish only after human approval." metric={`${kpis.blogsReadyToPublish} ready`} />
          <Gate label="Guide publish gate" note="Guide content keeps the same review path as the existing live workflow." metric={`${kpis.guidesReadyToPublish} ready`} />
          <Gate label="Visual production" note="Rows without media keep the manual Nano Banana and Canva handoff visible." metric={`${kpis.pinsMissingMedia} missing`} />
        </div>
      </article>
      <article className="admin-analytics-panel">
        <h2>Runtime Alerts</h2>
        <p>Generated from stored command-center rows</p>
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
  );
}

export default async function AdminAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const rawChannel = Array.isArray(params.channel) ? params.channel[0] : params.channel;
  const activeChannel = CHANNELS.some((item) => item.key === rawChannel) ? (rawChannel as Channel) : "all";
  const [snapshot, pins, blogs, guides, emails, products] = await Promise.all([
    commandCenterDashboardSnapshot(),
    loadEvergreenTab("pins"),
    loadEvergreenTab("blogs"),
    loadEvergreenTab("guides"),
    loadEvergreenTab("emails"),
    loadEvergreenTab("products")
  ]);
  const runtimeKpis = { ...snapshot.kpis, totalGuides: guides.length };

  return (
    <AdminFrame>
      <div className="admin-analytics-page">
        {activeChannel === "all" ? (
          <>
            <OverviewHeader active={activeChannel} />
            <OverviewKpis kpis={runtimeKpis} />
            <RuntimePanels kpis={runtimeKpis} snapshot={snapshot} />
          </>
        ) : (
          <>
            <header className="admin-page-heading admin-analytics-heading">
              <div>
                <h1>Analytics</h1>
                <p>Performance insights across all content and product channels.</p>
              </div>
            </header>

            <ChannelTabs active={activeChannel} />

            {activeChannel === "pins" ? <PinsAnalytics rows={pins} kpis={runtimeKpis} /> : null}
            {activeChannel === "blogs" ? <BlogAnalytics rows={blogs} /> : null}
            {activeChannel === "emails" ? <EmailAnalytics rows={emails} /> : null}
            {activeChannel === "products" ? <ProductAnalytics rows={products} /> : null}
          </>
        )}
      </div>
    </AdminFrame>
  );
}
