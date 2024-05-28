import cron from "node-cron";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Markup, Telegraf } from "telegraf";
import { message } from "telegraf/filters";

import {
  forecastMessage,
  hourlyScheduleMessage,
  morningScheduleMessage,
} from "./botActions/index.js";
import { BOT_TOKEN } from "./config.js";
import {
  DB,
  HourlyNotification,
  MorningNotification,
  createUsersDAO,
  notificationsIsValid,
} from "./db/index.js";
import {
  isLocationInGermany,
  isLocationValid,
  parseLocationString,
} from "./location/index.js";
import { logger } from "./logger.js";
import { formatTime } from "./timeUtils/index.js";
import { lines } from "./utils/index.js";
import { withAuth } from "./withAuth.js";

const PackageJSON = JSON.parse(fs.readFileSync("./package.json"));
const botVersion = PackageJSON.version;

logger.info(`Starting Sunny notification bot ver ${botVersion}`);
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
    ctx.reply(
      lines(
        "/forecast or /f - get today's sunny times 🌤",
        "/location latitude, longitude - update location",
        "/notifications - change or check notification preferences",
        "/subscribe to bot (only need to do that once)",
        "/unsubscribe to delete your data from the system",
        "",
        `Sunny notification bot v${botVersion}`,
        "Want to learn more? [Check out the project on GitHub](https://github.com/NoamRa/sunny-notification-bot).",
      ),
      { parse_mode: "Markdown", link_preview_options: { is_disabled: true } },
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
        "Please send approximate location for forecast, or use the /location command.";
      ctx.reply(lines(subscriptionStatusMessage, updateLocationMessage));
    }),
  );

  function updateUserLocation(ctx, location) {
    if (isLocationValid(location)) {
      if (!isLocationInGermany(location)) {
        ctx.reply("Please choose location in Germany.");
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
        "Send location from the 📎attachment menu, or with the /location command.",
        "If using the /location command, values must be sent as latitude and longitude, separated by comma:",
        "`/location 52.521,13.295`",
      );

      // user just sent /location, without payload
      if (!ctx.payload) {
        const user = await usersDao.getUser(ctx.message.from.id);

        // user did not set location yes - explain how to set
        if (!user.location) {
          return ctx.reply(lines("You didn't send location yet.", ...message), {
            parse_mode: "Markdown",
          });
        }

        // user set location - display what's stored
        ctx.reply("Location for forecast is:");
        return ctx.sendLocation(
          user.location.latitude,
          user.location.longitude,
        );
      }

      // there is payload...
      const location = parseLocationString(ctx.payload);
      // ...but it's not location
      if (!location) {
        return ctx.reply(message, { parse_mode: "Markdown" });
      }

      // ...and it's a valid location!
      return updateUserLocation(ctx, location);
    }),
  );

  function updateNotification(notifications) {
    return async function updater(ctx) {
      if (!notificationsIsValid(notifications)) {
        return ctx.reply("Notification is formatted incorrectly");
      }
      await usersDao.updateNotifications(
        ctx.update.callback_query.from.id,
        notifications,
      );
      return ctx.reply("Done");
    };
  }

  bot.command(
    "notifications",
    withAuth(function chooseNotification(ctx) {
      return ctx.reply(
        "Which notification do you want to set?",
        Markup.inlineKeyboard([
          Markup.button.callback(
            "Morning notification",
            "show morning notification options",
          ),
          Markup.button.callback(
            "Hourly notification",
            "show hourly notification options",
          ),
          Markup.button.callback(
            "Show current settings",
            "show current notification",
          ),
        ]),
      );
    }),
  );
  bot.action("show current notification", async function showNotification(ctx) {
    const user = await usersDao.getUser(ctx.update.callback_query.from.id);
    if (!user) {
      logger.error(
        `Failed to find user with ID '${ctx.update.callback_query.from.id}'`,
      );
      return ctx.reply("Something went wrong, failed to find user");
    }

    return ctx.reply(
      lines(
        `Morning notifications set to ${user.notifications.morning}`,
        `Hourly notifications set to ${user.notifications.hourly}`,
      ),
    );
  });

  bot.action(
    "show morning notification options",
    function chooseMorningNotification(ctx) {
      return ctx.reply(
        "Do you want to receive morning notifications?",
        Markup.inlineKeyboard([
          Markup.button.callback(
            "Yes, always",
            "set morning notifications always",
          ),
          Markup.button.callback(
            "Sunny days only",
            "set morning notifications sunny",
          ),
          Markup.button.callback(
            "No, thanks",
            "set morning notifications none",
          ),
        ]),
      );
    },
  );
  bot.action(
    "set morning notifications always",
    updateNotification({ morning: MorningNotification.Always }),
  );
  bot.action(
    "set morning notifications sunny",
    updateNotification({ morning: MorningNotification.Sunny }),
  );
  bot.action(
    "set morning notifications none",
    updateNotification({ morning: MorningNotification.None }),
  );

  bot.action(
    "show hourly notification options",
    function chooseMorningNotification(ctx) {
      return ctx.reply(
        "Do you want to receive hourly notifications?",
        Markup.inlineKeyboard([
          Markup.button.callback("Yes", "set hourly notifications yes"),
          Markup.button.callback("No", "set hourly notifications no"),
        ]),
      );
    },
  );
  bot.action(
    "set hourly notifications yes",
    updateNotification({ hourly: HourlyNotification.Yes }),
  );
  bot.action(
    "set hourly notifications no",
    updateNotification({ hourly: HourlyNotification.No }),
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
        const deleted = await usersDao.deleteUser(ctx.message.from.id);
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
          "This action is non-reversible, all user data will be deleted.",
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
        if (user.notifications.morning === MorningNotification.None) {
          continue;
        }
        if (!user.location) {
          await bot.telegram.sendMessage(
            user.id,
            "Please send approximate location for forecast.",
          );
          continue;
        }
        await morningScheduleMessage(user.location)
          .then((message) => {
            if (!message) return;
            if (
              user.notifications.morning === MorningNotification.Sunny &&
              message.includes(
                "the sun is not expected to make a meaningful appearance today.",
              )
            ) {
              return;
            }

            bot.telegram.sendMessage(user.id, message);
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
        if (user.notifications.hourly === HourlyNotification.No) continue;
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
