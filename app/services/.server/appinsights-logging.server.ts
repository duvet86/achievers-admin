import type { Tracer, Attributes } from "@opentelemetry/api";

declare global {
  var __appinsightsTracer__: Tracer | undefined;
}

export function trackEvent(message: string, properties?: Attributes) {
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

export function trackException(error: Error) {
  const tracer = global.__appinsightsTracer__;

  if (tracer) {
    const span = tracer.startSpan("exception");
    span.recordException(error);
    span.end();
  } else {
    console.error(error.message);
  }
}
