"use client";

import { useMemo, useState } from "react";
import { blueprintSteps } from "../lib/redesign-data";
import { ConsentNote } from "./ConsentNote";

type Answers = Record<string, string>;

export function BlueprintTool() {
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(blueprintSteps.map((step) => [step.key, step.options[0]]))
  );

  const summary = useMemo(
    () => [
      `Budget lane: ${answers.budget}`,
      `Bathroom type: ${answers.type}`,
      `Main focus: ${answers.focus}`,
      `Room size: ${answers.size}`,
      `Visual direction: ${answers.style}`
    ],
    [answers]
  );

  return (
    <div className="tool-grid blueprint-tool">
      <section className="tool-panel">
        {blueprintSteps.map((step, index) => (
          <div key={step.key} className="tool-step">
            <p className="eyebrow blog-eyebrow">Step {index + 1}</p>
            <h2>{step.title}</h2>
            <div className="segmented-control segmented-control-wrap">
              {step.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={answers[step.key] === option ? "is-selected" : ""}
                  onClick={() => setAnswers((current) => ({ ...current, [step.key]: option }))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="tool-panel blueprint-summary">
        <p className="eyebrow blog-eyebrow">Get Plan</p>
        <h2>Your bathroom blueprint brief</h2>
        <ul>
          {summary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <form action="/api/subscribe" method="post" className="form-grid unlock-form">
          <div className="field">
            <label htmlFor="blueprint-email">Email</label>
            <input id="blueprint-email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <input type="hidden" name="sourceUrl" value="/blueprint" />
          <input type="hidden" name="contentAreas" value={answers.focus ?? "DIY"} />
          <input
            type="hidden"
            name="consentText"
            value="I agree to receive Diyesu Decor emails and blueprint follow-ups. I can unsubscribe anytime."
          />
          <button className="btn btn-accent" type="submit">
            Join blueprint waitlist
          </button>
          <ConsentNote />
        </form>
      </section>
    </div>
  );
}
