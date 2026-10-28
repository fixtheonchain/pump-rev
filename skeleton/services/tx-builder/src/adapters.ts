import { createHash,randomUUID } from 'node:crypto';
import { Connection, ComputeBudgetProgram, SystemProgram, type TransactionInstruction } from '@solana/web3.js';
import { pg, required, integer } from '@pump/runtime';
import { PublicKey, Keypair, VersionedTransaction, AddressLookupTableAccount, PUMP, PUMP_AMM, WSOL, TOKEN_PROGRAM, TOKEN_2022_PROGRAM, ASSOCIATED_TOKEN_PROGRAM, ata, pda, fixtureKey, fixtureSigner, fixtureAuthority, makeLookupTable,encodeBase58 } from '@pump/solana';
export const FIXTURE_MINT='US517G5965aydkZ46HS38QLi7UQiSojurfbQfKCELFx';
export const FIXTURE_QUOTE='gBxS1f6uyyGPuW5MzGBukidSb71jdsCb5fZaoSzULE5';
export interface CoinAccounts { mint:string;quoteMint:string;baseTokenProgram:string;quoteTokenProgram:string;creator:string;pool:string;poolBaseTokenAccount:string;poolQuoteTokenAccount:string;protocolFeeRecipient:string;buybackFeeRecipient:string;curveSweepRequired:boolean;poolSweepRequired:boolean;claimableAtomic:string;complete:boolean;poolExists:boolean; }
export interface NonceState { nonce:string;authority:string;slot:string;status:'confirmed'|'unknown'; }
export type SignatureState='confirmed'|'failed'|'not_found'|'unknown';
export interface ChainAdapter {
 latestBlockhash():Promise<{blockhash:string;lastValidBlockHeight:string}>;
 coin(mint:string):Promise<CoinAccounts>;
 tokenProgram(mint:string):Promise<string>;
 holderAuthority():Promise<string>;
 lookupTables():Promise<AddressLookupTableAccount[]>;
 simulate(transaction:VersionedTransaction,signed:boolean):Promise<{units:number;error?:string}>;
 priorityFee(transaction:VersionedTransaction):Promise<bigint>;
 signatureStatus(signature:string):Promise<SignatureState>;
 blockhashValid(blockhash:string,lastValidBlockHeight?:string):Promise<boolean|'unknown'>;
 nonce(address:string):Promise<NonceState>;
}
export interface SenderAdapter { send(transaction:VersionedTransaction,nonce?:{nonce_account:string;nonce_value:string}):Promise<string>; }
/** Local account and signature boundary, persisted so separate limit/tx/keeper processes see one fake chain. */
export class FixtureChain implements ChainAdapter,SenderAdapter {
 async latestBlockhash(){return {blockhash:fixtureKey('blockhash:'+randomUUID()).toBase58(),lastValidBlockHeight:required('TX_FIXTURE_LAST_VALID_BLOCK_HEIGHT')};}
 async coin(mint:string):Promise<CoinAccounts>{
  if(mint!==FIXTURE_MINT)throw new Error('fixture_coin_not_found');
  const registered=await pg().query('SELECT complete FROM coins WHERE address=$1',[mint]);const complete=registered.rows[0]?.complete??(required('TX_FIXTURE_COMPLETE')==='true');
  const creator=fixtureSigner().publicKey.toBase58();const pool=fixtureKey('pool');const quote=new PublicKey(FIXTURE_QUOTE);const base=new PublicKey(mint);
  return {mint,quoteMint:FIXTURE_QUOTE,baseTokenProgram:TOKEN_2022_PROGRAM.toBase58(),quoteTokenProgram:TOKEN_PROGRAM.toBase58(),creator,pool:pool.toBase58(),poolBaseTokenAccount:ata(pool,base,TOKEN_2022_PROGRAM).toBase58(),poolQuoteTokenAccount:ata(pool,quote,TOKEN_PROGRAM).toBase58(),protocolFeeRecipient:fixtureKey('fee-recipient').toBase58(),buybackFeeRecipient:fixtureKey('buyback').toBase58(),curveSweepRequired:true,poolSweepRequired:complete,complete,poolExists:complete,claimableAtomic:required('TX_FIXTURE_CLAIMABLE_ATOMIC')};
 }
 async holderAuthority():Promise<string>{return fixtureAuthority().publicKey.toBase58();}
 async tokenProgram(mint:string):Promise<string>{if(mint===FIXTURE_MINT)return TOKEN_2022_PROGRAM.toBase58();if(mint===FIXTURE_QUOTE||mint===WSOL.toBase58())return TOKEN_PROGRAM.toBase58();throw new Error('fixture_mint_not_found');}
 async lookupTables():Promise<AddressLookupTableAccount[]>{
  const coin=await this.coin(FIXTURE_MINT);const user=fixtureSigner().publicKey;const base=new PublicKey(coin.mint);const quote=new PublicKey(coin.quoteMint);
  const curve=pda(PUMP,'bonding-curve',base);const vault=pda(PUMP,'creator-vault',user);const ammVault=pda(PUMP_AMM,'creator_vault',user);const holder=pda(PUMP,'holder-rewards',base);
  const addresses=[PUMP,PUMP_AMM,base,quote,TOKEN_PROGRAM,TOKEN_2022_PROGRAM,ASSOCIATED_TOKEN_PROGRAM,SystemProgram.programId,curve,vault,ammVault,holder,fixtureAuthority().publicKey,
    pda(PUMP,'global'),pda(PUMP,'__event_authority'),pda(PUMP_AMM,'global_config'),pda(PUMP_AMM,'__event_authority'),new PublicKey(coin.pool),new PublicKey(coin.poolBaseTokenAccount),new PublicKey(coin.poolQuoteTokenAccount),new PublicKey(coin.protocolFeeRecipient),new PublicKey(coin.buybackFeeRecipient),
    ata(user,base,TOKEN_2022_PROGRAM),ata(user,quote,TOKEN_PROGRAM),ata(curve,base,TOKEN_2022_PROGRAM),ata(curve,quote,TOKEN_PROGRAM),ata(vault,quote,TOKEN_PROGRAM),ata(ammVault,quote,TOKEN_PROGRAM),ata(holder,quote,TOKEN_PROGRAM),ata(new PublicKey(coin.protocolFeeRecipient),quote,TOKEN_PROGRAM),
    pda(PUMP,'user_volume_accumulator',user),pda(PUMP_AMM,'user_volume_accumulator',user),pda(PUMP_AMM,'global_volume_accumulator')];
  return [makeLookupTable(addresses)];
 }
 async simulate(_transaction:VersionedTransaction,_signed:boolean){return {units:integer('TX_FIXTURE_SIM_UNITS')};}
 async priorityFee(){return BigInt(required('TX_FIXTURE_PRIORITY_MICROLAMPORTS'));}
 async signatureStatus(signature:string):Promise<SignatureState>{const result=await pg().query('SELECT status FROM fixture_chain_signatures WHERE signature=$1',[signature]);return result.rows[0]?.status??'not_found';}
 async blockhashValid(_blockhash:string){return true;}
 async nonce(address:string):Promise<NonceState>{
  new PublicKey(address);
  const authority=fixtureSigner().publicKey.toBase58();const nonce=fixtureKey(`nonce-value:${address}`).toBase58();
  await pg().query("INSERT INTO fixture_chain_nonces(address,authority,nonce,slot,status) VALUES($1,$2,$3,$4,'confirmed') ON CONFLICT DO NOTHING",[address,authority,nonce,required('TX_FIXTURE_NONCE_SLOT')]);
  const result=await pg().query('SELECT nonce,authority,slot::text,status FROM fixture_chain_nonces WHERE address=$1',[address]);return result.rows[0];
 }
 async send(transaction:VersionedTransaction,nonce?:{nonce_account:string;nonce_value:string}):Promise<string>{
  const signature=encodeBase58(transaction.signatures[0]!);const raw=Buffer.from(transaction.serialize());const hash=createHash('sha256').update(raw).digest('hex');
  const client=await pg().connect();try{await client.query('BEGIN');
   const prior=await client.query('SELECT transaction_hash FROM fixture_chain_signatures WHERE signature=$1',[signature]);
   if(prior.rowCount){if(prior.rows[0].transaction_hash!==hash)throw new Error('signature_conflict');await client.query('COMMIT');return signature;}
   if(nonce){const changed=await client.query("UPDATE fixture_chain_nonces SET nonce=$3,consumed_by=$4,slot=slot+1 WHERE address=$1 AND nonce=$2 AND status='confirmed'",[nonce.nonce_account,nonce.nonce_value,fixtureKey(`advanced:${signature}`).toBase58(),signature]);if(!changed.rowCount)throw new Error('nonce_already_consumed');}
   await client.query("INSERT INTO fixture_chain_signatures(signature,transaction_hash,status,signed_transaction) VALUES($1,$2,'confirmed',$3)",[signature,hash,raw]);await client.query('COMMIT');return signature;
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
 }
}
/** Explicit network adapter; construction is gated, local defaults never make RPC calls. */
export class RpcChain implements ChainAdapter {
 private readonly connection:Connection;
 constructor(){if(required('TX_ENABLE_NETWORK')!=='true')throw new Error('TX_ENABLE_NETWORK must explicitly enable an RPC adapter');this.connection=new Connection(required('SOLANA_RPC_URL'),'processed');}
 async latestBlockhash(){const state=await this.connection.getLatestBlockhash('confirmed');return {blockhash:state.blockhash,lastValidBlockHeight:String(state.lastValidBlockHeight)};}
 async coin(_mint:string):Promise<CoinAccounts>{throw new Error('RPC account hydration adapter is not configured; supply an audited ChainAdapter');}
 async holderAuthority():Promise<string>{throw new Error('RPC holder authority hydration adapter is not configured');}
 async tokenProgram(mint:string):Promise<string>{const account=await this.connection.getAccountInfo(new PublicKey(mint),'confirmed');if(!account||![TOKEN_PROGRAM.toBase58(),TOKEN_2022_PROGRAM.toBase58()].includes(account.owner.toBase58()))throw new Error('mint_token_program_unavailable');return account.owner.toBase58();}
 async lookupTables(){const key=new PublicKey(required('TX_LOOKUP_TABLE_ADDRESS'));const result=await this.connection.getAddressLookupTable(key);if(!result.value)throw new Error('lookup_table_unavailable');return [result.value];}
 async simulate(transaction:VersionedTransaction,signed:boolean){const result=await this.connection.simulateTransaction(transaction,{sigVerify:signed,replaceRecentBlockhash:!signed,commitment:'processed'});return {units:result.value.unitsConsumed??0,error:result.value.err?JSON.stringify(result.value.err):undefined};}
 async priorityFee(transaction:VersionedTransaction){const response=await fetch(required('SOLANA_RPC_URL'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'getPriorityFeeEstimate',params:[{transaction:Buffer.from(transaction.serialize()).toString('base64'),options:{priorityLevel:required('TX_PRIORITY_LEVEL')}}]}),signal:AbortSignal.timeout(integer('UPSTREAM_TIMEOUT_MS'))});const body=await response.json() as any;if(!response.ok||body.error||body.result?.priorityFeeEstimate===undefined)throw new Error('priority_fee_unavailable');return BigInt(Math.floor(body.result.priorityFeeEstimate));}
 async signatureStatus(signature:string):Promise<SignatureState>{try{const result=await this.connection.getSignatureStatuses([signature],{searchTransactionHistory:true});const state=result.value[0];return !state?'not_found':state.err?'failed':['confirmed','finalized'].includes(state.confirmationStatus??'')?'confirmed':'unknown';}catch{return 'unknown';}}
 async blockhashValid(blockhash:string){try{return (await this.connection.isBlockhashValid(blockhash,{commitment:'confirmed'})).value;}catch{return 'unknown' as const;}}
 async nonce(address:string):Promise<NonceState>{const result=await this.connection.getNonceAndContext(new PublicKey(address),'confirmed');if(!result.value)throw new Error('nonce_not_found');return {nonce:result.value.nonce,authority:result.value.authorizedPubkey.toBase58(),slot:String(result.context.slot),status:'confirmed'};}
}
export class RpcSender implements SenderAdapter {
 constructor(private readonly chain:RpcChain){if(required('TX_ENABLE_NETWORK')!=='true')throw new Error('TX_ENABLE_NETWORK required');}
 async send(transaction:VersionedTransaction):Promise<string>{
  const mode=required('TX_SENDER_ADAPTER');const endpoint=required(mode==='jito'?'JITO_SEND_URL':mode==='nozomi'?'NOZOMI_SEND_URL':'TX_SEND_URL');
  const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'sendTransaction',params:[Buffer.from(transaction.serialize()).toString('base64'),{encoding:'base64',skipPreflight:false}]}),signal:AbortSignal.timeout(integer('UPSTREAM_TIMEOUT_MS'))});const body=await response.json() as any;if(!response.ok||body.error||typeof body.result!=='string')throw new Error('sender_outcome_unknown');return body.result;
 }
}
export function defaultAdapters():{chain:ChainAdapter;sender:SenderAdapter}{const mode=required('TX_CHAIN_ADAPTER');if(mode==='fixture'){const fixture=new FixtureChain();if(required('TX_SENDER_ADAPTER')!=='fixture')throw new Error('Fixture chain requires fixture sender');return {chain:fixture,sender:fixture};}if(mode==='rpc'){const chain=new RpcChain();return {chain,sender:new RpcSender(chain)};}throw new Error('Unknown TX_CHAIN_ADAPTER');}





