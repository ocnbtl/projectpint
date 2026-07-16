import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  buildBlogDraftContent,
  loadEvergreenTab,
  publishEditorialItem,
  saveEvergreenTab,
  unpublishEditorialItem
} from "../lib/command-center.ts";
import { parseCommandCenterRows } from "../lib/command-center-validation.ts";
import { blankEditorialModel, saveEditorialEditorModel } from "../lib/editorial-admin.ts";
import { parseEditorialDocument, serializeEditorialDocument } from "../lib/editorial-content.ts";
import { mergeEditorialAdminSave, publicEditorialRows } from "../lib/editorial-publication.ts";
import { loadRuntimeTab, saveRuntimeTab } from "../lib/runtime-store.ts";

test("editorial metadata round-trips without leaking into the rendered Markdown body", () => {
  const document = serializeEditorialDocument("# A useful bathroom plan", {
    authorName: "Editor",
    excerpt: "A short summary.",
    heroImageUrl: "https://images.example.com/hero.jpg",
    heroAlt: "A compact bathroom with renter-safe storage",
    heroCaption: "",
    heroCredit: "Approved library",
    heroRights: "approved",
    seoTitle: "A useful bathroom plan",
    seoDescription: "Practical upgrades for a compact renter bathroom.",
    canonicalUrl: "",
    socialImageUrl: "",
    indexable: true
  });
  const parsed = parseEditorialDocument(document);
  assert.equal(parsed.body, "# A useful bathroom plan");
  assert.equal(parsed.metadata.authorName, "Editor");
  assert.equal(parsed.metadata.heroRights, "approved");
});

test("focused editor metadata survives the legacy command-center save pipeline", async (context) => {
  const dataRoot = await fs.mkdtemp(path.join(os.tmpdir(), "project-pint-editor-metadata-"));
  const previousStorageMode = process.env.STORAGE_MODE;
  const previousDataRoot = process.env.LOCAL_DATA_ROOT;
  process.env.STORAGE_MODE = "local";
  process.env.LOCAL_DATA_ROOT = dataRoot;
  context.after(async () => {
    if (previousStorageMode === undefined) delete process.env.STORAGE_MODE;
    else process.env.STORAGE_MODE = previousStorageMode;
    if (previousDataRoot === undefined) delete process.env.LOCAL_DATA_ROOT;
    else process.env.LOCAL_DATA_ROOT = previousDataRoot;
    await fs.rm(dataRoot, { recursive: true, force: true });
  });

  const blank = blankEditorialModel("blogs");
  const saved = await saveEditorialEditorModel({
    ...blank,
    title: "Renter-friendly storage plan",
    slug: "renter-friendly-storage-plan",
    area: "Storage",
    body: "## A renter-friendly plan\n\nUse removable, renter-safe storage.",
    metadata: {
      ...blank.metadata,
      authorName: "Editor",
      excerpt: "A renter-friendly storage plan.",
      seoTitle: "Renter-friendly storage plan"
    }
  }, blank.revision);

  const rows = await loadRuntimeTab<Record<string, unknown>>("Blogs_Evergreen");
  const stored = String(rows.find((row) => row.Blog_ID === saved.id)?.Blog_Content ?? "");
  const parsed = parseEditorialDocument(stored);
  assert.equal(parsed.metadata.authorName, "Editor");
  assert.equal(parsed.metadata.excerpt, "A renter-friendly storage plan.");
  assert.equal(parsed.metadata.seoTitle, "Renter-friendly storage plan");
  assert.doesNotMatch(parsed.body, /project pint:editorial/);
});

test("published companion rows isolate public content from later admin edits", () => {
  const original = { Blog_ID: "BLOG_0001", Workflow_Status: "published", Blog_Title: "Original" };
  const edited = { Blog_ID: "BLOG_0001", Workflow_Status: "approved", Blog_Title: "Edited draft" };
  const merged = mergeEditorialAdminSave("blogs", [original], [edited]);
  assert.equal(merged.length, 2);
  const publicRows = publicEditorialRows("blogs", merged);
  assert.equal(publicRows.length, 1);
  assert.equal(publicRows[0]?.Blog_ID, "BLOG_0001");
  assert.equal(publicRows[0]?.Blog_Title, "Original");
});

