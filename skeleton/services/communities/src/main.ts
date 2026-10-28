import { randomUUID } from 'node:crypto';
import { Server, ServerCredentials, credentials, Metadata, status, type sendUnaryData, type ServerUnaryCall } from '@grpc/grpc-js';
import Decimal from 'decimal.js';
import { createClient } from 'redis';
import { JSONCodec, StorageType, type NatsConnection } from 'nats';
import { z } from 'zod';
import { loadPackage } from '@pump/proto';
import { integer, loadEnv, log, natsConnect, pg, required } from '@pump/runtime';
import { CalloutFacts, CalloutPolicy, refusal } from './rules';

// 128 significant digits cover the schema's 78 atomic digits and 36 fractional digits.
const ExactDecimal = Decimal.clone({ precision: 128 });

interface UserRow { id: string; username: string; bio: string; kind: string; canonical_svm_wallet: string | null; canonical_evm_wallet: string | null; banned_at: Date | null; }
interface CalloutRow { id: string; author: string; chain: string; coin: string; thesis: string; media_id: string | null; acting_group: string | null; created_at: Date; price_usd_at_call: string; mcap_usd_at_call: string; status: string; quoted_callout: string | null; }
interface CreateInput { userId: string; wallet: string; coinMint: string; chain: string; thesis: string; asGroupId: string; mediaId: string; quotedCalloutId: string; version: number; sourceRef: string; }
interface Position { amountAtomic: string; valueUsd: string; priceUsd: string; }
interface CoinPrice { coin: { priceUsd: string; marketCapUsd: string }; }
class DomainError extends Error { constructor(readonly registryCode: string) { super(registryCode); } }
function reject(code: string): never { throw new DomainError(code); }
function userDto(row: UserRow): Record<string, unknown> {
  return { id: row.id, username: row.username, bio: row.bio, kind: row.kind, canonicalSvmWallet: row.canonical_svm_wallet ?? '', canonicalEvmWallet: row.canonical_evm_wallet ?? '', banned: !!row.banned_at };
}
const createSchema = z.object({
  userId: z.uuid(), wallet: z.string().min(1), coinMint: z.string().min(1), chain: z.string().min(1), thesis: z.string(),
  asGroupId: z.union([z.uuid(), z.literal('')]), mediaId: z.union([z.uuid(), z.literal('')]), quotedCalloutId: z.union([z.uuid(), z.literal('')]),
  version: z.union([z.literal(1), z.literal(2)]), sourceRef: z.string(),
});
interface ContentModerator { accepts(text: string): boolean; }
class EnvironmentContentModerator implements ContentModerator {
  private readonly terms: string[];
  constructor(private readonly maxLength: number) { this.terms = required('CALLOUT_TEXT_BLOCKLIST').split(',').map(x => x.trim().toLowerCase()).filter(Boolean); }
  accepts(text: string): boolean {
    return text.length <= this.maxLength && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text) && !this.terms.some(term => text.toLowerCase().includes(term));
  }
}
function rpc<T>(client: any, method: string, request: unknown): Promise<T> {
  return new Promise((resolve, rejectRpc) => client[method](request, { deadline: Date.now() + integer('UPSTREAM_TIMEOUT_MS') }, (error: Error | null, value: T) => error ? rejectRpc(error) : resolve(value)));
}

