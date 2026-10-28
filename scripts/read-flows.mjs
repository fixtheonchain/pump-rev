// Read-only look at where money actually moves: recent bonding-curve and PumpSwap trades,
// a graduation, the buyback vaults and their sweeps, the PUMP mint, and who signs for the
// upgrade and admin keys. Decodes Anchor events with the IDLs in ../idl and labels every
// balance change with the roles found in data/live-snapshot.json (run read-live.mjs first).
//
//   node scripts/read-flows.mjs                  # every section, about 30 RPC calls on public mainnet
//   node scripts/read-flows.mjs keys buyback     # only these sections, merged into the existing snapshot
//   node scripts/read-flows.mjs tx <sig> [sig…]  # decode the given transactions into `transactions`
//   node scripts/read-flows.mjs coin <mint>      # decode one coin's curve, pool and sharing config into `coins`
//
// Sections: vaults, trades, regular, migration, buyback, keys. Writes data/flows-snapshot.json.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ROOT, RPC, b58encode, b58decode, findPda, rpc, rpcCalls, getAccounts, decodeAccount, decodeEvent, loadIdl } from './lib.mjs';

const IDL = Object.fromEntries(['pump', 'pump_amm', 'pump_fees'].map(n => [n, loadIdl(n)]));
const live = JSON.parse(readFileSync(join(ROOT, 'data', 'live-snapshot.json'), 'utf8'));
const P = Object.fromEntries(Object.entries(live.programs).map(([k, v]) => [k, v.address]));
const byProgram = { [P.pump]: IDL.pump, [P.pump_amm]: IDL.pump_amm, [P.pump_fees]: IDL.pump_fees };

// role labels for balance changes
const roles = new Map(Object.entries(live.addresses).map(([a, v]) => [a, v.roles.join('; ')]));
const label = (addr, role) => { if (!roles.has(addr)) roles.set(addr, role); };
const s = str => Buffer.from(str);

const ixName = (idl, data) => idl.instructions.find(ix => data.subarray(0, 8).equals(Buffer.from(ix.discriminator)))?.name ?? null;

async function readTx(signature) {
  const tx = await rpc('getTransaction', [signature, { encoding: 'json', maxSupportedTransactionVersion: 1, commitment: 'confirmed' }]);
  if (!tx) return null;
  const msg = tx.transaction.message;
  const keys = [...msg.accountKeys, ...(tx.meta.loadedAddresses?.writable ?? []), ...(tx.meta.loadedAddresses?.readonly ?? [])];
  const signers = msg.accountKeys.slice(0, msg.header.numRequiredSignatures);
  const instructions = msg.instructions.map(ix => {
    const program = keys[ix.programIdIndex];
    const idl = byProgram[program];
    return { program, name: idl ? ixName(idl, b58decode(ix.data)) : null, accounts: ix.accounts.map(i => keys[i]) };
  });
  const events = [];
  for (const group of tx.meta.innerInstructions ?? []) for (const ix of group.instructions) {
    const idl = byProgram[keys[ix.programIdIndex]];
    const ev = idl && decodeEvent(idl, b58decode(ix.data));
    if (ev) events.push({ program: keys[ix.programIdIndex], ...ev });
  }
  // label the accounts these events point at
  for (const ev of events) {
    if (ev.mint && ev.program === P.pump) label(findPda([s('bonding-curve'), b58decode(ev.mint)], P.pump)[0], `bonding curve of ${ev.mint}`);
    if (ev.creator && ev.creator !== '11111111111111111111111111111111') label(findPda([s('creator-vault'), b58decode(ev.creator)], P.pump)[0], `pump creator vault of ${ev.creator}`);
    if (ev.coin_creator && ev.coin_creator !== '11111111111111111111111111111111') label(findPda([s('creator_vault'), b58decode(ev.coin_creator)], P.pump_amm)[0], `PumpSwap creator vault authority of ${ev.coin_creator}`);
    if (ev.user) label(ev.user, 'trader / caller');
    if (ev.pool) label(ev.pool, 'PumpSwap pool');
  }
  const solDeltas = keys.map((k, i) => ({ account: k, role: roles.get(k) ?? null, lamports: tx.meta.postBalances[i] - tx.meta.preBalances[i] }))
    .filter(d => d.lamports !== 0);
  const tokenDeltas = [];
  const pre = new Map((tx.meta.preTokenBalances ?? []).map(b => [b.accountIndex + ':' + b.mint, b]));
  for (const b of tx.meta.postTokenBalances ?? []) {
    const before = BigInt(pre.get(b.accountIndex + ':' + b.mint)?.uiTokenAmount.amount ?? '0');
    const delta = BigInt(b.uiTokenAmount.amount) - before;
    if (delta !== 0n) tokenDeltas.push({ account: keys[b.accountIndex], owner: b.owner, ownerRole: roles.get(b.owner) ?? null, mint: b.mint, amount: delta.toString() });
  }
  return {
    signature, slot: tx.slot, blockTime: tx.blockTime && new Date(tx.blockTime * 1000).toISOString(),
    fee: tx.meta.fee, err: tx.meta.err, signers, instructions, events, solDeltas, tokenDeltas,
  };
}

