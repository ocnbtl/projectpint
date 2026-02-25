import Link from "next/link";
import { SiteShell } from "../../components/SiteShell";
import { hubs } from "../../lib/site-data";

export default function HubIndexPage() {
  return (
    <SiteShell>
      <div className="card">
        <h1>Pillar Hubs</h1>
        <p>Six core content pillars with curated destinations.</p>
        <ul>
          {hubs.map((hub) => (
            <li key={hub.slug}>
              <Link href={`/hub/${hub.slug}`}>{hub.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </SiteShell>
  );
}
