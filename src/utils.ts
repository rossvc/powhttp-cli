export function decodeBase64(encoded: string | null): string | null {
  if (encoded === null) return null;
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

export function padRight(str: string, len: number): string {
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

export function padLeft(str: string, len: number): string {
  return str.length >= len ? str : ' '.repeat(len - str.length) + str;
}

export function formatHeaders(headers: Array<[string, string]>): string {
  return headers.map(([k, v]) => `${k}: ${v}`).join('\n');
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function formatTimestamp(ms: number): string {
  return new Date(ms).toISOString();
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return '-';
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function table(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((h, i) => {
    const maxRow = rows.reduce((max, row) => Math.max(max, (row[i] ?? '').length), 0);
    return Math.max(h.length, maxRow);
  });

  const headerLine = headers.map((h, i) => padRight(h, colWidths[i])).join('  ');
  const dataLines = rows.map(row =>
    row.map((cell, i) => padRight(cell ?? '', colWidths[i])).join('  ')
  );

  return [headerLine, ...dataLines].join('\n');
}
