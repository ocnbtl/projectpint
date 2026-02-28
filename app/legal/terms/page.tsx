import Link from "next/link";
import { SiteShell } from "../../../components/SiteShell";

export default function TermsPage() {
  return (
    <SiteShell>
      <div className="section-stack">
        <section className="panel">
          <h1>Terms of Use</h1>
          <p>
            Diyesu Decor content is educational and informational. It is not legal, financial, contractor, or licensed
            professional advice.
          </p>
          <p className="small">Last updated: February 28, 2026.</p>
        </section>

        <section className="grid grid-2">
          <article className="card">
            <h2>Use of content</h2>
            <ul>
              <li>Use recommendations at your own discretion and risk.</li>
              <li>Always follow local building codes, lease terms, and product instructions.</li>
              <li>Verify compatibility before purchasing tools, materials, or fixtures.</li>
            </ul>
          </article>

          <article className="card">
            <h2>Service expectations</h2>
            <ul>
              <li>Content, products, and lead magnets may change over time.</li>
              <li>Availability of external links and third-party services is not guaranteed.</li>
              <li>Some pages may include affiliate links with clear disclosure.</li>
            </ul>
          </article>
        </section>

        <section className="panel">
          <h2>Questions</h2>
          <p>
            If you have policy questions, contact <a href="mailto:support@diyesu.com">support@diyesu.com</a>. Also see
            the <Link href="/legal/privacy">Privacy Policy</Link> and{" "}
            <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>.
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
