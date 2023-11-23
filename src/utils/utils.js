export function lines(...lines) {
  return lines.join("\n");
}

export function isBetweenNumbers(start, end, num) {
  return start <= num && num <= end;
}

export function clamp(value, min = 0, max = 1) {
  if (
    typeof value !== "number" ||
    typeof min !== "number" ||
    typeof max !== "number"
  ) {
    return NaN; // Return NaN if any of the inputs are not numbers
  }
  if (min > max) {
    return NaN; // Return NaN if the range is invalid
  }
  return Math.max(min, Math.min(value, max));
}

export function normalizer(min, max) {
  return function normalize(value) {
    if (min > max) return NaN;
    return (value - min) / (max - min);
  };
}
