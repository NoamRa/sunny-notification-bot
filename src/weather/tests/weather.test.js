import { describe, expect, test } from "vitest";

import { getSunnyRanges } from "../index.js";
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
                isDay: 1,
                cloudCover: 76,
                weatherCode: 3,
                directRadiation: 147.2,
                directNormalIrradiance: 532.7,
                weatherDescription: "Cloudy",
                score: 1,
                isSunny: true,
              },
              end: {
                datetime: "2023-11-13T11:00",
                date: "2023-11-13",
                time: "11:00",
                isDay: 1,
                cloudCover: 100,
                weatherCode: 3,
                directRadiation: 150.2,
                directNormalIrradiance: 476,
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
                isDay: 1,
                cloudCover: 100,
                weatherCode: 3,
                directRadiation: 121.9,
                directNormalIrradiance: 364.8,
                weatherDescription: "Cloudy",
                score: 0.6972370285714286,
                isSunny: true,
              },
              end: {
                datetime: "2023-11-13T12:15",
                date: "2023-11-13",
                time: "12:15",
                isDay: 1,
                cloudCover: 88,
                weatherCode: 3,
                directRadiation: 114.5,
                directNormalIrradiance: 344.2,
                weatherDescription: "Cloudy",
                score: 0.6018491428571427,
                isSunny: true,
              },
            },
            {
              length: 3,
              start: {
                datetime: "2023-11-13T13:15",
                date: "2023-11-13",
                time: "13:15",
                isDay: 1,
                cloudCover: 53,
                weatherCode: 2,
                directRadiation: 168.4,
                directNormalIrradiance: 557.4,
                weatherDescription: "Partly Cloudy",
                score: 1,
                isSunny: true,
              },
              end: {
                datetime: "2023-11-13T13:45",
                date: "2023-11-13",
                time: "13:45",
                isDay: 1,
                cloudCover: 58,
                weatherCode: 2,
                directRadiation: 147.2,
                directNormalIrradiance: 540,
                weatherDescription: "Partly Cloudy",
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
                isDay: 1,
                cloudCover: 76,
                weatherCode: 0,
                directRadiation: 105.1,
                directNormalIrradiance: 520.5,
                weatherDescription: "Sunny",
                score: 0.8614182857142856,
                isSunny: true,
              },
              end: {
                datetime: "2023-11-22T12:45",
                date: "2023-11-22",
                time: "12:45",
                isDay: 1,
                cloudCover: 79,
                weatherCode: 3,
                directRadiation: 175.6,
                directNormalIrradiance: 610.8,
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
          date: very_sunny_day_2023_11_26.daily.time[0],
          data: very_sunny_day_2023_11_26,
          expected: [
            {
              length: 16,
              start: {
                datetime: "2023-11-26T10:00",
                date: "2023-11-26",
                time: "10:00",
                isDay: 1,
                cloudCover: 3,
                weatherCode: 1,
                directRadiation: 113.9,
                directNormalIrradiance: 550.4,
                weatherDescription: "Mainly Sunny",
                score: 1,
                isSunny: true,
              },
              end: {
                datetime: "2023-11-26T13:45",
                date: "2023-11-26",
                time: "13:45",
                isDay: 1,
                cloudCover: 84,
                weatherCode: 3,
                directRadiation: 99.3,
                directNormalIrradiance: 435.9,
                weatherDescription: "Cloudy",
                score: 0.6553684571428571,
                isSunny: true,
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
              length: 2,
              end: {
                datetime: "2023-11-28T13:30",
                date: "2023-11-28",
                time: "13:30",
                isDay: 1,
                cloudCover: 83,
                weatherCode: 2,
                directRadiation: 98,
                directNormalIrradiance: 412.8,
                weatherDescription: "Partly Cloudy",
                score: 0.6053577142857143,
                isSunny: true,
              },
              start: {
                datetime: "2023-11-28T13:15",
                date: "2023-11-28",
                time: "13:15",
                isDay: 1,
                cloudCover: 88,
                weatherCode: 2,
                directRadiation: 106.4,
                directNormalIrradiance: 425.4,
                weatherDescription: "Partly Cloudy",
                score: 0.6984585142857143,
                isSunny: true,
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
