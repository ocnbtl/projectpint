import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { SiteShell } from "../../../components/SiteShell";
import { shouldShowAffiliateDisclosure } from "../../../lib/affiliate";

const products = {
  "renter-bathroom-upgrade-blueprint": {
    title: "Renter Bathroom Upgrade Blueprint",
    price: "$29",
    bullets: [
      "Choose-your-path: no-drill vs drill-allowed",
      "Budget tiers: under $75 / $150 / $300",
      "Style direction map: minimal / modern / maximal",
      "Order-of-operations checklist + templates"
    ],
    outboundLinks: [] as string[]
  },
  "bathroom-plant-picks-upgrade": {
    title: "Bathroom Plant Picks Expanded Upgrade",
    price: "$19",
    bullets: [
      "Expanded decision guide",
      "Placement maps for tiny bathrooms",
      "Care cheat-sheets",
      "Renter-safe mounting notes"
    ],
    outboundLinks: [] as string[]
  }
};

export function generateStaticParams() {
  return Object.keys(products).map((slug) => ({ slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products[slug as keyof typeof products];
  if (!product) return notFound();
  const showAffiliateDisclosure = shouldShowAffiliateDisclosure({ linkUrls: product.outboundLinks });

  return (
    <SiteShell>
      <div className="card">
        <h1>{product.title}</h1>
        <p>Price: {product.price}</p>
        <ul>
          {product.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <button>Join waitlist / checkout placeholder</button>
      </div>
      {showAffiliateDisclosure ? <AffiliateDisclosure /> : null}
    </SiteShell>
  );
}
