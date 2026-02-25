import { addHours, hoursSince } from "./date.ts";
import type { DestinationIntent, PinDraft, UrlInventoryItem } from "./types.ts";

interface SchedulerResult {
  pins: PinDraft[];
  warnings: string[];
}

function isUrlEligible(url: UrlInventoryItem, slotIso: string): boolean {
  if (url.Status !== "published") return false;
  const elapsed = hoursSince(url.Last_Posted_At, slotIso);
  return elapsed >= (url.Cooldown_Hours || 24);
}

export function assignSchedule(pins: PinDraft[], inventory: UrlInventoryItem[], weekStartIso: string): SchedulerResult {
  const warnings: string[] = [];
  const usedBySlot = new Map<string, string>();
  let cursor = weekStartIso;

  const sortedInv = [...inventory].sort((a, b) => b.Priority - a.Priority);

  for (let i = 0; i < pins.length; i += 1) {
    if (i > 0) {
      cursor = addHours(cursor, i % 4 === 0 ? 14 : 3);
    }
    const pin = pins[i];

    const eligible = sortedInv.find((url) => isUrlEligible(url, cursor));
    if (!eligible) {
      warnings.push(`No eligible URL at slot ${cursor} for pin ${pin.Content_ID}.`);
      continue;
    }

    const key = `${eligible.URL}_${new Date(cursor).toISOString().slice(0, 13)}`;
    if (usedBySlot.has(key)) {
      warnings.push(`Collision detected for ${eligible.URL} around ${cursor}.`);
    }

    pin.Destination_URL = eligible.URL;
    pin.Scheduled_At = cursor;
    eligible.Last_Posted_At = cursor;
    usedBySlot.set(key, pin.Content_ID);
  }

  return { pins, warnings };
}

export function validateNo24hRepeats(pins: PinDraft[]): string[] {
  const issues: string[] = [];
  const byUrl = new Map<string, string[]>();

  for (const pin of pins) {
    if (!pin.Scheduled_At) continue;
    const arr = byUrl.get(pin.Destination_URL) ?? [];
    arr.push(pin.Scheduled_At);
    byUrl.set(pin.Destination_URL, arr);
  }

  for (const [url, times] of byUrl.entries()) {
    const sorted = times.sort();
    for (let i = 1; i < sorted.length; i += 1) {
      const prev = new Date(sorted[i - 1]).getTime();
      const next = new Date(sorted[i]).getTime();
      const hours = (next - prev) / (1000 * 60 * 60);
      if (hours < 24) {
        issues.push(`URL repeat within 24h: ${url} (${sorted[i - 1]} -> ${sorted[i]})`);
      }
    }
  }

  return issues;
}

export function validateIntentDailyMix(pins: PinDraft[]): string[] {
  const issues: string[] = [];
  const dayMap = new Map<string, DestinationIntent[]>();

  for (const pin of pins) {
    if (!pin.Scheduled_At) continue;
    const day = pin.Scheduled_At.slice(0, 10);
    const bucket = dayMap.get(day) ?? [];
    bucket.push(pin.Destination_Intent);
    dayMap.set(day, bucket);
  }

  for (const [day, intents] of dayMap.entries()) {
    const counts = intents.reduce<Record<string, number>>((acc, i) => {
      acc[i] = (acc[i] ?? 0) + 1;
      return acc;
    }, {});
    for (const [intent, count] of Object.entries(counts)) {
      if (count >= 5) issues.push(`Daily stack risk on ${day}: ${intent} count=${count}`);
    }
  }

  return issues;
}
