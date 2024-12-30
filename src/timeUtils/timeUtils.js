import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import isBetween from "dayjs/plugin/isBetween.js";
import utc from "dayjs/plugin/utc.js";

import { isBetweenNumbers } from "../utils/index.js";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(utc);

const dateFormat = "YYYY-MM-DD";
const timeFormat = "HH:mm";

export function formatDate(datetime) {
  return dayjs(datetime).format(dateFormat);
}

export function formatTime(datetime) {
  return dayjs(datetime).format(timeFormat);
}

export function withinTheHour(datetime) {
  const now = dayjs().utc();
  const endOfNextHour = now.add(1, "hour").endOf("hour");
  // exclusive before, inclusive after https://day.js.org/docs/en/plugin/is-between
  return dayjs(datetime).utc().isBetween(now, endOfNextHour, "hour", "(]");
}

export function dateIsValid(date) {
  return dayjs(date, dateFormat, true).isValid();
}

export function resolveDate(value) {
  return isBetweenNumbers(-1, Number(value), 3)
    ? formatDate(dayjs().add(Number(value), "day"))
    : "";
}
