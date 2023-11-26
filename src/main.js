import cron from "node-cron";
import path from "node:path";
import process from "node:process";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

import { BOT_TOKEN } from "./config.js";
import { DB, createUsersDAO } from "./db/index.js";
import { logger } from "./logger.js";
import {
  dateIsValid,
  formatTime,
  resolveDate,
  withinTheHour,
} from "./timeUtils/index.js";
import { lines } from "./utils/index.js";
import {
  explainWeatherRange,
  getSunnyRanges,
  getWeather,
} from "./weather/index.js";
import { withAuth } from "./withAuth.js";

logger.info("Starting Sunny notification bot");
async function main() {
  const bot = new Telegraf(BOT_TOKEN);

  const db = await DB(path.join(path.resolve(), "db.json"));
  const usersDao = await createUsersDAO(db);

  bot.start(function start(ctx) {
    ctx.reply(
      lines(
        "Hi, I'm Sunny Notification Bot. 👋🏼",
        "Type /help for list of commands.",
      ),
    );
  });

  bot.help(function help(ctx) {
    // if (ctx.payload === '/forecast' || ctx.payload === '/f') {} // TODO improve /help
    // if (ctx.payload === '/subscribe' || ctx.payload === '/f') {} // TODO improve /help
    ctx.reply(
      lines(
        "/forecast or /f for today's sunny times 🌤",
        "/subscribe to notifications",
      ),
    );
  });

  bot.command(
    "subscribe",
    withAuth(async function subscribe(ctx) {
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
    const forecastDate = resolveDate(ctx.payload ?? 0);
    if (!dateIsValid(forecastDate)) {
      ctx.reply(
        lines(
          `I can't understand which date you want forecast when you say '${ctx.payload}'.`,
          "Acceptable values are numbers for desired date between yesterday (-1) to 3 days from now",
        ),
      );
      return;
    }

    const sunnyRanges = await getWeather(forecastDate).then(getSunnyRanges);
    const message =
      sunnyRanges.length === 0
        ? `The sun is not expected to make a meaningful appearance ${
            forecastDate ? `on ${forecastDate}` : "today"
          }.`
        : lines(
            "Expect sunny times at:",
            ...sunnyRanges.map(explainWeatherRange),
          );
    ctx.reply(message);
    return;
  }
  bot.command("f", withAuth(forecast));
  bot.command("forecast", withAuth(forecast));

  // #region cron schedule
  // morning schedule
  cron.schedule(
    "0 8 * * *",
    async function morningSchedule() {
      logger.info("Running morningSchedule");
      const sunnyRanges = await getWeather().then(getSunnyRanges);
      const message =
        sunnyRanges.length === 0
          ? "the sun is not expected to make a meaningful appearance today."
          : lines(
              "expect sunny times at:",
              ...sunnyRanges.map(explainWeatherRange),
            );
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
    async function hourlySchedule() {
      logger.info(`Running hourlySchedule ${formatTime()}`);
      const sunnyRanges = await getWeather().then(getSunnyRanges);
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

  bot.on(message("text"), function textMessage(ctx) {
    ctx.reply(
      `Hello ${ctx.message.from.username}. I'm not sure what does '${ctx.message.text}' means...`,
    );
  });

  bot.launch();

  // Enable graceful stop
  process.once("SIGINT", function handleSIGINT() {
    bot.stop("SIGINT");
    logger.info("Bot stopped on SIGINT");
    process.exit(0);
  });
  process.once("SIGTERM", function handleSIGTERM() {
    bot.stop("SIGTERM");
    logger.info("Bot stopped on SIGTERM");
    process.exit(0);
  });

  logger.info("Sunny Notification Bot listening...");
}
main();
