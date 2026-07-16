import Link from "next/link";
import { SiteShell } from "../../../components/SiteShell";
import { pageMetadata } from "../../../lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: "The terms that govern access to and use of Diyesu Decor content, recommendations, and services.",
  path: "/legal/terms"
});

export default function TermsPage() {
  return (
    <SiteShell>
      <section className="legal-figma-hero">
        <div className="container">
          <h1>Terms of Use</h1>
        </div>
      </section>

      <div className="container legal-figma-body">
        <article className="legal-prose">
          <p>
            <strong>Last updated:</strong> March 1, 2026
          </p>
          <p>Welcome to Diyesu Decor. By accessing and using our website, you agree to these terms and conditions.</p>

          <h2>Use of Content</h2>
          <p>
            Diyesu Decor content is educational and informational. It is not legal, financial, contractor, or licensed
            professional advice. Use recommendations at your own discretion and risk.
          </p>

          <h2>Product Recommendations</h2>
          <p>
            We may recommend products from third-party retailers. Prices and availability are subject to change. Always
            verify current pricing, lease requirements, local building codes, and product compatibility before
            purchasing or installing.
          </p>

          <h2>Service Expectations</h2>
          <p>
            Content, products, lead magnets, external links, and third-party services may change over time and are not
            guaranteed to remain available.
          </p>

          <h2>Intellectual Property</h2>
          <p>All content, design, and branding on Diyesu Decor is owned by us and protected by applicable laws.</p>

          <h2>Questions</h2>
          <p>
            If you have policy questions, contact <a href="mailto:support@diyesu.com">support@diyesu.com</a>. Also see
            the <Link href="/legal/privacy">Privacy Policy</Link> and{" "}
            <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>.
          </p>
        </article>
      </div>
    </SiteShell>
  );
}
