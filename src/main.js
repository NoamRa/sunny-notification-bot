import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { BOT_TOKEN } from "./config.js";
import { todaysForecast } from "./weather.js";
import { withAuth } from "./withAuth.js";

(async function main() {
  const bot = new Telegraf(BOT_TOKEN);

  bot.start((ctx) =>
    ctx.reply(
      "Hi, I'm Sunny Notification Bot. 👋🏼\nType /help for list of commands.",
    ),
  );

  bot.help((ctx) =>
    ctx.reply(
      [
        "/forecast or /f for today's sunny times 🌤",
        // "/subscribe to notification"
      ].join("\n"),
    ),
  );

  // bot.command("subscribe", async (ctx) => {
  //   ctx.reply("subscribing");
  // });

  bot.command(
    "f",
    withAuth(async (ctx) => {
      ctx.reply(await todaysForecast());
    }),
  );

  bot.command(
    "forecast",
    withAuth(async (ctx) => {
      ctx.reply(await todaysForecast());
    }),
  );

  // bot.command("me", (ctx) =>
  //   ctx.reply(`you are ${JSON.stringify(ctx.message.from, null, 2)}`),
  // );

  bot.on(message("text"), async (ctx) => {
    await ctx.reply(
      `Hello ${ctx.message.from.username}. I'm not sure what does '${ctx.message.text}' means...`,
    );
  });

  bot.launch();

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  console.log("Sunny Notification Bot listening...");
})();
