import http from 'node:http';
import { AUTH_REQUEST_SUBJECT, issuerKey, loadNkey, NatsAuthorizationError, signNatsClaims, userSubjects, verifyNatsClaims, verifyUserGrant, type NatsClaims } from '@pump/nats-auth';
import { integer, loadEnv, log, natsConnect, pg, required } from '@pump/runtime';
import type { Msg } from 'nats';

let startupStep = 'configuration';
function reject(rule: string): never { throw new NatsAuthorizationError(rule); }
async function main(): Promise<void> {
  loadEnv();
  if (required('NATS_AUTH_MODE') !== 'on') throw new Error('Auth callout requires NATS_AUTH_MODE=on');
  const maxPending = integer('NATS_AUTH_MAX_PENDING');
  if (maxPending < 1) throw new Error('NATS_AUTH_MAX_PENDING must be positive');
  const queue = required('NATS_AUTH_CALLOUT_QUEUE');
  if (!/^[a-zA-Z0-9_-]+$/.test(queue)) throw new Error('Invalid NATS_AUTH_CALLOUT_QUEUE');
  startupStep = 'authorization_keys';
  const signer = issuerKey(), curve = loadNkey('NATS_AUTH_CURVE_SEED_FILE');
  if (!curve.getPublicKey().startsWith('X')) throw new Error('NATS auth encryption key must be a curve NKey');
  startupStep = 'nats_connection';
  const nc = await natsConnect('auth-callout');
  let connected = true, pending = 0;
  startupStep = 'auth_request_subscription';
  const subscription = nc.subscribe(AUTH_REQUEST_SUBJECT, { queue });
  await nc.flush();
  const health = http.createServer((request, response) => {
    response.writeHead(request.url === '/health' ? (connected ? 200 : 503) : 404, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    response.end(JSON.stringify(request.url === '/health' ? { service: 'auth-callout', status: connected ? 'ok' : 'degraded', pending } : { error: 'NOT_FOUND' }));
  });
  startupStep = 'health_listener';
  await new Promise<void>((resolve, reject) => { health.once('error', reject); health.listen(integer('NATS_AUTH_HEALTH_PORT'), required('NATS_AUTH_HEALTH_HOST'), resolve); });
  void (async () => { for await (const status of nc.status()) { if (status.type === 'disconnect') connected = false; if (status.type === 'reconnect') connected = true; } })().catch(() => { connected = false; });
  const authorize = async (message: Msg): Promise<void> => {
    let request: NatsClaims | undefined, serverXkey: string | undefined, validRequest = false;
    let step = 'request_encryption';
    try {
      serverXkey = message.headers?.get('Nats-Server-Xkey');
      // Require encryption so connection credentials never reach plaintext subscribers.
      if (!serverXkey || !serverXkey.startsWith('X')) reject('encrypted_request_required');
      const opened = curve.open(message.data, serverXkey);
      if (!opened) reject('request_decryption');
      step = 'server_request_jwt';
      request = verifyNatsClaims(new TextDecoder().decode(opened));
      const nats = request.nats as { type?: string; user_nkey?: string; server_id?: { id?: string; xkey?: string }; connect_opts?: { auth_token?: string } };
      step = 'server_request_policy';
      if (request.sub !== signer.getPublicKey()) reject('request_issuer_target');
      if (request.aud !== 'nats-authorization-request') reject('request_audience');
      if (nats.type !== 'authorization_request') reject('request_type');
      if (request.iss !== nats.server_id?.id || !request.iss.startsWith('N')) reject('request_server_identity');
      if (nats.server_id?.xkey !== serverXkey) reject('request_server_encryption_key');
      if (!nats.user_nkey?.startsWith('U')) reject('request_user_challenge');
      validRequest = true;
      step = 'user_grant';
      // jwt/v2 AuthorizationRequest uses connect_opts, not client_opts.
      const token = nats.connect_opts?.auth_token;
      if (!token) reject('grant_token_required');
      const grant = verifyUserGrant(token, signer.getPublicKey());
      step = 'session_lookup';
      const records = await pg().query<{ expires_at: Date; addresses: string[] }>(
        `SELECT s.expires_at,
          ARRAY(SELECT w.address FROM wallets w WHERE w.user_id=u.id AND w.reserved=false)
          || ARRAY_REMOVE(ARRAY[u.canonical_svm_wallet,u.canonical_evm_wallet],NULL) AS addresses
         FROM sessions s JOIN users u ON u.id=s.user_id
         WHERE s.jti=$1 AND s.user_id=$2 AND s.revoked_at IS NULL AND s.expires_at>now() AND u.banned_at IS NULL`,
        [grant.pump.sessionJti, grant.pump.userId],
      );
      step = 'session_policy';
      const session = records.rows[0];
      if (!session) reject('session_active_unbanned');
      if (grant.pump.wallets.some(wallet => !session.addresses.includes(wallet))) reject('session_wallet_ownership');
      const expires = Math.min(grant.exp, Math.floor(new Date(session.expires_at).getTime() / 1000));
      step = 'authorization_response';
      const jwt = signNatsClaims({
        sub: nats.user_nkey, aud: 'USER', name: `user:${grant.pump.userId}`, exp: expires,
        nats: { type: 'user', version: 2, bearer_token: true, pub: { deny: ['>'] }, sub: { allow: userSubjects(grant.pump) }, subs: -1, data: -1, payload: -1 },
      }, signer);
      const response = signNatsClaims({ sub: nats.user_nkey, aud: request.iss, exp: request.exp, nats: { type: 'authorization_response', version: 2, jwt } }, signer);
      if (!message.respond(curve.seal(new TextEncoder().encode(response), serverXkey))) reject('response_reply_unavailable');
      log('auth-callout', 'connection_authorized', { step, rule: 'scoped_user_grant' });
    } catch (error) {
      // Only fixed local step/rule labels are logged or returned, never input text.
      const rule = error instanceof NatsAuthorizationError ? error.rule : `${step}_failed`;
      if (validRequest && request && serverXkey && typeof request.nats.user_nkey === 'string') {
        try {
          const response = signNatsClaims({ sub: request.nats.user_nkey, aud: request.iss, exp: request.exp, nats: { type: 'authorization_response', version: 2, error: `Credential rejected: ${rule}` } }, signer);
          message.respond(curve.seal(new TextEncoder().encode(response), serverXkey));
        } catch { /* An unavailable reply never exposes request content. */ }
      }
      log('auth-callout', 'connection_rejected', { step, rule });
    }
  };
  void (async () => {
    for await (const message of subscription) {
      if (pending >= maxPending) { log('auth-callout', 'capacity_rejected', { step: 'request_capacity', rule: 'max_pending' }); continue; }
      pending += 1;
      void authorize(message).finally(() => { pending -= 1; });
    }
    connected = false;
  })().catch(() => { connected = false; log('auth-callout', 'subscription_stopped', { step: 'auth_request_subscription', rule: 'subscription_failed' }); });
  async function stop(): Promise<void> { connected = false; health.close(); subscription.unsubscribe(); await nc.drain(); await pg().end(); signer.clear(); curve.clear(); }
  process.once('SIGINT', () => { void stop().then(() => process.exit(0)); });
  process.once('SIGTERM', () => { void stop().then(() => process.exit(0)); });
  log('auth-callout', 'ready');
}
main().catch(() => { log('auth-callout', 'startup_failed', { step: startupStep, rule: 'dependency_or_configuration_failed' }); process.exitCode = 1; });
