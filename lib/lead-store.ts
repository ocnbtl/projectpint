import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

interface LeadInput {
  email: string;
  sourceUrl: string;
  pillarInterest?: string;
  plantLight?: string;
  plantHumidity?: string;
  plantSpace?: string;
  klaviyoProfileId?: string;
  consentText: string;
}

export function persistLead(input: LeadInput): void {
  const p = path.join(process.cwd(), "data", "sheets", "Leads.json");
  const rows = fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, unknown>[]) : [];

  rows.push({
    Lead_ID: `LEAD-${randomUUID()}`,
    Email: input.email,
    Created_At: new Date().toISOString(),
    Source_URL: input.sourceUrl,
    Pillar_Interest: input.pillarInterest ?? "",
    Plant_Light: input.plantLight ?? "",
    Plant_Humidity: input.plantHumidity ?? "",
    Plant_Space: input.plantSpace ?? "",
    Klaviyo_Profile_ID: input.klaviyoProfileId ?? "",
    Consent_Text: input.consentText
  });

  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(rows, null, 2));
}
