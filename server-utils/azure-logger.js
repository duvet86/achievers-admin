/*eslint-env node*/
import { useAzureMonitor } from "@azure/monitor-opentelemetry";
import { trace } from "@opentelemetry/api";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { MySQLInstrumentation } from "@opentelemetry/instrumentation-mysql";

export function initAppInsightsLogger() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAzureMonitor();
  registerInstrumentations({
    instrumentations: [
      // Express instrumentation expects HTTP layer to be instrumented
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new MySQLInstrumentation(),
    ],
  });

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
