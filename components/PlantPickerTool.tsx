"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getPlantRecommendations,
  type PlantHumidity,
  type PlantLight,
  type PlantSpace
} from "../lib/plant-picker";
import { ConsentNote } from "./ConsentNote";

type PlantStep = 0 | 1 | 2 | 3;
type PlantOption = {
  value: string;
  label: string;
  description: string;
  icon: string;
};

const steps = ["Light", "Humidity", "Space", "Results"];

const lightOptions: PlantOption[] = [
  { value: "low", label: "Low / None", description: "No window or very dim", icon: "moon" },
  { value: "medium", label: "Medium", description: "Small window, indirect", icon: "cloud-sun" },
  { value: "bright", label: "Bright", description: "Large window, lots of light", icon: "sun" }
];

const humidityOptions: PlantOption[] = [
  { value: "dry", label: "Dry", description: "Good ventilation", icon: "wind" },
  { value: "normal", label: "Normal", description: "Standard bathroom", icon: "drop" },
  { value: "steamy", label: "Steamy", description: "Gets very humid", icon: "rain" }
];

const spaceOptions: PlantOption[] = [
  { value: "tiny", label: "Tiny", description: "Counter space only", icon: "square" },
  { value: "medium", label: "Some", description: "Shelf or floor space", icon: "sprout" },
  { value: "plenty", label: "Plenty", description: "Room for floor plants", icon: "tree" }
];

const areaOptions = [
  "Plants",
  "Storage",
  "Lighting",
  "Shower",
  "Mirror",
  "Renter",
  "DIY",
  "ExtremeBudget"
];

function MiniIcon({ name }: { name: string }) {
  switch (name) {
    case "moon":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 15.6A7.4 7.4 0 0 1 8.4 5a7.8 7.8 0 1 0 10.6 10.6Z" />
        </svg>
      );
    case "cloud-sun":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v2M5.6 6.6 7 8M18.4 6.6 17 8M20 13h-2" />
          <path d="M9.5 13.5a4 4 0 0 1 7.8-1" />
          <path d="M7.6 19h8.6a3.3 3.3 0 0 0 .5-6.5 4.8 4.8 0 0 0-9-1.6A4.1 4.1 0 0 0 7.6 19Z" />
        </svg>
      );
    case "sun":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3.8" />
          <path d="M12 3.5v2.1M12 18.4v2.1M3.5 12h2.1M18.4 12h2.1M6 6l1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M7.5 16.5 6 18" />
        </svg>
      );
    case "wind":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 8h10.5a2.2 2.2 0 1 0-2.2-2.2" />
          <path d="M4 12h14.5a2.2 2.2 0 1 1-2.2 2.2" />
          <path d="M4 16h7" />
        </svg>
      );
    case "rain":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.6 15.8h8.6a3.3 3.3 0 0 0 .5-6.5 4.8 4.8 0 0 0-9-1.6A4.1 4.1 0 0 0 7.6 15.8Z" />
          <path d="M8 19.5v1M12 18.5v1M16 19.5v1" />
        </svg>
      );
    case "drop":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.8c3.6 4.1 5.4 7.2 5.4 9.4a5.4 5.4 0 0 1-10.8 0c0-2.2 1.8-5.3 5.4-9.4Z" />
        </svg>
      );
    case "square":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 7h10v10H7z" />
        </svg>
      );
    case "tree":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20v-7" />
          <path d="M8 13.5 12 5l4 8.5H8Z" />
          <path d="M6.8 16.5h10.4L12 8.5l-5.2 8Z" />
        </svg>
      );
    case "flower":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="2.2" />
          <path d="M12 4.8c1.5 1.8 1.5 3.2 0 4.3-1.5-1.1-1.5-2.5 0-4.3ZM19.2 12c-1.8 1.5-3.2 1.5-4.3 0 1.1-1.5 2.5-1.5 4.3 0ZM12 19.2c-1.5-1.8-1.5-3.2 0-4.3 1.5 1.1 1.5 2.5 0 4.3ZM4.8 12c1.8-1.5 3.2-1.5 4.3 0-1.1 1.5-2.5 1.5-4.3 0Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 19c7.5-.2 12.1-4 13.7-11.4l.4-2-2 .2C9.7 6.4 5.8 10.6 5 19Z" />
          <path d="M6.4 17.6c2.9-3.9 6.3-6.4 10.2-7.5" />
        </svg>
      );
  }
}

