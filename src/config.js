import * as dotenv from "dotenv";

export const BOT_TOKEN = dotenv.config().parsed.BOT_TOKEN?.trim();
if (typeof BOT_TOKEN !== "string" || BOT_TOKEN === "") {
  throw new Error("Missing or invalid BOT_TOKEN in .env file");
}

export const ALLOWED = dotenv
  .config()
  .parsed.ALLOWED.split(",")
  .map((user) => Number(user.trim()))
  .filter(Boolean);
if (!ALLOWED) {
  throw new Error("Missing ALLOWED in .env file");
} else if (ALLOWED.length === 0) {
  throw new Error("ALLOWED doesn't contain values. Please fix .env file");
}
