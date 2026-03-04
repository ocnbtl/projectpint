import { DESTINATION_INTENTS, HOOK_CLASSES, PILLARS } from "./constants.ts";
import { lintPin } from "./linter.ts";
import { buildUtmUrl } from "./utm.ts";
import type { BlogDraft, PinDraft, ProductIdea, ProductRow, UrlInventoryItem } from "./types.ts";

const baseSite = "https://projectpint.example.com";

const coreDestinationPool = [
  "/start-here",
  "/hub/plants",
  "/hub/mirror",
  "/hub/storage",
  "/hub/lighting",
  "/hub/shower",
  "/hub/renter",
  "/hub/diy",
  "/hub/extreme-budget",
  "/lead-magnets/plant-picker",
  "/products/renter-bathroom-upgrade-blueprint",
  "/products/bathroom-plant-picks-upgrade",
  "/micro/no-drill-art-layout-guide",
  "/micro/under-75-color-refresh-plan",
  "/micro/tiny-vanity-top-organization-map",
  "/micro/removable-lighting-upgrade-checklist",
  "/micro/peel-stick-backsplash-cut-plan",
  "/micro/renter-mirror-placement-map",
  "/micro/mini-bath-plant-shelf-layout",
  "/micro/under-sink-bin-label-system",
  "/micro/one-hour-bathroom-reset"
];

function destinationPool(): string[] {
  const blogUrls = seedBlogs().map((blog) => `/blog/${blog.Slug}`);
  return [...coreDestinationPool, ...blogUrls];
}

const CTA_BY_INTENT: Record<string, string[]> = {
  Inspire: ["Save this plan for later", "Click for the full setup", "Start with this quick reset"],
  Teach: ["Follow this step-by-step guide", "Use this exact checklist", "See the full instructions"],
  Solve: ["Fix this bottleneck first", "Choose your best-fit path", "Use the decision tree now"],
  Shop: ["Compare picks by budget", "View renter-safe options", "Shop the under-$150 tier"],
  Subscribe: ["Get the free plant picker", "Join weekly bathroom plans", "Send me the free guide"]
};

const PILLAR_LANGUAGE: Record<string, { pain: string; benefit: string; weekendWin: string }> = {
  RenterFriendly: {
    pain: "You want your deposit back and still want the bathroom to feel finished.",
    benefit: "You get a cleaner, calmer bathroom without permanent changes.",
    weekendWin: "Swap temporary hardware and reset high-traffic zones."
  },
  BudgetDIY: {
    pain: "You want visible change but every home project feels expensive.",
    benefit: "You get high-impact updates without blowing your monthly budget.",
    weekendWin: "Use one anchor fix plus one support layer under a hard budget cap."
  },
  SmallSpace: {
    pain: "Tiny layouts make daily routines feel cramped and frustrating.",
    benefit: "You get smoother movement and less visual stress in tight spaces.",
    weekendWin: "Re-route one clutter point and create one clear landing zone."
  },
  StorageOrganization: {
    pain: "Counters and cabinets refill with clutter within days.",
    benefit: "You save time each morning because everything has a predictable home.",
    weekendWin: "Build a simple category system that survives real daily use."
  },
  Styling: {
    pain: "You want personality without making the room feel busier.",
    benefit: "You get a bathroom that looks intentional, not expensive.",
    weekendWin: "Use one color rule and one texture layer for instant cohesion."
  },
  PlantsBiophilic: {
    pain: "Plants die quickly in low-light, humid bathrooms.",
    benefit: "You get greenery that actually survives and softens the space.",
    weekendWin: "Match plants to light + humidity constraints before styling."
  }
};

const COMPOSITION_VARIANTS = [
  "eye-level view with a clear sink zone focus",
  "slight top-down angle highlighting vanity organization",
  "wide corner composition showing full bathroom flow",
  "tight crop centered on mirror + lighting area",
  "shower-side perspective with storage context"
];

const MATERIAL_VARIANTS = [
  "matte tile and brushed metal accents",
  "warm neutral tile with clean grout lines",
  "soft green accessories with light wood textures",
  "white and clay palette with subtle contrast",
  "minimal black hardware with bright natural tones"
];

