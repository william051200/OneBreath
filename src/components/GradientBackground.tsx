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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Anim } from '../theme/theme';

const AnimatedLG = Animated.createAnimatedComponent(LinearGradient);

export function GradientBackground() {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: Anim.bgShiftMs, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    return () => cancelAnimation(t);
  }, [t]);

  // Slight rotation/translation effect via animated start/end points
  const animatedProps = useAnimatedStyle(() => ({
    opacity: 0.95 + 0.05 * t.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedProps]}>
      <LinearGradient
        colors={[Colors.bgGlow, Colors.bgMid, Colors.bgDeep]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', Colors.bgDeep]}
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
