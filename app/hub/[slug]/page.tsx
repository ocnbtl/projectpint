import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/SiteShell";
import { hubs } from "../../../lib/site-data";

export function generateStaticParams() {
  return hubs.map((hub) => ({ slug: hub.slug }));
}

export default async function HubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = hubs.find((h) => h.slug === slug);
  if (!hub) return notFound();

  return (
    <SiteShell>
      <div className="card">
        <h1>{hub.title}</h1>
        <p>{hub.description}</p>
        <p>
          Lead magnet CTA: <Link href="/lead-magnets/plant-picker">Get the Plant Picker</Link>
        </p>
        <ul>
          <li><Link href="/start-here">Start Here</Link></li>
          <li><Link href="/blog">Related blog posts</Link></li>
          <li><Link href="/products/renter-bathroom-upgrade-blueprint">Blueprint product page</Link></li>
        </ul>
      </div>
    </SiteShell>
  );
}
