import { NextResponse } from "next/server";
import { persistLead } from "../../../lib/lead-store";
import { checkRateLimit, getClientAddress } from "../../../lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rate = checkRateLimit({
    key: `subscribe:${getClientAddress(request.headers)}`,
    limit: 12,
    windowMs: 15 * 60 * 1000
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many signup attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

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
          relationships: {
            list: {
              data: {
                type: "list",
                id: klaviyoListId
              }
            }
          },
          attributes: {
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email,
                    subscriptions: {
                      email: {
                        marketing: {
                          consent: "SUBSCRIBED"
                        }
                      }
                    }
                  }
                }
              ]
            }
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
        console.error("Klaviyo error", response.status, text);
      } else {
        const body = (await response.json()) as { data?: { id?: string } };
        profileId = body?.data?.id ? `job:${body.data.id}` : `pending:${email}`;
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
