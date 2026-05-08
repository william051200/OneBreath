import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Layout } from '../theme/theme';
import { compact } from '../timer/format';
import { SessionRecord, NOTES_MAX_LENGTH } from '../storage/sessions';

type Props = {
  session: SessionRecord | null;
  onClose: () => void;
  onSave: (id: string, notes: string) => void | Promise<void>;
};

export function SessionDetailModal({ session, onClose, onSave }: Props) {
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setDraft(session?.notes ?? '');
  }, [session?.id, session?.notes]);

  const visible = session !== null;
  const dirty = session ? draft.trim() !== (session.notes ?? '').trim() : false;

  const handleSave = async () => {
    if (!session) return;
    await onSave(session.id, draft.trim());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.center}
        >
          <Pressable style={styles.card} onPress={() => {}}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {session && (
                <>
                  <View style={styles.headerRow}>
                    <Text style={styles.duration}>{compact(session.holdDuration)}</Text>
                    <Pressable
                      onPress={onClose}
                      hitSlop={12}
                      accessibilityLabel="Close"
                      accessibilityRole="button"
                    >
                      <Ionicons name="close" size={22} color={Colors.textDim} />
                    </Pressable>
                  </View>
                  <Text style={styles.meta}>
                    {new Date(session.date).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.meta}>
                    {session.breatheUpRounds}{' '}
                    {session.breatheUpRounds === 1 ? 'breathe-up round' : 'breathe-up rounds'}
                  </Text>

                  <Text style={styles.label}>NOTES</Text>
                  <TextInput
                    value={draft}
                    onChangeText={(t) => setDraft(t.slice(0, NOTES_MAX_LENGTH))}
                    placeholder="How did this hold feel? Anything to remember?"
                    placeholderTextColor={Colors.textDim}
                    style={styles.input}
                    multiline
                    textAlignVertical="top"
                    maxLength={NOTES_MAX_LENGTH}
                    accessibilityLabel="Session notes"
                  />
                  <Text style={styles.counter}>
                    {draft.length} / {NOTES_MAX_LENGTH}
                  </Text>

                  <View style={styles.buttonRow}>
                    <Pressable
                      onPress={onClose}
                      style={[styles.button, styles.buttonSecondary]}
                      accessibilityRole="button"
                    >
                      <Text style={styles.buttonSecondaryText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSave}
                      disabled={!dirty}
                      style={[
                        styles.button,
                        styles.buttonPrimary,
                        !dirty && styles.buttonDisabled,
                      ]}
                      accessibilityRole="button"
                    >
                      <Text style={styles.buttonPrimaryText}>Save</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 26, 46, 0.75)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: Layout.pad,
  },
  card: {
    backgroundColor: '#16263E',
    borderRadius: Layout.cornerRadius,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 20,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  meta: {
    color: Colors.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  label: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    color: Colors.text,
    fontSize: 15,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    padding: 12,
    minHeight: 110,
  },
  counter: {
    color: Colors.textDim,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Layout.cornerRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.accent,
  },
  buttonSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPrimaryText: {
    color: Colors.bgDeep,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});
