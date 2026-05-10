import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'onebreath:sessions:v1';

export type SessionRecord = {
  id: string;
  date: number; // epoch ms
  holdDuration: number; // seconds
  breatheUpRounds: number;
  notes?: string;
};

export const NOTES_MAX_LENGTH = 500;

export async function loadSessions(): Promise<SessionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SessionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSession(record: SessionRecord): Promise<SessionRecord[]> {
  const existing = await loadSessions();
  const next = [record, ...existing];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function updateSession(
  id: string,
  patch: Partial<Omit<SessionRecord, 'id'>>
): Promise<SessionRecord[]> {
  const existing = await loadSessions();
  const next = existing.map((s) => (s.id === id ? { ...s, ...patch } : s));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function deleteSession(id: string): Promise<SessionRecord[]> {
  const existing = await loadSessions();
  const next = existing.filter((s) => s.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function clearSessions(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/**
 * Merges `incoming` with the currently stored sessions, deduplicating by id
 * (existing records win), then writes the combined list back. Returns the
 * merged list and the number of records that were actually added.
 */
export async function mergeSessions(
  incoming: SessionRecord[]
): Promise<{ sessions: SessionRecord[]; added: number }> {
  const existing = await loadSessions();
  const known = new Set(existing.map((s) => s.id));
  const fresh = incoming.filter((s) => !known.has(s.id));
  if (fresh.length === 0) {
    return { sessions: existing, added: 0 };
  }
  const merged = [...fresh, ...existing].sort((a, b) => b.date - a.date);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return { sessions: merged, added: fresh.length };
}
