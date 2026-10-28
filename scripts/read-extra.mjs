// Read-only checks added on 2026-10-28, for what the 2026-10-26 scripts did not cover:
//   1. a pump.fun coin's Token-2022 mint: base fields and every extension, decoded;
//   2. whether the program binaries shipped in pump-rust-client 0.5.0 match what is deployed (sha256 of ProgramData);
//   3. the newest transactions of Mayhem, the App router and Terminal: signers, the instruction each one runs
//      (Anchor discriminators matched against names found in their binaries) and the programs they call.
// About 20 RPC calls. Writes data/extra-snapshot.json.
//
//   node scripts/read-extra.mjs <dir with mayhem_program.so, pump_stables_router.so, terminal_proxy.so>

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, b58encode, b58decode, rpc, rpcCalls, getAccounts } from './lib.mjs';

const ARTIFACTS = process.argv[2];
const MINT = '6xc3RU6UMZinBJJgeMaNBqRbanTdG1QTq47tCXXwpump';
const sha = b => createHash('sha256').update(b).digest('hex');
const out = { readAt: new Date().toISOString() };

// ---------- 1. Token-2022 mint ----------

const EXT = { 1: 'TransferFeeConfig', 3: 'MintCloseAuthority', 6: 'DefaultAccountState', 9: 'NonTransferable', 10: 'InterestBearingConfig', 12: 'PermanentDelegate', 14: 'TransferHook', 18: 'MetadataPointer', 19: 'TokenMetadata', 20: 'GroupPointer', 21: 'TokenGroup', 22: 'GroupMemberPointer', 23: 'TokenGroupMember', 25: 'ScaledUiAmount', 26: 'Pausable' };
const coption = (d, o) => (d.readUInt32LE(o) ? b58encode(d.subarray(o + 4, o + 36)) : null);
const str = (d, o) => { const n = d.readUInt32LE(o); return [d.subarray(o + 4, o + 4 + n).toString('utf8'), o + 4 + n]; };

const [mintAcct] = await getAccounts([MINT]);
const d = mintAcct.data;
const mint = {
  address: MINT, owner: mintAcct.owner, bytes: d.length,
  mintAuthority: coption(d, 0), supply: d.readBigUInt64LE(36).toString(), decimals: d[44], freezeAuthority: coption(d, 46),
  accountType: d[165], extensions: [],
};
for (let o = 166; o + 4 <= d.length;) {
  const type = d.readUInt16LE(o), len = d.readUInt16LE(o + 2), body = d.subarray(o + 4, o + 4 + len);
  if (type === 0) break;
  const ext = { type, name: EXT[type] ?? 'unknown', length: len };
  if (type === 18) Object.assign(ext, { authority: b58encode(body.subarray(0, 32)), metadataAddress: b58encode(body.subarray(32, 64)) });
  if (type === 19) {
    let p = 64, name, symbol, uri;
    [name, p] = str(body, p); [symbol, p] = str(body, p); [uri, p] = str(body, p);
    Object.assign(ext, { updateAuthority: b58encode(body.subarray(0, 32)), mint: b58encode(body.subarray(32, 64)), name, symbol, uri, additionalMetadataCount: body.readUInt32LE(p) });
  }
  if (type === 14) Object.assign(ext, { authority: b58encode(body.subarray(0, 32)), programId: b58encode(body.subarray(32, 64)) });
  mint.extensions.push(ext);
  o += 4 + len;
}
out.mint = mint;

// ---------- 2. binaries vs ProgramData ----------

const PROGRAMS = {
  mayhem_program: ['MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e', '4TXghKDfUy26yBMjicyfSfAp995GbLtNvW1d1uPSknub'],
  pump_stables_router: ['6Vo3245eszAb5wuqEMw8mGdbfRUdKbHhDHP5LcaGuTAB', '5RWm5iSZx3XgcEQgEjdj7QYRsSRUhfHcAZE6fVKrNxhx'],
  terminal_proxy: ['term9YPb9mzAsABaqN71A4xdbxHmpBNZavpBiQKZzN3', 'Dw3aPJma3ZaaRgTorVE2scvJtArdQuM2WjTPZXRYwPt6'],
};
out.binaries = {};
for (const [name, [, programData]] of Object.entries(PROGRAMS)) {
  const file = ARTIFACTS && join(ARTIFACTS, name + '.so');
  if (!file || !existsSync(file)) continue;
  const so = readFileSync(file);
  const [pd] = await getAccounts([programData], { dataSlice: { offset: 45, length: so.length + 64 } });
  const deployed = pd.data.subarray(0, so.length);
  out.binaries[name] = { soBytes: so.length, soSha256: sha(so), deployedPrefixSha256: sha(deployed), identical: deployed.equals(so), tailAllZero: pd.data.subarray(so.length).every(b => b === 0) };
}

