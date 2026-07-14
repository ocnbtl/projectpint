import { PlantPickerTool } from "../../components/PlantPickerTool";
import { SiteShell } from "../../components/SiteShell";

export default function PlantPickerPage() {
  return (
    <SiteShell>
      <section className="tool-page-hero tool-page-hero-green">
        <div className="container tool-page-hero-inner">
          <p className="tool-badge">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15 5 19 2 19 2c1 9-2.5 15-8 18Z" />
              <path d="M9.8 14.2c2.1-2.5 4.4-4.5 7.2-6" />
            </svg>
            Free Tool
          </p>
          <h1>Find your perfect bathroom plant</h1>
          <p>Answer 3 quick questions about your bathroom, and we&apos;ll match you with plants that will thrive in your space.</p>
        </div>
      </section>
      <div className="container site-page tool-page-body plant-picker-page-body">
        <PlantPickerTool />
      </div>
    </SiteShell>
  );
}
