import Link from "next/link";
import { ConsentNote } from "./ConsentNote";

interface EmailSignupFormProps {
  sourceUrl: string;
  buttonLabel: string;
  consentText: string;
  pillarInterest?: string;
  includePlantFields?: boolean;
  plantDefaults?: {
    light: "low" | "medium" | "bright";
    humidity: "high" | "medium";
    space: "tiny" | "small" | "medium";
  };
}

export function EmailSignupForm({
  sourceUrl,
  buttonLabel,
  consentText,
  pillarInterest,
  includePlantFields = false,
  plantDefaults = { light: "low", humidity: "high", space: "tiny" }
}: EmailSignupFormProps) {
  const safeSource = sourceUrl.replace(/[^a-z0-9_-]/gi, "-");

  return (
    <form action="/api/subscribe" method="post" className="form-grid">
      <div className="field">
        <label htmlFor={`email-${safeSource}`}>Email</label>
        <input id={`email-${safeSource}`} name="email" type="email" required placeholder="you@example.com" />
      </div>

      {includePlantFields ? (
        <>
          <div className="field">
            <label htmlFor="plantLight">Bathroom light</label>
            <select id="plantLight" name="plantLight" defaultValue={plantDefaults.light}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="bright">Bright</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="plantHumidity">Humidity level</label>
            <select id="plantHumidity" name="plantHumidity" defaultValue={plantDefaults.humidity}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="plantSpace">Available space</label>
            <select id="plantSpace" name="plantSpace" defaultValue={plantDefaults.space}>
              <option value="tiny">Tiny</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </>
      ) : null}

      <input type="hidden" name="sourceUrl" value={sourceUrl} />
      <input type="hidden" name="consentText" value={consentText} />
      {pillarInterest ? <input type="hidden" name="pillarInterest" value={pillarInterest} /> : null}

      <button className="btn btn-accent" type="submit">
        {buttonLabel}
      </button>
      <ConsentNote />
      <p className="small" style={{ marginBottom: 0 }}>
        No spam. We respect your inbox. Use this with our <Link href="/legal/privacy">Privacy Policy</Link> and
        unsubscribe anytime.
      </p>
    </form>
  );
}
