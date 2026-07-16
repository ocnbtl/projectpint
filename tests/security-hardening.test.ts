import assert from "node:assert/strict";
import test from "node:test";
import { parseCommandCenterOperation } from "../lib/command-center-operations.ts";
import { editorialMetadataSchema } from "../lib/editorial-content.ts";
import { toCsv } from "../lib/io.ts";
import { isSameOriginMutation } from "../lib/request-security.ts";

const emptyAreaCounts = {
  Plants: 0,
  Mirror: 0,
  Storage: 0,
  Lighting: 0,
  Shower: 0,
  Renter: 0,
  DIY: 0,
  ExtremeBudget: 0
};

test("command-center operations enforce action-specific bounded payloads", () => {
  assert.deepEqual(
    parseCommandCenterOperation({ action: "generate_new_pins", payload: { count: 25 } }),
    { action: "generate_new_pins", payload: { count: 25 } }
  );
  assert.deepEqual(
    parseCommandCenterOperation({
      action: "generate_new_emails",
      payload: { areaCounts: { ...emptyAreaCounts, Plants: 25, DIY: 25 } }
    }).payload,
    { areaCounts: { ...emptyAreaCounts, Plants: 25, DIY: 25 } }
  );

  assert.throws(() => parseCommandCenterOperation({ action: "generate_new_pins", payload: { count: 1.5 } }));
  assert.throws(() => parseCommandCenterOperation({ action: "generate_new_pins", payload: { count: 101 } }));
  assert.throws(() => parseCommandCenterOperation({ action: "generate_new_pins", payload: { count: 25, extra: true } }));
  assert.throws(() => parseCommandCenterOperation({
    action: "generate_new_blogs",
    payload: { areaCounts: { ...emptyAreaCounts, Plants: 2 } }
  }));
  assert.throws(() => parseCommandCenterOperation({
    action: "generate_new_emails",
    payload: { areaCounts: { ...emptyAreaCounts, Plants: 25, Mirror: 25, Storage: 25, Lighting: 25, Shower: 1 } }
  }));
  assert.throws(() => parseCommandCenterOperation({ action: "update_product_stats", payload: {} }));
});

test("CSV output neutralizes spreadsheet formula prefixes without changing normal text", () => {
  const csv = toCsv([
    { value: "=HYPERLINK(\"https://example.com\")" },
    { value: "+SUM(1,2)" },
    { value: "-2+3" },
    { value: "@SUM(1,2)" },
    { value: "  =1+1" },
    { value: "\t=1+1" },
    { value: "ordinary text" }
  ], ["value"]);

  assert.match(csv, /'\=HYPERLINK/);
  assert.match(csv, /'\+SUM/);
  assert.match(csv, /'\-2\+3/);
  assert.match(csv, /'@SUM/);
  assert.match(csv, /'  =1\+1/);
  assert.match(csv, /'\t=1\+1/);
  assert.match(csv, /\nordinary text$/);
});

test("editorial URLs allow HTTPS media and safe canonical overrides only", () => {
  const parsed = editorialMetadataSchema.parse({
    heroImageUrl: "https://images.example.com/hero.jpg",
    socialImageUrl: "https://images.example.com/hero.jpg",
    canonicalUrl: "/blog/same-site"
  });
  assert.equal(parsed.canonicalUrl, "/blog/same-site");
  assert.equal(editorialMetadataSchema.parse({ canonicalUrl: "https://canonical.example.com/story" }).canonicalUrl, "https://canonical.example.com/story");

  assert.throws(() => editorialMetadataSchema.parse({ heroImageUrl: "http://images.example.com/hero.jpg" }));
  assert.throws(() => editorialMetadataSchema.parse({ socialImageUrl: "javascript:alert(1)" }));
  assert.throws(() => editorialMetadataSchema.parse({
    heroImageUrl: "https://images.example.com/hero.jpg",
    socialImageUrl: "https://images.example.com/unverified-social.jpg"
  }));
  assert.throws(() => editorialMetadataSchema.parse({ canonicalUrl: "//evil.example/story" }));
  assert.throws(() => editorialMetadataSchema.parse({ canonicalUrl: "/\\evil.example/story" }));
  assert.throws(() => editorialMetadataSchema.parse({ canonicalUrl: "http://canonical.example.com/story" }));
});

test("same-origin mutation checks exact protocol and host across Vercel and local requests", () => {
  const vercelRequest = new Request("http://internal.vercel/api/admin", {
    method: "POST",
    headers: {
      origin: "https://projectpint.vercel.app",
      "sec-fetch-site": "same-origin",
      "x-forwarded-host": "projectpint.vercel.app",
      "x-forwarded-proto": "https"
    }
  });
  assert.equal(isSameOriginMutation(vercelRequest), true);

  assert.equal(isSameOriginMutation(new Request("https://projectpint.vercel.app/api/admin", {
    method: "POST",
    headers: { origin: "http://projectpint.vercel.app", "sec-fetch-site": "same-origin" }
  })), false);
  assert.equal(isSameOriginMutation(new Request("https://projectpint.vercel.app/api/admin", {
    method: "POST",
    headers: { origin: "https://evil.example", "sec-fetch-site": "same-site" }
  })), false);
  assert.equal(isSameOriginMutation(new Request("http://127.0.0.1:3015/api/admin", {
    method: "POST",
    headers: { origin: "http://127.0.0.1:3015", "sec-fetch-site": "same-origin" }
  })), true);
  assert.equal(isSameOriginMutation(new Request("http://127.0.0.1:3015/api/admin", {
    method: "POST",
    headers: { "sec-fetch-site": "same-origin" }
  })), true);
  assert.equal(isSameOriginMutation(new Request("http://127.0.0.1:3015/api/admin", {
    method: "POST"
  })), true);
  assert.equal(isSameOriginMutation(new Request("http://127.0.0.1:3015/api/admin", {
    method: "POST",
    headers: { "sec-fetch-site": "same-site" }
  })), false);
  assert.equal(isSameOriginMutation(new Request("https://projectpint.vercel.app/api/admin", {
    method: "POST",
    headers: { origin: "https://projectpint.vercel.app", "sec-fetch-site": "cross-site" }
  })), false);
});
