// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function debounce<T extends Function>(callback: T, wait = 500) {
  let timeoutId: number | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
      callback(...args);
    }, wait);
  };
}
