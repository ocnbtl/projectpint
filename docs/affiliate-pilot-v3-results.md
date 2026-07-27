# Affiliate media pilot v3 results

Date: 2026-07-27 EDT.

Status: ready for owner review. Full-scale generation, production data changes,
deployment, and publication remain blocked pending an explicit owner decision.

## Scope

Pilot v3 contains 66 final local assets:

- six transparent presentation assets;
  - three owner-approved cutouts reused from v2;
  - three new generated and locally segmented cutouts;
- 60 generated bathroom scenes;
  - 30 v2-to-v3 replacement scenes for the OXO dispenser, KOUFALL terracotta
    curtain, and Bambusi bamboo bench;
  - 30 first pilot scenes for the Umbra Hubba mirror, Yamazaki Tower cart, and
    Lush Decor Leah floral curtain.

The three added products deliberately test high-risk media behavior:

- Umbra Hubba Arched Wall Mirror, Brass (`B08TLP2D54`): reflection geometry;
- Yamazaki Tower Slim Rolling Storage Cart, White (`B07PFYZ3DP`): asymmetric
  rigid shelf topology and casters;
- Lush Decor Leah Floral Shower Curtain, Blue (`B07SG7BV11`): patterned fabric,
  twelve suspension points, and motif fidelity through folds.

## V3 prompt contract

Every scene has a distinct room, camera, light, placement, props, and
scene-specific QA target. The shared contract now requires:

- valid support and center of mass for every object;
- gravity, collision, clearance, and dry/wet-area coherence;
- complete, buildable sink, shower, rod, drain, wall, floor, and door geometry;
- a camera position that a person could physically occupy;
- reflections containing only the stated opposite room at the correct
  perspective and occlusion;
- nonrepeating tile, stone, wood, plaster, terrazzo, rug, metal, and fabric
  texture;
- one shared ambient exposure and white balance for product and room;
- exact countable product features;
- a different physical environment and prop arrangement in every gallery
  image;
- an ordinary recent-smartphone capture rather than a studio product image or
  perfect real-estate render.

The exact prompt, prompt hash, scene ID, QA target, reference count, requested
model, requested quality, and deterministic storage key are captured in the
local manifest.

Requested settings are `gpt-image-2` and `high`. The built-in generation
surface did not expose provider model, quality, request ID, latency, or billing
metadata, so those provider values remain explicitly unobserved.

## Generation and retry accounting

- 86 generation calls total;
- 63 generated final assets;
- three owner-approved cutouts reused unchanged;
- 23 calls beyond the 63 accepted generated assets;
- three presentation retries:
  - the floral cutout needed an exactly-twelve-openings correction;
  - the first cart cutout reversed the asymmetric shelf layout;
  - an additional floral attempt still had the wrong opening count;
- 20 bounded product-only edit retries:
  - ten cart scenes;
  - ten bench scenes.

The 20 original cart and bench scenes remain in the untracked
`rejected-first-pass` evidence folder. The final 66-image set contains the
identity-corrected versions.

## Visual QA verdict

### OXO dispenser: strong improvement

V3 supplies ten materially distinct rooms and viewpoints. Counter props are
supported, sink construction is coherent, mirrors are plausible, the bottle is
less independently bright, and the warm/cool reflection mismatch is reduced.
No additional OXO retry was required.

### KOUFALL terracotta curtain: improved, still conditional

Room palette, lighting, architecture, camera placement, shower hardware, and
lived-in detail are substantially more varied than v2. The solid textile still
settles into overly regular vertical folds in several scenes despite the
twelve-hook, unequal-fold, and weighted-hem contract. Do not treat solid-curtain
physics as solved for scale.

### Bambusi bench: correction improved identity

The second pass retains the realistic rooms while bringing the product closer
to the exact nine-slat anchor, matte bamboo, lower shelf, and four-leg
construction. Countable slats still require full-size human QA per image; prompt
compliance cannot be inferred from a contact-sheet thumbnail.

### Umbra Hubba mirror: strongest new-product result

The thin brass arch remains stable across ten rooms. Sinks are supported, the
camera is not visible, and reflections generally read as plausible opposite
walls, doors, towels, or shower areas rather than duplicate or phantom rooms.
This product type is a reasonable candidate for the next controlled batch.

### Yamazaki Tower cart: identity gate still fails

The rooms, placement, floor contact, and lived-in compositions are useful. The
initial pass mutated the product into generic cabinets and altered the shelf
topology. A product-only edit retry improved consistency but still did not
reliably preserve the tall-left bay, short-right middle shelf, solid side, and
exact caster construction. This product type must not scale under the current
direct-generation workflow.

The next safe experiment for asymmetric rigid products is a workflow that
locks product pixels or geometry more strongly, such as a separately rendered
canonical product with controlled perspective and relighting composited into a
generated room, followed by a bounded integration edit. That experiment needs
its own small validation before production use.

### Lush Decor floral curtain: useful diagnostic, conditional

The curtain stays recognizable across ten varied rooms and provides better
fabric integration than the original solid-curtain pilot. The prominent floral
landmarks expose motif repetition and drift, so this category needs a
pattern-identity gate in addition to general fabric and physics review.

## Technical QA

Command:

```bash
npm run qa:affiliate-pilot -- v3 v2
```

Result:

- 66/66 manifest assets present;
- 66/66 assets at `1024 × 1536`;
- 6/6 presentation assets with true transparent alpha;
- zero duplicate final-image hashes;
- 30/30 original-product scenes included in labeled v2-to-v3 pairs;
- 30 new-product scenes included in the complete v3 and per-product sheets.

Technical dimensions and alpha do not override visual identity or physics QA.

## Local review evidence

The review evidence is intentionally untracked:

- `output/affiliate-pilot/v3/manifest.json`
- `output/affiliate-pilot/v3/execution-log.json`
- `output/affiliate-pilot/v3/technical-qa.json`
- `output/affiliate-pilot/v3/visual-qa.json`
- `output/affiliate-pilot/v3/contact-sheets/pilot-all-66.jpg`
- `output/affiliate-pilot/v3/contact-sheets/comparison-v2-v3-all-30-pairs.jpg`
- six per-product final sheets;
- three original-product v2-to-v3 sheets;
- `output/affiliate-pilot/v3/rejected-first-pass/`

V1 and v2 remain preserved under their existing output directories.

## Owner decision gate

The next decision is visual:

1. approve the overall natural-photo, physics, reflection, and variety contract;
2. identify any specific final scene IDs that should be replaced;
3. decide whether solid and patterned curtains are acceptable with mandatory
   per-image textile QA;
4. keep the Yamazaki cart and similarly asymmetric rigid products blocked until
   a stronger identity-lock workflow passes a small follow-up test;
5. explicitly authorize or decline the next controlled batch.

Full-scale generation must not begin from this document alone.
