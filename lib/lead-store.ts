import { randomUUID } from "node:crypto";
import { loadTab, saveTab } from "./store.ts";

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
  const rows = loadTab<Record<string, unknown>>("Leads");

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

  saveTab("Leads", rows);
}
