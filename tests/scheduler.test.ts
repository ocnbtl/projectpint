import test from "node:test";
import assert from "node:assert/strict";
import { assignSchedule, validateIntentDailyMix, validateNo24hRepeats } from "../lib/scheduler.ts";
import type { DestinationIntent, PinDraft, UrlInventoryItem } from "../lib/types.ts";

function makePin(id: string, intent: DestinationIntent, scheduledAt = "", destinationUrl = ""): PinDraft {
  return {
    Content_ID: id,
    Created_At: "2026-02-23T00:00:00.000Z",
    Status: "draft",
    Hook_Class: "QuickWin",
    Destination_Intent: intent,
    Pillar: "BudgetDIY",
    Topic: `topic-${id}`,
    Destination_URL: destinationUrl,
    Title: "Budget bathroom quick win under $75",
    Caption_1: "You can save time with one quick win under $75.",
    Caption_2: "This keeps counters calmer and easier to maintain.",
    Caption_3: "See the full guide.",
    Description_With_Hashtags: "",
    Overlay_1: "Quick win under $75",
    Overlay_2: "Renter-safe",
    Has_Text_Overlay: true,
    Primary_CTA: "See the guide",
    Visual_Preset: "tiny_bathroom_scene_v1",
    Image_Prompt: "AI bathroom scene, no logos, no people",
    UTM_URL: "/blog/test?utm_source=pinterest",
    Quality_Score: 90,
    Quality_Flags: [],
    AutoFixSuggestions: [],
    Hook_Class_Uniqueness_Flag: true,
    Intent_Balance_Flag: true,
    Visual_Risk_Flags: [],
    Naturalness_Flag: true,
    Human_Approved: false,
    Scheduled_At: scheduledAt,
    Posted_At: ""
  };
}

function makeUrl(url: string, status: "published" | "disabled", lastPostedAt: string, priority: number): UrlInventoryItem {
  return {
    URL_ID: `URL-${priority}`,
    URL: url,
    Type: "blog",
    Pillar: "BudgetDIY",
    Status: status,
    Last_Posted_At: lastPostedAt,
    Cooldown_Hours: 24,
    Destination_Intent_Default: "Teach",
    Priority: priority
  };
}

test("validateNo24hRepeats flags repeated destination within 24h", () => {
  const pins = [
    makePin("PIN-001", "Teach", "2026-02-23T08:00:00.000Z", "/blog/a"),
    makePin("PIN-002", "Solve", "2026-02-24T03:00:00.000Z", "/blog/a")
  ];
  const issues = validateNo24hRepeats(pins);
  assert.equal(issues.length, 1);
  assert.match(issues[0], /URL repeat within 24h/);
});

test("validateNo24hRepeats does not flag repeats after 24h", () => {
  const pins = [
    makePin("PIN-001", "Teach", "2026-02-23T08:00:00.000Z", "/blog/a"),
    makePin("PIN-002", "Solve", "2026-02-24T08:00:00.000Z", "/blog/a")
  ];
  const issues = validateNo24hRepeats(pins);
  assert.equal(issues.length, 0);
});

test("validateIntentDailyMix flags stacking 5 of same intent in one day", () => {
  const pins = [
    makePin("PIN-001", "Shop", "2026-02-23T01:00:00.000Z", "/blog/1"),
    makePin("PIN-002", "Shop", "2026-02-23T02:00:00.000Z", "/blog/2"),
    makePin("PIN-003", "Shop", "2026-02-23T03:00:00.000Z", "/blog/3"),
    makePin("PIN-004", "Shop", "2026-02-23T04:00:00.000Z", "/blog/4"),
    makePin("PIN-005", "Shop", "2026-02-23T05:00:00.000Z", "/blog/5")
  ];
  const issues = validateIntentDailyMix(pins);
  assert.equal(issues.length, 1);
  assert.match(issues[0], /Daily stack risk/);
});

test("assignSchedule uses only published and cooldown-eligible URLs", () => {
  const pins = [makePin("PIN-001", "Teach"), makePin("PIN-002", "Teach")];
  const inventory = [
    makeUrl("/blog/ineligible-cooldown", "published", "2026-02-23T00:00:00.000Z", 100),
    makeUrl("/blog/disabled", "disabled", "", 95),
    makeUrl("/blog/eligible", "published", "", 90)
  ];

  const result = assignSchedule(pins, inventory, "2026-02-23T08:00:00.000Z");

  assert.equal(result.pins[0].Destination_URL, "/blog/eligible");
  assert.equal(result.pins[1].Destination_URL, "");
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /No eligible URL/);
});
