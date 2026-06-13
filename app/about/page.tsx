import { EmailSignupForm } from "../../components/EmailSignupForm";
import { SiteShell } from "../../components/SiteShell";

export default function AboutPage() {
  const values = [
    ["Budget first", "Every recommendation starts with realistic spending lanes."],
    ["Renter aware", "No-drill and removable options are prioritized before permanent changes."],
    ["Human reviewed", "Public content and exports stay gated by operator review."]
  ];
  const faqs = [
    ["What is Diyesu Decor?", "A practical bathroom upgrade brand for renters, small spaces, and budget-first households."],
    ["Is everything renter-friendly?", "Renter-safe options come first, with drill-allowed alternatives only where useful."],
    ["What is the Blueprint?", "A guided plan that turns budget, space, focus area, and style into a bathroom upgrade brief."],
    ["Do you use affiliate links?", "Some pages may include affiliate links, and disclosures are shown when they apply."]
  ];

  return (
    <SiteShell>
      <div className="container site-page">
        <section className="soft-hero">
          <p className="eyebrow blog-eyebrow">About Diyesu Decor</p>
          <h1>Bathroom upgrades for real renters, small rooms, and practical budgets.</h1>
          <p>
            Diyesu Decor starts with daily routines, then layers storage, lighting, plants, mirror placement, shower
            details, and style.
          </p>
        </section>

        <section className="dd-section">
          <div className="grid grid-3">
            {values.map(([title, copy]) => (
              <article key={title} className="step-card">
                <h2>{title}</h2>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dd-section">
          <div className="dd-section-head">
            <div>
              <p className="eyebrow blog-eyebrow">FAQ</p>
              <h2>Frequently asked questions</h2>
            </div>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question} className="faq-item">
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="newsletter-band">
          <div>
            <p className="eyebrow blog-eyebrow">Stay in the Loop</p>
            <h2>Get weekly bathroom ideas with clear next steps.</h2>
          </div>
          <EmailSignupForm
            sourceUrl="/about"
            buttonLabel="Subscribe"
            consentText="I agree to receive Diyesu Decor emails and understand I can unsubscribe anytime."
          />
        </section>
      </div>
    </SiteShell>
  );
}
