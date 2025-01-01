import {
  getWeather,
  getSunnyRanges,
  explainWeatherRange,
} from "../../weather/index.js";
import { resolveDate } from "../../timeUtils/index.js";

import { localStorageLocation } from "./localStorage.js";

import { map } from "./map.js";

async function getWeatherMessage(date, location) {
  return getWeather(date, location)
    .then(getSunnyRanges)
    .then((ranges) =>
      ranges.length === 0
        ? "No sun... Sorry :("
        : ranges.map(explainWeatherRange),
    );
}

function setMessage(message) {
  document.getElementById("result").innerText = message;
}

const dateSelect = document.getElementById("date");
function getSelectedDate() {
  return resolveDate(parseInt(dateSelect.value));
}

function main() {
  const location = localStorageLocation.getItem({
    latitude: 52.47,
    longitude: 13.4,
  });

  map.setView([location.latitude, location.longitude], 10);

  getWeatherMessage(getSelectedDate(), location).then(setMessage);

  map.on("moveend", () => {
    const { lat: latitude, lng: longitude } = map.getCenter();
    const location = { latitude, longitude };
    getWeatherMessage(getSelectedDate(), location).then(setMessage);
    localStorageLocation.setItem(location);
  });

  dateSelect.addEventListener("change", () => {
    getWeatherMessage(getSelectedDate(), location).then(setMessage);
  });
}
main();
