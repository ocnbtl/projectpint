# Affiliate Catalog and Media Workflow

Status: local foundation implemented; all 60 style slots are owner-approved across 59 canonical products. A rights-approved 66-asset v3 workflow pilot is complete locally. Full-scale generation still requires a separate owner decision.

## Verified boundary

- The durable checkout is `/Users/ocean/Code/project-pint-release-final`.
- Existing paid/concept routes remain under `/products/[slug]`.
- Affiliate product details use `/shop/[slug]`, avoiding a product-route collision.
- The current legacy 24-card Inspiration flow remains in place until an atomic transition is authorized.
- The prepared database migration has not been applied to production.
- The 60 initial candidates remain as dated research history: 41 are owner-approved and 19 are rejected with the owner's reasons preserved in approval history.
- All 19 replacements are owner-approved and applied to the private local cohort: 18 are new ASINs and one reuses the approved Bambüsi canonical product with an additional Japandi assignment.
- The active local cohort therefore contains 59 unique canonical products and 60 approved style slots.
- No product has a fabricated Associates URL or can pass the public-product gate.
- Product approval does not authorize reference-image use, paid generation, or full media generation.

## Canonical model

One `affiliate_products` record owns identity, ASIN, canonical Amazon URL, owner-supplied Associates URL, brand, manufacturer, category, product name, recommendation, caveats, lifecycle, approval, approval history, availability, public visibility, and retirement.

Related tables own:

- research sources and observation dates;
- primary and additional Inspiration-style assignments;
- presentation and per-style media sets;
- individual media assets and QA;
- later generated bathroom scenes;
- scene membership, display order, and accessible hotspot coordinates.

Uniqueness is enforced for ID, slug, ASIN, and canonical Amazon URL. Exactly one style assignment can be primary. Products can have additional style assignments without duplicate product records.

The local/admin transition uses the versioned server-only `Affiliate_Catalog_V1` aggregate in `app_storage_tabs`. The normalized migration and rollback are prepared separately for a controlled production change.

## Admin workflow

The existing protected `/admin/affiliate-links` route now presents the canonical catalog workflow:

- a read-only 19-slot replacement decision record showing the rejected ASIN and reason beside the accepted product;
- search by human name, brand, ASIN, category, or slug;
- style, category, lifecycle, approval, and availability filters;
- useful sorting and ten-record pagination;
- page selection and bulk approval, caveated approval, rejection, unavailable, and retirement actions;
- a focused editor for identity, URLs, assignments, rationale, caveats, readiness, and lifecycle;
- explicit separation of canonical and Associates URLs;
- duplicate ID, slug, ASIN, and canonical-URL validation;
- optimistic conflict detection and reload recovery;
- loading, empty, success, validation, network-error, and conflict feedback;
- unsaved-change navigation protection;
- desktop table and mobile record-card layouts;
- keyboard-operable controls, visible focus, dialog focus containment, and Escape dismissal.

Deletion is intentionally replaced by unavailable and retired lifecycle states so auditability and historical relationships survive.

## Public product gate

`/shop/[slug]` returns a product only when all of the following are true:

1. approval is `approved` or `approved_with_caveat`;
2. visibility is `public`;
3. a user-supplied Associates URL exists;
4. publication readiness is `ready`;
5. media completeness is `complete`;
6. image QA is `passed`;
7. the product is neither unavailable nor retired.

`AFFILIATE_CATALOG_PREVIEW=1` enables private fixtures only in a non-production runtime. The gallery shell supports five swipe-equivalent controls, a style selector, missing-media placeholders, caveats, a disabled pre-publication CTA, and the existing affiliate disclosure.

## Media manifest and storage

- Manifest version: `1`
- Prompt version: `affiliate-product-v2`
- Pilot prompt version: `affiliate-pilot-product-v1`
- Pilot v2 prompt version: `affiliate-pilot-natural-photo-v2`
- Pilot v3 prompt version: `affiliate-pilot-physical-photo-v3`
- Pilot generation version: `pilot-2026-07-26-run-01`
- Pilot v3 generation version: `pilot-2026-07-27-run-03`
- Initial generation version: `unassigned`
- Target output: `1024 × 1536` portrait WebP

Deterministic keys:

```text
affiliate-products/v1/{ASIN}/{product-slug}/presentation/product-transparent.webp
affiliate-products/v1/{ASIN}/{product-slug}/styles/{style-slug}/scene-{01..05}.webp
```

Each product expands to 61 jobs:

