import { BlueprintTool } from "../../components/BlueprintTool";
import { SiteShell } from "../../components/SiteShell";
import { redesignImages } from "../../lib/redesign-data";

export default function BlueprintPage() {
  return (
    <SiteShell>
      <section className="article-hero" style={{ backgroundImage: `url(${redesignImages.hero})` }}>
        <div className="article-hero-shade">
          <div className="container article-hero-copy">
            <p className="eyebrow">Blueprint</p>
            <h1>Bathroom Upgrade Blueprint</h1>
            <p>Answer a few questions and turn the visual direction into a renter-aware upgrade plan.</p>
            <p className="product-price">Starting at $29</p>
          </div>
        </div>
      </section>
      <div className="container site-page">
        <BlueprintTool />
      </div>
    </SiteShell>
  );
}
