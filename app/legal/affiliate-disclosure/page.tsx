import Link from "next/link";
import { SiteShell } from "../../../components/SiteShell";

export default function AffiliateDisclosurePage() {
  return (
    <SiteShell>
      <div className="section-stack">
        <section className="panel">
          <h1>Affiliate Disclosure</h1>
          <p>
            Some links on this site are affiliate links. If you click and purchase, Diyesu Decor may earn a commission at
            no additional cost to you.
          </p>
          <p className="small">Last updated: February 28, 2026.</p>
        </section>

        <section className="grid grid-2">
          <article className="card">
            <h2>How disclosures appear</h2>
            <ul>
              <li>A global disclosure is shown in the site footer.</li>
              <li>Page-level disclosure blocks appear on pages with affiliate links.</li>
              <li>Recommendations remain editorial and renter/budget aligned.</li>
            </ul>
          </article>

          <article className="card">
            <h2>What this means for you</h2>
            <ul>
              <li>Price to you does not increase because of an affiliate link.</li>
              <li>You should still compare products and choose what fits your constraints.</li>
              <li>We avoid unsupported claims and keep guidance practical.</li>
            </ul>
          </article>
        </section>

        <section className="panel">
          <p>
            Questions about partnerships or disclosures can be sent to{" "}
            <a href="mailto:support@diyesu.com">support@diyesu.com</a>. Related policies:{" "}
            <Link href="/legal/privacy">Privacy</Link> and <Link href="/legal/terms">Terms</Link>.
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
