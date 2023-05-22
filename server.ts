import path from "node:path";

import * as appInsights from "applicationinsights";

import express from "express";
import compression from "compression";
import morgan from "morgan";

import { broadcastDevReady } from "@remix-run/node";
import { createRequestHandler } from "@remix-run/express";

import { prisma } from "./app/db.server";

declare global {
  var __appinsightsClient__: appInsights.TelemetryClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  appInsights.setup().start();

  global.__appinsightsClient__ = appInsights.defaultClient;
}

const BUILD_DIR = path.join(process.cwd(), "build");
const build = require(BUILD_DIR);
const port = process.env.PORT || 3000;

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => {
        purgeRequireCache();

        return createRequestHandler({
          build,
          mode: process.env.NODE_ENV,
        })(req, res, next);
      }
    : createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
      })
);

const server = app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);

  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(build);
  }
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");

  server.close(() => {
    console.log("HTTP server closed");

    prisma.$disconnect().then(() => {
      console.log("DB connection closed");
    });
  });
});

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
