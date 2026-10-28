import {createHash,randomUUID} from 'node:crypto';
import Decimal from 'decimal.js';
import {z} from 'zod';
import {pg,integer,required} from '@pump/runtime';
import {buildSwap,getNonce,verifyPrepared} from '@pump/tx-builder';
import {refuse} from '@pump/internal-http';
import {withOrderLock} from './engine';

const pubkey=z.string().min(1),atoms=z.string().regex(/^\d+$/),money=z.string().regex(/^\d+(\.\d+)?$/);
export const eligibilityInput=z.object({user:pubkey,mint:pubkey,quote_mint:pubkey.optional(),nonce_account:pubkey.optional()}).strict();
export const buildInput=z.object({user:pubkey,mint:pubkey,quote_mint:pubkey,order_type:z.string(),amount_in:atoms,min_quote_out:atoms,trigger_mcap:money,nonce_account:pubkey,nonce_landed_slot:atoms,request_id:z.string().min(1),deadline:z.string().datetime().optional()}).strict();
export const sendInput=z.object({preparedId:z.string().uuid(),transaction:z.string().min(1),request_id:z.string().min(1)}).strict();
export const cancelInput=z.object({order_id:z.string().min(1)}).strict();
type LimitKind={side:'buy'|'sell';direction:'above'|'below'};
export function orderKinds():Record<string,LimitKind>{
  return z.record(z.string(),z.object({side:z.enum(['buy','sell']),direction:z.enum(['above','below'])}).strict()).parse(JSON.parse(required('LIMIT_ORDER_TYPES_JSON')));
}
function hash(input:unknown):string{return createHash('sha256').update(JSON.stringify(input)).digest('hex');}
export async function eligibility(input:z.infer<typeof eligibilityInput>,wallet:string){
  if(input.user!==wallet)refuse('FORBIDDEN',403);
  const coin=(await pg().query('SELECT quote_mint,security_verdict FROM coins WHERE address=$1',[input.mint])).rows[0];
  const reasons:string[]=[];
  if(!coin)reasons.push('coin_unavailable');
  if(coin && ['block','blocked'].includes(coin.security_verdict?.verdict))reasons.push('coin_blocked');
  if(input.quote_mint && coin?.quote_mint!==input.quote_mint)reasons.push('quote_mismatch');
  if(input.nonce_account){const nonce=await getNonce(input.nonce_account);if(nonce.authority!==wallet)reasons.push('nonce_authority_mismatch');if(nonce.status!=='confirmed')reasons.push('nonce_unavailable');}
  return {eligible:reasons.length===0,reasons,nonce_supported:true};
}
export async function prepare(input:z.infer<typeof buildInput>,wallet:string):Promise<Record<string,unknown>>{
  if(input.user!==wallet)refuse('FORBIDDEN',403);
  if(new Decimal(input.amount_in).lte(0) || new Decimal(input.trigger_mcap).lte(0))refuse('INVALID_ARGUMENT',400);
  const kind=orderKinds()[input.order_type];if(!kind)refuse('INVALID_ARGUMENT',400,'Unconfigured order type');
  const facts=await eligibility(input,wallet);if(!facts.eligible)refuse('INVALID_ARGUMENT',400,facts.reasons.join(','));
  const nonce=await getNonce(input.nonce_account);
  if(nonce.authority!==wallet || nonce.status!=='confirmed' || BigInt(nonce.slot)<BigInt(input.nonce_landed_slot))refuse('INVALID_ARGUMENT',400,'Nonce snapshot is not eligible');
  const deadline=input.deadline?new Date(input.deadline):new Date(Date.now()+integer('LIMIT_DEFAULT_LIFETIME_MS'));
  if(deadline.getTime()<=Date.now())refuse('INVALID_ARGUMENT',400,'Deadline has elapsed');
  const client=await pg().connect();
  try{
    await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',['limit-build:'+input.request_id]);
    const existing=(await client.query('SELECT request_hash,response,user_wallet FROM limit_preparations WHERE request_id=$1',[input.request_id])).rows[0];
    if(existing){if(existing.user_wallet!==wallet || existing.request_hash!==hash(input))refuse('IDEMPOTENCY_CONFLICT',409);await client.query('COMMIT');return existing.response;}
    const built=await buildSwap({user:wallet,mint:input.mint,quote_mint:input.quote_mint,side:kind.side,amount_in:input.amount_in,min_out:input.min_quote_out},{nonce_account:input.nonce_account,nonce_value:nonce.nonce,nonce_authority:nonce.authority,nonce_landed_slot:input.nonce_landed_slot});
    const response={...built,order_type:input.order_type,trigger_mcap:input.trigger_mcap,deadline:deadline.toISOString()};
    await client.query(`INSERT INTO limit_preparations(prepared_id,request_id,request_hash,user_wallet,mint,quote_mint,order_type,side,direction,amount_in,min_quote_out,trigger_mcap_usd,nonce_account,nonce_value,nonce_authority,nonce_landed_slot,deadline,response)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::jsonb)`,[built.preparedId,input.request_id,hash(input),wallet,input.mint,input.quote_mint,input.order_type,kind.side,kind.direction,input.amount_in,input.min_quote_out,input.trigger_mcap,input.nonce_account,nonce.nonce,nonce.authority,input.nonce_landed_slot,deadline,JSON.stringify(response)]);
    await client.query('COMMIT');return response;
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
export async function store(input:z.infer<typeof sendInput>,wallet:string){
  const prepared=(await pg().query('SELECT * FROM limit_preparations WHERE prepared_id=$1',[input.preparedId])).rows[0];
  if(!prepared || prepared.user_wallet!==wallet)refuse('NOT_FOUND',404);

  // Signed simulation and the immutable-instruction guard run before taking the nonce reservation.

  return withOrderLock('wallet:'+wallet,async client=>{
    await client.query('BEGIN');
    try{
      const previous=(await client.query('SELECT order_address,status,signed_signature,signed_tx,prepared_id,user_wallet FROM limit_orders WHERE prepared_id=$1 OR idempotency_key=$2',[input.preparedId,input.request_id])).rows[0];
      if(previous){if(!previous.signed_tx.equals(Buffer.from(input.transaction,'base64')) || previous.prepared_id!==input.preparedId || previous.user_wallet!==wallet)refuse('IDEMPOTENCY_CONFLICT',409);await client.query('COMMIT');return {order_id:previous.order_address,status:previous.status};}
      if(new Date(prepared.deadline)<=new Date())refuse('INVALID_ARGUMENT',400,'Order deadline elapsed');
      const verified=await verifyPrepared(input.preparedId,input.transaction,wallet);
      const count=(await client.query("SELECT count(*)::int AS count FROM limit_orders WHERE user_wallet=$1 AND status IN ('active','executing')",[wallet])).rows[0].count;
      if(count>=integer('LIMIT_MAX_ACTIVE_ORDERS'))refuse('RATE_LIMITED',429);
      const id=randomUUID();
      await client.query(`INSERT INTO limit_orders(order_address,user_wallet,mint,quote_mint,order_type,amount_in,trigger_mcap_usd,min_quote_out,nonce_account,nonce_landed_slot,signed_tx,status,idempotency_key,deadline,prepared_id,signed_signature,nonce_value,nonce_authority,direction)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'active',$12,$13,$14,$15,$16,$17,$18)`,[id,wallet,prepared.mint,prepared.quote_mint,prepared.order_type,prepared.amount_in,prepared.trigger_mcap_usd,prepared.min_quote_out,prepared.nonce_account,prepared.nonce_landed_slot,Buffer.from(input.transaction,'base64'),input.request_id,prepared.deadline,input.preparedId,verified.signature,prepared.nonce_value,prepared.nonce_authority,prepared.direction]);
      await client.query('COMMIT');return {order_id:id,status:'active'};
    }catch(error:any){await client.query('ROLLBACK');if(error.code==='23505')refuse('IDEMPOTENCY_CONFLICT',409,'A live order already reserves this nonce');throw error;}
  });
}
export async function cancel(orderId:string,wallet:string){
  return withOrderLock(orderId,async client=>{
    const row=(await client.query('SELECT user_wallet,status FROM limit_orders WHERE order_address=$1',[orderId])).rows[0];
    if(!row || row.user_wallet!==wallet)refuse('NOT_FOUND',404);
    if(row.status==='executing')refuse('INVALID_STATE',409,'Resolve an executing order before cancellation');
    if(row.status==='active')await client.query("UPDATE limit_orders SET status='cancelled' WHERE order_address=$1",[orderId]);
    return {order_id:orderId,status:row.status==='active'?'cancelled':row.status};
  });
}
export async function list(wallet:string){
  const rows=(await pg().query('SELECT order_address AS order_id,mint,quote_mint,order_type,amount_in::text,trigger_mcap_usd::text,status,settlement,deadline,created_at,executed_at FROM limit_orders WHERE user_wallet=$1 ORDER BY created_at DESC LIMIT $2',[wallet,integer('LIMIT_MAX_READ_ROWS')])).rows;
  return {orders:rows};
}