// fetch recent signatures for an address and read transactions until `want` says it has enough
async function sample(address, limit, maxReads, want) {
  const sigs = await rpc('getSignaturesForAddress', [address, { limit, commitment: 'confirmed' }]);
  const found = [];
  for (const sig of sigs.filter(x => !x.err)) {
    if (found.length >= maxReads) break;
    const tx = await readTx(sig.signature);
    if (tx && want(tx, found)) found.push(tx);
    if (want.done?.(found)) break;
  }
  return found;
}

const SNAPSHOT = join(ROOT, 'data', 'flows-snapshot.json');
const args = process.argv.slice(2);
const txSigs = args[0] === 'tx' ? args.slice(1) : [];
const coinMints = args[0] === 'coin' ? args.slice(1) : [];
const sections = new Set(txSigs.length ? ['tx'] : coinMints.length ? ['coin'] : args);
const run = name => !sections.size || sections.has(name);
const out = sections.size && existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, 'utf8')) : {};
Object.assign(out, { rpc: RPC, readAt: new Date().toISOString() });

const any = () => true; any.done = f => f.length >= 1;
const vaultAddrs = live.configs['pump.Global'].buyback_fee_recipients;
const isDefault = k => !k || k === '11111111111111111111111111111111';

// 1. buyback vaults and the PUMP mint
if (run('vaults')) {
  const accts = await getAccounts([...vaultAddrs, 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn']);
  out.buybackVaults = vaultAddrs.map((a, i) => ({ address: a, lamports: accts[i].lamports, ...decodeAccount(IDL.pump_fees, 'BuybackVault', accts[i].data) }));
  const m = accts.at(-1).data;
  out.pumpMint = {
    address: 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn',
    owner: accts.at(-1).owner,
    mintAuthority: m.readUInt32LE(0) ? b58encode(m.subarray(4, 36)) : null,
    supply: m.readBigUInt64LE(36).toString(),
    decimals: m[44],
    freezeAuthority: m.readUInt32LE(46) ? b58encode(m.subarray(50, 82)) : null,
  };
}

// 2. trades: one buy and one sell on the bonding curve and on PumpSwap (whatever traded last);
//    "regular": a non-mayhem SOL curve trade and a canonical SOL pool trade, found through
//    the transactions that paid buyback vault 0
if (run('trades')) {
  const tradeKinds = (program, buyEv, sellEv) => {
    const kind = tx => {
      const ev = tx.events.find(e => e.program === program && (e.name === buyEv || e.name === sellEv));
      if (!ev) return null;
      return buyEv === sellEv ? (ev.is_buy ? 'buy' : 'sell') : (ev.name === buyEv ? 'buy' : 'sell');
    };
    const want = (tx, found) => { const k = kind(tx); return k && !found.some(f => kind(f) === k); };
    want.done = found => found.length >= 2;
    return want;
  };
  out.curveTrades = await sample(P.pump, 15, 6, tradeKinds(P.pump, 'TradeEvent', 'TradeEvent'));
  out.poolTrades = await sample(P.pump_amm, 15, 6, tradeKinds(P.pump_amm, 'BuyEvent', 'SellEvent'));
}
if (run('regular')) {
  const regularCurve = tx => tx.events.some(e => e.name === 'TradeEvent' && !e.mayhem_mode && isDefault(e.quote_mint));
  const canonicalPool = tx => tx.events.some(e => (e.name === 'BuyEvent' || e.name === 'SellEvent') && !isDefault(e.coin_creator) && e.protocol_fee_basis_points !== '0' && tx.tokenDeltas.some(d => d.mint === 'So11111111111111111111111111111111111111112'));
  const kindOf = tx => regularCurve(tx) ? 'curve' : canonicalPool(tx) ? 'pool' : null;
  const want = (tx, found) => { const k = kindOf(tx); return k && !found.some(f => kindOf(f) === k); };
  want.done = found => found.length >= 2;
  out.regularTrades = await sample(vaultAddrs[0], 12, 5, want);
}

// 3. a graduation (migrate / migrate_v2); its remainder fee goes to the migration wallet
if (run('migration')) {
  const migrated = tx => tx.events.some(e => e.name === 'CompletePumpAmmMigrationEvent');
  migrated.done = f => f.length >= 1;
  out.migration = await sample(live.configs['pump.Global'].withdraw_authority, 6, 3, migrated);
}

// 4. where the buyback and protocol fee money goes next
if (run('buyback')) {
  const authority = out.buybackVaults?.[0]?.authority;
  const swept = tx => tx.instructions.some(ix => ix.program === P.pump_fees && ix.name === 'sweep_buyback');
  swept.done = f => f.length >= 1;
  out.buybackSweep = authority ? await sample(authority, 6, 2, swept) : [];
  out.feeRecipientLatest = await sample(live.configs['pump.Global'].fee_recipient, 3, 1, any);
}

// 5. who signs for the upgrade authority and the config admin (Squads v4 multisig?)
if (run('keys')) {
  const SQUADS = 'SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf';
  const MULTISIG_DISC = createHash('sha256').update('account:Multisig').digest().subarray(0, 8);
  out.upgradeAuthorityLatest = await sample(live.programs.pump.upgradeAuthority, 3, 1, any);
  out.adminLatest = await sample(live.configs['pump.Global'].authority, 10, 1, any);
  const candidates = [...new Set([...out.upgradeAuthorityLatest, ...out.adminLatest]
    .flatMap(tx => tx.instructions.filter(ix => ix.program === SQUADS).flatMap(ix => ix.accounts)))];
  const accts = candidates.length ? await getAccounts(candidates) : [];
  out.multisigs = candidates.map((address, i) => ({ address, a: accts[i] }))
    .filter(({ a }) => a && a.owner === SQUADS && a.data.subarray(0, 8).equals(MULTISIG_DISC))
    .map(({ address, a }) => {
      const d = a.data; let o = 8;
      const createKey = b58encode(d.subarray(o, o += 32));
      const configAuthority = b58encode(d.subarray(o, o += 32));
      const threshold = d.readUInt16LE(o); o += 2;
      const timeLock = d.readUInt32LE(o); o += 4;
      const transactionIndex = d.readBigUInt64LE(o).toString(); o += 8;
      o += 8; // stale_transaction_index
      const rentCollector = d[o++] ? b58encode(d.subarray(o, o += 32)) : null;
      const bump = d[o++];
      const members = Array.from({ length: d.readUInt32LE(o) }, (_, k) => ({
        key: b58encode(d.subarray(o + 4 + k * 33, o + 4 + k * 33 + 32)),
        permissions: d[o + 4 + k * 33 + 32], // bitmask: 1 initiate, 2 vote, 4 execute
      }));
      const vaults = [0, 1, 2, 3].map(index => findPda([s('multisig'), b58decode(address), s('vault'), Buffer.from([index])], SQUADS)[0]);
      return { address, createKey, configAuthority, threshold, timeLockSeconds: timeLock, transactionIndex, rentCollector, bump, members, vaults };
    });
}

// 6. specific transactions picked from an explorer
if (txSigs.length) {
  out.transactions = { ...out.transactions };
  for (const sig of txSigs) out.transactions[sig] = await readTx(sig);
}

// 7. one coin's on-chain state: bonding curve, canonical SOL pool, fee sharing config
for (const mint of coinMints) {
  const m = b58decode(mint);
  const poolAuthority = findPda([s('pool-authority'), m], P.pump)[0];
  const addr = {
    bondingCurve: findPda([s('bonding-curve'), m], P.pump)[0],
    pool: findPda([s('pool'), Buffer.from([0, 0]), b58decode(poolAuthority), m, b58decode('So11111111111111111111111111111111111111112')], P.pump_amm)[0],
    sharingConfig: findPda([s('sharing-config'), m], P.pump_fees)[0],
  };
  const [bc, pool, sc] = await getAccounts(Object.values(addr));
  out.coins = { ...out.coins, [mint]: {
    readAt: new Date().toISOString(),
    bondingCurve: bc && { address: addr.bondingCurve, lamports: bc.lamports, ...decodeAccount(IDL.pump, 'BondingCurve', bc.data) },
    pool: pool && { address: addr.pool, ...decodeAccount(IDL.pump_amm, 'Pool', pool.data) },
    sharingConfig: sc && { address: addr.sharingConfig, ...decodeAccount(IDL.pump_fees, 'SharingConfig', sc.data) },
  } };
}

out.rpcCalls = rpcCalls();
writeFileSync(SNAPSHOT, JSON.stringify(out, null, 2));
console.log(`${rpcCalls()} RPC calls → data/flows-snapshot.json`);
