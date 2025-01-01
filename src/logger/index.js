export * from "./serialize.js";

let loggerModule;
if (typeof window !== "undefined") {
  loggerModule = (await import("./browserLogger.js")).browserLogger;
} else {
  loggerModule = (await import("./nodeLogger.js")).nodeBrowser;
}
export const logger = loggerModule;
