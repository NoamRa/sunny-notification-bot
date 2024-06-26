import { QueryClient, QueryCache } from "@tanstack/query-core";

const queryClient = new QueryClient({
  queryCache: new QueryCache(),
});

import { logger, serialize } from "../logger.js";
import {
  formatDate,
  formatTime,
  isDaytime,
  isSameHour,
} from "../timeUtils/index.js";
import { clamp, normalizer } from "../utils/index.js";

function getWeatherRequest(date, location) {
  const url = "https://api.open-meteo.com/v1/dwd-icon";
  const d = formatDate(date);
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    hourly: ["weathercode", "cloudcover"].join(","),
    daily: ["sunrise", "sunset"].join(","),
    minutely_15: [
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
  const sunrise = rawData.daily.sunrise[0];
  const sunset = rawData.daily.sunset[0];

  const daytimeFilter = daytimeFilterGenerator(
    sunrise,
    sunset,
    (item) => item.time,
  );

  const minutely15Data = mapTimes(rawData.minutely_15.time, {
    directRadiation: rawData.minutely_15.direct_radiation_instant,
    directNormalIrradiance:
      rawData.minutely_15.direct_normal_irradiance_instant,
  }).filter(daytimeFilter);

  const hourlyData = mapTimes(rawData.hourly.time, {
    cloudCover: rawData.hourly.cloudcover,
    weatherCode: rawData.hourly.weathercode,
  }).filter(daytimeFilter);

  const weatherData = minutely15Data
    .map((minutelyItem) => {
      const hourlyItem = hourlyData.find(({ time }) => {
        return isSameHour(minutelyItem.time, time);
      });
      if (!hourlyItem) {
        // shouldn't happen
        logger.error(
          `Failed to find hourly item for ${JSON.stringify(minutelyItem)}`,
        );
      }

      return {
        // order is important so `time` values wont' be overridden
        ...hourlyItem,
        ...minutelyItem,
      };
    })
    .map(({ time, ...item }) => {
      const score = sunPercent(item);
      return {
        datetime: time,
        date: formatDate(time),
        time: formatTime(time), // overriding the original time field. That's why it was cloned to datetime
        ...item,
        weatherDescription: WEATHER_CODE[item.weatherCode],
        score,
        isSunny: isSunny(score),
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
 * @param {number} parameters.directRadiation - Direct solar radiation on the horizontal plane
 * @param {number} parameters.directNormalIrradiance - Direct solar radiation on the normal plane (perpendicular to the sun)
 * Direct normal irradiance values will be greater than direct ration, especially in the winter when the sun is low
 * @returns {number} score in range 0-100
 */
function sunPercent({ directRadiation, directNormalIrradiance }) {
  const normalizedDNI = normalizer(25, 150)(directRadiation);
  const normalizedDIN = normalizer(50, 400)(directNormalIrradiance);
  return clamp(normalizedDNI * normalizedDIN);
}

/**
 * is it sunny logic
 * @param {number} score in range 0-100
 * @returns {boolean}
 */
function isSunny(score) {
  return score >= 0.6;
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

function daytimeFilterGenerator(sunrise, sunset, getter = (date) => date) {
  return function daytimeFilter(date) {
    return isDaytime(sunrise, sunset, getter(date));
  };
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