async function main(): Promise<void> {
  loadEnv();
  const policy: CalloutPolicy = { attemptLimit: integer('CALLOUT_ATTEMPT_LIMIT'), spamLimit: integer('CALLOUT_SPAM_LIMIT'), cooldownMs: integer('CALLOUT_COOLDOWN_MS'), minHoldingUsd: required('MIN_CALLOUT_HOLDING_USD') };
  if (new ExactDecimal(policy.minHoldingUsd).isNegative()) throw new Error('MIN_CALLOUT_HOLDING_USD must be nonnegative');
  const attemptWindow = integer('CALLOUT_ATTEMPT_WINDOW_MS');
  const spamWindow = integer('CALLOUT_SPAM_WINDOW_MS');
  const moderator: ContentModerator = new EnvironmentContentModerator(integer('CALLOUT_MAX_THESIS_LENGTH'));
  const tradingPackage = loadPackage('trading.v1');
  const trading = new tradingPackage.TradeApi(required('TRADING_GRPC_URL'), credentials.createInsecure());
  const nc = await natsConnect('communities');
  const redis = createClient({ url: required('REDIS_URL') });
  redis.on('error', () => log('communities', 'redis_error'));
  await redis.connect();
  await ensureStream(nc);
  const js = nc.jetstream();
  const codec = JSONCodec();
  let draining = false;
  async function drainOutbox(): Promise<void> {
    if (draining) return;
    draining = true;
    const client = await pg().connect();
    try {
      await client.query('BEGIN');
      const rows = (await client.query('SELECT id,subject,payload FROM communities_outbox WHERE published_at IS NULL ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT 100')).rows;
      for (const row of rows) {
        // Presence is checked at delivery, including retries. No stale viewer gets an alert.
        if (!row.subject.startsWith('alertsFeed.user.') || await redis.exists(`presence:${row.subject.split('.')[2]}`)) {
          await js.publish(row.subject, codec.encode(row.payload), { msgID: row.id });
        }
        await client.query('UPDATE communities_outbox SET published_at=now() WHERE id=$1', [row.id]);
      }
      await client.query('COMMIT');
    } catch {
      await client.query('ROLLBACK');
      log('communities', 'outbox_retry');
    } finally { client.release(); draining = false; }
  }
  const timer = setInterval(() => void drainOutbox(), integer('OUTBOX_POLL_MS'));
  async function getUser(id: string, client: any = pg()): Promise<UserRow> {
    const row = (await client.query('SELECT * FROM users WHERE id::text=$1 OR canonical_svm_wallet=$1 OR canonical_evm_wallet=$1 OR username::text=$1 LIMIT 1', [id])).rows[0];
    if (!row) reject('PROFILE_NOT_MIRRORED');
    return row;
  }
  async function getCallout(id: string, client: any = pg()): Promise<Record<string, unknown>> {
    const row: CalloutRow | undefined = (await client.query('SELECT * FROM callouts WHERE id=$1 AND status<>\'removed\'', [id])).rows[0];
    if (!row) reject('NOT_FOUND');
    return {
      id: row.id, author: userDto(await getUser(row.author, client)), chain: row.chain, coin: row.coin, thesis: row.thesis,
      mediaId: row.media_id ?? '', actingGroup: row.acting_group ?? '', createdAt: row.created_at.toISOString(),
      priceUsdAtCall: row.price_usd_at_call, calledOutAtMcap: row.mcap_usd_at_call, status: row.status, quotedCalloutId: row.quoted_callout ?? '',
    };
  }
  async function facts(input: CreateInput, client: any, addAttempt: boolean): Promise<CalloutFacts> {
    const user = await getUser(input.userId, client);
    const sessionWallet = (await client.query('SELECT address FROM wallets WHERE user_id=$1 AND address=$2', [user.id, input.wallet])).rows[0];
    if (!sessionWallet) reject('NO_ELIGIBLE_WALLET');
    const now = Date.now();
    const duplicate = (await client.query("SELECT 1 FROM callouts WHERE author=$1 AND ((chain=$2 AND coin=$3 AND status='live') OR ($4::text<>'' AND source_ref=$4)) LIMIT 1", [user.id, input.chain, input.coinMint, input.sourceRef])).rowCount > 0;
    if (addAttempt) await client.query('INSERT INTO callout_write_attempts(author) VALUES($1)', [user.id]);
    const counts = (await client.query(`SELECT count(*) FILTER (WHERE created_at>=now()-$2::bigint*interval '1 millisecond')::int AS attempts,
      count(*) FILTER (WHERE created_at>=now()-$3::bigint*interval '1 millisecond')::int AS spam FROM callout_write_attempts WHERE author=$1`, [user.id, attemptWindow, spamWindow])).rows[0];
    const last = (await client.query('SELECT max(created_at) AS last FROM callouts WHERE author=$1', [user.id])).rows[0].last as Date | null;
    const coin = (await client.query('SELECT * FROM coins WHERE chain=$1 AND address=$2', [input.chain, input.coinMint])).rows[0];
    if (!coin) reject('PRICE_UNAVAILABLE');
    const wallets = (await client.query('SELECT address FROM wallets WHERE user_id=$1 AND chain=$2 AND reserved=false', [user.id, input.chain])).rows;
    const groupAdmin = input.asGroupId ? !!(await client.query("SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2 AND role IN ('OWNER','ADMIN') AND status='ACTIVE'", [input.asGroupId, user.id])).rowCount : false;
    const mediaClean = input.mediaId ? !!(await client.query("SELECT 1 FROM callout_media WHERE id=$1 AND owner=$2 AND status='clean'", [input.mediaId, user.id])).rowCount : true;
    const quoteValid = input.quotedCalloutId ? !!(await client.query("SELECT 1 FROM callouts WHERE id=$1 AND status='live'", [input.quotedCalloutId])).rowCount : true;
    const baseFacts: CalloutFacts = {
      duplicate, attempts: counts.attempts + (addAttempt ? 0 : 1), spamAttempts: counts.spam + (addAttempt ? 0 : 1), lastCreatedAtMs: last?.getTime() ?? null, nowMs: now,
      contentValid: moderator.accepts(input.thesis) && mediaClean && quoteValid && !input.sourceRef,
      eligibleWallets: wallets.length, holdingAtomic: '0', holdingUsd: '0', priceUsd: '0', marketCapUsd: '0',
      mayhemRunning: coin.mayhem_mode && (!coin.mayhem_ends_at || coin.mayhem_ends_at.getTime() > now),
      groupRequested: !!input.asGroupId, groupActor: user.kind === 'GROUP', groupAdmin,
      userBanned: !!user.banned_at, coinBlocked: coin.security_verdict?.verdict === 'block' || coin.security_verdict?.verdict === 'blocked',
    };
    // Cheap refusals do not depend on TradeApi availability.
    if (duplicate || baseFacts.userBanned || baseFacts.coinBlocked || baseFacts.attempts > policy.attemptLimit || baseFacts.spamAttempts > policy.spamLimit ||
      (baseFacts.lastCreatedAtMs !== null && now - baseFacts.lastCreatedAtMs < policy.cooldownMs) || !baseFacts.contentValid ||
      (baseFacts.groupRequested && !groupAdmin) || (baseFacts.groupActor && !baseFacts.groupRequested) || !wallets.length || baseFacts.mayhemRunning) return baseFacts;
    const [price, positions] = await Promise.all([
      rpc<CoinPrice>(trading, 'getCoin', { chain: input.chain, address: input.coinMint }),
      Promise.all(wallets.map((wallet: { address: string }) => rpc<Position>(trading, 'getPosition', { chain: input.chain, address: input.coinMint, wallet: wallet.address }))),
    ]);
    return { ...baseFacts, priceUsd: price.coin.priceUsd, marketCapUsd: price.coin.marketCapUsd,
      holdingAtomic: positions.reduce((sum, x) => sum.plus(x.amountAtomic), new ExactDecimal(0)).toFixed(),
      holdingUsd: positions.reduce((sum, x) => sum.plus(x.valueUsd), new ExactDecimal(0)).toFixed() };
  }
  async function createCallout(raw: unknown): Promise<Record<string, unknown>> {
    const input = createSchema.parse(raw);
    const client = await pg().connect();
    let committed = false;
    try {
      await client.query('BEGIN');
      // One author lock covers duplicate, budgets, cooldown and publication atomically.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [input.userId]);
      const current = await facts(input, client, true);
      const code = refusal(current, policy);
      if (code) {
        await client.query('COMMIT'); committed = true;
        reject(code);
      }
      const id = randomUUID();
      await client.query(`INSERT INTO callouts(id,author,acting_group,chain,coin,thesis,media_id,quoted_callout,price_usd_at_call,mcap_usd_at_call)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [id, input.userId, input.asGroupId || null, input.chain, input.coinMint, input.thesis, input.mediaId || null, input.quotedCalloutId || null, current.priceUsd, current.marketCapUsd]);
      const callout = await getCallout(id, client);
      const payload = { type: 'callout.created', id, callout };
      const followers = (await client.query('SELECT follower FROM follows WHERE followee=$1', [input.userId])).rows;
      // The internal creation subject is inferred; the followingFeed/alertsFeed families are observed.
      const subjects = ['communities.callouts.created', ...followers.flatMap((x: { follower: string }) => [`followingFeed.user.${x.follower}`, `alertsFeed.user.${x.follower}.callout`])];
      for (const subject of subjects) await client.query('INSERT INTO communities_outbox(id,subject,payload) VALUES($1,$2,$3::jsonb)', [randomUUID(), subject, JSON.stringify(payload)]);
      await client.query('COMMIT'); committed = true;
      void drainOutbox();
      return { callout };
    } catch (error: any) {
      if (!committed) await client.query('ROLLBACK');
      if (error.code === '23505' && ['one_live_callout', 'one_callout_per_pull'].includes(error.constraint)) reject('DUPLICATE_CALLOUT');
      throw error;
    } finally { client.release(); }
  }
  type Unary = (request: any) => Promise<any>;
  function handler(fn: Unary): (call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) => void {
    return (call, callback) => { void fn(call.request).then(value => callback(null, value)).catch(error => {
      if (error instanceof DomainError) {
        const metadata = new Metadata(); metadata.set('error-code', error.registryCode);
        const code = error.registryCode === 'DUPLICATE_CALLOUT' ? status.ALREADY_EXISTS
          : ['COOLDOWN', 'ATTEMPT_LIMIT', 'SPAM_RESTRICTED'].includes(error.registryCode) ? status.RESOURCE_EXHAUSTED
          : error.registryCode === 'NOT_FOUND' || error.registryCode === 'PROFILE_NOT_MIRRORED' ? status.NOT_FOUND : status.FAILED_PRECONDITION;
        callback({ code, details: error.registryCode, metadata });
      } else if (error instanceof z.ZodError) callback({ code: status.INVALID_ARGUMENT, details: 'Invalid communities input' });
      else if (typeof error.code === 'number') callback({ code: error.code, details: 'Trading lane unavailable' });
      else { log('communities', 'request_failed'); callback({ code: status.INTERNAL, details: 'Communities request failed' }); }
    }); };
  }
  const api = loadPackage('communities.v1');
  const server = new Server();
  server.addService(api.CommunitiesApi.service, {
    getUser: handler(async request => userDto(await getUser(z.string().min(1).parse(request.id)))),
    listUsers: handler(async request => {
      const limit = Math.min(integer('COMMUNITIES_PAGE_LIMIT'), Math.max(1, request.limit || integer('COMMUNITIES_PAGE_LIMIT')));
      const rows = (await pg().query('SELECT * FROM users WHERE id::text>$1 AND (username ILIKE $2 OR canonical_svm_wallet=$3) ORDER BY id LIMIT $4', [request.cursor || '', `%${request.search || ''}%`, request.search || '', limit + 1])).rows;
      return { users: rows.slice(0, limit).map(userDto), nextCursor: rows.length > limit ? rows[limit - 1].id : '', count: rows.slice(0, limit).length };
    }),
    follow: handler(async request => {
      z.uuid().parse(request.userId); z.uuid().parse(request.targetUserId);
      if (request.userId === request.targetUserId) reject('INVALID_CONTENT');
      const client = await pg().connect();
      try {
        await client.query('BEGIN');
        const user = await getUser(request.userId, client); const target = await getUser(request.targetUserId, client);
        if (user.banned_at || target.banned_at) reject('WALLET_NOT_ALLOWED');
        const mutation = request.remove
          ? await client.query('DELETE FROM follows WHERE follower=$1 AND followee=$2 RETURNING followee', [user.id, target.id])
          : await client.query('INSERT INTO follows(follower,followee,origin) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING followee', [user.id, target.id, request.origin || null]);
        if (mutation.rowCount) await client.query('INSERT INTO communities_outbox(id,subject,payload) VALUES($1,$2,$3::jsonb)',
          [randomUUID(), 'communities.follow.changed', JSON.stringify({ type: 'follow.changed', follower: user.id, followee: target.id, following: !request.remove })]);
        await client.query('COMMIT');
        void drainOutbox();
        return { following: !request.remove };
      } catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
    }),
    getFollowing: handler(async request => {
      const user = await getUser(request.userId);
      const limit = Math.min(integer('COMMUNITIES_PAGE_LIMIT'), Math.max(1, request.limit || integer('COMMUNITIES_PAGE_LIMIT')));
      const edge = request.followers ? 'followee' : 'follower';
      const peer = request.followers ? 'follower' : 'followee';
      const rows = (await pg().query(`SELECT u.* FROM follows f JOIN users u ON u.id=f.${peer} WHERE f.${edge}=$1 AND u.id::text>$2 ORDER BY u.id LIMIT $3`, [user.id, request.cursor || '', limit + 1])).rows;
      const count = (await pg().query(`SELECT count(*)::int AS count FROM follows WHERE ${edge}=$1`, [user.id])).rows[0].count;
      return { users: rows.slice(0, limit).map(userDto), nextCursor: rows.length > limit ? rows[limit - 1].id : '', count };
    }),
    createCallout: handler(createCallout),
    getCallout: handler(request => getCallout(z.uuid().parse(request.id))),
    getEligibility: handler(async request => {
      const input = createSchema.parse({ ...request, thesis: '', mediaId: '', quotedCalloutId: '', version: 1, sourceRef: '' });
      const client = await pg().connect();
      try {
        const current = await facts(input, client, false);
        const reason = refusal(current, policy);
        return { eligible: !reason, reason: reason === 'DUPLICATE_CALLOUT' ? 'EXISTING_CALLOUT' : reason || '', preflight: { existingCallout: current.duplicate, attemptsRemaining: Math.max(0, policy.attemptLimit - current.attempts + 1), cooldownUntil: current.lastCreatedAtMs === null ? '' : new Date(current.lastCreatedAtMs + policy.cooldownMs).toISOString() } };
      } finally { client.release(); }
    }),
    health: handler(async () => { await pg().query('SELECT 1'); await redis.ping(); await nc.flush(); return { status: 'ok' }; }),
  });
  await new Promise<void>((resolve, rejectBind) => server.bindAsync(process.env.COMMUNITIES_GRPC_BIND ?? required('COMMUNITIES_GRPC_URL'), ServerCredentials.createInsecure(), error => error ? rejectBind(error) : resolve()));
  log('communities', 'started', { address: required('COMMUNITIES_GRPC_URL') });
  await drainOutbox();
  async function shutdown(): Promise<void> {
    clearInterval(timer);
    await new Promise<void>(resolve => server.tryShutdown(() => resolve()));
    trading.close(); await nc.drain(); await redis.quit(); await pg().end();
  }
  process.once('SIGINT', () => void shutdown()); process.once('SIGTERM', () => void shutdown());
}

async function ensureStream(nc: NatsConnection): Promise<void> {
  const jsm = await nc.jetstreamManager();
  try { await jsm.streams.info('COMMUNITIES_EVENTS'); }
  catch (error: any) {
    if (error.code !== '404') throw error;
    await jsm.streams.add({ name: 'COMMUNITIES_EVENTS', subjects: ['communities.>', 'followingFeed.user.*', 'alertsFeed.user.*.*'], storage: StorageType.File });
  }
}
main().catch(error => { log('communities', 'startup_failed', { reason: error instanceof Error && /configuration|CALLOUT_|MIN_CALLOUT_/.test(error.message) ? error.message : 'Dependency startup failed' }); process.exitCode = 1; });



