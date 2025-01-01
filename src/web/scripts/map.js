import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MAP_ID = "map";

const mapContainerEl = document.getElementById("map-container");
mapContainerEl.style = style({
  position: "relative",
  width: "400px",
  height: "300px",
});
mapContainerEl.appendChild(
  Object.assign(document.createElement("div"), {
    id: MAP_ID,
    style: style({
      position: "relative",
      height: "100%",
    }),
  }),
);
mapContainerEl.appendChild(
  Object.assign(document.createElement("div"), {
    id: "map-marker",
    style: style({
      "background-image": `url("../assets/marker.svg")`,
      "background-repeat": "no-repeat",
      width: "50px",
      height: "60px",
      position: "absolute",
      "z-index": "401", // above map
      left: "calc(50% - 25px)",
      top: "calc(50% - 60px)",
      transition: "all 0.4s ease",
    }),
  }),
);

export const map = L.map(MAP_ID);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  subdomains: ["a", "b", "c"],
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

function style(object) {
  return Object.entries(object)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}
