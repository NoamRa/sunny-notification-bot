import {
  getWeather,
  getSunnyRanges,
  explainWeatherRange,
} from "../../weather/index.js";
import { localStorageLocation } from "./localStorage.js";

import { map } from "./map.js";

async function getWeatherMessage(date, location) {
  return getWeather(date, location)
    .then(getSunnyRanges)
    .then((ranges) =>
      ranges.length === 0
        ? "No sun today. Sorry"
        : ranges.map(explainWeatherRange),
    );
}

function setMessage(message) {
  document.getElementById("result").innerText = message;
}

function main() {
  const location = localStorageLocation.getItem({
    latitude: 52.47,
    longitude: 13.4,
  });

  map.setView([location.latitude, location.longitude], 13);

  getWeatherMessage(new Date(), location).then(setMessage);

  map.on("moveend", () => {
    const { lat: latitude, lng: longitude } = map.getCenter();
    const location = { latitude, longitude };
    getWeatherMessage(new Date(), location).then(setMessage);
    localStorageLocation.setItem(location);
  });
}
main();
