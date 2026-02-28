import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { SiteShell } from "../../../components/SiteShell";
import { shouldShowAffiliateDisclosure } from "../../../lib/affiliate";

const products = {
  "renter-bathroom-upgrade-blueprint": {
    title: "Bathroomn Upgrade Blueprint",
    subtitle: "(for renters)",
    price: "$29",
    summary: "Personalized bathroom recommendations for your budget.",
    bullets: [
      "Choose-your-path planner for renter-safe upgrades",
      "Budget options: under $75 / $150 / $300",
      "Mirror, lighting, and color recommendations by aesthetic",
      "Step-by-step checklists that prioritize quick wins first"
    ],
    ctaLabel: "Join blueprint waitlist",
    ctaNote: "Early access includes launch pricing and bonus templates.",
    outboundLinks: [] as string[]
  },
  "bathroom-plant-picks-upgrade": {
    title: "Bathroom Plant Picks Expanded Upgrade",
    subtitle: "",
    price: "$19",
    summary: "Deeper plant recommendations for humid bathrooms and low light corners.",
    bullets: [
      "Expanded decision guide",
      "Placement maps for tiny bathrooms",
      "Care cheat-sheets",
      "Renter-safe mounting notes"
    ],
    ctaLabel: "Join plant upgrade waitlist",
    ctaNote: "Get updates when new plant recommendations are published.",
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
      <div className="section-stack">
        <section className="panel product-hero">
          <h1>
            {product.title}{" "}
            {product.subtitle ? <strong className="promo-subtitle product-subtitle">{product.subtitle}</strong> : null}
          </h1>
          <p className="product-price">Starting at {product.price}</p>
          <p>{product.summary}</p>
          <button className="btn btn-accent" type="button">
            {product.ctaLabel}
          </button>
          <p className="small">{product.ctaNote}</p>
        </section>

        <section className="grid grid-2 product-grid">
          {product.bullets.map((bullet) => (
            <article key={bullet} className="card card-soft">
              <p>{bullet}</p>
            </article>
          ))}
        </section>
      </div>
      {showAffiliateDisclosure ? <AffiliateDisclosure /> : null}
    </SiteShell>
  );
}
