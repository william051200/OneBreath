import React from 'react';
import { Pressable, StyleSheet, Text, View, AccessibilityRole } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/theme';

type Props = {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement?: boolean;
  canDecrement?: boolean;
  unit?: string;
};

/**
 * Compact stepper: [label]  [-]  [value unit]  [+]
 * Used on the idle screen so users can dial breathe-up rounds before starting.
 */
export function Stepper({
  label,
  value,
  onIncrement,
  onDecrement,
  canIncrement = true,
  canDecrement = true,
  unit,
}: Props) {
  const tap = (fn: () => void) => () => {
    Haptics.selectionAsync().catch(() => {});
    fn();
  };

  return (
    <View style={styles.row} accessibilityRole={'group' as AccessibilityRole}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <StepButton
          icon="remove"
          onPress={tap(onDecrement)}
          disabled={!canDecrement}
          accessibilityLabel={`Decrease ${label}`}
        />
        <Text style={styles.value} accessibilityLiveRegion="polite">
          {value}
          {unit ? ` ${unit}` : ''}
        </Text>
        <StepButton
          icon="add"
          onPress={tap(onIncrement)}
          disabled={!canIncrement}
          accessibilityLabel={`Increase ${label}`}
        />
      </View>
    </View>
  );
}

function StepButton({
  icon,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  icon: 'add' | 'remove';
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.btn,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.btnPressed,
      ]}
      hitSlop={8}
    >
      <Ionicons
        name={icon}
        size={18}
        color={disabled ? Colors.textDim : Colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
  },
  label: { color: Colors.textDim, fontSize: 13, letterSpacing: 0.3 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnPressed: { backgroundColor: 'rgba(237, 239, 247, 0.12)' },
  value: {
    color: Colors.text,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    minWidth: 56,
    textAlign: 'center',
  },
});
