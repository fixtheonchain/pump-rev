import { createHash } from 'node:crypto';
import { PublicKey, TransactionInstruction, type AccountMeta, AddressLookupTableAccount, TransactionMessage, VersionedTransaction, Keypair, ComputeBudgetProgram } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { createRequire } from 'node:module';
const bs58 = createRequire(__filename)('bs58').default as { encode(bytes:Uint8Array):string;decode(value:string):Uint8Array };
export function encodeBase58(bytes:Uint8Array):string{return bs58.encode(bytes);}
import { pumpIdl, pumpAmmIdl, pumpFeesIdl } from './idls.generated';
export { pumpIdl, pumpAmmIdl, pumpFeesIdl } from './idls.generated';
export { PublicKey, TransactionInstruction, AddressLookupTableAccount, TransactionMessage, VersionedTransaction, Keypair } from '@solana/web3.js';
export const PUMP = new PublicKey(pumpIdl.address);
export const PUMP_AMM = new PublicKey(pumpAmmIdl.address);
export const PUMP_FEES = new PublicKey(pumpFeesIdl.address);
export const ASSOCIATED_TOKEN_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
export const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const TOKEN_2022_PROGRAM = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
export const WSOL = new PublicKey('So11111111111111111111111111111111111111112');
// Wallet-added Lighthouse guard permitted by the signed-message policy.
export const LIGHTHOUSE = new PublicKey('L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95');
export function fixtureSigner(): Keypair { return Keypair.fromSeed(createHash('sha256').update('pumpskel:local-only:transaction-user').digest()); }
export function fixtureAuthority(): Keypair { return Keypair.fromSeed(createHash('sha256').update('pumpskel:local-only:holder-authority').digest()); }
export function fixtureKey(label: string): PublicKey { return Keypair.fromSeed(createHash('sha256').update(`pumpskel:local-only:${label}`).digest()).publicKey; }
export function u64(value: string | bigint): Buffer { const number=BigInt(value); if(number<0n || number>18446744073709551615n) throw new Error('Amount must fit u64'); const out=Buffer.alloc(8); out.writeBigUInt64LE(number); return out; }
export function ata(owner: PublicKey, mint: PublicKey, tokenProgram: PublicKey): PublicKey { return PublicKey.findProgramAddressSync([owner.toBuffer(),tokenProgram.toBuffer(),mint.toBuffer()],ASSOCIATED_TOKEN_PROGRAM)[0]; }
export function pda(program: PublicKey, ...seeds: (string|PublicKey|Buffer)[]): PublicKey { return PublicKey.findProgramAddressSync(seeds.map(seed=>typeof seed==='string'?Buffer.from(seed):seed instanceof PublicKey?seed.toBuffer():seed),program)[0]; }
export type IdlName='pump'|'pump_amm';
export interface AccountContext { accounts: Record<string,string|PublicKey>; fields?: Record<string,string|PublicKey>; }
function key(value: string|PublicKey): PublicKey { return value instanceof PublicKey?value:new PublicKey(value); }
export function instructionSpec(idlName: IdlName, name: string): any { const idl=idlName==='pump'?pumpIdl:pumpAmmIdl; const ix=idl.instructions.find((item:any)=>item.name===name); if(!ix) throw new Error(`Unknown IDL instruction ${idlName}.${name}`); return ix; }
function encodeType(type:any,value:any):Buffer {
 if(type==='u64') return u64(value);
 if(type==='u8'||type==='bool') return Buffer.from([type==='bool'?(value?1:0):Number(value)]);
 if(type?.vec==='u64') { const values=value as string[]; const size=Buffer.alloc(4); size.writeUInt32LE(values.length); return Buffer.concat([size,...values.map(u64)]); }
 if(type?.defined?.name==='OptionBool') return Buffer.from([value?1:0]);
 throw new Error(`Unsupported IDL argument ${JSON.stringify(type)}`);
}
/** Strict account resolution: IDL order/flags, fixed addresses and all seed expressions are authoritative. */
export function idlInstruction(idlName:IdlName,name:string,args:Record<string,any>,context:AccountContext,remaining:AccountMeta[]=[]):TransactionInstruction {
 const spec=instructionSpec(idlName,name); const program=idlName==='pump'?PUMP:PUMP_AMM;
 const resolved=new Map<string,PublicKey>();
 const accountSpecs=new Map<string,any>(spec.accounts.map((item:any)=>[item.name,item]));
 const field=(path:string):PublicKey=>{ const value=context.fields?.[path]; if(value===undefined) throw new Error(`Missing trusted account field ${path}`); return key(value); };
 const seed=(item:any):Buffer=>{
  if(item.kind==='const') return Buffer.from(item.value);
  if(item.kind==='account') return item.path.includes('.')?field(item.path).toBuffer():resolve(item.path).toBuffer();
  throw new Error(`Unsupported IDL seed ${item.kind}`);
 };
 const resolve=(accountName:string):PublicKey=>{
  const cached=resolved.get(accountName); if(cached)return cached;
  const account=accountSpecs.get(accountName); if(!account) { const supplied=context.accounts[accountName]; if(!supplied)throw new Error(`Missing seed account ${accountName}`); return key(supplied); }
  const supplied=context.accounts[accountName]; let expected:PublicKey|undefined;
  if(account.address)expected=new PublicKey(account.address);
  else if(account.pda) { const target=account.pda.program ? new PublicKey(seed(account.pda.program)):program; expected=PublicKey.findProgramAddressSync(account.pda.seeds.map(seed),target)[0]; }
  else if(supplied)expected=key(supplied);
  if(!expected)throw new Error(`Missing strict account ${accountName}`);
  if(supplied && !key(supplied).equals(expected))throw new Error(`IDL address mismatch ${name}.${accountName}`);
  resolved.set(accountName,expected);
  return expected;
 };
 const keys:AccountMeta[]=spec.accounts.map((account:any)=>{const pubkey=resolve(account.name);const absent=Boolean(account.optional)&&pubkey.equals(program);return {pubkey,isSigner:!absent&&Boolean(account.signer),isWritable:!absent&&Boolean(account.writable)};});
 for(const account of spec.accounts) {
  for(const relation of account.relations??[]) {
   const expected=context.fields?.[`${relation}.${account.name}`];
   if(!expected)throw new Error(`Missing trusted relation ${relation}.${account.name}`);
   if(!key(expected).equals(resolve(account.name)))throw new Error(`IDL relation mismatch ${relation}.${account.name}`);
  }
 }
 const data=Buffer.concat([Buffer.from(spec.discriminator),...spec.args.map((arg:any)=>{if(!(arg.name in args))throw new Error(`Missing argument ${arg.name}`);return encodeType(arg.type,args[arg.name]);})]);
 return new TransactionInstruction({programId:program,keys:[...keys,...remaining],data});
}
export function makeLookupTable(addresses:PublicKey[], address=fixtureKey('shared-alt')):AddressLookupTableAccount {
 return new AddressLookupTableAccount({key:address,state:{deactivationSlot:18446744073709551615n,lastExtendedSlot:0,lastExtendedSlotStartIndex:0,authority:undefined,addresses:[...new Map(addresses.map(item=>[item.toBase58(),item])).values()]}});
}
export function compileTransaction(payer:PublicKey,instructions:TransactionInstruction[],blockhash:string,tables:AddressLookupTableAccount[]):VersionedTransaction {
 const tx=new VersionedTransaction(new TransactionMessage({payerKey:payer,recentBlockhash:blockhash,instructions}).compileToV0Message(tables));
 // Solana packet budget; wallets need space for their trailing Lighthouse guard.
 if(tx.serialize().length>1232)throw new Error('Transaction exceeds Solana packet size');
 return tx;
}
export function serializeLookupTables(tables:AddressLookupTableAccount[]):any[] { return tables.map(table=>({key:table.key.toBase58(),addresses:table.state.addresses.map(address=>address.toBase58())})); }
export function restoreLookupTables(tables:any[]):AddressLookupTableAccount[] { return tables.map(table=>makeLookupTable(table.addresses.map((address:string)=>new PublicKey(address)),new PublicKey(table.key))); }
function sameInstruction(a:TransactionInstruction,b:TransactionInstruction):boolean { return a.programId.equals(b.programId)&&a.data.equals(b.data)&&a.keys.length===b.keys.length&&a.keys.every((item,index)=>{const other=b.keys[index]!;return item.pubkey.equals(other.pubkey)&&item.isSigner===other.isSigner&&item.isWritable===other.isWritable;}); }
export interface VerifiedMessage { signature:string; signedHash:string; transaction:VersionedTransaction; }
/** Wallets may rewrite compute budget and append Lighthouse; every asset-moving instruction stays exact. */
export function verifySignedMessage(prepared:VersionedTransaction,signed:VersionedTransaction,tables:AddressLookupTableAccount[]):VerifiedMessage {
 if(signed.serialize().length>1232)throw new Error('Signed transaction exceeds Solana packet size');
 if(signed.version!==0 || prepared.version!==0)throw new Error('Only v0 transactions are accepted');
 if(signed.message.recentBlockhash!==prepared.message.recentBlockhash)throw new Error('Blockhash changed');
 if(signed.message.addressTableLookups.length!==prepared.message.addressTableLookups.length||signed.message.addressTableLookups.some((lookup,index)=>{const expected=prepared.message.addressTableLookups[index]!;return !lookup.accountKey.equals(expected.accountKey)||Buffer.compare(Buffer.from(lookup.writableIndexes),Buffer.from(expected.writableIndexes))!==0||Buffer.compare(Buffer.from(lookup.readonlyIndexes),Buffer.from(expected.readonlyIndexes))!==0;}))throw new Error('Lookup table references changed');
 const expectedSigners=prepared.message.staticAccountKeys.slice(0,prepared.message.header.numRequiredSignatures);
 const actualSigners=signed.message.staticAccountKeys.slice(0,signed.message.header.numRequiredSignatures);
 if(expectedSigners.length!==actualSigners.length||expectedSigners.some((signer,index)=>!signer.equals(actualSigners[index]!)))throw new Error('Required signers changed');
 const preparedKeys=prepared.message.getAccountKeys({addressLookupTableAccounts:tables});
 const signedKeys=signed.message.getAccountKeys({addressLookupTableAccounts:tables});
 const allowedWritable=new Set<string>();
 for(let i=0;i<preparedKeys.length;i++)if(prepared.message.isAccountWritable(i))allowedWritable.add(preparedKeys.get(i)!.toBase58());
 for(let i=0;i<signedKeys.length;i++)if(signed.message.isAccountWritable(i)&&!allowedWritable.has(signedKeys.get(i)!.toBase58()))throw new Error('Wallet introduced a writable account');
 const original=TransactionMessage.decompile(prepared.message,{addressLookupTableAccounts:tables}).instructions.filter(ix=>!ix.programId.equals(ComputeBudgetProgram.programId));
 const actual=TransactionMessage.decompile(signed.message,{addressLookupTableAccounts:tables}).instructions.filter(ix=>!ix.programId.equals(ComputeBudgetProgram.programId));
 if(!original.some(ix=>ix.programId.equals(PUMP)||ix.programId.equals(PUMP_AMM)))throw new Error('Prepared message has no product instruction');
 if(actual.length<original.length||original.some((ix,index)=>!sameInstruction(ix,actual[index]!)))throw new Error('Prepared instructions changed or reordered');
 if(actual.slice(original.length).some(ix=>!ix.programId.equals(LIGHTHOUSE)))throw new Error('Only trailing Lighthouse guards may be added');
 const message=signed.message.serialize();
 if(signed.signatures.length!==actualSigners.length||signed.signatures.some((signature,index)=>!nacl.sign.detached.verify(message,signature,actualSigners[index]!.toBytes())))throw new Error('Transaction signature is invalid');
 return {signature:bs58.encode(signed.signatures[0]!),signedHash:createHash('sha256').update(signed.serialize()).digest('hex'),transaction:signed};
}




