#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig, applyCliOverrides, type Config } from '../src/config.js';
import { listSessions, getSession, getBookmarks } from '../src/commands/sessions.js';
import { listEntries, getEntry, getBody } from '../src/commands/entries.js';
import { getWebSocket } from '../src/commands/websocket.js';
import { getTls } from '../src/commands/tls.js';
import { listHttp2Streams, getHttp2Stream } from '../src/commands/http2.js';
import { ApiError, ConnectionError } from '../src/client.js';

const program = new Command();

program
  .name('powhttp')
  .description('Context-efficient CLI for the powhttp Data API')
  .version('0.1.0')
  .option('--port <port>', 'API port (default: 7777)')
  .option('--host <host>', 'API host (default: localhost)');

async function resolveConfig(): Promise<Config> {
  const config = await loadConfig();
  const globalOpts = program.opts();
  return applyCliOverrides(config, globalOpts);
}

function handleError(err: unknown): never {
  if (err instanceof ConnectionError) {
    console.error(`Error: ${err.message}`);
  } else if (err instanceof ApiError) {
    console.error(`API Error: ${err.message}`);
  } else if (err instanceof Error) {
    console.error(`Error: ${err.message}`);
  } else {
    console.error('An unexpected error occurred.');
  }
  process.exit(1);
}

// --- sessions ---

const sessionsCmd = program
  .command('sessions [id]')
  .description('List all sessions, or get a specific session by ID (use "active" for current)')
  .option('-j, --json', 'Output raw JSON')
  .action(async (id?: string) => {
    try {
      const config = await resolveConfig();
      const opts = sessionsCmd.opts();
      if (id) {
        await getSession(config, id, opts);
      } else {
        await listSessions(config, opts);
      }
    } catch (err) { handleError(err); }
  });

sessionsCmd
  .command('bookmarks <session_id>')
  .description('List bookmarked entry IDs in a session (use "active" for current)')
  .option('-j, --json', 'Output raw JSON')
  .action(async (sessionId: string) => {
    try {
      const config = await resolveConfig();
      const opts = sessionsCmd.opts();
      await getBookmarks(config, sessionId, opts);
    } catch (err) { handleError(err); }
  });

// --- entries ---

program
  .command('entries')
  .description('List entries in a session (default: active session)')
  .option('-s, --session <id>', 'Session ID (default: active)')
  .option('--selected', 'Only selected entries')
  .option('--bookmarked', 'Only bookmarked entries')
  .option('--highlighted <colors>', 'Filter by highlight (comma-separated: red,green,blue,yellow,gray,orange,pink,purple,strikethrough)')
  .option('-m, --method <method>', 'Filter by HTTP method')
  .option('--status <code>', 'Filter by status code')
  .option('--domain <domain>', 'Filter by domain (substring match)')
  .option('-u, --url <substring>', 'Filter by URL (substring match)')
  .option('-l, --limit <n>', 'Limit number of results')
  .option('-j, --json', 'Output raw JSON')
  .option('--no-body', 'Strip bodies from JSON output')
  .option('-d, --decode-body', 'Decode base64 bodies')
  .action(async function (this: Command) {
    try {
      const config = await resolveConfig();
      await listEntries(config, this.opts());
    } catch (err) { handleError(err); }
  });

// --- entry ---

program
  .command('entry <id>')
  .description('Get a specific entry (use "active" for current)')
  .option('-s, --session <id>', 'Session ID (default: active)')
  .option('-j, --json', 'Output raw JSON')
  .option('--no-body', 'Strip bodies from output')
  .option('-d, --decode-body', 'Decode base64 bodies')
  .option('--full', 'Show full bodies without truncation')
  .action(async function (this: Command, id: string) {
    try {
      const config = await resolveConfig();
      await getEntry(config, id, this.opts());
    } catch (err) { handleError(err); }
  });

// --- body ---

program
  .command('body <id>')
  .description('Get decoded request/response body for an entry')
  .option('-s, --session <id>', 'Session ID (default: active)')
  .option('--request', 'Show request body only')
  .option('--response', 'Show response body only')
  .option('-j, --json', 'Output raw JSON')
  .action(async function (this: Command, id: string) {
    try {
      const config = await resolveConfig();
      await getBody(config, id, this.opts());
    } catch (err) { handleError(err); }
  });

// --- websocket ---

program
  .command('websocket <entry_id>')
  .alias('ws')
  .description('Get WebSocket messages for an entry')
  .option('-s, --session <id>', 'Session ID (default: active)')
  .option('-j, --json', 'Output raw JSON')
  .option('-c, --compact', 'Compact one-line-per-message output')
  .action(async function (this: Command, entryId: string) {
    try {
      const config = await resolveConfig();
      await getWebSocket(config, entryId, this.opts());
    } catch (err) { handleError(err); }
  });

// --- tls ---

program
  .command('tls <connection_id>')
  .description('Get TLS connection handshake details')
  .option('-j, --json', 'Output raw JSON')
  .action(async function (this: Command, connectionId: string) {
    try {
      const config = await resolveConfig();
      await getTls(config, connectionId, this.opts());
    } catch (err) { handleError(err); }
  });

// --- http2 ---

const http2Cmd = program
  .command('http2 <connection_id> [stream_id]')
  .description('List HTTP/2 stream IDs, or get stream detail if stream_id is provided')
  .option('-j, --json', 'Output raw JSON')
  .action(async (connectionId: string, streamId?: string) => {
    try {
      const config = await resolveConfig();
      const opts = http2Cmd.opts();
      if (streamId) {
        await getHttp2Stream(config, connectionId, streamId, opts);
      } else {
        await listHttp2Streams(config, connectionId, opts);
      }
    } catch (err) { handleError(err); }
  });

program.parse();
