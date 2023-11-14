import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import isBetween from "dayjs/plugin/isBetween.js";

import { isBetweenNumbers } from "./utils.js";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const dateFormat = "YYYY-MM-DD";
const timeFormat = "HH:mm";

export function formatDate(datetime) {
  return dayjs(datetime).format(dateFormat);
}

export function formatTime(datetime) {
  return dayjs(datetime).format(timeFormat);
}

export function withinTheHour(datetime) {
  return dayjs().add(1, "hour").endOf("hour").diff(datetime, "hour");
}

export function isDaytime(sunrise, sunset, datetime) {
  // inclusive before and after https://day.js.org/docs/en/plugin/is-between
  return dayjs(datetime).isBetween(sunrise, sunset, "hour", "[]");
}

export function dateIsValid(date) {
  return dayjs(date, dateFormat, true).isValid();
}

export function isSameHour(time, compared) {
  return dayjs(time).startOf("hour").isSame(compared);
}

export function resolveDate(value) {
  return isBetweenNumbers(-1, 3, Number(value))
    ? formatDate(dayjs().add(value, "day"))
    : "";
}
