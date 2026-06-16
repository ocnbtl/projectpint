import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { BlueprintTool } from "../../../components/BlueprintTool";
import { SiteShell } from "../../../components/SiteShell";
import { shouldShowAffiliateDisclosure } from "../../../lib/affiliate";

const products = {
  "renter-bathroom-upgrade-blueprint": {
    title: "Bathroom Upgrade Blueprint",
    subtitle: "for renters",
    price: "$29",
    summary: "Personalized bathroom recommendations for your budget.",
    bullets: [
      "Choose-your-path planner for renter-safe upgrades",
      "Budget options: under $75, under $150, and under $300",
      "Mirror, lighting, storage, plants, and style recommendations",
      "Step-by-step checklists that prioritize quick wins first"
    ],
    outboundLinks: [] as string[]
  },
  "bathroom-plant-picks-upgrade": {
    title: "Bathroom Plant Picks Expanded Upgrade",
    subtitle: "",
    price: "$19",
    summary: "Deeper plant recommendations for humid bathrooms and low light corners.",
    bullets: ["Expanded decision guide", "Placement maps for tiny bathrooms", "Care cheat-sheets", "Renter-safe mounting notes"],
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
  const isBlueprint = slug === "renter-bathroom-upgrade-blueprint";

  return (
    <SiteShell>
      <section className={isBlueprint ? "product-offer-hero product-offer-hero-blueprint" : "product-offer-hero"}>
        <div className="container product-offer-hero-inner">
          <p className="product-offer-kicker">{isBlueprint ? "Personalized Plan" : "Expanded Upgrade"}</p>
          <h1>
            {product.title}
            {product.subtitle ? <span>{product.subtitle}</span> : null}
          </h1>
          <p>{product.summary}</p>
          <div className="product-offer-price-row">
            <strong>Starting at {product.price}</strong>
            <em>{isBlueprint ? "Delivered as a custom bathroom brief" : "Built for plant-forward bathrooms"}</em>
          </div>
        </div>
      </section>

      <div className="container site-page product-offer-page">
        <section className="product-offer-grid" aria-label={`${product.title} includes`}>
          {product.bullets.map((bullet, index) => (
            <article key={bullet} className="product-offer-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{bullet}</p>
            </article>
          ))}
        </section>

        {isBlueprint ? (
          <BlueprintTool />
        ) : (
          <section className="product-offer-cta">
            <h2>Want the quick version first?</h2>
            <p>Use the free Plant Picker to get matched before deciding whether you need the expanded upgrade.</p>
            <a className="btn btn-accent" href="/plant-picker">
              Open Plant Picker
            </a>
          </section>
        )}
      </div>
      {showAffiliateDisclosure ? <AffiliateDisclosure /> : null}
    </SiteShell>
  );
}
