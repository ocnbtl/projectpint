import { randomUUID } from "node:crypto";
import { normalizeContentAreas } from "./constants.ts";
import { loadRuntimeTab, saveRuntimeTab } from "./runtime-store.ts";

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

export async function persistLead(input: LeadInput): Promise<void> {
  const rows = await loadRuntimeTab<Record<string, unknown>>("Leads");
  const createdAt = input.createdAtIso ?? new Date().toISOString();
  const contentAreas = normalizeContentAreas([...(input.contentAreas ?? []), input.pillarInterest ?? ""]);
  const pillarInterest = contentAreas.length > 0 ? contentAreas.join(", ") : input.pillarInterest ?? "";

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

  await saveRuntimeTab("Leads", rows);
}
