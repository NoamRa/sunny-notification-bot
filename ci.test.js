import { execSync } from "node:child_process";
import { describe, expect, test } from "vitest";
import { version as currentVersion } from "./package.json";

describe("CI tests", () => {
  const parseVersion = (version) => version.split(".").map(Number);

  const readMainVersion = () => {
    let version;
    try {
      version = JSON.parse(
        execSync("git show origin/main:package.json", { encoding: "utf-8" }),
      ).version;
    } catch (err) {
      throw err;
    }
    if (typeof version !== "string") {
      throw new Error("failed to read version from main branch");
    }

    return version;
  };

  const isVersionIncremented = (currentVersion, mainVersion) => {
    const [currentMajor, currentMinor, currentPatch] =
      parseVersion(currentVersion);
    const [mainMajor, mainMinor, mainPatch] = parseVersion(mainVersion);

    if (currentMajor > mainMajor) return true;
    if (currentMinor > mainMinor) return true;
    if (currentPatch > mainPatch) return true;
    return false;
  };

  expect.extend({
    toBeIncrementedFrom(currentVersion, mainVersion) {
      const cta =
        "Call `npm version <major | minor | patch>` to increment version.";

      if (isVersionIncremented(currentVersion, mainVersion)) {
        return {
          message: () =>
            `expected version ${currentVersion} to be incremented from version in main branch: ${mainVersion}. ${cta}`,
          pass: true,
        };
      } else {
        return {
          message: () =>
            `expected version ${currentVersion} NOT to be incremented from version in main branch: ${mainVersion}. ${cta}`,
          pass: false,
        };
      }
    },
  });

  const validateVersion = (version) => {
    // sanity
    expect(version).toBeTypeOf("string");
    expect(version).not.toBe("");

    const versionParts = parseVersion(version);
    expect(versionParts).toHaveLength(3);
    expect(versionParts.every(Number.isFinite)).toBe(true);
  };

  test("Incremented version in package.json", () => {
    const mainVersion = readMainVersion();
    validateVersion(mainVersion);
    validateVersion(currentVersion);

    expect(currentVersion).toBeIncrementedFrom(mainVersion);
  });
});
