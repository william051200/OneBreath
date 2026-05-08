import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { BreathingOrb } from '../../src/components/BreathingOrb';
import { ActionButton } from '../../src/components/ActionButton';
import { Stepper } from '../../src/components/Stepper';
import { Colors, Layout } from '../../src/theme/theme';
import { useBoxPreferences } from '../../src/storage/useBoxPreferences';
import { useBoxBreathing, phaseLabel } from '../../src/timer/useBoxBreathing';

export default function BoxScreen() {
  const prefs = useBoxPreferences();
  const machine = useBoxBreathing({ seconds: prefs.seconds, rounds: prefs.rounds });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgDeep }}>
      <GradientBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Box breathing</Text>
          <Text style={styles.subtitle}>Equal inhale, hold, exhale, hold</Text>
        </View>

        <View style={styles.orbWrap}>
          <BreathingOrb state={machine.orbState} />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.overlay}>
              <Overlay state={machine.state} />
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          {machine.state.kind === 'idle' && (
            <>
              <Stepper
                label="SECONDS PER SIDE"
                value={prefs.seconds}
                onIncrement={prefs.incrementSeconds}
                onDecrement={prefs.decrementSeconds}
                canIncrement={prefs.canIncrementSeconds}
                canDecrement={prefs.canDecrementSeconds}
                unit="s"
              />
              <Stepper
                label="ROUNDS"
                value={prefs.rounds}
                onIncrement={prefs.incrementRounds}
                onDecrement={prefs.decrementRounds}
                canIncrement={prefs.canIncrementRounds}
                canDecrement={prefs.canDecrementRounds}
              />
            </>
          )}
          <View style={styles.actionRow}>
            {machine.state.kind === 'idle' && (
              <ActionButton title="Start" icon="play" onPress={machine.start} />
            )}
            {machine.state.kind === 'running' && (
              <ActionButton
                title="Stop"
                icon="stop"
                variant="destructive"
                onPress={machine.reset}
              />
            )}
            {machine.state.kind === 'finished' && (
              <ActionButton title="Done" icon="checkmark" onPress={machine.reset} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Overlay({
  state,
}: {
  state: ReturnType<typeof useBoxBreathing>['state'];
}) {
  if (state.kind === 'idle') {
    return (
      <View style={styles.center}>
        <Text style={styles.headline}>Find your square</Text>
        <Text style={styles.dim}>Tap Start to begin</Text>
      </View>
    );
  }
  if (state.kind === 'finished') {
    return (
      <View style={styles.center}>
        <Text style={styles.headline}>Nice work</Text>
        <Text style={[styles.dim, { color: Colors.accent, marginTop: 6 }]}>
          ✨ {state.rounds} {state.rounds === 1 ? 'round' : 'rounds'} complete
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.center}>
      <Text style={styles.headline}>{phaseLabel(state.phase)}</Text>
      <Text style={styles.count}>{state.remaining}</Text>
      <Text style={styles.dim}>Round {state.round}</Text>
    </View>
  );
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
  count: {
    color: Colors.text,
    fontSize: 56,
    fontWeight: '700',
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },
  dim: { color: Colors.textDim, fontSize: 14, marginTop: 6 },
  controls: { paddingBottom: 16, gap: 12 },
  actionRow: { flexDirection: 'row' },
});
