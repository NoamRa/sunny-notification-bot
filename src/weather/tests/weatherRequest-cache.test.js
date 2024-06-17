import { beforeEach, describe, expect, test, vi } from "vitest";

import { getWeather } from "../index.js";
import { setup } from "./fixture.js";

describe("Test getWeather", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test("subsequent requests are cached", async () => {
    const { close, counter } = setup();

    await getWeather("2024-01-01", {});
    expect(counter()).toBe(1);

    await getWeather("2024-01-01", {});
    expect(counter()).toBe(1);

    vi.advanceTimersByTime(60_000); // 1 minute
    await getWeather("2024-01-01", {});
    expect(counter()).toBe(1);

    vi.advanceTimersByTime(60_000); // 2 minutes
    await getWeather("2024-01-01", {});
    expect(counter()).toBe(1);

    vi.advanceTimersByTime(120_000); // 4 minutes
    await getWeather("2024-01-01", {});
    expect(counter()).toBe(1);

    vi.advanceTimersByTime(60_000); // 5 minutes
    await getWeather("2024-01-01", {});
    expect(counter()).toBe(2);

    close();
  });
});
