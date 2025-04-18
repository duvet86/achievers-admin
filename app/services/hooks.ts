import { useCallback, useState } from "react";
import { useMatches } from "react-router";

export function useClientRect<T extends HTMLElement>(): [
  { width: number; height: number },
  (node: T) => void,
] {
  const [rect, setRect] = useState({ width: 0, height: 0 });

  const ref = useCallback((node: T) => {
    if (node !== null) {
      const { width, height } = node.getBoundingClientRect();
      setRect({ width, height });
    }
  }, []);

  return [rect, ref];
}

export const useRouteData = <T>(routeId: string): T => {
  const matches = useMatches();
  const data = matches.find((match) => match.id === routeId)?.data;

  return data as T;
};

export function useLocalStorage<T>(
  key: string,
): [T | null, (newValue: T) => void] {
  if (typeof document === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return [null, () => {}];
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [localStorageValue, setLocalStorageValue] = useState<T | null>(() => {
    const value = window.localStorage.getItem(key);
    if (value === null) {
      return null;
    }

    return JSON.parse(value) as T;
  });

  function setLocalStorageStateValue(newValue: T): void {
    window.localStorage.setItem(key, JSON.stringify(newValue));
    setLocalStorageValue(newValue);
  }

  return [localStorageValue, setLocalStorageStateValue];
}
