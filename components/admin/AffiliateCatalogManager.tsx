"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AffiliateProduct, AffiliateWorkflowStatus } from "../../lib/affiliate-catalog";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

interface StyleOption {
  slug: string;
  name: string;
}

interface AffiliateCatalogManagerProps {
  initialProducts: AffiliateProduct[];
  styles: StyleOption[];
}

type CatalogSort = "name" | "brand" | "category" | "style" | "updated";
type EditorState = { index: number | null; draft: AffiliateProduct } | null;

const PAGE_SIZE = 10;
const WORKFLOW_LABELS: Record<AffiliateWorkflowStatus, string> = {
  research: "Research",
  needs_approval: "Needs approval",
  approved: "Approved",
  reference_ready: "Reference ready",
  generating: "Generating",
  generation_failed: "Generation failed",
  media_qa: "Media QA",
  publish_ready: "Publish ready",
  published: "Published",
  unavailable: "Unavailable",
  retired: "Retired"
};

function primaryStyle(product: AffiliateProduct): string {
  return product.styleAssignments.find((assignment) => assignment.role === "primary")?.styleSlug ?? "";
}

function mediaProgress(product: AffiliateProduct): { ready: number; total: number } {
  const styledReady = product.mediaSets.reduce((total, set) => total + set.readyCount, 0);
  const presentationReady = product.transparentPresentation.status === "ready" ? 1 : 0;
  return { ready: styledReady + presentationReady, total: 61 };
}

function statusTone(value: string): string {
  if (/approved|ready|published|verified_available/.test(value)) return "is-success";
  if (/failed|rejected|unavailable|retired/.test(value)) return "is-danger";
  if (/generating|qa|partial|caveat/.test(value)) return "is-warning";
  return "is-neutral";
}

function makeBlankProduct(styles: StyleOption[]): AffiliateProduct {
  const now = new Date().toISOString();
  const firstStyle = styles[0]?.slug ?? "minimalist-elegance";
  return {
    id: "prod_",
    slug: "",
    asin: "",
    canonicalAmazonUrl: "",
    associatesUrl: null,
    brand: "",
    manufacturer: "",
    category: "",
    name: "",
    recommendation: "approve_with_caveat",
    recommendationRationale: "",
    caveats: [],
    crossStyleNotes: "No duplicate proposed. Consider additional style assignments only after the canonical product is approved.",
    workflowStatus: "research",
    approvalStatus: "pending",
    approvalHistory: [],
    availabilityStatus: "uncertain",
    availabilityObservedAt: now,
    priceObservation: null,
    researchSources: [],
    styleAssignments: [{ styleSlug: firstStyle, role: "primary", rank: 1, rationale: "" }],
    transparentPresentation: {
      status: "not_started",
      storageKey: "",
      alt: "",
      promptVersion: "affiliate-product-v1",
      generationVersion: "",
      qaNotes: ""
    },
    mediaSets: [],
    referenceReadiness: "missing",
    mediaCompleteness: "not_started",
    imageQaStatus: "not_started",
    publicationReadiness: "blocked",
    visibility: "private",
    unavailable: false,
    retired: false,
    createdAt: now,
    updatedAt: now
  };
}

