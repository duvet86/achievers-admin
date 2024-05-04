export function initAppInsights(appInsights) {
  appInsights.setup().start();

  global.__appinsightsClient__ = appInsights.defaultClient;
}

export function trackEvent(message) {
  const client = global.__appinsightsClient__;

  if (client) {
    client.trackEvent({
      message,
    });
  } else {
    console.warn(message);
  }
}

export function trackTrace(message) {
  const client = global.__appinsightsClient__;

  if (client) {
    client.trackTrace({
      message,
    });
  } else {
    console.warn(message);
  }
}

export function trackException(exception) {
  const client = global.__appinsightsClient__;

  if (client) {
    client.trackException({
      exception,
    });
  } else {
    console.error(exception);
  }
}
