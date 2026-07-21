import { BlueprintTool } from "../../components/BlueprintTool";
import { SiteShell } from "../../components/SiteShell";
import { redesignImages } from "../../lib/redesign-data";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Bathroom Upgrade Blueprint",
  description: "Build a personalized bathroom upgrade plan around your budget, constraints, priorities, and style.",
  path: "/blueprint",
  image: redesignImages.warmEditorial
});

export default function BlueprintPage() {
  return (
    <SiteShell>
      <section className="tool-page-hero">
        <div className="container tool-page-hero-inner" data-reveal="hero">
          <h1>Your personalized bathroom transformation plan.</h1>
          <p>
            Tell us your budget, constraints, and priorities. Within 48 hours we&apos;ll build a complete upgrade plan
            tailored to your exact bathroom &mdash; we take the time to find the best products and plan for your
            situation.
          </p>
        </div>
      </section>
      <div className="container site-page tool-page-body blueprint-page-body" data-reveal>
        <BlueprintTool />
      </div>
    </SiteShell>
  );
}
