import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createUser, fromPublic, fromSeed, type KeyPair } from 'nkeys.js';
import { required, workspaceRoot } from '@pump/runtime';

// Research: reconstruction/data-pipeline.md and features/developer-api.md.
export const USER_GRANT_TTL_SECONDS = 60 * 60;
export const AUTH_REQUEST_SUBJECT = '$SYS.REQ.USER.AUTH';
export type UserGrantInput = { userId: string; wallets: string[]; sessionJti: string };
export type UserGrant = {
  token: string;
  expiresAt: string;
  expiresInSeconds: number;
  subjects: string[];
  server: string;
  account: 'USER';
  authentication: 'token';
};
export type NatsClaims = {
  jti: string;
  iat: number;
  exp: number;
  iss: string;
  sub: string;
  aud: string;
  name?: string;
  nats: Record<string, unknown>;
  pump?: UserGrantInput;
};
export class NatsAuthorizationError extends Error {
  constructor(readonly rule: string) { super('NATS authorization rule rejected'); }
}
function invalid(rule: string): never { throw new NatsAuthorizationError(rule); }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function userSubjects(input: UserGrantInput): string[] {
  if (!input || !uuid.test(input.userId) || !uuid.test(input.sessionJti)) invalid('grant_identity');
  if (!Array.isArray(input.wallets)) invalid('grant_wallets');
  const wallets = [...new Set(input.wallets)];
  if (wallets.length === 0 || wallets.some(wallet => typeof wallet !== 'string' || !/^(?:[1-9A-HJ-NP-Za-km-z]{32,44}|0x[0-9a-fA-F]{40})$/.test(wallet))) invalid('grant_wallets');
  return [
    `dm.user.${input.userId}`,
    `followingFeed.user.${input.userId}`,
    `alertsFeed.user.${input.userId}.*`,
    // Locally defined notification delivery subject family.
    `notifications.user.${input.userId}`,
    ...wallets.flatMap(wallet => [`positions.${wallet}`, `account_balance_change.${wallet}.*`]),
  ];
}
export function loadNkey(fileVariable: string): KeyPair {
  try { return fromSeed(new TextEncoder().encode(readFileSync(path.resolve(workspaceRoot(), required(fileVariable)), 'utf8').trim())); }
  catch { throw new Error(`Invalid or unavailable key file: ${fileVariable}`); }
}
export function issuerKey(): KeyPair {
  const key = loadNkey('NATS_AUTH_ISSUER_SEED_FILE');
  if (!key.getPublicKey().startsWith('A')) { key.clear(); throw new Error('NATS auth issuer must be an account NKey'); }
  return key;
}
export function signNatsClaims(claims: Omit<NatsClaims, 'jti' | 'iat' | 'iss'>, key: KeyPair): string {
  const iat = Math.floor(Date.now() / 1000);
  const unsigned = { ...claims, iat, iss: key.getPublicKey() };
  // The NATS JWT id is base32(SHA256(claim without jti)), as in jwt/v2.
  const jti = base32(createHash('sha256').update(JSON.stringify(unsigned)).digest());
  const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ed25519-nkey' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ ...unsigned, jti })).toString('base64url');
  const input = `${header}.${payload}`;
  return `${input}.${Buffer.from(key.sign(new TextEncoder().encode(input))).toString('base64url')}`;
}
function base32(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let accumulator = 0, bits = 0, output = '';
  for (const byte of bytes) {
    accumulator = (accumulator << 8) | byte; bits += 8;
    while (bits >= 5) { bits -= 5; output += alphabet[(accumulator >>> bits) & 31]; }
  }
  if (bits) output += alphabet[(accumulator << (5 - bits)) & 31];
  return output;
}
export function verifyNatsClaims(token: string, expectedIssuer?: string): NatsClaims {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) invalid('jwt_format');
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (header.alg !== 'ed25519-nkey' || !['JWT', 'jwt'].includes(header.typ)) invalid('jwt_header');
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as NatsClaims;
    if (!claims || typeof claims.iss !== 'string' || (expectedIssuer && claims.iss !== expectedIssuer)) invalid('jwt_issuer');
    if (!fromPublic(claims.iss).verify(new TextEncoder().encode(`${parts[0]}.${parts[1]}`), Buffer.from(parts[2], 'base64url'))) invalid('jwt_signature');
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isSafeInteger(claims.iat) || !Number.isSafeInteger(claims.exp) || claims.exp <= now || claims.iat > now || claims.exp <= claims.iat) invalid('jwt_validity');
    if (!claims.nats || claims.nats.version !== 2) invalid('jwt_version');
    return claims;
  } catch (error) { if (error instanceof NatsAuthorizationError) throw error; invalid('jwt_format_or_key'); }
}
export function createUserGrant(input: UserGrantInput): UserGrant {
  const server = required('NATS_PUBLIC_URL'), publicUrl = new URL(server);
  if (!['nats:', 'tls:', 'ws:', 'wss:'].includes(publicUrl.protocol) || publicUrl.username || publicUrl.password || publicUrl.search || publicUrl.hash) throw new Error('NATS_PUBLIC_URL must be a public NATS endpoint without embedded credentials');
  const subjects = userSubjects(input), key = issuerKey(), user = createUser();
  const exp = Math.floor(Date.now() / 1000) + USER_GRANT_TTL_SECONDS;
  try {
    const token = signNatsClaims({
      sub: user.getPublicKey(), aud: 'USER', name: `user:${input.userId}`, exp,
      nats: { type: 'user', version: 2, bearer_token: true, pub: { deny: ['>'] }, sub: { allow: subjects }, subs: -1, data: -1, payload: -1 },
      pump: { userId: input.userId, wallets: [...new Set(input.wallets)], sessionJti: input.sessionJti },
    }, key);
    return { token, expiresAt: new Date(exp * 1000).toISOString(), expiresInSeconds: USER_GRANT_TTL_SECONDS, subjects, server, account: 'USER', authentication: 'token' };
  } finally { key.clear(); user.clear(); }
}
export function verifyUserGrant(token: string, expectedIssuer: string): NatsClaims & { pump: UserGrantInput } {
  const claims = verifyNatsClaims(token, expectedIssuer);
  if (claims.aud !== 'USER') invalid('grant_account');
  if (typeof claims.sub !== 'string' || !claims.sub.startsWith('U') || claims.nats.type !== 'user' || claims.nats.bearer_token !== true || !claims.pump) invalid('grant_type');
  if (claims.exp - claims.iat > USER_GRANT_TTL_SECONDS) invalid('grant_ttl');
  const subjects = userSubjects(claims.pump);
  const permissions = claims.nats.sub as { allow?: unknown };
  const publishing = claims.nats.pub as { deny?: unknown };
  if (JSON.stringify(permissions?.allow) !== JSON.stringify(subjects) || JSON.stringify(publishing?.deny) !== JSON.stringify(['>'])) invalid('grant_subject_scope');
  return claims as NatsClaims & { pump: UserGrantInput };
}