function hashtagsFor(pillar: string, hook: string): string[] {
  const base = ["#bathroomdiy", "#rentersafe", "#budgetdecor"];
  const byPillar: Record<string, string[]> = {
    RenterFriendly: ["#renterfriendly", "#nodrill", "#apartmentdecor"],
    BudgetDIY: ["#budgetdiy", "#cheapdecor", "#diyhomeprojects"],
    SmallSpace: ["#smallbathroom", "#smallspacehacks", "#tinybathroom"],
    StorageOrganization: ["#bathroomstorage", "#organizingtips", "#declutterhome"],
    Styling: ["#bathroomstyling", "#colorformula", "#maximalistdecor"],
    PlantsBiophilic: ["#bathroomplants", "#biophilicdesign", "#plantstyling"]
  };
  const byHook = `#${hook.toLowerCase()}`;
  return [...base, ...(byPillar[pillar] ?? []), byHook];
}

export function seedUrlInventory(): UrlInventoryItem[] {
  const pool = destinationPool();
  return pool.map((url, index) => ({
    URL_ID: `URL-${String(index + 1).padStart(3, "0")}`,
    URL: url,
    Type: inferUrlType(url),
    Pillar: PILLARS[index % PILLARS.length],
    Status: "published",
    Last_Posted_At: "",
    Cooldown_Hours: 24,
    Destination_Intent_Default: DESTINATION_INTENTS[index % DESTINATION_INTENTS.length],
    Priority: 100 - index
  }));
}

function inferUrlType(url: string): UrlInventoryItem["Type"] {
  if (url.startsWith("/hub/")) return "hub";
  if (url === "/start-here") return "start";
  if (url.startsWith("/lead-magnets/")) return "lead";
  if (url.startsWith("/products/")) return "product";
  if (url.startsWith("/micro/")) return "micro";
  if (url.startsWith("/blog/")) return "blog";
  return "affiliate";
}

export function seedPins(n: number, nowIso: string): PinDraft[] {
  const pool = destinationPool();
  return Array.from({ length: n }).map((_, index) => {
    const hook = HOOK_CLASSES[index % HOOK_CLASSES.length];
    const intent = DESTINATION_INTENTS[index % DESTINATION_INTENTS.length];
    const pillar = PILLARS[index % PILLARS.length];
    const contentId = `PIN-${String(index + 1).padStart(3, "0")}`;
    const ctaList = CTA_BY_INTENT[intent] ?? CTA_BY_INTENT.Inspire;
    const primaryCta = ctaList[index % ctaList.length];
    const language = PILLAR_LANGUAGE[pillar];
    const title = `${hook} for ${pillar}: renter-safe update under $${(index % 4) * 75 + 75}`;
    const captions = [
      `${language.pain} This ${hook} plan stays under $${(index % 4) * 75 + 75}.`,
      `${language.benefit} ${language.weekendWin}`,
      `${primaryCta}.`
    ];
    const hashtagSet = hashtagsFor(pillar, hook);
    const descriptionWithHashtags = `${captions[0]} ${captions[1]} ${captions[2]} ${hashtagSet.join(" ")}`;
    const composition = COMPOSITION_VARIANTS[index % COMPOSITION_VARIANTS.length];
    const material = MATERIAL_VARIANTS[index % MATERIAL_VARIANTS.length];
    const prompt = [
      "Create a photorealistic vertical 2:3 Pinterest image for a bathroom DIY post.",
      `Variant ID: ${contentId}.`,
      `Style focus: ${pillar}. Hook style: ${hook}. Intent: ${intent}.`,
      `Scene direction: ${composition}, ${material}.`,
      `Story cue: ${language.weekendWin}`,
      "No people, no faces, no logos, no watermarks, no on-image text.",
      "Leave clear safe space at top and bottom for text overlays."
    ].join(" ");

    const lint = lintPin(
      {
        Title: title,
        Caption_1: captions[0],
        Caption_2: captions[1],
        Caption_3: captions[2],
        Overlay_1: `${hook} under $${(index % 4) * 75 + 75}`,
        Overlay_2: `Renter-safe path`,
        Has_Text_Overlay: true,
        Image_Prompt: prompt
      },
      true,
      true
    );

    return {
      Content_ID: contentId,
      Created_At: nowIso,
      Status: "draft",
      Hook_Class: hook,
      Destination_Intent: intent,
      Pillar: pillar,
      Topic: `${pillar.toLowerCase()}-${hook.toLowerCase()}-${index + 1}`,
      Destination_URL: pool[index % pool.length],
      Title: title,
      Caption_1: captions[0],
      Caption_2: captions[1],
      Caption_3: captions[2],
      Description_With_Hashtags: descriptionWithHashtags,
      Overlay_1: `${hook} under $${(index % 4) * 75 + 75}`,
      Overlay_2: `Renter-safe path`,
      Has_Text_Overlay: true,
      Primary_CTA: primaryCta,
      Visual_Preset: index % 2 === 0 ? "tiny_bathroom_scene_v1" : "bathroom_flatlay_v1",
      Image_Prompt: prompt,
      UTM_URL: buildUtmUrl({
        destinationUrl: `${baseSite}${pool[index % pool.length]}`,
        contentId,
        hookClass: hook,
        intent
      }),
      Quality_Score: lint.Quality_Score,
      Quality_Flags: lint.Quality_Flags,
      AutoFixSuggestions: lint.AutoFixSuggestions,
      Hook_Class_Uniqueness_Flag: lint.Hook_Class_Uniqueness_Flag,
      Intent_Balance_Flag: lint.Intent_Balance_Flag,
      Visual_Risk_Flags: lint.Visual_Risk_Flags,
      Naturalness_Flag: lint.Naturalness_Flag,
      Human_Approved: false,
      Scheduled_At: "",
      Posted_At: ""
    };
  });
}

