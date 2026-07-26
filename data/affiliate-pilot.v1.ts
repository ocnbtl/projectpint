export const affiliatePilotV1Selections = [
  {
    asin: "B0829N8C9G",
    productRole: "reflective rigid product",
    styleSlugs: ["minimalist-elegance", "modern-marble"],
    referenceSourceUrl: "https://www.oxo.com/stainless-steel-soap-dispenser-1.html",
    referenceAssetSourceUrl:
      "https://modernquests.com/products/good-grips-stainless-steel-soap-dispenser",
    identityPrompt:
      "One OXO dispenser with a tall gently tapered brushed-stainless body, charcoal-gray rounded pump and short forward spout, clear blue-tinted reservoir band at the base, and one small oval OXO mark near the lower right of the metal body. Preserve those shapes, materials, colors, proportions, pump geometry, reservoir, and existing mark. Never add a second pump, handle, alternate finish, label, or permanent accessory.",
    rationale:
      "Tests brushed-metal fidelity, the transparent fill window, small existing branding, and reflective-edge segmentation."
  },
  {
    asin: "B0D2KK6MNS",
    productRole: "large textile",
    styleSlugs: ["boho-earth-tones", "warm-editorial"],
    referenceSourceUrl: "https://www.amazon.com/dp/B0D2KK6MNS",
    referenceAssetSourceUrl: "https://www.ebay.com/itm/147181131187",
    identityPrompt:
      "One full-length solid muted terracotta-rust shower curtain with subtle linen-like woven texture, evenly spaced silver metal hooks through reinforced top openings, soft regular vertical folds, and a plain finished bottom hem. Preserve the solid color family, weave, proportions, hook material, top construction, and unprinted surface. Never add a pattern, stripe, tassel, fringe, ombre, tieback, embroidery, extra panel, or alternate color.",
    rationale:
      "Tests terracotta color consistency, woven texture, folds, scale, and identity preservation across room-wide compositions."
  },
  {
    asin: "B0DC7VG6Z9",
    productRole: "slatted furniture with open geometry",
    styleSlugs: ["japandi", "spa-greenery"],
    referenceSourceUrl:
      "https://www.bambusi.com/products/bamboo-shower-bench-small-shower-stool-with-storage-shelf-non-slip-shower-seat-bathroom-bench-spa-decor-wooden-shower-bench-foot-rest-shaving-stool-for-shower-suitable-for-indoor-outdoor-use",
    referenceAssetSourceUrl:
      "https://www.bambusi.com/cdn/shop/files/Untitled_design_57.png?v=1752306319",
    identityPrompt:
      "One compact natural-bamboo shower bench approximately 17 inches wide by 9 inches deep by 17 inches high, with a rectangular slatted top, gently bowed front apron, lower open slatted storage shelf, four slightly splayed legs with small dark non-slip feet, open sides, and no backrest or arms. Preserve the proportions, two-tier construction, bamboo grain, slat layout, joinery, legs, feet, and open gaps. Never add a cushion, back, armrest, drawer, third shelf, metal frame, or painted finish.",
    rationale:
      "Tests bamboo color and joinery, open slats, shelf and leg geometry, wet-room placement, and one canonical product across distinct styles."
  }
] as const;

export const affiliatePilotV1Authorization = {
  referenceRightsConfirmed: true,
  generationAuthorized: true,
  fullScaleAuthorized: false,
  sourceImagesPrivateOnly: true,
  authorizedAt: "2026-07-26T18:30:00-04:00"
} as const;
