import { BlueprintTool } from "../../components/BlueprintTool";
import { SiteShell } from "../../components/SiteShell";

export default function BlueprintPage() {
  return (
    <SiteShell>
      <section className="tool-page-hero">
        <div className="container tool-page-hero-inner">
          <h1>Your personalized bathroom transformation plan.</h1>
          <p>
            Tell us your budget, constraints, and priorities. Within 48 hours we&apos;ll build a complete upgrade plan
            tailored to your exact bathroom &mdash; we take the time to find the best products and plan for your
            situation.
          </p>
        </div>
      </section>
      <div className="container site-page tool-page-body blueprint-page-body">
        <BlueprintTool />
      </div>
    </SiteShell>
  );
}
