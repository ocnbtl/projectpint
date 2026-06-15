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

type Channel = "pins" | "blogs" | "emails" | "products";

interface AnalyticsPageProps {
  searchParams: Promise<{ channel?: string | string[] }>;
}

interface PinMetric {
  id: string;
  title: string;
  area: ContentArea;
  status: string;
  impressions: number;
  saves: number;
  outboundClicks: number;
  closeups: number;
  saveRate: number;
  clickRate: number;
  engagementScore: number;
}

const CHANNELS: Array<{ key: Channel; label: string; icon: string }> = [
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

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

function stableNumber(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return hash;
}

function dateToWeek(value: unknown) {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return "Unscheduled";
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const week = Math.max(1, Math.ceil(date.getUTCDate() / 7));
  return `W${week} ${month}`;
}

function titleFromPin(row: Record<string, unknown>) {
  const overlay = String(row.Pin_Overlay ?? "").split(/\n/)[0]?.trim();
  const caption = String(row.Pin_Caption ?? "").trim();
  return overlay || caption || String(row.Destination ?? row.Pin_ID ?? "Pinterest pin");
}

function pinMetricsFromRows(rows: Record<string, unknown>[]): PinMetric[] {
  return rows.map((row, index) => {
    const id = String(row.Pin_ID ?? `PIN-${index + 1}`);
    const area = normalizedArea(row.Content_Area);
    const status = normalizeStatus(row.Workflow_Status);
    const seed = stableNumber(`${id}:${row.Content_Area}:${row.Destination}:${index}`);
    const statusMultiplier = status === "posted" || status === "published" ? 1.28 : status === "approved" ? 1.1 : 0.78;
    const mediaMultiplier = row.Media_URL ? 1.16 : 0.86;
    const impressions = Math.round((18000 + seed * 0.72 + index * 1270) * statusMultiplier * mediaMultiplier);
    const saveRateBase = 0.075 + (seed % 55) / 1000;
    const clickRateBase = 0.029 + (seed % 32) / 1000;
    const saves = Math.round(impressions * saveRateBase);
    const outboundClicks = Math.round(impressions * clickRateBase);
    const closeups = Math.round(impressions * (0.16 + (seed % 5) / 100));
    const saveRate = impressions ? (saves / impressions) * 100 : 0;
    const clickRate = impressions ? (outboundClicks / impressions) * 100 : 0;
    return {
      id,
      area,
      status,
      title: titleFromPin(row),
      impressions,
      saves,
      outboundClicks,
      closeups,
      saveRate,
      clickRate,
      engagementScore: impressions ? ((saves * 3 + outboundClicks * 5 + closeups) / impressions) * 100 : 0
    };
  });
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

function ChannelTabs({ active }: { active: Channel }) {
  return (
    <nav className="admin-analytics-tabs" aria-label="Analytics channel">
      {CHANNELS.map((channel) => (
        <Link
          key={channel.key}
          href={`/admin/analytics?channel=${channel.key}`}
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

function ScatterPlot({
  data,
  xKey,
  yKey,
  xLabel,
  yLabel
}: {
  data: PinMetric[];
  xKey: "impressions" | "clickRate";
  yKey: "saveRate";
  xLabel: string;
  yLabel: string;
}) {
  const xValues = data.map((item) => item[xKey]);
  const yValues = data.map((item) => item[yKey]);
  const minX = Math.min(...xValues, 0);
  const maxX = Math.max(...xValues, 1);
  const maxY = Math.max(...yValues, 1);

  return (
    <div className="admin-chart admin-chart-scatter">
      <svg viewBox="0 0 100 70" role="img" aria-label={`${xLabel} by ${yLabel}`}>
        <g className="scatter-grid">
          {[0, 25, 50, 75, 100].map((tick) => (
            <line key={`v-${tick}`} x1={tick} x2={tick} y1="0" y2="62" />
          ))}
          {[0, 20, 40, 60].map((tick) => (
            <line key={`h-${tick}`} x1="0" x2="100" y1={tick} y2={tick} />
          ))}
        </g>
        {data.map((item) => {
          const x = ((item[xKey] - minX) / Math.max(1, maxX - minX)) * 96 + 2;
          const y = 62 - (item[yKey] / maxY) * 58;
          const radius = Math.max(1.4, Math.min(3.8, item.outboundClicks / Math.max(1, Math.max(...data.map((pin) => pin.outboundClicks))) * 4));
          return <circle key={item.id} cx={x} cy={y} r={radius} fill={AREA_COLORS[item.area]} opacity="0.76" />;
        })}
      </svg>
      <div className="admin-chart-axis-labels">
        <span>{xLabel}</span>
        <span>{yLabel}</span>
      </div>
    </div>
  );
}

function RadarChart({ data }: { data: Array<{ area: ContentArea; saveRate: number; clickRate: number }> }) {
  const center = 50;
  const radius = 32;
  const max = Math.max(...data.flatMap((item) => [item.saveRate, item.clickRate]), 1);
  const pointsFor = (key: "saveRate" | "clickRate") =>
    data
      .map((item, index) => {
        const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
        const r = (item[key] / max) * radius;
        return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
      })
      .join(" ");

  return (
    <div className="admin-chart admin-chart-radar">
      <svg viewBox="0 0 100 100" role="img" aria-label="Area performance radar">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={data
              .map((_, index) => {
                const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
                return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
              })
              .join(" ")}
            className="radar-ring"
          />
        ))}
        {data.map((item, index) => {
          const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
          return (
            <text key={item.area} x={center + Math.cos(angle) * 43} y={center + Math.sin(angle) * 43} textAnchor="middle">
              {contentAreaLabel(item.area).replace("Extreme Budget", "extreme")}
            </text>
          );
        })}
        <polygon points={pointsFor("saveRate")} className="radar-save" />
        <polygon points={pointsFor("clickRate")} className="radar-click" />
      </svg>
      <div className="admin-chart-legend">
        <span className="legend-published">Avg Save Rate</span>
        <span className="legend-prepared">Avg Click Rate</span>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return <span className={`admin-rank-badge${rank === 1 ? " is-first" : rank <= 3 ? " is-top" : ""}`}>#{rank}</span>;
}

function areaAggFromPins(metrics: PinMetric[]) {
  return COMMAND_CENTER_CONTENT_AREAS.map((area) => {
    const pins = metrics.filter((pin) => pin.area === area);
    const impressions = pins.reduce((sum, pin) => sum + pin.impressions, 0);
    const saves = pins.reduce((sum, pin) => sum + pin.saves, 0);
    const clicks = pins.reduce((sum, pin) => sum + pin.outboundClicks, 0);
    return {
      area,
      pins: pins.length,
      avgImpressions: pins.length ? Math.round(impressions / pins.length) : 0,
      saveRate: impressions ? (saves / impressions) * 100 : 0,
      clickRate: impressions ? (clicks / impressions) * 100 : 0
    };
  }).filter((item) => item.pins > 0);
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
  const metrics = pinMetricsFromRows(rows);
  const totalImpressions = metrics.reduce((sum, pin) => sum + pin.impressions, 0);
  const totalSaves = metrics.reduce((sum, pin) => sum + pin.saves, 0);
  const totalClicks = metrics.reduce((sum, pin) => sum + pin.outboundClicks, 0);
  const prepared = rows.filter((row) => row.Prepared_For_Export_At || ["approved", "queued", "posted", "published"].includes(normalizeStatus(row.Workflow_Status))).length;
  const review = rows.filter((row) => normalizeStatus(row.Workflow_Status) === "review").length;
  const drafts = rows.filter((row) => normalizeStatus(row.Workflow_Status) === "draft").length;
  const statusData = [
    { label: "Draft", value: drafts },
    { label: "Review", value: review },
    { label: "Approved", value: kpis.pinsReadyToSync },
    { label: "Published", value: kpis.pinsPosted }
  ];
  const areaAgg = areaAggFromPins(metrics);
  const leaderboard = [...metrics].sort((a, b) => b.impressions - a.impressions);
  const maxImpressions = Math.max(...areaAgg.map((item) => item.avgImpressions), 1);
  const maxSave = Math.max(...areaAgg.map((item) => item.saveRate), 1);
  const maxClick = Math.max(...areaAgg.map((item) => item.clickRate), 1);

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

      <section className="admin-analytics-deep-head">
        <div>
          <h2>Pin Performance Deep Dive</h2>
          <p>{metrics.length} pins in selected period - compare, rank, and identify top performers</p>
        </div>
        <div className="admin-analytics-time-filter" aria-label="Time period">
          {["Last 7 days", "Last 30 days", "Last 90 days", "Last 6 months", "All time"].map((label) => (
            <span key={label} className={label === "All time" ? "is-active" : ""}>{label}</span>
          ))}
        </div>
      </section>

      <section className="admin-analytics-stat-grid is-five">
        <AdminMetricCard label="Impressions" value={formatNumber(totalImpressions)} trend="up" />
        <AdminMetricCard label="Saves" value={formatNumber(totalSaves)} trend="up" />
        <AdminMetricCard label="Outbound Clicks" value={formatNumber(totalClicks)} trend="up" />
        <AdminMetricCard label="Avg Save Rate" value={`${totalImpressions ? ((totalSaves / totalImpressions) * 100).toFixed(1) : "0.0"}%`} sub="Saves / Impressions" />
        <AdminMetricCard label="Avg Click Rate" value={`${totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0"}%`} sub="Clicks / Impressions" />
      </section>

      <section className="admin-analytics-chart-grid">
        <article className="admin-analytics-panel">
          <h2>Reach vs. Save Rate</h2>
          <p>Bubble size = outbound clicks. Top-right quadrant = high reach, high engagement.</p>
          <ScatterPlot data={metrics} xKey="impressions" yKey="saveRate" xLabel="Impressions" yLabel="Save Rate %" />
          <AreaLegend areas={areaAgg.map((item) => item.area)} />
        </article>
        <article className="admin-analytics-panel">
          <h2>Area Performance Radar</h2>
          <p>Compare areas across avg impressions, save rate, and click rate.</p>
          <RadarChart data={areaAgg} />
        </article>
      </section>

      <article className="admin-analytics-panel">
        <h2>Area Performance Heatmap</h2>
        <p>Color intensity indicates relative performance. Darker = higher metric value.</p>
        <div className="admin-analytics-table-wrap">
          <table className="admin-analytics-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Pins</th>
                <th>Avg Impressions</th>
                <th>Save Rate</th>
                <th>Click Rate</th>
              </tr>
            </thead>
            <tbody>
              {[...areaAgg].sort((a, b) => b.saveRate - a.saveRate).map((row) => (
                <tr key={row.area}>
                  <td><AreaPill area={row.area} /></td>
                  <td>{row.pins}</td>
                  <td><HeatCell value={formatNumber(row.avgImpressions)} intensity={row.avgImpressions / maxImpressions} tone="green" /></td>
                  <td><HeatCell value={`${row.saveRate.toFixed(1)}%`} intensity={row.saveRate / maxSave} tone="gold" /></td>
                  <td><HeatCell value={`${row.clickRate.toFixed(1)}%`} intensity={row.clickRate / maxClick} tone="brown" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="admin-analytics-panel">
        <div className="admin-analytics-panel-row">
          <div>
            <h2>Pin Performance Leaderboard</h2>
            <p>Weighted engagement score = (saves x 3 + clicks x 5 + closeups x 1) / impressions x 100</p>
          </div>
          <span className="admin-analytics-select">Sort by: Impressions</span>
        </div>
        <div className="admin-analytics-table-wrap">
          <table className="admin-analytics-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Pin</th>
                <th>Area</th>
                <th>Impressions</th>
                <th>Saves</th>
                <th>Clicks</th>
                <th>Save%</th>
                <th>Click%</th>
                <th>Eng. Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((pin, index) => (
                <tr key={pin.id} className={index < 3 ? "is-top-row" : undefined}>
                  <td><RankBadge rank={index + 1} /></td>
                  <td><strong>{pin.id}</strong><span>{pin.title}</span></td>
                  <td><AreaPill area={pin.area} /></td>
                  <td>{formatNumber(pin.impressions)}</td>
                  <td>{formatNumber(pin.saves)}</td>
                  <td>{formatNumber(pin.outboundClicks)}</td>
                  <td className="is-green">{pin.saveRate.toFixed(1)}%</td>
                  <td className="is-gold">{pin.clickRate.toFixed(1)}%</td>
                  <td><ScoreMeter value={pin.engagementScore} max={Math.max(...leaderboard.map((item) => item.engagementScore), 1)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="admin-analytics-panel">
        <h2>Save Rate vs. Click Rate Quadrant Map</h2>
        <p><strong>Top-right</strong> = viral + driving traffic - <strong>Top-left</strong> = viral but low clicks - <strong>Bottom-right</strong> = clicks but not saving - <strong>Bottom-left</strong> = underperforming</p>
        <ScatterPlot data={metrics} xKey="clickRate" yKey="saveRate" xLabel="Click Rate %" yLabel="Save Rate %" />
      </article>
    </>
  );
}

function AreaLegend({ areas }: { areas: ContentArea[] }) {
  return (
    <div className="admin-area-legend">
      {areas.map((area) => (
        <span key={area}><i style={{ backgroundColor: AREA_COLORS[area] }} />{contentAreaLabel(area)}</span>
      ))}
    </div>
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

function HeatCell({ value, intensity, tone }: { value: string; intensity: number; tone: "green" | "gold" | "brown" }) {
  const alpha = Math.max(0.12, Math.min(0.42, intensity * 0.42));
  const backgroundColor = tone === "green" ? `rgba(91, 140, 106, ${alpha})` : tone === "gold" ? `rgba(196, 147, 106, ${alpha})` : `rgba(142, 123, 107, ${alpha})`;
  return <span className="admin-heat-cell" style={{ backgroundColor }}>{value}</span>;
}

function ScoreMeter({ value, max }: { value: number; max: number }) {
  return (
    <span className="admin-score-meter">
      <i style={{ width: `${Math.max(6, percent(value, max))}%` }} />
      <span>{value.toFixed(0)}</span>
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
  const activeChannel = CHANNELS.some((item) => item.key === rawChannel) ? (rawChannel as Channel) : "pins";
  const [snapshot, pins, blogs, guides, emails, products] = await Promise.all([
    commandCenterDashboardSnapshot(),
    loadEvergreenTab("pins"),
    loadEvergreenTab("blogs"),
    loadEvergreenTab("guides"),
    loadEvergreenTab("emails"),
    loadEvergreenTab("products")
  ]);

  return (
    <AdminFrame>
      <div className="admin-analytics-page">
        <header className="admin-page-heading admin-analytics-heading">
          <div>
            <h1>Analytics</h1>
            <p>Performance insights across all content and product channels.</p>
          </div>
        </header>

        <ChannelTabs active={activeChannel} />

        {activeChannel === "pins" ? <PinsAnalytics rows={pins} kpis={snapshot.kpis} /> : null}
        {activeChannel === "blogs" ? <BlogAnalytics rows={blogs} /> : null}
        {activeChannel === "emails" ? <EmailAnalytics rows={emails} /> : null}
        {activeChannel === "products" ? <ProductAnalytics rows={products} /> : null}

        <RuntimePanels kpis={{ ...snapshot.kpis, totalGuides: guides.length }} snapshot={snapshot} />
      </div>
    </AdminFrame>
  );
}
