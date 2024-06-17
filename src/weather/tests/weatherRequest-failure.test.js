import { describe, expect, test } from "vitest";

import { getWeather } from "../index.js";
import { setup } from "./fixture.js";

describe("Test getWeather", () => {
  test(
    "getWeather failure - retries request",
    async () => {
      const { close, counter } = setup();

      await expect(
        getWeather("2024-01-01", { latitude: "fail" }),
      ).rejects.toThrow("Get weather failed due to network error.");

      expect(counter()).toBe(4);

      close();
    },
    { timeout: 10000 },
  );
});
