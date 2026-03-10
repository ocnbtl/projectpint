import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBlogDraftContent,
  buildGuideDraftContent,
  generateBlogDraftForRow,
  generateGuideDraftForRow
} from "../lib/command-center.ts";
import { COMMAND_CENTER_CONTENT_AREAS } from "../lib/constants.ts";
import { lintEditorialStyle } from "../lib/style-linter.ts";
import { buildBlogPromptPack, buildGuidePromptPack } from "../lib/writer-prompts.ts";

test("blog draft content includes concrete operational constraints for every area", () => {
  for (const area of COMMAND_CENTER_CONTENT_AREAS) {
    const content = buildBlogDraftContent(area);

    assert.match(content, /Budget range:/);
    assert.match(content, /Install note:/);
    assert.match(content, /Time and tools:/);
    assert.match(content, /Tradeoff:/);
    assert.match(content, /save time|less clutter|calmer|reduce stress|daily routine/i);

    const lint = lintEditorialStyle(`BLOG-${area}`, "blog", content);
    assert.ok(!lint.flags.some((flag) => flag.startsWith("hard_sell_language")));
    assert.ok(!lint.flags.includes("benefit_framing_weak"));
  }
});

test("guide draft content keeps the quick win structure and constraint framing", () => {
  for (const area of COMMAND_CENTER_CONTENT_AREAS) {
    const content = buildGuideDraftContent(area);

    assert.match(content, /Budget range:/);
    assert.match(content, /Install note:/);
    assert.match(content, /Time and tools:/);
    assert.match(content, /Tradeoff:/);
    assert.match(content, /45 to 90 minute plan/i);
    assert.match(content, /more functional|easier to maintain|easier to clean|saved time|calmer/i);

    const lint = lintEditorialStyle(`GUIDE-${area}`, "micro", content);
    assert.ok(!lint.flags.some((flag) => flag.startsWith("hard_sell_language")));
    assert.ok(!lint.flags.includes("benefit_framing_weak"));
  }
});

test("blog prompt pack is ready for manual ChatGPT drafting", () => {
  const prompt = buildBlogPromptPack({
    area: "Renter",
    title: "No Drill Bathroom Fixes That Still Feel Intentional",
    topicAngle: "No drill bathroom fixes that improve flow in a rental sink zone",
    postType: "task_based",
    targetReader: "Budget first renter with a small bathroom",
    primaryKeyword: "no drill bathroom ideas",
    secondaryKeywords: ["renter bathroom upgrades", "small bathroom rental", "removable bathroom storage"],
    mainConstraint: "The sink zone feels crowded but the lease does not allow drilling.",
    desiredOutcome: "The reader should finish one renter safe upgrade today.",
    ctaUrl: "/products/renter-bathroom-upgrade-blueprint",
    ctaLabel: "Preview the renter blueprint",
    existingTitles: ["Deposit Safe Bathroom Changes That Still Look Good"],
    existingKeywords: ["no drill renter bathroom"],
    recentAngles: ["bathroom storage with adhesive hooks"]
  });

  assert.match(prompt, /Paste this full prompt into ChatGPT/);
  assert.match(prompt, /Working title: No Drill Bathroom Fixes That Still Feel Intentional/);
  assert.match(prompt, /Return only the final blog post in Markdown/);
  assert.match(prompt, /Use \[Preview the renter blueprint\]\(\/products\/renter-bathroom-upgrade-blueprint\) only if it fits naturally/);
  assert.doesNotMatch(prompt, /Return strict JSON only/);
});

