import { describe, test, expect } from "vitest";

import { notificationsIsValid } from "./notifications.js";
describe("Test notifications", () => {
  describe("Test notification valid", () => {
    test.each([
      {
        name: "null is not valid",
        notifications: null,
        expected: false,
      },
      {
        name: "empty object is valid ",
        notifications: {},
        expected: true,
      },
      {
        name: "just morning - valid value",
        notifications: {
          morning: "None",
        },
        expected: true,
      },
      {
        name: "just morning - invalid value",
        notifications: {
          morning: "Nope",
        },
        expected: false,
      },
      {
        name: "just hourly - valid value",
        notifications: {
          hourly: "Yes",
        },
        expected: true,
      },
      {
        name: "just hourly - invalid value",
        notifications: {
          hourly: true,
        },
        expected: false,
      },
      {
        name: "both props - valid value",
        notifications: {
          hourly: "Yes",
          morning: "None",
        },
        expected: true,
      },
      {
        name: "both props - invalid value",
        notifications: {
          hourly: "Yes",
          morning: "None1",
        },
        expected: false,
      },
      {
        name: "unrelated key",
        notifications: {
          foo: "bar",
        },
        expected: false,
      },
    ])(
      "%#) $name - $notifications is $expected valid",
      ({ notifications, expected }) => {
        expect(notificationsIsValid(notifications)).toStrictEqual(expected);
      },
    );
  });
});
