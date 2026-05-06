import React from 'react';
import { Pressable, Text, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Layout } from '../theme/theme';

type Style = 'primary' | 'secondary' | 'destructive';

type Props = {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: Style;
  containerStyle?: ViewStyle;
};

export function ActionButton({ title, onPress, icon, variant = 'primary', containerStyle }: Props) {
  const scale = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onIn = () => {
    scale.value = withSpring(0.97, { damping: 14, stiffness: 240 });
  };
  const onOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return (
    <Animated.View style={[{ flex: 1 }, aStyle, containerStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <ButtonBackground variant={variant}>
          <View style={styles.content}>
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={variant === 'secondary' ? Colors.text : Colors.bgDeep}
                style={{ marginRight: 8 }}
              />
            )}
            <Text
              style={[
                styles.label,
                { color: variant === 'secondary' ? Colors.text : Colors.bgDeep },
              ]}
            >
              {title}
            </Text>
          </View>
        </ButtonBackground>
      </Pressable>
    </Animated.View>
  );
}

function ButtonBackground({
  variant,
  children,
}: {
  variant: Style;
  children: React.ReactNode;
}) {
  if (variant === 'primary') {
    return (
      <LinearGradient
        colors={[Colors.orbCore, Colors.orbHalo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      >
        {children}
      </LinearGradient>
    );
  }
  if (variant === 'destructive') {
    return <View style={[styles.bg, { backgroundColor: Colors.accent }]}>{children}</View>;
  }
  return (
    <View
      style={[
        styles.bg,
        {
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.surfaceBorder,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    minHeight: 56,
    borderRadius: Layout.cornerRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
});
