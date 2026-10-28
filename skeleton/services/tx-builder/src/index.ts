import { createHash, randomUUID, randomInt } from 'node:crypto';
import { ComputeBudgetProgram, SystemProgram, type TransactionInstruction, type AccountMeta } from '@solana/web3.js';
import { pg, required, integer } from '@pump/runtime';
import { PublicKey, TransactionInstruction as Instruction, VersionedTransaction, PUMP, PUMP_AMM, TOKEN_PROGRAM, WSOL, ASSOCIATED_TOKEN_PROGRAM, ata, pda, idlInstruction, compileTransaction, serializeLookupTables, restoreLookupTables, verifySignedMessage, fixtureSigner, fixtureAuthority, type AccountContext } from '@pump/solana';
import { defaultAdapters, type ChainAdapter, type SenderAdapter, type CoinAccounts, type SignatureState } from './adapters';
export { fixtureSigner, fixtureAuthority, compileTransaction, idlInstruction, verifySignedMessage } from '@pump/solana';
export { FixtureChain, FIXTURE_MINT, FIXTURE_QUOTE, type ChainAdapter, type SenderAdapter } from './adapters';
export interface SwapInput {user:string;mint:string;quote_mint:string;side:'buy'|'sell';amount_in:string;min_out:string;venue?:'pump'|'pumpswap';pool?:string;}
export interface DurableNonce {nonce_account:string;nonce_value:string;nonce_authority:string;nonce_landed_slot:string;}
export interface PreparedDto {preparedId:string;transaction:string;encoding:'base64';blockhash:string;lastValidBlockHeight:string;expiresAt:string|null;nonce?:DurableNonce;}
export interface VerifiedPrepared {preparedId:string;signature:string;signedHash:string;transaction:string;nonce?:DurableNonce;}
export interface SendInput {preparedId?:string;transaction:string;idempotencyKey:string;user:string;}
export interface SendResult {signature:string;status:string;}
export class TransactionRefusal extends Error {constructor(public readonly reason:string,public readonly retryable=false){super(reason);}}
function uint(value:string,positive=false):bigint{if(!/^\d+$/.test(value))throw new TransactionRefusal('invalid_amount');const result=BigInt(value);if(result>18446744073709551615n||(positive&&result===0n))throw new TransactionRefusal('invalid_amount');return result;}
function pub(value:string):PublicKey{try{return new PublicKey(value);}catch{throw new TransactionRefusal('invalid_public_key');}}
function createAta(payer:PublicKey,owner:PublicKey,mint:PublicKey,program:PublicKey):TransactionInstruction{return new Instruction({programId:ASSOCIATED_TOKEN_PROGRAM,data:Buffer.from([1]),keys:[{pubkey:payer,isSigner:true,isWritable:true},{pubkey:ata(owner,mint,program),isSigner:false,isWritable:true},{pubkey:owner,isSigner:false,isWritable:false},{pubkey:mint,isSigner:false,isWritable:false},{pubkey:SystemProgram.programId,isSigner:false,isWritable:false},{pubkey:program,isSigner:false,isWritable:false}]});}
function accountsFor(coin:CoinAccounts,user:PublicKey):AccountContext{
 const base=pub(coin.mint),quote=pub(coin.quoteMint),baseProgram=pub(coin.baseTokenProgram),quoteProgram=pub(coin.quoteTokenProgram),pool=pub(coin.pool),creator=pub(coin.creator);
 return {accounts:{user,creator,coin_creator:creator,payer:user,base_mint:base,mint:base,quote_mint:quote,base_token_program:baseProgram,quote_token_program:quoteProgram,program:PUMP,associated_token_program:ASSOCIATED_TOKEN_PROGRAM,
  associated_base_user:ata(user,base,baseProgram),associated_quote_user:ata(user,quote,quoteProgram),pool,global_config:pda(PUMP_AMM,'global_config'),
  user_base_token_account:ata(user,base,baseProgram),user_quote_token_account:ata(user,quote,quoteProgram),pool_base_token_account:pub(coin.poolBaseTokenAccount),pool_quote_token_account:pub(coin.poolQuoteTokenAccount),protocol_fee_recipient:pub(coin.protocolFeeRecipient),buyback_fee_recipient:pub(coin.buybackFeeRecipient),
  creator_vault:pda(PUMP,'creator-vault',creator),coin_creator_vault_authority:pda(PUMP_AMM,'creator_vault',creator),coin_creator_token_account:ata(creator,quote,quoteProgram)},
 fields:{'bonding_curve.creator':creator,'pool.coin_creator':creator,'pool.base_mint':base,'pool.quote_mint':quote,'pool.pool_base_token_account':pub(coin.poolBaseTokenAccount),'pool.pool_quote_token_account':pub(coin.poolQuoteTokenAccount)}};
}
function forProgram(context:AccountContext,program:PublicKey):AccountContext{return {accounts:{...context.accounts,program},fields:context.fields};}
export function swapInstruction(coin:CoinAccounts,input:SwapInput):TransactionInstruction{
 const context=accountsFor(coin,pub(input.user));
 const pump=input.venue!=='pumpswap';const name=input.side==='buy'?(pump?'buy_exact_quote_in_v3':'buy_exact_quote_in'):(pump?'sell_v3':'sell');
 const args=input.side==='buy'?pump?{spendable_quote_in:input.amount_in,min_tokens_out:input.min_out,partial_fill:false}:{spendable_quote_in:input.amount_in,min_base_amount_out:input.min_out,track_volume:false}:pump?{amount:input.amount_in,min_sol_output:input.min_out}:{base_amount_in:input.amount_in,min_quote_amount_out:input.min_out};
 return idlInstruction(pump?'pump':'pump_amm',name,args,forProgram(context,pump?PUMP:PUMP_AMM));
}
interface PreparedRow {id:string;owner_wallet:string;transaction:Buffer;lookup_tables:any[];blockhash:string;last_valid_block_height:string|null;nonce:DurableNonce|null;expires_at:Date|null;}
export class TransactionBuilder {
 constructor(readonly chain:ChainAdapter,readonly sender:SenderAdapter){}
 async prepareInstructions(input:{owner:string;kind:string;instructions:TransactionInstruction[];request:unknown;nonce?:DurableNonce}):Promise<PreparedDto>{
  const payer=pub(input.owner);const tables=await this.chain.lookupTables();let latest=await this.chain.latestBlockhash();let nonce:DurableNonce|undefined;
  if(input.nonce){const state=await this.chain.nonce(input.nonce.nonce_account);if(state.status!=='confirmed'||state.nonce!==input.nonce.nonce_value||state.authority!==input.owner||state.authority!==input.nonce.nonce_authority||BigInt(state.slot)<BigInt(input.nonce.nonce_landed_slot))throw new TransactionRefusal('invalid_nonce');nonce=input.nonce;latest={blockhash:state.nonce,lastValidBlockHeight:'0'};}
  const prefix=nonce?[SystemProgram.nonceAdvance({noncePubkey:pub(nonce.nonce_account),authorizedPubkey:payer})]:[];
  const draft=compileTransaction(payer,[...prefix,ComputeBudgetProgram.setComputeUnitLimit({units:1400000}),ComputeBudgetProgram.setComputeUnitPrice({microLamports:1}),...input.instructions],latest.blockhash,tables);
  const simulation=await this.chain.simulate(draft,false);if(simulation.error)throw new TransactionRefusal(simulation.error==='insufficient_funds'?'insufficient_funds':`simulation_failed:${simulation.error}`);
  const factor=integer('TX_COMPUTE_SCALE_BPS');if(factor<10000)throw new Error('TX_COMPUTE_SCALE_BPS must be at least 10000');
  // backend/transactions.md: measured units scaled, protocol cap 1.4m; trade fallback 200k.
  const measured=simulation.units>0?simulation.units:input.kind==='swap'?200000:integer('TX_CLAIM_FALLBACK_UNITS');
  const units=Math.min(1400000,Math.ceil(measured*factor/10000));
  // backend/transactions.md: Helius-style estimate floor100k/cap100m micro-lamports, failure floor100k.
  let fee=100000n;try{fee=await this.chain.priorityFee(draft);}catch{}
  if(fee<100000n)fee=100000n;if(fee>100000000n)fee=100000000n;
  const instructions=[...prefix,ComputeBudgetProgram.setComputeUnitLimit({units}),ComputeBudgetProgram.setComputeUnitPrice({microLamports:fee}),...input.instructions];
  const tip=uint(required('TX_TIP_LAMPORTS'));
  if(tip>0n){const allowed=JSON.parse(required('TX_TIP_ACCOUNTS')) as string[];if(!Array.isArray(allowed)||!allowed.length)throw new Error('TX_TIP_ACCOUNTS required for tipped sender');instructions.push(SystemProgram.transfer({fromPubkey:payer,toPubkey:pub(allowed[randomInt(allowed.length)]!),lamports:tip}));}
  const transaction=compileTransaction(payer,instructions,latest.blockhash,tables);
  if(transaction.serialize().length+integer('TX_WALLET_GUARD_BYTES')>1232)throw new TransactionRefusal('transaction_too_large');
  const finalSimulation=await this.chain.simulate(transaction,false);if(finalSimulation.error)throw new TransactionRefusal(`simulation_failed:${finalSimulation.error}`);
  const id=randomUUID();const expiresAt=nonce?null:new Date(Date.now()+integer('TX_PREPARED_TTL_MS'));
  await pg().query('INSERT INTO prepared_transactions(id,owner_wallet,kind,request,transaction,lookup_tables,blockhash,last_valid_block_height,nonce,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[id,input.owner,input.kind,JSON.stringify(input.request),Buffer.from(transaction.serialize()),JSON.stringify(serializeLookupTables(tables)),latest.blockhash,latest.lastValidBlockHeight,nonce?JSON.stringify(nonce):null,expiresAt]);
  return {preparedId:id,transaction:Buffer.from(transaction.serialize()).toString('base64'),encoding:'base64',blockhash:latest.blockhash,lastValidBlockHeight:latest.lastValidBlockHeight,expiresAt:expiresAt?.toISOString()??null,nonce};
 }
 async buildSwap(input:SwapInput,nonce?:DurableNonce):Promise<PreparedDto>{
  pub(input.user);pub(input.mint);pub(input.quote_mint);uint(input.amount_in,true);uint(input.min_out,true);
  if(!['buy','sell'].includes(input.side))throw new TransactionRefusal('invalid_side');
  const coin=await this.chain.coin(input.mint);const venue=coin.complete?'pumpswap':'pump';if(input.venue&&input.venue!==venue)throw new TransactionRefusal('venue_phase_mismatch');input={...input,venue};if(coin.quoteMint!==input.quote_mint)throw new TransactionRefusal('quote_mint_mismatch');
  if(input.pool&&input.pool!==coin.pool)throw new TransactionRefusal('pool_mismatch');
  const user=pub(input.user),base=pub(coin.mint),quote=pub(coin.quoteMint),baseProgram=pub(coin.baseTokenProgram),quoteProgram=pub(coin.quoteTokenProgram);
  const instructions=[createAta(user,user,base,baseProgram),createAta(user,user,quote,quoteProgram)];
  if(input.venue==='pumpswap'&&quote.equals(WSOL)&&input.side==='buy'){instructions.push(SystemProgram.transfer({fromPubkey:user,toPubkey:ata(user,quote,quoteProgram),lamports:uint(input.amount_in)}));instructions.push(new Instruction({programId:quoteProgram,keys:[{pubkey:ata(user,quote,quoteProgram),isSigner:false,isWritable:true}],data:Buffer.from([17])}));}
  instructions.push(swapInstruction(coin,input));
  return this.prepareInstructions({owner:input.user,kind:'swap',instructions,request:input,nonce});
 }
 async buildCreatorFees(input:{wallet:string;mint:string}):Promise<any>{
  const coin=await this.chain.coin(input.mint);if(coin.creator!==input.wallet)throw new TransactionRefusal('creator_wallet_mismatch');
  const user=pub(input.wallet),quote=pub(coin.quoteMint),quoteProgram=pub(coin.quoteTokenProgram);const context=accountsFor(coin,user);const instructions:TransactionInstruction[]=[];
  if(coin.curveSweepRequired){const recipient=pda(PUMP,'creator-vault',user);instructions.push(idlInstruction('pump','sweep_creator_fee',{}, {accounts:{...context.accounts,recipient},fields:context.fields}));}
  instructions.push(idlInstruction('pump',quote.equals(WSOL)?'collect_creator_fee':'collect_creator_fee_v2',{},context));
  if(coin.poolSweepRequired){const recipient=pda(PUMP_AMM,'creator_vault',user);instructions.push(idlInstruction('pump_amm','sweep_creator_fee',{},forProgram({accounts:{...context.accounts,recipient},fields:context.fields},PUMP_AMM)));}
  if(coin.poolExists)instructions.push(idlInstruction('pump_amm','collect_coin_creator_fee',{},forProgram(context,PUMP_AMM)));
  const prepared=await this.prepareInstructions({owner:input.wallet,kind:'creator-fees',instructions,request:input});
  return {fees:{claim_transaction:prepared.transaction,is_claimable:BigInt(coin.claimableAtomic)>0n,transactions:[prepared]}};
 }
 async buildCreatorVault(input:{wallet:string;quote_mint?:string}):Promise<any>{
  const user=pub(input.wallet);const quote=pub(input.quote_mint??required('TX_VAULT_QUOTE_MINT'));const quoteProgram=pub(await this.chain.tokenProgram(quote.toBase58()));
  const context:AccountContext={accounts:{creator:user,quote_mint:quote,quote_token_program:quoteProgram,program:PUMP}};
  const instructions=[idlInstruction('pump',quote.equals(WSOL)?'collect_creator_fee':'collect_creator_fee_v2',{},context),idlInstruction('pump_amm','collect_coin_creator_fee',{}, {accounts:{coin_creator:user,quote_mint:quote,quote_token_program:quoteProgram,coin_creator_token_account:ata(user,quote,quoteProgram),program:PUMP_AMM}})];
  const prepared=await this.prepareInstructions({owner:input.wallet,kind:'creator-fees-vault',instructions,request:input});
  return {fees:{collect_transaction:prepared.transaction,is_claimable:true,transactions:[prepared]}};
 }
 private async prepared(id:string,user?:string):Promise<PreparedRow>{const result=await pg().query('SELECT * FROM prepared_transactions WHERE id=$1',[id]);if(!result.rowCount)throw new TransactionRefusal('prepared_transaction_not_found');const row=result.rows[0] as PreparedRow;if(user&&row.owner_wallet!==user)throw new TransactionRefusal('prepared_owner_mismatch');return row;}
 async verifyPrepared(id:string,signedBase64:string,user?:string):Promise<VerifiedPrepared>{
  const row=await this.prepared(id,user);let signed:VersionedTransaction;let verified;
  try{const raw=Buffer.from(signedBase64,'base64');signed=VersionedTransaction.deserialize(raw);if(!Buffer.from(signed.serialize()).equals(raw))throw new Error('Noncanonical transaction bytes');verified=verifySignedMessage(VersionedTransaction.deserialize(row.transaction),signed,restoreLookupTables(row.lookup_tables));}catch(error){throw new TransactionRefusal(error instanceof Error?`signed_transaction_rejected:${error.message}`:'signed_transaction_rejected');}
  if(!row.nonce&&(!row.expires_at||row.expires_at.getTime()<Date.now()))throw new TransactionRefusal('prepared_transaction_expired');
  if(row.nonce){const current=await this.chain.nonce(row.nonce.nonce_account);if(current.status!=='confirmed'||current.nonce!==row.nonce.nonce_value||current.authority!==row.nonce.nonce_authority)throw new TransactionRefusal('nonce_changed');}
  const simulation=await this.chain.simulate(signed,true);if(simulation.error)throw new TransactionRefusal(`signed_simulation_failed:${simulation.error}`);
  return {preparedId:id,signature:verified.signature,signedHash:verified.signedHash,transaction:Buffer.from(signed.serialize()).toString('base64'),nonce:row.nonce??undefined};
 }
 async sendStored(input:SendInput):Promise<SendResult>{
  let preparedId=input.preparedId;
  if(!preparedId){const candidates=await pg().query('SELECT id FROM prepared_transactions WHERE owner_wallet=$1 ORDER BY created_at DESC LIMIT $2',[input.user,integer('TX_PREPARED_LOOKUP_LIMIT')]);for(const candidate of candidates.rows){try{const row=await this.prepared(candidate.id,input.user);verifySignedMessage(VersionedTransaction.deserialize(row.transaction),VersionedTransaction.deserialize(Buffer.from(input.transaction,'base64')),restoreLookupTables(row.lookup_tables));preparedId=row.id;break;}catch{}}}
  if(!preparedId)throw new TransactionRefusal('prepared_transaction_required');
  const lock=await pg().connect();try{await lock.query("SELECT pg_advisory_lock(hashtextextended($1,0))",[`tx-send:${preparedId}`]);
   const row=await this.prepared(preparedId,input.user);const raw=Buffer.from(input.transaction,'base64');const signedHash=createHash('sha256').update(raw).digest('hex');
   const byKey=await lock.query('SELECT * FROM transaction_sends WHERE owner_wallet=$1 AND idempotency_key=$2',[input.user,input.idempotencyKey]);
   if(byKey.rowCount&&(byKey.rows[0].prepared_id!==preparedId||byKey.rows[0].signed_hash!==signedHash))throw new TransactionRefusal('idempotency_conflict');
   let existing=(await lock.query('SELECT * FROM transaction_sends WHERE prepared_id=$1',[preparedId])).rows[0];
   if(existing&&existing.signed_hash!==signedHash)throw new TransactionRefusal('prepared_transaction_already_reserved');
   if(existing&&['confirmed','failed','expired'].includes(existing.status))return {signature:existing.signature,status:existing.status};
   if(!existing){const verified=await this.verifyPrepared(preparedId,input.transaction,input.user);const inserted=await lock.query("INSERT INTO transaction_sends(id,prepared_id,owner_wallet,idempotency_key,signed_hash,signature,signed_transaction,status) VALUES($1,$2,$3,$4,$5,$6,$7,'reserved') RETURNING *",[randomUUID(),preparedId,input.user,input.idempotencyKey,verified.signedHash,verified.signature,raw]);existing=inserted.rows[0];}
   else {
    const status=await this.chain.signatureStatus(existing.signature);
    if(status==='confirmed'||status==='failed'){await lock.query('UPDATE transaction_sends SET status=$2,updated_at=now() WHERE id=$1',[existing.id,status]);return {signature:existing.signature,status};}
    if(status==='unknown'){await lock.query("UPDATE transaction_sends SET status='unknown',updated_at=now() WHERE id=$1",[existing.id]);return {signature:existing.signature,status:'unknown'};}
    if(row.nonce){const current=await this.chain.nonce(row.nonce.nonce_account);if(current.status!=='confirmed'||current.nonce!==row.nonce.nonce_value){await lock.query("UPDATE transaction_sends SET status='unknown',last_error='nonce_changed_without_visible_signature',updated_at=now() WHERE id=$1",[existing.id]);return {signature:existing.signature,status:'unknown'};}}
    else {const valid=await this.chain.blockhashValid(row.blockhash,row.last_valid_block_height??undefined);if(valid!==true){const history=await this.chain.signatureStatus(existing.signature);const status=history==='confirmed'?'confirmed':history==='failed'?'failed':history==='not_found'&&valid===false?'expired':'unknown';await lock.query('UPDATE transaction_sends SET status=$2,updated_at=now() WHERE id=$1',[existing.id,status]);return {signature:existing.signature,status};}}
   }
   // The reservation and exact bytes exist durably before the adapter is invoked. Replays keep one signature.
   await lock.query("UPDATE transaction_sends SET status='sending',attempts=attempts+1,updated_at=now() WHERE id=$1",[existing.id]);
   try{const signature=await this.sender.send(VersionedTransaction.deserialize(existing.signed_transaction),row.nonce??undefined);if(signature!==existing.signature)throw new Error('sender_signature_mismatch');const chainStatus=await this.chain.signatureStatus(signature);const status=chainStatus==='confirmed'?'confirmed':chainStatus==='failed'?'failed':'unknown';await lock.query('UPDATE transaction_sends SET status=$2,updated_at=now() WHERE id=$1',[existing.id,status]);return {signature,status};}
   catch{await lock.query("UPDATE transaction_sends SET status='unknown',last_error='sender_outcome_unknown',updated_at=now() WHERE id=$1",[existing.id]);return {signature:existing.signature,status:'unknown'};}
  }finally{await lock.query("SELECT pg_advisory_unlock(hashtextextended($1,0))",[`tx-send:${preparedId}`]);lock.release();}
 }
}
let singleton:TransactionBuilder|undefined;
export function transactionBuilder():TransactionBuilder{if(!singleton){const adapters=defaultAdapters();singleton=new TransactionBuilder(adapters.chain,adapters.sender);}return singleton;}
export function buildSwap(input:SwapInput,nonce?:DurableNonce){return transactionBuilder().buildSwap(input,nonce);}
export function verifyPrepared(preparedId:string,transaction:string,user?:string){return transactionBuilder().verifyPrepared(preparedId,transaction,user);}
export function sendStored(input:SendInput){return transactionBuilder().sendStored(input);}
export function getNonce(address:string){return transactionBuilder().chain.nonce(address);}
export async function getSignatureStatus(signature:string):Promise<SignatureState>{return transactionBuilder().chain.signatureStatus(signature);}
export function holderDistributeInstruction(input:{mint:string;quoteMint:string;quoteTokenProgram:string;authority:string;recipients:{wallet:string;amount:string}[];hasQuoteAccount?:boolean}):TransactionInstruction{
 const mint=pub(input.mint),quote=pub(input.quoteMint),quoteProgram=pub(input.quoteTokenProgram),authority=pub(input.authority),holder=pda(PUMP,'holder-rewards',mint);
 const remaining:AccountMeta[]=input.recipients.flatMap(item=>[{pubkey:pub(item.wallet),isSigner:false,isWritable:true},{pubkey:ata(pub(item.wallet),quote,quoteProgram),isSigner:false,isWritable:true}]);
 return idlInstruction('pump','distribute_fee_to_holders',{amounts:input.recipients.map(item=>item.amount)},{accounts:{mint,quote_mint:quote,quote_token_program:quoteProgram,holder_reward_claim_authority:authority,holder_rewards_token_account:(input.hasQuoteAccount===false||(input.hasQuoteAccount===undefined&&quote.equals(WSOL)))?PUMP:ata(holder,quote,quoteProgram),program:PUMP},fields:{'global.holder_reward_claim_authority':authority}},remaining);
}





