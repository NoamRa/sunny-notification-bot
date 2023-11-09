import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";

dayjs.extend(isBetween);

const dateFormat = "YYYY-MM-DD";
const timeFormat = "HH:mm";

export function getDate(datetime) {
  return dayjs(datetime).format(dateFormat);
}

export function getTime(datetime) {
  return dayjs(datetime).format(timeFormat);
}

export function withinTheHour(datetime) {
  return dayjs().add(1, "hour").endOf("hour").diff(datetime, "hour");
}

export function isDaytime(sunrise, sunset, datetime) {
  // inclusive before and after https://day.js.org/docs/en/plugin/is-between
  return dayjs(datetime).isBetween(sunrise, sunset, "hour", "[]");
}
