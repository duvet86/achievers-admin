import type appInsights from "applicationinsights";

declare global {
  var __appinsightsClient__: appInsights.TelemetryClient | undefined;
}

export function trackTrace(telemetry: appInsights.Contracts.TraceTelemetry) {
  const client = global.__appinsightsClient__;

  if (client) {
    client.trackTrace(telemetry);
  } else {
    console.warn(telemetry.message);
  }
}

export function trackException(
  telemetry: appInsights.Contracts.ExceptionTelemetry,
) {
  const client = global.__appinsightsClient__;

  if (client) {
    client.trackException(telemetry);
  } else {
    console.error(telemetry.exception);
  }
}
