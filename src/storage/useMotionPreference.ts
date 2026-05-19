import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'onebreath:prefs:motionV1';

export type MotionMode = 'system' | 'on' | 'off';
export const MOTION_DEFAULT: MotionMode = 'on';

const isMotionMode = (v: unknown): v is MotionMode =>
  v === 'system' || v === 'on' || v === 'off';

// Module-level store so every component that calls useMotionPreference shares
// the same value and is re-rendered when the preference changes. Without this
// each call site had its own useState copy, so toggling the pref on the
// Settings tab wouldn't update the orb on the Hold tab.
type StoreState = { mode: MotionMode; loaded: boolean };
let state: StoreState = { mode: MOTION_DEFAULT, loaded: false };
const subscribers = new Set<() => void>();

const emit = () => subscribers.forEach((cb) => cb());

const subscribe = (cb: () => void) => {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
};

const getSnapshot = () => state;

let hydratePromise: Promise<void> | null = null;
const hydrate = () => {
  if (hydratePromise) return hydratePromise;
  hydratePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (isMotionMode(raw)) {
        state = { mode: raw, loaded: true };
      } else {
        state = { ...state, loaded: true };
      }
    } catch {
      state = { ...state, loaded: true };
    } finally {
      emit();
    }
  })();
  return hydratePromise;
};

const setModeGlobal = (next: MotionMode) => {
  if (state.mode === next && state.loaded) return;
  state = { mode: next, loaded: true };
  emit();
  AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
};

export function useMotionPreference() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!state.loaded) hydrate();
  }, []);

  const setMode = useCallback((next: MotionMode) => setModeGlobal(next), []);

  return { mode: snap.mode, setMode, loaded: snap.loaded };
}
