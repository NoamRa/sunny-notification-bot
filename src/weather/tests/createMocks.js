// Running this scripts reads data from open meteo's historical-forecast-api
// and saves to openMeteo.mocks.js file.
// Useful when changing which data is read from the API (adding or moving fields)
// Call using `npm run create-mocks`

import { http, passthrough } from "msw";
import { setupServer } from "msw/node";
import fs from "node:fs/promises";
import prettier from "prettier";

import { getWeather } from "../weather.js";

// Change URL from open-meteo's regular API to historical data API
const server = setupServer(
  http.get("https://api.open-meteo.com/v1/dwd-icon", ({ request }) => {
    const newURL = request.url.replace(
      "https://api.open-meteo.com/v1/dwd-icon",
      "https://historical-forecast-api.open-meteo.com/v1/forecast",
    );
    console.log(newURL);
    return fetch(newURL);
  }),

  http.get(
    "https://historical-forecast-api.open-meteo.com/v1/forecast",
    passthrough,
  ),
);
server.listen();

const DATES_TO_GET = [
  { date: "2023-11-13", name: "sunny_morning_2023_11_13" },
  { date: "2023-11-22", name: "sunny_morning_2023_11_22" },
  { date: "2023-11-25", name: "day_without_sun_2023_11_25" },
  { date: "2023-11-26", name: "very_sunny_day_2023_11_26" },
  { date: "2023-11-28", name: "sunny_afternoon_2023_11_28" },
  { date: "2024-12-29", name: "slightly_sunny_morning_2024_12_29" },
];

// assuming running project root
const MOCK_FILE = "./src/weather/tests/openMeteo.mocks.js";

(async function run() {
  console.log("Reading dates for mocks...");
  const mocks = [];
  for (const { date, name } of DATES_TO_GET) {
    console.log(`Requesting ${date} for ${name}`);
    const mock = await getHistoricalWeather(date)
      .then(sortNestedObjectKeys)
      .then((data) => dataToMock(name, data));
    mocks.push(mock);
  }

  const prettierConfig = await prettier.resolveConfig(".prettierrc");
  const formattedData = await prettier.format(mocks.join("\n"), {
    ...prettierConfig,
    parser: "babel",
  });

  await fs.writeFile(MOCK_FILE, formattedData, { encoding: "utf-8" });
  console.log("Done.");
})();

// helpers
function getHistoricalWeather(date) {
  return getWeather(date, { latitude: 52.52, longitude: 13.28 });
}

function dataToMock(name, data) {
  return `export const ${name} = ${JSON.stringify(data, null, 2)};\n`;
}

function sortKeys(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  const sortedObj = {};
  const sortedKeys = Object.keys(obj).sort(); // Sort the keys

  for (const key of sortedKeys) {
    sortedObj[key] = obj[key]; // Assign the value of each key to the new object
  }

  return sortedObj;
}

function sortNestedObjectKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortNestedObjectKeys); // Recursively sort array elements
  }

  if (typeof obj !== "object" || obj === null) {
    return obj; // If it's not an object, return it as is (base case)
  }

  // First, sort the current object's keys
  const sortedObj = sortKeys(obj);

  // Then, recursively sort the keys of all nested objects within the sorted object
  for (const key in sortedObj) {
    if (
      Object.prototype.hasOwnProperty.call(sortedObj, key) &&
      typeof sortedObj[key] === "object"
    ) {
      sortedObj[key] = sortNestedObjectKeys(sortedObj[key]); // Recursively sort nested objects
    }
  }

  return sortedObj;
}
