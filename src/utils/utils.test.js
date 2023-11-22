import { describe, expect, test } from "vitest";

import { lines, isBetweenNumbers } from "./utils";

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
    ])("Check %s is between %s and %s", (num, start, end, expected) => {
      expect(isBetweenNumbers(start, end, num)).toBe(expected);
    });
  });
});
