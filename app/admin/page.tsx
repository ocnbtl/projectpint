import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

function readTab(tab: string): Record<string, unknown>[] {
  const p = path.join(process.cwd(), "data", "sheets", `${tab}.json`);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, unknown>[];
}

const tabs = [
  "Content_Pins",
  "Blog_Posts",
  "URL_Inventory",
  "Assets",
  "Experiments",
  "Metrics_Weekly",
  "Leads",
  "Products",
  "Product_Ideas",
  "Governance"
] as const;

export default function AdminPage() {
  const pins = readTab("Content_Pins");
  const urls = readTab("URL_Inventory");
  const governance = readTab("Governance");
  const publishedUrls = urls.filter((u) => u.Status === "published");

  return (
    <main className="container">
      <div className="card">
        <h1>Project Pint Admin Dashboard (V2 Scaffold)</h1>
        <p>Public brand: Ranosa Decor (DIY Bathroom Upgrades).</p>
        <p>Assisted mode active: human approval required for publish and pin export.</p>
        <p>
          API endpoints: <code>/api/admin/sheets/[tab]</code> (GET/POST, authenticated).
        </p>
        <p>
          <Link href="/review_pack.html">Open review pack artifact</Link>
        </p>
      </div>

      <div className="grid grid-3" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Strategy & Governance</h3>
          <p>Entries: {governance.length}</p>
          <p>Tracks content bible versions and decision log.</p>
        </div>
        <div className="card">
          <h3>Schedule Planner</h3>
          <p>Pins in queue: {pins.length}</p>
          <p>Published URLs: {publishedUrls.length}</p>
          <p>Enforced: published-only + 24h URL cooldown + daily intent mix flags.</p>
        </div>
        <div className="card">
          <h3>Exports</h3>
          <p>Manual post pack + Pinterest bulk CSV + weekly packet supported via CLI.</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Filters and Controls (Scaffold)</h2>
        <p>Pillar | Status | Destination type | Hook class | Destination intent | Quality score | Winners</p>
        <p>Batch generator targets: pins, blogs, product opportunities.</p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Pin Preview (first 10)</h2>
        <table>
          <thead>
            <tr>
              <th>Content ID</th>
              <th>Hook</th>
              <th>Intent</th>
              <th>Destination</th>
              <th>Quality</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pins.slice(0, 10).map((pin) => (
              <tr key={String(pin.Content_ID)}>
                <td>{String(pin.Content_ID)}</td>
                <td>{String(pin.Hook_Class)}</td>
                <td>{String(pin.Destination_Intent)}</td>
                <td>{String(pin.Destination_URL)}</td>
                <td>{String(pin.Quality_Score)}</td>
                <td>{String(pin.Status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Tabs</h2>
        <ul>
          {tabs.map((tab) => (
            <li key={tab}>{tab}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
