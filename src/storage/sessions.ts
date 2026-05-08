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
