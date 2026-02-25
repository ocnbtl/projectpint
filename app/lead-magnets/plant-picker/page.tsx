import { ConsentNote } from "../../../components/ConsentNote";
import { SiteShell } from "../../../components/SiteShell";

export default function PlantPickerPage() {
  return (
    <SiteShell>
      <div className="card">
        <h1>Bathroom Plant Picker (Free)</h1>
        <p>Answer a few constraints and get 2-3 practical plant matches with placement tips.</p>
        <form action="/api/subscribe" method="post">
          <label>
            Email
            <input name="email" type="email" required style={{ width: "100%", padding: 8 }} />
          </label>
          <label>
            Light
            <select name="plantLight" style={{ width: "100%", padding: 8 }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="bright">Bright</option>
            </select>
          </label>
          <label>
            Humidity
            <select name="plantHumidity" style={{ width: "100%", padding: 8 }}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </label>
          <label>
            Space
            <select name="plantSpace" style={{ width: "100%", padding: 8 }}>
              <option value="tiny">Tiny</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
            </select>
          </label>
          <input type="hidden" name="sourceUrl" value="/lead-magnets/plant-picker" />
          <input type="hidden" name="pillarInterest" value="PlantsBiophilic" />
          <input type="hidden" name="consentText" value="I agree to receive Diyesu Decor emails and plant picker follow-ups. I can unsubscribe anytime." />
          <button style={{ marginTop: 10 }}>Get my plant picks</button>
          <ConsentNote />
        </form>
      </div>
    </SiteShell>
  );
}
