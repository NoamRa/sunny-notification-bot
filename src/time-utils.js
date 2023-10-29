import dayjs from "dayjs";

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