test("guide prompt pack is ready for manual ChatGPT drafting", () => {
  const prompt = buildGuidePromptPack({
    area: "Plants",
    title: "Quick Bathroom Plant Placement Guide for Humid Spaces",
    topicAngle: "A fast placement guide for one shelf near the shower",
    postType: "topic_based",
    targetReader: "Budget first renter with a humid bathroom",
    primaryKeyword: "bathroom plant placement",
    secondaryKeywords: ["humid bathroom plants", "low light bathroom shelf", "plant care bathroom"],
    mainConstraint: "The bathroom is humid but the light is inconsistent.",
    desiredOutcome: "The reader should place one plant better in one sitting.",
    ctaUrl: "/products/bathroom-plant-picks-upgrade",
    ctaLabel: "See the plant picks upgrade",
    existingTitles: ["Low Light Bathroom Plant Reset in Under One Hour"],
    existingKeywords: ["bathroom shelf plant"],
    linkedBlogTitle: "Low Light Bathroom Plants That Handle Humidity Without Fuss",
    linkedBlogUrl: "/blog/low-light-bathroom-plants",
    linkedBlogSummary: "A renter aware guide to plant choice and placement in humid bathrooms."
  });

  assert.match(prompt, /Paste this full prompt into ChatGPT/);
  assert.match(prompt, /Parent blog title: Low Light Bathroom Plants That Handle Humidity Without Fuss/);
  assert.match(prompt, /Return only the final guide in Markdown/);
  assert.match(prompt, /Use \[See the plant picks upgrade\]\(\/products\/bathroom-plant-picks-upgrade\) only if it fits naturally/);
  assert.doesNotMatch(prompt, /Return strict JSON only/);
});

test("blog row prompt scaffolding is present even before a manual title is added", async () => {
  const row = await generateBlogDraftForRow(
    {
      Blog_ID: "BLOG_9001",
      Blog_Publish_Date: "03/09/2026",
      Blog_Publish_Time: "09:00",
      Content_Area: "Shower",
      Workflow_Status: "draft",
      Blog_URL: "",
      Blog_Title: "",
      Blog_Keywords: "",
      Blog_Content: "",
      Writer_Brief: "",
      CTA_Target: "",
      Quality_Score: "",
      Quality_Checks: "",
      Related_Pins: "",
      Published_To_Public_At: ""
    },
    []
  );

  assert.match(row.Writer_Brief, /Prompt pack:/);
  assert.match(row.Writer_Brief, /Add your exact Shower blog title in Blog_Title/);
  assert.match(row.Quality_Checks, /Add your manual topic in Blog_Title/);
});

test("guide row prompt scaffolding follows the manual title workflow", async () => {
  const row = await generateGuideDraftForRow(
    {
      Guide_ID: "GUIDE_9001",
      Guide_Publish_Date: "03/09/2026",
      Guide_Publish_Time: "10:00",
      Content_Area: "Plants",
      Workflow_Status: "draft",
      Blog_ID: "BLOG_0001",
      Guide_URL: "",
      Guide_Title: "Bathroom plant shelf spacing for humid corners",
      Guide_Keywords: "",
      Guide_Content: "",
      Writer_Brief: "",
      CTA_Target: "",
      Quality_Score: "",
      Quality_Checks: "",
      Related_Pins: "",
      Published_To_Public_At: ""
    },
    [],
    [
      {
        Blog_ID: "BLOG_0001",
        Blog_Publish_Date: "03/09/2026",
        Blog_Publish_Time: "08:00",
        Content_Area: "Plants",
        Workflow_Status: "draft",
        Blog_URL: "/blog/humid-bathroom-plants",
        Blog_Title: "Low light bathroom plants that handle humidity without fuss",
        Blog_Keywords: "",
        Blog_Content: "Helpful parent context.",
        Writer_Brief: "",
        CTA_Target: "",
        Quality_Score: "",
        Quality_Checks: "",
        Related_Pins: "",
        Published_To_Public_At: ""
      }
    ]
  );

  assert.match(row.Writer_Brief, /Working guide title: Bathroom plant shelf spacing for humid corners/);
  assert.match(row.Writer_Brief, /Parent blog title: Low light bathroom plants that handle humidity without fuss/);
  assert.match(row.Quality_Checks, /paste the ChatGPT output into Guide_Content/);
});
