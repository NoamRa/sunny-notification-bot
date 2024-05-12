import { describe, expect, test } from "vitest";

import { parseLocationString } from "./utils";

describe("Test location utils", () => {
  describe("Test parseLocationString - positive", () => {
    test.each([
      {
        name: "comma and space",
        payload: "42.3601, 71.0589",
        expected: {
          latitude: 42.3601,
          longitude: 71.0589,
        },
      },
      {
        name: "comma",
        payload: "42.3601,71.0589",
        expected: {
          latitude: 42.3601,
          longitude: 71.0589,
        },
      },
      {
        name: "space",
        payload: "42.3601 71.0589",
        expected: {
          latitude: 42.3601,
          longitude: 71.0589,
        },
      },
      {
        name: "negative latitude",
        payload: "-42.3601,71.0589",
        expected: {
          latitude: -42.3601,
          longitude: 71.0589,
        },
      },
      {
        name: "negative longitude",
        payload: "42.3601 -71.0589",
        expected: {
          latitude: 42.3601,
          longitude: -71.0589,
        },
      },
    ])(
      "%#) Payload with $name - $payload is parsed to lat: $expected.latitude, lon: $expected.longitude",
      ({ payload, expected }) => {
        expect(parseLocationString(payload)).toStrictEqual(expected);
      },
    );
  });
  describe("Test parseLocationString - negative", () => {
    test.each([
      {
        name: "one number",
        payload: "42.3601",
      },
      {
        name: "three numbers",
        payload: "42.3601, 456, 789",
      },
      {
        name: "text",
        payload: "foo",
      },
      {
        name: "more text",
        payload: "foo, bar",
      },
      {
        name: "empty string",
        payload: "",
      },
      {
        name: "number",
        payload: 456,
      },
      {
        name: "null",
        payload: null,
      },
      {
        name: "undefined",
        payload: undefined,
      },
    ])("%#) Payload with $name - $payload returns null", ({ payload }) => {
      expect(parseLocationString(payload)).toBeNull();
    });
  });
});
