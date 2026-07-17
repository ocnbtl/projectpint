import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  InspirationConflictError,
  InspirationValidationError,
  blankInspirationModel,
  inspirationEditorInputSchema,
  loadInspirationEditorModel,
  publishInspirationItem,
  readPublishedManagedInspirations,
  restoreInspirationItem,
  saveInspirationEditorModel,
  unpublishInspirationItem
} from "../lib/inspiration-admin.ts";
import { readPublicInspirationViews } from "../lib/inspiration-content.ts";
import { inspirationStyles } from "../lib/redesign-data.ts";

test("every static inspiration board uses a cohesive style pool and two exact product destinations", () => {
  assert.equal(inspirationStyles.length, 11);

  for (const style of inspirationStyles) {
    const images = style.items.filter((item) => item.type === "image");
    const products = style.items.filter((item) => item.type === "product");

    assert.equal(images.length, 8, style.slug);
    assert.equal(products.length, 2, style.slug);
    assert.ok(images.every((item) => item.src === style.cover || item.src.includes(`/images/inspiration/${style.slug}/`)));
    assert.ok(products.every((item) => item.url.startsWith("https://")));
    assert.ok(products.every((item) => item.image.includes(`/images/inspiration/${style.slug}/`)));
  }
});

test("inspiration drafts, snapshots, conflicts, restore, and fallback remain isolated", async (context) => {
  const dataRoot = await fs.mkdtemp(path.join(os.tmpdir(), "project-pint-inspiration-"));
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

  const blank = blankInspirationModel();
  const initialInput = {
    ...blank,
    title: "A Calm Warm Bathroom",
    slug: "calm-warm-bathroom",
    style: "warm-editorial",
    area: "Lighting",
    workflowStatus: "draft" as const,
    publishDate: "07/16/2026",
    keywords: "warm light, plaster",
    body: "## Start with the light\n\nUse soft, layered light before adding decorative details.",
    metadata: {
      ...blank.metadata,
      excerpt: "A warm bathroom board built around soft light and practical texture.",
      heroImageUrl: "https://images.unsplash.com/photo-1234567890",
      heroAlt: "Warm bathroom with soft layered lighting",
      heroCaption: "A warm, softly lit bathroom",
      heroCredit: "Approved editorial source",
      heroRights: "approved" as const,
      seoTitle: "Warm Bathroom Inspiration",
      seoDescription: "Explore a warm bathroom board with practical lighting and texture ideas.",
      socialImageUrl: "https://images.unsplash.com/photo-1234567890",
      indexable: true
    }
  };

  const draft = await saveInspirationEditorModel(initialInput, blank.revision);
  assert.match(draft.id, /^INSP_\d{4}$/);
  assert.equal((await readPublishedManagedInspirations()).length, 0);
  assert.equal((await readPublicInspirationViews()).length, 11, "static V15 boards remain the empty-managed fallback");

  const approved = await saveInspirationEditorModel({ ...draft, workflowStatus: "approved" }, draft.revision);
  await publishInspirationItem(approved.id);
  const publishedModel = await loadInspirationEditorModel(approved.id);
  assert.ok(publishedModel?.hasPublishedVersion);
  assert.equal((await readPublishedManagedInspirations())[0]?.title, "A Calm Warm Bathroom");
  const mergedPublic = await readPublicInspirationViews();
  assert.equal(mergedPublic.length, 12);
  assert.equal(mergedPublic.find((entry) => entry.slug === "calm-warm-bathroom")?.source, "managed");
  assert.ok((mergedPublic.find((entry) => entry.slug === "calm-warm-bathroom")?.items.length ?? 0) > 0);

  const changedDraft = await saveInspirationEditorModel(
    { ...publishedModel!, title: "Unpublished title change", workflowStatus: "approved" },
    publishedModel!.revision
  );
  assert.equal((await readPublishedManagedInspirations())[0]?.title, "A Calm Warm Bathroom", "draft edits cannot replace the published snapshot");

  await assert.rejects(
    () => saveInspirationEditorModel({ ...publishedModel!, title: "Stale edit" }, publishedModel!.revision),
    InspirationConflictError
  );
  await assert.rejects(
    () => saveInspirationEditorModel({ ...blank, title: "Duplicate", slug: changedDraft.slug, body: "Body" }, blank.revision),
    InspirationValidationError
  );

  await restoreInspirationItem(changedDraft.id);
  assert.equal((await loadInspirationEditorModel(changedDraft.id))?.title, "A Calm Warm Bathroom");
  await unpublishInspirationItem(changedDraft.id);
  assert.equal((await readPublishedManagedInspirations()).length, 0);
  assert.equal((await readPublicInspirationViews()).length, 11);
});

test("inspiration media and social URLs require HTTPS", () => {
  const blank = blankInspirationModel();
  const result = inspirationEditorInputSchema.safeParse({
    ...blank,
    title: "Unsafe media",
    slug: "unsafe-media",
    body: "Body",
    metadata: { ...blank.metadata, heroImageUrl: "http://example.com/image.jpg" }
  });
  assert.equal(result.success, false);
});

test("inspiration admin and storage surfaces retain the release boundaries", async () => {
  const [editor, guard, api, nav, migration, publicIndex, publicDetail] = await Promise.all([
    fs.readFile(path.join(process.cwd(), "components/admin/EditorialEditor.tsx"), "utf8"),
    fs.readFile(path.join(process.cwd(), "components/admin/useUnsavedChangesGuard.ts"), "utf8"),
    fs.readFile(path.join(process.cwd(), "app/api/admin/inspiration/route.ts"), "utf8"),
    fs.readFile(path.join(process.cwd(), "components/admin/AdminFrame.tsx"), "utf8"),
    fs.readFile(path.join(process.cwd(), "supabase/migrations/20260716_inspiration_evergreen.sql"), "utf8"),
    fs.readFile(path.join(process.cwd(), "app/inspiration/page.tsx"), "utf8"),
    fs.readFile(path.join(process.cwd(), "app/inspiration/[slug]/page.tsx"), "utf8")
  ]);

  assert.match(editor, /useUnsavedChangesGuard/);
  assert.match(guard, /beforeunload/);
  assert.match(guard, /navigationType !== "traverse"/);
  assert.match(editor, /INSPIRATION_STYLE_OPTIONS/);
  assert.match(editor, /\/api\/admin\/inspiration/);
  assert.match(api, /isAdminSessionValid/);
  assert.match(api, /isSameOriginMutation/);
  assert.match(api, /PRIVATE_NO_STORE_HEADERS/);
  assert.match(nav, /\/admin\/inspiration/);
  assert.match(migration, /create table if not exists public\.inspiration_evergreen/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all privileges/);
  assert.match(publicIndex, /readPublicInspirationViews/);
  assert.match(publicDetail, /findPublicInspirationView/);
});
