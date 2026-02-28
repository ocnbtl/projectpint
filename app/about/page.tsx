import { SiteShell } from "../../components/SiteShell";

export default function AboutPage() {
  const faqs = [
    {
      question: "What is Diyesu Decor?",
      answer:
        "Diyesu Decor is a practical bathroom upgrade brand focused on renters, small spaces, and budget-first households."
    },
    {
      question: "Who are Diyesu Decor bathroom guides for?",
      answer:
        "Our guides are for renters, DIY beginners, busy parents, and anyone who wants bathroom improvements without a full renovation."
    },
    {
      question: "Do I need to drill into walls for these upgrades?",
      answer:
        "Most recommendations start with renter-safe and no-drill options first, then include drill-allowed alternatives where helpful."
    },
    {
      question: "How much do your bathroom upgrade plans cost?",
      answer:
        "Many upgrades are grouped into practical budget lanes, including under $75, under $150, and under $300 options."
    },
    {
      question: "Do you share bathroom ideas for families with kids?",
      answer:
        "Yes. We include organization strategies and product recommendations for kid-focused bathroom routines and storage."
    },
    {
      question: "Can your recommendations work in low light bathrooms?",
      answer:
        "Yes. We cover lighting, mirror, color, and bathroom plant recommendations for low light and humid spaces."
    },
    {
      question: "How often do you send bathroom tips by email?",
      answer:
        "Subscribers get weekly bathroom inspiration and upgrade plans with clear steps and customer-friendly product suggestions."
    },
    {
      question: "Do you use affiliate links?",
      answer:
        "Some pages may include affiliate links. When they do, disclosures are clearly shown so you can make informed decisions."
    }
  ];

  return (
    <SiteShell>
      <div className="section-stack">
        <section className="panel about-panel">
          <div className="about-headline-row">
            <span className="brand-mark about-mark" aria-hidden="true" />
            <h1>About Diyesu Decor</h1>
            <p className="about-tagline about-tagline-right">DIY Bathroom Upgrades</p>
          </div>
          <p>
            We share personalized and practical bathroom improvements for renters, DIY enthusiasts, and budget-first
            households.
          </p>

          <p>Our goal is simple: help you finish real upgrades with less guesswork and less wasted spend.</p>
        </section>

        <section className="panel">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.question} className="faq-item">
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
