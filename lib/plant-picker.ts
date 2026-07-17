export type PlantDifficulty = "Easy" | "Intermediate" | "Difficult";
export type PlantLight = "low" | "medium" | "bright";
export type PlantHumidity = "dry" | "normal" | "steamy";
export type PlantSpace = "tiny" | "medium" | "plenty";

export type PlantResult = {
  name: string;
  scientific: string;
  light: string;
  lightPreferences: readonly PlantLight[];
  humidity: readonly PlantHumidity[];
  water: string;
  placement: string;
  spacePreferences: readonly PlantSpace[];
  difficulty: PlantDifficulty;
  note: string;
  image: string;
};

export type PlantPickerAnswers = {
  light: PlantLight;
  humidity: PlantHumidity;
  space: PlantSpace;
};

export const bathroomPlants: PlantResult[] = [
  {
    name: "Pothos",
    scientific: "Epipremnum aureum",
    light: "Low to bright indirect",
    lightPreferences: ["low", "medium", "bright"],
    humidity: ["dry", "normal", "steamy"],
    water: "Weekly",
    placement: "Shelf, hanging planter, windowsill",
    spacePreferences: ["tiny", "medium", "plenty"],
    difficulty: "Easy",
    note: "Trails from shelves, handles humidity, and forgives imperfect watering.",
    image:
      "https://images.unsplash.com/photo-1773431456773-50853cea57cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    name: "Snake Plant",
    scientific: "Dracaena trifasciata",
    light: "Low to bright indirect",
    lightPreferences: ["low", "medium", "bright"],
    humidity: ["dry", "normal"],
    water: "Every 2 to 3 weeks",
    placement: "Floor corner, counter, windowsill",
    spacePreferences: ["tiny", "medium", "plenty"],
    difficulty: "Easy",
    note: "Architectural, durable, and easy to place beside a vanity or toilet.",
    image:
      "https://images.unsplash.com/photo-1613498630970-f2a333cb4974?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    name: "ZZ Plant",
    scientific: "Zamioculcas zamiifolia",
    light: "Low to medium indirect",
    lightPreferences: ["low", "medium"],
    humidity: ["dry", "normal"],
    water: "Every 2 to 3 weeks",
    placement: "Floor, counter, shelf",
    spacePreferences: ["tiny", "medium", "plenty"],
    difficulty: "Easy",
    note: "Slow growing, glossy, and tolerant of dry spells between watering.",
    image:
      "https://images.unsplash.com/photo-1555758826-ce21b7e51ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    name: "Peace Lily",
    scientific: "Spathiphyllum",
    light: "Low to medium indirect",
    lightPreferences: ["low", "medium"],
    humidity: ["dry", "normal", "steamy"],
    water: "About weekly",
    placement: "Counter, floor, shelf",
    spacePreferences: ["tiny", "medium", "plenty"],
    difficulty: "Intermediate",
    note: "Rewards consistent moisture with soft leaves and occasional white blooms.",
    image:
      "https://images.unsplash.com/photo-1567465645848-b765281eca3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    name: "Boston Fern",
    scientific: "Nephrolepis exaltata",
    light: "Medium to bright indirect",
    lightPreferences: ["medium", "bright"],
    humidity: ["normal", "steamy"],
    water: "Keep evenly moist",
    placement: "Hanging planter, high shelf, shower area",
    spacePreferences: ["medium", "plenty"],
    difficulty: "Intermediate",
    note: "Best near a shower or window where steam keeps the fronds lush.",
    image:
      "https://images.unsplash.com/photo-1704869727879-25ed3c235e7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    name: "Maidenhair Fern",
    scientific: "Adiantum raddianum",
    light: "Medium to bright indirect",
    lightPreferences: ["medium", "bright"],
    humidity: ["normal", "steamy"],
    water: "Keep consistently moist",
    placement: "Counter, shelf, near a frosted window",
    spacePreferences: ["tiny", "medium"],
    difficulty: "Difficult",
    note: "Beautiful in humid rooms, but it needs steady moisture and gentle indirect light.",
    image: "/images/plants/maidenhair-fern.jpg"
  },
  {
    name: "Fiddle-Leaf Fig",
    scientific: "Ficus lyrata",
    light: "Bright indirect",
    lightPreferences: ["bright"],
    humidity: ["dry", "normal"],
    water: "When the top soil dries",
    placement: "Bright floor corner with airflow",
    spacePreferences: ["plenty"],
    difficulty: "Difficult",
    note: "A statement plant for a bright, ventilated bathroom with room to grow.",
    image: "/images/plants/fiddle-leaf-fig.jpg"
  }
];

function scorePlant(plant: PlantResult, answers: PlantPickerAnswers): number {
  let score = 0;
  if (plant.humidity.includes(answers.humidity)) score += 100;
  if (plant.lightPreferences.includes(answers.light)) score += 35;
  if (plant.spacePreferences.includes(answers.space)) score += 20;
  return score;
}

function rankedTier(difficulty: PlantDifficulty, answers: PlantPickerAnswers): PlantResult[] {
  return bathroomPlants
    .map((plant, index) => ({ plant, index, score: scorePlant(plant, answers) }))
    .filter(({ plant }) => plant.difficulty === difficulty)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ plant }) => plant);
}

export function getPlantRecommendations(answers: PlantPickerAnswers): PlantResult[] {
  const easy = rankedTier("Easy", answers);
  const intermediate = rankedTier("Intermediate", answers);
  const difficult = rankedTier("Difficult", answers);

  return [easy[0], intermediate[0], easy[1], intermediate[1], difficult[0]].filter(
    (plant): plant is PlantResult => Boolean(plant)
  );
}
