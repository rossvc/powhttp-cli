export interface Session {
  id: string;
  name: string;
  entryIds: string[];
}

export interface SocketAddress {
  ip: string;
  port: number | null;
}

export interface SessionEntry {
  id: string;
  url: string;
  clientAddr: SocketAddress | null;
  remoteAddr: SocketAddress | null;
  httpVersion: string;
  transactionType: 'request' | 'push_promise';
  request: {
    method: string | null;
    path: string | null;
    httpVersion: string | null;
    headers: Array<[string, string]>;
    body: string | null;
  };
  response: {
    httpVersion: string | null;
    statusCode: number | null;
    statusText: string | null;
    headers: Array<[string, string]>;
    body: string | null;
  } | null;
  isWebSocket: boolean;
  tls: {
    connectionId: string | null;
    tlsVersion: number | null;
    cipherSuite: number | null;
    ja3: { string: string; hash: string } | null;
    ja4: { raw: string; hashed: string } | null;
  };
  http2: {
    connectionId: string;
    streamId: number;
  } | null;
  timings: {
    startedAt: number;
    blocked: number | null;
    dns: number | null;
    connect: number | null;
    send: number | null;
    wait: number | null;
    receive: number | null;
    ssl: number | null;
  };
  process: {
    pid: number;
    name: string | null;
  } | null;
}

export type WebSocketMessageContent =
  | { type: 'text'; text: string }
  | { type: 'binary'; data: string }
  | { type: 'close'; code: number; reason: string }
  | { type: 'ping'; data: string }
  | { type: 'pong'; data: string }
  | { type: 'unknown'; data: string };

export interface WebSocketMessage {
  side: 'client' | 'server';
  startedAt: number | null;
  endedAt: number | null;
  content: WebSocketMessageContent;
}
