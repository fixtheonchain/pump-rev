// Lists the Anchor instruction names and error/log strings compiled into a program binary (.so),
// by reading printable byte runs. Reads the file as bytes only; nothing is loaded or executed.
//
//   node scripts/so-strings.mjs <program.so> [regex]

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const [file, pattern] = process.argv.slice(2);
const buf = readFileSync(file);
console.log(`# ${file}: ${buf.length} bytes, sha256 ${createHash('sha256').update(buf).digest('hex')}`);

const runs = [];
let start = -1;
for (let i = 0; i <= buf.length; i++) {
  const c = buf[i];
  const printable = c >= 0x20 && c < 0x7f;
  if (printable && start < 0) start = i;
  if (!printable && start >= 0) { if (i - start >= 6) runs.push(buf.subarray(start, i).toString('latin1')); start = -1; }
}

const re = new RegExp(pattern ?? 'Instruction: ', 'g');
const hits = new Set();
for (const r of runs) for (const m of r.matchAll(re)) hits.add(r.slice(m.index, m.index + 120));
console.log([...hits].join('\n'));