export function seedBlogs(): BlogDraft[] {
  const drafts: Array<Pick<BlogDraft, "Slug" | "Title" | "Pillar" | "Keyword_Target">> = [
    {
      Slug: "no-drill-bathroom-upgrades-under-150",
      Title: "No-Drill Bathroom Upgrades Under $150 (Renter-Safe)",
      Pillar: "RenterFriendly",
      Keyword_Target: "no drill bathroom upgrades renters"
    },
    {
      Slug: "small-bathroom-storage-zones",
      Title: "Small Bathroom Storage Zones That Cut Daily Clutter",
      Pillar: "StorageOrganization",
      Keyword_Target: "small bathroom storage ideas renters"
    },
    {
      Slug: "bathroom-plants-low-light-humidity",
      Title: "Bathroom Plants for Low Light + Humidity: Practical Picks",
      Pillar: "PlantsBiophilic",
      Keyword_Target: "bathroom plants low light humidity"
    }
  ];

  const buildDraft = (title: string, pillar: string) => {
    const language = PILLAR_LANGUAGE[pillar] ?? PILLAR_LANGUAGE.BudgetDIY;
    return `# ${title}

If you have ever looked at your bathroom and thought \"I just want this to feel easier and less chaotic,\" this is for you. ${language.pain}

## The Real Problem (And Why Most Makeovers Fail)
Most budget bathroom makeovers fail because they start with random decor purchases instead of one clear routine problem. If the counter still gets crowded and the morning flow still feels rushed, the space still feels \"unfinished\" no matter how pretty it looks.

The better approach is simple:
- solve one daily friction point first
- keep the upgrade renter-safe when needed
- add style only after function is stable

That is how you get improvement you can feel every day, not just in photos.

## Weekend Plan: 5 Moves That Actually Help
### 1) Pick one pain point, not five
Choose one: towel chaos, vanity clutter, weak mirror lighting, or no storage for daily items.

### 2) Lock your constraints before shopping
- Budget tier: under $75 / $150 / $300
- Install mode: no-drill or drill-allowed
- Time window: one realistic session

### 3) Do one anchor fix
Anchor fixes are the upgrades that make the room easier to use immediately. Think shelf placement, vertical storage, or better task lighting.

### 4) Add one support layer
Support layers keep results from slipping after three days. Good examples: labeled categories, moisture-safe bins, or a strict \"one in / one out\" counter rule.

### 5) Run a 7-day check
Ask: Did this save time? Did it reduce visual noise? Was upkeep easy?

## What You Gain (Benefit-First)
- Faster mornings because essentials have a stable place
- A room that looks calmer with less effort
- Fewer random purchases because decisions are constraint-based
- Better confidence before spending on bigger upgrades

## Mini Budget Examples
### Under $75
- one anchor fix + one support layer
- best for renters testing a reversible setup

### Under $150
- two coordinated fixes that improve flow + look
- best for small spaces with high daily traffic

### Under $300
- full zone reset with stronger styling consistency
- best when function is already partially working

## Common Mistakes To Avoid
- Buying before measuring clearance and wall type
- Choosing style items that increase cleaning workload
- Skipping adhesive prep/cure time in humid rooms
- Changing too many variables at once

## If You Want To Keep Going
Start with \`/start-here\` if you want a path by budget and install mode. If plants are part of your plan, \`/lead-magnets/plant-picker\` is a good next step.

For people who prefer a done-for-you worksheet system, the Renter Bathroom Upgrade Blueprint is available as an optional deeper resource.
`;
  };

  return drafts.map((item, i) => ({
    Blog_ID: `BLOG-${String(i + 1).padStart(3, "0")}`,
    Slug: item.Slug,
    Title: item.Title,
    Pillar: item.Pillar,
    Keyword_Target: item.Keyword_Target,
    Outline: "Problem framing -> quick constraints check -> step-by-step plan -> budget table -> CTA",
    Draft_Markdown: buildDraft(item.Title, item.Pillar),
    Internal_Links: "/start-here, /lead-magnets/plant-picker, /products/renter-bathroom-upgrade-blueprint",
    CTA_Block: "Subscribe for weekly renter-safe bathroom plans.",
    Status: "draft",
    Human_Approved: false,
    Published_At: "",
    Ad_Enabled: true,
    Contains_Affiliate_Links: false,
    Affiliate_Disclosure_Required: false
  }));
}

