"use client";

import { useMemo, useState } from "react";
import { inspirationStyles } from "../lib/redesign-data";
import { ConsentNote } from "./ConsentNote";

type BlueprintStep = 0 | 1 | 2 | 3 | 4 | 5;

type Choice = {
  id: string;
  label: string;
  description?: string;
  icon: string;
  area?: string;
};

const progressSteps = ["Budget", "Type", "Focus", "Size", "Style", "Get Plan"];

const budgetTiers: Choice[] = [
  { id: "Under $75", label: "Under $75", description: "Quick wins with maximum impact", icon: "dollar" },
  { id: "Under $150", label: "Under $150", description: "A complete room refresh", icon: "dollar" },
  { id: "Under $300", label: "Under $300", description: "Full transformation plan", icon: "dollar" }
];

const bathroomTypes: Choice[] = [
  { id: "Rental", label: "Rental", description: "Damage-free recommendations only", icon: "key", area: "Renter" },
  { id: "Owned", label: "Owned Home", description: "Permanent and removable upgrades", icon: "home" }
];

const focusAreas: Choice[] = [
  { id: "Storage", label: "Storage & Organization", icon: "box", area: "Storage" },
  { id: "Lighting", label: "Lighting & Ambiance", icon: "sun", area: "Lighting" },
  { id: "Shower", label: "Shower Upgrade", icon: "drop", area: "Shower" },
  { id: "Style", label: "Style & Decor", icon: "paint", area: "DIY" },
  { id: "Plants", label: "Greenery & Plants", icon: "leaf", area: "Plants" },
  { id: "Mirror", label: "Mirror & Sink", icon: "circle", area: "Mirror" }
];

const bathroomSizes: Choice[] = [
  { id: "Small", label: "Small (under 40 sq ft)", icon: "square" },
  { id: "Medium", label: "Medium (40-70 sq ft)", icon: "expand" },
  { id: "Large", label: "Large (70+ sq ft)", icon: "home" }
];

const includedFeatures = [
  "Personalized product recommendations with exact links",
  "Step-by-step installation notes",
  "Recommended placement guides and room layout priorities",
  "Itemized budget breakdown with lower-cost alternatives",
  "Colors and styles that match your aesthetic",
  "A reasonable timeline for the work"
];

function MiniIcon({ name }: { name: string }) {
  switch (name) {
    case "dollar":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v16" />
          <path d="M16.2 7.2c-.9-.8-2.2-1.2-3.8-1.2-2.2 0-3.7 1-3.7 2.6 0 4 7.6 1.9 7.6 6.1 0 1.8-1.7 3-4.1 3-1.9 0-3.4-.5-4.5-1.6" />
        </svg>
      );
    case "key":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="8.2" cy="14.8" r="3.2" />
          <path d="m10.5 12.5 7.2-7.2 2 2-1.6 1.6 1.4 1.4-1.8 1.8-1.4-1.4-3.5 3.5" />
        </svg>
      );
    case "home":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 11.2 12 5l7.5 6.2" />
          <path d="M6.5 10.2V19h11v-8.8" />
          <path d="M10 19v-5h4v5" />
        </svg>
      );
    case "box":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 8.5 12 5l7 3.5v7L12 19l-7-3.5v-7Z" />
          <path d="m5.5 8.8 6.5 3.3 6.5-3.3" />
          <path d="M12 12.1V19" />
        </svg>
      );
    case "sun":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3.8" />
          <path d="M12 3.5v2.1M12 18.4v2.1M3.5 12h2.1M18.4 12h2.1M6 6l1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M7.5 16.5 6 18" />
        </svg>
      );
    case "drop":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.8c3.6 4.1 5.4 7.2 5.4 9.4a5.4 5.4 0 0 1-10.8 0c0-2.2 1.8-5.3 5.4-9.4Z" />
        </svg>
      );
    case "paint":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 19.5h14" />
          <path d="M8 16.5 17.5 7a2.1 2.1 0 0 0-3-3L5 13.5v3h3Z" />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 19c7.5-.2 12.1-4 13.7-11.4l.4-2-2 .2C9.7 6.4 5.8 10.6 5 19Z" />
          <path d="M6.4 17.6c2.9-3.9 6.3-6.4 10.2-7.5" />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="7" />
        </svg>
      );
    case "square":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 7h10v10H7z" />
        </svg>
      );
    case "expand":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" />
          <path d="M4 4l6 6M20 4l-6 6M4 20l6-6M20 20l-6-6" />
        </svg>
      );
    case "sparkles":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" />
          <path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
  }
}

