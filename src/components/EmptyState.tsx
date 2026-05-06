import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';

type Props = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function EmptyState({ title, subtitle, icon }: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={56} color={Colors.orbCore} style={{ opacity: 0.8 }} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 14,
  },
  subtitle: {
    color: Colors.textDim,
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
  },
});
