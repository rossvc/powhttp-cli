import { apiGet } from '../client.js';
import { formatJson } from '../formatters/json.js';
import type { Config } from '../config.js';

export async function getTls(config: Config, connectionId: string, opts: { json?: boolean }): Promise<void> {
  const events = await apiGet<unknown[]>(config, `/tls/${connectionId}`);

  if (opts.json) {
    console.log(formatJson(events));
  } else {
    // TLS events have variable structure, JSON is the most useful format
    console.log(formatJson(events));
  }
}
