import { logger } from "./logger.js";
import { formatDate, formatTime, isDaytime, isSameHour } from "./timeUtils.js";

function getWeather(date) {
  const url = "https://api.open-meteo.com/v1/dwd-icon";
  const d = formatDate(date);
  const params = new URLSearchParams({
    latitude: 52.5167,
    longitude: 13.2833,
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
    .then((res) => res.json())
    .catch(logger.error);
}

export async function getSunnyRanges(date) {
  const rawData = await getWeather(date);

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
      const score = scoreWeather(item);
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

function scoreWeather({ directRadiation, directNormalIrradiance }) {
  // directRadiation - Direct solar radiation on the horizontal plane
  // directNormalIrradiance - Direct solar radiation on the normal plane (perpendicular to the sun)
  // Direct normal irradiance values will be greater than direct ration, especially in the winter when the sun is low

  const normalizedDNI = normalizer(50, 200)(directRadiation);
  const normalizedDIN = normalizer(100, 350)(directNormalIrradiance);

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

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(value, max));
}

function normalizer(min, max) {
  return function normalize(value) {
    return (value - min) / (max - min);
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
  return `${weatherRange.start.time} -> ${weatherRange.end.time} (${weatherRange.start.weatherDescription})`;
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