- 1 isolated presentation image;
- 5 gallery images × 12 styles = 60 styled images.

The approved cohort contains 59 canonical products because Bambüsi fills two style slots without a duplicate ASIN. The manifest therefore reconciles to:

- 59 presentation images;
- 3,540 styled images;
- 3,599 total images.

All 3,599 jobs are `blocked_reference_rights`, the complete-cohort pilot flag is true, and `generationAuthorized` remains false. No media is generated by manifest creation. A later owner decision to require 60 distinct canonical products would require a new Japandi product approval and would restore the 3,660-image estimate.

The v3 pilot manifest records the owner's reference-rights confirmation, six approved ASINs, ten test styles, 66 deterministic local PNG keys, product-specific identity invariants, scene-specific physical QA targets, one to three required reference inputs per job, and mandatory execution-prompt capture. It reuses three owner-approved cutouts, generates three new cutouts, and defines 60 styled scenes. Its `fullScaleAuthorized` value remains false.

## Queue, retry, and partial failure

Recommended state progression:

```text
blocked_approval → blocked_reference_rights → queued → generating → generated → qa_passed → ready
                                                          ↘ failed
                                                          ↘ qa_failed → queued (new generation version)
```

- Queue identity is the deterministic job ID, not an ephemeral request ID.
- A retry never silently destroys evidence. Preserve the rejected attempt, write
  the correction under a new attempt or generation record, and promote only
  after QA.
- Retry transient rate-limit and server errors with bounded exponential backoff and jitter.
- Do not retry validation, rights, moderation, or prompt errors unchanged.
- For a good room with a failed product identity, use one bounded product-only
  edit retry with the room image plus exact product anchors. The v3 pilot showed
  this can improve a countable repeated geometry such as bench slats while still
  failing an asymmetric multi-tier topology such as the Yamazaki cart. Do not
  loop blind identity retries after the bounded edit fails.
- Store provider request IDs for diagnosis, but never expose credentials or private reference URLs publicly.
- A five-image style set remains `partial` until all five assets pass QA.
- One failed style set does not block generation or QA for another style.
- Retirement disables delivery references without deleting provenance or historical hashes.

## Presentation transparency

The final board asset still requires a transparent background. Current OpenAI documentation says `gpt-image-2` does not support transparent output, so the main manifest requests an evenly lit isolated product and marks the job for a reviewed segmentation-to-alpha pass.

The pilots used a flat chroma-green intermediate and the local reviewed
chroma-key helper. Pilot v3 reuses the three owner-approved v2 cutouts and adds
three new presentation assets for an arched brass mirror, slim rolling cart,
and floral curtain. All six v3 presentation assets pass true-alpha and
`1024 × 1536` canvas checks. The new floral anchor required a count-corrected
retry to produce exactly twelve top openings, and the cart anchor required a
geometry-corrected retry to preserve the tall-left bay and short-right middle
shelf. Full scale must keep visual edge and countable-feature QA rather than
assuming technical alpha alone proves product fidelity.

This avoids pretending that an unsupported API option is available. Before full scale, the chosen pipeline should still be compared against:

- GPT Image 2 plus segmentation and edge QA;
- any still-supported transparent-output model;
- a separately licensed background-removal service or local segmentation pipeline.

The chosen pipeline must pass edge halos, interior cutouts, shadows, reflections, fine parts, and true-alpha checks before scale.

## Image QA

Every asset must pass:

- product identity: silhouette, dimensions, components, finish, hardware, controls, labels, and included parts stay faithful;
- no invented product capability, accessory, certification, installation method, or safety claim;
- style fidelity without changing the canonical product;
- five gallery views have meaningful composition variation;
- realistic scale, plumbing/electrical context, contact shadows, reflections, and wet-area placement;
- no malformed geometry, duplicated parts, illegible branding, unexpected text, or unsafe use;
- presentation alpha has clean edges, preserved holes, no fringe, and useful soft shadow treatment;
- target dimensions, file type, color profile, compression, and content hash are valid;
- alt text identifies product, style, and useful visual context without keyword stuffing;
- mobile crop and focal point keep the product visible;
- no source listing image is published, committed, or redistributed as a Project Pint asset.

Pilot v3 adds explicit high-risk checks:

- every prop has a sufficient support surface and no object crosses glass,
  walls, counters, doors, hooks, or another object;
- the camera occupies a physically accessible location;
- sinks, showers, rods, drains, doors, and plumbing form one buildable room;
- mirrors show only the stated opposite geometry with correct perspective and
  no phantom objects or photographer;
