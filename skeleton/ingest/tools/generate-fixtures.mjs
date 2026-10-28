// Locally encode the captured Anchor IDLs; all marks and key bytes are synthetic.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function key(byte) {
  let number = BigInt(`0x${byte.toString(16).padStart(2, '0').repeat(32)}`), value = '';
  while (number > 0n) { value = alphabet[Number(number % 58n)] + value; number /= 58n; }
  return value;
}
function publicKey(value) {
  let number = 0n;
  for (const character of value) { const digit = alphabet.indexOf(character); if (digit < 0) throw new Error('Invalid fixture pubkey'); number = number * 58n + BigInt(digit); }
  const output = Buffer.alloc(32);
  for (let i = 31; i >= 0; i--) { output[i] = Number(number & 255n); number >>= 8n; }
  if (number !== 0n) throw new Error('Fixture pubkey overflow');
  return output;
}
const mint = key(7), wallet = key(8), pool = key(9), quote = key(10), otherWallet = key(11);
const idls = Object.fromEntries(['pump', 'pump_amm', 'pump_fees'].map(name => [name, JSON.parse(readFileSync(resolve('ingest/idl', `${name}.json`), 'utf8'))]));
const context = { chain: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', mint, quote_mint: quote, base_decimals: 6, quote_decimals: 9, supply_atomic: '1000000000000000', quote_usd: '150', name: 'Ordinal Research Coin', symbol: 'ORD', description: 'Local-only Anchor event fixture' };
function encodeType(idl, type, value) {
  if (typeof type !== 'string') {
    if (type.vec) { const values = value ?? [], length = Buffer.alloc(4); length.writeUInt32LE(values.length); return Buffer.concat([length, ...values.map(item => encodeType(idl, type.vec, item))]); }
    if (type.defined?.name) return encodeStruct(idl, idl.types.find(item => item.name === type.defined.name).type, value ?? {});
    throw new Error(`Unsupported fixture type: ${JSON.stringify(type)}`);
  }
  if (type === 'pubkey') return publicKey(value ?? wallet);
  if (type === 'bool') return Buffer.from([value ? 1 : 0]);
  if (type === 'string') { const bytes = Buffer.from(value ?? ''), length = Buffer.alloc(4); length.writeUInt32LE(bytes.length); return Buffer.concat([length, bytes]); }
  const width = Number(type.slice(1)) / 8, bytes = Buffer.alloc(width);
  let number = BigInt(value ?? 0); if (number < 0n) number += 1n << BigInt(width * 8);
  for (let i = 0; i < width; i++) { bytes[i] = Number(number & 255n); number >>= 8n; }
  if (number !== 0n) throw new Error(`Fixture ${type} overflow`); return bytes;
}
function encodeStruct(idl, definition, values) { return Buffer.concat(definition.fields.map(field => encodeType(idl, field.type, values[field.name]))); }
const cpiTag = Buffer.from([0xe4, 0x45, 0xa5, 0x2e, 0x51, 0xcb, 0x9a, 0x1d]);
function event(program, name, values, ordinal, commitment = 'processed', selfCpi = true) {
  const idl = idls[program], event = idl.events.find(item => item.name === name), definition = idl.types.find(item => item.name === name);
  const bytes = Buffer.concat([...(selfCpi ? [cpiTag] : []), Buffer.from(event.discriminator), encodeStruct(idl, definition.type, values)]);
  return { type: 'event', program: idl.address, data: bytes.toString('base64'), ordinal, commitment, revision: 1, signature: `fixture-${ordinal.block_id}-${ordinal.tx_index}`, context };
}
const time = 1793188800000;
function ordinal(block, tx = 0, event = 0) { return { block_id: String(block), tx_index: tx, event_index: event, block_time_ms: String(time + (block - 1000) * 1000) }; }
const createValues = { name: context.name, symbol: context.symbol, uri: 'local://fixtures/ordinal.json', mint, bonding_curve: pool, user: wallet, creator: wallet, timestamp: String(time / 1000), virtual_token_reserves: '1073000000000000', virtual_sol_reserves: '30000000000', real_token_reserves: '793100000000000', token_total_supply: context.supply_atomic, token_program: key(12), quote_mint: quote, virtual_quote_reserves: '30000000000' };
const tradeValues = { mint, sol_amount: '1000000000', token_amount: '100000000000', is_buy: true, user: wallet, timestamp: String(time / 1000 + 1), virtual_sol_reserves: '31000000000', virtual_token_reserves: '1072900000000000', real_sol_reserves: '1000000000', real_token_reserves: '793000000000000', fee_recipient: key(13), fee_basis_points: '95', fee: '9500000', creator: wallet, creator_fee_basis_points: '30', creator_fee: '3000000', ix_name: 'buy', quote_mint: quote, quote_amount: '1000000000', virtual_quote_reserves: '31000000000', real_quote_reserves: '1000000000' };
const poolValues = { timestamp: String(time / 1000 + 2), creator: wallet, base_mint: mint, quote_mint: quote, base_mint_decimals: 6, quote_mint_decimals: 9, base_amount_in: '1000000000000', quote_amount_in: '12000000000', pool_base_amount: '1000000000000', pool_quote_amount: '12000000000', minimum_liquidity: '1000', initial_liquidity: '3464101615', lp_token_amount_out: '3464100615', pool, lp_mint: key(14), coin_creator: wallet };
const ammCommon = { user: otherWallet, pool, coin_creator: wallet, timestamp: String(time / 1000 + 3), protocol_fee_basis_points: '5', protocol_fee: '150000', coin_creator_fee_basis_points: '5', coin_creator_fee: '150000', pool_base_token_reserves: '975000000000', pool_quote_token_reserves: '12300000000', base_supply: context.supply_atomic };
const create = event('pump', 'CreateEvent', createValues, ordinal(1000));
const trade = event('pump', 'TradeEvent', tradeValues, ordinal(1001));
const disappearing = event('pump', 'TradeEvent', { ...tradeValues, user: otherWallet, token_amount: '25000000000', quote_amount: '300000000' }, ordinal(1001, 1));
const poolCreate = event('pump_amm', 'CreatePoolEvent', poolValues, ordinal(1002));
const buy = event('pump_amm', 'BuyEvent', { ...ammCommon, base_amount_out: '25000000000', quote_amount_in: '300000000', quote_amount_in_with_lp_fee: '300600000', user_quote_amount_in: '300750000', ix_name: 'buy' }, ordinal(1003), 'processed', false);
const sell = event('pump_amm', 'SellEvent', { ...ammCommon, base_amount_in: '5000000000', quote_amount_out: '60000000', quote_amount_out_without_lp_fee: '59880000' }, ordinal(1003, 1));
const complete = event('pump', 'CompleteEvent', { user: wallet, mint, bonding_curve: pool, quote_mint: quote, timestamp: String(time / 1000 + 4) }, ordinal(1004));
const confirmed = record => ({ ...record, commitment: 'confirmed' });
const rows = [create, trade, disappearing, poolCreate, buy, sell, complete, confirmed(create), event('pump', 'TradeEvent', { ...tradeValues, sol_amount: '1200000000', quote_amount: '1200000000', fee: '11400000', creator_fee: '3600000' }, ordinal(1001), 'confirmed'), { type: 'confirmed_block', block_id: 1001, seen: ['1001-0-0'] }, confirmed(poolCreate), confirmed(buy), confirmed(sell), confirmed(complete)];
mkdirSync(resolve('fixtures'), { recursive: true });
writeFileSync(resolve('fixtures/replay.jsonl'), rows.map(row => JSON.stringify(row)).join('\n') + '\n');
writeFileSync(resolve('fixtures/assets.json'), JSON.stringify({ assets: { [mint]: context }, pools: { [pool]: mint } }, null, 2) + '\n');
writeFileSync(resolve('fixtures/ids.json'), JSON.stringify({ mint, wallet, pool, quote, otherWallet, chain: context.chain }, null, 2) + '\n');
console.log(JSON.stringify({ event: 'fixtures_encoded', records: rows.length, mint, wallet }));
