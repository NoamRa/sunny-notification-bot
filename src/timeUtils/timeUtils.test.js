import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  dateIsValid,
  // formatDate,
  // formatTime,
  // isDaytime,
  isSameHour,
  resolveDate,
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
  ])("%#) Check date '%s's validity", (date, expected) => {
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
  ])("%#) Check '%s' is same hour as '%s'", (a, b, expected) => {
    expect(isSameHour(a, b)).toBe(expected);
  });

  describe("Test resolveDate", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test.each([
      [
        {
          date: "2023-04-05",
          value: "2",
          expected: "2023-04-07",
        },
      ],
      [
        {
          date: "1900-01-01",
          value: "-1",
          expected: "1899-12-31",
        },
      ],
      [
        {
          date: "2023-04-05",
          value: "1",
          expected: "2023-04-06",
        },
      ],
      [
        {
          date: "2023-04-05",
          value: "",
          expected: "2023-04-05",
        },
      ],
      [
        {
          date: "2023-04-05",
          value: 0,
          expected: "2023-04-05",
        },
      ],
      [
        {
          date: "2023-04-05",
          value: 10,
          expected: "",
        },
      ],
      [
        {
          date: "2023-04-05",
          value: 3,
          expected: "2023-04-08",
        },
      ],
      [
        {
          date: "2023-04-05",
          value: NaN,
          expected: "",
        },
      ],
      [
        {
          date: "2023-04-09",
          value: null, // edge case because Number(null) is 0
          expected: "2023-04-09",
        },
      ],
      [
        {
          date: "2023-04-05",
          value: undefined,
          expected: "",
        },
      ],
    ])(
      "%#) Check when adding $value to $date, resolveDate returns $expected",
      ({ date, value, expected }) => {
        vi.setSystemTime(new Date(date));
        expect(resolveDate(value)).toBe(expected);
      },
    );
  });
});
