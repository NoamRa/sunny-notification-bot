import { describe, expect, test } from "vitest";

import { clamp, isBetweenNumbers, lines, normalizer } from "./utils";

describe("Test utils", () => {
  test("lines are joined with new-line", () => {
    expect(lines("a", "b")).toBe("a\nb");
    expect(lines("a", "b", "c")).toBe("a\nb\nc");
    expect(lines("foo?", "bar!")).toBe("foo?\nbar!");
  });

  describe("Test isBetweenNumbers", () => {
    test.each([
      [1, 0, 2, true],
      [2, 0, 1, false],
      [0, 1, 2, false],
      [-2, -3, -1, true],
      [-1, -1, -1, true],
      [-1, -2, -2, false],
      [0, 0, 0, true],
      [2, 2, 2, true],
    ])("%#) Check %s is between %s and %s", (num, start, end, expected) => {
      expect(isBetweenNumbers(start, end, num)).toBe(expected);
    });
  });

  describe("Test clamp", () => {
    test.each([
      // value, min, max, expected
      [0.5, undefined, undefined, 0.5], // value within default range
      [-1, undefined, undefined, 0], // value below default minimum
      [2, undefined, undefined, 1], // value above default maximum
      [0, undefined, undefined, 0], // value equal to default minimum
      [1, undefined, undefined, 1], // value equal to default maximum
      [5, 3, 7, 5], // value within custom range
      [2, 3, 7, 3], // value below custom minimum
      [8, 3, 7, 7], // value above custom maximum
      [3, 3, 7, 3], // value equal to custom minimum
      [7, 3, 7, 7], // value equal to custom maximum
      ["a", undefined, undefined, NaN], // non-numeric value
      [0.5, 1, 0, NaN], // invalid range (min > max)
    ])(
      "%#) should clamp %s to %s when min is %s and max is %s",
      (value, min, max, expected) => {
        expect(clamp(value, min, max)).toBe(expected);
      },
    );
  });

  describe("normalizer function tests", () => {
    test.each([
      [{ min: 0, max: 10, value: 5, expected: 0.5 }], // Normal case
      [{ min: 0, max: 10, value: 0, expected: 0 }], // Boundary value (min)
      [{ min: 0, max: 10, value: 10, expected: 1 }], // Boundary value (max)
      [{ min: 0, max: 10, value: -5, expected: -0.5 }], // Value below range
      [{ min: 0, max: 10, value: 15, expected: 1.5 }], // Value above range
      [{ min: 10, max: 0, value: 5, expected: NaN }], // Invalid range
      [{ min: "a", max: 10, value: 5, expected: NaN }], // Non-numeric min
      [{ min: 0, max: "b", value: 5, expected: NaN }], // Non-numeric max
      [{ min: 5, max: 5, value: 5, expected: NaN }], // Zero range
      [{ min: 0, max: 10, value: "c", expected: NaN }], // Non-numeric value
    ])(
      "%#) should normalize $value with min $min and max $max to $expected",
      ({ min, max, value, expected }) => {
        const result = normalizer(min, max)(value);
        if (isNaN(expected)) {
          expect(result).toBeNaN();
        } else {
          expect(result).toBeCloseTo(expected);
        }
      },
    );
  });
});
