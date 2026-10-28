import path from 'node:path';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { connect, type NatsConnection } from 'nats';
import { createClient } from 'redis';

export function loadEnv(): void { dotenv.config({ path: path.join(workspaceRoot(), '.env'), quiet: true }); }
export function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') throw new Error(`Missing required configuration: ${name}`);
  return value;
}
export function integer(name: string): number {
  const text = required(name);
  const value = Number(text);
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(value)) throw new Error(`Invalid integer configuration: ${name}`);
  return value;
}
let pool: Pool | undefined;
export function pg(): Pool { return pool ??= new Pool({ connectionString: required('DATABASE_URL') }); }
async function chRequest(sql: string, params?: Record<string, unknown>): Promise<string> {
  const url = new URL(required('CLICKHOUSE_URL'));
  url.searchParams.set('database', required('CLICKHOUSE_DATABASE'));
  for (const [key, value] of Object.entries(params ?? {})) url.searchParams.set(`param_${key}`, String(value));
  const response = await fetch(url, {
    method: 'POST', body: sql,
    headers: { Authorization: `Basic ${Buffer.from(`${required('CLICKHOUSE_USER')}:${required('CLICKHOUSE_PASSWORD')}`).toString('base64')}` },
    signal: AbortSignal.timeout(integer('UPSTREAM_TIMEOUT_MS')),
  });
  const result = await response.text();
  if (!response.ok) throw new Error(`ClickHouse request failed (${response.status}): ${result.slice(0, 400)}`);
  return result;
}
export async function chQuery<T = Record<string, unknown>>(sql: string, params?: Record<string, unknown>): Promise<T[]> {
  const raw = await chRequest(`${sql.trim().replace(/;$/, '')} FORMAT JSONEachRow`, params);
  return raw.trim() ? raw.trim().split('\n').map(line => JSON.parse(line) as T) : [];
}
export async function chExec(sql: string): Promise<void> { await chRequest(sql); }
export async function chInsert(table: string, rows: unknown[]): Promise<void> {
  if (!/^[a-z_]+$/.test(table)) throw new Error('Invalid ClickHouse table');
  if (rows.length) await chExec(`INSERT INTO ${table} FORMAT JSONEachRow\n${rows.map(row => JSON.stringify(row)).join('\n')}`);
}
export function natsConnect(service?: string): Promise<NatsConnection> {
  const mode = required('NATS_AUTH_MODE');
  if (!['off', 'on'].includes(mode)) throw new Error('NATS_AUTH_MODE must be off or on');
  const identity = service ?? process.env.NATS_SERVICE_IDENTITY;
  if (identity !== undefined && !/^[a-z][a-z0-9-]*$/.test(identity)) throw new Error('Invalid NATS_SERVICE_IDENTITY');
  const options: Parameters<typeof connect>[0] = {
    servers: required('NATS_URL'),
    name: `pumpskel:${identity ?? 'unscoped'}`,
    ...(identity ? { inboxPrefix: `_INBOX.${identity}` } : {}),
  };
  if (mode === 'on') {
    if (!identity) throw new Error('NATS_SERVICE_IDENTITY is required when NATS_AUTH_MODE=on');
    let credentials: { user: string; password: string };
    try {
      const manifest = JSON.parse(readFileSync(path.resolve(workspaceRoot(), required('NATS_CREDENTIALS_FILE')), 'utf8'));
      credentials = manifest.clients?.[identity];
      if (!credentials || typeof credentials.user !== 'string' || typeof credentials.password !== 'string' || !credentials.password) throw new Error();
    } catch { throw new Error(`NATS credentials unavailable for service identity: ${identity}`); }
    options.user = credentials.user;
    options.pass = credentials.password;
  }
  return connect(options).catch(() => { throw new Error('NATS connection failed'); }).then(async connection => {
    if (mode === 'on' && connection.info?.auth_required !== true) {
      await connection.close();
      throw new Error('NATS_AUTH_MODE=on requires authentication to be enabled on the broker');
    }
    return connection;
  });
}
function newRedisConnection() { return createClient({url: required('REDIS_URL')}); }
export type RedisConnection = ReturnType<typeof newRedisConnection>;
let redisPromise: Promise<RedisConnection> | undefined;
export function redis(): Promise<RedisConnection> {
  return redisPromise ??= (async () => {
    const client = newRedisConnection();
    client.on('error', () => log('redis', 'connection_error'));
    await client.connect();
    return client;
  })();
}
export function log(service: string, event: string, fields: Record<string, unknown> = {}): void {
  process.stdout.write(`${JSON.stringify({time: new Date().toISOString(),service,event,...fields})}\n`);
}
export function workspaceRoot(): string { return path.resolve(__dirname, '../../..'); }

// Only fixed classifications cross the logging boundary; dependency errors may contain credentials.
export function dependencyFailure(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  if (['PERMISSIONS_VIOLATION', '403'].includes(code)) return 'Permission denied';
  if (['AUTHORIZATION_VIOLATION', 'AUTHENTICATION_EXPIRED', '401'].includes(code)) return 'Authentication rejected';
  if (['TIMEOUT', 'CONNECTION_TIMEOUT', 'AUTHENTICATION_TIMEOUT', 'ETIMEDOUT', '408', '503'].includes(code)) return 'Dependency request timed out or unavailable';
  if (['CONNECTION_REFUSED', 'ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH'].includes(code)) return 'Dependency connection failed';
  if (code === '404') return 'Required dependency resource not found';
  return 'Dependency operation failed';
}
