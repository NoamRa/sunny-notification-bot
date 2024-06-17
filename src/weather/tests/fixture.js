import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { sunny_morning_2023_11_22 } from "./openMeteo.mocks.js";

export const setup = () => {
  let requestCounter = 0;

  const server = setupServer(
    http.get("https://api.open-meteo.com/v1/dwd-icon", ({ request }) => {
      requestCounter += 1;
      const signal = new URL(request.url).searchParams.get("latitude");
      if (signal === "fail") {
        throw new HttpResponse("don't care :(", { status: 567 });
      }
      return HttpResponse.json(sunny_morning_2023_11_22);
    }),
  );
  server.listen();

  return {
    counter: () => requestCounter,
    close: () => server.close(),
  };
};
