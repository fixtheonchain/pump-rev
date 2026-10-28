import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { createAccount, createCurve, fromSeed } from 'nkeys.js';
import { integer, loadEnv, log, required, workspaceRoot } from '@pump/runtime';

type Credentials = { user: string; password: string };
type Permission = { publish: { allow: string[] }; subscribe: { allow: string[] } };
// Subscriptions bind to their known stream; account-wide STREAM.NAMES discovery is unnecessary.
const streamInfo = (stream: string): string[] => ['$JS.API.INFO', `$JS.API.STREAM.INFO.${stream}`];
function consumerPermissions(stream: string, consumer: string, filter: string): string[] {
  return [
    `$JS.API.CONSUMER.CREATE.${stream}.${consumer}`,
    `$JS.API.CONSUMER.CREATE.${stream}.${consumer}.${filter}`,
    `$JS.API.CONSUMER.DURABLE.CREATE.${stream}.${consumer}`,
    `$JS.API.CONSUMER.INFO.${stream}.${consumer}`,
    `$JS.API.CONSUMER.DELETE.${stream}.${consumer}`,
    `$JS.API.CONSUMER.MSG.NEXT.${stream}.${consumer}`,
    `$JS.ACK.${stream}.${consumer}.>`,
  ];
}
export function servicePermissions(): Record<string, Permission> {
  const families = ['trading.events.>', 'communities.>', 'dm.user.*', 'followingFeed.user.*', 'alertsFeed.user.*.*', 'positions.*', 'account_balance_change.*.*', 'holderRewards.>', 'notifications.user.*'];
  return {
    ingest: {
      publish: { allow: ['trading.events.>', ...streamInfo('TRADING_EVENTS'), '$JS.API.STREAM.CREATE.TRADING_EVENTS'] },
      subscribe: { allow: ['_INBOX.ingest.>'] },
    },
    trading: {
      publish: { allow: [...streamInfo('TRADING_EVENTS'), '$JS.API.CONSUMER.CREATE.TRADING_EVENTS', '$JS.API.CONSUMER.INFO.TRADING_EVENTS.*', '$JS.API.CONSUMER.DELETE.TRADING_EVENTS.*', '$JS.API.CONSUMER.MSG.NEXT.TRADING_EVENTS.*', '$JS.ACK.TRADING_EVENTS.>'] },
      subscribe: { allow: ['_INBOX.trading.>'] },
    },
    communities: {
      publish: { allow: ['communities.>', 'dm.user.*', 'followingFeed.user.*', 'alertsFeed.user.*.*', ...streamInfo('COMMUNITIES_EVENTS'), '$JS.API.STREAM.CREATE.COMMUNITIES_EVENTS'] },
      subscribe: { allow: ['_INBOX.communities.>'] },
    },
    keepers: {
      publish: { allow: ['holderRewards.>', ...streamInfo('HOLDER_REWARDS')] },
      subscribe: { allow: ['_INBOX.keepers.>'] },
    },
    notify: {
      publish: { allow: ['notifications.user.*', ...streamInfo('COMMUNITIES_EVENTS'), ...[['notify-dm', 'dm.user.*'], ['notify-following', 'followingFeed.user.*'], ['notify-alerts', 'alertsFeed.user.*.*']].flatMap(([consumer, filter]) => consumerPermissions('COMMUNITIES_EVENTS', consumer, filter))] },
      subscribe: { allow: ['_INBOX.notify.>'] },
    },
    operator: {
      publish: { allow: ['$JS.API.>', ...families] },
      subscribe: { allow: ['_INBOX.operator.>', ...families] },
    },
  };
}
export function prepareNatsAuth(): void {
  loadEnv();
  const root = workspaceRoot(), directory = path.join(root, '.local', 'nats');
  const bytes = integer('NATS_SERVICE_PASSWORD_BYTES');
  if (bytes < 32) throw new Error('NATS_SERVICE_PASSWORD_BYTES must provide at least 256 bits of entropy');
  const timeoutMs = integer('NATS_AUTH_TIMEOUT_MS');
  if (!timeoutMs) throw new Error('NATS_AUTH_TIMEOUT_MS must be positive');
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const key = (filename: string, create: typeof createAccount) => {
    const target = path.join(directory, filename);
    if (!existsSync(target)) {
      const pair = create();
      try { writeFileSync(target, Buffer.from(pair.getSeed()), { mode: 0o600, flag: 'wx' }); }
      finally { pair.clear(); }
    }
    return fromSeed(new TextEncoder().encode(readFileSync(target, 'utf8').trim()));
  };
  const issuer = key('issuer.seed', createAccount), curve = key('curve.seed', createCurve);
  if (!issuer.getPublicKey().startsWith('A') || !curve.getPublicKey().startsWith('X')) throw new Error('Invalid local NATS key types');
  const clientsFile = path.join(directory, 'clients.json');
  const clients: Record<string, Credentials> = existsSync(clientsFile) ? JSON.parse(readFileSync(clientsFile, 'utf8')).clients : {};
  const permissions = servicePermissions();
  const identities = ['auth-callout', 'system', 'public', ...Object.keys(permissions)];
  for (const identity of identities) {
    const username = identity === 'public' ? 'subscriber' : identity;
    if (!clients[identity]) clients[identity] = { user: username, password: randomBytes(bytes).toString('base64url') };
    if (clients[identity].user !== username || typeof clients[identity].password !== 'string' || !clients[identity].password) throw new Error('Invalid existing local NATS credential manifest');
  }
  const replacements: Record<string, string> = {
    AUTH_TIMEOUT_SECONDS: String(timeoutMs / 1000), AUTH_RESPONSE_TTL: JSON.stringify(`${timeoutMs}ms`), AUTH_ISSUER: JSON.stringify(issuer.getPublicKey()), AUTH_XKEY: JSON.stringify(curve.getPublicKey()),
    PASSWORD_AUTH_CALLOUT: JSON.stringify(clients['auth-callout'].password), PASSWORD_SYSTEM: JSON.stringify(clients.system.password), PASSWORD_PUBLIC: JSON.stringify(clients.public.password),
    CORE_USERS: JSON.stringify(Object.entries(permissions).map(([identity, rules]) => ({ user: clients[identity].user, password: clients[identity].password, permissions: rules })), null, 2),
  };
  try {
    const template = readFileSync(path.join(root, 'infra', 'nats', 'server.conf.template'), 'utf8');
    const rendered = template.replace(/@@([A-Z_]+)@@/g, (_match, name: string) => {
      if (replacements[name] === undefined) throw new Error('Unknown NATS config template placeholder');
      return replacements[name];
    });
    writeFileSync(clientsFile, `${JSON.stringify({ version: 1, clients }, null, 2)}\n`, { mode: 0o600 });
    writeFileSync(path.join(directory, 'server.conf'), rendered, { mode: 0o600 });
    writeFileSync(path.join(directory, 'permissions.json'), `${JSON.stringify({ accounts: ['AUTH', 'SYS', 'CORE', 'PUBLIC', 'USER'], services: permissions, publicSubscribe: ['trading.events.>'] }, null, 2)}\n`);
    log('nats-auth', 'configuration_prepared', { directory: '.local/nats', authMode: required('NATS_AUTH_MODE'), restartRequired: true });
  } finally { issuer.clear(); curve.clear(); }
}
if (require.main === module) {
  try { prepareNatsAuth(); }
  catch { log('nats-auth', 'prepare_failed', { reason: 'Invalid configuration or unavailable local credential files' }); process.exitCode = 1; }
}
