import { apiGet } from '../client.js';
import { formatJson } from '../formatters/json.js';
import type { Config } from '../config.js';

export async function listHttp2Streams(config: Config, connectionId: string, opts: { json?: boolean }): Promise<void> {
  const streamIds = await apiGet<number[]>(config, `/http2/${connectionId}`);

  if (opts.json) {
    console.log(formatJson(streamIds));
  } else if (streamIds.length === 0) {
    console.log('No streams found.');
  } else {
    console.log(`Streams: ${streamIds.join(', ')}`);
  }
}

export async function getHttp2Stream(
  config: Config,
  connectionId: string,
  streamId: string,
  opts: { json?: boolean }
): Promise<void> {
  const events = await apiGet<unknown[]>(config, `/http2/${connectionId}/streams/${streamId}`);

  if (opts.json) {
    console.log(formatJson(events));
  } else {
    // HTTP/2 events have variable structure, JSON is the most useful format
    console.log(formatJson(events));
  }
}
