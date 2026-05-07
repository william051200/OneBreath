import React from 'react';
import { Text, TextStyle, View } from 'react-native';
import Animated, { LinearTransition, FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors } from '../theme/theme';
import { useReduceMotion } from '../theme/useReduceMotion';

type Props = {
  text: string;
  style?: TextStyle;
};

export function AnimatedCounter({ text, style }: Props) {
  const reduceMotion = useReduceMotion();

  if (reduceMotion) {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={[defaultStyle, style]}>{text}</Text>
      </View>
    );
  }

  return (
    <Animated.View
      layout={LinearTransition.springify().mass(0.4).damping(14)}
      style={{ flexDirection: 'row' }}
    >
      {text.split('').map((ch, idx) => (
        <Animated.View
          key={`${idx}-${ch}`}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
        >
          <Text style={[defaultStyle, style]}>{ch}</Text>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

const defaultStyle: TextStyle = {
  fontSize: 72,
  fontWeight: '600',
  color: Colors.text,
  fontVariant: ['tabular-nums'],
};
