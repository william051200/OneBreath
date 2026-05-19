import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'onebreath:prefs:motionV1';

export type MotionMode = 'system' | 'on' | 'off';
export const MOTION_DEFAULT: MotionMode = 'on';

const isMotionMode = (v: unknown): v is MotionMode =>
  v === 'system' || v === 'on' || v === 'off';

export function useMotionPreference() {
  const [mode, setModeState] = useState<MotionMode>(MOTION_DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && isMotionMode(raw)) {
          setModeState(raw);
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

  const setMode = useCallback((next: MotionMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  return { mode, setMode, loaded };
}
