import Link from "next/link";
import { SiteShell } from "../../../components/SiteShell";
import { pageMetadata } from "../../../lib/seo";

export const metadata = pageMetadata({
  title: "Affiliate Disclosure",
  description: "How Diyesu Decor identifies affiliate recommendations and may earn commissions from qualifying purchases.",
  path: "/legal/affiliate-disclosure"
});

export default function AffiliateDisclosurePage() {
  return (
    <SiteShell>
      <section className="legal-figma-hero">
        <div className="container">
          <h1>Affiliate Disclosure</h1>
        </div>
      </section>

      <div className="container legal-figma-body">
        <article className="legal-prose">
          <p>
            <strong>Last updated:</strong> March 1, 2026
          </p>
          <p>
            Diyesu Decor participates in affiliate marketing programs. This means that when we recommend products and
            you make a purchase through our links, we may earn a small commission at no additional cost to you.
          </p>

          <h2>Our Commitment</h2>
          <p>
            We only recommend products we believe fit the editorial context. Affiliate partnerships never override
            renter, budget, safety, or practicality considerations.
          </p>

          <h2>How Disclosures Appear</h2>
          <p>
            A global disclosure appears in the site footer, and page-level disclosures appear where affiliate links are
            present. Recommendations remain editorial and renter/budget aligned.
          </p>

          <h2>What This Means For You</h2>
          <p>
            The price to you does not increase because of an affiliate link. You should still compare products and choose
            what fits your space, lease terms, budget, and comfort level.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about partnerships or disclosures can be sent to{" "}
            <a href="mailto:support@diyesu.com">support@diyesu.com</a>. Related policies:{" "}
            <Link href="/legal/privacy">Privacy</Link> and <Link href="/legal/terms">Terms</Link>.
          </p>
        </article>
      </div>
    </SiteShell>
  );
}
