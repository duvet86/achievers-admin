// Side-effect module: must be the first import in server.mjs.
// ESM evaluates imports in declaration order, so initialising Azure Monitor
// here runs before express/http are evaluated and lets OpenTelemetry patch them.
// In production the ESM loader hooks are registered via
// `node --import @azure/monitor-opentelemetry/loader` (see the "start" script).
import { initAppInsightsLogger } from "./azure-logger.js";

initAppInsightsLogger();
