import fs from "node:fs/promises";
import { logger } from "./logger.js";

export async function DB(dbPath) {
  // basic functions
  async function read() {
    return JSON.parse(await fs.readFile(dbPath, { encoding: "utf-8" }));
  }

  async function write(data) {
    if (typeof data === "object") {
      data = JSON.stringify(data, null, 2);
    }
    await fs.writeFile(dbPath, data, { encoding: "utf-8" });
  }

  // init
  if (!dbPath || typeof dbPath !== "string") {
    throw new Error(`dbPath is not a string`);
  }
  try {
    await fs.stat(dbPath);
  } catch (err) {
    if (err.message.includes("no such file or directory"))
      await write(JSON.stringify({}));
    else {
      throw err;
    }
  }

  function entryKeyValid(entryKey) {
    if (typeof entryKey !== "string" && entryKey !== "") {
      logger.warn(`Invalid entry key ${entryKey}`);
      return false;
    }
    return true;
  }

  // entry accessors
  async function readEntry(entryKey) {
    if (!entryKeyValid(entryKey)) return;

    const db = await read();
    return db[entryKey];
  }

  async function overwriteEntry(entryKey, data) {
    if (!entryKeyValid(entryKey)) return;

    const db = await read();
    await write({ ...db, [entryKey]: data });
  }

  return {
    readEntry,
    overwriteEntry,
  };
}
