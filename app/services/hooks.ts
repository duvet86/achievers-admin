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
