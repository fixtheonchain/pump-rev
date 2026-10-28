import type { ServerWritableStream } from '@grpc/grpc-js';
import { status, Metadata } from '@grpc/grpc-js';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { pg, required } from '@pump/runtime';
import { InputError } from './store';

export interface Subscription {
  coin?: { chain: string; address: string; parts?: (string | number)[]; commitment?: string; candles?: { res: string; measure: string }[] };
  wallet?: { wallet: string; chain?: string };
  list?: { list: string };
}
export const partNames = ['PART_UNSPECIFIED', 'MARKET', 'PHASE', 'META', 'POSITION', 'HOLDERS', 'MARKS', 'CANDLES'];
export function parts(subscription: Subscription): string[] { return (subscription.coin?.parts?.length ? subscription.coin.parts : ['MARKET', 'PHASE', 'META']).map(part => typeof part === 'number' ? partNames[part] ?? 'PART_UNSPECIFIED' : part); }
export function topicKey(subscription: Subscription): string {
  if (subscription.coin) {
    const c = subscription.coin;
    return `coin/${encodeURIComponent(c.chain)}/${c.address}/${c.commitment || 'PROCESSED'}/${parts(subscription).sort().join(',')}/${(c.candles ?? []).map(item => `${item.res}:${item.measure}`).sort().join(',')}`;
  }
  if (subscription.wallet) return `wallet/${encodeURIComponent(subscription.wallet.chain || '')}/${subscription.wallet.wallet}`;
  if (subscription.list) return `list/${subscription.list.list}`;
  throw new InputError('A subscription needs a topic');
}
export async function sessionWallet(metadata: Metadata): Promise<string> {
  const bearer = metadata.get('authorization')[0];
  if (typeof bearer !== 'string' || !bearer.startsWith('Bearer ')) throw Object.assign(new Error('Session required'), { code: status.UNAUTHENTICATED });
  let claims: JwtPayload;
  try {
    const result = jwt.verify(bearer.slice(7), required('SESSION_JWT_SECRET'), { algorithms: ['HS256'], issuer: required('SESSION_JWT_ISSUER'), audience: required('SESSION_JWT_AUDIENCE') });
    if (typeof result === 'string' || typeof result.wallet !== 'string' || !result.jti || !result.sub) throw new Error('Invalid claims');
    claims = result;
  } catch { throw Object.assign(new Error('Invalid session'), { code: status.UNAUTHENTICATED }); }
  const active = await pg().query('SELECT 1 FROM sessions WHERE jti=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at>now()', [claims.jti, claims.sub]);
  if (!active.rowCount) throw Object.assign(new Error('Session revoked'), { code: status.UNAUTHENTICATED });
  return claims.wallet as string;
}
export function privateTopic(subscription: Subscription): boolean { return Boolean(subscription.wallet || parts(subscription).includes('POSITION')); }
interface WriterState { blocked: boolean; topics: Map<string, Record<string, unknown>[]>; }
const writers = new WeakMap<ServerWritableStream<any, any>, WriterState>();
export function boundedWrite(call: ServerWritableStream<any, any>, frame: Record<string, unknown>): void {
  let writer = writers.get(call);
  if (!writer) { writer = { blocked: false, topics: new Map() }; writers.set(call, writer); }
  const state = writer;
  const topic = String(frame.topic ?? '');
  const queue = state.topics.get(topic) ?? [];
  if (queue.length >= 256) { queue.length = 0; frame.gap = true; }
  queue.push(frame); state.topics.set(topic, queue);
  const flush = (): void => {
    if (state.blocked || call.destroyed || call.cancelled) return;
    for (const [key, pending] of state.topics) {
      while (pending.length) {
        const next = pending.shift()!;
        if (!call.write(next)) {
          state.blocked = true;
          call.once('drain', () => { state.blocked = false; flush(); });
          return;
        }
      }
      state.topics.delete(key);
    }
  };
  flush();
}
