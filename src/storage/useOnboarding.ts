import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'onebreath:onboarding:v1';

export function useOnboarding() {
  const [seen, setSeen] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled) setSeen(raw === '1');
      } catch {
        // ignore — assume unseen
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markSeen = useCallback(() => {
    setSeen(true);
    AsyncStorage.setItem(STORAGE_KEY, '1').catch(() => {});
  }, []);

  const reset = useCallback(() => {
    setSeen(false);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  return { seen, loaded, markSeen, reset };
}
