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

function decisionLabel(proposal: AffiliateReplacementProposal): string {
  return proposal.proposalStatus === "approved_with_caveat"
    ? "Approved with caveat"
    : proposal.proposalStatus === "approved"
      ? "Approved"
      : proposal.proposalStatus.replaceAll("_", " ");
}

export function AffiliateReplacementQueue({ proposals, styles }: AffiliateReplacementQueueProps) {
  const styleNames = new Map(styles.map((style) => [style.slug, style.name]));
  const approveCount = proposals.filter((proposal) => proposal.proposalStatus === "approved").length;
  const caveatCount = proposals.filter((proposal) => proposal.proposalStatus === "approved_with_caveat").length;
  const reusedCount = proposals.filter((proposal) => proposal.reuseExistingCanonical).length;

  return (
    <section className="admin-panel affiliate-replacement-panel" aria-labelledby="affiliate-replacement-heading">
      <details className="affiliate-replacement-disclosure">
        <summary>
          <span>
            <small>Read-only owner history</small>
            <strong id="affiliate-replacement-heading">Approved replacement record</strong>
          </span>
          <span className="affiliate-replacement-counts" aria-label="Replacement decision summary">
            <span><strong>{proposals.length}</strong> decisions</span>
            <span><strong>{approveCount}</strong> approve</span>
            <span><strong>{caveatCount}</strong> caveat</span>
            <span><strong>{reusedCount}</strong> reuse</span>
          </span>
        </summary>
        <p className="affiliate-replacement-intro">
          These decisions fill every rejected style slot. The record stays private and does not publish products.
        </p>
        <div className="affiliate-replacement-table-wrap">
        <table className="affiliate-replacement-table">
          <thead>
            <tr>
              <th>Style slot</th>
              <th>Rejected product</th>
              <th>Proposed replacement</th>
              <th>Owner decision</th>
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
                      proposal.proposalStatus === "approved_with_caveat" ? " is-warning" : " is-success"
                    }`}>
                      {decisionLabel(proposal)}
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
                  proposal.proposalStatus === "approved_with_caveat" ? " is-warning" : " is-success"
                }`}>
                  {decisionLabel(proposal)}
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
      </details>
    </section>
  );
}
