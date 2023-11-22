import { describe, expect, test } from "vitest";
import {
  dateIsValid,
  // formatDate,
  // formatTime,
  // isDaytime,
  isSameHour,
  // resolveDate,
  // withinTheHour,
} from "./timeUtils";

describe("Test time utils", () => {
  test.each([
    ["2020-02-02", true],
    ["4567-12-23", true],
    ["abc", false],
    ["05:01", false],
    ["83-01", false],
    [3, false],
    [2023, false],
    ["20-02-02", false],
    ["20-02-2202", false],
  ])("Check date '%s's validity", (date, expected) => {
    expect(dateIsValid(date)).toBe(expected);
  });

  test.each([
    ["2023-11-15T17:00:15", "2023-11-15T17:44:15", true],
    ["2022-11-15T17:00:15", "2023-12-15T17:46:15", true],
    ["2023-11-15T17:00:15", "2023-11-15T17:10:15", true],
    ["2023-11-15T17:03:00", "2023-11-15T17:44:15", true],
    ["2023-11-15T17:00:00", "2023-11-15T17:50:15", true],
    ["2023-11-15T15:00:00", "2023-11-15T17:50:15", false],
    ["2023-11-15T07:00:00", "2023-11-15T17:50:15", false],
    ["2023-11-15T13:00:00", "2023-11-15T17:50:15", false],
    ["2023-11-15T00:00:00", "2023-11-15T17:50:15", false],
  ])("Check '%s' is same hour as '%s'", (a, b, expected) => {
    expect(isSameHour(a, b)).toBe(expected);
  });
});
