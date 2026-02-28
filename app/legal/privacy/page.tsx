import Link from "next/link";
import { SiteShell } from "../../../components/SiteShell";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <div className="section-stack">
        <section className="panel">
          <h1>Privacy Policy</h1>
          <p>
            Diyesu Decor collects only the information needed to deliver email updates, improve content quality, and
            evaluate product fit for renter-safe bathroom upgrades.
          </p>
          <p className="small">Last updated: February 28, 2026.</p>
        </section>

        <section className="grid grid-2">
          <article className="card">
            <h2>What we collect</h2>
            <ul>
              <li>Email address submitted through signup forms.</li>
              <li>Optional preference fields (for example plant light/humidity/space constraints).</li>
              <li>Basic interaction analytics such as page path and CTA engagement.</li>
            </ul>
          </article>

          <article className="card">
            <h2>How we use it</h2>
            <ul>
              <li>Send requested email content and follow-up sequences.</li>
              <li>Log leads in internal records for campaign operations.</li>
              <li>Measure which educational content and offers perform best.</li>
            </ul>
          </article>
        </section>

        <section className="panel">
          <h2>Data processors and retention</h2>
          <p>
            Depending on configuration, signup data may be processed through Klaviyo and stored in Google Sheets for
            operations tracking. We retain data only as long as needed for legitimate business and legal purposes.
          </p>
          <p>
            We do not sell personal information. You can unsubscribe at any time from email messages. For questions,
            contact <a href="mailto:support@diyesu.com">support@diyesu.com</a>.
          </p>
          <p className="small">
            Related policies: <Link href="/legal/terms">Terms of Use</Link> and{" "}
            <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>.
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
