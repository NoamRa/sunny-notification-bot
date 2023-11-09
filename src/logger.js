import process from "node:process";
import winston from "winston";
const { combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

export const logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  level: "info",
  format: combine(timestamp(), myFormat),
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ filename: "error.log", level: "error" }),

    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ filename: "combined.log" }),

    new winston.transports.Console(),
  ],
});

process.on(
  "unhandledRejection",
  function handleUnhandledRejection(reason, promise) {
    logger.error(
      `Unhandled Rejection at: ${serialize(promise)}, reason: ${serialize(
        reason,
      )}`,
    );
  },
);

process.on("uncaughtException", function handleUncaughtException(error) {
  logger.error(`There was an uncaught exception: ${serialize(error)}`);
  logger.on("finish", () => {
    process.exit(1);
  });
});

export function serialize(something) {
  if (something instanceof Date) {
    return something.toISOString();
  } else if (something instanceof Error) {
    return something.toString();
  } else if (typeof something === "function") {
    return something.toString();
  } else if (something instanceof Promise) {
    return "Can't serialize a promise";
  }
  return JSON.stringify(item);
}
