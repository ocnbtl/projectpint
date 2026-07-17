import assert from "node:assert/strict";
import test from "node:test";
import {
  getPlantRecommendations,
  type PlantHumidity,
  type PlantLight,
  type PlantSpace
} from "../lib/plant-picker.ts";

const lights: PlantLight[] = ["low", "medium", "bright"];
const humidities: PlantHumidity[] = ["dry", "normal", "steamy"];
const spaces: PlantSpace[] = ["tiny", "medium", "plenty"];

test("every Plant Picker answer combination preserves the requested difficulty sequence", () => {
  for (const light of lights) {
    for (const humidity of humidities) {
      for (const space of spaces) {
        const results = getPlantRecommendations({ light, humidity, space });
        assert.equal(results.length, 5);
        assert.deepEqual(
          results.map((plant) => plant.difficulty),
          ["Easy", "Intermediate", "Easy", "Intermediate", "Difficult"],
          `${light}/${humidity}/${space}`
        );
        assert.equal(new Set(results.map((plant) => plant.name)).size, 5);
      }
    }
  }
});

test("humidity remains the strongest Plant Picker recommendation signal", () => {
  const dry = getPlantRecommendations({ light: "bright", humidity: "dry", space: "plenty" });
  const steamy = getPlantRecommendations({ light: "bright", humidity: "steamy", space: "plenty" });

  assert.equal(dry[4].name, "Fiddle-Leaf Fig");
  assert.equal(steamy[4].name, "Maidenhair Fern");
  assert.ok(dry.slice(0, 2).every((plant) => plant.humidity.includes("dry")));
  assert.ok(steamy.slice(0, 2).every((plant) => plant.humidity.includes("steamy")));
});
