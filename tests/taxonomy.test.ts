import assert from "node:assert/strict";
import test from "node:test";
import { contentAreasForPillar, normalizeContentAreas, primaryLegacyPillarForArea } from "../lib/constants.ts";
import { blogMatchesArea, contentAreaForBlog } from "../lib/site-data.ts";

test("legacy BudgetDIY pillar expands to both budget areas", () => {
  assert.deepEqual(contentAreasForPillar("BudgetDIY"), ["DIY", "ExtremeBudget"]);
  assert.equal(primaryLegacyPillarForArea("ExtremeBudget"), "BudgetDIY");
});

test("normalizeContentAreas accepts mixed current and legacy taxonomy values", () => {
  assert.deepEqual(normalizeContentAreas(["Plants", "PlantsBiophilic", "extreme-budget", "BudgetDIY"]), [
    "Plants",
    "ExtremeBudget",
    "DIY"
  ]);
});

test("contentAreaForBlog prefers keyword-matched area over shared legacy pillar fallback", () => {
  const blog = {
    Pillar: "Styling",
    Slug: "bathroom-mirror-placement-fixes",
    Title: "Bathroom Mirror Placement Fixes",
    Keyword_Target: "bathroom mirror placement vanity"
  };

  assert.equal(contentAreaForBlog(blog), "Mirror");
  assert.equal(blogMatchesArea(blog, "Mirror"), true);
  assert.equal(blogMatchesArea(blog, "Lighting"), false);
});

test("blogMatchesArea keeps shared legacy bridge when no specific area keyword exists", () => {
  const blog = {
    Pillar: "Styling",
    Slug: "intentional-bathroom-refresh",
    Title: "Intentional Bathroom Refresh",
    Keyword_Target: "bathroom refresh ideas"
  };

  assert.equal(contentAreaForBlog(blog), "Mirror");
  assert.equal(blogMatchesArea(blog, "Mirror"), true);
  assert.equal(blogMatchesArea(blog, "Lighting"), true);
});
