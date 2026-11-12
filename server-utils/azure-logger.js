import { AsyncLocalStorage } from "node:async_hooks";

import { useAzureMonitor } from "@azure/monitor-opentelemetry";
import { trace } from "@opentelemetry/api";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { PrismaInstrumentation } from "@prisma/instrumentation";

// On `global` so the bundled app code (appinsights-logging.server.ts) shares it.
const requestSpanStorage = (global.__requestSpanStorage__ ??=
  new AsyncLocalStorage());

const SDK_PATHS = [
  "/v2.1/track",
  "/v2/track",
  "/QuickPulseService.svc",
  "/AzMonSDKDynamicConfiguration",
  "/metadata/instance",
];

export function initAppInsightsLogger() {
  if (process.env.NODE_ENV !== "production" || global.__appinsightsTracer__) {
    return;
  }

  // Shows as cloud_RoleName in App Insights (otherwise "unknown_service:node").
  process.env.OTEL_SERVICE_NAME ??= "achievers-webapp";

  useAzureMonitor({
    instrumentationOptions: {
      http: {
        enabled: true,
        // Don't record the SDK's own traffic (telemetry uploads, live metrics,
        // config polling, VM metadata probe) as dependencies.
        ignoreOutgoingRequestHook: (options) =>
          SDK_PATHS.some((p) => (options.path ?? "").startsWith(p)),
      },
      // Off: it traces the exporter's own uploads ("POST /v2.1/track") on every
      // flush. Azure SDK calls (e.g. Blob Storage) are still recorded as HTTP
      // dependencies by the http instrumentation above.
      azureSdk: { enabled: false },
      // Send console.warn / console.error output to the `traces` table.
      console: { enabled: true, logSeverity: SeverityNumber.WARN },
    },
  });

  // Prisma queries as `dependencies` under each request: keep "operation"
  // (model + action, total time) and "db_query" (SQL); drop the internal steps.
  registerInstrumentations({
    instrumentations: [
      new PrismaInstrumentation({
        ignoreSpanTypes: [
          "prisma:client:compile",
          "prisma:client:serialize",
          "prisma:client:connect",
        ],
      }),
    ],
  });

  global.__appinsightsTracer__ = trace.getTracer("appTracer");

  console.log("Connected to app insights.");
}

/**
 * Express middleware: the HTTP instrumentation names server spans just "GET"/"POST".
 * Rename them "METHOD /path" so the App Insights `requests` table is readable.
 */
export function nameRequestSpan(req, _res, next) {
  const span = trace.getActiveSpan();
  if (!span) {
    return next();
  }

  span.updateName(`${req.method} ${req.path}`);
  // Lets trackException attach to the request span from anywhere in the request.
  requestSpanStorage.run(span, next);
}
