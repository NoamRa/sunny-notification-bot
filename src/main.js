import cron from "node-cron";
import path from "node:path";
import process from "node:process";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

import {
  forecastMessage,
  hourlyScheduleMessage,
  morningScheduleMessage,
} from "./botActions/index.js";
import { BOT_TOKEN } from "./config.js";
import { DB, createUsersDAO } from "./db/index.js";
import { isLocationValid, isLocationInGermany } from "./location/index.js";
import { logger } from "./logger.js";
import { formatTime } from "./timeUtils/index.js";
import { lines } from "./utils/index.js";
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

  // #region subscribe and user info
  bot.command(
    "subscribe",
    withAuth(async function subscribe(ctx) {
      const user = await usersDao.createUser(
        ctx.message.from.id,
        ctx.message.from.username,
        ctx.message.from.first_name,
      );

      const subscriptionStatusMessage = user
        ? `Success! ${user.displayName} (${user.id}) has been subscribed.`
        : `User ${ctx.message.from.first_name} is already subscribed.`;
      const updateLocationMessage =
        "Please send approximate location for forecast.";
      ctx.reply(lines(subscriptionStatusMessage, updateLocationMessage));
    }),
  );

  function handleLocation(ctx) {
    if (isLocationValid(ctx.message.location)) {
      if (!isLocationInGermany(ctx.message.location)) {
        ctx.reply("Please choose location in Germany");
        return;
      }

      // at this point location valid and in germany, so we can update user
      usersDao
        .updateLocation(ctx.message.from.id, ctx.message.location)
        .then(() =>
          ctx.reply("Location updated. Feel free to update it at any time."),
        )
        .catch(() => ctx.reply("Something went wrong when updating location"));
      return;
    }
  }
  bot.on("message", withAuth(handleLocation));
  // #endregion

  async function forecast(ctx) {
    logger.info(`Running forecast with payload '${ctx.payload}'`);
    try {
      ctx.reply(await forecastMessage(ctx.payload));
    } catch (err) {
      logger.error(err);
    }
  }
  bot.command("f", withAuth(forecast));
  bot.command("forecast", withAuth(forecast));

  // #region cron schedule
  async function sendMessageToUsers(message) {
    if (!message) return;

    const users = await usersDao.getUsers();
    if (users.length === 0) {
      logger.warn(`User list is empty`);
      return;
    }

    for (const user of users) {
      await bot.telegram.sendMessage(user.id, message);
    }
    return;
  }

  // morning schedule
  cron.schedule(
    "0 8 * * *",
    function morningSchedule() {
      logger.info("Running morningSchedule");
      morningScheduleMessage().then(sendMessageToUsers).catch(logger.error);
    },
    {
      timezone: "Europe/Berlin",
    },
  );

  // check sunshine for next hour 5 minutes before the hour
  cron.schedule(
    "55 7-16 * * *",
    function hourlySchedule() {
      logger.info(`Running hourlySchedule ${formatTime()}`);
      hourlyScheduleMessage().then(sendMessageToUsers).catch(logger.error);
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