function PlantMatchIcon({ index }: { index: number }) {
  return (
    <span className="plant-match-emblem" aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <path d="M15 31h18l-2 11H17l-2-11Z" />
        <path d="M24 31V14" />
        <path d="M24 21c-6 0-10-3.5-10-9 6 0 10 3.5 10 9Z" />
        <path d="M24 27c6 0 10-3.5 10-9-6 0-10 3.5-10 9Z" />
        <path d="M24 16c4 0 7-2.5 7-6-4 0-7 2.5-7 6Z" />
      </svg>
      <b>{index + 1}</b>
    </span>
  );
}

function ProgressSteps({ step }: { step: PlantStep }) {
  return (
    <div className="quiz-progress" aria-label="Plant picker progress">
      {steps.map((label, index) => (
        <div key={label} className="quiz-progress-item">
          <span className={index <= step ? "is-active" : ""}>{index < step ? "✓" : index + 1}</span>
          <strong className={index <= step ? "is-active" : ""}>{label}</strong>
          {index < steps.length - 1 ? <i className={index < step ? "is-active" : ""} /> : null}
        </div>
      ))}
    </div>
  );
}

function OptionGrid({
  options,
  value,
  onChange
}: {
  options: PlantOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="quiz-option-grid">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? "quiz-option-card is-selected" : "quiz-option-card"}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          <span className="quiz-option-icon">
            <MiniIcon name={option.icon} />
          </span>
          <strong>{option.label}</strong>
          <span>{option.description}</span>
        </button>
      ))}
    </div>
  );
}

