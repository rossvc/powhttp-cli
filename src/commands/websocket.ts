import { apiGet } from '../client.js';
import { compactWebSocket } from '../formatters/compact.js';
import { detailWebSocket } from '../formatters/detail.js';
import { formatJson } from '../formatters/json.js';
import type { Config } from '../config.js';
import type { WebSocketMessage } from '../types.js';

export interface WebSocketOpts {
  session?: string;
  json?: boolean;
  compact?: boolean;
}

export async function getWebSocket(config: Config, entryId: string, opts: WebSocketOpts): Promise<void> {
  const sessionId = opts.session ?? 'active';
  const messages = await apiGet<WebSocketMessage[]>(
    config,
    `/sessions/${sessionId}/entries/${entryId}/websocket`
  );

  if (opts.json) {
    console.log(formatJson(messages));
  } else if (opts.compact) {
    console.log(compactWebSocket(messages));
  } else {
    console.log(detailWebSocket(messages));
  }
}
