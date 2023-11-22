export function lines(...lines) {
  return lines.join("\n");
}

export function isBetweenNumbers(start, end, num) {
  return start <= num && num <= end;
}
