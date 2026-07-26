import type { AffiliateReplacementProposal } from "../../lib/affiliate-catalog";

interface StyleOption {
  slug: string;
  name: string;
}

interface AffiliateReplacementQueueProps {
  proposals: AffiliateReplacementProposal[];
  styles: StyleOption[];
}

function priceLabel(proposal: AffiliateReplacementProposal): string {
  return proposal.proposedProduct.priceObservation?.display || "Price not recorded";
}

function recommendationLabel(proposal: AffiliateReplacementProposal): string {
  return proposal.proposedProduct.recommendation === "approve_with_caveat"
    ? "Approve with caveat"
    : proposal.proposedProduct.recommendation === "replace"
      ? "Replace"
      : "Approve";
}

export function AffiliateReplacementQueue({ proposals, styles }: AffiliateReplacementQueueProps) {
  const styleNames = new Map(styles.map((style) => [style.slug, style.name]));
  const approveCount = proposals.filter(
    (proposal) => proposal.proposedProduct.recommendation === "approve"
  ).length;
  const caveatCount = proposals.filter(
    (proposal) => proposal.proposedProduct.recommendation === "approve_with_caveat"
  ).length;
  const reusedCount = proposals.filter((proposal) => proposal.reuseExistingCanonical).length;

  return (
    <section className="admin-panel affiliate-replacement-panel" aria-labelledby="affiliate-replacement-heading">
      <div className="affiliate-replacement-header">
        <div>
          <p className="eyebrow">Owner review required</p>
          <h2 id="affiliate-replacement-heading">Replacement approval queue</h2>
          <p>
            These proposals fill the 19 rejected style slots. They remain read-only and private until the owner
            decides; no replacement has entered the canonical catalog or media manifest.
          </p>
        </div>
        <div className="affiliate-replacement-counts" aria-label="Replacement recommendation summary">
          <span><strong>{approveCount}</strong> approve</span>
          <span><strong>{caveatCount}</strong> with caveat</span>
          <span><strong>{reusedCount}</strong> canonical reuse</span>
        </div>
      </div>

      <div className="affiliate-replacement-table-wrap">
        <table className="affiliate-replacement-table">
          <thead>
            <tr>
              <th>Style slot</th>
              <th>Rejected product</th>
              <th>Proposed replacement</th>
              <th>Recommendation</th>
              <th><span className="admin-sr-only">Research link</span></th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => {
              const product = proposal.proposedProduct;
              return (
                <tr key={proposal.id}>
                  <td>
                    <strong>{styleNames.get(proposal.styleSlug) ?? proposal.styleSlug}</strong>
                    <span>Slot {proposal.rank}</span>
                  </td>
                  <td>
                    <span className="affiliate-replacement-asin">{proposal.replacesAsin}</span>
                    <small>{proposal.ownerRejectionReason}</small>
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <span>{product.brand} · {product.category} · {priceLabel(proposal)}</span>
                    {proposal.reuseExistingCanonical ? (
                      <small className="affiliate-reuse-note">Reuse approved canonical ASIN {product.asin}</small>
                    ) : (
                      <small>ASIN {product.asin}</small>
                    )}
                  </td>
                  <td>
                    <span className={`affiliate-status${
                      product.recommendation === "approve_with_caveat" ? " is-warning" : " is-success"
                    }`}>
                      {recommendationLabel(proposal)}
                    </span>
                    {product.caveats[0] ? <small>{product.caveats[0]}</small> : null}
                  </td>
                  <td>
                    <a
                      className="btn btn-ghost"
                      href={product.canonicalAmazonUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open Amazon listing for ${product.name}`}
                    >
                      Amazon
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="affiliate-replacement-mobile-list">
        {proposals.map((proposal) => {
          const product = proposal.proposedProduct;
          return (
            <article key={proposal.id} className="affiliate-replacement-mobile-card">
              <div className="affiliate-replacement-mobile-head">
                <div>
                  <p>{styleNames.get(proposal.styleSlug) ?? proposal.styleSlug} · Slot {proposal.rank}</p>
                  <h3>{product.name}</h3>
                </div>
                <span className={`affiliate-status${
                  product.recommendation === "approve_with_caveat" ? " is-warning" : " is-success"
                }`}>
                  {recommendationLabel(proposal)}
                </span>
              </div>
              <p>{product.brand} · {product.category} · {priceLabel(proposal)}</p>
              <p><strong>Replaces {proposal.replacesAsin}:</strong> {proposal.ownerRejectionReason}</p>
              <p><strong>Caveat:</strong> {product.caveats[0] ?? "No material caveat recorded."}</p>
              {proposal.reuseExistingCanonical ? (
                <p className="affiliate-reuse-note">Reuses approved canonical ASIN {product.asin}; no duplicate product record.</p>
              ) : null}
              <a
                className="btn btn-ghost"
                href={product.canonicalAmazonUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open Amazon listing
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
