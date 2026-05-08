import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../../src/components/GradientBackground';
import { EmptyState } from '../../src/components/EmptyState';
import { SessionDetailModal } from '../../src/components/SessionDetailModal';
import { useSessions } from '../../src/storage/useSessions';
import { SessionRecord } from '../../src/storage/sessions';
import { compact } from '../../src/timer/format';
import { Colors, Layout } from '../../src/theme/theme';

export default function HistoryScreen() {
  const { sessions, remove, update } = useSessions();
  const [selected, setSelected] = useState<SessionRecord | null>(null);

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

  // Keep the selected snapshot in sync if its underlying record changes.
  const liveSelected = selected
    ? sessions.find((s) => s.id === selected.id) ?? null
    : null;

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
            renderItem={({ item }) => {
              const hasNotes = !!item.notes && item.notes.trim().length > 0;
              return (
                <Pressable
                  onPress={() => setSelected(item)}
                  onLongPress={() => confirmDelete(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${compact(item.holdDuration)} hold, tap to view details`}
                >
                  <View style={styles.row}>
                    <View style={styles.rowMain}>
                      <Text style={styles.duration}>{compact(item.holdDuration)}</Text>
                      <Text style={styles.date}>
                        {new Date(item.date).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </Text>
                      {hasNotes && (
                        <Text style={styles.notesPreview} numberOfLines={1}>
                          {item.notes}
                        </Text>
                      )}
                    </View>
                    <View style={styles.rowAside}>
                      {item.holdDuration === personalBest && (
                        <Ionicons name="sparkles" size={18} color={Colors.accent} />
                      )}
                      {hasNotes && (
                        <Ionicons name="document-text-outline" size={16} color={Colors.textDim} />
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>
      <SessionDetailModal
        session={liveSelected}
        onClose={() => setSelected(null)}
        onSave={(id, notes) => update(id, { notes })}
      />
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
  rowMain: { flex: 1, marginRight: 12 },
  rowAside: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  duration: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  date: { color: Colors.textDim, fontSize: 12, marginTop: 2 },
  notesPreview: { color: Colors.textDim, fontSize: 12, marginTop: 6, fontStyle: 'italic' },
});
