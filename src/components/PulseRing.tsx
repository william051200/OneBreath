import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Layout, Anim, Colors } from '../theme/theme';
import { useReduceMotion } from '../theme/useReduceMotion';

type Props = {
  active: boolean;
  baseSize?: number;
};

export function PulseRing({ active, baseSize = Layout.orbSize }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(opacity);
    if (reduceMotion) {
      scale.value = 1;
      opacity.value = 0;
      return;
    }
    if (active) {
      scale.value = 1;
      opacity.value = 0.7;
      scale.value = withRepeat(
        withTiming(2.4, { duration: Anim.pulseMs, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      opacity.value = withRepeat(
        withTiming(0, { duration: Anim.pulseMs, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [active, scale, opacity, reduceMotion]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        { width: baseSize, height: baseSize, borderRadius: baseSize / 2 },
        animStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.orbHalo,
  },
});