test("command-center row validation rejects unknown fields and accepts the exact table shape", () => {
  const valid = parseCommandCenterRows("customers", [{
    User_ID: "USER_00001",
    User_Email: "reader@example.com",
    User_Date_Email: "07/16/2026",
    User_Time_Email: "09:00",
    Content_Area: "Plants",
    Purchases: ""
  }]);
  assert.equal(valid.length, 1);
  assert.throws(() => parseCommandCenterRows("customers", [{ ...valid[0], Unexpected: "no" }]));
});

test("local publish workflow preserves a snapshot, updates it explicitly, and supports unpublish", async () => {
  const previousCwd = process.cwd();
  const previousStorageMode = process.env.STORAGE_MODE;
  const previousForceLocal = process.env.FORCE_LOCAL_SHEETS;
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "project-pint-editorial-"));
  process.chdir(tempDir);
  process.env.STORAGE_MODE = "local";
  process.env.FORCE_LOCAL_SHEETS = "1";

  try {
    const originalContent = buildBlogDraftContent("DIY");
    const original = {
      Blog_ID: "BLOG_0001",
      Blog_Publish_Date: "07/16/2026",
      Blog_Publish_Time: "09:00",
      Content_Area: "DIY",
      Workflow_Status: "published",
      Blog_URL: "/blog/original-plan",
      Blog_Title: "Original bathroom plan",
      Blog_Keywords: "bathroom diy",
      Blog_Content: originalContent,
      Writer_Brief: "",
      CTA_Target: "/start-here",
      Quality_Score: "100",
      Quality_Checks: "PASS",
      Related_Pins: "",
      Published_To_Public_At: "2026-07-16T13:00:00.000Z"
    };
    await saveRuntimeTab("Blogs_Evergreen", [original]);

    const baseRows = await loadEvergreenTab("blogs");
    const editedRows = [
      ...baseRows.map((row) => ({
        ...row,
        Workflow_Status: "approved",
        Blog_Title: "Updated bathroom plan",
        Blog_URL: "/blog/updated-plan"
      })),
      {
        ...original,
        Blog_ID: "BLOG_0002",
        Workflow_Status: "published",
        Blog_Title: "Direct publication attempt",
        Blog_URL: "/blog/direct-publication-attempt",
        Published_To_Public_At: ""
      }
    ];
    await saveEvergreenTab("blogs", editedRows, baseRows);

    let rawRows = await loadRuntimeTab<Record<string, unknown>>("Blogs_Evergreen");
    assert.equal(publicEditorialRows("blogs", rawRows)[0]?.Blog_Title, "Original bathroom plan");
    assert.equal(
      rawRows.find((row) => row.Blog_ID === "BLOG_0002")?.Workflow_Status,
      "approved",
      "bulk saves cannot bypass the explicit publication gate"
    );
    assert.equal(publicEditorialRows("blogs", rawRows).some((row) => row.Blog_ID === "BLOG_0002"), false);

    await publishEditorialItem("blogs", "BLOG_0001");
    rawRows = await loadRuntimeTab<Record<string, unknown>>("Blogs_Evergreen");
    assert.equal(publicEditorialRows("blogs", rawRows)[0]?.Blog_Title, "Updated bathroom plan");
    const publishedAt = String(rawRows.find((row) => row.Blog_ID === "BLOG_0001")?.Published_To_Public_At ?? "");
    assert.match(publishedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.equal(new Date(publishedAt).toISOString(), publishedAt);

    await unpublishEditorialItem("blogs", "BLOG_0001");
    rawRows = await loadRuntimeTab<Record<string, unknown>>("Blogs_Evergreen");
    assert.equal(publicEditorialRows("blogs", rawRows).length, 0);
  } finally {
    process.chdir(previousCwd);
    if (previousStorageMode === undefined) delete process.env.STORAGE_MODE;
    else process.env.STORAGE_MODE = previousStorageMode;
    if (previousForceLocal === undefined) delete process.env.FORCE_LOCAL_SHEETS;
    else process.env.FORCE_LOCAL_SHEETS = previousForceLocal;
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
