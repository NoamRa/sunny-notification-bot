import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { dateIsValid, resolveDate, withinTheHour } from "./timeUtils";

describe("Test time utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Test dateIsValid", () => {
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
  });

  describe("Test resolveDate", () => {
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

  describe("Test withinTheHour", () => {
    test.each([
      [
        {
          // expected use case
          mockNowTime: "2023-04-05T09:55:00Z",
          datetime: "2023-04-05T10:00:00Z",
          expected: true,
        },
      ],
      [
        {
          // good for the end of the hour
          mockNowTime: "2023-04-05T09:55:00Z",
          datetime: "2023-04-05T10:56:00Z",
          expected: true,
        },
      ],
      [
        {
          // but not good after the next hour ended
          mockNowTime: "2023-04-05T09:55:00Z",
          datetime: "2023-04-05T11:00:00Z",
          expected: false,
        },
      ],
      [
        {
          // only look forward 1
          mockNowTime: "2023-04-05T08:15:00Z",
          datetime: "2023-04-05T08:10:00Z",
          expected: false,
        },
      ],
      [
        {
          // only look forward 2
          mockNowTime: "2023-04-05T10:00:00Z",
          datetime: "2023-04-05T09:00:00Z",
          expected: false,
        },
      ],
      [
        {
          // only look forward 3
          mockNowTime: "2023-04-05T11:55:00Z",
          datetime: "2023-04-05T11:30:00Z",
          expected: false,
        },
      ],
    ])(
      "%#) Check $datetime is within the hour from $mockNowTime, $expected",
      ({ mockNowTime, datetime, expected }) => {
        vi.setSystemTime(new Date(mockNowTime));
        expect(withinTheHour(datetime)).toBe(expected);
      },
    );
  });
});
