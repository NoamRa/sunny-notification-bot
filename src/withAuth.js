import { ALLOWED } from "./config.js";

export function withAuth(fn) {
  return async function (...args) {
    const ctx = args[0];
    if (!assertContext(ctx)) {
      throw new Error("withAuth must be called with context");
    }

    const user = ctx.update.message.from;
    if (!ALLOWED.includes(user.id)) {
      return ctx.reply(
        `I'm sorry, ${user.first_name}, I'm afraid I can't do that. 🛑`,
      );
    }

    await fn(...args);
  };
}

function assertContext(ctx) {
  return (
    ctx.constructor.name === "Context" &&
    ctx.update &&
    ctx.telegram.constructor.name === "Telegram"
  );
}
