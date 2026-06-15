import { PlantPickerTool } from "../../components/PlantPickerTool";
import { SiteShell } from "../../components/SiteShell";

export default function PlantPickerPage() {
  return (
    <SiteShell>
      <section className="tool-page-hero tool-page-hero-green">
        <div className="container tool-page-hero-inner">
          <p className="tool-badge">Free Tool</p>
          <h1>Find your perfect bathroom plant</h1>
          <p>Answer 3 quick questions about your bathroom, and we&apos;ll match you with plants that will thrive in your space.</p>
        </div>
      </section>
      <div className="container site-page tool-page-body">
        <PlantPickerTool />
      </div>
    </SiteShell>
  );
}