export function seedProducts(nowIso: string): ProductRow[] {
  return [
    {
      Product_ID: "PROD-001",
      Name: "Renter Bathroom Upgrade Blueprint",
      Type: "paid",
      Status: "approved",
      Price_USD: "29",
      Segment: "renter,budget,small_space",
      Problem_Solved: "Choose-path system for no-drill/drill-allowed upgrades by budget tier and style",
      Landing_URL: "/products/renter-bathroom-upgrade-blueprint",
      Email_Flow_Status: "draft",
      Supporting_Content_Status: "planned",
      Last_Updated: nowIso
    },
    {
      Product_ID: "PROD-002",
      Name: "Bathroom Plant Picks (Free Lead Magnet)",
      Type: "lead_magnet",
      Status: "approved",
      Price_USD: "0",
      Segment: "plants,small_space,renter",
      Problem_Solved: "Constraint-based plant matches + placement guidance",
      Landing_URL: "/lead-magnets/plant-picker",
      Email_Flow_Status: "draft",
      Supporting_Content_Status: "planned",
      Last_Updated: nowIso
    },
    {
      Product_ID: "PROD-003",
      Name: "Bathroom Plant Picks Expanded Guide",
      Type: "upgrade",
      Status: "approved",
      Price_USD: "19",
      Segment: "plants,small_space,renter",
      Problem_Solved: "Expanded decision trees, placement maps, care cheat sheets",
      Landing_URL: "/products/bathroom-plant-picks-upgrade",
      Email_Flow_Status: "draft",
      Supporting_Content_Status: "planned",
      Last_Updated: nowIso
    }
  ];
}

export function seedProductIdeas(month: string): ProductIdea[] {
  return [
    {
      Idea_ID: "IDEA-001",
      Month: month,
      Name: "7-Day Bathroom Reset Challenge Kit",
      Segment: "renter,budget",
      Evidence: "Pinned for later backlog concept",
      Differentiation: "Daily checklist + planner + printable reset map",
      MVP_Scope: "1-week email flow + printable workbook",
      Pricing_Hypothesis: "$12",
      Upsell_Path: "Renter Bathroom Upgrade Blueprint",
      Recommended: "no",
      Human_Approved: false
    },
    {
      Idea_ID: "IDEA-002",
      Month: month,
      Name: "Peel & Stick Bathroom Master Guide",
      Segment: "renter,styling",
      Evidence: "Backlog concept",
      Differentiation: "Material chooser + cut templates + cleaning prep matrix",
      MVP_Scope: "Guide PDF + decision chart",
      Pricing_Hypothesis: "$17",
      Upsell_Path: "Blueprint",
      Recommended: "no",
      Human_Approved: false
    },
    {
      Idea_ID: "IDEA-003",
      Month: month,
      Name: "Budget Maximalist Bathroom Pack",
      Segment: "styling,budget",
      Evidence: "Backlog concept",
      Differentiation: "Palette recipes + accessory map + anti-clutter guardrails",
      MVP_Scope: "Template pack + examples",
      Pricing_Hypothesis: "$21",
      Upsell_Path: "Plant Picks Upgrade",
      Recommended: "no",
      Human_Approved: false
    },
    {
      Idea_ID: "IDEA-004",
      Month: month,
      Name: "Seasonal Bathroom Refresh Bundles",
      Segment: "styling,plants",
      Evidence: "Backlog concept",
      Differentiation: "Seasonal swap checklist + humidity-safe decor picks",
      MVP_Scope: "Quarterly bundle templates",
      Pricing_Hypothesis: "$15",
      Upsell_Path: "Blueprint",
      Recommended: "no",
      Human_Approved: false
    }
  ];
}
