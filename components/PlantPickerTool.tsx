"use client";

import { useMemo, useState } from "react";
import { plantMatches } from "../lib/redesign-data";
import { ConsentNote } from "./ConsentNote";

const lightOptions = ["low", "medium", "bright"] as const;
const humidityOptions = ["medium", "high"] as const;
const spaceOptions = ["tiny", "small", "medium"] as const;

export function PlantPickerTool() {
  const [light, setLight] = useState<(typeof lightOptions)[number]>("low");
  const [humidity, setHumidity] = useState<(typeof humidityOptions)[number]>("high");
  const [space, setSpace] = useState<(typeof spaceOptions)[number]>("tiny");

  const picks = useMemo(() => {
    if (light === "bright" && humidity === "high") return [plantMatches[2], plantMatches[0], plantMatches[3]];
    if (space === "tiny") return [plantMatches[0], plantMatches[3], plantMatches[1]];
    return [plantMatches[1], plantMatches[0], plantMatches[3]];
  }, [humidity, light, space]);

  return (
    <div className="tool-grid">
      <section className="tool-panel">
        <div className="tool-step">
          <p className="eyebrow blog-eyebrow">Step 1</p>
          <h2>Light</h2>
          <div className="segmented-control">
            {lightOptions.map((option) => (
              <button key={option} type="button" className={light === option ? "is-selected" : ""} onClick={() => setLight(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="tool-step">
          <p className="eyebrow blog-eyebrow">Step 2</p>
          <h2>Humidity</h2>
          <div className="segmented-control">
            {humidityOptions.map((option) => (
              <button key={option} type="button" className={humidity === option ? "is-selected" : ""} onClick={() => setHumidity(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="tool-step">
          <p className="eyebrow blog-eyebrow">Step 3</p>
          <h2>Space</h2>
          <div className="segmented-control">
            {spaceOptions.map((option) => (
              <button key={option} type="button" className={space === option ? "is-selected" : ""} onClick={() => setSpace(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="tool-panel tool-results">
        <p className="eyebrow blog-eyebrow">Your Matches</p>
        <div className="plant-result-list">
          {picks.slice(0, 2).map((plant) => (
            <article key={plant.name} className="plant-result-card">
              <h3>{plant.name}</h3>
              <p className="small">{plant.fit}</p>
              <p>{plant.note}</p>
            </article>
          ))}
        </div>
        <form action="/api/subscribe" method="post" className="form-grid unlock-form">
          <div className="field">
            <label htmlFor="plant-picker-email">Unlock all matches by email</label>
            <input id="plant-picker-email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <input type="hidden" name="sourceUrl" value="/plant-picker" />
          <input type="hidden" name="contentAreas" value="Plants" />
          <input type="hidden" name="plantLight" value={light} />
          <input type="hidden" name="plantHumidity" value={humidity} />
          <input type="hidden" name="plantSpace" value={space} />
          <input
            type="hidden"
            name="consentText"
            value="I agree to receive Diyesu Decor emails and plant picker follow-ups. I can unsubscribe anytime."
          />
          <button className="btn btn-accent" type="submit">
            Send my full list
          </button>
          <ConsentNote />
        </form>
      </section>
    </div>
  );
}
