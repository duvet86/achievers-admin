export function subtractMonths(date, months) {
  const clone = new Date(date);

  clone.setMonth(clone.getMonth() - months);

  return clone;
}

export function trackTrace(message) {
  const client = global.__appinsightsClient__;

  if (client) {
    client?.trackTrace({
      message,
    });
  } else {
    console.warn(message);
  }
}

export function trackException(error) {
  const client = global.__appinsightsClient__;

  if (client) {
    client?.trackException({
      exception: error,
    });
  } else {
    console.error(error);
  }
}
