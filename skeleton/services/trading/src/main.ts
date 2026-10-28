import { EventEmitter } from 'node:events';
import * as grpc from '@grpc/grpc-js';
import { consumerOpts, createInbox, type JetStreamSubscription } from 'nats';
import { loadPackage } from '@pump/proto';
import { chQuery, dependencyFailure, integer, loadEnv, log, natsConnect, pg, required } from '@pump/runtime';
import { TradingStore, InputError, MissingError, BlockedError, eventOrdinal, toTrade, type IngestEvent, type Commitment } from './store';
import { parts, topicKey, sessionWallet, privateTopic, boundedWrite, type Subscription } from './topics';

loadEnv();
const store = new TradingStore();
const bus = new EventEmitter(); bus.setMaxListeners(0);
let healthy = false;
let startupDependency = 'configuration', startupOperation = 'validate';
let events: JetStreamSubscription | undefined;
const seen = new Map<string, bigint>();
function grpcError(error: unknown): grpc.ServiceError {
  const err = error as Error & { code?: number };
  const code = err.code ?? (err instanceof BlockedError ? grpc.status.PERMISSION_DENIED : err instanceof InputError ? grpc.status.INVALID_ARGUMENT : err instanceof MissingError ? grpc.status.NOT_FOUND : grpc.status.UNAVAILABLE);
  const details = code === grpc.status.UNAVAILABLE ? 'Trading lane unavailable' : err.message;
  const metadata = new grpc.Metadata();
  if (err instanceof BlockedError) metadata.set('error-code', 'COIN_BLOCKED');
  return Object.assign(new Error(details), { code, details, metadata });
}
function unary(method: (input: any) => Promise<any>): grpc.handleUnaryCall<any, any> {
  return (call, callback) => { method(call.request).then(result => callback(null, result), error => callback(grpcError(error))); };
}
async function coinFrame(sub: Subscription, wallet?: string): Promise<Record<string, unknown>> {
  const coin = sub.coin!;
  const input = { chain: coin.chain, address: coin.address, commitment: coin.commitment as Commitment };
  const included = parts(sub);
  const frame: Record<string, unknown> = { parts: included };
  const state = (await store.getCoin(input)).coin as Record<string, unknown>;
  const stateParts: Record<string, unknown> = { chain: state.chain, address: state.address, ordinal: state.ordinal, commitment: state.commitment };
  if (included.includes('MARKET') || included.includes('MARKS')) Object.assign(stateParts, { priceUsd: state.priceUsd, marketCapUsd: state.marketCapUsd });
  if (included.includes('PHASE')) Object.assign(stateParts, { complete: state.complete, mayhem: state.mayhem });
  if (included.includes('META')) Object.assign(stateParts, { name: state.name, symbol: state.symbol, description: state.description, baseDecimals: state.baseDecimals, quoteDecimals: state.quoteDecimals, quoteMint: state.quoteMint });
  if (included.includes('HOLDERS')) stateParts.holderCount = state.holderCount;
  frame.state = stateParts;
  if (included.includes('MARKET')) frame.trades = (await store.getTrades({ ...input, limit: integer('TRADING_SNAPSHOT_TRADE_LIMIT') })).trades;
  if (included.includes('CANDLES')) frame.candles = await Promise.all((coin.candles ?? []).map(spec => store.getCandles({ ...input, ...spec, limit: integer('TRADING_SNAPSHOT_TRADE_LIMIT') })));
  if (included.includes('POSITION')) frame.position = await store.getPosition({ ...input, wallet: wallet! });
  return frame;
}
async function snapshot(sub: Subscription, wallet?: string): Promise<Record<string, unknown>> {
  if (sub.coin) return { coin: await coinFrame(sub, wallet) };
  if (sub.wallet) {
    const input = sub.wallet;
    const pairs = await chQuery<{ chain: string; mint: string }>('SELECT DISTINCT chain,mint FROM trades FINAL WHERE wallet={wallet:String} AND deleted=0', { wallet: input.wallet });
    return { wallet: { wallet: input.wallet, positions: await Promise.all(pairs.filter(pair => !input.chain || pair.chain === input.chain).map(pair => store.getPosition({ chain: pair.chain, address: pair.mint, wallet: input.wallet }))) } };
  }
  if (sub.list) {
    if (sub.list.list !== 'all') throw new InputError('List support is limited to all; ranked boards are unavailable');
    const coins = await pg().query('SELECT chain,address FROM coins ORDER BY created_at DESC LIMIT $1', [integer('TRADING_MAX_READ_ROWS')]);
    return { list: { list: sub.list.list, coins: await Promise.all(coins.rows.map(async row => (await store.getCoin(row)).coin)) } };
  }
  throw new InputError('Unknown topic');
}
function matches(sub: Subscription, event: IngestEvent): boolean {
  if (sub.coin) return sub.coin.chain === event.chain && sub.coin.address === event.mint && (sub.coin.commitment !== 'CONFIRMED' || event.commitment === 'confirmed');
  if (sub.wallet) return sub.wallet.wallet === event.wallet && (!sub.wallet.chain || sub.wallet.chain === event.chain);
  return Boolean(sub.list);
}
async function watch(call: grpc.ServerWritableStream<any, any>): Promise<void> {
  const subscriptions: Subscription[] = call.request.subscribe ?? [];
  if (!subscriptions.length || subscriptions.length > 32) throw new InputError('Watch needs 1 to 32 subscriptions');
  const privateSubs = subscriptions.filter(privateTopic);
  const wallet = privateSubs.length ? await sessionWallet(call.metadata) : undefined;
  for (const sub of subscriptions) {
    if ([sub.coin, sub.wallet, sub.list].filter(Boolean).length !== 1) throw new InputError('Each subscription needs exactly one topic');
    if (sub.coin) {
      if (!sub.coin.parts?.length) sub.coin.parts = ['MARKET', 'PHASE', 'META'];
      if (parts(sub).some(part => !['MARKET','PHASE','META','POSITION','HOLDERS','MARKS','CANDLES'].includes(part))) throw new InputError('Unsupported part');
      if (sub.coin.commitment === 'COMMITMENT_UNSPECIFIED' || !sub.coin.commitment) sub.coin.commitment = 'PROCESSED';
    }
    if (sub.wallet && sub.wallet.wallet !== wallet) throw Object.assign(new Error('Wallet is outside the session'), { code: grpc.status.PERMISSION_DENIED });
  }
  let closed = false; let initialized = false;
  const pending: IngestEvent[] = [];
  let chain = Promise.resolve();
  const emit = async (event: IngestEvent): Promise<void> => {
    for (const sub of subscriptions.filter(item => matches(item, event))) {
      if (closed) break;
      const payload = await snapshot(sub, wallet);
      if (sub.coin) {
        const coin = payload.coin as Record<string, unknown>;
        coin.removed = event.deleted;
        if (parts(sub).includes('MARKET')) coin.trades = ['TradeEvent','BuyEvent','SellEvent'].includes(event.event_name) ? [toTrade(event)] : [];
      }
      boundedWrite(call, { topic: topicKey(sub), kind: event.kind, ordinal: eventOrdinal(event), ...payload });
    }
  };
  const receive = (event: IngestEvent): void => {
    if (!subscriptions.some(sub => matches(sub, event))) return;
    if (!initialized) {
      if (pending.length >= 256) { call.destroy(grpcError(new InputError('Snapshot race buffer exhausted; reconnect'))); return; }
      pending.push(event);
    } else chain = chain.then(() => emit(event)).catch(error => { if (!closed) call.destroy(grpcError(error)); });
  };
  // Register before storage reads so an event committed while snapshotting is buffered, never lost.
  bus.on('event', receive);
  const intervalMs = integer('TRADING_HEARTBEAT_MS');
  if (intervalMs <= 0 || intervalMs >= 15000) throw new Error('TRADING_HEARTBEAT_MS must be between 1 and 14999');
  let checkingSession = false;
  const heartbeat = setInterval(() => {
    for (const sub of subscriptions) if (!closed && healthy) boundedWrite(call, { topic: topicKey(sub), heartbeat: true });
    if (privateSubs.length && !checkingSession && !closed) {
      checkingSession = true;
      sessionWallet(call.metadata).catch(error => { if (!closed) call.destroy(grpcError(error)); }).finally(() => { checkingSession = false; });
    }
  }, intervalMs);
  const cleanup = (): void => { closed = true; clearInterval(heartbeat); bus.off('event', receive); };
  call.once('cancelled', cleanup); call.once('close', cleanup); call.once('error', cleanup);
  try {
    for (const sub of subscriptions) {
      if (closed) return;
      const payload = await snapshot(sub, wallet);
      const snapshotOrdinal = sub.coin ? ((payload.coin as Record<string, any>).state?.ordinal) : undefined;
      boundedWrite(call, { topic: topicKey(sub), kind: 'SNAPSHOT', ordinal: snapshotOrdinal, ...payload });
    }
    for (const event of pending) chain = chain.then(() => emit(event));
    pending.length = 0;
    initialized = true;
    await chain;
  } catch (error) { cleanup(); throw error; }
}
async function main(): Promise<void> {
  const eventCacheSize = integer('TRADING_EVENT_CACHE_SIZE'); if (eventCacheSize < 1 || integer('TRADING_COIN_CACHE_SIZE') < 1) throw new Error('TRADING_EVENT_CACHE_SIZE and TRADING_COIN_CACHE_SIZE must be positive');
  const readLimit = integer('TRADING_MAX_READ_ROWS'); const snapshotLimit = integer('TRADING_SNAPSHOT_TRADE_LIMIT');
  if (readLimit < 1 || snapshotLimit < 1 || snapshotLimit > readLimit) throw new Error('Invalid TRADING_MAX_READ_ROWS or TRADING_SNAPSHOT_TRADE_LIMIT');
  const heartbeatMs = integer('TRADING_HEARTBEAT_MS'); if (heartbeatMs < 1 || heartbeatMs >= 15000) throw new Error('TRADING_HEARTBEAT_MS must be between 1 and 14999');
  startupDependency = 'nats'; startupOperation = 'connect';
  const nc = await natsConnect('trading');
  void (async () => { for await (const state of nc.status()) { if (state.type === 'disconnect') healthy = false; if (state.type === 'reconnect') healthy = true; } })().catch(() => { healthy = false; });
  startupOperation = 'jetstream.account.info';
  const manager = await nc.jetstreamManager();
  startupOperation = 'jetstream.stream.info.TRADING_EVENTS';
  await manager.streams.info('TRADING_EVENTS');
  const options = consumerOpts(); options.bindStream('TRADING_EVENTS'); options.deliverNew(); options.manualAck(); options.ackExplicit(); options.deliverTo(createInbox('_INBOX.trading'));
  startupOperation = 'jetstream.consumer.subscribe.TRADING_EVENTS';
  events = await nc.jetstream().subscribe('trading.events.>', options);
  void (async () => {
    for await (const message of events!) {
      try {
        const event = JSON.parse(new TextDecoder().decode(message.data)) as IngestEvent;
        if (!event.ordinal || !event.mint || !/^\d+$/.test(String(event.version))) { message.term(); continue; }
        const id = `${event.chain}/${event.mint}/${event.ordinal.block_id}/${event.ordinal.tx_index}/${event.ordinal.event_index}`;
        const previous = seen.get(id);
        if (previous !== undefined && previous >= BigInt(event.version)) { message.ack(); continue; }
        seen.set(id, BigInt(event.version));
        if (seen.size > eventCacheSize) seen.delete(seen.keys().next().value!);
        store.invalidate(event.chain, event.mint);
        bus.emit('event', event);
        message.ack();
      } catch { message.nak(); log('trading', 'event_retry'); }
    }
    healthy = false;
  })().catch(() => { healthy = false; log('trading', 'bus_stopped'); });
  startupDependency = 'protobuf'; startupOperation = 'load.trading.v1';
  const api = loadPackage('trading.v1');
  const server = new grpc.Server();
  server.addService(api.TradeApi.service, {
    GetCoin: unary(input => store.getCoin(input)), GetTrades: unary(input => store.getTrades(input)),
    GetCandles: unary(input => store.getCandles(input)), GetHolders: unary(input => store.getHolders(input)), GetPosition: unary(input => store.getPosition(input)),
    Health: unary(async () => { await chQuery('SELECT 1'); await pg().query('SELECT 1'); if (!healthy) throw new Error('Bus unavailable'); return { status: 'ok' }; }),
    Watch: (call: grpc.ServerWritableStream<any, any>) => { watch(call).catch(error => call.destroy(grpcError(error))); },
  });
  const address = process.env.TRADING_GRPC_BIND ?? required('TRADING_GRPC_URL');
  startupDependency = 'grpc'; startupOperation = 'bind';
  await new Promise<void>((resolve, reject) => server.bindAsync(address, grpc.ServerCredentials.createInsecure(), error => error ? reject(error) : resolve()));
  healthy = true; log('trading', 'listening', { address });
  const stop = (): void => { healthy = false; events?.unsubscribe(); server.tryShutdown(() => { nc.drain().finally(() => pg().end()).finally(() => process.exit(0)); }); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
main().catch(error => { log('trading', 'startup_failed', { dependency: startupDependency, operation: startupOperation, reason: startupDependency === 'configuration' && error instanceof Error ? error.message : dependencyFailure(error) }); process.exitCode = 1; });



