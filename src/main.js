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
import {
  isLocationValid,
  isLocationInGermany,
  parseLocationString,
} from "./location/index.js";
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
        "/forecast or /f - get today's sunny times 🌤",
        "/location latitude, longitude - update location",
        "/subscribe to notifications",
        "/unsubscribe to delete your data from the system",
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
        "Please send approximate location for forecast, or use the /location command";
      ctx.reply(lines(subscriptionStatusMessage, updateLocationMessage));
    }),
  );

  function updateUserLocation(ctx, location) {
    if (isLocationValid(location)) {
      if (!isLocationInGermany(location)) {
        ctx.reply("Please choose location in Germany");
        return;
      }

      // at this point location valid and in germany, so we can update user
      return usersDao
        .updateLocation(ctx.message.from.id, location)
        .then(() =>
          ctx.reply("Location updated. Feel free to update it at any time."),
        )
        .catch(() => ctx.reply("Something went wrong when updating location"));
    }
  }

  bot.command(
    "location",
    withAuth(async function handleLocation(ctx) {
      const message = lines(
        "Location must be sent as latitude and longitude, separated by comma.",
        "Example: `/location 52.521,13.295`",
        "It may be easier to send location from 📎attachment menu",
      );

      if (!ctx.payload) {
        return ctx.reply(message, { parse_mode: "Markdown" });
      }
      const location = parseLocationString(ctx.payload);
      if (!location) {
        return ctx.reply(message, { parse_mode: "Markdown" });
      }
      return updateUserLocation(ctx, location);
    }),
  );

  bot.command(
    "unsubscribe",
    withAuth(async function handleUnsubscribe(ctx) {
      // check user exists
      const user = await usersDao.getUser(ctx.message.from.id);
      if (!user) {
        return ctx.reply("User is not subscribed. Use /subscribe");
      }

      const deletePayload = "delete me";
      // make sure user wants to unsubscribe
      if (ctx.payload === deletePayload) {
        const deleted = usersDao.deleteUser(ctx.message.from.id);
        if (deleted) {
          return ctx.reply(
            lines(
              "You have been deleted.",
              `Goodbye, ${ctx.message.from.username}. 🌞`,
            ),
          );
        }
        return ctx.reply(
          `Failed to delete user with ID '${ctx.message.from.id}'.`,
        );
      }

      // explain how to unsubscribe
      return ctx.reply(
        lines(
          `In order to delete yourself please type '\`/unsubscribe ${deletePayload}\`'.`,
          "This action is non-reversible, all user data will be deleted",
        ),
        { parse_mode: "Markdown" },
      );
    }),
  );

  // #endregion

  async function forecast(ctx) {
    logger.info(`Running forecast with payload '${ctx.payload}'`);
    try {
      const user = await usersDao.getUser(ctx.message.from.id);
      if (!user.location) {
        ctx.reply("Please send approximate location for forecast.");
        return;
      }
      ctx.reply(await forecastMessage(ctx.payload, user.location));
    } catch (err) {
      logger.error(err);
    }
  }
  bot.command("f", withAuth(forecast));
  bot.command("forecast", withAuth(forecast));

  // #region cron schedule
  // for testing use every 5 seconds cron: "*/5 * * * * *"

  // morning schedule
  cron.schedule(
    "0 8 * * *",
    async function morningSchedule() {
      logger.info("Running morningSchedule");
      const users = await usersDao.getUsers();
      for await (const user of users) {
        if (!user.location) {
          await bot.telegram.sendMessage(
            user.id,
            "Please send approximate location for forecast.",
          );
          continue;
        }
        await morningScheduleMessage(user.location)
          .then((message) => {
            if (message) {
              bot.telegram.sendMessage(user.id, message);
            }
            return;
          })
          .catch(logger.error);
      }
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
      const users = await usersDao.getUsers();
      for await (const user of users) {
        if (!user.location) {
          await bot.telegram.sendMessage(
            user.id,
            "Please send approximate location for forecast.",
          );
          continue;
        }
        await hourlyScheduleMessage(user.location)
          .then((message) => {
            if (message) {
              bot.telegram.sendMessage(user.id, message);
            }
            return;
          })
          .catch(logger.error);
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

  // on text message must be one of the last middleware
  bot.on(message("text"), function textMessage(ctx) {
    ctx.reply(
      `Hello ${ctx.message.from.username}. I'm not sure what does '${ctx.message.text}' means...`,
    );
  });

  // This must be last middleware since it catches any message (but only responds to those with location)
  bot.on(
    "message",
    withAuth(function handleMessageWithLocation(ctx) {
      if (ctx.message.location) {
        return updateUserLocation(ctx, ctx.message.location);
      }
    }),
  );

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
