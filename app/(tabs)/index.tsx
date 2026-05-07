import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../../src/components/GradientBackground';
import { BreathingOrb } from '../../src/components/BreathingOrb';
import { PulseRing } from '../../src/components/PulseRing';
import { AnimatedCounter } from '../../src/components/AnimatedCounter';
import { ActionButton } from '../../src/components/ActionButton';
import { Colors, Layout } from '../../src/theme/theme';
import { useTimerMachine } from '../../src/timer/useTimerMachine';
import { useElapsed } from '../../src/timer/useElapsed';
import { liveDisplay, compact } from '../../src/timer/format';
import { useSessions } from '../../src/storage/useSessions';

export default function TimerScreen() {
  const machine = useTimerMachine(3);
  const { sessions, add } = useSessions();

  const personalBest = useMemo(
    () => sessions.reduce((m, s) => Math.max(m, s.holdDuration), 0),
    [sessions]
  );

  const startedAt = machine.phase.kind === 'holding' ? machine.phase.startedAt : null;
  const elapsed = useElapsed(startedAt, 50);

  const onSave = async (duration: number) => {
    const isPB = duration > personalBest;
    await add({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: Date.now(),
      holdDuration: duration,
      breatheUpRounds: machine.rounds,
    });
    if (isPB) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    machine.reset();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgDeep }}>
      <GradientBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Header personalBest={personalBest} />

        <View style={styles.orbWrap}>
          <PulseRing active={machine.phase.kind === 'holding'} />
          <BreathingOrb state={machine.orbState} />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.overlay}>
              <PhaseLabel phase={machine.phase} elapsed={elapsed} personalBest={personalBest} />
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Actions
            phase={machine.phase}
            onStart={machine.startBreatheUp}
            onSkip={machine.skipToReady}
            onHold={machine.beginHold}
            onRelease={machine.releaseHold}
            onDiscard={machine.reset}
            onSave={onSave}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function Header({ personalBest }: { personalBest: number }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>OneBreath</Text>
      {personalBest > 0 && (
        <Text style={styles.subtitle}>Personal best · {compact(personalBest)}</Text>
      )}
    </View>
  );
}

function PhaseLabel({
  phase,
  elapsed,
  personalBest,
}: {
  phase: ReturnType<typeof useTimerMachine>['phase'];
  elapsed: number;
  personalBest: number;
}) {
  switch (phase.kind) {
    case 'idle':
      return (
        <View style={styles.center}>
          <Text style={styles.headline}>Ready when you are</Text>
          <Text style={styles.dim}>Tap Start to begin</Text>
        </View>
      );
    case 'breatheUp':
      return (
        <View style={styles.center}>
          <Text style={styles.headline}>{phase.action === 'inhale' ? 'Breathe in' : 'Breathe out'}</Text>
          <Text style={styles.dim}>
            Round {phase.round} of {phase.total}
          </Text>
        </View>
      );
    case 'ready':
      return (
        <View style={styles.center}>
          <Text style={styles.headline}>Take a deep breath</Text>
        </View>
      );
    case 'holding':
      return (
        <View style={styles.center}>
          <AnimatedCounter text={liveDisplay(elapsed)} />
        </View>
      );
    case 'finished':
      return (
        <View style={styles.center}>
          <Text style={styles.dim}>Held for</Text>
          <AnimatedCounter text={compact(phase.duration)} style={{ fontSize: 64 }} />
          {phase.duration > personalBest && personalBest > 0 && (
            <Text style={[styles.dim, { color: Colors.accent, marginTop: 6 }]}>
              ✨ New personal best
            </Text>
          )}
        </View>
      );
  }
}

function Actions({
  phase,
  onStart,
  onSkip,
  onHold,
  onRelease,
  onDiscard,
  onSave,
}: {
  phase: ReturnType<typeof useTimerMachine>['phase'];
  onStart: () => void;
  onSkip: () => void;
  onHold: () => void;
  onRelease: () => void;
  onDiscard: () => void;
  onSave: (d: number) => void;
}) {
  switch (phase.kind) {
    case 'idle':
      return <ActionButton title="Start" icon="play" onPress={onStart} />;
    case 'breatheUp':
      return <ActionButton title="Skip warm-up" variant="secondary" onPress={onSkip} />;
    case 'ready':
      return <ActionButton title="Hold" icon="hand-left" onPress={onHold} />;
    case 'holding':
      return <ActionButton title="Release" icon="stop" variant="destructive" onPress={onRelease} />;
    case 'finished':
      return (
        <View style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
          <ActionButton title="Discard" variant="secondary" onPress={onDiscard} />
          <ActionButton title="Save" icon="checkmark" onPress={() => onSave(phase.duration)} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Layout.pad, justifyContent: 'space-between' },
  header: { alignItems: 'center', paddingTop: 8 },
  title: { color: Colors.text, fontSize: 22, fontWeight: '600' },
  subtitle: { color: Colors.textDim, fontSize: 13, marginTop: 4 },
  orbWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  headline: { color: Colors.text, fontSize: 22, fontWeight: '500' },
  dim: { color: Colors.textDim, fontSize: 14, marginTop: 6 },
  actions: { paddingBottom: 16, flexDirection: 'row' },
});
