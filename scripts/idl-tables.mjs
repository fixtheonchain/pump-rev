// Prints a markdown instruction table for one IDL: every instruction, its arguments,
// who must sign (with the config field the signer is checked against), and the IDL doc line.
// No RPC.
//
//   node scripts/idl-tables.mjs pump > /tmp/pump-ix.md

import { loadIdl } from './lib.mjs';

const idl = loadIdl(process.argv[2]);
const fmt = t => typeof t === 'string' ? t
  : t.defined ? t.defined.name
  : t.array ? `[${fmt(t.array[0])}; ${t.array[1]}]`
  : t.option ? `Option<${fmt(t.option)}>`
  : t.vec ? `Vec<${fmt(t.vec)}>` : JSON.stringify(t);

const seedText = s => s.kind === 'const'
  ? (s.value.every(b => b >= 32 && b < 127) ? `"${Buffer.from(s.value)}"` : `<${s.value.length} bytes>`)
  : s.path;

function signerText(a) {
  let out = '`' + a.name + '`';
  if (a.address) out += ` (fixed ${a.address.slice(0, 6)}…)`;
  else if (a.relations) out += ` (= ${a.relations.join(', ')}.${a.name})`;
  else if (a.pda) out += ` (PDA [${a.pda.seeds.map(seedText).join(', ')}])`;
  return out;
}

console.log('| Instruction | Arguments | Signers | IDL doc |');
console.log('| --- | --- | --- | --- |');
for (const ix of idl.instructions) {
  const args = ix.args.map(a => `${a.name}: ${fmt(a.type)}`).join(', ') || '—';
  const signers = ix.accounts.filter(a => a.signer).map(signerText).join('<br>') || '—';
  const doc = (ix.docs ?? []).join(' ').replace(/\|/g, '\\|').slice(0, 220);
  console.log(`| \`${ix.name}\` | ${args} | ${signers} | ${doc} |`);
}
