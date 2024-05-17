import fs from "node:fs/promises";

import { afterEach, describe, expect, test, vi } from "vitest";

import { DB } from "./db.js";

const mockedReadFile = vi.spyOn(fs, "readFile");
const mockedWriteFile = vi.spyOn(fs, "writeFile").mockResolvedValue();
const mockedStat = vi.spyOn(fs, "stat");

const dbPath = "fooBar.json";

describe("Test DB", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("init - no file", async () => {
    mockedStat.mockRejectedValue(new Error("no such file or directory"));
    const db = await DB(dbPath);

    expect(mockedWriteFile).toHaveBeenCalledWith(
      dbPath,
      JSON.stringify({}, null, 2),
      { encoding: "utf-8" },
    );
  });

  test("read entry", async () => {
    const entryKey = "foo";
    const data = { baz: [1, "2"] };

    mockedReadFile.mockResolvedValue(JSON.stringify({ [entryKey]: data }));
    const db = await DB(dbPath);
    const entry = await db.readEntry(entryKey);
    expect(entry).toStrictEqual({ baz: [1, "2"] });
  });

  test("overwrite entry - new entry", async () => {
    const entryKey = "foo";
    const data = { baz: [1, "2"] };

    const db = await DB(dbPath);
    await db.overwriteEntry(entryKey, data);
    expect(mockedWriteFile).toHaveBeenCalledWith(
      dbPath,
      JSON.stringify({ foo: data }, null, 2),
      { encoding: "utf-8" },
    );
  });

  test("overwrite entry - existing  entry", async () => {
    const entryKey = "foo";

    mockedReadFile.mockResolvedValue(JSON.stringify({ [entryKey]: "bar" }));
    const db = await DB(dbPath);
    const entry = await db.readEntry(entryKey);
    expect(entry).toBe("bar");

    const newData = { baz: [1, "2"] };

    await db.overwriteEntry(entryKey, newData);
    expect(mockedWriteFile).toHaveBeenCalledWith(
      dbPath,
      JSON.stringify({ [entryKey]: newData }, null, 2),
      { encoding: "utf-8" },
    );
  });
});
