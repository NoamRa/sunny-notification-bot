import {
  dateIsValid,
  formatDate,
  resolveDate,
  withinTheHour,
} from "../timeUtils/index.js";
import { lines } from "../utils/index.js";
import {
  explainWeatherRange,
  getSunnyRanges,
  getWeather,
} from "../weather/index.js";

export async function forecastMessage(payload, location) {
  const forecastDate = resolveDate(payload ?? 0);
  if (!dateIsValid(forecastDate)) {
    return lines(
      `I can't understand which date you want forecast when you say '${payload}'.`,
      "Acceptable values are numbers for desired date between yesterday (-1) to 3 days from now",
    );
  }

  const sunnyRanges = await getWeather(forecastDate, location).then(
    getSunnyRanges,
  );
  if (sunnyRanges.length >= 1) {
    const date = sunnyRanges[0].start.date;
    return lines(
      `${date} - Expect sunny times at:`,
      ...sunnyRanges.map(explainWeatherRange),
    );
  }
  const isToday = formatDate() === forecastDate;
  return `The sun is not expected to make a meaningful appearance ${
    isToday ? "today" : `on ${forecastDate}`
  }.`;
}

export async function hourlyScheduleMessage(location) {
  const sunnyRanges = await getWeather(resolveDate(0), location).then(
    getSunnyRanges,
  );
  const nextSunnyRange = sunnyRanges.find((range) => {
    return withinTheHour(range.start.datetime);
  });
  if (nextSunnyRange) {
    return `Expecting sunshine within the hour: ${explainWeatherRange(
      nextSunnyRange,
    )}`;
  }
  return "";
}

export async function morningScheduleMessage(location) {
  const sunnyRanges = await getWeather(resolveDate(0), location).then(
    getSunnyRanges,
  );
  const message =
    sunnyRanges.length === 0
      ? "the sun is not expected to make a meaningful appearance today."
      : lines(
          "expect sunny times at:",
          ...sunnyRanges.map(explainWeatherRange),
        );

  return `Good morning, ${message}`;
}
