import { Platform, Share } from 'react-native';
import { SessionRecord } from './sessions';
import { CSV_MIME_TYPE, buildExportFilename, sessionsToCsv } from './csv';

/**
 * Triggers a CSV download (web) or system share sheet (native) of the given
 * sessions. No-op when there are no sessions.
 *
 * Returns `true` if the export was initiated, `false` otherwise.
 */
export async function exportSessionsToCsv(sessions: SessionRecord[]): Promise<boolean> {
  if (sessions.length === 0) return false;

  const csv = sessionsToCsv(sessions);
  const filename = buildExportFilename();

  if (Platform.OS === 'web') {
    if (typeof document === 'undefined' || typeof URL === 'undefined') return false;
    const blob = new Blob([csv], { type: CSV_MIME_TYPE });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Revoke after a tick so the download stream isn't cancelled.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }

  // Native fallback: hand the CSV text to the system share sheet so the user
  // can save it to Files / send it to themselves. Avoids a hard dependency on
  // expo-file-system, which is not currently installed.
  try {
    await Share.share({ message: csv, title: filename });
    return true;
  } catch {
    return false;
  }
}
