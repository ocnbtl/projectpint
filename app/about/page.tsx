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
      "We design for renters, beginners, DIYers, budget-first households, and anyone looking to improve their bathroom.",
      "user"
    ],
    ["Step By Step", "Every recommendation is actionable, affordable, and crafted with care.", "heart"]
  ];
  const faqs = [
    [
      "What is Diyesu Decor?",
      "Diyesu Decor is a resource for bathroom upgrades on a budget. We help renters, DIYers, beginners, and homeowners make their bathrooms look and feel better without a complete renovation."
    ],
    [
      "Is the Plant Picker really free?",
      "Yes! Our Plant Picker is completely free. Just tell us about your bathroom's light and humidity, and we'll recommend the perfect plants for your situation."
    ],
    [
      "How often do you publish new content?",
      "We publish 2-3 new articles per week across multiple content areas, plus social posts and one curated Wednesday email."
    ],
    [
      "Is everything renter-friendly?",
      <>
        Not everything, but we always label renter-safe options clearly. Our{" "}
        <Link href="/areas/renter" className="text-link">
          Renter Friendly
        </Link>{" "}
          area is specifically curated for damage-free upgrades.
      </>
    ],
    [
      "How much do bathroom upgrades usually cost?",
      <>
        Most recommendations are under $50, and many are under $25. Our{" "}
        <Link href="/areas/extreme-budget" className="text-link">
          Extreme Budget
        </Link>{" "}
          area focuses on upgrades under $10-25. Comprehensive upgrades can range from $100-300.
      </>
    ],
    [
      "What is the Blueprint?",
      "It's our premium planning service. Answer a few quick questions about your budget, space, priorities, and preferred visual style, and within 48 hours we'll deliver a personalized bathroom upgrade plan with product links and step-by-step guides."
    ]
  ];

  return (
    <SiteShell>
      <section className="about-figma-hero">
        <div className="container about-figma-hero-inner">
          <h1>About Diyesu Decor</h1>
          <div className="about-callout">
            <span>Budget DIY Bathroom Upgrades</span>
            <strong>
              , but with <em>style</em>
            </strong>
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

      </div>

      <section className="about-newsletter-dark">
        <div className="container about-newsletter-inner">
          <div className="about-newsletter-copy">
            <span className="about-newsletter-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 6h16v12H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </span>
            <h2>Weekly Bathroom Ideas</h2>
            <p>One email, one idea, every Wednesday</p>
          </div>
          <div className="about-newsletter-form">
            <EmailSignupForm
              sourceUrl="/about"
              buttonLabel="Join"
              consentText="I agree to receive Diyesu Decor emails and understand I can unsubscribe anytime."
              showContentAreaChecklist={false}
              defaultContentAreas={["Plants", "Storage", "Renter"]}
              emailPlaceholder="you@email.com"
            />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
