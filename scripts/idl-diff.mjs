// Compares two Anchor IDL files: instructions (with account and argument counts), accounts, events,
// types and errors that were added, removed or changed. No RPC, reads JSON only.
//
//   node scripts/idl-diff.mjs <old.json> <new.json>

import { readFileSync } from 'node:fs';

const [a, b] = process.argv.slice(2).map(p => JSON.parse(readFileSync(p, 'utf8')));

const sig = ix => `${ix.accounts.length} accts (${ix.accounts.map(x => x.name).join(',')}) | args ${JSON.stringify(ix.args)}`;
const byName = (list = []) => new Map(list.map(x => [x.name, x]));

function section(label, left, right, describe) {
  const L = byName(left), R = byName(right);
  const added = [...R.keys()].filter(k => !L.has(k));
  const removed = [...L.keys()].filter(k => !R.has(k));
  const changed = [...R.keys()].filter(k => L.has(k) && describe(L.get(k)) !== describe(R.get(k)));
  console.log(`## ${label}: ${L.size} → ${R.size}`);
  if (added.length) console.log('  added:   ' + added.join(', '));
  if (removed.length) console.log('  removed: ' + removed.join(', '));
  for (const k of changed) console.log(`  changed: ${k}`);
}

console.log(`# ${a.metadata?.name} ${a.metadata?.version} → ${b.metadata?.name} ${b.metadata?.version}`);
section('instructions', a.instructions, b.instructions, sig);
section('accounts', a.accounts, b.accounts, x => JSON.stringify(x.discriminator));
section('events', a.events, b.events, x => JSON.stringify(x.discriminator));
section('types', a.types, b.types, x => JSON.stringify(x.type));
section('errors', a.errors, b.errors, x => `${x.code} ${x.msg}`);
