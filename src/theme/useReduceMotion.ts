import { useReducedMotion } from 'react-native-reanimated';
import { useMotionPreference } from '../storage/useMotionPreference';

/**
 * Resolves whether the app should fall back to reduced-motion behaviour.
 *
 * Order of precedence:
 *  - `on`     → animations always on (returns false), even if the OS asks
 *               us to reduce motion. This is the default, because on
 *               Android Chrome the system "Remove animations" setting flips
 *               `prefers-reduced-motion: reduce` and would otherwise freeze
 *               every animation in the app.
 *  - `off`    → animations always off (returns true).
 *  - `system` → defer to the OS / browser reduced-motion signal.
 *
 * While the stored preference is still loading we default to "motion on"
 * to avoid a jarring static first frame.
 */
export function useReduceMotion(): boolean {
  const system = useReducedMotion();
  const { mode, loaded } = useMotionPreference();
  if (!loaded) return false;
  if (mode === 'on') return false;
  if (mode === 'off') return true;
  return system;
}
