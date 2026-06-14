import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { upsertCustomerFromSignup } from "../lib/command-center.ts";
import { persistLead } from "../lib/lead-store.ts";

test("signup storage persists leads and upserts evergreen customers", async () => {
  const previousCwd = process.cwd();
  const previousForceLocal = process.env.FORCE_LOCAL_SHEETS;
  const previousStorageMode = process.env.STORAGE_MODE;
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "projectpint-subscribe-"));

  process.chdir(tempDir);
  process.env.FORCE_LOCAL_SHEETS = "1";
  process.env.STORAGE_MODE = "local";

  try {
    await persistLead({
      email: "Reader@Example.com",
      sourceUrl: "/plant-picker",
      pillarInterest: "PlantsBiophilic",
      contentAreas: ["Plants"],
      plantLight: "low",
      plantHumidity: "high",
      plantSpace: "shelf",
      consentText: "I agree to receive Diyesu Decor emails.",
      createdAtIso: "2026-06-14T14:30:00.000Z"
    });

    const created = await upsertCustomerFromSignup({
      email: "Reader@Example.com",
      contentAreas: ["PlantsBiophilic"],
      createdAtIso: "2026-06-14T14:30:00.000Z"
    });

    const updated = await upsertCustomerFromSignup({
      email: "reader@example.com",
      contentAreas: ["Lighting"],
      createdAtIso: "2026-06-14T15:45:00.000Z"
    });

    const leads = JSON.parse(await readFile(path.join(tempDir, "data", "sheets", "Leads.json"), "utf8")) as Array<
      Record<string, string>
    >;
    const customers = JSON.parse(
      await readFile(path.join(tempDir, "data", "sheets", "Customers_Evergreen.json"), "utf8")
    ) as Array<Record<string, string>>;

    assert.equal(leads.length, 1);
    assert.match(leads[0].Lead_ID, /^LEAD-/);
    assert.equal(leads[0].Email, "Reader@Example.com");
    assert.equal(leads[0].Source_URL, "/plant-picker");
    assert.equal(leads[0].Pillar_Interest, "Plants");
    assert.equal(leads[0].Plant_Light, "low");
    assert.equal(leads[0].Plant_Humidity, "high");
    assert.equal(leads[0].Plant_Space, "shelf");
    assert.equal(leads[0].Consent_Text, "I agree to receive Diyesu Decor emails.");

    assert.equal(created.User_ID, "USER_00001");
    assert.equal(updated.User_ID, "USER_00001");
    assert.equal(customers.length, 1);
    assert.equal(customers[0].User_Email, "Reader@Example.com");
    assert.equal(customers[0].User_Date_Email, "06/14/2026");
    assert.equal(customers[0].User_Time_Email, "11:45");
    assert.equal(customers[0].Content_Area, "Lighting");
  } finally {
    process.chdir(previousCwd);
    if (previousForceLocal === undefined) {
      delete process.env.FORCE_LOCAL_SHEETS;
    } else {
      process.env.FORCE_LOCAL_SHEETS = previousForceLocal;
    }

    if (previousStorageMode === undefined) {
      delete process.env.STORAGE_MODE;
    } else {
      process.env.STORAGE_MODE = previousStorageMode;
    }

    await rm(tempDir, { recursive: true, force: true });
  }
});
