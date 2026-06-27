import Link from "next/link";
import { EmailSignupForm } from "../../components/EmailSignupForm";
import { SiteShell } from "../../components/SiteShell";

function AboutValueIcon({ name }: { name: "zap" | "user" | "heart" }) {
  const paths = {
    zap: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 21a7.5 7.5 0 0 1 15 0",
    heart: "M20.5 8.5c0 5-8.5 10-8.5 10s-8.5-5-8.5-10A4.6 4.6 0 0 1 12 5.8a4.6 4.6 0 0 1 8.5 2.7Z"
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export default function AboutPage() {
  const values = [
    ["Small Wins", "Big transformations start with one smart upgrade at a time.", "zap"],
    [
      "Real People",
      "We design for renters, beginners, DIYers, budget-first households, and anyone improving a bathroom they actually use.",
      "user"
    ],
    ["Step By Step", "Every recommendation is actionable, affordable, and crafted with care.", "heart"]
  ];
  const faqs = [
    [
      "What is Diyesu Decor?",
      "A practical bathroom upgrade brand for renters, small spaces, and budget-first households."
    ],
    [
      "Is everything renter-friendly?",
      <>
        Not everything, but renter-safe options come first. Start with the{" "}
        <Link href="/hub/renter" className="text-link">
          Renter Friendly
        </Link>{" "}
        area when deposits, tile, or drill limits matter.
      </>
    ],
    [
      "How budget-friendly is this?",
      <>
        Most recommendations start with the smallest useful improvement first. The{" "}
        <Link href="/hub/extreme-budget" className="text-link">
          Extreme Budget
        </Link>{" "}
        area keeps the lowest-cost ideas easy to find.
      </>
    ],
    ["What is the Blueprint?", "A guided plan that turns budget, space, focus area, and style into a bathroom upgrade brief."],
    ["Do you use affiliate links?", "Some pages may include affiliate links, and disclosures are shown when they apply."]
  ];

  return (
    <SiteShell>
      <section className="about-figma-hero">
        <div className="container about-figma-hero-inner">
          <h1>About Diyesu Decor</h1>
          <div className="about-callout">
            <span>Budget DIY Bathroom Upgrades</span>
            <strong>but with style</strong>
          </div>
          <p>We believe every bathroom can be better, and it shouldn&apos;t cost a fortune to prove it.</p>
          <p>
            That&apos;s why we share personalized bathroom improvements that are easy to follow and don&apos;t break
            the bank.
          </p>
        </div>
      </section>

      <div className="container site-page about-figma-page">
        <section className="about-value-grid" aria-label="Diyesu Decor values">
          {values.map(([title, copy, marker]) => (
            <article key={title} className="about-value-card">
              <span>
                <AboutValueIcon name={marker as "zap" | "user" | "heart"} />
              </span>
              <h2>{title}</h2>
              <p>{copy}</p>
            </article>
          ))}
        </section>

        <section className="about-faq-panel">
          <div className="about-section-head">
            <p className="eyebrow blog-eyebrow">FAQ</p>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="about-faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question as string} className="about-faq-item">
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="about-newsletter-dark">
          <div className="about-newsletter-copy">
            <span className="about-newsletter-icon" aria-hidden="true">
              M
            </span>
            <p className="eyebrow">Weekly Bathroom Ideas</p>
            <h2>One email, one idea, every Wednesday.</h2>
            <p>No spam. Just practical upgrades, renter-aware tips, and small-space ideas you can actually use.</p>
          </div>
          <div className="about-newsletter-form">
            <EmailSignupForm
              sourceUrl="/about"
              buttonLabel="Join"
              consentText="I agree to receive Diyesu Decor emails and understand I can unsubscribe anytime."
              showContentAreaChecklist={false}
              defaultContentAreas={["Plants", "Storage", "Renter"]}
            />
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
