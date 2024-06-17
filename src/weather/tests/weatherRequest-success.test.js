import { describe, expect, test } from "vitest";

import { getWeather } from "../index.js";
import { setup } from "./fixture.js";
import { sunny_morning_2023_11_22 } from "./openMeteo.mocks.js";

describe("Test getWeather", () => {
  test("getWeather success", async () => {
    const { close, counter } = setup();

    expect(await getWeather("2024-01-01", {})).toStrictEqual(
      sunny_morning_2023_11_22,
    );

    expect(counter()).toBe(1);

    close();
  });
});
