import { useEffect, useState } from "react";

export const DEFAULT_DEBOUNCE_MS = 150;

export const useDebouncedValue = <T>(value: T, delayMs: number = DEFAULT_DEBOUNCE_MS): T => {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};
