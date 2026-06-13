import { PlantPickerTool } from "../../components/PlantPickerTool";
import { SiteShell } from "../../components/SiteShell";
import { redesignImages } from "../../lib/redesign-data";

export default function PlantPickerPage() {
  return (
    <SiteShell>
      <section className="article-hero" style={{ backgroundImage: `url(${redesignImages.plants})` }}>
        <div className="article-hero-shade">
          <div className="container article-hero-copy">
            <p className="eyebrow">Free Plant Picker</p>
            <h1>Find plants that match your actual bathroom.</h1>
            <p>Choose light, humidity, and available space. Get practical plant matches and placement notes.</p>
          </div>
        </div>
      </section>
      <div className="container site-page">
        <PlantPickerTool />
      </div>
    </SiteShell>
  );
}
