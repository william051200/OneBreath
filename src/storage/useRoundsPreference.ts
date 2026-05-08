import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'onebreath:prefs:roundsV1';

export const ROUNDS_MIN = 1;
export const ROUNDS_MAX = 8;
export const ROUNDS_DEFAULT = 3;

const clamp = (n: number) =>
  Math.max(ROUNDS_MIN, Math.min(ROUNDS_MAX, Math.round(n)));

export function useRoundsPreference() {
  const [rounds, setRoundsState] = useState<number>(ROUNDS_DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? Number(raw) : NaN;
        if (!cancelled && Number.isFinite(parsed)) {
          setRoundsState(clamp(parsed));
        }
      } catch {
        // ignore — fall back to default
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setRounds = useCallback((next: number) => {
    const value = clamp(next);
    setRoundsState(value);
    AsyncStorage.setItem(STORAGE_KEY, String(value)).catch(() => {});
  }, []);

  const increment = useCallback(() => setRounds(rounds + 1), [rounds, setRounds]);
  const decrement = useCallback(() => setRounds(rounds - 1), [rounds, setRounds]);

  return {
    rounds,
    setRounds,
    increment,
    decrement,
    loaded,
    canIncrement: rounds < ROUNDS_MAX,
    canDecrement: rounds > ROUNDS_MIN,
    min: ROUNDS_MIN,
    max: ROUNDS_MAX,
  };
}
