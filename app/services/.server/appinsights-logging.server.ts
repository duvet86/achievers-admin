import type appInsights from "applicationinsights";

declare global {
  var __appinsightsClient__: appInsights.TelemetryClient | undefined;
}

const client = global.__appinsightsClient__;

export function trackTrace(telemetry: appInsights.Contracts.TraceTelemetry) {
  client?.trackTrace(telemetry);
}

export function trackException(
  telemetry: appInsights.Contracts.ExceptionTelemetry,
) {
  client?.trackException(telemetry);
}
