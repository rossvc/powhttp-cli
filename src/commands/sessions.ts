import { apiGet } from '../client.js';
import { compactSessions } from '../formatters/compact.js';
import { detailSession } from '../formatters/detail.js';
import { formatJson } from '../formatters/json.js';
import type { Config } from '../config.js';
import type { Session } from '../types.js';

export async function listSessions(config: Config, opts: { json?: boolean }): Promise<void> {
  const sessions = await apiGet<Session[]>(config, '/sessions');

  if (opts.json) {
    console.log(formatJson(sessions));
  } else {
    console.log(compactSessions(sessions));
  }
}

export async function getSession(config: Config, sessionId: string, opts: { json?: boolean }): Promise<void> {
  const session = await apiGet<Session>(config, `/sessions/${sessionId}`);

  if (opts.json) {
    console.log(formatJson(session));
  } else {
    console.log(detailSession(session));
  }
}

export async function getBookmarks(config: Config, sessionId: string, opts: { json?: boolean }): Promise<void> {
  const bookmarks = await apiGet<string[]>(config, `/sessions/${sessionId}/bookmarks`);

  if (opts.json) {
    console.log(formatJson(bookmarks));
  } else if (bookmarks.length === 0) {
    console.log('No bookmarks in this session.');
  } else {
    console.log(bookmarks.join('\n'));
  }
}
