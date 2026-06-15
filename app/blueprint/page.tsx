import { BlueprintTool } from "../../components/BlueprintTool";
import { SiteShell } from "../../components/SiteShell";

export default function BlueprintPage() {
  return (
    <SiteShell>
      <section className="tool-page-hero">
        <div className="container tool-page-hero-inner">
          <h1>Your personalized bathroom transformation plan.</h1>
          <p>
            Tell us your budget, constraints, and priorities. We&apos;ll shape a complete upgrade brief tailored to your exact
            bathroom.
          </p>
        </div>
      </section>
      <div className="container site-page tool-page-body">
        <BlueprintTool />
      </div>
    </SiteShell>
  );
}
