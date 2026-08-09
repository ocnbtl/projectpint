import type { Metadata } from "next";
import { AdminFrame } from "../../../components/admin/AdminFrame";
import { OwnerReviewGallery } from "../../../components/admin/OwnerReviewGallery";
import {
  getOwnerReviewSourceMode,
  listOwnerReviewBatches,
  loadOwnerReviewWorkspace
} from "../../../lib/affiliate-owner-review";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media Review"
};

export default async function AdminMediaReviewPage({
  searchParams
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  const batches = await listOwnerReviewBatches();
  const sourceMode = getOwnerReviewSourceMode();
  const requestedBatchId = (await searchParams).batch;
  const selectedBatch = batches.find((batch) => batch.batchId === requestedBatchId) ?? batches[0] ?? null;

  return (
    <AdminFrame>
      <section className="owner-review-page">
        <header className="owner-review-page-head">
          <div>
            <p className="eyebrow">Affiliate Media Lab</p>
            <h1>Owner Review</h1>
            <p>
              Compare each generated room against the exact Amazon product, record why it works or fails,
              and keep every decision inside the authenticated command center.
            </p>
          </div>
          {selectedBatch ? (
            <div className="owner-review-batch-stamp" aria-label="Current frozen batch">
              <span>Frozen batch</span>
              <strong>{selectedBatch.batchId}</strong>
              <small>{selectedBatch.candidateCount} images · {selectedBatch.productCount} products · {selectedBatch.styleCount} styles</small>
            </div>
          ) : null}
        </header>

        <div className="owner-review-boundary" role="note">
          <span aria-hidden="true">i</span>
          <p>
            <strong>Private owner gate.</strong> Approvals save a review decision only. They do not publish an image,
            change the public site, or copy media into a public storage lane.
          </p>
        </div>

        {selectedBatch ? (
          <OwnerReviewGallery
            batches={batches}
            initialWorkspace={await loadOwnerReviewWorkspace(selectedBatch.batchId)}
          />
        ) : (
          <section className="owner-review-empty owner-review-empty-source">
            <p className="eyebrow">No review source</p>
            <h2>No frozen owner-review batches are available on this server.</h2>
            <p>
              {sourceMode === "supabase" ? (
                <>Import a frozen batch into the private owner-review bucket before enabling the hosted queue.</>
              ) : (
                <>Generate and render a private affiliate-pilot V4 batch, or configure
                  <code>AFFILIATE_PILOT_V4_OUTPUT_ROOT</code> to the mounted private output directory.</>
              )}
            </p>
          </section>
        )}
      </section>
    </AdminFrame>
  );
}
