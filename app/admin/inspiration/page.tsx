import Link from "next/link";
import { AdminFrame } from "../../../components/admin/AdminFrame";
import { listInspirationEditorModels } from "../../../lib/inspiration-admin";
import { inspirationStyleLabel } from "../../../lib/inspiration-shared";

export const dynamic = "force-dynamic";

export default async function AdminInspirationPage() {
  const entries = (await listInspirationEditorModels()).sort((left, right) => left.title.localeCompare(right.title));
  const published = entries.filter((entry) => entry.hasPublishedVersion).length;
  const drafts = entries.length - published;

  return (
    <AdminFrame>
      <section className="admin-sheet-hero">
        <div className="admin-hero-head">
          <div className="admin-hero-copy">
            <h1>Inspiration</h1>
            <div className="admin-hero-description"><p>Build visual style boards while keeping saved drafts isolated from the public version.</p></div>
          </div>
          <Link href="/admin/inspiration/new" className="btn btn-accent">New inspiration entry</Link>
        </div>
        <div className="admin-sheet-summary-grid" aria-label="Inspiration summary">
          <article className="admin-sheet-summary-card admin-sheet-summary-green"><p>Total entries</p><strong>{entries.length}</strong><span>Managed inspiration records</span></article>
          <article className="admin-sheet-summary-card admin-sheet-summary-blue"><p>Published</p><strong>{published}</strong><span>Public snapshots</span></article>
          <article className="admin-sheet-summary-card admin-sheet-summary-gold"><p>Draft only</p><strong>{drafts}</strong><span>Not visible publicly</span></article>
        </div>
      </section>

      <section className="admin-panel admin-datasheet-panel" aria-labelledby="inspiration-table-title">
        <div className="admin-datasheet-head is-compact">
          <div className="admin-datasheet-title"><h2 id="inspiration-table-title">Inspiration Evergreen</h2><p className="admin-table-note">Edit focused fields, preview saved drafts, and publish only when media rights are confirmed.</p></div>
        </div>
        <div className="admin-table-wrap" tabIndex={0} aria-label="Managed inspiration entries table">
          <table className="admin-table">
            <caption className="admin-sr-only">Managed inspiration entries</caption>
            <thead><tr><th><span className="admin-table-header-cell-static">Title</span></th><th><span className="admin-table-header-cell-static">Style</span></th><th><span className="admin-table-header-cell-static">Area</span></th><th><span className="admin-table-header-cell-static">State</span></th><th><span className="admin-table-header-cell-static">Date</span></th><th><span className="admin-table-header-cell-static">Actions</span></th></tr></thead>
            <tbody>
              {entries.length > 0 ? entries.map((entry) => (
                <tr key={entry.id}>
                  <td><strong>{entry.title}</strong><br /><small>/inspiration/{entry.slug}</small></td>
                  <td>{inspirationStyleLabel(entry.style)}</td>
                  <td>{entry.area}</td>
                  <td><span className="admin-status-chip">{entry.hasPublishedVersion ? "Published snapshot" : entry.workflowStatus}</span></td>
                  <td>{entry.publishDate || "Not scheduled"}</td>
                  <td><div className="admin-inline-status-row"><Link href={`/admin/inspiration/${encodeURIComponent(entry.id)}`} className="btn btn-ghost">Edit</Link><Link href={`/admin/preview/inspiration/${encodeURIComponent(entry.id)}`} className="btn btn-ghost">Preview</Link></div></td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="admin-table-empty">No managed inspiration entries yet. The approved static V15 boards remain public until you publish managed replacements.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="admin-table-footer"><span>{entries.length} entries</span><span>Draft-safe publication snapshots enabled</span></div>
      </section>
    </AdminFrame>
  );
}
