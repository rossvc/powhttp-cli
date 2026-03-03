import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import JSON5 from 'json5';

export interface Config {
  port: number;
  host: string;
}

const DEFAULTS: Config = {
  port: 7777,
  host: 'localhost',
};

const CONFIG_DIR = join(homedir(), '.powhttp-cli');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

export async function loadConfig(): Promise<Config> {
  let fileConfig: Partial<Config> = {};

  try {
    const raw = await readFile(CONFIG_PATH, 'utf8');
    fileConfig = JSON5.parse(raw) as Partial<Config>;
  } catch {
    // No config file — that's fine
  }

  return {
    port: toNumber(process.env.POWHTTP_PORT) ?? fileConfig.port ?? DEFAULTS.port,
    host: process.env.POWHTTP_HOST ?? fileConfig.host ?? DEFAULTS.host,
  };
}

export function applyCliOverrides(config: Config, opts: { port?: string; host?: string }): Config {
  return {
    port: opts.port ? parseInt(opts.port, 10) : config.port,
    host: opts.host ?? config.host,
  };
}

export function baseUrl(config: Config): string {
  return `http://${config.host}:${config.port}`;
}

function toNumber(val: string | undefined): number | undefined {
  if (val === undefined) return undefined;
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? undefined : n;
}
