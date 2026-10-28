// Read-only snapshot of pump.fun's on-chain state: program upgrade authorities,
// on-chain Anchor IDLs and the global config accounts, decoded with the IDLs in ../idl.
// No dependencies. Uses a handful of RPC calls (getMultipleAccounts batches + getBlockTime).
//
//   node scripts/read-live.mjs            # public mainnet RPC
//   RPC_URL=https://... node scripts/read-live.mjs
//
// Writes data/live-snapshot.json and idl/onchain/<program>.json (when an IDL account exists).

import { inflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, RPC, b58encode, b58decode, findPda, createWithSeed, rpc, rpcCalls, getAccounts, decodeAccount, loadIdl } from './lib.mjs';

// ---------- what to read ----------

const IDL = Object.fromEntries(['pump', 'pump_amm', 'pump_fees', 'pump_agent_payments'].map(n => [n, loadIdl(n)]));

const PROGRAMS = {
  pump: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
  pump_amm: 'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA',
  pump_fees: 'pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ',
  mayhem: 'MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e',
  pump_agent_payments: 'AgenTMiC2hvxGebTsgmsD4HHBa8WEcqGFf87iwRRxLo7',
  donation_relay: 'RLAYHr9TRFcKB2ubYQhspcnXiaGpaVzNQvHytt47RZu',
  terminal_proxy: 'term9YPb9mzAsABaqN71A4xdbxHmpBNZavpBiQKZzN3',
  pump_stables_router: '6Vo3245eszAb5wuqEMw8mGdbfRUdKbHhDHP5LcaGuTAB',
  // Candidates found on 2026-10-28: the agent-payments IDL address embedded in the web bundle,
  // and the program id of github.com/pump-fun/transfer-hook-authority.
  pump_agent_payments_web: 'pUmPFn9WvfaN2WTVGnCEtJTd2ATTpvpsKRz6jVzu6u4',
  transfer_hook_authority: '333UA891CYPpAJAthphPT3hg1EkUBLhNFoP9HoWW3nug',
};

