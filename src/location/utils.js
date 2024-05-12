import { isBetweenNumbers } from "../utils/index.js";

export function isLocationValid(location) {
  return (
    location &&
    typeof location === "object" &&
    Object.keys(location).length === 2 &&
    typeof location.longitude === "number" &&
    typeof location.latitude === "number"
  );
}

/**
 * Germany bounding box approx
 * 5.449219,47.219568,14.567871,54.737308
 */
const GERMANY_BBOX = {
  north: 54.737308,
  south: 47.219568,
  east: 14.567871,
  west: 5.449219,
};
export function isLocationInGermany({ longitude, latitude }) {
  return (
    isBetweenNumbers(GERMANY_BBOX.west, longitude, GERMANY_BBOX.east) &&
    isBetweenNumbers(GERMANY_BBOX.south, latitude, GERMANY_BBOX.north)
  );
}

export function parseLocationString(payload) {
  if (!payload || typeof payload !== "string") return null;

  try {
    const separator = payload.includes(",") ? "," : " ";
    const parsed = payload
      .split(separator)
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => Number(v))
      .filter((n) => !isNaN(n));

    if (!Array.isArray(parsed) || parsed.length !== 2) return null;

    return { latitude: parsed[0], longitude: parsed[1] };
  } catch (err) {
    return null;
  }
}
