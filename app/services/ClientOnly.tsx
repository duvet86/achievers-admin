import { useSyncExternalStore } from "react";

function subscribe() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return () => {};
}

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function ClientOnly({
  children,
  fallback = null,
}: {
  children(): React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return useHydrated() ? <>{children()}</> : <>{fallback}</>;
}
