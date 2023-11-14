export function lines(...lines) {
  return lines.join("\n");
}

export function isBetweenNumbers(start, end, num, inclusive = true) {
  return inclusive ? start <= num && num <= end : start < num && num < end;
}
