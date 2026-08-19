import { AdminFrame } from "../../../components/admin/AdminFrame";
import { AffiliateCatalogManager } from "../../../components/admin/AffiliateCatalogManager";
import { AffiliateMediaCoveragePanel } from "../../../components/admin/AffiliateMediaCoveragePanel";
import { AffiliateReplacementQueue } from "../../../components/admin/AffiliateReplacementQueue";
import {
  affiliateReplacementFixture,
  catalogSummary,
  readAffiliateCatalog
} from "../../../lib/affiliate-catalog";
import { inspirationStyles } from "../../../lib/redesign-data";
import { readOwnerMediaCoverage } from "../../../lib/affiliate-media-coverage";

export const dynamic = "force-dynamic";

export default async function AdminAffiliateLinksPage() {
  const [products, mediaCoverage] = await Promise.all([
    readAffiliateCatalog(),
    readOwnerMediaCoverage()
  ]);
  const summary = catalogSummary(products);
  const replacements = affiliateReplacementFixture();
  const styleOptions = inspirationStyles.map((style) => ({ slug: style.slug, name: style.name }));

  return (
    <AdminFrame>
      <section className="admin-sheet-hero affiliate-catalog-hero affiliate-catalog-command-hero">
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
        <div className="affiliate-catalog-summary-strip" aria-label="Affiliate catalog summary">
          <article>
            <p>Canonical products</p>
            <strong>{summary.total}</strong>
            <span>{summary.categories} useful categories</span>
          </article>
          <article>
            <p>Approved style slots</p>
            <strong>{summary.styleSlots} / 60</strong>
            <span>five for each Inspiration style</span>
          </article>
          <article>
            <p>Replacement decisions</p>
            <strong>{replacements.length} / {replacements.length}</strong>
            <span>owner-approved and recorded</span>
          </article>
          <article>
            <p>Usable owner media</p>
            <strong>{mediaCoverage?.totals.usableApprovedEligibleProducts ?? "—"}</strong>
            <span>{mediaCoverage ? `${mediaCoverage.totals.queuedInCurrentBatch} queued privately` : "coverage not synchronized"}</span>
          </article>
        </div>
        <p className="affiliate-catalog-boundary-note">
          <strong>Private workflow:</strong> owner media and replacement records do not publish products. Public visibility still requires complete QA-passed media, publication readiness, and an owner-supplied Associates URL.
        </p>
      </section>

      <AffiliateCatalogManager
        initialProducts={products}
        styles={styleOptions}
      />

      <AffiliateMediaCoveragePanel coverage={mediaCoverage} styles={styleOptions} />

      <AffiliateReplacementQueue proposals={replacements} styles={styleOptions} />
    </AdminFrame>
  );
}
