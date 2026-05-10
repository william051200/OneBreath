import { SessionRecord } from './sessions';

/**
 * CSV format used by OneBreath export / import.
 *
 * Header columns (in order):
 *   id, date, holdDuration, breatheUpRounds, notes
 *
 * - `date` is serialized as ISO-8601 (UTC) so it is human-readable in
 *   spreadsheets while still round-trippable to epoch ms.
 * - `notes` is RFC-4180 quoted: surrounded by double quotes when it contains
 *   a comma, double quote, CR, or LF; embedded quotes are doubled.
 * - Lines are joined with CRLF for spreadsheet compatibility.
 */

export const CSV_HEADER = ['id', 'date', 'holdDuration', 'breatheUpRounds', 'notes'] as const;
export const CSV_MIME_TYPE = 'text/csv;charset=utf-8';

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function sessionsToCsv(sessions: SessionRecord[]): string {
  const rows = sessions.map((session) => {
    const fields = [
      session.id,
      new Date(session.date).toISOString(),
      String(session.holdDuration),
      String(session.breatheUpRounds),
      session.notes ?? '',
    ];
    return fields.map(escapeCsvField).join(',');
  });
  return [CSV_HEADER.join(','), ...rows].join('\r\n') + '\r\n';
}

export function buildExportFilename(now: Date = new Date()): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `onebreath-sessions-${yyyy}${mm}${dd}-${hh}${min}.csv`;
}
