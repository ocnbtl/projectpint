import assert from "node:assert/strict";
import test from "node:test";
import {
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  validateAdminPassword,
  verifyAdminSessionToken
} from "../lib/admin-session.ts";

test("admin session token verifies when signed with configured secret", async () => {
  process.env.ADMIN_PASSWORD = "bathroom-secret";
  process.env.ADMIN_SESSION_SECRET = "long-session-secret";

  const now = Date.UTC(2026, 2, 5, 12, 0, 0);
  const token = await createAdminSessionToken(now);

  assert.equal(await verifyAdminSessionToken(token, now + 1000), true);
  assert.equal(await validateAdminPassword("bathroom-secret"), true);
  assert.equal(await validateAdminPassword("wrong"), false);
});

test("admin session token rejects tampering and expiry", async () => {
  process.env.ADMIN_PASSWORD = "bathroom-secret";
  process.env.ADMIN_SESSION_SECRET = "long-session-secret";

  const now = Date.UTC(2026, 2, 5, 12, 0, 0);
  const token = await createAdminSessionToken(now);
  const tampered = `${token.slice(0, -1)}x`;

  assert.equal(await verifyAdminSessionToken(tampered, now + 1000), false);
  assert.equal(await verifyAdminSessionToken(token, now + ADMIN_SESSION_TTL_SECONDS * 1000 + 1), false);
});
