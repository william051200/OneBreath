import { useCallback, useEffect, useRef, useState } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { OrbState } from '../components/BreathingOrb';

export type TimerPhase =
  | { kind: 'idle' }
  | { kind: 'breatheUp'; round: number; total: number; action: 'inhale' | 'exhale' }
  | { kind: 'ready' }
  | { kind: 'holding'; startedAt: number }
  | { kind: 'finished'; duration: number };

const INHALE_MS = 4000;
const EXHALE_MS = 6000;

export function useTimerMachine(initialRounds = 3) {
  const [phase, setPhase] = useState<TimerPhase>({ kind: 'idle' });
  const [rounds, setRounds] = useState(initialRounds);
  const breatheTask = useRef<{ cancelled: boolean } | null>(null);

  const cancelBreatheUp = useCallback(() => {
    if (breatheTask.current) breatheTask.current.cancelled = true;
    breatheTask.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cancelBreatheUp();
      deactivateKeepAwake().catch(() => {});
    };
  }, [cancelBreatheUp]);

  const startBreatheUp = useCallback(() => {
    cancelBreatheUp();
    const token = { cancelled: false };
    breatheTask.current = token;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    (async () => {
      for (let r = 1; r <= rounds; r++) {
        if (token.cancelled) return;
        setPhase({ kind: 'breatheUp', round: r, total: rounds, action: 'inhale' });
        await wait(INHALE_MS);
        if (token.cancelled) return;
        setPhase({ kind: 'breatheUp', round: r, total: rounds, action: 'exhale' });
        await wait(EXHALE_MS);
      }
      if (!token.cancelled) setPhase({ kind: 'ready' });
    })();
  }, [rounds, cancelBreatheUp]);

  const skipToReady = useCallback(() => {
    cancelBreatheUp();
    setPhase({ kind: 'ready' });
  }, [cancelBreatheUp]);

  const beginHold = useCallback(async () => {
    setPhase({ kind: 'holding', startedAt: Date.now() });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
    activateKeepAwakeAsync('onebreath-hold').catch(() => {});
  }, []);

  const releaseHold = useCallback(() => {
    setPhase((p) => {
      if (p.kind !== 'holding') return p;
      const duration = (Date.now() - p.startedAt) / 1000;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      deactivateKeepAwake('onebreath-hold').catch(() => {});
      return { kind: 'finished', duration };
    });
  }, []);

  const reset = useCallback(() => {
    cancelBreatheUp();
    deactivateKeepAwake('onebreath-hold').catch(() => {});
    setPhase({ kind: 'idle' });
  }, [cancelBreatheUp]);

  const orbState: OrbState =
    phase.kind === 'idle'
      ? 'idle'
      : phase.kind === 'breatheUp'
      ? phase.action
      : phase.kind === 'ready'
      ? 'inhale'
      : phase.kind === 'holding'
      ? 'holding'
      : 'released';

  return {
    phase,
    rounds,
    setRounds,
    orbState,
    startBreatheUp,
    skipToReady,
    beginHold,
    releaseHold,
    reset,
  };
}
