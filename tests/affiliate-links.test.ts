import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  AffiliateLinkConflictError,
  applyAffiliateLinks,
  parseAffiliateLinkRows,
  readAffiliateLinks,
  saveAffiliateLinks
} from "../lib/affiliate-links.ts";
import { inspirationStyles } from "../lib/redesign-data.ts";

test("affiliate link defaults cover every Inspiration product with Amazon-only destinations", async (context) => {
  const dataRoot = await fs.mkdtemp(path.join(os.tmpdir(), "project-pint-affiliates-"));
  const previousMode = process.env.STORAGE_MODE;
  const previousRoot = process.env.LOCAL_DATA_ROOT;
  process.env.STORAGE_MODE = "local";
  process.env.LOCAL_DATA_ROOT = dataRoot;
  context.after(async () => {
    if (previousMode === undefined) delete process.env.STORAGE_MODE;
    else process.env.STORAGE_MODE = previousMode;
    if (previousRoot === undefined) delete process.env.LOCAL_DATA_ROOT;
    else process.env.LOCAL_DATA_ROOT = previousRoot;
    await fs.rm(dataRoot, { recursive: true, force: true });
  });

  const rows = await readAffiliateLinks();
  assert.equal(rows.length, inspirationStyles.length * 2);
  assert.equal(new Set(rows.map((row) => row.Link_ID)).size, rows.length);
  assert.ok(rows.every((row) => row.Status === "active"));
  assert.ok(rows.every((row) => {
    const hostname = new URL(row.Product_URL).hostname;
    return hostname === "amzn.to" || hostname === "amazon.com" || hostname.endsWith(".amazon.com");
  }));

  assert.throws(() => parseAffiliateLinkRows([{ ...rows[0], Product_URL: "https://example.com/not-amazon" }]));
  assert.throws(() => parseAffiliateLinkRows([rows[0], rows[0]]));
});

test("affiliate links persist with conflict protection and control public product visibility", async (context) => {
  const dataRoot = await fs.mkdtemp(path.join(os.tmpdir(), "project-pint-affiliate-save-"));
  const previousMode = process.env.STORAGE_MODE;
  const previousRoot = process.env.LOCAL_DATA_ROOT;
  process.env.STORAGE_MODE = "local";
  process.env.LOCAL_DATA_ROOT = dataRoot;
  context.after(async () => {
    if (previousMode === undefined) delete process.env.STORAGE_MODE;
    else process.env.STORAGE_MODE = previousMode;
    if (previousRoot === undefined) delete process.env.LOCAL_DATA_ROOT;
    else process.env.LOCAL_DATA_ROOT = previousRoot;
    await fs.rm(dataRoot, { recursive: true, force: true });
  });

  const baseRows = await readAffiliateLinks();
  const editedRows = baseRows.map((row, index) => index === 0 ? {
    ...row,
    Product_URL: "https://www.amazon.com/dp/B000000000",
    Product_Name: "Updated Amazon product"
  } : row);
  await saveAffiliateLinks(editedRows, baseRows);
  assert.equal((await readAffiliateLinks())[0].Product_Name, "Updated Amazon product");
  await assert.rejects(() => saveAffiliateLinks(baseRows, baseRows), AffiliateLinkConflictError);

  const style = inspirationStyles[0];
  const hiddenRows = editedRows.map((row, index) => index === 0 ? { ...row, Status: "draft" } : row);
  const visibleItems = applyAffiliateLinks(style.items, hiddenRows);
  assert.equal(visibleItems.filter((item) => item.type === "product").length, 1);
});

test("the authenticated admin route allowlist includes Affiliate Links", async () => {
  const middleware = await fs.readFile(path.join(process.cwd(), "middleware.ts"), "utf8");
  assert.match(middleware, /affiliate-links/);
  assert.match(middleware, /Cache-Control", "private, no-store"/);
});
