import path from "node:path";
import cron from "node-cron";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

import { BOT_TOKEN } from "./config.js";
import { DB, createUsersDAO } from "./db/index.js";
import { getSunnyRanges, explainWeatherRange } from "./weather.js";
import { withAuth } from "./withAuth.js";
import { withinTheHour } from "./time-utils.js";

(async function main() {
  const bot = new Telegraf(BOT_TOKEN);

  const db = await DB(path.join(path.resolve(), "db.json"));
  const usersDao = await createUsersDAO(db);

  bot.start((ctx) =>
    ctx.reply(
      "Hi, I'm Sunny Notification Bot. 👋🏼\nType /help for list of commands.",
    ),
  );

  bot.help((ctx) =>
    ctx.reply(
      [
        "/forecast or /f for today's sunny times 🌤",
        "/subscribe to notification",
      ].join("\n"),
    ),
  );

  bot.command(
    "subscribe",
    withAuth(async (ctx) => {
      const user = await usersDao.createUser(
        ctx.message.from.id,
        ctx.message.from.username,
        ctx.message.from.first_name,
      );

      const message = user
        ? `Success! ${user.displayName} (${user.id}) has been subscribed. You will get sunny notifications!`
        : `User ${ctx.message.from.first_name} is already subscribed`;
      ctx.reply(message);
    }),
  );

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
  cron.schedule(
    "0 8 * * *",
    async () => {
      const sunnyRanges = await getSunnyRanges();
      const message =
        sunnyRanges.length === 0
          ? "the sun is not expected to make a meaningful appearance today."
          : [
              "expect sunny times at:",
              ...sunnyRanges.map(explainWeatherRange),
            ].join("\n");
      const users = await usersDao.getUsers();
      users.forEach((user) => {
        bot.telegram.sendMessage(user.id, `Good morning, ${message}`);
      });
    },
    {
      timezone: "Europe/Berlin",
    },
  );

  // check sunshine for next hour 5 minutes before the hour
  cron.schedule(
    "55 7-16 * * *",
    async () => {
      const sunnyRanges = await getSunnyRanges();
      const nextSunnyRange = sunnyRanges.find((range) => {
        return withinTheHour(range.start.datetime);
      });
      if (nextSunnyRange) {
        const users = await users.getUsers();
        users.forEach((user) => {
          bot.telegram.sendMessage(
            user.id,
            `Expecting sunshine within the hour: ${explainWeatherRange(
              nextSunnyRange,
            )}`,
          );
        });
      }
    },
    {
      timezone: "Europe/Berlin",
    },
  );

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
