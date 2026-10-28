import Decimal from 'decimal.js';
import type {PoolClient} from 'pg';
import {pg} from '@pump/runtime';

export type SignatureStatus='confirmed'|'failed'|'pending'|'not_found'|'unknown';
export type NonceState={nonce:string;authority:string;slot:string;status:'confirmed'|'unknown'};
export interface LimitChain {
  getNonce(address:string):Promise<NonceState>;
  status(signature:string):Promise<SignatureStatus>;
  send(input:{preparedId:string;transaction:string;idempotencyKey:string;user:string}):Promise<{signature:string;status:string}>;
}
export interface Order {
  order_address:string;user_wallet:string;mint:string;quote_mint:string;order_type:string;amount_in:string;
  trigger_mcap_usd:string;nonce_account:string;signed_tx:Buffer;status:string;prepared_id:string;
  signed_signature:string;nonce_value:string;nonce_authority:string;direction:'above'|'below';deadline:Date|null;
}
export function triggered(mark:string,threshold:string,direction:'above'|'below'):boolean {
  const value=new Decimal(mark),target=new Decimal(threshold);
  return value.isFinite() && value.gt(0) && (direction==='above'?value.gte(target):value.lte(target));
}
export async function withOrderLock<T>(id:string,work:(client:PoolClient)=>Promise<T>):Promise<T> {
  const client=await pg().connect();
  // A session lock survives ledger commits across the outbound adapter call and releases on process loss.
  try{await client.query('SELECT pg_advisory_lock(hashtextextended($1,0))',['limit:'+id]);return await work(client);}
  finally{await client.query('SELECT pg_advisory_unlock(hashtextextended($1,0))',['limit:'+id]).catch(()=>{});client.release();}
}
export class LimitKeeper {
  constructor(private readonly chain:LimitChain,private readonly dryRun:boolean){}
  async process(id:string,mark?:string):Promise<{status:string;reason?:string}>{
    return withOrderLock(id,async client=>{
      const order=(await client.query<Order>('SELECT * FROM limit_orders WHERE order_address=$1',[id])).rows[0];
      if(!order)return {status:'missing'};
      if(!['active','executing'].includes(order.status))return {status:order.status};
      if(!order.prepared_id || !order.signed_signature || !order.nonce_value)throw new Error('Order lacks a verified preparation');
      const finish=async(state:'success'|'failure'|'expired',reason:string)=>{
        const settlement={status:state,signature:order.signed_signature,reason};
        await client.query('BEGIN');
        try{
          await client.query(`INSERT INTO limit_settlements(order_address,signature,state,reason,finalized_at) VALUES($1,$2,$3,$4,now())
            ON CONFLICT(order_address) DO UPDATE SET state=EXCLUDED.state,reason=EXCLUDED.reason,finalized_at=COALESCE(limit_settlements.finalized_at,now()),updated_at=now()
            WHERE limit_settlements.finalized_at IS NULL`,[id,order.signed_signature,state,reason]);
          await client.query('UPDATE limit_orders SET status=$2,settlement=$3::jsonb,executed_at=CASE WHEN $2=\'success\' THEN COALESCE(executed_at,now()) ELSE executed_at END WHERE order_address=$1',[id,state,JSON.stringify(settlement)]);
          await client.query('COMMIT');
        }catch(error){await client.query('ROLLBACK');throw error;}
        return {status:state,reason};
      };
      // Resolve a previously sent signature before interpreting a consumed nonce or deadline.
      const status=await this.chain.status(order.signed_signature);
      if(status==='confirmed')return finish('success','confirmed');
      if(status==='failed')return finish('failure','transaction_failed');
      const nonce=await this.chain.getNonce(order.nonce_account);
      if(nonce.status!=='confirmed')return {status:order.status,reason:'nonce_unavailable'};
      if(nonce.authority!==order.nonce_authority)return finish('failure','nonce_authority_changed');
      if(nonce.nonce!==order.nonce_value){
        return finish('failure','nonce_advanced_without_confirmed_signature');
      }
      if(status==='pending' || status==='unknown')return {status:order.status,reason:'signature_pending'};
      if(order.status==='active' && order.deadline && order.deadline.getTime()<=Date.now())return finish('expired','deadline_elapsed');
      if(order.status==='active' && (!mark || !triggered(mark,order.trigger_mcap_usd,order.direction)))return {status:'active'};
      if(this.dryRun){
        await client.query(`INSERT INTO keeper_runs(job,run_id,inputs,txs,status) VALUES('limit',$1,$2::jsonb,'[]','dry_run') ON CONFLICT DO NOTHING`,[id,JSON.stringify({order:id,mark:mark??null})]);
        return {status:'dry_run'};
      }
      await client.query('BEGIN');
      try{
        await client.query(`INSERT INTO limit_settlements(order_address,signature,state) VALUES($1,$2,'reserved') ON CONFLICT DO NOTHING`,[id,order.signed_signature]);
        await client.query("UPDATE limit_orders SET status='executing' WHERE order_address=$1",[id]);
        await client.query('COMMIT');
      }catch(error){await client.query('ROLLBACK');throw error;}
      try{
        const sent=await this.chain.send({preparedId:order.prepared_id,transaction:order.signed_tx.toString('base64'),idempotencyKey:'limit:'+id,user:order.user_wallet});
        if(sent.signature!==order.signed_signature)throw new Error('Sender signature does not match the presigned order');
        await client.query("UPDATE limit_settlements SET attempts=attempts+1,state='pending',updated_at=now() WHERE order_address=$1 AND finalized_at IS NULL",[id]);
        if(sent.status==='confirmed')return finish('success','confirmed');
        if(sent.status==='failed')return finish('failure','transaction_failed');
        return {status:'executing',reason:'signature_pending'};
      }catch{
        // Keep the immutable signature reserved. A later pass reconciles it before any retry.
        await client.query("UPDATE limit_settlements SET reason='sender_outcome_unknown',updated_at=now() WHERE order_address=$1 AND finalized_at IS NULL",[id]);
        return {status:'executing',reason:'sender_outcome_unknown'};
      }
    });
  }
}
