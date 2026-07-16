"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { COMMAND_CENTER_CONTENT_AREAS } from "../../lib/constants";
import type { EditorialEditorModel } from "../../lib/editorial-admin";
import type { InspirationEditorModel } from "../../lib/inspiration-admin";
import { INSPIRATION_STYLE_OPTIONS } from "../../lib/inspiration-shared";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

type EditorialAction = "save" | "publish" | "unpublish" | "restore";
type ContentEditorModel = EditorialEditorModel | InspirationEditorModel;
const EDITORIAL_FLASH_KEY = "project-pint-editorial-flash";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function EditorialEditor({ initialModel }: { initialModel: ContentEditorModel }) {
  const router = useRouter();
  const [model, setModel] = useState(initialModel);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [status, setStatus] = useState("");
  const noun = model.kind === "blogs" ? "blog" : model.kind === "guides" ? "guide" : "inspiration entry";
  const listHref = `/admin/${model.kind}`;
  const isInspiration = model.kind === "inspiration";

  useUnsavedChangesGuard(dirty || saving);

  useEffect(() => {
    const message = window.sessionStorage.getItem(EDITORIAL_FLASH_KEY);
    if (!message) return;
    window.sessionStorage.removeItem(EDITORIAL_FLASH_KEY);
    setStatus(message);
  }, []);

  const publishReadiness = useMemo(() => {
    const issues: string[] = [];
    if (!model.title.trim()) issues.push("title");
    if (!model.slug.trim()) issues.push("slug");
    if (!model.body.trim()) issues.push("body");
    if (model.kind === "inspiration" && !model.style.trim()) issues.push("style");
    if (model.kind === "inspiration" && !model.metadata.excerpt.trim()) issues.push("description");
    if (model.kind === "inspiration" && !model.metadata.heroImageUrl) issues.push("hero image");
    if (model.metadata.heroImageUrl && !model.metadata.heroAlt.trim()) issues.push("hero alt text");
    if (model.metadata.heroImageUrl && model.metadata.heroRights !== "approved") issues.push("confirmed image rights");
    if (model.metadata.socialImageUrl && model.metadata.socialImageUrl !== model.metadata.heroImageUrl) {
      issues.push("a social image matching the rights-confirmed hero");
    }
    return issues;
  }, [model]);

  function update<K extends keyof ContentEditorModel>(key: K, value: ContentEditorModel[K]) {
    setModel((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setConflict(false);
  }

  function updateMetadata<K extends keyof ContentEditorModel["metadata"]>(key: K, value: ContentEditorModel["metadata"][K]) {
    setModel((current) => ({ ...current, metadata: { ...current.metadata, [key]: value } }));
    setDirty(true);
    setConflict(false);
  }

  async function runAction(action: EditorialAction) {
    if (action === "publish" && !window.confirm(`Publish this ${noun} to the public site?`)) return;
    if (action === "unpublish" && !window.confirm(`Unpublish this ${noun}? The public URL will stop resolving until it is published again.`)) return;
    if (action === "restore" && !window.confirm(`Restore the focused editor from the last published version? Unsaved edits will be replaced.`)) return;

    try {
      setSaving(true);
      setStatus(action === "save" ? "Saving draft..." : `${action[0].toUpperCase()}${action.slice(1)}ing...`);
      const endpoint = isInspiration ? "/api/admin/inspiration" : `/api/admin/editorial/${model.kind}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, model, revision: model.revision, id: model.id })
      });
      const body = (await response.json()) as { ok?: boolean; error?: string; conflict?: boolean; partial?: boolean; model?: ContentEditorModel };
      if (!response.ok || !body.ok || !body.model) {
        if (body.partial && body.model) {
          const wasNew = !model.id;
          const message = body.error ?? "The draft was saved, but the requested publication action did not complete.";
          setModel(body.model);
          setDirty(false);
          if (wasNew) {
            window.sessionStorage.setItem(EDITORIAL_FLASH_KEY, message);
            router.replace(`/admin/${body.model.kind}/${encodeURIComponent(body.model.id)}`);
          } else {
            router.refresh();
          }
        }
        setConflict(response.status === 409 || body.conflict === true);
        setStatus(body.error ?? "The editorial action failed.");
        return;
      }
      const wasNew = !model.id;
      setModel(body.model);
      setDirty(false);
      setConflict(false);
      const message = action === "publish" ? "Published version updated." : action === "save" ? "Draft saved." : `${action[0].toUpperCase()}${action.slice(1)} complete.`;
      setStatus(message);
      if (wasNew) {
        window.sessionStorage.setItem(EDITORIAL_FLASH_KEY, message);
        router.replace(`/admin/${body.model.kind}/${encodeURIComponent(body.model.id)}`);
      } else {
        router.refresh();
      }
    } catch {
      setStatus("The editorial action failed because the network is unavailable.");
    } finally {
      setSaving(false);
    }
  }

  async function reloadCurrent() {
    if (!model.id) return;
    try {
      const endpoint = isInspiration ? "/api/admin/inspiration" : `/api/admin/editorial/${model.kind}`;
      const response = await fetch(`${endpoint}?id=${encodeURIComponent(model.id)}`, { cache: "no-store" });
      const body = (await response.json()) as { ok?: boolean; error?: string; model?: ContentEditorModel };
      if (!response.ok || !body.ok || !body.model) {
        setStatus(body.error ?? "Unable to reload this item.");
        return;
      }
      setModel(body.model);
      setDirty(false);
      setConflict(false);
      setStatus("Current saved version reloaded.");
    } catch {
      setStatus("Unable to reload while the network is unavailable.");
    }
  }

  return (
    <form
      className="admin-editorial-workspace"
      onSubmit={(event) => {
        event.preventDefault();
        void runAction("save");
      }}
    >
      <header className="admin-editorial-header">
        <div>
          <Link href={listHref} className="admin-editorial-back">← Back to {model.kind}</Link>
          <p className="eyebrow">Focused editorial workspace</p>
          <h1>{model.id ? `Edit ${noun}` : `New ${noun}`}</h1>
          <p>Draft changes remain isolated from the last published snapshot until you explicitly publish.</p>
        </div>
        <div className="admin-editorial-header-actions">
          {model.id ? <Link href={`/admin/preview/${model.kind}/${encodeURIComponent(model.id)}`} className="btn btn-ghost">Preview saved draft</Link> : null}
          <button type="submit" className="btn btn-ghost" disabled={saving}>{saving ? "Working..." : "Save draft"}</button>
          <button type="button" className="btn btn-accent" disabled={saving || publishReadiness.length > 0} onClick={() => void runAction("publish")}>Publish</button>
        </div>
      </header>

      {status ? (
        <div className={`admin-editorial-notice${conflict ? " is-error" : ""}`} aria-live="polite">
          <span>{status}</span>
          {conflict ? <button type="button" className="btn btn-ghost" onClick={() => void reloadCurrent()}>Reload saved version</button> : null}
        </div>
      ) : null}

      <div className="admin-editorial-grid">
        <section className="admin-editorial-main">
          <div className="admin-editorial-card">
            <h2>Story</h2>
            <label>
              <span>Title</span>
              <input
                required
                value={model.title}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  const shouldGenerateSlug = !model.id && (!model.slug || model.slug === slugify(model.title));
                  setModel((current) => ({ ...current, title: nextTitle, slug: shouldGenerateSlug ? slugify(nextTitle) : current.slug }));
                  setDirty(true);
                }}
                maxLength={300}
              />
            </label>
            <label>
              <span>Slug</span>
              <div className="admin-editorial-slug-row"><code>/{model.kind === "blogs" ? "blog" : model.kind === "guides" ? "guides" : "inspiration"}/</code><input required value={model.slug} onChange={(event) => update("slug", slugify(event.target.value))} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></div>
            </label>
            <label>
              <span>{isInspiration ? "Description" : "Excerpt"}</span>
              <textarea value={model.metadata.excerpt} onChange={(event) => updateMetadata("excerpt", event.target.value)} maxLength={280} rows={3} />
              <small>{model.metadata.excerpt.length}/280</small>
            </label>
            <label>
              <span>{isInspiration ? "Board story / Markdown body" : "Markdown body"}</span>
              <textarea required className="admin-editorial-body" value={model.body} onChange={(event) => update("body", event.target.value)} rows={24} />
            </label>
          </div>

          <div className="admin-editorial-card">
            <h2>Media</h2>
            <label><span>Hero image URL</span><input type="url" pattern="https://.+" title="Use an HTTPS image URL." value={model.metadata.heroImageUrl} onChange={(event) => updateMetadata("heroImageUrl", event.target.value)} placeholder="https://" /></label>
            {model.metadata.heroImageUrl ? <div className="admin-editorial-media-preview" role="img" aria-label={model.metadata.heroAlt || "Hero media preview"} style={{ backgroundImage: `url(${model.metadata.heroImageUrl})` }} /> : <div className="admin-editorial-empty-media">Add an approved image URL to preview its crop.</div>}
            <div className="admin-editorial-two-column">
              <label><span>Alt text</span><input value={model.metadata.heroAlt} onChange={(event) => updateMetadata("heroAlt", event.target.value)} maxLength={240} /></label>
              <label><span>Rights status</span><select value={model.metadata.heroRights} onChange={(event) => updateMetadata("heroRights", event.target.value as "unverified" | "approved")}><option value="unverified">Not yet confirmed</option><option value="approved">Rights confirmed</option></select></label>
              <label><span>Caption</span><input value={model.metadata.heroCaption} onChange={(event) => updateMetadata("heroCaption", event.target.value)} maxLength={280} /></label>
              <label><span>Credit / source</span><input value={model.metadata.heroCredit} onChange={(event) => updateMetadata("heroCredit", event.target.value)} maxLength={180} /></label>
            </div>
          </div>

          <div className="admin-editorial-card">
            <h2>Search and social</h2>
            <label><span>SEO title</span><input value={model.metadata.seoTitle} onChange={(event) => updateMetadata("seoTitle", event.target.value)} maxLength={70} /><small>{model.metadata.seoTitle.length}/70</small></label>
            <label><span>SEO description</span><textarea value={model.metadata.seoDescription} onChange={(event) => updateMetadata("seoDescription", event.target.value)} maxLength={180} rows={3} /><small>{model.metadata.seoDescription.length}/180</small></label>
            <label><span>Canonical URL override</span><input type="text" value={model.metadata.canonicalUrl} onChange={(event) => updateMetadata("canonicalUrl", event.target.value)} placeholder="/same-site-path or https://" /></label>
            <label><span>Social image URL</span><input type="url" pattern="https://.+" title="Use the same rights-confirmed HTTPS URL as the hero image." value={model.metadata.socialImageUrl} onChange={(event) => updateMetadata("socialImageUrl", event.target.value)} placeholder="Defaults to hero image" /><small>Leave blank to use the hero, or repeat the same rights-confirmed hero URL.</small></label>
            <label className="admin-editorial-checkbox"><input type="checkbox" checked={model.metadata.indexable} onChange={(event) => updateMetadata("indexable", event.target.checked)} /><span>Allow public search indexing when published</span></label>
          </div>
        </section>

        <aside className="admin-editorial-rail">
          <div className="admin-editorial-card admin-editorial-sticky-card">
            <h2>Publication</h2>
            <label><span>Workflow</span><select value={model.workflowStatus} onChange={(event) => update("workflowStatus", event.target.value as "draft" | "approved")}><option value="draft">Draft</option><option value="approved">Approved for publish</option></select></label>
            <label><span>Area</span><select value={model.area} onChange={(event) => update("area", event.target.value)}>{COMMAND_CENTER_CONTENT_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}</select></label>
            {model.kind === "inspiration" ? (
              <label><span>Style</span><select value={model.style} onChange={(event) => { setModel((current) => current.kind === "inspiration" ? { ...current, style: event.target.value } : current); setDirty(true); setConflict(false); }}>{INSPIRATION_STYLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            ) : null}
            <div className="admin-editorial-two-column">
              <label><span>Date</span><input value={model.publishDate} onChange={(event) => update("publishDate", event.target.value)} placeholder="MM/DD/YYYY" pattern="\d{2}/\d{2}/\d{4}" /></label>
              <label><span>Time</span><input type="time" value={model.publishTime} onChange={(event) => update("publishTime", event.target.value)} /></label>
            </div>
            {!isInspiration ? <label><span>Author / byline</span><input value={model.metadata.authorName} onChange={(event) => updateMetadata("authorName", event.target.value)} maxLength={120} /></label> : null}
            <label><span>{isInspiration ? "Tags" : "Keywords"}</span><input value={model.keywords} onChange={(event) => update("keywords", event.target.value)} placeholder="Comma-separated" /></label>
            {model.kind === "guides" ? <label><span>Related blog ID</span><input value={model.relatedBlogId} onChange={(event) => update("relatedBlogId", event.target.value)} /></label> : null}
            {!isInspiration ? <label><span>CTA target</span><input value={model.ctaTarget} onChange={(event) => update("ctaTarget", event.target.value)} placeholder="/start-here" /></label> : null}
            <div className="admin-editorial-readiness">
              <strong>{publishReadiness.length === 0 ? "Ready for the publication gate" : "Needs attention"}</strong>
              <p>{publishReadiness.length === 0 ? "Required fields and media provenance are present." : `Add ${publishReadiness.join(", ")}.`}</p>
            </div>
            {model.hasPublishedVersion ? (
              <div className="admin-editorial-published-actions">
                <p>Published snapshot: {model.publishedAt || "available"}</p>
                <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => void runAction("restore")}>Restore published</button>
                <button type="button" className="btn btn-danger" disabled={saving} onClick={() => void runAction("unpublish")}>Unpublish</button>
              </div>
            ) : null}
          </div>

          {!isInspiration ? <details className="admin-editorial-card">
            <summary>Quality and writer brief</summary>
            <p><strong>Quality score:</strong> {model.qualityScore || "Not scored yet"}</p>
            <p className="admin-editorial-quality-copy">{model.qualityChecks || "Save the draft to refresh quality checks."}</p>
            <label><span>Writer brief</span><textarea value={model.writerBrief} onChange={(event) => update("writerBrief", event.target.value)} rows={12} /></label>
          </details> : null}
        </aside>
      </div>
    </form>
  );
}
