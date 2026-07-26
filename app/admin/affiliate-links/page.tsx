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
            <p>Products</p>
            <strong>{summary.total}</strong>
            <span>{summary.categories} useful categories</span>
          </article>
          <article className="admin-sheet-summary-card admin-sheet-summary-gold">
            <p>Owner decisions</p>
            <strong>{summary.approved} / {summary.total}</strong>
            <span>{summary.rejected} rejected and preserved</span>
          </article>
          <article className="admin-sheet-summary-card admin-sheet-summary-blue">
            <p>Replacement queue</p>
            <strong>{replacements.length}</strong>
            <span>pending owner review</span>
          </article>
          <article className="admin-sheet-summary-card admin-sheet-summary-brown">
            <p>Media ready</p>
            <strong>{summary.mediaReady}</strong>
            <span>generation remains approval-gated</span>
          </article>
        </div>
        <div className="admin-hero-body">
          <div className="admin-callout">
            <p>
              <strong>Current boundary:</strong> 41 initial products are owner-approved, 19 are rejected with
              their decision reasons preserved, and 19 replacements are pending.
            </p>
            <p>
              Rejected and pending products cannot enter the generation manifest. No product can become public
              until approval, private-reference rights clearance, complete QA-passed media, publication
              readiness, and the owner-supplied Amazon Associates URL all exist.
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
