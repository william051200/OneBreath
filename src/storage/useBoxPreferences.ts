import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'onebreath:prefs:boxV1';

export const BOX_SECONDS_MIN = 3;
export const BOX_SECONDS_MAX = 8;
export const BOX_SECONDS_DEFAULT = 4;
export const BOX_ROUNDS_MIN = 1;
export const BOX_ROUNDS_MAX = 20;
export const BOX_ROUNDS_DEFAULT = 4;

export type BoxPrefs = {
  seconds: number;
  rounds: number;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(n)));

export function useBoxPreferences() {
  const [prefs, setPrefs] = useState<BoxPrefs>({
    seconds: BOX_SECONDS_DEFAULT,
    rounds: BOX_ROUNDS_DEFAULT,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as Partial<BoxPrefs>;
          setPrefs({
            seconds: clamp(parsed.seconds ?? BOX_SECONDS_DEFAULT, BOX_SECONDS_MIN, BOX_SECONDS_MAX),
            rounds: clamp(parsed.rounds ?? BOX_ROUNDS_DEFAULT, BOX_ROUNDS_MIN, BOX_ROUNDS_MAX),
          });
        }
      } catch {
        // ignore — fall back to defaults
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: BoxPrefs) => {
    setPrefs(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setSeconds = useCallback(
    (n: number) => persist({ ...prefs, seconds: clamp(n, BOX_SECONDS_MIN, BOX_SECONDS_MAX) }),
    [prefs, persist]
  );
  const setRounds = useCallback(
    (n: number) => persist({ ...prefs, rounds: clamp(n, BOX_ROUNDS_MIN, BOX_ROUNDS_MAX) }),
    [prefs, persist]
  );

  return {
    seconds: prefs.seconds,
    rounds: prefs.rounds,
    loaded,
    setSeconds,
    setRounds,
    incrementSeconds: () => setSeconds(prefs.seconds + 1),
    decrementSeconds: () => setSeconds(prefs.seconds - 1),
    incrementRounds: () => setRounds(prefs.rounds + 1),
    decrementRounds: () => setRounds(prefs.rounds - 1),
    canIncrementSeconds: prefs.seconds < BOX_SECONDS_MAX,
    canDecrementSeconds: prefs.seconds > BOX_SECONDS_MIN,
    canIncrementRounds: prefs.rounds < BOX_ROUNDS_MAX,
    canDecrementRounds: prefs.rounds > BOX_ROUNDS_MIN,
  };
}
