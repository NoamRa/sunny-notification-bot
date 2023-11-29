import { describe, expect, test } from "vitest";

import { getSunnyRanges } from "./index.js";
import {
  day_without_sun_2023_11_25,
  sunny_morning_2023_11_13,
  sunny_morning_2023_11_22,
  very_sunny_day_2023_11_26,
  sunny_afternoon_2023_11_28,
} from "./openMeteo.mocks.js";

describe("Test weather", () => {
  describe("getSunnyRanges tests", () => {
    test.each([
      [
        {
          date: day_without_sun_2023_11_25.daily.time[0],
          data: day_without_sun_2023_11_25,
          expected: [],
        },
      ],
      [
        {
          date: sunny_morning_2023_11_13.daily.time[0],
          data: sunny_morning_2023_11_13,
          expected: [
            {
              length: 4,
              start: {
                datetime: "2023-11-13T10:15",
                date: "2023-11-13",
                time: "10:15",
                cloudCover: 68,
                weatherCode: 3,
                directRadiation: 147.2,
                directNormalIrradiance: 517.6,
                weatherDescription: "Cloudy",
                score: 1,
                isSunny: true,
              },
              end: {
                datetime: "2023-11-13T11:00",
                date: "2023-11-13",
                time: "11:00",
                cloudCover: 100,
                weatherCode: 3,
                directRadiation: 150.2,
                directNormalIrradiance: 469.2,
                weatherDescription: "Cloudy",
                score: 1,
                isSunny: true,
              },
            },
            {
              length: 2,
              start: {
                datetime: "2023-11-13T12:00",
                date: "2023-11-13",
                time: "12:00",
                cloudCover: 100,
                weatherCode: 3,
                directRadiation: 121.9,
                directNormalIrradiance: 365.2,
                weatherDescription: "Cloudy",
                score: 0.6981229714285714,
                isSunny: true,
              },
              end: {
                datetime: "2023-11-13T12:15",
                date: "2023-11-13",
                time: "12:15",
                cloudCover: 100,
                weatherCode: 3,
                directRadiation: 114.5,
                directNormalIrradiance: 345.8,
                weatherDescription: "Cloudy",
                score: 0.6051222857142857,
                isSunny: true,
              },
            },
            {
              length: 3,
              start: {
                datetime: "2023-11-13T13:15",
                date: "2023-11-13",
                time: "13:15",
                cloudCover: 50,
                weatherCode: 3,
                directRadiation: 168.4,
                directNormalIrradiance: 569.5,
                weatherDescription: "Cloudy",
                score: 1,
                isSunny: true,
              },
              end: {
                datetime: "2023-11-13T13:45",
                date: "2023-11-13",
                time: "13:45",
                cloudCover: 50,
                weatherCode: 3,
                directRadiation: 147.2,
                directNormalIrradiance: 557.7,
                weatherDescription: "Cloudy",
                score: 1,
                isSunny: true,
              },
            },
          ],
        },
      ],
      [
        {
          date: sunny_morning_2023_11_22.daily.time[0],
          data: sunny_morning_2023_11_22,
          expected: [
            {
              length: 13,
              start: {
                datetime: "2023-11-22T09:45",
                date: "2023-11-22",
                time: "09:45",
                cloudCover: 4,
                weatherCode: 0,
                directRadiation: 105.1,
                directNormalIrradiance: 495.3,
                weatherDescription: "Sunny",
                score: 0.8152806857142856,
                isSunny: true,
              },
              end: {
                datetime: "2023-11-22T12:45",
                date: "2023-11-22",
                time: "12:45",
                cloudCover: 29,
                weatherCode: 1,
                directRadiation: 175.6,
                directNormalIrradiance: 619,
                weatherDescription: "Mainly Sunny",
                score: 1,
                isSunny: true,
              },
            },
          ],
        },
      ],
      [
        {
          date: very_sunny_day_2023_11_26.daily.time[0],
          data: very_sunny_day_2023_11_26,
          expected: [
            {
              end: {
                cloudCover: 44,
                date: "2023-11-26",
                datetime: "2023-11-26T13:45",
                directNormalIrradiance: 452.3,
                directRadiation: 99.3,
                isSunny: true,
                score: 0.6832203428571428,
                time: "13:45",
                weatherCode: 2,
                weatherDescription: "Partly Cloudy",
              },
              length: 16,
              start: {
                cloudCover: 3,
                date: "2023-11-26",
                datetime: "2023-11-26T10:00",
                directNormalIrradiance: 526.9,
                directRadiation: 113.9,
                isSunny: true,
                score: 0.9690608,
                time: "10:00",
                weatherCode: 1,
                weatherDescription: "Mainly Sunny",
              },
            },
          ],
        },
      ],
      [
        {
          date: sunny_afternoon_2023_11_28.daily.time[0],
          data: sunny_afternoon_2023_11_28,
          expected: [
            {
              end: {
                cloudCover: 93,
                date: "2023-11-28",
                datetime: "2023-11-28T13:30",
                directNormalIrradiance: 425.5,
                directRadiation: 98,
                isSunny: true,
                score: 0.6265485714285715,
                time: "13:30",
                weatherCode: 3,
                weatherDescription: "Cloudy",
              },
              length: 2,
              start: {
                cloudCover: 93,
                date: "2023-11-28",
                datetime: "2023-11-28T13:15",
                directNormalIrradiance: 435.8,
                directRadiation: 106.4,
                isSunny: true,
                score: 0.7178084571428571,
                time: "13:15",
                weatherCode: 3,
                weatherDescription: "Cloudy",
              },
            },
          ],
        },
      ],
    ])("%#) should calculate sunny ranges for $date", ({ data, expected }) => {
      expect(getSunnyRanges(data)).toStrictEqual(expected);
      1;
    });
  });
});
