import cron from "node-cron";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

import { ALLOWED, BOT_TOKEN } from "./config.js";
import { getSunnyRanges } from "./weather.js";
import { withAuth } from "./withAuth.js";
import { withinTheHour } from "./time-utils.js";

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

  async function forecast(ctx) {
    const sunnyRanges = await getSunnyRanges();
    const message =
      sunnyRanges.length === 0
        ? "The sun is not expected to make a meaningful appearance today."
        : [
            "Expect sunny times at:",
            ...sunnyRanges.map(explainWeatherRange),
          ].join("\n");
    ctx.reply(message);
  }
  bot.command("f", withAuth(forecast));
  bot.command("forecast", withAuth(forecast));

  // #region cron

  // morning schedule
  cron.schedule("* 8 * * *", async () => {
    const sunnyRanges = await getSunnyRanges();
    const message =
      sunnyRanges.length === 0
        ? "the sun is not expected to make a meaningful appearance today."
        : [
            "expect sunny times at:",
            ...sunnyRanges.map(explainWeatherRange),
          ].join("\n");

    ALLOWED.forEach((userId) => {
      bot.telegram.sendMessage(userId, `Good morning, ${message}`);
    });
  });

  cron.schedule("55 7-16 * * *", async () => {
    const sunnyRanges = await getSunnyRanges();
    const nextSunnyRange = sunnyRanges.find((range) => {
      return withinTheHour(range.start.datetime);
    });
    if (nextSunnyRange) {
      ALLOWED.forEach((userId) => {
        bot.telegram.sendMessage(
          userId,
          `Expecting sunshine within the hour: ${explainWeatherRange(
            nextSunnyRange,
          )}`,
        );
      });
    }
  });

  // #endregion

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
