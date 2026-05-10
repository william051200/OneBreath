import { Platform } from 'react-native';
import { csvToSessions, type CsvParseResult } from './csv';
import { mergeSessions, type SessionRecord } from './sessions';

export type ImportOutcome =
  | { kind: 'cancelled' }
  | { kind: 'unsupported' }
  | { kind: 'parsed'; result: CsvParseResult; added: number; sessions: SessionRecord[] };

/**
 * Opens a file picker on web, parses the chosen CSV, and merges the resulting
 * sessions into local storage (existing IDs are preserved — duplicates are
 * skipped). Returns an `ImportOutcome` describing what happened so callers
 * can show appropriate UI.
 *
 * Native platforms are not supported in this iteration — picking files
 * without `expo-document-picker` would require an extra dependency.
 */
export async function importSessionsFromCsv(): Promise<ImportOutcome> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return { kind: 'unsupported' };
  }

  const file = await pickCsvFile();
  if (!file) return { kind: 'cancelled' };

  const text = await file.text();
  const result = csvToSessions(text);
  const { sessions, added } = await mergeSessions(result.sessions);
  return { kind: 'parsed', result, added, sessions };
}

function pickCsvFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.style.position = 'fixed';
    input.style.left = '-1000px';
    let settled = false;
    const settle = (file: File | null) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(file);
    };
    input.addEventListener('change', () => settle(input.files?.[0] ?? null));
    // No reliable "cancel" event across browsers — fall back to a focus
    // listener so we don't hang forever if the user dismisses the dialog.
    const onFocus = () => {
      setTimeout(() => {
        if (!settled && (!input.files || input.files.length === 0)) settle(null);
        window.removeEventListener('focus', onFocus);
      }, 300);
    };
    window.addEventListener('focus', onFocus);
    document.body.appendChild(input);
    input.click();
  });
}
