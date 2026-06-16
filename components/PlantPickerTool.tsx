"use client";

import { useMemo, useState } from "react";
import { ConsentNote } from "./ConsentNote";

type PlantStep = 0 | 1 | 2 | 3;
type PlantOption = {
  value: string;
  label: string;
  description: string;
  icon: string;
};

type PlantResult = {
  name: string;
  scientific: string;
  light: string;
  water: string;
  placement: string;
  difficulty: "Easy" | "Intermediate";
  note: string;
  icon: string;
  image: string;
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

const plants: PlantResult[] = [
  {
    name: "Pothos",
    scientific: "Epipremnum aureum",
    light: "Low to bright indirect",
    water: "Weekly",
    placement: "Shelf, hanging planter, windowsill",
    difficulty: "Easy",
    note: "Trails from shelves, handles humidity, and forgives imperfect watering.",
    icon: "leaf",
    image:
      "https://images.unsplash.com/photo-1773431456773-50853cea57cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    name: "Snake Plant",
    scientific: "Sansevieria trifasciata",
    light: "Low to bright",
    water: "Every 2-3 weeks",
    placement: "Floor corner, counter, windowsill",
    difficulty: "Easy",
    note: "Architectural, durable, and easy to place beside a vanity or toilet.",
    icon: "tree",
    image:
      "https://images.unsplash.com/photo-1613498630970-f2a333cb4974?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    name: "ZZ Plant",
    scientific: "Zamioculcas zamiifolia",
    light: "Low to medium",
    water: "Every 2-3 weeks",
    placement: "Floor, counter, shelf",
    difficulty: "Easy",
    note: "Slow growing, glossy, and tolerant of dry spells between watering.",
    icon: "sprout",
    image:
      "https://images.unsplash.com/photo-1555758826-ce21b7e51ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    name: "Peace Lily",
    scientific: "Spathiphyllum",
    light: "Low to medium",
    water: "Weekly",
    placement: "Counter, floor, shelf",
    difficulty: "Easy",
    note: "A softer option for humid bathrooms with indirect light.",
    icon: "flower",
    image:
      "https://images.unsplash.com/photo-1567465645848-b765281eca3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    name: "Boston Fern",
    scientific: "Nephrolepis exaltata",
    light: "Medium indirect",
    water: "Keep moist",
    placement: "Hanging, high shelf, shower area",
    difficulty: "Intermediate",
    note: "Best near a shower or window where steam keeps the fronds lush.",
    icon: "leaf",
    image:
      "https://images.unsplash.com/photo-1704869727879-25ed3c235e7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
  }
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

  const results = useMemo(() => {
    let matches = [...plants];
    if (light === "low") matches = matches.filter((plant) => plant.light.toLowerCase().includes("low"));
    if (light === "medium") {
      matches = matches.filter((plant) => plant.light.toLowerCase().includes("medium") || plant.light.toLowerCase().includes("indirect"));
    }
    if (space === "tiny") {
      matches = matches.filter((plant) => plant.placement.toLowerCase().includes("shelf") || plant.placement.toLowerCase().includes("counter"));
    }
    return matches.length >= 5 ? matches.slice(0, 5) : [...matches, ...plants.filter((plant) => !matches.includes(plant))].slice(0, 5);
  }, [light, space]);

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
    <section className="tool-quiz-shell">
      <ProgressSteps step={step} />

      <div className="tool-quiz-card">
        {step === 0 ? (
          <div className="tool-quiz-step">
            <h2>How much natural light does your bathroom get?</h2>
            <OptionGrid options={lightOptions} value={light} onChange={setLight} />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="tool-quiz-step">
            <h2>How humid does it get?</h2>
            <OptionGrid options={humidityOptions} value={humidity} onChange={setHumidity} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="tool-quiz-step">
            <h2>How much space do you have?</h2>
            <OptionGrid options={spaceOptions} value={space} onChange={setSpace} />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="tool-quiz-step">
            <h2>Recommended bathroom plants for you</h2>
            <div className="plant-match-list">
              {results.map((plant, index) => {
                const isLocked = index >= 2 && !unlocked;
                return (
                  <article key={plant.name} className={isLocked ? "plant-match-card is-locked" : "plant-match-card"}>
                    {isLocked && index === 2 ? (
                      <button type="button" className="plant-lock-button" onClick={() => setShowSignup(true)}>
                        <span>Unlock 3 more matches</span>
                        <small>Free weekly bathroom ideas</small>
                      </button>
                    ) : null}
                    <span className={`plant-match-icon plant-match-${plant.difficulty.toLowerCase()}`}>
                      <MiniIcon name={plant.icon} />
                    </span>
                    <span className="plant-match-copy">
                      <span className="plant-match-title">
                        <strong>{plant.name}</strong>
                        <em>{plant.difficulty}</em>
                      </span>
                      <span className="plant-scientific">{plant.scientific}</span>
                      <span className="plant-match-detail">Light: {plant.light}</span>
                      <span className="plant-match-detail">Water: {plant.water}</span>
                      <span className="plant-match-detail">Placement: {plant.placement}</span>
                      <span>{plant.note}</span>
                    </span>
                    <span className="plant-match-photo" style={{ backgroundImage: `url(${plant.image})` }} aria-hidden="true" />
                  </article>
                );
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
        <div className="tool-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="plant-signup-title">
          <div className="tool-modal-card">
            <button type="button" className="tool-modal-close" aria-label="Close" onClick={() => setShowSignup(false)}>
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
                <input id="plant-picker-email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="area-chip-picker" aria-label="Areas you are interested in">
                {areaOptions.map((area) => (
                  <button
                    key={area}
                    type="button"
                    className={selectedAreas.includes(area) ? "is-selected" : ""}
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
