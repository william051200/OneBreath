import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import type { OrbState } from '../components/BreathingOrb';

export type BoxPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

const PHASE_ORDER: BoxPhase[] = ['inhale', 'holdIn', 'exhale', 'holdOut'];

export type BoxState =
  | { kind: 'idle' }
  | { kind: 'running'; round: number; phase: BoxPhase; remaining: number }
  | { kind: 'finished'; rounds: number };

type Args = { seconds: number; rounds: number };

export function useBoxBreathing({ seconds, rounds }: Args) {
  const [state, setState] = useState<BoxState>({ kind: 'idle' });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => stopInterval, [stopInterval]);

  const start = useCallback(() => {
    stopInterval();
    setState({ kind: 'running', round: 1, phase: 'inhale', remaining: seconds });
    Haptics.selectionAsync().catch(() => {});

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.kind !== 'running') return prev;
        if (prev.remaining > 1) {
          return { ...prev, remaining: prev.remaining - 1 };
        }
        const phaseIndex = PHASE_ORDER.indexOf(prev.phase);
        const nextPhaseIndex = (phaseIndex + 1) % PHASE_ORDER.length;
        const advanceRound = nextPhaseIndex === 0;
        const nextRound = advanceRound ? prev.round + 1 : prev.round;
        if (advanceRound && nextRound > rounds) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          return { kind: 'finished', rounds };
        }
        Haptics.selectionAsync().catch(() => {});
        return {
          kind: 'running',
          round: nextRound,
          phase: PHASE_ORDER[nextPhaseIndex],
          remaining: seconds,
        };
      });
    }, 1000);
  }, [seconds, rounds, stopInterval]);

  const reset = useCallback(() => {
    stopInterval();
    setState({ kind: 'idle' });
  }, [stopInterval]);

  let orbState: OrbState = 'idle';
  if (state.kind === 'running') {
    if (state.phase === 'inhale') orbState = 'inhale';
    else if (state.phase === 'exhale') orbState = 'exhale';
    else orbState = 'holding';
  } else if (state.kind === 'finished') {
    orbState = 'released';
  }

  return { state, start, reset, orbState };
}

export function phaseLabel(phase: BoxPhase): string {
  switch (phase) {
    case 'inhale':
      return 'Breathe in';
    case 'holdIn':
      return 'Hold';
    case 'exhale':
      return 'Breathe out';
    case 'holdOut':
      return 'Hold';
  }
}
