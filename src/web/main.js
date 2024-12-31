import {
  getWeather,
  getSunnyRanges,
  explainWeatherRange,
} from "../weather/index.js";

const location = { latitude: 52.52, longitude: 13.28 };

await getWeather(new Date(), location)
  .then(getSunnyRanges)
  .then((ranges) => ranges.map(explainWeatherRange))
  .then((message) => {
    console.log(message);
    document.getElementById("content").innerText = message;
  });
