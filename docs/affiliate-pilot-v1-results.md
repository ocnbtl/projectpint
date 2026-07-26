# Affiliate Media Pilot V1 Results

Status: completed locally on 2026-07-26; hold full-scale generation.

## Outcome

The approved pilot produced the complete 33-asset final matrix:

- 3 approved canonical products;
- 1 presentation asset per product;
- 2 styles per product;
- 5 styled gallery views per style;
- 30 styled views plus 3 presentation assets.

Thirty-four generation calls were made. One Warm Editorial curtain image invented an oval rail; a targeted retry corrected the installation to one straight rod. The rejected original remains in the local evidence package.

No production database records, storage objects, deployments, Amazon data, Associates links, or public pages were changed.

## Technical QA

- Expected assets: 33
- Present: 33
- Missing: 0
- Duplicate content hashes: 0
- Correct `1024 × 1536` final canvas: 33
- Presentation files with true alpha: 3
- Source-reference files committed or published: 0

Two presentation generators returned non-2:3 source canvases. The postprocessor normalized them onto transparent `1024 × 1536` canvases without cropping and retained the untouched keyed sources.

## Visual QA

| Product | Strict pass | Pass with caveat | Fail | Result |
| --- | ---: | ---: | ---: | --- |
| OXO dispenser, B0829N8C9G | 11 | 0 | 0 | Identity and transparency passed |
| KOUFALL curtain, B0D2KK6MNS | 0 | 10 | 1 | Styled set usable with hook-hardware caveat; presentation edge failed |
| Bambüsi bench, B0DC7VG6Z9 | 8 | 2 | 1 | Styled set usable with wide-view caveat; presentation edge failed |
| Total | 19 | 12 | 2 | Hold scale |

The OXO silhouette, pump, tapered steel body, blue reservoir, and existing mark remained consistent.

The curtain kept its solid terracotta color, woven texture, plain surface, folds, and hem. Hook spacing and count varied slightly. The corrected Warm Editorial retry passed, but the transparent presentation retained visible chroma contamination around some reflective hooks after the allowed tighter-matte retry.

The bench retained its two-tier construction, bowed front apron, warm bamboo finish, legs, and open shelf. Its two wide room views show minor apparent slat-count and proportion drift at small scale. The transparent presentation retained faint chroma contamination inside narrow lower-shelf gaps after the allowed tighter-matte retry.

## Workflow findings

The workflow is sound for:

- deterministic job IDs and storage keys;
- one canonical product reused across styles without duplication;
- one private identity reference plus one reviewed presentation anchor;
- five repeatable composition slots;
- product-specific identity constraints;
- final canvas normalization;
- alpha-channel validation;
- content hashing, contact sheets, and per-product review;
- rejected-output retention and targeted retry promotion.

The pilot exposed three scale blockers:

1. Chroma-key presentation extraction is not reliable enough for reflective fine hardware or narrow open geometry.
2. The exact executed prompt, selected model and quality, provider request ID, latency, and billed usage must be captured automatically. The versioned manifest now requires prompt capture, but the built-in tool did not return a complete billing or request record for this manual pilot.
3. Canonical identity rules must say whether installation hardware such as curtain hooks is allowed to vary and whether exact visible slat count is mandatory in every scene.

## Cost and batching

The built-in image tool did not expose measured pilot billing. Using OpenAI's current GPT Image 2 portrait output table only as a planning reference:

- 34 pilot calls would be about $1.39 at medium output quality or $5.61 at high output quality;
- 3,599 full-cohort outputs would be about $147.56 at medium or $593.84 at high;
- reference-image inputs, prompt tokens, Responses API model usage, retries, segmentation, storage, delivery, and review are additional.

The pilot's one retry is a 3.0% retry rate, but 33 assets are too small a sample for a dependable full-scale forecast.

After the presentation fallback passes, the recommended next batch remains five approved products across their complete 61-job matrix, with a spend ceiling, concurrency cap, retry ceiling, and automatic pause on QA failure.

## Local evidence

- `output/affiliate-pilot/v1/manifest.json`
- `output/affiliate-pilot/v1/technical-qa.json`
- `output/affiliate-pilot/v1/visual-qa.json`
- `output/affiliate-pilot/v1/contact-sheets/pilot-all-33.jpg`
- per-product contact sheets under `output/affiliate-pilot/v1/contact-sheets/`
- rejected retry evidence under `output/affiliate-pilot/v1/rejected/`

The generated images and QA artifacts remain local and untracked pending owner review.
