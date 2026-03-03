import { baseUrl, type Config } from './config.js';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ConnectionError extends Error {
  constructor(host: string, port: number) {
    super(
      `Cannot connect to powhttp Data API at ${host}:${port}. ` +
      `Make sure powhttp is running and the Data API is enabled (Settings → Data API).`
    );
    this.name = 'ConnectionError';
  }
}

export async function apiGet<T>(config: Config, path: string): Promise<T> {
  const url = `${baseUrl(config)}${path}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new ConnectionError(config.host, config.port);
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json() as { error?: string };
      if (body.error) message = body.error;
    } catch { /* ignore parse errors */ }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}
