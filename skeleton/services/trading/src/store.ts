import Decimal from 'decimal.js';
import { chQuery, pg, integer } from '@pump/runtime';

// UInt128 token atoms and Decimal128(18) marks require more than binary64 precision.
Decimal.set({ precision: 120 });

export type Commitment = 'PROCESSED' | 'CONFIRMED' | 'COMMITMENT_UNSPECIFIED';
export interface Ordinal { blockId: string; txIndex: number; eventIndex: number; blockTimeMs: string; }
export interface IngestEvent {
  chain: string; mint: string; event_name: string; kind: 'LIVE' | 'CORRECTION'; commitment: 'processed' | 'confirmed';
  ordinal: { block_id: string; tx_index: number; event_index: number; block_time_ms: string };
  version: string; deleted: boolean; wallet: string; side: string; base_amount: string; quote_amount: string;
  quote_mint: string; price_usd: string; market_cap_usd: string; fee_protocol: string; fee_creator: string;
  signature: string; metadata?: Record<string, unknown>;
}
export interface Row {
  chain: string; mint: string; block_id: string; tx_index: number; event_index: number; block_time_ms: string;
  commitment: string; event_name: string; version: string; deleted: number; wallet: string; side: string;
  base_amount: string; quote_amount: string; quote_mint: string; price_usd: string; market_cap_usd: string;
  fee_protocol: string; fee_creator: string; signature: string; metadata_json: string;
}
export function ordinal(row: Row): Ordinal {
  return { blockId: row.block_id, txIndex: row.tx_index, eventIndex: row.event_index, blockTimeMs: row.block_time_ms };
}
export function eventOrdinal(event: IngestEvent): Ordinal {
  return { blockId: event.ordinal.block_id, txIndex: event.ordinal.tx_index, eventIndex: event.ordinal.event_index, blockTimeMs: event.ordinal.block_time_ms };
}
export function compareOrdinal(a: Ordinal, b: Ordinal): number {
  for (const [x, y] of [[a.blockId, b.blockId], [a.txIndex, b.txIndex], [a.eventIndex, b.eventIndex], [a.blockTimeMs, b.blockTimeMs]]) {
    const left = BigInt(x!); const right = BigInt(y!); if (left < right) return -1; if (left > right) return 1;
  }
  return 0;
}
export function toTrade(row: Row | IngestEvent): Record<string, unknown> {
  const ord = 'ordinal' in row ? eventOrdinal(row) : ordinal(row);
  return { ordinal: ord, signature: row.signature, wallet: row.wallet, side: row.side,
    baseAmount: String(row.base_amount), quoteAmount: String(row.quote_amount), quoteMint: row.quote_mint,
    priceUsd: String(row.price_usd), marketCapUsd: String(row.market_cap_usd), feeProtocol: String(row.fee_protocol),
    feeCreator: String(row.fee_creator), commitment: row.commitment.toUpperCase(),
    slotIndexId: `${ord.blockId}-${ord.txIndex}-${ord.eventIndex}` };
}
const rowColumns = `chain,mint,toString(block_id) AS block_id,tx_index,event_index,toString(block_time_ms) AS block_time_ms,
 commitment,event_name,toString(version) AS version,deleted,wallet,side,toString(base_amount) AS base_amount,
 toString(quote_amount) AS quote_amount,quote_mint,toString(price_usd) AS price_usd,toString(market_cap_usd) AS market_cap_usd,
 toString(fee_protocol) AS fee_protocol,toString(fee_creator) AS fee_creator,signature,metadata_json`;
