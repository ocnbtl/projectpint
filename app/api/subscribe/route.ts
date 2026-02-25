import { NextResponse } from "next/server";
import { persistLead } from "../../../lib/lead-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "");
  const consentText = String(formData.get("consentText") ?? "");
  const pillarInterest = String(formData.get("pillarInterest") ?? "");
  const plantLight = String(formData.get("plantLight") ?? "");
  const plantHumidity = String(formData.get("plantHumidity") ?? "");
  const plantSpace = String(formData.get("plantSpace") ?? "");

  if (!email || !consentText) {
    return NextResponse.json({ ok: false, error: "Email and consent are required" }, { status: 400 });
  }

  const klaviyoPrivateKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  const klaviyoListId = process.env.KLAVIYO_LIST_ID;

  let profileId = "";
  if (klaviyoPrivateKey && klaviyoListId) {
    try {
      const payload = {
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            list_id: klaviyoListId,
            subscriptions: [{ email }]
          }
        }
      };

      const response = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs", {
        method: "POST",
        headers: {
          accept: "application/vnd.api+json",
          revision: "2024-10-15",
          "content-type": "application/vnd.api+json",
          Authorization: `Klaviyo-API-Key ${klaviyoPrivateKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Klaviyo error", text);
      } else {
        profileId = `pending:${email}`;
      }
    } catch (error) {
      console.error("Klaviyo request failed", error);
    }
  }

  persistLead({
    email,
    sourceUrl,
    consentText,
    pillarInterest,
    plantLight,
    plantHumidity,
    plantSpace,
    klaviyoProfileId: profileId
  });

  return NextResponse.redirect(new URL("/start-here?subscribed=1", request.url));
}
