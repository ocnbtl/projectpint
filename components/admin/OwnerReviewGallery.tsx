"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  OwnerReviewBatchSummary,
  OwnerReviewCandidate,
  OwnerReviewDecision,
  OwnerReviewDecisionValue,
  OwnerReviewWorkspace
} from "../../lib/affiliate-owner-review";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

interface OwnerReviewGalleryProps {
  batches: OwnerReviewBatchSummary[];
  initialWorkspace: OwnerReviewWorkspace;
}

type ReviewView = "focus" | "contact-sheet";
type StatusFilter = "all" | OwnerReviewDecisionValue;

function humanize(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function decisionLabel(value: OwnerReviewDecisionValue): string {
  if (value === "approved") return "Approved";
  if (value === "denied") return "Denied";
  return "Pending";
}

function assetUrl(batchId: string, sceneId: string): string {
  const params = new URLSearchParams({ batch: batchId, scene: sceneId });
  return `/api/admin/media-review/asset?${params.toString()}`;
}

function CandidateImage({
  batchId,
  candidate,
  eager = false
}: {
  batchId: string;
  candidate: OwnerReviewCandidate;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="owner-review-image-error" role="img" aria-label={`Image unavailable for review ${candidate.reviewNumber}`}>
        <span>Image unavailable</span>
        <small>The private asset could not be loaded from this server.</small>
      </div>
    );
  }

  return (
    // The browser must send its admin cookie directly to this private no-store endpoint;
    // the Next image optimizer performs a separate server fetch without that session.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetUrl(batchId, candidate.sceneId)}
      alt={`Review ${candidate.reviewNumber}: ${candidate.productName} in ${humanize(candidate.styleSlug)} style`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function OwnerReviewGallery({ batches, initialWorkspace }: OwnerReviewGalleryProps) {
  const router = useRouter();
  const { batch, candidates } = initialWorkspace;
  const [decisions, setDecisions] = useState<Record<string, OwnerReviewDecision>>(() =>
    Object.fromEntries(initialWorkspace.decisions.map((decision) => [decision.sceneId, decision]))
  );
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(candidates.map((candidate) => [candidate.sceneId, decisions[candidate.sceneId]?.note ?? ""]))
  );
  const [saving, setSaving] = useState<Set<string>>(() => new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<ReviewView>("focus");
  const [selectedSceneId, setSelectedSceneId] = useState(
    candidates.find((candidate) => !decisions[candidate.sceneId] || decisions[candidate.sceneId]?.decision === "pending")?.sceneId
      ?? candidates[0]?.sceneId
      ?? ""
  );
  const [liveStatus, setLiveStatus] = useState("");

  const decisionFor = useCallback(
    (sceneId: string): OwnerReviewDecisionValue => decisions[sceneId]?.decision ?? "pending",
    [decisions]
  );
  const dirtyScenes = useMemo(
    () => candidates.filter((candidate) => (notes[candidate.sceneId] ?? "") !== (decisions[candidate.sceneId]?.note ?? "")),
    [candidates, decisions, notes]
  );
  useUnsavedChangesGuard(dirtyScenes.length > 0 || saving.size > 0, "Some review notes have not been saved. Leave this page?");

  const products = useMemo(() => {
    const values = new Map<string, string>();
    for (const candidate of candidates) values.set(candidate.asin, `${candidate.brand} — ${candidate.productName}`);
    return Array.from(values, ([asin, label]) => ({ asin, label })).sort((left, right) => left.label.localeCompare(right.label));
  }, [candidates]);
  const styles = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.styleSlug))).sort(),
    [candidates]
  );

  const filteredCandidates = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const searchMatch = !needle || [
        candidate.productName,
        candidate.brand,
        candidate.asin,
        candidate.styleSlug,
        candidate.sceneId
      ].some((value) => value.toLowerCase().includes(needle));
      const productMatch = productFilter === "all" || candidate.asin === productFilter;
      const styleMatch = styleFilter === "all" || candidate.styleSlug === styleFilter;
      const statusMatch = statusFilter === "all" || decisionFor(candidate.sceneId) === statusFilter;
      return searchMatch && productMatch && styleMatch && statusMatch;
    });
  }, [candidates, decisionFor, productFilter, query, statusFilter, styleFilter]);

  const stats = useMemo(() => {
    const approved = candidates.filter((candidate) => decisionFor(candidate.sceneId) === "approved").length;
    const denied = candidates.filter((candidate) => decisionFor(candidate.sceneId) === "denied").length;
    return { approved, denied, reviewed: approved + denied, pending: candidates.length - approved - denied };
  }, [candidates, decisionFor]);

  const selectedCandidate = filteredCandidates.find((candidate) => candidate.sceneId === selectedSceneId)
    ?? filteredCandidates[0]
    ?? null;

  useEffect(() => {
    if (selectedCandidate && selectedCandidate.sceneId !== selectedSceneId) {
      setSelectedSceneId(selectedCandidate.sceneId);
    }
  }, [selectedCandidate, selectedSceneId]);

  const saveDecision = useCallback(async (candidate: OwnerReviewCandidate, value: OwnerReviewDecisionValue) => {
    const note = notes[candidate.sceneId] ?? "";
    if (value === "denied" && !note.trim()) {
      setErrors((current) => ({ ...current, [candidate.sceneId]: "Add a rejection reason before denying this image." }));
      setSelectedSceneId(candidate.sceneId);
      window.setTimeout(() => document.getElementById(`owner-review-note-${candidate.reviewNumber}`)?.focus(), 0);
      return;
    }

    const current = decisions[candidate.sceneId];
    setSaving((items) => new Set(items).add(candidate.sceneId));
    setErrors((items) => ({ ...items, [candidate.sceneId]: "" }));
    setLiveStatus(`Saving review ${candidate.reviewNumber}…`);
    try {
      const response = await fetch("/api/admin/media-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: batch.batchId,
          sceneId: candidate.sceneId,
          decision: value,
          note,
          expectedRevision: current?.revision ?? 0
        })
      });
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        conflict?: boolean;
        decision?: OwnerReviewDecision;
        current?: OwnerReviewDecision | null;
      };
      if (!response.ok || !body.ok || !body.decision) {
        if (body.conflict && body.current) {
          setDecisions((items) => ({ ...items, [candidate.sceneId]: body.current! }));
          setNotes((items) => ({ ...items, [candidate.sceneId]: body.current!.note }));
        }
        const message = body.error ?? "The decision could not be saved.";
        setErrors((items) => ({ ...items, [candidate.sceneId]: message }));
        setLiveStatus(`Review ${candidate.reviewNumber} was not saved. ${message}`);
        return;
      }

      setDecisions((items) => ({ ...items, [candidate.sceneId]: body.decision! }));
      setNotes((items) => ({ ...items, [candidate.sceneId]: body.decision!.note }));
      setLiveStatus(`Review ${candidate.reviewNumber} saved as ${decisionLabel(body.decision.decision)}.`);
      if (view === "focus" && value !== "pending") {
        const nextPending = candidates.find((item) => item.sceneId !== candidate.sceneId && decisionFor(item.sceneId) === "pending");
        if (nextPending) setSelectedSceneId(nextPending.sceneId);
      }
    } catch {
      const message = "Network error. Your on-screen note is still here and has not been discarded.";
      setErrors((items) => ({ ...items, [candidate.sceneId]: message }));
      setLiveStatus(`Review ${candidate.reviewNumber} was not saved.`);
    } finally {
      setSaving((items) => {
        const next = new Set(items);
        next.delete(candidate.sceneId);
        return next;
      });
    }
  }, [batch.batchId, candidates, decisionFor, decisions, notes, view]);

  const moveSelection = useCallback((offset: number) => {
    if (!filteredCandidates.length) return;
    const currentIndex = Math.max(0, filteredCandidates.findIndex((candidate) => candidate.sceneId === selectedCandidate?.sceneId));
    const nextIndex = (currentIndex + offset + filteredCandidates.length) % filteredCandidates.length;
    setSelectedSceneId(filteredCandidates[nextIndex]!.sceneId);
  }, [filteredCandidates, selectedCandidate?.sceneId]);

  const selectNextPending = useCallback(() => {
    const currentIndex = Math.max(0, candidates.findIndex((candidate) => candidate.sceneId === selectedCandidate?.sceneId));
    const ordered = [...candidates.slice(currentIndex + 1), ...candidates.slice(0, currentIndex + 1)];
    const next = ordered.find((candidate) => decisionFor(candidate.sceneId) === "pending");
    if (next) {
      setSelectedSceneId(next.sceneId);
      setView("focus");
    }
  }, [candidates, decisionFor, selectedCandidate?.sceneId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (view !== "focus" || !selectedCandidate || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
      if (event.key === "a" || event.key === "A") {
        event.preventDefault();
        void saveDecision(selectedCandidate, "approved");
      } else if (event.key === "d" || event.key === "D") {
        event.preventDefault();
        void saveDecision(selectedCandidate, "denied");
      } else if (event.key === "j" || event.key === "ArrowRight") {
        event.preventDefault();
        moveSelection(1);
      } else if (event.key === "k" || event.key === "ArrowLeft") {
        event.preventDefault();
        moveSelection(-1);
      } else if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        selectNextPending();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveSelection, saveDecision, selectNextPending, selectedCandidate, view]);

  function changeBatch(nextBatchId: string) {
    if (nextBatchId === batch.batchId) return;
    if ((dirtyScenes.length > 0 || saving.size > 0) && !window.confirm("Some review notes have not been saved. Switch batches anyway?")) return;
    router.push(`/admin/media-review?batch=${encodeURIComponent(nextBatchId)}`);
  }

  function updateNote(sceneId: string, note: string) {
    setNotes((items) => ({ ...items, [sceneId]: note }));
    setErrors((items) => ({ ...items, [sceneId]: "" }));
  }

  function reviewControls(candidate: OwnerReviewCandidate, compact = false) {
    const decision = decisionFor(candidate.sceneId);
    const isSaving = saving.has(candidate.sceneId);
    const dirty = (notes[candidate.sceneId] ?? "") !== (decisions[candidate.sceneId]?.note ?? "");
    const error = errors[candidate.sceneId];
    return (
      <div className={`owner-review-controls${compact ? " is-compact" : ""}`}>
        <label htmlFor={`owner-review-note-${candidate.reviewNumber}`}>
          {decision === "denied" ? "Rejection reason" : "Decision note"}
          <span>{(notes[candidate.sceneId] ?? "").length} / 2,000</span>
        </label>
        <textarea
          id={`owner-review-note-${candidate.reviewNumber}`}
          value={notes[candidate.sceneId] ?? ""}
          maxLength={2000}
          rows={compact ? 2 : 4}
          placeholder="Record product inaccuracies, AI artifacts, realism issues, or why this image works."
          onChange={(event) => updateNote(candidate.sceneId, event.target.value)}
        />
        {error ? <p className="owner-review-error" role="alert">{error}</p> : null}
        <div className="owner-review-decision-row" aria-label={`Decision for review ${candidate.reviewNumber}`}>
          <button
            type="button"
            className={`owner-review-decision is-approve${decision === "approved" ? " is-selected" : ""}`}
            aria-pressed={decision === "approved"}
            disabled={isSaving}
            onClick={() => void saveDecision(candidate, "approved")}
          >
            <span aria-hidden="true">✓</span>
            {isSaving && decision !== "approved" ? "Saving…" : "Approve"}
          </button>
          <button
            type="button"
            className={`owner-review-decision is-deny${decision === "denied" ? " is-selected" : ""}`}
            aria-pressed={decision === "denied"}
            disabled={isSaving}
            onClick={() => void saveDecision(candidate, "denied")}
          >
            <span aria-hidden="true">×</span>
            {isSaving && decision !== "denied" ? "Saving…" : "Deny"}
          </button>
        </div>
        <div className="owner-review-secondary-actions">
          {dirty ? (
            <button type="button" disabled={isSaving} onClick={() => void saveDecision(candidate, decision)}>
              Save note
            </button>
          ) : <span>{decisions[candidate.sceneId] ? `Saved revision ${decisions[candidate.sceneId]!.revision}` : "Not decided"}</span>}
          {decision !== "pending" ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                if (window.confirm(`Return review ${candidate.reviewNumber} to pending? Its audit history will be retained.`)) {
                  void saveDecision(candidate, "pending");
                }
              }}
            >
              Return to pending
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="owner-review-workspace">
      <section className="owner-review-summary" aria-label="Review progress">
        <div className="owner-review-progress-copy">
          <p><strong>{stats.reviewed}</strong> of {candidates.length} reviewed</p>
          <div className="owner-review-progress-track" aria-hidden="true">
            <span style={{ width: `${candidates.length ? (stats.reviewed / candidates.length) * 100 : 0}%` }} />
          </div>
        </div>
        <dl>
          <div><dt>Approved</dt><dd className="is-approved">{stats.approved}</dd></div>
          <div><dt>Denied</dt><dd className="is-denied">{stats.denied}</dd></div>
          <div><dt>Pending</dt><dd>{stats.pending}</dd></div>
          <div><dt>Visible</dt><dd>{filteredCandidates.length}</dd></div>
        </dl>
        <div className="owner-review-summary-actions">
          <button type="button" className="btn btn-ghost" onClick={selectNextPending} disabled={stats.pending === 0}>
            Next pending
          </button>
          {stats.pending === 0 ? (
            <a className="btn btn-accent" href={`/api/admin/media-review/export?batch=${encodeURIComponent(batch.batchId)}`}>
              Download decisions
            </a>
          ) : (
            <button type="button" className="btn btn-accent" disabled title={`${stats.pending} decisions remain`}>
              Download when complete
            </button>
          )}
        </div>
      </section>

      <section className="owner-review-toolbar" aria-label="Gallery controls">
        <div className="owner-review-field owner-review-search-field">
          <label htmlFor="owner-review-search">Find an image</label>
          <input
            id="owner-review-search"
            type="search"
            value={query}
            placeholder="Product, ASIN, style, scene…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="owner-review-field">
          <label htmlFor="owner-review-product">Product</label>
          <select id="owner-review-product" value={productFilter} onChange={(event) => setProductFilter(event.target.value)}>
            <option value="all">All products</option>
            {products.map((product) => <option key={product.asin} value={product.asin}>{product.label}</option>)}
          </select>
        </div>
        <div className="owner-review-field">
          <label htmlFor="owner-review-style">Style</label>
          <select id="owner-review-style" value={styleFilter} onChange={(event) => setStyleFilter(event.target.value)}>
            <option value="all">All styles</option>
            {styles.map((style) => <option key={style} value={style}>{humanize(style)}</option>)}
          </select>
        </div>
        <div className="owner-review-field">
          <label htmlFor="owner-review-status">Decision</label>
          <select id="owner-review-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
            <option value="all">All decisions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>
        <div className="owner-review-field">
          <label htmlFor="owner-review-batch">Batch</label>
          <select id="owner-review-batch" value={batch.batchId} onChange={(event) => changeBatch(event.target.value)}>
            {batches.map((item) => (
              <option key={item.batchId} value={item.batchId}>{item.batchId} · {item.candidateCount}</option>
            ))}
          </select>
        </div>
        <div className="owner-review-view-toggle" aria-label="Gallery view">
          <button type="button" aria-pressed={view === "focus"} onClick={() => setView("focus")}>Focus</button>
          <button type="button" aria-pressed={view === "contact-sheet"} onClick={() => setView("contact-sheet")}>Contact sheet</button>
        </div>
      </section>

      <p className="owner-review-live-status" role="status" aria-live="polite" aria-atomic="true">{liveStatus}</p>

      {filteredCandidates.length === 0 ? (
        <section className="owner-review-empty">
          <p className="eyebrow">No matching scenes</p>
          <h2>Nothing fits those filters.</h2>
          <p>Clear a filter or search to return to the complete frozen batch.</p>
          <button type="button" className="btn btn-ghost" onClick={() => {
            setQuery("");
            setProductFilter("all");
            setStyleFilter("all");
            setStatusFilter("all");
          }}>Clear filters</button>
        </section>
      ) : view === "focus" && selectedCandidate ? (
        <section className="owner-review-focus" aria-label={`Focused review ${selectedCandidate.reviewNumber}`}>
          <div className="owner-review-focus-stage">
            <div className="owner-review-photo-frame">
              <CandidateImage batchId={batch.batchId} candidate={selectedCandidate} eager />
              <span className={`owner-review-photo-status is-${decisionFor(selectedCandidate.sceneId)}`}>
                {decisionLabel(decisionFor(selectedCandidate.sceneId))}
              </span>
            </div>
            <div className="owner-review-focus-navigation">
              <button type="button" onClick={() => moveSelection(-1)} aria-label="Previous visible image">← Previous</button>
              <span>{filteredCandidates.findIndex((candidate) => candidate.sceneId === selectedCandidate.sceneId) + 1} / {filteredCandidates.length}</span>
              <button type="button" onClick={() => moveSelection(1)} aria-label="Next visible image">Next →</button>
            </div>
          </div>

          <aside className="owner-review-rail">
            <div className="owner-review-rail-heading">
              <span className="owner-review-number">Review {String(selectedCandidate.reviewNumber).padStart(3, "0")}</span>
              <span className={`owner-review-status-badge is-${decisionFor(selectedCandidate.sceneId)}`}>
                {decisionLabel(decisionFor(selectedCandidate.sceneId))}
              </span>
              <h2>{selectedCandidate.productName}</h2>
              <p>{selectedCandidate.brand} · {selectedCandidate.asin}</p>
            </div>
            <dl className="owner-review-provenance">
              <div><dt>Style</dt><dd>{humanize(selectedCandidate.styleSlug)}</dd></div>
              <div><dt>Scene slot</dt><dd>{selectedCandidate.slot}</dd></div>
              <div><dt>Candidate</dt><dd>{selectedCandidate.candidateOrdinal}</dd></div>
              <div><dt>Source batch</dt><dd>{selectedCandidate.sourceOwnerReviewBatchId} / {selectedCandidate.sourceReviewNumber}</dd></div>
            </dl>
            <div className="owner-review-reference-actions">
              <a href={selectedCandidate.amazonListingUrl} target="_blank" rel="noreferrer">Open Amazon listing ↗</a>
              <a href={assetUrl(batch.batchId, selectedCandidate.sceneId)} target="_blank" rel="noreferrer">Open full image ↗</a>
            </div>
            {reviewControls(selectedCandidate)}
            <p className="owner-review-shortcuts">Keyboard: <kbd>A</kbd> approve · <kbd>D</kbd> deny · <kbd>J</kbd>/<kbd>K</kbd> move · <kbd>N</kbd> next pending</p>
          </aside>
        </section>
      ) : (
        <section className="owner-review-grid" aria-label="Owner review contact sheet">
          {filteredCandidates.map((candidate) => {
            const decision = decisionFor(candidate.sceneId);
            return (
              <article key={candidate.sceneId} className={`owner-review-card is-${decision}`}>
                <button
                  type="button"
                  className="owner-review-card-image"
                  aria-label={`Open review ${candidate.reviewNumber} in focus view`}
                  onClick={() => {
                    setSelectedSceneId(candidate.sceneId);
                    setView("focus");
                  }}
                >
                  <CandidateImage batchId={batch.batchId} candidate={candidate} />
                  <span>{String(candidate.reviewNumber).padStart(3, "0")}</span>
                </button>
                <div className="owner-review-card-body">
                  <div className="owner-review-card-heading">
                    <span className={`owner-review-status-badge is-${decision}`}>{decisionLabel(decision)}</span>
                    <h2>{candidate.productName}</h2>
                    <p>{candidate.brand} · {humanize(candidate.styleSlug)}</p>
                  </div>
                  <a className="owner-review-amazon-link" href={candidate.amazonListingUrl} target="_blank" rel="noreferrer">
                    Compare on Amazon ↗
                  </a>
                  {reviewControls(candidate, true)}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