export function PlantPickerTool() {
  const [step, setStep] = useState<PlantStep>(0);
  const [light, setLight] = useState("");
  const [humidity, setHumidity] = useState("");
  const [space, setSpace] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(["Plants"]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const unlockButtonRef = useRef<HTMLButtonElement>(null);
  const hasRenderedStep = useRef(false);

  useEffect(() => {
    if (!hasRenderedStep.current) {
      hasRenderedStep.current = true;
      return;
    }

    const frame = window.requestAnimationFrame(() => stepHeadingRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [step]);

  useEffect(() => {
    if (!showSignup || unlocked) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const fallbackHeading = stepHeadingRef.current;
    const previouslyFocused = unlockButtonRef.current?.isConnected
      ? unlockButtonRef.current
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusableElements = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => element.getClientRects().length > 0 && element.getAttribute("aria-hidden") !== "true"
      );

    const frame = window.requestAnimationFrame(() => {
      const email = dialog.querySelector<HTMLInputElement>("#plant-picker-email");
      (email ?? getFocusableElements()[0] ?? dialog).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowSignup(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusableElements = getFocusableElements();
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      window.requestAnimationFrame(() => {
        if (previouslyFocused?.isConnected) {
          previouslyFocused.focus();
        } else {
          fallbackHeading?.focus({ preventScroll: true });
        }
      });
    };
  }, [showSignup, unlocked]);

  const results = useMemo(() => {
    return getPlantRecommendations({
      light: (light || "low") as PlantLight,
      humidity: (humidity || "normal") as PlantHumidity,
      space: (space || "tiny") as PlantSpace
    });
  }, [humidity, light, space]);

  const canProceed = (step === 0 && light) || (step === 1 && humidity) || (step === 2 && space);

  const toggleArea = (area: string) => {
    setSelectedAreas((current) => (current.includes(area) ? current.filter((item) => item !== area) : [...current, area]));
  };

  const reset = () => {
    setStep(0);
    setLight("");
    setHumidity("");
    setSpace("");
    setShowSignup(false);
    setUnlocked(false);
    setSelectedAreas(["Plants"]);
  };

  return (
    <section className="tool-quiz-shell plant-picker-shell">
      <ProgressSteps step={step} />

      <div className="tool-quiz-card">
        {step === 0 ? (
          <div className="tool-quiz-step">
            <h2 ref={stepHeadingRef} tabIndex={-1}>How much natural light does your bathroom get?</h2>
            <OptionGrid options={lightOptions} value={light} onChange={setLight} />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="tool-quiz-step">
            <h2 ref={stepHeadingRef} tabIndex={-1}>How humid does it get?</h2>
            <OptionGrid options={humidityOptions} value={humidity} onChange={setHumidity} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="tool-quiz-step">
            <h2 ref={stepHeadingRef} tabIndex={-1}>How much space do you have?</h2>
            <OptionGrid options={spaceOptions} value={space} onChange={setSpace} />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="tool-quiz-step">
            <h2 ref={stepHeadingRef} tabIndex={-1}>Recommended bathroom plants for you</h2>
            <div className="plant-match-list">
              {results.map((plant, index) => {
                const isLocked = index >= 2 && !unlocked;
                const visibleName = isLocked ? "Bonus plant match" : plant.name;
                const visibleScientific = isLocked ? "Unlock to reveal" : plant.scientific;
                const visibleDifficulty = isLocked ? "Locked" : plant.difficulty;
                const visibleLight = isLocked ? "Personalized to your answers" : plant.light;
                const visibleWater = isLocked ? "Care details included" : plant.water;
                const visiblePlacement = isLocked ? "Placement tip included" : plant.placement;
                const card = (
                  <article
                    key={plant.name}
                    className={`plant-match-card plant-difficulty-${plant.difficulty.toLowerCase()}${isLocked ? " is-locked" : ""}`}
                    aria-hidden={isLocked || undefined}
                  >
                    <span className={`plant-match-icon plant-match-${plant.difficulty.toLowerCase()}`}>
                      <PlantMatchIcon index={index} />
                    </span>
                    <span className="plant-match-copy">
                      <span className="plant-match-title">
                        <strong>{visibleName}</strong>
                        <em>{visibleDifficulty}</em>
                      </span>
                      <span className="plant-scientific">{visibleScientific}</span>
                      <span className="plant-match-detail">
                        <MiniIcon name="sun" />
                        <span><b>Light:</b> {visibleLight}</span>
                      </span>
                      <span className="plant-match-detail">
                        <MiniIcon name="drop" />
                        <span><b>Water:</b> {visibleWater}</span>
                      </span>
                      <span className="plant-match-detail">
                        <MiniIcon name="square" />
                        <span><b>Placement:</b> {visiblePlacement}</span>
                      </span>
                    </span>
                    <span
                      className="plant-match-photo"
                      style={{ backgroundImage: isLocked ? undefined : `url(${plant.image})` }}
                      aria-hidden="true"
                    />
                  </article>
                );

                if (isLocked && index === 2) {
                  return (
                    <div key={plant.name} style={{ position: "relative" }}>
                      {card}
                      <button ref={unlockButtonRef} type="button" className="plant-lock-button" onClick={() => setShowSignup(true)}>
                        <small>Click here</small>
                        <span>Unlock three more matches for free</span>
                      </button>
                    </div>
                  );
                }

                return card;
              })}
            </div>
            <button type="button" className="tool-reset-link" onClick={reset}>
              Start Over
            </button>
          </div>
        ) : null}

        {step < 3 ? (
          <div className="tool-quiz-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep((current) => Math.max(0, current - 1) as PlantStep)} disabled={step === 0}>
              Back
            </button>
            <button type="button" className="btn btn-accent" onClick={() => setStep((current) => (current + 1) as PlantStep)} disabled={!canProceed}>
              {step === 2 ? "See Results" : "Next"}
            </button>
          </div>
        ) : null}
      </div>

      {showSignup && !unlocked ? (
        <div className="tool-modal-backdrop">
          <div
            ref={dialogRef}
            className="tool-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plant-signup-title"
            tabIndex={-1}
          >
            <button type="button" className="tool-modal-close" aria-label="Close signup" onClick={() => setShowSignup(false)}>
              ×
            </button>
            <div className="tool-modal-icon">
              <MiniIcon name="leaf" />
            </div>
            <h2 id="plant-signup-title">Get weekly bathroom ideas</h2>
            <p>Subscribe to unlock 3 more plant recommendations and receive one curated bathroom idea every Wednesday.</p>
            <form action="/api/subscribe" method="post" className="tool-modal-form">
              <div className="field">
                <label htmlFor="plant-picker-email">Email</label>
                <input id="plant-picker-email" name="email" type="email" required placeholder="you@example.com" autoFocus />
              </div>
              <div className="area-chip-picker" aria-label="Areas you are interested in">
                {areaOptions.map((area) => (
                  <button
                    key={area}
                    type="button"
                    className={selectedAreas.includes(area) ? "is-selected" : ""}
                    aria-pressed={selectedAreas.includes(area)}
                    onClick={() => toggleArea(area)}
                  >
                    {area === "ExtremeBudget" ? "Extreme Budget" : area}
                  </button>
                ))}
              </div>
              <input type="hidden" name="sourceUrl" value="/plant-picker" />
              {selectedAreas.map((area) => (
                <input key={area} type="hidden" name="contentAreas" value={area} />
              ))}
              <input type="hidden" name="plantLight" value={light} />
              <input type="hidden" name="plantHumidity" value={humidity} />
              <input type="hidden" name="plantSpace" value={space} />
              <input
                type="hidden"
                name="consentText"
                value="I agree to receive Diyesu Decor emails and plant picker follow-ups. I can unsubscribe anytime."
              />
              <button className="btn btn-accent" type="submit">
                Subscribe and unlock
              </button>
              <ConsentNote />
            </form>
            <button
              type="button"
              className="tool-skip-link"
              onClick={() => {
                setUnlocked(true);
                setShowSignup(false);
              }}
            >
              View plants without subscribing
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
