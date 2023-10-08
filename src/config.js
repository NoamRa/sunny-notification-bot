import * as dotenv from "dotenv";

export const BOT_TOKEN = dotenv.config().parsed.BOT_TOKEN.trim();

export const ALLOWED = dotenv
  .config()
  .parsed.ALLOWED.split(",")
  .map((user) => parseInt(user.trim()))
  .filter(Boolean);
if (!ALLOWED) {
  throw new Error("Missing ALLOWED in .env file");
} else if (ALLOWED.length === 0) {
  throw new Error("ALLOWED doesn't contain inside. Please fix .env file");
}
