import { randomUUID } from "node:crypto";
import { loadTab, saveTab } from "./store.ts";

interface LeadInput {
  email: string;
  sourceUrl: string;
  pillarInterest?: string;
  contentAreas?: string[];
  plantLight?: string;
  plantHumidity?: string;
  plantSpace?: string;
  klaviyoProfileId?: string;
  consentText: string;
  createdAtIso?: string;
}

export function persistLead(input: LeadInput): void {
  const rows = loadTab<Record<string, unknown>>("Leads");
  const createdAt = input.createdAtIso ?? new Date().toISOString();
  const pillarInterest =
    input.pillarInterest ??
    (input.contentAreas && input.contentAreas.length > 0 ? input.contentAreas.join(", ") : "");

  rows.push({
    Lead_ID: `LEAD-${randomUUID()}`,
    Email: input.email,
    Created_At: createdAt,
    Source_URL: input.sourceUrl,
    Pillar_Interest: pillarInterest,
    Plant_Light: input.plantLight ?? "",
    Plant_Humidity: input.plantHumidity ?? "",
    Plant_Space: input.plantSpace ?? "",
    Klaviyo_Profile_ID: input.klaviyoProfileId ?? "",
    Consent_Text: input.consentText
  });

  saveTab("Leads", rows);
}
