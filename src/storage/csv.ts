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

// ---------------------------------------------------------------------------
// CSV parser (inverse of sessionsToCsv).

export type CsvParseError = { line: number; message: string };

export type CsvParseResult = {
  sessions: SessionRecord[];
  errors: CsvParseError[];
};

/**
 * Parses one CSV record starting at `start`. Returns the list of fields and
 * the index immediately past the consumed record (i.e. past the trailing
 * newline, or text.length at EOF). Handles RFC-4180 quoting with embedded
 * commas, doubled `""`, and CR/LF inside quotes.
 */
function parseCsvRecord(text: string, start: number): { fields: string[]; next: number } {
  const fields: string[] = [];
  let i = start;
  let field = '';
  let inQuotes = false;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ',') {
      fields.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (ch === '\r' || ch === '\n') {
      fields.push(field);
      // Consume CRLF or lone CR/LF.
      if (ch === '\r' && text[i + 1] === '\n') i += 2;
      else i += 1;
      return { fields, next: i };
    }
    field += ch;
    i += 1;
  }
  fields.push(field);
  return { fields, next: i };
}

/**
 * Parses an OneBreath CSV export string back into SessionRecords. Validates
 * the header and per-row field types. Rows that fail validation are skipped
 * and reported in `errors` so a partial import can still proceed.
 */
export function csvToSessions(text: string): CsvParseResult {
  const sessions: SessionRecord[] = [];
  const errors: CsvParseError[] = [];

  // Strip a UTF-8 BOM if present (Excel sometimes prepends one).
  let body = text;
  if (body.charCodeAt(0) === 0xfeff) body = body.slice(1);
  if (body.length === 0) {
    return { sessions, errors: [{ line: 1, message: 'File is empty' }] };
  }

  let cursor = 0;
  let lineNo = 1;

  const header = parseCsvRecord(body, cursor);
  cursor = header.next;
  const expected = CSV_HEADER.join(',');
  if (header.fields.join(',') !== expected) {
    errors.push({
      line: 1,
      message: `Unexpected header. Expected "${expected}", got "${header.fields.join(',')}"`,
    });
    return { sessions, errors };
  }

  while (cursor < body.length) {
    lineNo += 1;
    const { fields, next } = parseCsvRecord(body, cursor);
    cursor = next;
    // Skip blank trailing lines (e.g. the CRLF at EOF that sessionsToCsv emits).
    if (fields.length === 1 && fields[0] === '') continue;

    if (fields.length !== CSV_HEADER.length) {
      errors.push({
        line: lineNo,
        message: `Expected ${CSV_HEADER.length} columns, got ${fields.length}`,
      });
      continue;
    }
    const [id, dateStr, holdStr, roundsStr, notes] = fields;
    if (!id) {
      errors.push({ line: lineNo, message: 'Missing id' });
      continue;
    }
    const dateMs = Date.parse(dateStr);
    if (Number.isNaN(dateMs)) {
      errors.push({ line: lineNo, message: `Invalid date "${dateStr}"` });
      continue;
    }
    const hold = Number(holdStr);
    if (!Number.isFinite(hold) || hold < 0) {
      errors.push({ line: lineNo, message: `Invalid holdDuration "${holdStr}"` });
      continue;
    }
    const rounds = Number(roundsStr);
    if (!Number.isInteger(rounds) || rounds < 0) {
      errors.push({ line: lineNo, message: `Invalid breatheUpRounds "${roundsStr}"` });
      continue;
    }
    const record: SessionRecord = {
      id,
      date: dateMs,
      holdDuration: hold,
      breatheUpRounds: rounds,
    };
    if (notes && notes.length > 0) record.notes = notes;
    sessions.push(record);
  }

  return { sessions, errors };
}
