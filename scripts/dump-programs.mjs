// Read-only dump of the deployed program binaries: each program's ProgramData account,
// the ELF after its 45-byte header written as binaries/<program>.so, and a manifest
// with the deploy slot, the read slot and two hashes. No dependencies; 10 RPC calls.
//
//   node scripts/dump-programs.mjs            # public mainnet RPC
//   RPC_URL=https://... node scripts/dump-programs.mjs
//
// sha256        hashes the .so file, sized by the ELF's own headers.
// verifyHash    hashes the ProgramData bytes with trailing zeros trimmed, the convention of
//               `solana-verify get-program-hash <program>`.

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, RPC, b58encode, rpc, rpcCalls } from './lib.mjs';

const PROGRAMS = {
  pump: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
  pump_amm: 'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA',
  pump_fees: 'pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ',
  mayhem: 'MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e',
  pump_agent_payments: 'AgenTMiC2hvxGebTsgmsD4HHBa8WEcqGFf87iwRRxLo7',
  pump_stables_router: '6Vo3245eszAb5wuqEMw8mGdbfRUdKbHhDHP5LcaGuTAB',
  terminal_proxy: 'term9YPb9mzAsABaqN71A4xdbxHmpBNZavpBiQKZzN3',
  donation_relay: 'RLAYHr9TRFcKB2ubYQhspcnXiaGpaVzNQvHytt47RZu',
  transfer_hook_authority: '333UA891CYPpAJAthphPT3hg1EkUBLhNFoP9HoWW3nug',
};

const HEADER = 45; // UpgradeableLoaderState::ProgramData: tag u32, slot u64, Option<Pubkey>
const sha = b => createHash('sha256').update(b).digest('hex');

// End of the ELF image: the furthest of the section header table, every section with file
// contents and every segment. Bytes past it in ProgramData are the account's zero padding.
function elfEnd(elf) {
  if (elf.readUInt32BE(0) !== 0x7f454c46 || elf[4] !== 2 || elf[5] !== 1) throw new Error('not a 64-bit little-endian ELF');
  const phoff = Number(elf.readBigUInt64LE(0x20)), shoff = Number(elf.readBigUInt64LE(0x28));
  const phentsize = elf.readUInt16LE(0x36), phnum = elf.readUInt16LE(0x38);
  const shentsize = elf.readUInt16LE(0x3a), shnum = elf.readUInt16LE(0x3c);
  let end = Math.max(64, phoff + phnum * phentsize, shoff + shnum * shentsize);
  for (let i = 0; i < phnum; i++) {
    const p = phoff + i * phentsize;
    end = Math.max(end, Number(elf.readBigUInt64LE(p + 8)) + Number(elf.readBigUInt64LE(p + 32)));
  }
  for (let i = 0; i < shnum; i++) {
    const s = shoff + i * shentsize;
    if (elf.readUInt32LE(s + 4) === 8) continue; // SHT_NOBITS has no file contents
    end = Math.max(end, Number(elf.readBigUInt64LE(s + 0x18)) + Number(elf.readBigUInt64LE(s + 0x20)));
  }
  return end;
}

const names = Object.keys(PROGRAMS);
const progs = await rpc('getMultipleAccounts', [names.map(n => PROGRAMS[n]), { encoding: 'base64', commitment: 'confirmed' }]);

const manifest = { rpc: RPC, readAt: new Date().toISOString(), programs: {} };
mkdirSync(join(ROOT, 'binaries'), { recursive: true });

for (const [i, name] of names.entries()) {
  const prog = Buffer.from(progs.value[i].data[0], 'base64');
  if (progs.value[i].owner !== 'BPFLoaderUpgradeab1e11111111111111111111111' || prog.readUInt32LE(0) !== 2) {
    throw new Error(`${name}: not an upgradeable-loader program account`);
  }
  const programData = b58encode(prog.subarray(4, 36));

  const res = await rpc('getAccountInfo', [programData, { encoding: 'base64', commitment: 'confirmed' }]);
  const data = Buffer.from(res.value.data[0], 'base64');
  if (data.readUInt32LE(0) !== 3) throw new Error(`${name}: ProgramData tag ${data.readUInt32LE(0)}`);

  const region = data.subarray(HEADER);
  const elfBytes = elfEnd(region);
  if (elfBytes > region.length) throw new Error(`${name}: ELF runs past ProgramData`);
  if (!region.subarray(elfBytes).every(b => b === 0)) throw new Error(`${name}: non-zero bytes after the ELF`);
  const elf = region.subarray(0, elfBytes);
  let last = region.length - 1;
  while (last >= 0 && region[last] === 0) last--;

  writeFileSync(join(ROOT, 'binaries', name + '.so'), elf);
  manifest.programs[name] = {
    program: PROGRAMS[name],
    programData,
    deploySlot: Number(data.readBigUInt64LE(4)),
    upgradeAuthority: data[12] ? b58encode(data.subarray(13, HEADER)) : null,
    readSlot: res.context.slot,
    file: `binaries/${name}.so`,
    elfBytes,
    programDataBytes: region.length,
    sha256: sha(elf),
    verifyHash: sha(region.subarray(0, last + 1)),
  };
  console.log(`${name}: ${elfBytes} bytes, deploy slot ${manifest.programs[name].deploySlot}, read at ${res.context.slot}`);
}

manifest.rpcCalls = rpcCalls();
writeFileSync(join(ROOT, 'binaries', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`${rpcCalls()} RPC calls → binaries/manifest.json`);
