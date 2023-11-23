import { describe, expect, test } from "vitest";

import { scoreWeather } from "./index.js";

describe("Test weather", () => {
  test.todo("Check scoreWeather", () => {
    expect(
      scoreWeather({ directRadiation: 100, directNormalIrradiance: 100 }),
    ).toBe(0);
  });
});