function confirmedOnly(commitment?: Commitment): string { return commitment === 'CONFIRMED' ? " AND commitment='confirmed'" : ''; }
export function requiredText(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value) throw new InputError(`${name} is required`);
  return value;
}
export class InputError extends Error {}
export class MissingError extends Error {}
export class BlockedError extends Error {}
interface CoinInput { chain: string; address: string; commitment?: Commitment; }
export class TradingStore {
  async assertAllowed(input: CoinInput): Promise<void> {
    const result = await pg().query('SELECT security_verdict FROM coins WHERE chain=$1 AND address=$2', [requiredText(input.chain, 'chain'), requiredText(input.address, 'address')]);
    if (['block', 'blocked'].includes(result.rows[0]?.security_verdict?.verdict)) throw new BlockedError('COIN_BLOCKED');
  }
  // Cache holds canonical coin state and is invalidated before handling each bus event.
  readonly liveCoins = new Map<string, Record<string, unknown>>();
  private generation = 0;
  private key(input: CoinInput): string { return `${input.chain}/${input.address}/${input.commitment ?? 'PROCESSED'}`; }
  invalidate(chain: string, address: string): void { this.generation++; for (const key of this.liveCoins.keys()) if (key.startsWith(`${chain}/${address}/`)) this.liveCoins.delete(key); }
  async latest(input: CoinInput): Promise<Row | undefined> {
    requiredText(input.chain, 'chain'); requiredText(input.address, 'address');
    const rows = await chQuery<Row>(`SELECT ${rowColumns} FROM trades FINAL WHERE chain={chain:String} AND mint={mint:String} AND deleted=0${confirmedOnly(input.commitment)} ORDER BY toUInt64(block_id) DESC,tx_index DESC,event_index DESC LIMIT 1`, { chain: input.chain, mint: input.address });
    return rows[0];
  }
  async getCoin(input: CoinInput): Promise<Record<string, unknown>> {
    await this.assertAllowed(input);
    const cache = this.liveCoins.get(this.key(input)); if (cache) return { coin: cache };
    const generation = this.generation;
    const registry = await pg().query('SELECT * FROM coins WHERE chain=$1 AND address=$2', [requiredText(input.chain, 'chain'), requiredText(input.address, 'address')]);
    const meta = registry.rows[0] as Record<string, any> | undefined;
    const latest = await this.latest(input);
    const lifecycle = await chQuery<Row>(`SELECT ${rowColumns} FROM event_log FINAL WHERE chain={chain:String} AND mint={mint:String} AND deleted=0 AND event_name IN ('CreateEvent','CreatePoolEvent','CompleteEvent')${confirmedOnly(input.commitment)} ORDER BY toUInt64(block_id) DESC,tx_index DESC,event_index DESC`, { chain: input.chain, mint: input.address });
    if (!meta && !latest && lifecycle.length === 0) throw new MissingError('Coin not found');
    const create = lifecycle.find(row => row.event_name === 'CreateEvent' || row.event_name === 'CreatePoolEvent');
    const eventMeta: Record<string, any> = JSON.parse(create?.metadata_json || '{}');
    const baseDecimals = meta?.decimals ?? eventMeta.base_decimals;
    const quoteDecimals = meta?.quote_decimals ?? eventMeta.quote_decimals;
    if (!Number.isInteger(baseDecimals) || !Number.isInteger(quoteDecimals)) throw new Error('Coin decimals are unavailable; registry hydration is required');
    const holderCount = (await this.getHolders(input)).holderCount;
    const state = { chain: input.chain, address: input.address, name: meta?.name ?? eventMeta.name ?? '', symbol: meta?.symbol ?? eventMeta.symbol ?? '',
      description: meta?.description ?? '', priceUsd: latest?.price_usd ?? '0', marketCapUsd: latest?.market_cap_usd ?? '0', holderCount,
      complete: lifecycle[0] ? ['CompleteEvent','CreatePoolEvent'].includes(lifecycle[0].event_name) : Boolean(meta?.complete),
      mayhem: Boolean(meta?.mayhem_mode ?? eventMeta.is_mayhem_mode ?? false),
      baseDecimals, quoteDecimals,
      quoteMint: meta?.quote_mint ?? latest?.quote_mint ?? '', ordinal: latest ? ordinal(latest) : create ? ordinal(create) : undefined,
      commitment: latest?.commitment.toUpperCase() ?? 'COMMITMENT_UNSPECIFIED' };
    if (generation === this.generation) {
      this.liveCoins.set(this.key(input), state);
      if (this.liveCoins.size > integer('TRADING_COIN_CACHE_SIZE')) this.liveCoins.delete(this.liveCoins.keys().next().value!);
    }
    return { coin: state };
  }
  async getTrades(input: CoinInput & { limit?: number; cursor?: string }): Promise<Record<string, unknown>> {
    await this.assertAllowed(input);
    const maxRows = integer('TRADING_MAX_READ_ROWS');
    const limit = input.limit || maxRows;
    if (!Number.isInteger(limit) || limit < 1 || limit > maxRows) throw new InputError(`limit must be between 1 and ${maxRows}`);
    const params: Record<string, unknown> = { chain: requiredText(input.chain, 'chain'), mint: requiredText(input.address, 'address'), limit };
    let cursorWhere = '';
    if (input.cursor) {
      const parsed = input.cursor.match(/^(\d+)-(\d+)-(\d+)$/); if (!parsed) throw new InputError('Invalid cursor');
      Object.assign(params, { block: parsed[1], tx: parsed[2], event: parsed[3] });
      cursorWhere = ' AND (toUInt64(block_id),tx_index,event_index)<({block:UInt64},{tx:UInt32},{event:UInt32})';
    }
    const rows = await chQuery<Row>(`SELECT ${rowColumns} FROM trades FINAL WHERE chain={chain:String} AND mint={mint:String} AND deleted=0${confirmedOnly(input.commitment)}${cursorWhere} ORDER BY toUInt64(block_id) DESC,tx_index DESC,event_index DESC LIMIT {limit:UInt32}`, params);
    const tail = rows.at(-1);
    return { trades: rows.map(toTrade), nextCursor: rows.length === limit && tail ? `${tail.block_id}-${tail.tx_index}-${tail.event_index}` : '' };
  }
  async getHolders(input: CoinInput): Promise<{ holderCount: string }> {
    await this.assertAllowed(input);
    const rows = await chQuery<{ holder_count: string }>(`SELECT toString(count()) AS holder_count FROM (SELECT wallet,sum(if(side='buy',toInt256(base_amount),-toInt256(base_amount))) AS balance FROM trades FINAL WHERE chain={chain:String} AND mint={mint:String} AND deleted=0${confirmedOnly(input.commitment)} GROUP BY wallet HAVING balance>0)`, { chain: requiredText(input.chain, 'chain'), mint: requiredText(input.address, 'address') });
    return { holderCount: rows[0]?.holder_count ?? '0' };
  }
  async getPosition(input: CoinInput & { wallet: string }): Promise<Record<string, unknown>> {
    await this.assertAllowed(input);
    requiredText(input.wallet, 'wallet');
    const rows = await chQuery<{ amount: string }>(`SELECT toString(sum(if(side='buy',toInt256(base_amount),-toInt256(base_amount)))) AS amount FROM trades FINAL WHERE chain={chain:String} AND mint={mint:String} AND wallet={wallet:String} AND deleted=0${confirmedOnly(input.commitment)}`, { chain: requiredText(input.chain, 'chain'), mint: requiredText(input.address, 'address'), wallet: input.wallet });
    const amountAtomic = rows[0]?.amount ?? '0';
    const result = await this.getCoin(input); const coin = result.coin as Record<string, any>;
    return { wallet: input.wallet, chain: input.chain, address: input.address, amountAtomic,
      valueUsd: new Decimal(amountAtomic).div(new Decimal(10).pow(coin.baseDecimals)).mul(coin.priceUsd).toFixed(), priceUsd: coin.priceUsd };
  }
  async getCandles(input: CoinInput & { res: string; measure: string; fromMs?: string; toMs?: string; limit?: number }): Promise<Record<string, unknown>> {
    await this.assertAllowed(input);
    const match = /^(\d+)(s|m|h|d)$/.exec(input.res);
    if (!match || BigInt(match[1]!) < 1n) throw new InputError('res must be a positive duration such as 1m');
    if (input.measure !== 'price_usd' && input.measure !== 'mcap_usd') throw new InputError('Unsupported candle measure');
    const scale: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const bucket = Number(match[1]) * scale[match[2]!]!;
    if (!Number.isSafeInteger(bucket)) throw new InputError('Candle duration is too large');
    const limit = input.limit || integer('TRADING_MAX_READ_ROWS');
    if (!Number.isInteger(limit) || limit < 1 || limit > integer('TRADING_MAX_READ_ROWS')) throw new InputError('Invalid candle limit');
    const measure = input.measure === 'price_usd' ? 'price_usd' : 'market_cap_usd';
    let range = '';
    const params: Record<string, unknown> = { chain: requiredText(input.chain, 'chain'), mint: requiredText(input.address, 'address'), bucket, limit };
    if (input.fromMs && input.fromMs !== '0') { if (!/^\d+$/.test(String(input.fromMs))) throw new InputError('Invalid fromMs'); params.from = input.fromMs; range += ' AND block_time_ms>={from:Int64}'; }
    if (input.toMs && input.toMs !== '0') { if (!/^\d+$/.test(String(input.toMs))) throw new InputError('Invalid toMs'); params.to = input.toMs; range += ' AND block_time_ms<={to:Int64}'; }
    // Aggregate canonical ordinals, rather than additive materialized rows: replacements and removals repair OHLCV.
    const rows = await chQuery<Record<string, unknown>>(`SELECT toString(intDiv(block_time_ms,{bucket:Int64})*{bucket:Int64}) AS timeMs,
      toString(argMin(${measure},tuple(block_id,tx_index,event_index))) AS open,toString(max(${measure})) AS high,
      toString(min(${measure})) AS low,toString(argMax(${measure},tuple(block_id,tx_index,event_index))) AS close,
      toString(sum(base_amount)) AS volumeBase,toString(sum(quote_amount)) AS volumeQuote,toString(count()) AS tradeCount
      FROM trades FINAL WHERE chain={chain:String} AND mint={mint:String} AND deleted=0${confirmedOnly(input.commitment)}${range}
      GROUP BY intDiv(block_time_ms,{bucket:Int64})*{bucket:Int64} ORDER BY intDiv(block_time_ms,{bucket:Int64})*{bucket:Int64} ASC LIMIT {limit:UInt32}`, params);
    return { candles: rows, res: input.res, measure: input.measure };
  }
}