function validateEditorDraft(draft: AffiliateProduct, products: AffiliateProduct[], editIndex: number | null): string | null {
  if (!draft.name.trim() || !draft.brand.trim() || !draft.category.trim()) {
    return "Product name, brand, and category are required.";
  }
  if (!/^[A-Z0-9]{10}$/.test(draft.asin)) return "ASIN must be 10 uppercase letters or numbers.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) return "Slug must use lowercase words separated by hyphens.";
  if (draft.id !== `prod_${draft.asin.toLowerCase()}`) return "The stable product ID must match the ASIN.";
  if (draft.canonicalAmazonUrl !== `https://www.amazon.com/dp/${draft.asin}`) {
    return "Canonical Amazon URL must use https://www.amazon.com/dp/ASIN and match the ASIN.";
  }
  if (draft.associatesUrl) {
    try {
      const host = new URL(draft.associatesUrl).hostname.toLowerCase();
      if (host !== "amzn.to" && host !== "amazon.com" && !host.endsWith(".amazon.com")) {
        return "Associates URL must use Amazon or amzn.to.";
      }
    } catch {
      return "Associates URL is not a valid URL.";
    }
  }
  if (!draft.recommendationRationale.trim()) return "Recommendation rationale is required.";
  if (!draft.crossStyleNotes.trim()) return "Cross-style and duplicate notes are required.";
  const primary = draft.styleAssignments.filter((assignment) => assignment.role === "primary");
  if (primary.length !== 1 || !primary[0]?.rationale.trim()) {
    return "Choose one primary style and provide its style-fit rationale.";
  }
  const duplicate = products.find((product, index) =>
    index !== editIndex && (
      product.asin === draft.asin ||
      product.slug === draft.slug ||
      product.canonicalAmazonUrl === draft.canonicalAmazonUrl
    )
  );
  if (duplicate) return `Duplicate product detected: ${duplicate.name} already uses this ASIN, slug, or canonical URL.`;
  return null;
}

