import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Returns the elapsed seconds since `startedAt`, recomputed on a UI tick.
 * Uses Date-based math so it remains accurate across backgrounding.
 */
export function useElapsed(startedAt: number | null, intervalMs: number = 50): number {
  const [now, setNow] = useState<number>(Date.now());
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (startedAt == null) {
      if (ref.current) clearInterval(ref.current);
      ref.current = null;
      return;
    }
    setNow(Date.now());
    ref.current = setInterval(() => setNow(Date.now()), intervalMs);
    return () => {
      if (ref.current) clearInterval(ref.current);
      ref.current = null;
    };
  }, [startedAt, intervalMs]);

  if (startedAt == null) return 0;
  return Math.max(0, (now - startedAt) / 1000);
}

export function useStable<T>(value: T): { current: T; set: (v: T) => void } {
  const [v, setV] = useState(value);
  const setStable = useCallback((next: T) => setV(next), []);
  return { current: v, set: setStable };
}
