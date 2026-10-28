// Shared helpers for the read-only scripts: base58, PDAs, a counted JSON-RPC client
// and an IDL-driven borsh decoder. No dependencies.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const RPC = process.env.RPC_URL ?? 'https://api.mainnet-beta.solana.com';

export const loadIdl = name => JSON.parse(readFileSync(join(ROOT, 'idl', name + '.json'), 'utf8'));

// ---------- base58, sha256, PDAs ----------

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function b58encode(bytes) {
  let n = BigInt('0x' + (Buffer.from(bytes).toString('hex') || '0'));
  let out = '';
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of bytes) { if (b !== 0) break; out = '1' + out; }
  return out;
}

export function b58decode(str) {
  let n = 0n;
  for (const c of str) n = n * 58n + BigInt(ALPHABET.indexOf(c));
  let hex = n.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  const body = n === 0n ? [] : [...Buffer.from(hex, 'hex')];
  const zeros = str.match(/^1*/)[0].length;
  return Buffer.from([...new Array(zeros).fill(0), ...body]);
}

const sha256 = (...parts) => createHash('sha256').update(Buffer.concat(parts.map(p => Buffer.from(p)))).digest();

// ed25519 point decompression check (curve25519-dalek semantics): a PDA must not be on the curve.
const P = 2n ** 255n - 19n;
function modPow(b, e) { let r = 1n; b %= P; while (e > 0n) { if (e & 1n) r = r * b % P; b = b * b % P; e >>= 1n; } return r; }
function modInv(a) { return modPow((a % P + P) % P, P - 2n); }
const D = P - 121665n * modInv(121666n) % P;

export function isOnCurve(bytes) {
  const le = Buffer.from(bytes); le[31] &= 0x7f;
  const y = BigInt('0x' + Buffer.from(le).reverse().toString('hex')) % P;
  const y2 = y * y % P;
  const u = (y2 - 1n + P) % P;
  const v = (D * y2 + 1n) % P;
  const x = u * modPow(v, 3n) % P * modPow(u * modPow(v, 7n) % P, (P - 5n) / 8n) % P;
  const vx2 = v * x % P * x % P;
  return vx2 === u || vx2 === (P - u) % P;
}

export function findPda(seeds, programId) {
  const pid = b58decode(programId);
  for (let bump = 255; bump >= 0; bump--) {
    const h = sha256(...seeds, [bump], pid, Buffer.from('ProgramDerivedAddress'));
    if (!isOnCurve(h)) return [b58encode(h), bump];
  }
  throw new Error('no PDA');
}

export const createWithSeed = (base, seed, owner) => b58encode(sha256(b58decode(base), Buffer.from(seed), b58decode(owner)));

// ---------- RPC ----------

let calls = 0;
export const rpcCalls = () => calls;
const wait = ms => new Promise(r => setTimeout(r, ms));

// Public RPC answers 429 quickly: space calls out and retry a 429 a few times with backoff.
export async function rpc(method, params) {
  let res;
  for (let attempt = 0; attempt < 4; attempt++) {
    await wait(attempt ? 2000 * 2 ** attempt : 700);
    calls++;
    res = await fetch(RPC, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: calls, method, params }),
    });
    if (res.status !== 429) break;
  }
  if (!res.ok) throw new Error(`${method}: HTTP ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`${method}: ${JSON.stringify(body.error)}`);
  return body.result;
}

export async function getAccounts(addresses, extra = {}) {
  const out = [];
  for (let i = 0; i < addresses.length; i += 100) {
    const r = await rpc('getMultipleAccounts', [addresses.slice(i, i + 100), { encoding: 'base64', commitment: 'confirmed', ...extra }]);
    out.push(...r.value.map(v => v && { ...v, data: Buffer.from(v.data[0], 'base64') }));
  }
  return out;
}

// ---------- IDL-driven borsh decoding ----------

class Reader {
  constructor(buf) { this.buf = buf; this.o = 0; }
  need(n) { if (this.o + n > this.buf.length) throw new RangeError('short'); }
  u(n) { this.need(n); const v = this.buf.subarray(this.o, this.o + n); this.o += n; return v; }
  uint(n) { return BigInt('0x' + (Buffer.from(this.u(n)).reverse().toString('hex') || '0')); }
  int(n) { const v = this.uint(n); const top = 1n << BigInt(8 * n - 1); return v >= top ? v - (top << 1n) : v; }
}

function decodeType(t, r, types) {
  if (typeof t === 'string') {
    switch (t) {
      case 'bool': return r.u(1)[0] !== 0;
      case 'u8': return r.u(1)[0];
      case 'u16': case 'u32': return Number(r.uint(t === 'u16' ? 2 : 4));
      case 'u64': case 'u128': return r.uint(t === 'u64' ? 8 : 16).toString();
      case 'i64': case 'i128': return r.int(t === 'i64' ? 8 : 16).toString();
      case 'pubkey': return b58encode(r.u(32));
      case 'string': return Buffer.from(r.u(Number(r.uint(4)))).toString('utf8');
      case 'bytes': return Buffer.from(r.u(Number(r.uint(4)))).toString('hex');
      default: throw new Error('type ' + t);
    }
  }
  if (t.array) return Array.from({ length: t.array[1] }, () => decodeType(t.array[0], r, types));
  if (t.vec) return Array.from({ length: Number(r.uint(4)) }, () => decodeType(t.vec, r, types));
  if (t.option) return r.u(1)[0] ? decodeType(t.option, r, types) : null;
  if (t.defined) {
    const def = types.get(t.defined.name);
    if (def.type.kind === 'struct') return decodeFields(def.type.fields, r, types);
    const variant = def.type.variants[r.u(1)[0]];
    return variant.fields ? { [variant.name]: decodeFields(variant.fields, r, types) } : variant.name;
  }
  throw new Error('type ' + JSON.stringify(t));
}

// Accounts and events written before a field was appended are shorter: missing trailing fields come back as null.
function decodeFields(fields, r, types) {
  const out = {};
  for (const f of fields) {
    try { out[f.name] = decodeType(f.type, r, types); }
    catch (e) { if (e instanceof RangeError) { out[f.name] = null; } else throw e; }
  }
  return out;
}

export function decodeStruct(idl, typeName, buf) {
  const types = new Map(idl.types.map(t => [t.name, t]));
  return decodeFields(types.get(typeName).type.fields, new Reader(buf), types);
}

export function decodeAccount(idl, name, data) {
  const def = idl.accounts.find(a => a.name === name);
  if (!data.subarray(0, 8).equals(Buffer.from(def.discriminator))) throw new Error(`${name}: discriminator mismatch`);
  return { _bytes: data.length, ...decodeStruct(idl, name, data.subarray(8)) };
}

// Anchor emit_cpi events: a self-invoke whose data is EVENT_IX_TAG (LE) + event discriminator + payload.
const EVENT_IX_TAG = Buffer.from('e445a52e51cb9a1d', 'hex');

export function decodeEvent(idl, data) {
  if (data.length < 16 || !data.subarray(0, 8).equals(EVENT_IX_TAG)) return null;
  const ev = idl.events.find(e => data.subarray(8, 16).equals(Buffer.from(e.discriminator)));
  return ev ? { name: ev.name, ...decodeStruct(idl, ev.name, data.subarray(16)) } : null;
}
