import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(relativePath: string) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("admin routes declare an explicit noindex policy", async () => {
  const layout = await source("app/admin/layout.tsx");

  assert.match(layout, /robots:\s*\{/);
  assert.match(layout, /index:\s*false/);
  assert.match(layout, /follow:\s*false/);
});

test("users are exposed at the canonical admin route without editable customer controls", async () => {
  const usersPage = await source("app/admin/users/page.tsx");
  const aliasPage = await source("app/admin/customers/page.tsx");
  const readOnlyTable = await source("components/admin/ReadOnlyCustomersTable.tsx");

  assert.match(usersPage, /ReadOnlyCustomersTable/);
  assert.match(aliasPage, /redirect\("\/admin\/users"\)/);
  assert.match(readOnlyTable, /Read only/);
  assert.doesNotMatch(readOnlyTable, /Delete row|Save now|Autosaving/);
});

test("pin analytics never derives synthetic performance metrics", async () => {
  const analyticsPage = await source("app/admin/analytics/page.tsx");

  assert.doesNotMatch(analyticsPage, /stableNumber|statusMultiplier|mediaMultiplier|saveRateBase|clickRateBase/);
  assert.match(analyticsPage, /No estimated or synthetic performance values are shown/);
  assert.match(analyticsPage, /Operational pin totals, workflow status, export readiness/);
});

test("admin operations expose confirmation and live status feedback", async () => {
  const opsButton = await source("components/admin/OpsButton.tsx");

  assert.match(opsButton, /window\.confirm/);
  assert.match(opsButton, /aria-live="polite"/);
  assert.match(opsButton, /role="status"/);
});

test("admin recovery routes and editorial navigation preserve branded state and success feedback", async () => {
  const notFoundState = await source("components/admin/AdminNotFoundState.tsx");
  const middleware = await source("middleware.ts");
  const preview = await source("app/admin/preview/[kind]/[id]/page.tsx");
  const editor = await source("components/admin/EditorialEditor.tsx");

  assert.match(middleware, /function adminNotFoundResponse/);
  assert.match(middleware, /status: 404/);
  assert.match(middleware, /X-Robots-Tag/);
  assert.match(middleware, /private, no-store/);
  assert.match(notFoundState, /That admin item is not available/);
  assert.match(preview, /blocks\[0\]\?\.type === "h1" \? blocks\.slice\(1\) : blocks/);
  assert.match(preview, /blocks=\{contentBlocks\}/);
  assert.match(editor, /project-pint-editorial-flash/);
  assert.match(editor, /sessionStorage\.setItem/);
  assert.match(editor, /sessionStorage\.removeItem/);
});

test("mobile admin drawer restores focus after its unmount commit", async () => {
  const frameSource = await source("components/admin/AdminFrame.tsx");

  assert.match(frameSource, /const restoreTarget = priorFocusRef\.current\?\.isConnected/);
  assert.match(frameSource, /requestAnimationFrame\(\(\) => \{/);
  assert.match(frameSource, /restoreTarget\?\.isConnected \? restoreTarget : fallbackFocus/);
});
