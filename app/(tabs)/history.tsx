import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../../src/components/GradientBackground';
import { EmptyState } from '../../src/components/EmptyState';
import { SessionDetailModal } from '../../src/components/SessionDetailModal';
import { useSessions } from '../../src/storage/useSessions';
import { SessionRecord } from '../../src/storage/sessions';
import { exportSessionsToCsv } from '../../src/storage/exportSessions';
import { importSessionsFromCsv } from '../../src/storage/importSessions';
import { compact } from '../../src/timer/format';
import { Colors, Layout } from '../../src/theme/theme';

export default function HistoryScreen() {
  const { sessions, remove, update, reload } = useSessions();
  const [selected, setSelected] = useState<SessionRecord | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

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

  const handleExport = async () => {
    if (exporting || sessions.length === 0) return;
    setExporting(true);
    try {
      const ok = await exportSessionsToCsv(sessions);
      if (!ok) {
        Alert.alert('Export failed', 'OneBreath could not export your sessions.');
      }
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (importing) return;
    setImporting(true);
    try {
      const outcome = await importSessionsFromCsv();
      if (outcome.kind === 'unsupported') {
        Alert.alert(
          'Import not available',
          'CSV import is only supported in the web app for now.'
        );
        return;
      }
      if (outcome.kind === 'cancelled') return;

      await reload();
      const errorCount = outcome.result.errors.length;
      const skipped = outcome.result.sessions.length - outcome.added;
      const lines: string[] = [];
      lines.push(`${outcome.added} session${outcome.added === 1 ? '' : 's'} added.`);
      if (skipped > 0) {
        lines.push(`${skipped} skipped (already in your history).`);
      }
      if (errorCount > 0) {
        const preview = outcome.result.errors
          .slice(0, 3)
          .map((e) => `Line ${e.line}: ${e.message}`)
          .join('\n');
        const more = errorCount > 3 ? `\n…and ${errorCount - 3} more.` : '';
        lines.push(`${errorCount} row${errorCount === 1 ? '' : 's'} could not be parsed:\n${preview}${more}`);
      }
      const title =
        outcome.added === 0 && errorCount > 0 && outcome.result.sessions.length === 0
          ? 'Import failed'
          : 'Import complete';
      const message = lines.join('\n\n');
      // react-native-web's Alert.alert is a no-op without a callback config
      // in some setups, so fall back to window.alert directly on web.
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert(`${title}\n\n${message}`);
      } else {
        Alert.alert(title, message);
      }
    } finally {
      setImporting(false);
    }
  };

  // Keep the selected snapshot in sync if its underlying record changes.
  const liveSelected = selected
    ? sessions.find((s) => s.id === selected.id) ?? null
    : null;

  const canExport = sessions.length > 0 && !exporting;
  const canImport = !importing;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgDeep }}>
      <GradientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>History</Text>
          <View style={styles.headerActions}>
            <Pressable
              onPress={handleImport}
              disabled={!canImport}
              accessibilityRole="button"
              accessibilityLabel="Import sessions from CSV"
              accessibilityState={{ disabled: !canImport }}
              hitSlop={8}
              style={({ pressed }) => [
                styles.headerButton,
                !canImport && styles.headerButtonDisabled,
                pressed && canImport && styles.headerButtonPressed,
              ]}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color={canImport ? Colors.text : Colors.textDim}
              />
              <Text
                style={[styles.headerLabel, !canImport && styles.headerLabelDisabled]}
              >
                Import
              </Text>
            </Pressable>
            <Pressable
              onPress={handleExport}
              disabled={!canExport}
              accessibilityRole="button"
              accessibilityLabel="Export sessions as CSV"
              accessibilityState={{ disabled: !canExport }}
              hitSlop={8}
              style={({ pressed }) => [
                styles.headerButton,
                !canExport && styles.headerButtonDisabled,
                pressed && canExport && styles.headerButtonPressed,
              ]}
            >
              <Ionicons
                name="download-outline"
                size={18}
                color={canExport ? Colors.text : Colors.textDim}
              />
              <Text
                style={[styles.headerLabel, !canExport && styles.headerLabelDisabled]}
              >
                Export
              </Text>
            </Pressable>
          </View>
        </View>
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
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.pad,
    paddingTop: 8,
    paddingBottom: 12,
  },
  heading: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Layout.cornerRadius,
    backgroundColor: Colors.surface,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  headerLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  headerLabelDisabled: {
    color: Colors.textDim,
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
