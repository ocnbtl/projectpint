# Affiliate media pilot v2 results

Date: 2026-07-26 generation run; QA completed 2026-07-27 EDT.

Status: ready for owner comparison. Full-scale generation remains deliberately
blocked pending owner approval.

## Scope

This refreshed pilot keeps the three owner-approved transparent presentation
assets from pilot v1 and replaces all 30 styled scenes:

- OXO Stainless Steel Soap Dispenser, ASIN `B0829N8C9G`
  - Minimalist Elegance: five images
  - Modern Marble: five images
- KOUFALL Terracotta Rust Linen-Blend Shower Curtain, ASIN `B0D2KK6MNS`
  - Boho Earth Tones: five images
  - Warm Editorial: five images
- Bambusi Bamboo Shower Bench, ASIN `B0DC7VG6Z9`
  - Spa Greenery: five images
  - Japandi: five images

No full-scale media generation, production write, deployment, or publication
was performed.

## Prompt and generation changes

The v2 prompt contract is explicit about:

- one plausible recent-smartphone exposure rather than product photography;
- shared product-and-room lighting, white balance, contrast, contact shadows,
  reflections, and highlight range;
- a different physical bathroom for every image in each five-image set;
- meaningful changes in camera position, height, distance, viewpoint, product
  orientation, placement, time of day, and surrounding objects;
- occupied, functional bathrooms with restrained everyday imperfection;
- avoiding studio light, showroom emptiness, HDR, perfect symmetry, aggressive
  bokeh, repeated architecture, pasted-in products, and CGI smoothness;
- product-specific identity invariants and exact scene specifications;
- private pose-guide corrections for four OXO side/rear-oriented scenes;
- targeted negative constraints learned from rejected attempts.

The manifest records every exact final prompt, prompt hash, scene ID, requested
model (`gpt-image-2`), requested quality (`high`), reference count, storage key,
and pose-guide relationship.

The built-in image-generation tool did not expose provider response metadata for
the model, quality, request ID, cost, or latency. Those values are therefore
recorded as requested settings, not falsely represented as independently
observed provider metadata.

## QA interventions

Thirty initial styled generations were reviewed. Nine additional generation
calls were used for private pose guides and targeted replacements:

- one curtain scene was replaced because it copied a curved display rail from
  the reference instead of using a normal straight shower rod;
- four OXO scenes were replaced because they reverted to the canonical front
  view instead of the specified side or rear-three-quarter orientation;
- one replacement was rejected again because a background dental product
  contained a readable third-party brand logo;
- three private OXO pose guides were generated, two of which support the four
  final pose-corrected jobs.

The final 33-asset set contains none of the six rejected or superseded images.

## Final technical gate

The version-explicit command is:

```bash
npm run qa:affiliate-pilot -- v2 v1
```

It fails when the target version is omitted, verifies all manifest assets,
checks dimensions and alpha, detects duplicate hashes, and rebuilds the full,
per-product, and paired comparison contact sheets.

Final result:

- 33/33 manifest assets present
- 33/33 assets at 1024 × 1536
- 3/3 presentation assets with real transparent alpha
- 0 duplicate final-image hashes
- 30/30 styled scenes included in paired v1-to-v2 comparisons

## Review evidence

The local evidence is intentionally untracked:

- `output/affiliate-pilot/v2/manifest.json`
- `output/affiliate-pilot/v2/execution-log.json`
- `output/affiliate-pilot/v2/technical-qa.json`
- `output/affiliate-pilot/v2/visual-qa.json`
- `output/affiliate-pilot/v2/contact-sheets/pilot-all-33.jpg`
- `output/affiliate-pilot/v2/contact-sheets/comparison-v1-v2-all-30-pairs.jpg`
- per-product final and paired comparison sheets in
  `output/affiliate-pilot/v2/contact-sheets/`
- rejected attempts in `output/affiliate-pilot/v2/rejected/`

Pilot v1 remains preserved under `output/affiliate-pilot/v1/`.

## Scale gate

The next decision is visual, not architectural: the owner must compare pilot v2
with pilot v1 and approve, request another targeted iteration, or identify
specific scene-level replacements. The full media library must not begin until
that decision is explicit.

## Dependency advisory review

The production dependency audit reports zero vulnerabilities. The full audit
still reports nine high-severity development-tooling advisories through the
ESLint/minimatch/brace-expansion chain.

`npm audit fix --dry-run` reports no compatible in-range change. The offered
remediation requires ESLint 10 and/or `eslint-config-next` 16, which is a major
toolchain upgrade and is not compatible with the current Next.js 15 lint stack.
ESLint 10 also raises the minimum supported Node 20 version above this
repository's declared `>=20.9.0` floor. The patched `brace-expansion` 5 API is
also a named-export API, while the older minimatch chain calls the 1.x package
as a CommonJS function, so forcing only that transitive override would be
unsafe. No forced upgrade, downgrade, or dependency override was applied. The
advisories remain a release concern, but they do not affect the generated pilot
files or production dependency graph.
