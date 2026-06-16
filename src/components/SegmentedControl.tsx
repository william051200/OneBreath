import React from 'react';
import { Pressable, StyleSheet, Text, View, AccessibilityRole } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/theme';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

/**
 * Small segmented control used for tri-state preferences (e.g. Motion: System / On / Off).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: Props<T>) {
  return (
    <View
      style={styles.row}
      accessibilityRole={'tablist' as AccessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync().catch(() => {});
              onChange(opt.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.segmentSelected,
              pressed && !selected && styles.segmentPressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: 'rgba(127, 231, 196, 0.18)',
  },
  segmentPressed: {
    backgroundColor: 'rgba(237, 239, 247, 0.08)',
  },
  label: {
    color: Colors.textDim,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  labelSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
