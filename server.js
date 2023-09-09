import { statSync } from "node:fs";
import { randomBytes } from "node:crypto";

import * as appInsights from "applicationinsights";

import chokidar from "chokidar";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { broadcastDevReady, installGlobals } from "@remix-run/node";
import { createRequestHandler } from "@remix-run/express";
import sourceMapSupport from "source-map-support";

sourceMapSupport.install();
installGlobals();

if (process.env.NODE_ENV === "production") {
  appInsights.setup().start();

  global.__appinsightsClient__ = appInsights.defaultClient;
}

const port = process.env.PORT || 3000;
const BUILD_PATH = "./build/index.js";
let build = await import(BUILD_PATH);

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" }),
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.use((req, res, next) => {
  res.locals.cspNonce = randomBytes(16).toString("hex");
  next();
});
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        connectSrc:
          process.env.NODE_ENV === "development" ? ["ws:", "'self'"] : null,
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
      },
    },
  }),
);

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? createDevRequestHandler()
    : createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
        getLoadContext: (req, res) => ({
          cspNonce: res.locals.cspNonce,
        }),
      }),
);

app.listen(port, async () => {
  console.log(`Express server listening on port ${port}`);

  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(build);
  }
});

function createDevRequestHandler() {
  const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true });

  watcher.on("all", async () => {
    // 1. purge require cache && load updated server build
    const stat = statSync(BUILD_PATH);
    build = import(BUILD_PATH + "?t=" + stat.mtimeMs);
    // 2. tell dev server that this app server is now ready
    broadcastDevReady(await build);
  });

  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build: await build,
        mode: "development",
        getLoadContext: (req, res) => ({
          cspNonce: res.locals.cspNonce,
        }),
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
