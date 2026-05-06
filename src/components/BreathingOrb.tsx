import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Layout, Anim } from '../theme/theme';

export type OrbState = 'idle' | 'inhale' | 'exhale' | 'holding' | 'released';

type Props = {
  state: OrbState;
  size?: number;
};

export function BreathingOrb({ state, size = Layout.orbSize }: Props) {
  const scale = useSharedValue(0.85);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(glow);

    switch (state) {
      case 'idle':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: Anim.breathInhaleMs, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.85, { duration: Anim.breathExhaleMs, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        glow.value = withRepeat(withTiming(0.7, { duration: 4000 }), -1, true);
        break;
      case 'inhale':
        scale.value = withTiming(1.15, { duration: Anim.breathInhaleMs, easing: Easing.inOut(Easing.ease) });
        glow.value = withTiming(0.9, { duration: Anim.breathInhaleMs });
        break;
      case 'exhale':
        scale.value = withTiming(0.75, { duration: Anim.breathExhaleMs, easing: Easing.inOut(Easing.ease) });
        glow.value = withTiming(0.4, { duration: Anim.breathExhaleMs });
        break;
      case 'holding':
        scale.value = withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) });
        glow.value = withRepeat(withTiming(1.0, { duration: 2500, easing: Easing.inOut(Easing.ease) }), -1, true);
        break;
      case 'released':
        scale.value = withTiming(0.92, { duration: 600, easing: Easing.out(Easing.ease) });
        glow.value = withTiming(0.5, { duration: 600 });
        break;
    }
  }, [state, scale, glow]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, orbStyle]}>
      <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
        <LinearGradient
          colors={[Colors.orbCore, Colors.orbHalo, 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
        />
      </Animated.View>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: 'rgba(181, 168, 255, 0.5)',
          },
        ]}
      />
    </Animated.View>
  );
}
