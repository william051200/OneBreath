import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { Colors, Layout } from '../../src/theme/theme';
import {
  MotionMode,
  useMotionPreference,
} from '../../src/storage/useMotionPreference';

const MOTION_OPTIONS: ReadonlyArray<{ value: MotionMode; label: string }> = [
  { value: 'on', label: 'On' },
  { value: 'system', label: 'System' },
  { value: 'off', label: 'Off' },
];

export default function SettingsScreen() {
  const motion = useMotionPreference();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgDeep }}>
      <GradientBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Tune how OneBreath feels.</Text>
          </View>

          <Section title="Motion">
            <SegmentedControl
              options={MOTION_OPTIONS}
              value={motion.mode}
              onChange={motion.setMode}
              accessibilityLabel="Motion preference"
            />
            <Text style={styles.helper}>
              The breathing orb and background animations. Choose <Text style={styles.helperEm}>System</Text>{' '}
              to follow your device&apos;s reduce-motion setting. On Android, that setting is often on by
              default and freezes the orb — pick <Text style={styles.helperEm}>On</Text> to keep it
              animating.
            </Text>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: Layout.pad,
    gap: 24,
  },
  header: { gap: 4 },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: Colors.textDim,
    fontSize: 14,
  },
  section: { gap: 10 },
  sectionTitle: {
    color: Colors.textDim,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  helper: {
    color: Colors.textDim,
    fontSize: 13,
    lineHeight: 19,
  },
  helperEm: {
    color: Colors.text,
    fontWeight: '600',
  },
});
