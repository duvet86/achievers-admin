import type { AsyncLocalStorage } from "node:async_hooks";
import type { Tracer, Attributes, Span } from "@opentelemetry/api";

import { SpanStatusCode, trace } from "@opentelemetry/api";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";

declare global {
  var __appinsightsTracer__: Tracer | undefined;
  // Set by the nameRequestSpan middleware (server-utils/azure-logger.js).
  var __requestSpanStorage__: AsyncLocalStorage<Span> | undefined;
}

// Attribute the Azure Monitor exporter maps a log record to the `customEvents` table.
const CUSTOM_EVENT_NAME = "microsoft.custom_event.name";

// Drop unset values, otherwise they're exported as the string "undefined".
function definedOnly(properties?: Attributes): Attributes {
  return Object.fromEntries(
    Object.entries(properties ?? {}).filter(([, v]) => v !== undefined),
  );
}

/**
 * Records a custom event (App Insights `customEvents` table), correlated with
 * the current request when there is one.
 */
export function trackEvent(name: string, properties?: Attributes) {
  if (!global.__appinsightsTracer__) {
    console.info(name, properties ?? "");
    return;
  }

  logs.getLogger("achievers").emit({
    severityNumber: SeverityNumber.INFO,
    body: name,
    attributes: { ...definedOnly(properties), [CUSTOM_EVENT_NAME]: name },
  });
}

/**
 * Records an exception (App Insights `exceptions` table) with message and stack.
 * Attached to the active request span so it shows up in that request's
 * end-to-end transaction; falls back to a standalone span outside a request.
 */
export function trackException(error: unknown, properties?: Attributes) {
  const err = error instanceof Error ? error : new Error(String(error));
  const tracer = global.__appinsightsTracer__;

  if (!tracer) {
    console.error(err, properties ?? "");
    return;
  }

  // Same shape as span.recordException(), plus our properties: the exporter
  // turns the event's attributes into the exception's customDimensions.
  const exceptionEvent: Attributes = {
    ...definedOnly(properties),
    "exception.type": err.name,
    "exception.message": err.message,
    "exception.stacktrace": err.stack,
  };

  // Prefer the request span: after an awaited call fails, the "active" span can be
  // a child that has already ended (e.g. a Prisma operation).
  const activeSpan = [
    global.__requestSpanStorage__?.getStore(),
    trace.getActiveSpan(),
  ].find((span) => span?.isRecording());

  if (activeSpan) {
    // Don't set the request span's status here: the request may still succeed
    // (e.g. a caught error), and its outcome is derived from the HTTP status.
    activeSpan.addEvent("exception", exceptionEvent);
    return;
  }

  tracer.startActiveSpan("trackException", (span) => {
    span.addEvent("exception", exceptionEvent);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    span.end();
  });
}
