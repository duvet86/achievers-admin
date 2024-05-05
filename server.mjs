/* eslint-disable no-undef */
import * as appInsights from "applicationinsights";

import express from "express";
import compression from "compression";
import morgan from "morgan";

import { installGlobals } from "@remix-run/node";
import { createRequestHandler } from "@remix-run/express";
import sourceMapSupport from "source-map-support";

import { initAppInsights, trackEvent } from "./server-utils/utils.js";

sourceMapSupport.install();
installGlobals({ nativeFetch: true });

if (process.env.NODE_ENV === "production") {
  initAppInsights(appInsights);
}

if (process.env.ENABLE_EMAIL_REMINDERS) {
  import("./background-jobs/index.js").then(() => {
    trackEvent("EMAIL_REMINDERS_ENABLED");
  });
}

const port = process.env.PORT || 3000;

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
    : await import("./build/server/index.js"),
});

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(morgan("tiny"));

// handle SSR requests
app.all("*", remixHandler);

app.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`),
);
