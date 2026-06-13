import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { BlueprintTool } from "../../../components/BlueprintTool";
import { SiteShell } from "../../../components/SiteShell";
import { shouldShowAffiliateDisclosure } from "../../../lib/affiliate";
import { redesignImages } from "../../../lib/redesign-data";

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
      <section className="article-hero" style={{ backgroundImage: `url(${redesignImages.hero})` }}>
        <div className="article-hero-shade">
          <div className="container article-hero-copy">
            <p className="eyebrow">Blueprint</p>
            <h1>{product.title}</h1>
            <p>{product.summary}</p>
            <p className="product-price">Starting at {product.price}</p>
          </div>
        </div>
      </section>

      <div className="container site-page">
        {isBlueprint ? (
          <BlueprintTool />
        ) : (
          <section className="dd-section">
            <div className="grid grid-2 product-grid">
              {product.bullets.map((bullet) => (
                <article key={bullet} className="card card-soft">
                  <p>{bullet}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
      {showAffiliateDisclosure ? <AffiliateDisclosure /> : null}
    </SiteShell>
  );
}
