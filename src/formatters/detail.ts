import { decodeBase64, formatHeaders, formatTimestamp, truncate } from '../utils.js';
import { compactTimings } from './compact.js';
import type { Session, SessionEntry, WebSocketMessage } from '../types.js';

export function detailSession(session: Session): string {
  const lines = [
    `Session: ${session.id}`,
    `Name: ${session.name}`,
    `Entries: ${session.entryIds.length}`,
  ];
  if (session.entryIds.length > 0 && session.entryIds.length <= 20) {
    lines.push(`Entry IDs: ${session.entryIds.join(', ')}`);
  } else if (session.entryIds.length > 20) {
    lines.push(`First 5 IDs: ${session.entryIds.slice(0, 5).join(', ')}`);
    lines.push(`Last 5 IDs: ${session.entryIds.slice(-5).join(', ')}`);
    lines.push(`(Use "powhttp entries" to list all entries)`);
  }
  return lines.join('\n');
}

export interface EntryDetailOptions {
  decodeBody?: boolean;
  noBody?: boolean;
  full?: boolean;
}

export function detailEntry(entry: SessionEntry, opts: EntryDetailOptions = {}): string {
  const lines: string[] = [];
  const maxBodyLen = opts.full ? Infinity : 500;

  // Request line
  lines.push(`${entry.request.method ?? '?'} ${entry.url} ${entry.httpVersion}`);
  lines.push(`Status: ${entry.response?.statusCode ?? '-'} ${entry.response?.statusText ?? ''}`);
  lines.push(`ID: ${entry.id}`);
  lines.push(`Started: ${formatTimestamp(entry.timings.startedAt)}`);

  if (entry.clientAddr) {
    lines.push(`Client: ${entry.clientAddr.ip}${entry.clientAddr.port ? ':' + entry.clientAddr.port : ''}`);
  }
  if (entry.remoteAddr) {
    lines.push(`Remote: ${entry.remoteAddr.ip}${entry.remoteAddr.port ? ':' + entry.remoteAddr.port : ''}`);
  }
  if (entry.process) {
    lines.push(`Process: ${entry.process.name ?? 'unknown'} (pid ${entry.process.pid})`);
  }
  if (entry.isWebSocket) {
    lines.push(`WebSocket: yes`);
  }

  // Timings
  lines.push(`Timings: ${compactTimings(entry)}`);

  // TLS info
  if (entry.tls.connectionId) {
    lines.push(`TLS Connection: ${entry.tls.connectionId}`);
    if (entry.tls.ja4) lines.push(`JA4: ${entry.tls.ja4.hashed}`);
  }

  // HTTP/2 info
  if (entry.http2) {
    lines.push(`HTTP/2 Connection: ${entry.http2.connectionId} stream=${entry.http2.streamId}`);
  }

  // Request headers
  lines.push('');
  lines.push('--- Request Headers ---');
  lines.push(formatHeaders(entry.request.headers));

  // Request body
  if (!opts.noBody && entry.request.body) {
    lines.push('');
    lines.push('--- Request Body ---');
    if (opts.decodeBody) {
      const decoded = decodeBase64(entry.request.body);
      lines.push(decoded ? truncate(decoded, maxBodyLen) : '(empty)');
    } else {
      lines.push(truncate(entry.request.body, maxBodyLen) + ' (base64)');
    }
  }

  // Response headers
  if (entry.response) {
    lines.push('');
    lines.push('--- Response Headers ---');
    lines.push(formatHeaders(entry.response.headers));

    // Response body
    if (!opts.noBody && entry.response.body) {
      lines.push('');
      lines.push('--- Response Body ---');
      if (opts.decodeBody) {
        const decoded = decodeBase64(entry.response.body);
        lines.push(decoded ? truncate(decoded, maxBodyLen) : '(empty)');
      } else {
        lines.push(truncate(entry.response.body, maxBodyLen) + ' (base64)');
      }
    }
  }

  return lines.join('\n');
}

export function detailWebSocket(messages: WebSocketMessage[]): string {
  if (messages.length === 0) return 'No WebSocket messages.';

  return messages.map((m, i) => {
    const lines = [`[${i + 1}] ${m.side} | ${m.content.type}`];
    if (m.startedAt) lines[0] += ` | ${formatTimestamp(m.startedAt)}`;

    if (m.content.type === 'text') {
      lines.push(m.content.text);
    } else if (m.content.type === 'binary') {
      const decoded = decodeBase64(m.content.data);
      lines.push(decoded ?? m.content.data);
    } else if (m.content.type === 'close') {
      lines.push(`code=${m.content.code} reason=${decodeBase64(m.content.reason) ?? ''}`);
    } else if ('data' in m.content) {
      lines.push(decodeBase64(m.content.data) ?? m.content.data);
    }

    return lines.join('\n');
  }).join('\n\n');
}
