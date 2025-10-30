import type { Tracer, Attributes } from "@opentelemetry/api";

import { SpanStatusCode } from "@opentelemetry/api";

declare global {
  var __appinsightsTracer__: Tracer | undefined;
}

export function trackEvent(message: string, properties?: Attributes) {
  const tracer = global.__appinsightsTracer__;

  if (tracer) {
    tracer.startActiveSpan("exception", { attributes: properties }, (span) => {
      span.addEvent(message);
      span.end();
    });
  } else {
    console.warn(message);
  }
}

export function trackException(error: Error, properties?: Attributes) {
  const tracer = global.__appinsightsTracer__;

  if (tracer) {
    tracer.startActiveSpan("exception", { attributes: properties }, (span) => {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.end();
    });
  } else {
    console.error(error.message);
  }
}
