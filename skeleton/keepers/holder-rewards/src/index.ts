import { createHash, randomUUID } from 'node:crypto';
import {readFileSync} from 'node:fs';
import { ComputeBudgetProgram } from '@solana/web3.js';
import { chQuery, pg, required, integer } from '@pump/runtime';
import { PublicKey,Keypair, VersionedTransaction, WSOL, TOKEN_PROGRAM, fixtureAuthority, compileTransaction,verifySignedMessage,restoreLookupTables } from '@pump/solana';
import { transactionBuilder, holderDistributeInstruction, type TransactionBuilder, type PreparedDto } from '@pump/tx-builder';
export interface Holder {wallet:string;amountAtomic:string;}
export interface RewardSnapshot {chain:string;mint:string;quoteMint:string;quoteDecimals:number;quoteUsd:string;balanceAtomic:string;baseDecimals:number;priceUsd:string;ordinal:string;authority:string;holders:Holder[];quoteTokenProgram?:string;}
export interface RewardPlan {eligible:Holder[];payments:{wallet:string;amount:string}[];reserveAtomic:string;distributableAtomic:string;distributedAtomic:string;remainderAtomic:string;reason?:string;}
const USD_SCALE=10n**18n;
function usd(value:string):bigint{if(!/^\d+(\.\d{1,18})?$/.test(value))throw new Error('USD marks require nonnegative decimal strings with at most18 fractional digits');const [whole,fraction='']=value.split('.');return BigInt(whole!)*USD_SCALE+BigInt(fraction.padEnd(18,'0'));}
function ceil(a:bigint,b:bigint):bigint{if(b<=0n)throw new Error('Positive divisor required');return (a+b-1n)/b;}
function atoms(value:string):bigint{if(!/^\d+$/.test(value))throw new Error('Nonnegative integer atoms required');return BigInt(value);}
/** features/rewards-and-referrals.md: $20 holdings, reserve up to$0.01 SOL/$0.20 token-quoted perholder, reserve+$20 trigger. */
export function planHolderRewards(snapshot:RewardSnapshot,maxHolders:number):RewardPlan{
 if(!Number.isSafeInteger(maxHolders)||maxHolders<1)throw new Error('Holder cap must be a positive integer');
 const balance=atoms(snapshot.balanceAtomic),price=usd(snapshot.priceUsd),quote=usd(snapshot.quoteUsd);
 if(price===0n||quote===0n)throw new Error('Positive trusted marks required');
 if(!Number.isSafeInteger(snapshot.baseDecimals)||snapshot.baseDecimals<0||snapshot.baseDecimals>255||!Number.isSafeInteger(snapshot.quoteDecimals)||snapshot.quoteDecimals<0||snapshot.quoteDecimals>255)throw new Error('Invalid token decimals');
 const aggregate=new Map<string,bigint>();for(const holder of snapshot.holders){new PublicKey(holder.wallet);aggregate.set(holder.wallet,(aggregate.get(holder.wallet)??0n)+atoms(holder.amountAtomic));}
 const eligible=[...aggregate].filter(([,amount])=>amount*price>=20n*USD_SCALE*10n**BigInt(snapshot.baseDecimals)).sort(([a],[b])=>a.localeCompare(b)).map(([wallet,amount])=>({wallet,amountAtomic:String(amount)}));
 const empty=(reason:string):RewardPlan=>({eligible,payments:[],reserveAtomic:'0',distributableAtomic:'0',distributedAtomic:'0',remainderAtomic:String(balance),reason});
 if(!eligible.length)return empty('no_eligible_holders');if(eligible.length>maxHolders)return empty('holder_cap_exceeded');
 const perHolderCost=quoteCostUsd(snapshot.quoteMint);const reserve=ceil(BigInt(eligible.length)*perHolderCost*10n**BigInt(snapshot.quoteDecimals),quote);
 const minimum=ceil(20n*USD_SCALE*10n**BigInt(snapshot.quoteDecimals),quote);
 if(balance<reserve+minimum)return empty('vault_below_reserve_and_threshold');
 const distributable=balance-reserve,total=eligible.reduce((sum,holder)=>sum+atoms(holder.amountAtomic),0n);
 const payments=eligible.map(holder=>({wallet:holder.wallet,amount:String(distributable*atoms(holder.amountAtomic)/total)})).filter(payment=>BigInt(payment.amount)>0n);
 if(payments.some(payment=>BigInt(payment.amount)>18446744073709551615n))throw new Error('Payout exceeds instruction u64');
 const distributed=payments.reduce((sum,payment)=>sum+BigInt(payment.amount),0n);
 return {eligible,payments,reserveAtomic:String(reserve),distributableAtomic:String(distributable),distributedAtomic:String(distributed),remainderAtomic:String(balance-distributed)};
}
function quoteCostUsd(mint:string):bigint{return mint===WSOL.toBase58()?USD_SCALE/100n:USD_SCALE/5n;}
export async function readRewardSnapshot(chain:string,mint:string):Promise<RewardSnapshot>{
 const result=await pg().query('SELECT * FROM holder_reward_vaults WHERE chain=$1 AND mint=$2',[chain,mint]);if(!result.rowCount)throw new Error('holder_reward_vault_unconfigured');const row=result.rows[0];
 const holders=await chQuery<{wallet:string;amount:string}>("SELECT wallet,toString(sum(if(side='buy',toInt256(base_amount),-toInt256(base_amount)))) AS amount FROM trades FINAL WHERE chain={chain:String} AND mint={mint:String} AND deleted=0 AND commitment='confirmed' GROUP BY wallet HAVING sum(if(side='buy',toInt256(base_amount),-toInt256(base_amount)))>0",{chain,mint});
 return {chain,mint,quoteMint:row.quote_mint,quoteDecimals:row.quote_decimals,quoteUsd:row.quote_usd,balanceAtomic:row.balance_atomic,baseDecimals:row.base_decimals,priceUsd:row.price_usd,ordinal:row.snapshot_ordinal,authority:row.authority,quoteTokenProgram:await transactionBuilder().chain.tokenProgram(row.quote_mint),holders:holders.map(holder=>({wallet:holder.wallet,amountAtomic:holder.amount}))};
}
function sameVaultSnapshot(row:any,snapshot:RewardSnapshot):boolean{return Boolean(row)&&row.chain===snapshot.chain&&row.mint===snapshot.mint&&row.quote_mint===snapshot.quoteMint&&row.quote_decimals===snapshot.quoteDecimals&&row.base_decimals===snapshot.baseDecimals&&row.authority===snapshot.authority&&row.snapshot_ordinal===snapshot.ordinal&&BigInt(row.balance_atomic)===BigInt(snapshot.balanceAtomic)&&usd(row.quote_usd)===usd(snapshot.quoteUsd)&&usd(row.price_usd)===usd(snapshot.priceUsd);}
export interface KeeperSigner {publicKey:string;sign(transaction:VersionedTransaction):Promise<VersionedTransaction>;}
export class FixtureKeeperSigner implements KeeperSigner {readonly publicKey=fixtureAuthority().publicKey.toBase58();async sign(transaction:VersionedTransaction){transaction.sign([fixtureAuthority()]);return transaction;}}
export class FileKeeperSigner implements KeeperSigner {
 private readonly keypair:Keypair;
 readonly publicKey:string;
 constructor(){const bytes:unknown=JSON.parse(readFileSync(required('HOLDER_REWARDS_SIGNER_KEYPAIR_FILE'),'utf8'));if(!Array.isArray(bytes)||bytes.length!==64||bytes.some(value=>!Number.isInteger(value)||value<0||value>255))throw new Error('Invalid configured holder signer keypair');this.keypair=Keypair.fromSecretKey(Uint8Array.from(bytes));this.publicKey=this.keypair.publicKey.toBase58();if(this.publicKey!==required('HOLDER_REWARDS_AUTHORITY'))throw new Error('Configured holder signer authority mismatch');}
 async sign(transaction:VersionedTransaction){transaction.sign([this.keypair]);return transaction;}
}
export class RemoteKeeperSigner implements KeeperSigner {readonly publicKey=required('HOLDER_REWARDS_AUTHORITY');async sign(transaction:VersionedTransaction){if(required('TX_ENABLE_NETWORK')!=='true')throw new Error('TX_ENABLE_NETWORK required for remote signer');const response=await fetch(required('HOLDER_REWARDS_SIGNER_URL'),{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${required('HOLDER_REWARDS_SIGNER_TOKEN')}`},body:JSON.stringify({transaction:Buffer.from(transaction.serialize()).toString('base64')}),signal:AbortSignal.timeout(integer('UPSTREAM_TIMEOUT_MS'))});if(!response.ok)throw new Error('keeper_signer_unavailable');const result=await response.json() as {transaction:string};return VersionedTransaction.deserialize(Buffer.from(result.transaction,'base64'));}}
export class HolderRewardsKeeper {
 constructor(readonly builder:TransactionBuilder,readonly signer:KeeperSigner){}
 private async batchPayments(snapshot:RewardSnapshot,payments:RewardPlan['payments']):Promise<RewardPlan['payments'][]>{
  const max=integer('HOLDER_REWARDS_BATCH_MAX_RECIPIENTS');if(max<1)throw new Error('HOLDER_REWARDS_BATCH_MAX_RECIPIENTS must be positive');const batches:RewardPlan['payments'][]=[];let current:RewardPlan['payments']=[];
  const tables=await this.builder.chain.lookupTables();const blockhash=(await this.builder.chain.latestBlockhash()).blockhash;
  const fits=(recipients:RewardPlan['payments']):boolean=>{try{const ix=holderDistributeInstruction({mint:snapshot.mint,quoteMint:snapshot.quoteMint,quoteTokenProgram:snapshot.quoteTokenProgram??TOKEN_PROGRAM.toBase58(),authority:snapshot.authority,recipients});const tx=compileTransaction(new PublicKey(snapshot.authority),[ComputeBudgetProgram.setComputeUnitLimit({units:1400000}),ComputeBudgetProgram.setComputeUnitPrice({microLamports:100000}),ix],blockhash,tables);return tx.serialize().length+integer('TX_WALLET_GUARD_BYTES')<=1232;}catch{return false;}};
  for(const payment of payments){const next=[...current,payment];if(next.length>max||!fits(next)){if(!current.length)throw new Error('Single holder payout cannot fit a transaction');batches.push(current);current=[payment];if(!fits(current))throw new Error('Single holder payout cannot fit a transaction');}else current=next;}
  if(current.length)batches.push(current);return batches;
 }
 async run(snapshot:RewardSnapshot,dryRun:boolean):Promise<{roundId?:string;status:string;plan:RewardPlan}>{
  snapshot={...snapshot,quoteTokenProgram:snapshot.quoteTokenProgram??await this.builder.chain.tokenProgram(snapshot.quoteMint)};
  let plan=planHolderRewards(snapshot,integer('HOLDER_REWARDS_HOLDER_CAP'));
  const lock=await pg().connect();const lockName=`holder-rewards:${snapshot.chain}:${snapshot.mint}`;
  try{
   await lock.query('SELECT pg_advisory_lock(hashtextextended($1,0))',[lockName]);
   let row=(await lock.query('SELECT * FROM holder_reward_rounds WHERE chain=$1 AND mint=$2 AND snapshot_ordinal=$3',[snapshot.chain,snapshot.mint,snapshot.ordinal])).rows[0];
   if(!row)row=(await lock.query("SELECT * FROM holder_reward_rounds WHERE chain=$1 AND mint=$2 AND status IN ('prepared','sending','unknown')",[snapshot.chain,snapshot.mint])).rows[0];
   if(row?.status==='completed')return {roundId:row.id,status:'completed',plan:row.snapshot.plan};
   if(row){snapshot=row.snapshot.snapshot;plan=row.snapshot.plan;}
   if(snapshot.authority!==this.signer.publicKey||snapshot.authority!==await this.builder.chain.holderAuthority())throw new Error('holder_reward_authority_mismatch');
   if(plan.reason)return {status:plan.reason,plan};
   await lock.query('BEGIN');
   const current=(await lock.query('SELECT * FROM holder_reward_vaults WHERE chain=$1 AND mint=$2 FOR UPDATE',[snapshot.chain,snapshot.mint])).rows[0];
   if(!current||current.authority!==snapshot.authority||current.quote_mint!==snapshot.quoteMint||current.base_decimals!==snapshot.baseDecimals||current.quote_decimals!==snapshot.quoteDecimals){await lock.query('ROLLBACK');return {roundId:row?.id,status:'stale_snapshot',plan};}
   const needsReservation=!row||row.status==='dry_run';
   if(needsReservation&&(!sameVaultSnapshot(current,snapshot)||BigInt(current.reserved_atomic)!==0n)){await lock.query('ROLLBACK');return {roundId:row?.id,status:'stale_snapshot',plan};}
   if(!row){const id=randomUUID();row=(await lock.query("INSERT INTO holder_reward_rounds(id,chain,mint,snapshot_ordinal,status,balance_atomic,reserve_atomic,distributable_atomic,distributed_atomic,remainder_atomic,holder_count,snapshot) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *",[id,snapshot.chain,snapshot.mint,snapshot.ordinal,dryRun?'dry_run':'prepared',snapshot.balanceAtomic,plan.reserveAtomic,plan.distributableAtomic,plan.distributedAtomic,plan.remainderAtomic,plan.eligible.length,JSON.stringify({snapshot,plan})])).rows[0];}
   if(!dryRun){
    if(needsReservation){await lock.query('UPDATE holder_reward_vaults SET reserved_atomic=$3 WHERE chain=$1 AND mint=$2',[snapshot.chain,snapshot.mint,plan.distributedAtomic]);await lock.query("UPDATE holder_reward_rounds SET status='prepared' WHERE id=$1",[row.id]);}
    else if(BigInt(current.reserved_atomic)!==BigInt(plan.distributedAtomic)||BigInt(current.balance_atomic)<BigInt(plan.distributedAtomic))throw new Error('holder_reward_reservation_mismatch');
   }
   await lock.query('COMMIT');
   if(dryRun)return {roundId:row.id,status:'dry_run',plan};
   const batches=await this.batchPayments(snapshot,plan.payments);
   for(let index=0;index<batches.length;index++){
    const prior=await lock.query('SELECT 1 FROM holder_reward_batches WHERE round_id=$1 AND batch_index=$2',[row.id,index]);if(prior.rowCount)continue;
    const recipients=batches[index]!;
    const ix=holderDistributeInstruction({mint:snapshot.mint,quoteMint:snapshot.quoteMint,quoteTokenProgram:snapshot.quoteTokenProgram!,authority:snapshot.authority,recipients});
    const prepared=await this.builder.prepareInstructions({owner:snapshot.authority,kind:'holder-rewards',instructions:[ix],request:{roundId:row.id,batch:index,recipients}});
    const signed=await this.signer.sign(VersionedTransaction.deserialize(Buffer.from(prepared.transaction,'base64')));
    const signedBase64=Buffer.from(signed.serialize()).toString('base64');
    const verified=await this.builder.verifyPrepared(prepared.preparedId,signedBase64,snapshot.authority);
    await lock.query("INSERT INTO holder_reward_batches(round_id,batch_index,prepared_id,signature,signed_transaction,payout_atomic,recipients,status) VALUES($1,$2,$3,$4,$5,$6,$7,'prepared')",[row.id,index,prepared.preparedId,verified.signature,Buffer.from(signed.serialize()),String(recipients.reduce((sum,recipient)=>sum+BigInt(recipient.amount),0n)),JSON.stringify(recipients)]);
   }
   await lock.query("UPDATE holder_reward_rounds SET status='sending' WHERE id=$1",[row.id]);
   const stored=await lock.query('SELECT * FROM holder_reward_batches WHERE round_id=$1 ORDER BY batch_index',[row.id]);
   for(const batch of stored.rows){
    const expectedBatch=batches[batch.batch_index];if(!expectedBatch||batch.recipients.length!==expectedBatch.length||batch.recipients.some((item:any,index:number)=>item.wallet!==expectedBatch[index]!.wallet||item.amount!==expectedBatch[index]!.amount))throw new Error('holder_reward_batch_plan_changed');
    if(batch.status==='confirmed')continue;
    const prepared=(await lock.query('SELECT transaction,lookup_tables FROM prepared_transactions WHERE id=$1',[batch.prepared_id])).rows[0];
    const verified=verifySignedMessage(VersionedTransaction.deserialize(prepared.transaction),VersionedTransaction.deserialize(batch.signed_transaction),restoreLookupTables(prepared.lookup_tables));
    if(verified.signature!==batch.signature)throw new Error('holder_reward_batch_signature_changed');
    const sent=await this.builder.sendStored({preparedId:batch.prepared_id,transaction:batch.signed_transaction.toString('base64'),idempotencyKey:`holder:${row.id}:${batch.batch_index}`,user:snapshot.authority});
    await lock.query('UPDATE holder_reward_batches SET status=$3,updated_at=now() WHERE round_id=$1 AND batch_index=$2',[row.id,batch.batch_index,sent.status]);
    if(sent.status!=='confirmed'){await lock.query("UPDATE holder_reward_rounds SET status='unknown' WHERE id=$1",[row.id]);return {roundId:row.id,status:'unknown',plan};}
   }
   await lock.query('BEGIN');
   const completed=await lock.query("UPDATE holder_reward_rounds SET status='completed',completed_at=now() WHERE id=$1 AND status<>'completed' RETURNING id",[row.id]);
   if(completed.rowCount){
    const adjusted=await lock.query('UPDATE holder_reward_vaults SET balance_atomic=balance_atomic-$3,reserved_atomic=reserved_atomic-$3,updated_at=now() WHERE chain=$1 AND mint=$2 AND balance_atomic>=$3 AND reserved_atomic=$3',[snapshot.chain,snapshot.mint,plan.distributedAtomic]);
    if(!adjusted.rowCount)throw new Error('holder_reward_vault_balance_changed');
    await lock.query('INSERT INTO holder_reward_events(id,round_id,payload) VALUES($1,$2,$3)',[randomUUID(),row.id,JSON.stringify({type:'holder_rewards.completed',roundId:row.id,chain:snapshot.chain,mint:snapshot.mint,distributedAtomic:plan.distributedAtomic,reserveAtomic:plan.reserveAtomic,remainderAtomic:plan.remainderAtomic,holderCount:plan.eligible.length})]);
   }
   await lock.query('COMMIT');return {roundId:row.id,status:'completed',plan};
  }catch(error){try{await lock.query('ROLLBACK');}catch{}throw error;}finally{await lock.query('SELECT pg_advisory_unlock(hashtextextended($1,0))',[lockName]);lock.release();}
 }
}
export function holderRewardsKeeper():HolderRewardsKeeper{const mode=required('HOLDER_REWARDS_SIGNER_ADAPTER');if(mode==='fixture'){if(required('TX_CHAIN_ADAPTER')!=='fixture')throw new Error('Fixture signer requires fixture chain');return new HolderRewardsKeeper(transactionBuilder(),new FixtureKeeperSigner());}if(mode==='file')return new HolderRewardsKeeper(transactionBuilder(),new FileKeeperSigner());if(mode==='remote')return new HolderRewardsKeeper(transactionBuilder(),new RemoteKeeperSigner());throw new Error('Unknown HOLDER_REWARDS_SIGNER_ADAPTER');}
export async function getHolderRewardBook(mint?:string):Promise<any>{
 const result=await pg().query(`SELECT v.*,COALESCE((SELECT sum(distributed_atomic) FROM holder_reward_rounds r WHERE r.chain=v.chain AND r.mint=v.mint AND r.status='completed'),0)::text AS paid_atomic,(SELECT max(completed_at) FROM holder_reward_rounds r WHERE r.chain=v.chain AND r.mint=v.mint) AS last_payout,(SELECT holder_count FROM holder_reward_rounds r WHERE r.chain=v.chain AND r.mint=v.mint ORDER BY created_at DESC LIMIT 1) AS holder_count FROM holder_reward_vaults v WHERE ($1::text IS NULL OR v.mint=$1) ORDER BY v.updated_at DESC LIMIT $2`,[mint??null,integer('HOLDER_REWARDS_BOOK_LIMIT')]);
 return {items:result.rows.map(row=>({chain:row.chain,mint:row.mint,accruedAtomic:row.balance_atomic,paidToHoldersAtomic:row.paid_atomic,quoteMint:row.quote_mint,quoteDecimals:row.quote_decimals,quoteUsd:row.quote_usd,wallets:row.holder_count??0,lastPayout:row.last_payout?.toISOString()??null})),nextCursor:''};
}






