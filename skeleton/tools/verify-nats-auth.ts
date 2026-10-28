import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { AckPolicy, connect, tokenAuthenticator, type NatsConnection, type Subscription } from 'nats';
import { integer, loadEnv, log, natsConnect, pg, required } from '@pump/runtime';
import type { UserGrant } from '@pump/nats-auth';

// Only verifier-owned step/rule names and allowlisted categories reach the log.
// Assertion messages and upstream errors may contain credentials; never print them.
class VerificationFailure extends Error {
  constructor(readonly step: string, readonly rule: string, readonly category: string, readonly httpStatus?: number) { super('NATS auth verification failed'); }
}
class HttpFailure extends Error { constructor(readonly status: number) { super('HTTP prerequisite failed'); } }
function category(error: unknown): string {
  if (error instanceof HttpFailure) return 'http_status';
  if (error instanceof assert.AssertionError) return 'assertion';
  const code = (error as { code?: unknown })?.code;
  if (['AUTHORIZATION_VIOLATION', 'AUTHENTICATION_EXPIRED', 'BAD_AUTHENTICATION'].includes(String(code))) return 'authentication';
  if (code === 'PERMISSIONS_VIOLATION') return 'permission';
  if (['TIMEOUT', 'ECONNREFUSED', 'CONNECTION_CLOSED', '503'].includes(String(code))) return code === 'TIMEOUT' ? 'timeout' : 'unavailable';
  if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)) return 'timeout';
  return 'operation_failed';
}
async function step<T>(name: string, rule: string, operation: () => Promise<T>): Promise<T> {
  log('nats-auth-verify', 'step_started', { step: name, rule });
  try { const result = await operation(); log('nats-auth-verify', 'step_passed', { step: name, rule }); return result; }
  catch (error) { throw new VerificationFailure(name, rule, category(error), error instanceof HttpFailure ? error.status : undefined); }
}
async function expectDenied(nc: NatsConnection, subject: string, operation: 'publish' | 'subscription', action: () => void): Promise<void> {
  const statuses = nc.status()[Symbol.asyncIterator]();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const denied = (async () => {
    while (true) {
      const next = await statuses.next();
      if (next.done) throw new Error('Connection closed before permission evidence');
      if (next.value.type === 'error' && next.value.permissionContext?.subject === subject && next.value.permissionContext.operation === operation) return;
    }
  })();
  try {
    action(); await nc.flush();
    await Promise.race([denied, new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(new Error('Expected permission rejection was not observed')), integer('NATS_AUTH_VERIFY_TIMEOUT_MS')); })]);
  } finally { if (timer) clearTimeout(timer); void statuses.return?.(); }
}
async function deniedSubscription(nc: NatsConnection, subject: string): Promise<void> {
  let subscription: Subscription | undefined;
  try { await expectDenied(nc, subject, 'subscription', () => { subscription = nc.subscribe(subject, { callback: () => {} }); }); }
  finally { subscription?.unsubscribe(); }
}
async function main(): Promise<void> {
  loadEnv();
  await step('configuration', 'auth_mode_on_and_verification_timeout_configured', async () => {
    assert.equal(required('NATS_AUTH_MODE'), 'on'); assert.ok(integer('NATS_AUTH_VERIFY_TIMEOUT_MS') > 0);
  });
  const timeout = integer('NATS_AUTH_VERIFY_TIMEOUT_MS');
  const connections: NatsConnection[] = [], cleanup: { stream: string; seq: number }[] = [];
  const consumers: { stream: string; name: string }[] = [];
  const base = `http://127.0.0.1:${integer('BFF_PORT')}`;
  let sessionToken: string | undefined, failure: unknown;
  async function request(route: string, body?: unknown, token?: string): Promise<any> {
    const response = await fetch(`${base}${route}`, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body ?? {}), signal: AbortSignal.timeout(timeout) });
    if (response.status !== 200) throw new HttpFailure(response.status);
    return response.json();
  }
  async function service(identity: string): Promise<NatsConnection> {
    return step(`service_${identity}_connect`, 'static_identity_authenticates', async () => { const nc = await natsConnect(identity); connections.push(nc); return nc; });
  }
  try {
    const login = await step('session_login', 'local_identity_creates_session', () => request('/auth/login/token', { identityToken: required('LOCAL_IDENTITY_TOKEN') }));
    sessionToken = login.token;
    const grant = await step('grant_mint', 'authenticated_post_nats_token_returns_one_hour_user_grant', async () => {
      const value = await request('/nats/token', {}, sessionToken) as UserGrant;
      assert.equal(value.expiresInSeconds, 3600); assert.equal(value.authentication, 'token'); assert.equal(value.account, 'USER');
      assert.equal(value.server, required('NATS_PUBLIC_URL')); assert.equal(typeof value.token, 'string');
      return value;
    });
    await step('grant_scope', 'subjects_equal_current_session_user_and_linked_wallet_families', async () => {
      const result = await pg().query<{ addresses: string[] }>(`SELECT
        ARRAY(SELECT w.address FROM wallets w WHERE w.user_id=u.id AND w.reserved=false)
        || ARRAY_REMOVE(ARRAY[u.canonical_svm_wallet,u.canonical_evm_wallet],NULL) AS addresses
        FROM users u WHERE u.id=$1`, [login.user.id]);
      assert.ok(result.rows[0]);
      const wallets = [...new Set(result.rows[0].addresses)];
      assert.ok(wallets.length > 0);
      const expected = [`dm.user.${login.user.id}`, `followingFeed.user.${login.user.id}`, `alertsFeed.user.${login.user.id}.*`, `notifications.user.${login.user.id}`,
        ...wallets.flatMap(wallet => [`positions.${wallet}`, `account_balance_change.${wallet}.*`])];
      assert.deepEqual([...grant.subjects].sort(), expected.sort());
    });
    const user = await step('user_connect', 'minted_bearer_token_passes_encrypted_auth_callout', async () => {
      const nc = await connect({ servers: required('NATS_URL'), authenticator: tokenAuthenticator(grant.token), name: 'pumpskel:verify-user', timeout, reconnect: false }); connections.push(nc); return nc;
    });
    const operator = await service('operator');
    const run = randomUUID().replaceAll('-', '');
    for (const subject of grant.subjects) {
      const family = subject.split('.')[0];
      await step('user_scope_delivery', `${family}_owned_subject_delivers`, async () => {
        const concrete = subject.replaceAll('*', `authverify_${run}`);
        const subscription = user.subscribe(subject, { max: 1, timeout });
        try {
          await user.flush();
          // Invalid JSON is deliberate: notify terminates verifier messages without
          // creating application records. Delete their exact stream sequences below.
          const marker = `{authverify:${run}`, bytes = new TextEncoder().encode(marker);
          if (['dm', 'followingFeed', 'alertsFeed'].includes(family)) {
            const ack = await operator.jetstream().publish(concrete, bytes, { msgID: `auth-scope:${run}:${cleanup.length}` });
            cleanup.push({ stream: ack.stream, seq: ack.seq });
          } else { operator.publish(concrete, bytes); await operator.flush(); }
          const received = await subscription[Symbol.asyncIterator]().next();
          assert.equal(new TextDecoder().decode(received.value?.data), marker);
        } finally { subscription.unsubscribe(); }
      });
    }
    const siblingId = randomUUID(), siblingWallet = `0x${randomBytes(20).toString('hex')}`;
    const forbidden = [
      ['dm_other_user', `dm.user.${siblingId}`], ['following_other_user', `followingFeed.user.${siblingId}`],
      ['alerts_other_user', `alertsFeed.user.${siblingId}.verify`], ['notifications_other_user', `notifications.user.${siblingId}`],
      ['positions_other_wallet', `positions.${siblingWallet}`], ['balance_other_wallet', `account_balance_change.${siblingWallet}.verify`],
      ['broad_subscription', '>'], ['public_family_not_in_user_grant', 'trading.events.>'], ['private_family_wildcard', 'dm.user.*'],
    ];
    for (const [rule, subject] of forbidden) await step('user_scope_denial', rule, () => deniedSubscription(user, subject));
    const ownSubject = grant.subjects.find(subject => subject.startsWith('positions.'))!;
    await step('user_publish_denial', 'all_user_publish_forbidden', () => expectDenied(user, ownSubject, 'publish', () => { user.publish(ownSubject, new Uint8Array()); }));
    const publicConnection = await service('public');
    const publicSubject = `trading.events.authverify_${run}`, publicMessages = publicConnection.subscribe(publicSubject, { max: 1, timeout });
    await publicConnection.flush();
    const ingest = await service('ingest');
    await step('ingest_jetstream', 'account_and_owned_stream_info_then_publish_ack', async () => {
      const manager = await ingest.jetstreamManager(); await manager.streams.info('TRADING_EVENTS');
      const ack = await ingest.jetstream().publish(publicSubject, new TextEncoder().encode(JSON.stringify({ type: 'auth_verification', id: run })), { msgID: `auth-verify:${run}` });
      cleanup.push({ stream: ack.stream, seq: ack.seq });
    });
    await step('public_delivery', 'public_stream_import_delivers_trade_family', async () => { const received = await publicMessages[Symbol.asyncIterator]().next(); assert.ok(received.value); });
    await step('public_publish_denial', 'static_subscriber_is_read_only', () => expectDenied(publicConnection, publicSubject, 'publish', () => { publicConnection.publish(publicSubject, new Uint8Array()); }));
    await step('public_private_denial', 'static_subscriber_cannot_read_user_subjects', () => deniedSubscription(publicConnection, ownSubject));
    const trading = await service('trading');
    await step('trading_jetstream', 'owned_stream_consumer_create_info_pull_ack_delete', async () => {
      const manager = await trading.jetstreamManager(); await manager.streams.info('TRADING_EVENTS');
      // A separate unnamed pull consumer cannot disturb the live service consumer.
      const consumer = await manager.consumers.add('TRADING_EVENTS', { filter_subject: publicSubject, ack_policy: AckPolicy.Explicit });
      const record = { stream: 'TRADING_EVENTS', name: consumer.name }; consumers.push(record);
      await manager.consumers.info(record.stream, record.name);
      const message = await trading.jetstream().pull(record.stream, record.name, timeout);
      assert.equal(message.subject, publicSubject); assert.equal(await message.ackAck({ timeout }), true);
      assert.equal(await manager.consumers.delete(record.stream, record.name), true); consumers.splice(consumers.indexOf(record), 1);
    });
    const communities = await service('communities');
    await step('communities_jetstream', 'account_and_owned_stream_info_then_publish_ack', async () => {
      const manager = await communities.jetstreamManager(); await manager.streams.info('COMMUNITIES_EVENTS');
      const ack = await communities.jetstream().publish(`communities.authverify.${run}`, new TextEncoder().encode('{}'), { msgID: `auth-social:${run}` });
      cleanup.push({ stream: ack.stream, seq: ack.seq });
    });
    const keepers = await service('keepers');
    await step('keepers_jetstream', 'account_and_owned_stream_info_then_publish_ack', async () => {
      const manager = await keepers.jetstreamManager(); await manager.streams.info('HOLDER_REWARDS');
      const ack = await keepers.jetstream().publish(`holderRewards.authverify_${run}.round`, new TextEncoder().encode('{}'), { msgID: `auth-keeper:${run}` });
      cleanup.push({ stream: ack.stream, seq: ack.seq });
    });
    const notify = await service('notify');
    await step('notify_jetstream', 'owned_stream_and_three_live_durable_consumers_exist', async () => {
      const manager = await notify.jetstreamManager(); await manager.streams.info('COMMUNITIES_EVENTS');
      for (const name of ['notify-dm', 'notify-following', 'notify-alerts']) await manager.consumers.info('COMMUNITIES_EVENTS', name);
    });
    await step('service_scope_denial', 'ingest_cannot_publish_private_user_positions', () => expectDenied(ingest, ownSubject, 'publish', () => { ingest.publish(ownSubject, new Uint8Array()); }));
    await step('session_revoke', 'logout_revokes_verifier_session', async () => { await request('/auth/logout', {}, sessionToken); sessionToken = undefined; });
    await step('revoked_grant_reconnect', 'revoked_session_rejects_unexpired_grant', async () => {
      let rejected = false;
      try { const unexpected = await connect({ servers: required('NATS_URL'), authenticator: tokenAuthenticator(grant.token), timeout, reconnect: false }); await unexpected.close(); }
      catch (error) { if (['AUTHORIZATION_VIOLATION', 'BAD_AUTHENTICATION'].includes(String((error as { code?: unknown })?.code))) rejected = true; else throw error; }
      assert.ok(rejected);
    });
  } catch (error) { failure = error; }
  finally {
    try {
      if (cleanup.length || consumers.length) {
        const maintenance = await natsConnect('operator');
        try {
          const manager = await maintenance.jetstreamManager();
          for (const consumer of consumers) await manager.consumers.delete(consumer.stream, consumer.name);
          for (const message of cleanup) await manager.streams.deleteMessage(message.stream, message.seq);
        } finally { await maintenance.drain(); }
      }
      if (sessionToken) { await request('/auth/logout', {}, sessionToken); sessionToken = undefined; }
    } catch (error) {
      const fields = { step: 'cleanup', rule: 'remove_only_verifier_messages_consumers_and_session', category: category(error) };
      log('nats-auth-verify', 'cleanup_failed', fields);
      failure ??= new VerificationFailure(fields.step, fields.rule, fields.category);
    } finally { await Promise.allSettled(connections.map(connection => connection.drain())); await pg().end(); }
  }
  if (failure) throw failure;
  log('nats-auth-verify', 'passed', { ownSubjects: true, crossUserDenied: true, crossWalletDenied: true, broadSubscriptionDenied: true, publicReadOnly: true, userPublishDenied: true, serviceJetStream: true, revokedReconnectDenied: true });
}
main().catch(error => {
  const fields = error instanceof VerificationFailure ? { step: error.step, rule: error.rule, category: error.category, ...(error.httpStatus === undefined ? {} : { httpStatus: error.httpStatus }) }
    : { step: 'configuration', rule: 'required_local_verification_configuration', category: category(error) };
  log('nats-auth-verify', 'failed', fields); process.exitCode = 1;
});