export function AffiliateCatalogManager({ initialProducts, styles }: AffiliateCatalogManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [styleFilter, setStyleFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [workflowFilter, setWorkflowFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sort, setSort] = useState<CatalogSort>("style");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkDecisionNote, setBulkDecisionNote] = useState("");
  const [editor, setEditor] = useState<EditorState>(null);
  const [editorError, setEditorError] = useState("");
  const [editorDecisionNote, setEditorDecisionNote] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [status, setStatus] = useState("");
  const baseProductsRef = useRef(initialProducts);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useUnsavedChangesGuard(dirty || saving);

  const styleNames = useMemo(() => new Map(styles.map((style) => [style.slug, style.name])), [styles]);
  const categories = useMemo(() => Array.from(new Set(products.map((product) => product.category))).sort(), [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const searchMatch = !normalizedQuery || [
        product.name,
        product.brand,
        product.manufacturer,
        product.asin,
        product.category,
        product.slug
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const styleMatch = styleFilter === "all" || product.styleAssignments.some((assignment) => assignment.styleSlug === styleFilter);
      const categoryMatch = categoryFilter === "all" || product.category === categoryFilter;
      const workflowMatch = workflowFilter === "all" || product.workflowStatus === workflowFilter;
      const approvalMatch = approvalFilter === "all" || product.approvalStatus === approvalFilter;
      const availabilityMatch = availabilityFilter === "all" || product.availabilityStatus === availabilityFilter;
      return searchMatch && styleMatch && categoryMatch && workflowMatch && approvalMatch && availabilityMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
      const aValue = sort === "style" ? styleNames.get(primaryStyle(a)) ?? "" : a[sort];
      const bValue = sort === "style" ? styleNames.get(primaryStyle(b)) ?? "" : b[sort];
      return String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: "base" });
    });
  }, [
    approvalFilter,
    availabilityFilter,
    categoryFilter,
    products,
    query,
    sort,
    styleFilter,
    styleNames,
    workflowFilter
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allPageSelected = pageProducts.length > 0 && pageProducts.every((product) => selected.has(product.id));
  const somePageSelected = pageProducts.some((product) => selected.has(product.id));

  useEffect(() => {
    setPage(1);
  }, [query, styleFilter, categoryFilter, workflowFilter, approvalFilter, availabilityFilter, sort]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    if (!editor) return undefined;
    firstFieldRef.current?.focus();
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setEditor(null);
        setEditorError("");
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialog!.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])"
      )).filter((node) => node.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  function toggleProduct(productId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function togglePageSelection() {
    setSelected((current) => {
      const next = new Set(current);
      if (allPageSelected) pageProducts.forEach((product) => next.delete(product.id));
      else pageProducts.forEach((product) => next.add(product.id));
      return next;
    });
  }

  function markChanged(nextProducts: AffiliateProduct[], message: string) {
    setProducts(nextProducts);
    setDirty(true);
    setConflict(false);
    setStatus(message);
  }

  function applyBulkAction() {
    if (!bulkAction || selected.size === 0) return;
    const needsDecisionNote = bulkAction === "approve_with_caveat" || bulkAction === "reject";
    if (needsDecisionNote && !bulkDecisionNote.trim()) {
      setStatus("Add a decision rationale before applying this bulk action.");
      return;
    }
    const now = new Date().toISOString();
    const next = products.map((product) => {
      if (!selected.has(product.id)) return product;
      if (bulkAction === "approve") {
        return {
          ...product,
          approvalStatus: "approved" as const,
          approvalHistory: [...product.approvalHistory, {
            decision: "approved" as const,
            reason: bulkDecisionNote.trim() || "Approved through the admin catalog.",
            decidedAt: now,
            source: "admin" as const
          }],
          workflowStatus: "approved" as const,
          updatedAt: now
        };
      }
      if (bulkAction === "approve_with_caveat") {
        return {
          ...product,
          approvalStatus: "approved_with_caveat" as const,
          approvalHistory: [...product.approvalHistory, {
            decision: "approved_with_caveat" as const,
            reason: bulkDecisionNote.trim(),
            decidedAt: now,
            source: "admin" as const
          }],
          workflowStatus: "approved" as const,
          updatedAt: now
        };
      }
      if (bulkAction === "reject") {
        return {
          ...product,
          approvalStatus: "rejected" as const,
          approvalHistory: [...product.approvalHistory, {
            decision: "rejected" as const,
            reason: bulkDecisionNote.trim(),
            decidedAt: now,
            source: "admin" as const
          }],
          workflowStatus: "research" as const,
          visibility: "private" as const,
          publicationReadiness: "blocked" as const,
          updatedAt: now
        };
      }
      if (bulkAction === "unavailable") {
        return {
          ...product,
          availabilityStatus: "unavailable" as const,
          workflowStatus: "unavailable" as const,
          unavailable: true,
          visibility: "private" as const,
          publicationReadiness: "blocked" as const,
          updatedAt: now
        };
      }
      if (bulkAction === "retired") {
        return {
          ...product,
          workflowStatus: "retired" as const,
          retired: true,
          visibility: "private" as const,
          publicationReadiness: "blocked" as const,
          updatedAt: now
        };
      }
      return product;
    });
    markChanged(next, `${selected.size} selected products updated. Save changes to persist.`);
    setBulkAction("");
    setBulkDecisionNote("");
  }

  function openEditor(product?: AffiliateProduct) {
    const index = product ? products.findIndex((candidate) => candidate.id === product.id) : null;
    setEditor({ index: index === -1 ? null : index, draft: structuredClone(product ?? makeBlankProduct(styles)) });
    setEditorError("");
    setEditorDecisionNote("");
  }

  function updateDraft<K extends keyof AffiliateProduct>(field: K, value: AffiliateProduct[K]) {
    setEditor((current) => current ? { ...current, draft: { ...current.draft, [field]: value } } : current);
    setEditorError("");
  }

  function updateAsin(value: string) {
    const asin = value.trim().toUpperCase();
    setEditor((current) => current ? {
      ...current,
      draft: {
        ...current.draft,
        asin,
        id: `prod_${asin.toLowerCase()}`,
        canonicalAmazonUrl: asin ? `https://www.amazon.com/dp/${asin}` : ""
      }
    } : current);
    setEditorError("");
  }

  function updatePrimaryStyle(styleSlug: string) {
    setEditor((current) => {
      if (!current) return current;
      const rationale = current.draft.styleAssignments.find((assignment) => assignment.role === "primary")?.rationale ?? "";
      const additional = current.draft.styleAssignments.filter((assignment) => assignment.role === "additional" && assignment.styleSlug !== styleSlug);
      return {
        ...current,
        draft: {
          ...current.draft,
          styleAssignments: [{ styleSlug, role: "primary", rank: 1, rationale }, ...additional]
        }
      };
    });
    setEditorError("");
  }

  function updateStyleRationale(value: string) {
    setEditor((current) => {
      if (!current) return current;
      return {
        ...current,
        draft: {
          ...current.draft,
          recommendationRationale: value,
          styleAssignments: current.draft.styleAssignments.map((assignment) =>
            assignment.role === "primary" ? { ...assignment, rationale: value } : assignment
          )
        }
      };
    });
    setEditorError("");
  }

  function toggleAdditionalStyle(styleSlug: string) {
    setEditor((current) => {
      if (!current) return current;
      if (primaryStyle(current.draft) === styleSlug) return current;
      const exists = current.draft.styleAssignments.some((assignment) => assignment.styleSlug === styleSlug);
      const styleAssignments = exists
        ? current.draft.styleAssignments.filter((assignment) => assignment.styleSlug !== styleSlug)
        : [...current.draft.styleAssignments, {
            styleSlug,
            role: "additional" as const,
            rank: current.draft.styleAssignments.length + 1,
            rationale: current.draft.recommendationRationale || "Additional cross-style relevance."
          }];
      return { ...current, draft: { ...current.draft, styleAssignments } };
    });
  }

  function commitEditor() {
    if (!editor) return;
    const validationError = validateEditorDraft(editor.draft, products, editor.index);
    if (validationError) {
      setEditorError(validationError);
      return;
    }
    const now = new Date().toISOString();
    const existingApprovalStatus = editor.index === null ? "pending" : products[editor.index]?.approvalStatus;
    const approvalChanged = existingApprovalStatus !== editor.draft.approvalStatus;
    if (approvalChanged && !editorDecisionNote.trim()) {
      setEditorError("Add a decision rationale when changing approval status.");
      return;
    }
    const draft: AffiliateProduct = {
      ...editor.draft,
      manufacturer: editor.draft.manufacturer.trim() || editor.draft.brand,
      updatedAt: now,
      approvalHistory: approvalChanged ? [...editor.draft.approvalHistory, {
        decision: editor.draft.approvalStatus,
        reason: editorDecisionNote.trim(),
        decidedAt: now,
        source: "admin"
      }] : editor.draft.approvalHistory,
      researchSources: editor.draft.researchSources.length > 0 ? editor.draft.researchSources : [{
        sourceType: "amazon",
        title: `${editor.draft.brand} ${editor.draft.name} Amazon listing`,
        url: editor.draft.canonicalAmazonUrl,
        observedAt: now,
        privateReferenceOnly: true,
        notes: "Canonical listing supplied through the admin catalog. Specifications and availability still require evidence review."
      }]
    };
    const next = editor.index === null
      ? [...products, draft]
      : products.map((product, index) => index === editor.index ? draft : product);
    markChanged(next, `${draft.name} updated locally. Save changes to persist.`);
    setEditor(null);
    setEditorError("");
    setEditorDecisionNote("");
  }

  async function saveChanges() {
    try {
      setSaving(true);
      setStatus("Saving catalog...");
      const response = await fetch("/api/admin/affiliate-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products, baseProducts: baseProductsRef.current })
      });
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        products?: AffiliateProduct[];
        saved?: number;
        conflict?: boolean;
      };
      if (!response.ok || !body.ok || !Array.isArray(body.products)) {
        setConflict(response.status === 409 || body.conflict === true);
        setStatus(`Save failed: ${body.error ?? "unknown error"}`);
        return;
      }
      baseProductsRef.current = body.products;
      setProducts(body.products);
      setSelected(new Set());
      setDirty(false);
      setConflict(false);
      setStatus(`Saved ${body.saved ?? body.products.length} canonical products.`);
    } catch {
      setStatus("Save failed: network error.");
    } finally {
      setSaving(false);
    }
  }

  async function reloadCatalog() {
    try {
      setStatus("Reloading current catalog...");
      const response = await fetch("/api/admin/affiliate-catalog", { cache: "no-store" });
      const body = (await response.json()) as { ok?: boolean; error?: string; products?: AffiliateProduct[] };
      if (!response.ok || !body.ok || !Array.isArray(body.products)) {
        setStatus(`Reload failed: ${body.error ?? "unknown error"}`);
        return;
      }
      baseProductsRef.current = body.products;
      setProducts(body.products);
      setSelected(new Set());
      setDirty(false);
      setConflict(false);
      setStatus("Current catalog reloaded.");
    } catch {
      setStatus("Reload failed: network error.");
    }
  }

  function clearFilters() {
    setQuery("");
    setStyleFilter("all");
    setCategoryFilter("all");
    setWorkflowFilter("all");
    setApprovalFilter("all");
    setAvailabilityFilter("all");
  }

  return (
    <section className="admin-panel affiliate-catalog-panel">
      <div className="affiliate-catalog-toolbar">
        <label className="affiliate-catalog-search">
          <span>Search catalog</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Product, brand, ASIN, category..."
          />
        </label>
        <label>
          <span>Style</span>
          <select value={styleFilter} onChange={(event) => setStyleFilter(event.target.value)}>
            <option value="all">All styles</option>
            {styles.map((style) => <option key={style.slug} value={style.slug}>{style.name}</option>)}
          </select>
        </label>
        <label>
          <span>Category</span>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label>
          <span>Lifecycle</span>
          <select value={workflowFilter} onChange={(event) => setWorkflowFilter(event.target.value)}>
            <option value="all">All lifecycle states</option>
            {Object.entries(WORKFLOW_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          <span>Approval</span>
          <select value={approvalFilter} onChange={(event) => setApprovalFilter(event.target.value)}>
            <option value="all">All approvals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="approved_with_caveat">Approved with caveat</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <label>
          <span>Availability</span>
          <select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)}>
            <option value="all">All availability</option>
            <option value="verified_available">Verified available</option>
            <option value="uncertain">Uncertain</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as CatalogSort)}>
            <option value="style">Style</option>
            <option value="name">Product name</option>
            <option value="brand">Brand</option>
            <option value="category">Category</option>
            <option value="updated">Recently updated</option>
          </select>
        </label>
      </div>

      <div className="affiliate-catalog-actionbar">
        <div className="affiliate-catalog-bulk">
          <span>{selected.size} selected</span>
          <select value={bulkAction} onChange={(event) => {
            setBulkAction(event.target.value);
            setBulkDecisionNote("");
          }} aria-label="Bulk action">
            <option value="">Choose bulk action</option>
            <option value="approve">Approve</option>
            <option value="approve_with_caveat">Approve with caveat</option>
            <option value="reject">Reject</option>
            <option value="unavailable">Mark unavailable</option>
            <option value="retired">Retire</option>
          </select>
          {bulkAction === "approve_with_caveat" || bulkAction === "reject" ? (
            <input
              className="affiliate-bulk-note"
              value={bulkDecisionNote}
              onChange={(event) => setBulkDecisionNote(event.target.value)}
              placeholder="Required decision rationale"
              aria-label="Bulk decision rationale"
            />
          ) : null}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={applyBulkAction}
            disabled={!bulkAction || selected.size === 0 || (
              (bulkAction === "approve_with_caveat" || bulkAction === "reject") && !bulkDecisionNote.trim()
            )}
          >
            Apply
          </button>
        </div>
        <div className="affiliate-catalog-actions">
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
          <button type="button" className="btn btn-ghost" onClick={() => openEditor()}>Add product</button>
          <button type="button" className="btn btn-accent" onClick={() => void saveChanges()} disabled={saving || !dirty}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <div className="affiliate-catalog-state-row">
        <p>{filteredProducts.length} of {products.length} products</p>
        <span className={`admin-save-pill${dirty ? " is-dirty" : ""}`}>
          {dirty ? "Unsaved changes" : "Saved state current"}
        </span>
      </div>
      {status ? (
        <div className={`admin-inline-status-row${conflict ? " is-error" : ""}`} aria-live="polite">
          <p className="small admin-inline-status">{status}</p>
          {conflict ? (
            <button type="button" className="btn btn-ghost" onClick={() => void reloadCatalog()}>
              Reload current catalog
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="affiliate-catalog-table-wrap">
        <table className="affiliate-catalog-table">
          <thead>
            <tr>
              <th>
                <label className="admin-row-checkbox">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(node) => {
                      if (node) node.indeterminate = somePageSelected && !allPageSelected;
                    }}
                    onChange={togglePageSelection}
                    aria-label={allPageSelected ? "Clear current page selection" : "Select current page"}
                  />
                  <span aria-hidden="true" />
                </label>
              </th>
              <th>Product</th>
              <th>Style and category</th>
              <th>Approval</th>
              <th>Lifecycle</th>
              <th>Media</th>
              <th>Availability</th>
              <th><span className="admin-sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {pageProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="affiliate-catalog-empty">
                  <strong>No products match these filters.</strong>
                  <span>Clear one or more filters, or add a new canonical product.</span>
                  <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
                </td>
              </tr>
            ) : pageProducts.map((product) => {
              const progress = mediaProgress(product);
              return (
                <tr key={product.id} className={selected.has(product.id) ? "is-selected" : undefined}>
                  <td>
                    <label className="admin-row-checkbox">
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        aria-label={`Select ${product.name}`}
                      />
                      <span aria-hidden="true" />
                    </label>
                  </td>
                  <td>
                    <div className="affiliate-product-cell">
                      <strong>{product.name}</strong>
                      <span>{product.brand} · {product.asin}</span>
                      {product.approvalStatus === "rejected" ? (
                        <span className="affiliate-decision-reason">{product.approvalHistory.at(-1)?.reason}</span>
                      ) : null}
                      <a href={product.canonicalAmazonUrl} target="_blank" rel="noreferrer">Open Amazon listing</a>
                    </div>
                  </td>
                  <td>
                    <strong>{styleNames.get(primaryStyle(product)) ?? primaryStyle(product)}</strong>
                    <span className="affiliate-cell-sub">{product.category}</span>
                  </td>
                  <td><span className={`affiliate-status ${statusTone(product.approvalStatus)}`}>{product.approvalStatus.replaceAll("_", " ")}</span></td>
                  <td><span className={`affiliate-status ${statusTone(product.workflowStatus)}`}>{WORKFLOW_LABELS[product.workflowStatus]}</span></td>
                  <td>
                    <strong>{progress.ready} / {progress.total}</strong>
                    <span className="affiliate-cell-sub">{product.imageQaStatus.replaceAll("_", " ")}</span>
                  </td>
                  <td><span className={`affiliate-status ${statusTone(product.availabilityStatus)}`}>{product.availabilityStatus.replaceAll("_", " ")}</span></td>
                  <td><button type="button" className="btn btn-ghost" onClick={() => openEditor(product)}>Edit</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="affiliate-catalog-mobile-list">
        {pageProducts.length === 0 ? (
          <div className="affiliate-catalog-empty">
            <strong>No products match these filters.</strong>
            <span>Clear one or more filters, or add a new canonical product.</span>
          </div>
        ) : pageProducts.map((product) => {
          const progress = mediaProgress(product);
          return (
            <article key={product.id} className={`affiliate-catalog-mobile-card${selected.has(product.id) ? " is-selected" : ""}`}>
              <div className="affiliate-mobile-card-head">
                <label className="admin-row-checkbox">
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    aria-label={`Select ${product.name}`}
                  />
                  <span aria-hidden="true" />
                </label>
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.brand} · {product.asin}</p>
                </div>
              </div>
              <dl>
                <div><dt>Style</dt><dd>{styleNames.get(primaryStyle(product))}</dd></div>
                <div><dt>Category</dt><dd>{product.category}</dd></div>
                <div><dt>Approval</dt><dd>{product.approvalStatus.replaceAll("_", " ")}</dd></div>
                <div><dt>Lifecycle</dt><dd>{WORKFLOW_LABELS[product.workflowStatus]}</dd></div>
                <div><dt>Media</dt><dd>{progress.ready} / {progress.total}</dd></div>
                <div><dt>Availability</dt><dd>{product.availabilityStatus.replaceAll("_", " ")}</dd></div>
              </dl>
              {product.approvalStatus === "rejected" ? (
                <p className="affiliate-decision-reason"><strong>Owner reason:</strong> {product.approvalHistory.at(-1)?.reason}</p>
              ) : null}
              <div className="affiliate-mobile-card-actions">
                <a className="btn btn-ghost" href={product.canonicalAmazonUrl} target="_blank" rel="noreferrer">Amazon</a>
                <button type="button" className="btn btn-ghost" onClick={() => openEditor(product)}>Edit product</button>
              </div>
            </article>
          );
        })}
      </div>

      <nav className="affiliate-catalog-pagination" aria-label="Affiliate catalog pages">
        <button type="button" className="btn btn-ghost" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {pageCount}</span>
        <button type="button" className="btn btn-ghost" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>
          Next
        </button>
      </nav>

      {editor ? (
        <div className="affiliate-editor-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setEditor(null);
            setEditorError("");
          }
        }}>
          <div
            className="affiliate-editor-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="affiliate-editor-title"
            ref={dialogRef}
          >
            <header>
              <div>
                <p className="eyebrow">Canonical product</p>
                <h2 id="affiliate-editor-title">{editor.index === null ? "Add product" : "Edit product"}</h2>
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => {
                setEditor(null);
                setEditorError("");
              }}>Close</button>
            </header>

            <div className="affiliate-editor-grid">
              <label>
                <span>Product name</span>
                <input ref={firstFieldRef} value={editor.draft.name} onChange={(event) => updateDraft("name", event.target.value)} />
              </label>
              <label>
                <span>Brand</span>
                <input value={editor.draft.brand} onChange={(event) => updateDraft("brand", event.target.value)} />
              </label>
              <label>
                <span>Manufacturer</span>
                <input value={editor.draft.manufacturer} onChange={(event) => updateDraft("manufacturer", event.target.value)} />
              </label>
              <label>
                <span>Category</span>
                <input value={editor.draft.category} onChange={(event) => updateDraft("category", event.target.value)} list="affiliate-category-options" />
                <datalist id="affiliate-category-options">
                  {categories.map((category) => <option key={category} value={category} />)}
                </datalist>
              </label>
              <label>
                <span>ASIN</span>
                <input value={editor.draft.asin} onChange={(event) => updateAsin(event.target.value)} maxLength={10} autoCapitalize="characters" />
              </label>
              <label>
                <span>Public slug</span>
                <input value={editor.draft.slug} onChange={(event) => updateDraft("slug", event.target.value.toLowerCase())} />
              </label>
              <label className="affiliate-editor-span">
                <span>Canonical Amazon product URL</span>
                <input type="url" value={editor.draft.canonicalAmazonUrl} onChange={(event) => updateDraft("canonicalAmazonUrl", event.target.value)} />
                <small>Exact product destination. Tracking parameters do not belong here.</small>
              </label>
              <label className="affiliate-editor-span">
                <span>User-supplied Amazon Associates URL</span>
                <input
                  type="url"
                  value={editor.draft.associatesUrl ?? ""}
                  onChange={(event) => updateDraft("associatesUrl", event.target.value || null)}
                  placeholder="Added only after product approval"
                />
                <small>Kept separate from canonical identity. This app never fabricates the tracking link.</small>
              </label>
              <label>
                <span>Primary style</span>
                <select value={primaryStyle(editor.draft)} onChange={(event) => updatePrimaryStyle(event.target.value)}>
                  {styles.map((style) => <option key={style.slug} value={style.slug}>{style.name}</option>)}
                </select>
              </label>
              <label>
                <span>Recommendation</span>
                <select
                  value={editor.draft.recommendation}
                  onChange={(event) => updateDraft("recommendation", event.target.value as AffiliateProduct["recommendation"])}
                >
                  <option value="approve">Approve</option>
                  <option value="approve_with_caveat">Approve with caveat</option>
                  <option value="replace">Replace</option>
                </select>
              </label>
              <label className="affiliate-editor-span">
                <span>Style fit and recommendation rationale</span>
                <textarea value={editor.draft.recommendationRationale} onChange={(event) => updateStyleRationale(event.target.value)} rows={4} />
              </label>
              <label className="affiliate-editor-span">
                <span>Caveats or unknowns, one per line</span>
                <textarea
                  value={editor.draft.caveats.join("\n")}
                  onChange={(event) => updateDraft("caveats", event.target.value.split("\n").map((value) => value.trim()).filter(Boolean))}
                  rows={4}
                />
              </label>
              <label className="affiliate-editor-span">
                <span>Duplicate and cross-style notes</span>
                <textarea
                  value={editor.draft.crossStyleNotes}
                  onChange={(event) => updateDraft("crossStyleNotes", event.target.value)}
                  rows={3}
                />
              </label>
              <fieldset className="affiliate-editor-span affiliate-style-checks">
                <legend>Additional style assignments</legend>
                {styles.map((style) => (
                  <label key={style.slug}>
                    <input
                      type="checkbox"
                      checked={editor.draft.styleAssignments.some((assignment) => assignment.styleSlug === style.slug)}
                      disabled={primaryStyle(editor.draft) === style.slug}
                      onChange={() => toggleAdditionalStyle(style.slug)}
                    />
                    <span>{style.name}</span>
                  </label>
                ))}
              </fieldset>
              <label>
                <span>Approval status</span>
                <select
                  value={editor.draft.approvalStatus}
                  onChange={(event) => {
                    updateDraft("approvalStatus", event.target.value as AffiliateProduct["approvalStatus"]);
                    setEditorDecisionNote("");
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="approved_with_caveat">Approved with caveat</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              {(editor.index === null ? "pending" : products[editor.index]?.approvalStatus) !== editor.draft.approvalStatus ? (
                <label className="affiliate-editor-span">
                  <span>Decision rationale</span>
                  <textarea
                    value={editorDecisionNote}
                    onChange={(event) => setEditorDecisionNote(event.target.value)}
                    rows={3}
                    placeholder="Required when approval status changes"
                  />
                </label>
              ) : null}
              {editor.draft.approvalHistory.length > 0 ? (
                <section className="affiliate-editor-span affiliate-decision-history" aria-label="Approval history">
                  <h3>Approval history</h3>
                  <ol>
                    {editor.draft.approvalHistory.map((decision, index) => (
                      <li key={`${decision.decidedAt}-${index}`}>
                        <strong>{decision.decision.replaceAll("_", " ")}</strong>
                        <span>{decision.reason}</span>
                        <small>{new Date(decision.decidedAt).toLocaleString()} · {decision.source}</small>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}
              <label>
                <span>Lifecycle status</span>
                <select
                  value={editor.draft.workflowStatus}
                  onChange={(event) => updateDraft("workflowStatus", event.target.value as AffiliateProduct["workflowStatus"])}
                >
                  {Object.entries(WORKFLOW_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>
                <span>Reference readiness</span>
                <select
                  value={editor.draft.referenceReadiness}
                  onChange={(event) => updateDraft("referenceReadiness", event.target.value as AffiliateProduct["referenceReadiness"])}
                >
                  <option value="missing">Missing</option>
                  <option value="partial">Partial</option>
                  <option value="ready">Ready</option>
                  <option value="blocked_rights">Blocked by rights</option>
                </select>
              </label>
              <label>
                <span>Availability</span>
                <select
                  value={editor.draft.availabilityStatus}
                  onChange={(event) => updateDraft("availabilityStatus", event.target.value as AffiliateProduct["availabilityStatus"])}
                >
                  <option value="verified_available">Verified available</option>
                  <option value="uncertain">Uncertain</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </label>
            </div>

            {editorError ? <p className="affiliate-editor-error" role="alert">{editorError}</p> : null}
            <footer>
              <p>Technical ID: <code>{editor.draft.id || "created from ASIN"}</code></p>
              <div>
                <button type="button" className="btn btn-ghost" onClick={() => setEditor(null)}>Cancel</button>
                <button type="button" className="btn btn-accent" onClick={commitEditor}>Apply to catalog</button>
              </div>
            </footer>
          </div>
        </div>
      ) : null}
    </section>
  );
}