- natural textures and curtain folds are nonperiodic rather than visibly tiled;
- countable product features such as slats, shelves, openings, legs, casters,
  and hooks match the canonical anchor;
- product exposure, white balance, specular hue, and contact shadow belong to
  the room rather than a studio layer.

## Accessibility and delivery

- Gallery controls are buttons with names and pressed state.
- Style selection uses a labeled native select.
- Generated images need useful non-duplicative alt text; decorative thumbnails use empty alt.
- Keyboard users can reach style selection, five gallery slots, CTA, caveats, and breadcrumbs in logical order.
- Reduced motion must remove nonessential gallery transitions.
- Use responsive `srcset` delivery and lazy-load non-active gallery images.
- Serve WebP or AVIF derivatives with immutable hashed URLs and a predictable fallback.
- Preserve intrinsic dimensions to prevent layout shift.
- Do not communicate approval, failure, QA, or unavailability by color alone.

## Current cost and batching estimate

OpenAI’s official July 2026 documentation lists GPT Image 2 portrait `1024 × 1536` output at approximately:

- low: `$0.005` per image;
- medium: `$0.041` per image;
- high: `$0.165` per image.

For 3,599 outputs, output-only generation is therefore approximately:

- low: `$18.00`;
- medium: `$147.56`;
- high: `$593.84`.

These are not a total project quote. They exclude text input, high-fidelity reference-image input, retries, rejected/QA-failed generations, segmentation, storage, delivery, and human review. A planning reserve of 25% to 60% for retries and QA would place medium output generation around `$184.45` to `$236.10` before those excluded costs.

Pilot v3 made 86 generation calls for 63 generated final assets, plus three
owner-approved reused cutouts, yielding 66 final review assets. The additional
23 calls cover presentation corrections and one bounded product-only edit pass
for the ten bench and ten cart scenes. At the documented GPT Image 2 portrait
output rates, 86 calls are roughly `$3.53` at medium output quality or `$14.19`
at high output quality before reference-image inputs, text, and any Responses
API model usage. The built-in image tool did not expose an actual bill or
per-call model/quality selection, so these values are planning references
rather than measured pilot spend.

Recommended sequence:

1. Completed: three-product, 33-asset technical pilot.
2. Completed: six-product, 66-asset physical-realism and identity pilot.
3. Owner visual review of v3, including explicit acceptance or rejection of the
   remaining textile and multi-tier geometry limitations.
4. After owner approval, one complete approved style batch:
   5 products × 61 jobs = 305 images.
5. Continue in 305-image batches only with a spend ceiling, concurrency limit,
   retry ceiling, countable-identity gate, and pause-on-QA-failure threshold.

At documented rate limits, actual throughput depends on the account tier and image-token limits. The queue must honor provider `429` responses rather than assume maximum concurrency.

Official references:

- https://developers.openai.com/api/docs/models/gpt-image-2
- https://developers.openai.com/api/docs/guides/image-generation
- https://developers.openai.com/api/docs/pricing

## Rights and provenance gate

Amazon and manufacturer listing images may be private research references only where the applicable terms and owner rights permit. Public availability is not reuse permission. Before any provider receives reference images, the owner must confirm:

- the image source and URL;
- who owns or licenses it;
- whether AI-input/reference use is permitted;
- whether storage and provider processing are permitted;
- retention and deletion expectations;
- whether output publication can use the depicted branded product;
- any trademark, trade-dress, or seller-image restrictions.

Unknown rights are `blocked_rights`, not `ready`.

Amazon's current Associates IP license grants a limited right to display Program Content through its authorized program mechanisms and forbids unlicensed downloading, alteration, redistribution, and data extraction. That license does not establish a right to upload seller or manufacturer listing imagery to an image-generation provider or use it to create derivative campaign assets. Project Pint therefore treats AI-reference permission as a separate legal/rights decision even after Associates access exists.

Current policy reference:

- https://affiliate-program.amazon.com/help/operating/policies

## Atomic public transition

Do not remove the legacy search-link cards until:

1. products are approved;
2. normalized production data and recovery are authorized;
3. internal `/shop/[slug]` routes work;
4. all required media passes QA;
5. owner-supplied Associates URLs are validated;
6. every active card maps to an internal product route;
7. every CTA maps to its intended exact Amazon product;
8. a rollback snapshot exists.

Then publish new records and card destinations in one controlled release, verify every route and CTA, and disable the legacy search destinations only after the new paths are confirmed.