// ---------- 3. newest transactions ----------

// Instruction names as found in each binary's "Instruction: <Name>" log strings (scripts/so-strings.mjs).
const NAMES = {
  mayhem_program: 'Buy Sell BuyPumpSwap SellPumpSwap InitializeGlobalParams UpdateGlobalParams InitializeFeeRecipient SweepFees SweepFeesAdmin UpdateMaxSolPerSweep WithdrawAdmin UpdateTrader UpdateAdmin ResetState ResetSolDeployed ResumeTrading StopTrading BurnTokens ExtendAccount InitializeMayhemState',
  pump_stables_router: 'BondingCurve BondingCurveV2 CreateCoinAndBuyBondingCurveV2 PumpSwap PumpSwapV2 SellBondingCurvePercentage SellPumpSwapPercentage RaydiumCpmm RaydiumClmm RaydiumLaunchlab RaydiumAmm MeteoraDbc MeteoraDamm MeteoraDlmm',
  terminal_proxy: 'Initialize ValidateNonce V2BuyExactInPumpFun SellAllViaRaydiumV4 SellExactOutPumpFun BuyExactInPumpFunV3 SellAllViaRaydiumClmm SwapV2RaydiumClmm BuyExactInPumpFun BuyExactInPumpFunV3Wsol SellExactInPumpFun SellExactOutPumpSwap SellExactInPumpFunV2 SellExactOutPumpFunV2 SellExactOutPumpSwapV2 SellExactInPumpFunV3 SellExactOutPumpFunV3 SellExactOutPumpSwapV3 SellExactInPumpFunWsol SellExactOutPumpFunWsol V2BuyExactInPumpFunWsol V2SellExactInPumpFun V2SellExactInPumpFunWsol V2SellExactOutPumpFun V2SellExactOutPumpFunWsol',
};
const snake = s => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').toLowerCase();
const disc = n => createHash('sha256').update('global:' + snake(n)).digest().subarray(0, 8).toString('hex');
const KNOWN = { '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P': 'pump', pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA: 'pump_amm', pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ: 'pump_fees', MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e: 'mayhem', '6Vo3245eszAb5wuqEMw8mGdbfRUdKbHhDHP5LcaGuTAB': 'pump_app_router', term9YPb9mzAsABaqN71A4xdbxHmpBNZavpBiQKZzN3: 'terminal', ComputeBudget111111111111111111111111111111: 'compute_budget', '11111111111111111111111111111111': 'system', TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: 'spl_token', TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: 'token_2022', ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: 'ata', '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'raydium_amm_v4', CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK: 'raydium_clmm', CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C: 'raydium_cpmm', LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj: 'raydium_launchlab', dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN: 'meteora_dbc', cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG: 'meteora_damm_v2', LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo: 'meteora_dlmm', JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUJoi5QNyVTaV4: 'jupiter_v6', L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95: 'lighthouse', srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX: 'openbook' };

out.transactions = {};
for (const [name, [programId]] of Object.entries(PROGRAMS)) {
  const table = new Map(NAMES[name].split(' ').map(n => [disc(n), n]));
  const sigs = (await rpc('getSignaturesForAddress', [programId, { limit: 20, commitment: 'confirmed' }])).filter(s => !s.err).slice(0, 3);
  out.transactions[name] = [];
  for (const s of sigs) {
    const tx = await rpc('getTransaction', [s.signature, { encoding: 'json', maxSupportedTransactionVersion: 1, commitment: 'confirmed' }]);
    if (!tx) continue;
    const msg = tx.transaction.message;
    const keys = [...msg.accountKeys, ...(tx.meta.loadedAddresses?.writable ?? []), ...(tx.meta.loadedAddresses?.readonly ?? [])];
    const label = k => KNOWN[k] ?? k;
    const ixs = msg.instructions.map((ix, i) => {
      const program = keys[ix.programIdIndex];
      const data = b58decode(ix.data);
      const inner = (tx.meta.innerInstructions ?? []).find(x => x.index === i)?.instructions ?? [];
      return {
        program: label(program),
        name: program === programId ? (table.get(data.subarray(0, 8).toString('hex')) ?? 'unmatched:' + data.subarray(0, 8).toString('hex')) : undefined,
        innerPrograms: [...new Set(inner.map(x => label(keys[x.programIdIndex])))],
      };
    });
    out.transactions[name].push({
      signature: s.signature, slot: s.slot, blockTime: s.blockTime && new Date(s.blockTime * 1000).toISOString(),
      signers: msg.accountKeys.slice(0, msg.header.numRequiredSignatures), instructions: ixs,
    });
  }
}

out.rpcCalls = rpcCalls();
writeFileSync(join(ROOT, 'data', 'extra-snapshot.json'), JSON.stringify(out, null, 2));
console.log(`${rpcCalls()} RPC calls → data/extra-snapshot.json`);
