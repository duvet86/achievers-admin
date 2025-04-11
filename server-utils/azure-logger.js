/*eslint-env node*/

export async function initAppInsightsLoggerAsync() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const { useAzureMonitor } = await import("@azure/monitor-opentelemetry");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAzureMonitor();

  const { trace } = await import("@opentelemetry/api");
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
