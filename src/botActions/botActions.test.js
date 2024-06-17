import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { lines } from "../utils/index.js";

import {
  forecastMessage,
  hourlyScheduleMessage,
  morningScheduleMessage,
} from "./botActions.js";

import {
  day_without_sun_2023_11_25,
  sunny_morning_2023_11_13,
  sunny_morning_2023_11_22,
  very_sunny_day_2023_11_26,
  sunny_afternoon_2023_11_28,
} from "../weather/tests/openMeteo.mocks.js";

import * as WeatherModule from "../weather/weather.js";

describe("Test bot actions (integration tests)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("Test forecastMessage", () => {
    test.each([
      [
        {
          date: day_without_sun_2023_11_25.daily.time[0],
          mockData: day_without_sun_2023_11_25,
          expected:
            "The sun is not expected to make a meaningful appearance today.",
        },
      ],
      [
        {
          date: "2023-11-29",
          mockData: day_without_sun_2023_11_25,
          payload: 1,
          expected:
            "The sun is not expected to make a meaningful appearance on 2023-11-30.",
        },
      ],
      [
        {
          date: sunny_morning_2023_11_13.daily.time[0],
          mockData: sunny_morning_2023_11_13,
          expected: lines(
            "2023-11-13 - Expect sunny times at:",
            "10:15 -> 11:00",
            "12:00 -> 12:15",
            "13:15 -> 13:45",
          ),
        },
      ],
      [
        {
          date: sunny_morning_2023_11_22.daily.time[0],
          mockData: sunny_morning_2023_11_22,
          expected: lines(
            "2023-11-22 - Expect sunny times at:",
            "09:45 -> 12:45",
          ),
        },
      ],
      [
        {
          date: very_sunny_day_2023_11_26.daily.time[0],
          mockData: very_sunny_day_2023_11_26,
          expected: lines(
            "2023-11-26 - Expect sunny times at:",
            "10:00 -> 13:45",
          ),
        },
      ],
      [
        {
          date: sunny_afternoon_2023_11_28.daily.time[0],
          mockData: sunny_afternoon_2023_11_28,
          expected: lines(
            "2023-11-28 - Expect sunny times at:",
            "13:15 -> 13:30",
          ),
        },
      ],
    ])(
      "%#) forecastMessage for $date",
      async ({ date, mockData, payload, expected }) => {
        vi.setSystemTime(new Date(date));
        vi.spyOn(WeatherModule, "getWeather").mockResolvedValue(mockData);
        expect(await forecastMessage(payload)).toEqual(expected);
      },
    );
  });

  describe("Test hourlyScheduleMessage", () => {
    test.each([
      // #region 2023-11-13
      [
        {
          mockNowTime: "2023-11-13T07:55",
          mockData: sunny_morning_2023_11_13,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-13T08:55",
          mockData: sunny_morning_2023_11_13,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-13T09:55",
          mockData: sunny_morning_2023_11_13,
          expected: "Expecting sunshine within the hour: 10:15 -> 11:00",
        },
      ],
      [
        {
          mockNowTime: "2023-11-13T10:55",
          mockData: sunny_morning_2023_11_13,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-13T11:55",
          mockData: sunny_morning_2023_11_13,
          expected: "Expecting sunshine within the hour: 12:00 -> 12:15",
        },
      ],
      [
        {
          mockNowTime: "2023-11-13T12:55",
          mockData: sunny_morning_2023_11_13,
          expected: "Expecting sunshine within the hour: 13:15 -> 13:45",
        },
      ],
      [
        {
          mockNowTime: "2023-11-13T13:55",
          mockData: sunny_morning_2023_11_13,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-13T14:55",
          mockData: sunny_morning_2023_11_13,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-13T15:55",
          mockData: sunny_morning_2023_11_13,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-13T16:55",
          mockData: sunny_morning_2023_11_13,
          expected: "",
        },
      ],
      // #endregion
      // #region 2023-11-26
      [
        {
          mockNowTime: "2023-11-26T07:55",
          mockData: very_sunny_day_2023_11_26,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-26T08:55",
          mockData: very_sunny_day_2023_11_26,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-26T09:55",
          mockData: very_sunny_day_2023_11_26,
          expected: "Expecting sunshine within the hour: 10:00 -> 13:45",
        },
      ],
      [
        {
          mockNowTime: "2023-11-26T10:55",
          mockData: very_sunny_day_2023_11_26,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-26T11:55",
          mockData: very_sunny_day_2023_11_26,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-26T12:55",
          mockData: very_sunny_day_2023_11_26,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-26T13:55",
          mockData: very_sunny_day_2023_11_26,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-26T14:55",
          mockData: very_sunny_day_2023_11_26,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-26T15:55",
          mockData: very_sunny_day_2023_11_26,
          expected: "",
        },
      ],
      [
        {
          mockNowTime: "2023-11-26T16:55",
          mockData: very_sunny_day_2023_11_26,
          expected: "",
        },
      ],
      // #endregion
    ])(
      "%#) morning schedule message $mockNowTime",
      async ({ mockNowTime, mockData, expected }) => {
        vi.setSystemTime(new Date(mockNowTime));
        vi.spyOn(WeatherModule, "getWeather").mockResolvedValue(mockData);

        expect(await hourlyScheduleMessage()).toEqual(expected);
      },
    );
  });

  describe("Test morningScheduleMessage", () => {
    test.each([
      [
        {
          date: day_without_sun_2023_11_25.daily.time[0],
          mockData: day_without_sun_2023_11_25,
          expected:
            "the sun is not expected to make a meaningful appearance today",
        },
      ],
      [
        {
          date: sunny_morning_2023_11_13.daily.time[0],
          mockData: sunny_morning_2023_11_13,
          expected: lines(
            "expect sunny times at:",
            "10:15 -> 11:00",
            "12:00 -> 12:15",
          ),
        },
      ],
      [
        {
          date: sunny_morning_2023_11_22.daily.time[0],
          mockData: sunny_morning_2023_11_22,
          expected: lines("expect sunny times at:", "09:45 -> 12:45"),
        },
      ],
      [
        {
          date: very_sunny_day_2023_11_26.daily.time[0],
          mockData: very_sunny_day_2023_11_26,
          expected: lines("expect sunny times at:", "10:00 -> 13:45"),
        },
      ],
      [
        {
          date: sunny_afternoon_2023_11_28.daily.time[0],
          mockData: sunny_afternoon_2023_11_28,
          expected: lines("expect sunny times at:", "13:15 -> 13:30"),
        },
      ],
    ])(
      "%#) morning schedule message for $date",
      async ({ mockData, expected }) => {
        vi.spyOn(WeatherModule, "getWeather").mockResolvedValue(mockData);
        const message = await morningScheduleMessage();

        expect(message).toContain("Good morning,");
        expect(message).toContain(expected);
      },
    );
  });
});
