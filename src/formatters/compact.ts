import { table, truncate, extractDomain, formatDuration } from '../utils.js';
import type { Session, SessionEntry, WebSocketMessage } from '../types.js';

export function compactSessions(sessions: Session[]): string {
  if (sessions.length === 0) return 'No sessions found.';

  const headers = ['ID', 'NAME', 'ENTRIES'];
  const rows = sessions.map(s => [s.id, s.name, String(s.entryIds.length)]);
  return table(headers, rows);
}

export function compactEntries(entries: SessionEntry[]): string {
  if (entries.length === 0) return 'No entries found.';

  const headers = ['ID', 'METHOD', 'STATUS', 'URL', 'PROCESS'];
  const rows = entries.map(e => [
    e.id,
    e.request.method ?? '-',
    e.response?.statusCode?.toString() ?? '-',
    truncate(e.url, 60),
    e.process?.name ?? '-',
  ]);
  return table(headers, rows);
}

export function compactWebSocket(messages: WebSocketMessage[]): string {
  if (messages.length === 0) return 'No WebSocket messages.';

  const headers = ['#', 'SIDE', 'TYPE', 'PREVIEW'];
  const rows = messages.map((m, i) => {
    let preview = '';
    if (m.content.type === 'text') {
      preview = truncate(m.content.text, 80);
    } else if (m.content.type === 'close') {
      preview = `code=${m.content.code}`;
    } else {
      preview = `[${m.content.type}]`;
    }
    return [String(i + 1), m.side, m.content.type, preview];
  });
  return table(headers, rows);
}

export function compactTimings(entry: SessionEntry): string {
  const t = entry.timings;
  const parts: string[] = [];
  if (t.dns !== null) parts.push(`dns=${formatDuration(t.dns)}`);
  if (t.connect !== null) parts.push(`connect=${formatDuration(t.connect)}`);
  if (t.ssl !== null) parts.push(`ssl=${formatDuration(t.ssl)}`);
  if (t.send !== null) parts.push(`send=${formatDuration(t.send)}`);
  if (t.wait !== null) parts.push(`wait=${formatDuration(t.wait)}`);
  if (t.receive !== null) parts.push(`receive=${formatDuration(t.receive)}`);
  return parts.length > 0 ? parts.join(' | ') : 'No timing data';
}
