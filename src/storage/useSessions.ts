import { useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useState } from 'react';
import { loadSessions, saveSession, deleteSession, SessionRecord } from './sessions';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const list = await loadSessions();
    setSessions(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const add = useCallback(async (record: SessionRecord) => {
    const next = await saveSession(record);
    setSessions(next);
  }, []);

  const remove = useCallback(async (id: string) => {
    const next = await deleteSession(id);
    setSessions(next);
  }, []);

  return { sessions, loading, reload, add, remove };
}
