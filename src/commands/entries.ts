import { apiGet } from '../client.js';
import { compactEntries } from '../formatters/compact.js';
import { detailEntry, type EntryDetailOptions } from '../formatters/detail.js';
import { formatJson } from '../formatters/json.js';
import { decodeBase64, extractDomain } from '../utils.js';
import type { Config } from '../config.js';
import type { SessionEntry } from '../types.js';

export interface ListEntriesOpts {
  session?: string;
  selected?: boolean;
  bookmarked?: boolean;
  highlighted?: string;
  method?: string;
  status?: string;
  domain?: string;
  url?: string;
  limit?: string;
  json?: boolean;
  noBody?: boolean;
  decodeBody?: boolean;
}

export async function listEntries(config: Config, opts: ListEntriesOpts): Promise<void> {
  const sessionId = opts.session ?? 'active';
  const params = new URLSearchParams();
  if (opts.selected) params.set('selected', '');
  if (opts.bookmarked) params.set('bookmarked', '');
  if (opts.highlighted) params.set('highlighted', opts.highlighted);

  const qs = params.toString();
  const path = `/sessions/${sessionId}/entries${qs ? '?' + qs : ''}`;
  let entries = await apiGet<SessionEntry[]>(config, path);

  // Client-side filters
  if (opts.method) {
    const m = opts.method.toUpperCase();
    entries = entries.filter(e => e.request.method?.toUpperCase() === m);
  }
  if (opts.status) {
    const s = parseInt(opts.status, 10);
    entries = entries.filter(e => e.response?.statusCode === s);
  }
  if (opts.domain) {
    const d = opts.domain.toLowerCase();
    entries = entries.filter(e => extractDomain(e.url).toLowerCase().includes(d));
  }
  if (opts.url) {
    const u = opts.url.toLowerCase();
    entries = entries.filter(e => e.url.toLowerCase().includes(u));
  }
  if (opts.limit) {
    entries = entries.slice(0, parseInt(opts.limit, 10));
  }

  if (opts.json) {
    if (opts.noBody) {
      entries = stripBodies(entries);
    }
    console.log(formatJson(entries));
  } else {
    console.log(compactEntries(entries));
  }
}

export interface GetEntryOpts {
  session?: string;
  json?: boolean;
  noBody?: boolean;
  decodeBody?: boolean;
  full?: boolean;
}

export async function getEntry(config: Config, entryId: string, opts: GetEntryOpts): Promise<void> {
  const sessionId = opts.session ?? 'active';
  const entry = await apiGet<SessionEntry>(config, `/sessions/${sessionId}/entries/${entryId}`);

  if (opts.json) {
    const output = opts.noBody ? stripBodies([entry])[0] : entry;
    console.log(formatJson(output));
  } else {
    const detailOpts: EntryDetailOptions = {
      decodeBody: opts.decodeBody,
      noBody: opts.noBody,
      full: opts.full,
    };
    console.log(detailEntry(entry, detailOpts));
  }
}

export interface BodyOpts {
  session?: string;
  request?: boolean;
  response?: boolean;
  json?: boolean;
}

export async function getBody(config: Config, entryId: string, opts: BodyOpts): Promise<void> {
  const sessionId = opts.session ?? 'active';
  const entry = await apiGet<SessionEntry>(config, `/sessions/${sessionId}/entries/${entryId}`);

  const showRequest = opts.request || (!opts.request && !opts.response);
  const showResponse = opts.response || (!opts.request && !opts.response);

  if (opts.json) {
    const result: Record<string, string | null> = {};
    if (showRequest) result.requestBody = decodeBase64(entry.request.body);
    if (showResponse) result.responseBody = entry.response ? decodeBase64(entry.response.body) : null;
    console.log(formatJson(result));
    return;
  }

  if (showRequest) {
    if (showResponse) console.log('--- Request Body ---');
    const decoded = decodeBase64(entry.request.body);
    console.log(decoded ?? '(no body)');
  }
  if (showResponse) {
    if (showRequest) console.log('\n--- Response Body ---');
    const decoded = entry.response ? decodeBase64(entry.response.body) : null;
    console.log(decoded ?? '(no body)');
  }
}

function stripBodies(entries: SessionEntry[]): SessionEntry[] {
  return entries.map(e => ({
    ...e,
    request: { ...e.request, body: null },
    response: e.response ? { ...e.response, body: null } : null,
  }));
}
