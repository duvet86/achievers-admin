import { useCallback, useState } from "react";

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
