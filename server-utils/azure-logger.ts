/*eslint-env node*/
import type { Attributes, Exception } from "@opentelemetry/api";

export async function initAppInsightsLoggerAsync() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  await import("@azure/monitor-opentelemetry").then(({ useAzureMonitor }) => {
    useAzureMonitor();
  });
  await import("@opentelemetry/api").then(({ trace }) => {
    global.__appinsightsTracer__ = trace.getTracer("appTracer");
  });
}

export function trackEvent(message: string, properties: Attributes) {
  const tracer = global.__appinsightsTracer__;

  if (tracer) {
    const span = tracer.startSpan("trace");
    span.addEvent(message);
    if (properties) {
      span.setAttributes(properties);
    }
    span.end();
  } else {
    console.warn(message);
  }
}

export function trackException(error: Exception) {
  const tracer = global.__appinsightsTracer__;

  if (tracer) {
    const span = tracer.startSpan("exception");
    span.recordException(error);
    span.end();
  } else {
    console.error(error.toString());
  }
}
