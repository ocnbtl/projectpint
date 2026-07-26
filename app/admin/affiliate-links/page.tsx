import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AffiliateCatalogManager } from "../../../components/admin/AffiliateCatalogManager";
import { AffiliateReplacementQueue } from "../../../components/admin/AffiliateReplacementQueue";
import {
  affiliateReplacementFixture,
  catalogSummary,
  readAffiliateCatalog
} from "../../../lib/affiliate-catalog";
import { inspirationStyles } from "../../../lib/redesign-data";

export const dynamic = "force-dynamic";

export default async function AdminAffiliateLinksPage() {
  const products = await readAffiliateCatalog();
  const summary = catalogSummary(products);
  const replacements = affiliateReplacementFixture();
  const styleOptions = inspirationStyles.map((style) => ({ slug: style.slug, name: style.name }));

  return (
    <AdminFrame>
      <section className="admin-sheet-hero affiliate-catalog-hero">
        <div className="admin-hero-head">
          <div className="admin-hero-copy">
            <p className="eyebrow">Shoppable Inspiration</p>
            <h1>Affiliate Catalog</h1>
            <div className="admin-hero-description">
              <p>
                Manage one canonical record per product, then assign it to one or more Inspiration styles.
                Exact Amazon product URLs and user-supplied Associates URLs remain separate.
              </p>
            </div>
          </div>
        </div>
        <div className="admin-sheet-summary-grid" aria-label="Affiliate catalog summary">
          <article className="admin-sheet-summary-card admin-sheet-summary-green">
            <p>Canonical products</p>
            <strong>{summary.total}</strong>
            <span>{summary.categories} useful categories</span>
          </article>
          <article className="admin-sheet-summary-card admin-sheet-summary-gold">
            <p>Approved style slots</p>
            <strong>{summary.styleSlots} / 60</strong>
            <span>five for each Inspiration style</span>
          </article>
          <article className="admin-sheet-summary-card admin-sheet-summary-blue">
            <p>Replacement decisions</p>
            <strong>{replacements.length} / {replacements.length}</strong>
            <span>owner-approved and recorded</span>
          </article>
          <article className="admin-sheet-summary-card admin-sheet-summary-brown">
            <p>Media ready</p>
            <strong>{summary.mediaReady}</strong>
            <span>generation remains rights-gated</span>
          </article>
        </div>
        <div className="admin-hero-body">
          <div className="admin-callout">
            <p>
              <strong>Current boundary:</strong> product selection is complete. The 60 approved style slots use
              59 canonical products because the approved Bambüsi bench is assigned to both Boho Earth Tones and
              Japandi without duplicating its ASIN.
            </p>
            <p>
              All media jobs remain blocked on private-reference rights. No product can become public until
              complete QA-passed media, publication readiness, and the owner-supplied Amazon Associates URL all
              exist.
            </p>
          </div>
        </div>
      </section>

      <AffiliateReplacementQueue proposals={replacements} styles={styleOptions} />

      <AffiliateCatalogManager
        initialProducts={products}
        styles={styleOptions}
      />
    </AdminFrame>
  );
}
