/*eslint-env node*/
import { useAzureMonitor } from "@azure/monitor-opentelemetry";
import { trace } from "@opentelemetry/api";

export function initAppInsightsLogger() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  console.log("Connected to app insights.");

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAzureMonitor();

  global.__appinsightsTracer__ = trace.getTracer("appTracer");
}

export function trackEvent(message, properties) {
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

export function trackException(error) {
  const tracer = global.__appinsightsTracer__;

  if (tracer) {
    const span = tracer.startSpan("exception");
    span.recordException(error);
    span.end();
  } else {
    console.error(error.message);
  }
}