function ProgressSteps({ step }: { step: BlueprintStep }) {
  return (
    <div className="quiz-progress blueprint-progress" aria-label="Blueprint progress">
      {progressSteps.map((label, index) => (
        <div key={label} className="quiz-progress-item">
          <span className={index <= step ? "is-active" : ""}>{index < step ? "✓" : index + 1}</span>
          <strong className={index <= step ? "is-active" : ""}>{label}</strong>
          {index < progressSteps.length - 1 ? <i className={index < step ? "is-active" : ""} /> : null}
        </div>
      ))}
    </div>
  );
}

function ChoiceCard({
  choice,
  selected,
  onClick,
  compact = false
}: {
  choice: Choice;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button type="button" className={selected ? "quiz-option-card is-selected" : "quiz-option-card"} onClick={onClick}>
      <span className="quiz-option-icon">
        <MiniIcon name={choice.icon} />
      </span>
      <span className="quiz-option-copy">
        <strong>{choice.label}</strong>
        {!compact && choice.description ? <span>{choice.description}</span> : null}
      </span>
      {selected ? <em aria-hidden="true">✓</em> : null}
    </button>
  );
}

export function BlueprintTool() {
  const [step, setStep] = useState<BlueprintStep>(0);
  const [budget, setBudget] = useState("");
  const [bathroomType, setBathroomType] = useState("");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [size, setSize] = useState("");
  const [styles, setStyles] = useState<string[]>([]);

  const selectedContentAreas = useMemo(() => {
    const areas = new Set<string>();
    selectedFocus.forEach((id) => {
      const area = focusAreas.find((item) => item.id === id)?.area;
      if (area) areas.add(area);
    });
    if (bathroomType === "Rental") areas.add("Renter");
    if (areas.size === 0) areas.add("DIY");
    return Array.from(areas);
  }, [bathroomType, selectedFocus]);

  const selectedLabels = useMemo(
    () => [
      budget,
      bathroomType,
      ...selectedFocus,
      size,
      ...styles.map((slug) => inspirationStyles.find((style) => style.slug === slug)?.name ?? slug)
    ].filter(Boolean),
    [bathroomType, budget, selectedFocus, size, styles]
  );

  const canProceed =
    (step === 0 && budget) ||
    (step === 1 && bathroomType) ||
    (step === 2 && selectedFocus.length > 0) ||
    (step === 3 && size) ||
    (step === 4 && styles.length > 0);

  const toggleFocus = (id: string) => {
    setSelectedFocus((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleStyle = (slug: string) => {
    setStyles((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  };

  return (
    <section className="tool-quiz-shell blueprint-quiz-shell">
      <ProgressSteps step={step} />

      <div className="tool-quiz-card">
        {step === 0 ? (
          <div className="tool-quiz-step">
            <h2>What&apos;s your upgrade budget?</h2>
            <p>We&apos;ll tailor every recommendation to fit your budget exactly.</p>
            <div className="quiz-option-stack">
              {budgetTiers.map((tier) => (
                <ChoiceCard key={tier.id} choice={tier} selected={budget === tier.id} onClick={() => setBudget(tier.id)} />
              ))}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="tool-quiz-step">
            <h2>Is this a rental or owned home?</h2>
            <p>Renters get only non-permanent, damage-free recommendations.</p>
            <div className="quiz-option-grid quiz-option-grid-two">
              {bathroomTypes.map((type) => (
                <ChoiceCard key={type.id} choice={type} selected={bathroomType === type.id} onClick={() => setBathroomType(type.id)} />
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="tool-quiz-step">
            <h2>What matters most to you?</h2>
            <p>Select one or more areas. We&apos;ll prioritize your plan accordingly.</p>
            <div className="quiz-option-grid quiz-option-grid-two">
              {focusAreas.map((area) => (
                <ChoiceCard key={area.id} choice={area} selected={selectedFocus.includes(area.id)} onClick={() => toggleFocus(area.id)} compact />
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="tool-quiz-step">
            <h2>How big is your bathroom?</h2>
            <p>This helps us recommend the right-sized products and layouts.</p>
            <div className="quiz-option-grid">
              {bathroomSizes.map((bathroomSize) => (
                <ChoiceCard
                  key={bathroomSize.id}
                  choice={bathroomSize}
                  selected={size === bathroomSize.id}
                  onClick={() => setSize(bathroomSize.id)}
                  compact
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="tool-quiz-step">
            <h2>Which looks are you drawn to?</h2>
            <p>Pick one or more styles that fit your vision.</p>
            <div className="style-choice-grid">
              {inspirationStyles.map((style) => {
                const selected = styles.includes(style.slug);
                return (
                  <button
                    key={style.slug}
                    type="button"
                    className={selected ? "style-choice-card is-selected" : "style-choice-card"}
                    onClick={() => toggleStyle(style.slug)}
                  >
                    <span className="style-choice-image" style={{ backgroundImage: `url(${style.cover})` }} aria-hidden="true" />
                    <span>{style.name}</span>
                    {selected ? <em aria-hidden="true">✓</em> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="tool-quiz-step blueprint-final-step">
            <span className="tool-success-icon">
              <MiniIcon name="sparkles" />
            </span>
            <h2>Your Blueprint is Ready</h2>
            <p>
              Based on your selections, we&apos;ll create a personalized plan with product links, step-by-step installment
              guides, and a reasonable timeline. Delivered within 48 hours.
            </p>
            <div className="blueprint-selection-panel">
              <span>Your selections</span>
              <div>
                {selectedLabels.map((label) => (
                  <em key={label}>{label}</em>
                ))}
              </div>
            </div>
            <ul className="blueprint-feature-list">
              {includedFeatures.map((feature) => (
                <li key={feature}>
                  <span>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <form action="/api/subscribe" method="post" className="form-grid unlock-form blueprint-final-form">
              <div className="field">
                <label htmlFor="blueprint-email">Email</label>
                <input id="blueprint-email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <input type="hidden" name="sourceUrl" value="/blueprint" />
              {selectedContentAreas.map((area) => (
                <input key={area} type="hidden" name="contentAreas" value={area} />
              ))}
              <input
                type="hidden"
                name="consentText"
                value={`I agree to receive Diyesu Decor emails and blueprint follow-ups. Blueprint selections: ${selectedLabels.join(", ")}.`}
              />
              <button className="btn btn-accent" type="submit">
                Join blueprint waitlist
              </button>
              <ConsentNote />
            </form>
            <button type="button" className="tool-reset-link" onClick={() => setStep(0)}>
              Start over
            </button>
          </div>
        ) : null}

        {step < 5 ? (
          <div className={step === 0 ? "tool-quiz-actions blueprint-first-actions" : "tool-quiz-actions"}>
            {step > 0 ? (
              <button type="button" className="btn btn-ghost" onClick={() => setStep((current) => Math.max(0, current - 1) as BlueprintStep)}>
                Back
              </button>
            ) : null}
            <button type="button" className="btn btn-accent" onClick={() => setStep((current) => (current + 1) as BlueprintStep)} disabled={!canProceed}>
              Continue <span aria-hidden="true">›</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
