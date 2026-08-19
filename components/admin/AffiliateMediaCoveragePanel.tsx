import type { OwnerMediaCoverage } from "../../lib/affiliate-media-coverage";

interface StyleOption {
  slug: string;
  name: string;
}
interface AffiliateMediaCoveragePanelProps {
  coverage: OwnerMediaCoverage | null;
  styles: StyleOption[];
}

export function AffiliateMediaCoveragePanel({ coverage, styles }: AffiliateMediaCoveragePanelProps) {
  if (!coverage) {
    return (
      <section className="admin-panel affiliate-media-coverage-panel" aria-labelledby="affiliate-media-coverage-title">
        <div>
          <p className="eyebrow">Owner media library</p>
          <h2 id="affiliate-media-coverage-title">Coverage ledger unavailable</h2>
          <p>The catalog remains usable, but the private owner-media count has not been synchronized.</p>
        </div>
      </section>
    );
  }

  const styleNames = new Map(styles.map((style) => [style.slug, style.name]));
  const totals = coverage.totals;

  return (
    <section className="admin-panel affiliate-media-coverage-panel" aria-labelledby="affiliate-media-coverage-title">
      <div className="affiliate-media-coverage-header">
        <div>
          <p className="eyebrow">Owner media library</p>
          <h2 id="affiliate-media-coverage-title">Approved coverage and next batch</h2>
          <p>
            Approved files stay private. A style is set only after it reaches {coverage.finalLibraryTargetPerProductStyle} usable owner approvals.
          </p>
        </div>
        <dl className="affiliate-media-coverage-totals">
          <div><dt>Selected</dt><dd>{totals.ownerSelectedPrivateCopiesAllProducts}</dd></div>
          <div><dt>Usable</dt><dd>{totals.usableApprovedEligibleProducts}</dd></div>
          <div><dt>Queued</dt><dd>{totals.queuedInCurrentBatch}</dd></div>
          <div><dt>Excluded</dt><dd>{totals.excludedProducts}</dd></div>
        </dl>
      </div>

      <details className="affiliate-coverage-disclosure">
        <summary>
          <span>View product × style coverage</span>
          <small>{coverage.products.length} eligible products · batch {coverage.currentGenerationBatchId}</small>
        </summary>
        <div className="affiliate-coverage-table-wrap">
          <table className="affiliate-coverage-table">
            <thead>
              <tr>
                <th>Product</th>
                {coverage.styleOrder.map((styleSlug) => (
                  <th key={styleSlug}><abbr title={styleNames.get(styleSlug) ?? styleSlug}>{(styleNames.get(styleSlug) ?? styleSlug).split(" ").map((word) => word[0]).join("")}</abbr></th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {coverage.products.map((product) => (
                <tr key={product.asin}>
                  <th scope="row">
                    <strong>{product.productName}</strong>
                    <span>{product.asin}</span>
                  </th>
                  {coverage.styleOrder.map((styleSlug) => {
                    const cell = product.styles[styleSlug];
                    if (!cell) return <td key={styleSlug}>—</td>;
                    return (
                      <td key={styleSlug} className={cell.setForTarget ? "is-set" : undefined}>
                        <strong>{cell.approvedUsable}</strong>
                        {cell.queuedInCurrentBatch ? <span>+{cell.queuedInCurrentBatch}</span> : null}
                        <small>{cell.setForTarget ? "set" : `${cell.stillNeededBeforeBatch} need`}</small>
                      </td>
                    );
                  })}
                  <td>
                    <strong>{product.approvedUsable}</strong>
                    <span>+{product.queuedInCurrentBatch}</span>
                    <small>{product.stillNeededBeforeBatch} need</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="affiliate-coverage-footnote">
          Counts are owner-approved files, not generation attempts. “+” is queued and remains provisional. Updated {new Date(coverage.generatedAt).toLocaleString()}.
        </p>
      </details>
    </section>
  );
}
