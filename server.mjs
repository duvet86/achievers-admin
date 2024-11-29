/*eslint-env node*/
import {
  initAppInsightsLogger,
  trackEvent,
  mockTime,
} from "./server-utils/index.js";

import express from "express";
import compression from "compression";
import morgan from "morgan";

import sourceMapSupport from "source-map-support";

initAppInsightsLogger();
sourceMapSupport.install();

if (process.env.CI) {
  mockTime();
}

if (process.env.ENABLE_EMAIL_REMINDERS === "true") {
  import("./background-jobs/index.js").then(() => {
    trackEvent("EMAIL_REMINDERS_ENABLED");
  });
}

const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();

app.use(compression());
app.disable("x-powered-by");

if (DEVELOPMENT) {
  console.log("Starting development server");
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    }),
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule("./server-dev/app.ts");
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  const BUILD_PATH = "./build/server/index.js";

  console.log("Starting production server");
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
  app.use(express.static("build/client", { maxAge: "1h" }));
  app.use(await import(BUILD_PATH).then((mod) => mod.app));
}

app.use(morgan("tiny"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
