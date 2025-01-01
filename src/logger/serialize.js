export function serialize(something) {
  if (something instanceof Date) {
    return something.toISOString();
  } else if (something instanceof Error) {
    return something.toString();
  } else if (typeof something === "function") {
    return something.toString();
  } else if (something instanceof Promise) {
    return "Can't serialize a promise";
  } else if (something instanceof Response) {
    return `Request failed with ${something.status} (${something.statusText}). URL: ${something.url}`;
  }
  return JSON.stringify(something);
}
