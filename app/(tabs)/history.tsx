import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../../src/components/GradientBackground';
import { EmptyState } from '../../src/components/EmptyState';
import { useSessions } from '../../src/storage/useSessions';
import { compact } from '../../src/timer/format';
import { Colors, Layout } from '../../src/theme/theme';

export default function HistoryScreen() {
  const { sessions, remove } = useSessions();

  const personalBest = useMemo(
    () => sessions.reduce((m, s) => Math.max(m, s.holdDuration), 0),
    [sessions]
  );

  const confirmDelete = (id: string) => {
    Alert.alert('Delete session?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgDeep }}>
      <GradientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Text style={styles.heading}>History</Text>
        {sessions.length === 0 ? (
          <EmptyState
            title="No holds yet"
            subtitle="Your saved breath holds will appear here."
            icon="pulse-outline"
          />
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable onLongPress={() => confirmDelete(item.id)}>
                <View style={styles.row}>
                  <View>
                    <Text style={styles.duration}>{compact(item.holdDuration)}</Text>
                    <Text style={styles.date}>
                      {new Date(item.date).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  {item.holdDuration === personalBest && (
                    <Ionicons name="sparkles" size={18} color={Colors.accent} />
                  )}
                </View>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: Layout.pad,
    paddingTop: 8,
    paddingBottom: 12,
  },
  list: { padding: Layout.pad, gap: 10 },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.cornerRadius,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  duration: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  date: { color: Colors.textDim, fontSize: 12, marginTop: 2 },
});
