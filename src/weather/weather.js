import { QueryCache, QueryClient } from "@tanstack/query-core";

const queryClient = new QueryClient({
  queryCache: new QueryCache(),
});

import { logger, serialize } from "../logger.js";
import { formatDate, formatTime, hoursDistance } from "../timeUtils/index.js";
import { clamp, normalizer, roundTo } from "../utils/index.js";

function getWeatherRequest(date, location) {
  const url = "https://api.open-meteo.com/v1/dwd-icon";
  const d = formatDate(date);
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    daily: ["sunrise", "sunset"],
    minutely_15: [
      "is_day",
      "weathercode",
      "cloudcover",
      "direct_radiation_instant",
      "direct_normal_irradiance_instant",
    ].join(","),
    timezone: "Europe/Berlin",
    start_date: d,
    end_date: d,
  });

  return fetch(`${url}?${params.toString()}`)
    .then((response) => {
      if (response.ok) return response;
      throw response;
    })
    .then((res) => res.json());
}

export async function getWeather(date, location) {
  return queryClient
    .fetchQuery({
      queryKey: ["weather", date, location],
      queryFn: () => getWeatherRequest(date, location),
      staleTime: 300_000, // five minutes
      retry: 3,
    })
    .catch((err) => {
      logger.error(serialize(err));
      throw "Get weather failed due to network error.";
    });
}

export function getSunnyRanges(rawData) {
  const minutely15Data = mapTimes(rawData.minutely_15.time, {
    isDay: rawData.minutely_15.is_day,
    cloudCover: rawData.minutely_15.cloudcover,
    weatherCode: rawData.minutely_15.weathercode,
    directRadiation: rawData.minutely_15.direct_radiation_instant,
    directNormalIrradiance:
      rawData.minutely_15.direct_normal_irradiance_instant,
  });

  const dataWithTime = minutely15Data
    .filter((item) => item.isDay)
    .map(({ time, ...item }) => ({
      datetime: time,
      date: formatDate(time),
      time: formatTime(time), // overriding the original time field. That's why it was cloned to datetime
      sunrise: rawData.daily.sunrise[0],
      sunset: rawData.daily.sunset[0],
      ...item,
    }));

  const weatherData = dataWithTime.map((item) => {
    const percent = sunPercent(item);
    return {
      ...item,
      weatherDescription: WEATHER_CODE[item.weatherCode],
      percent,
      isSunny: isSunny(percent),
    };
  });

  const sunnyRanges = sunnyRangeAnalyzer(weatherData).filter(
    ({ length }) => length >= 2,
  );

  return sunnyRanges;
}

/**
 * Given parameters, calculates percent of sunny-ness
 * @param {Object} parameters - Named parameters object.
 * @param {string} parameters.datetime - Time in ISO 8601
 * @param {number} parameters.cloudCover - Direct solar radiation on the normal plane (perpendicular to the sun)
 * @param {string} parameters.sunrise - Sunrise in ISO 8601
 * @param {string} parameters.sunset - Sunset in ISO 8601
 * @param {number} parameters.directRadiation - Direct solar radiation on the horizontal plane
 * @param {number} parameters.directNormalIrradiance - Direct solar radiation on the normal plane (perpendicular to the sun)
 * Direct normal irradiance values will be greater than direct ration, especially in the winter when the sun is low
 * @returns {number} percent in range 0-100
 */
function sunPercent(parameters) {
  const { directRadiation, directNormalIrradiance } = parameters;
  const normalizedDNI = normalizer(25, 150)(directRadiation);
  const normalizedDIN = normalizer(50, 400)(directNormalIrradiance);
  const factor = sunFactor(parameters);

  const score = normalizedDNI * normalizedDIN * factor;

  const percent = roundTo(2, clamp(score)) * 100;

  return percent;
}

/**
 * Used to improve sun percent on some conditions
 * @param {Object} parameters - Named parameters object.
 * @returns {number} factor
 */
function sunFactor(parameters) {
  const { cloudCover, datetime, sunrise, sunset } = parameters;

  let factor = 1;
  // boost if cloud coverage is low
  if (cloudCover <= 20) factor += 0.1;

  // boost if close to sunrise / sunset
  if (hoursDistance(datetime, sunrise) <= 2) factor += 0.1;
  if (hoursDistance(datetime, sunset) <= 2) factor += 0.1;

  return factor;
}

/**
 * Is it sunny logic
 * @param {number} score in range 0-100
 * @returns {boolean}
 */
function isSunny(score) {
  return score >= 60;
}

// #region utils
function mapTimes(times, fields) {
  const fieldKeys = Object.keys(fields);
  return times.map((time, idx) => ({
    time,
    ...fieldKeys.reduce(
      (acc, key) => ({ ...acc, [key]: fields[key][idx] }),
      {},
    ),
  }));
}

function sunnyRangeAnalyzer(weatherData) {
  const genCurrentRangeObj = () => ({
    length: 0,
    start: null,
    end: null,
  });
  let currentRange = genCurrentRangeObj();
  const results = [];

  weatherData.forEach((weatherItem, index) => {
    if (weatherItem.isSunny) {
      if (currentRange.length === 0) {
        // beginning of sunny range :)
        currentRange.start = weatherItem;
      } else {
        // sunny range continues :D
      }
      currentRange.length += 1;
    } else {
      // it's cloudy
      if (currentRange.length > 0) {
        // runny range ended :(
        currentRange.end = weatherData[index - 1];
        results.push(currentRange);
        currentRange = genCurrentRangeObj();
      } else {
        // cloudy range continues :(
      }
    }
  });
  return results;
}

export function explainWeatherRange(weatherRange) {
  return `${weatherRange.start.time} -> ${weatherRange.end.time}`;
}

const WEATHER_CODE = {
  0: "Sunny",
  1: "Mainly Sunny",
  2: "Partly Cloudy",
  3: "Cloudy",
  45: "Foggy",
  48: "Rime Fog",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  56: "Light Freezing Drizzle",
  57: "Freezing Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  66: "Light Freezing Rain",
  67: "Freezing Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Light Showers",
  81: "Showers",
  82: "Heavy Showers",
  85: "Light Snow Showers",
  86: "Snow Showers",
  95: "Thunderstorm",
  96: "Light Thunderstorms With Hail",
  99: "Thunderstorm With Hail",
};

// #endregion