const s = str => Buffer.from(str);
const pk = b58decode;
const CONFIGS = [
  ['pump.Global', 'pump', 'Global', findPda([s('global')], PROGRAMS.pump)[0]],
  ['pump.QuoteControl', 'pump', 'QuoteControl', findPda([s('quote-control')], PROGRAMS.pump)[0]],
  ['pump.GlobalVolumeAccumulator', 'pump', 'GlobalVolumeAccumulator', findPda([s('global_volume_accumulator')], PROGRAMS.pump)[0]],
  ['pump_amm.GlobalConfig', 'pump_amm', 'GlobalConfig', findPda([s('global_config')], PROGRAMS.pump_amm)[0]],
  ['pump_amm.GlobalVolumeAccumulator', 'pump_amm', 'GlobalVolumeAccumulator', findPda([s('global_volume_accumulator')], PROGRAMS.pump_amm)[0]],
  ['pump_fees.FeeConfig(pump)', 'pump_fees', 'FeeConfig', findPda([s('fee_config'), pk(PROGRAMS.pump)], PROGRAMS.pump_fees)[0]],
  ['pump_fees.FeeConfig(pump_amm)', 'pump_fees', 'FeeConfig', findPda([s('fee_config'), pk(PROGRAMS.pump_amm)], PROGRAMS.pump_fees)[0]],
  ['pump_fees.FeeProgramGlobal', 'pump_fees', 'FeeProgramGlobal', findPda([s('fee-program-global')], PROGRAMS.pump_fees)[0]],
  ['pump_agent_payments.GlobalConfig', 'pump_agent_payments', 'GlobalConfig', findPda([s('global-config')], PROGRAMS.pump_agent_payments)[0]],
];
const RAW = [
  ['mayhem.global-params', findPda([s('global-params')], PROGRAMS.mayhem)[0]],
  ['mayhem.sol-vault', findPda([s('sol-vault')], PROGRAMS.mayhem)[0]],
  ['PUMP mint', 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn'],
  ['legacy withdraw/migration authority', '39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg'],
  // Unlabelled addresses constant in the web bundle (2026-10-28)
  ['web.9pan9bMn', '9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP'],
  ['web.quoteMint.4zMMC9sr', '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'],
  ['web.33MxwC33', '33MxwC33Eqgmon152hBcpEYuXUmf2kaK1P74wVz3ry8k'],
  ['web.feeRecipient.CebN5WGQ', 'CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM'],
  ['web.tip.pfnTcJ1i', 'pfnTcJ1i4mRYzbqGduF71RsooUCFkPSpk8UE7drCkjh'],
  ['web.lookupTable.Hyif6eWb', 'Hyif6eWb8x88RVrvjPfabsgRYnwkVnyByEXTVTXbUcyP'],
  ['skills.lookupTable.7mFD2mUt', '7mFD2mUtRS65XstiSAvCJuYmdesZoQwCwRJhq1p3eRMe'],
];

// ---------- run ----------

const snapshot = { rpc: RPC, readAt: new Date().toISOString() };
snapshot.slot = await rpc('getSlot', [{ commitment: 'confirmed' }]);

// 1. programs → ProgramData → upgrade authority, last deploy slot
const progNames = Object.keys(PROGRAMS);
const progAccts = await getAccounts(progNames.map(n => PROGRAMS[n]));
const programDataAddrs = progAccts.map(a => (a && a.data.length >= 36 && a.data.readUInt32LE(0) === 2) ? b58encode(a.data.subarray(4, 36)) : null);
const pdAccts = await getAccounts(programDataAddrs.filter(Boolean), { dataSlice: { offset: 0, length: 45 } });
snapshot.programs = {};
let j = 0;
for (const [i, n] of progNames.entries()) {
  const a = progAccts[i];
  const entry = { address: PROGRAMS[n], exists: !!a, owner: a?.owner, executable: a?.executable };
  if (programDataAddrs[i]) {
    const pd = pdAccts[j++];
    entry.programData = programDataAddrs[i];
    if (!pd) { entry.programDataExists = false; snapshot.programs[n] = entry; continue; } // closed program
    entry.lastDeploySlot = Number(pd.data.readBigUInt64LE(4));
    entry.upgradeAuthority = pd.data[12] ? b58encode(pd.data.subarray(13, 45)) : null; // null = immutable
    entry.programDataSpace = pd.space ?? null;
    entry.programDataLamports = pd.lamports;
  }
  snapshot.programs[n] = entry;
}
for (const e of Object.values(snapshot.programs)) {
  if (!e.lastDeploySlot) continue;
  try { const t = await rpc('getBlockTime', [e.lastDeploySlot]); e.lastDeployTime = t ? new Date(t * 1000).toISOString() : null; }
  catch { e.lastDeployTime = null; }
}

// 2. on-chain Anchor IDL accounts: createWithSeed(findPda([], program), "anchor:idl", program)
const idlAddrs = progNames.map(n => createWithSeed(findPda([], PROGRAMS[n])[0], 'anchor:idl', PROGRAMS[n]));
const idlAccts = await getAccounts(idlAddrs);
mkdirSync(join(ROOT, 'idl', 'onchain'), { recursive: true });
snapshot.onchainIdl = {};
for (const [i, n] of progNames.entries()) {
  const a = idlAccts[i];
  if (!a) { snapshot.onchainIdl[n] = { address: idlAddrs[i], exists: false }; continue; }
  const authority = b58encode(a.data.subarray(8, 40));
  const len = a.data.readUInt32LE(40);
  let instructions = null;
  try {
    const json = inflateSync(a.data.subarray(44, 44 + len)).toString('utf8');
    writeFileSync(join(ROOT, 'idl', 'onchain', n + '.json'), json);
    const parsed = JSON.parse(json);
    instructions = parsed.instructions.map(x => x.name);
  } catch (e) { instructions = 'undecodable: ' + e.message; }
  snapshot.onchainIdl[n] = { address: idlAddrs[i], exists: true, authority, compressedBytes: len, instructions };
}

// 3. global configs, decoded with the repo IDLs
const cfgAccts = await getAccounts([...CONFIGS.map(c => c[3]), ...RAW.map(r => r[1])]);
snapshot.configs = {};
for (const [i, [label, prog, type, address]] of CONFIGS.entries()) {
  const a = cfgAccts[i];
  snapshot.configs[label] = a ? { address, owner: a.owner, lamports: a.lamports, ...decodeAccount(IDL[prog], type, a.data) } : { address, exists: false };
}
for (const [k, [label, address]] of RAW.entries()) {
  const a = cfgAccts[CONFIGS.length + k];
  snapshot.configs[label] = a ? { address, owner: a.owner, lamports: a.lamports, bytes: a.data.length, dataHex: a.data.subarray(0, 512).toString('hex') } : { address, exists: false };
}

// 4. who owns the fee destinations and authorities named in those configs
const g = snapshot.configs['pump.Global'];
const gc = snapshot.configs['pump_amm.GlobalConfig'];
const named = new Map();
const add = (addr, role) => { if (addr && addr !== '11111111111111111111111111111111') named.set(addr, [...(named.get(addr) ?? []), role]); };
add(g.authority, 'pump.Global.authority');
add(g.withdraw_authority, 'pump.Global.withdraw_authority');
add(g.set_creator_authority, 'pump.Global.set_creator_authority');
add(g.admin_set_creator_authority, 'pump.Global.admin_set_creator_authority');
add(g.holder_reward_claim_authority, 'pump.Global.holder_reward_claim_authority');
add(g.whitelist_pda, 'pump.Global.whitelist_pda');
add(g.fee_recipient, 'pump.Global.fee_recipient');
g.fee_recipients?.forEach((x, i) => add(x, `pump.Global.fee_recipients[${i}]`));
add(g.reserved_fee_recipient, 'pump.Global.reserved_fee_recipient');
g.reserved_fee_recipients?.forEach((x, i) => add(x, `pump.Global.reserved_fee_recipients[${i}]`));
g.buyback_fee_recipients?.forEach((x, i) => add(x, `pump.Global.buyback_fee_recipients[${i}]`));
add(gc.admin, 'pump_amm.GlobalConfig.admin');
add(gc.admin_set_coin_creator_authority, 'pump_amm.GlobalConfig.admin_set_coin_creator_authority');
add(gc.boost_authority, 'pump_amm.GlobalConfig.boost_authority');
gc.protocol_fee_recipients?.forEach((x, i) => add(x, `pump_amm.GlobalConfig.protocol_fee_recipients[${i}]`));
gc.buyback_fee_recipients?.forEach((x, i) => add(x, `pump_amm.GlobalConfig.buyback_fee_recipients[${i}]`));
add(snapshot.configs['pump_fees.FeeConfig(pump)'].admin, 'pump_fees.FeeConfig(pump).admin');
add(snapshot.configs['pump_fees.FeeConfig(pump_amm)'].admin, 'pump_fees.FeeConfig(pump_amm).admin');
add(snapshot.configs['pump_fees.FeeProgramGlobal'].authority, 'pump_fees.FeeProgramGlobal.authority');
add(snapshot.configs['pump_fees.FeeProgramGlobal'].social_claim_authority, 'pump_fees.FeeProgramGlobal.social_claim_authority');
add(snapshot.configs['pump.QuoteControl'].admin, 'pump.QuoteControl.admin');
add(snapshot.configs['pump.QuoteControl'].reserves_admin, 'pump.QuoteControl.reserves_admin');
add(snapshot.configs['pump_agent_payments.GlobalConfig'].protocol_authority, 'pump_agent_payments.GlobalConfig.protocol_authority');
add(snapshot.configs['pump_agent_payments.GlobalConfig'].buyback_authority, 'pump_agent_payments.GlobalConfig.buyback_authority');
for (const e of Object.values(snapshot.programs)) add(e.upgradeAuthority, 'upgrade authority');

const addrs = [...named.keys()];
const accts = await getAccounts(addrs, { dataSlice: { offset: 0, length: 8 } });
const bv = IDL.pump_fees.accounts.find(a => a.name === 'BuybackVault').discriminator;
snapshot.addresses = Object.fromEntries(addrs.map((addr, i) => {
  const a = accts[i];
  return [addr, {
    roles: named.get(addr),
    exists: !!a,
    owner: a?.owner ?? null,
    lamports: a?.lamports ?? 0,
    space: a?.space ?? null,
    isBuybackVault: !!a && a.data.length === 8 && a.data.equals(Buffer.from(bv)),
  }];
}));

snapshot.rpcCalls = rpcCalls();
writeFileSync(join(ROOT, 'data', 'live-snapshot.json'), JSON.stringify(snapshot, null, 2));
console.log(`slot ${snapshot.slot}, ${rpcCalls()} RPC calls → data/live-snapshot.json`);
