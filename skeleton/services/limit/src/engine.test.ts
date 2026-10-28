import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {loadEnv,pg} from '@pump/runtime';
import {LimitKeeper,triggered,type LimitChain} from './engine';
loadEnv();
after(async()=>{await pg().end();});
async function order(work:(id:string)=>Promise<void>){
  const id=randomUUID(),prepared=randomUUID();
  await pg().query(`INSERT INTO limit_preparations(prepared_id,request_id,request_hash,user_wallet,mint,quote_mint,order_type,side,direction,amount_in,min_quote_out,trigger_mcap_usd,nonce_account,nonce_value,nonce_authority,nonce_landed_slot,deadline,response)
    VALUES($1,$2,'test','wallet','mint','quote','sell','sell','above',100,1,20,$3,'nonce-value','wallet',1,now()+interval '1 hour','{}')`,[prepared,'test:'+id,'nonce:'+id]);
  await pg().query(`INSERT INTO limit_orders(order_address,user_wallet,mint,quote_mint,order_type,amount_in,trigger_mcap_usd,nonce_account,signed_tx,status,idempotency_key,deadline,prepared_id,signed_signature,nonce_value,nonce_authority,direction)
    VALUES($1,'wallet','mint','quote','sell',100,20,$2,$3,'active',$4,now()+interval '1 hour',$5,$6,'nonce-value','wallet','above')`,[id,'nonce:'+id,Buffer.from('fixture-signed-bytes'),'test:'+id,prepared,'signature:'+id]);
  try{await work(id);}finally{await pg().query('DELETE FROM limit_settlements WHERE order_address=$1',[id]);await pg().query('DELETE FROM limit_orders WHERE order_address=$1',[id]);await pg().query('DELETE FROM limit_preparations WHERE prepared_id=$1',[prepared]);await pg().query("DELETE FROM keeper_runs WHERE job='limit' AND run_id=$1",[id]);}
}
test('market threshold uses exact decimal comparisons',()=>{
 assert.equal(triggered('9007199254740993.000000000000000001','9007199254740993','above'),true);
 assert.equal(triggered('19.999999999999999999','20','above'),false);
 assert.equal(triggered('20','20','below'),true);
});
test('two concurrent keeper runs persist one settlement and send once',async()=>order(async id=>{
 let sends=0,confirmed=false;
 const chain:LimitChain={getNonce:async()=>({nonce:'nonce-value',authority:'wallet',slot:'1',status:'confirmed'}),status:async()=>confirmed?'confirmed':'not_found',send:async()=>{sends++;confirmed=true;return {signature:'signature:'+id,status:'confirmed'};}};
 const keeper=new LimitKeeper(chain,false);
 await Promise.all([keeper.process(id,'20'),keeper.process(id,'20')]);
 assert.equal(sends,1);
 const rows=(await pg().query('SELECT state,finalized_at FROM limit_settlements WHERE order_address=$1',[id])).rows;
 assert.equal(rows.length,1);assert.equal(rows[0].state,'success');assert(rows[0].finalized_at);
 assert.equal((await keeper.process(id,'30')).status,'success');assert.equal(sends,1);
}));
test('an advanced nonce with no matching signature resolves without resubmission',async()=>order(async id=>{
 let sends=0;
 const keeper=new LimitKeeper({getNonce:async()=>({nonce:'advanced',authority:'wallet',slot:'2',status:'confirmed'}),status:async()=> 'not_found',send:async()=>{sends++;throw new Error('must not send');}},false);
 assert.equal((await keeper.process(id,'25')).reason,'nonce_advanced_without_confirmed_signature');
 assert.equal((await keeper.process(id,'25')).status,'failure');assert.equal(sends,0);
}));
test('confirmed signature wins over nonce advancement and a past deadline',async()=>order(async id=>{
 await pg().query("UPDATE limit_orders SET deadline=now()-interval '1 second' WHERE order_address=$1",[id]);
 const keeper=new LimitKeeper({getNonce:async()=>{throw new Error('must resolve history first');},status:async()=> 'confirmed',send:async()=>{throw new Error('must not send');}},false);
 assert.equal((await keeper.process(id,'25')).status,'success');
}));
test('dry run leaves the presigned order active and performs no outbound send',async()=>order(async id=>{
 let sends=0;const keeper=new LimitKeeper({getNonce:async()=>({nonce:'nonce-value',authority:'wallet',slot:'1',status:'confirmed'}),status:async()=> 'not_found',send:async()=>{sends++;throw new Error('must not send');}},true);
 assert.equal((await keeper.process(id,'25')).status,'dry_run');
 assert.equal((await pg().query('SELECT status FROM limit_orders WHERE order_address=$1',[id])).rows[0].status,'active');assert.equal(sends,0);
}));

test('an executing durable order keeps its reservation when the backend deadline passes',async()=>order(async id=>{
 await pg().query("UPDATE limit_orders SET deadline=now()-interval '1 second',status='executing' WHERE order_address=$1",[id]);
 let sends=0;
 const keeper=new LimitKeeper({getNonce:async()=>({nonce:'nonce-value',authority:'wallet',slot:'1',status:'confirmed'}),status:async()=> 'not_found',send:async()=>{sends++;return {signature:'signature:'+id,status:'unknown'};}},false);
 assert.equal((await keeper.process(id)).status,'executing');
 assert.equal((await pg().query('SELECT status FROM limit_orders WHERE order_address=$1',[id])).rows[0].status,'executing');
 assert.equal(sends,1);
}));
test('an exact send-limit retry returns stored state after expiry without re-simulating',async()=>order(async id=>{
 const row=(await pg().query('SELECT prepared_id FROM limit_orders WHERE order_address=$1',[id])).rows[0];
 await pg().query("UPDATE limit_preparations SET deadline=now()-interval '1 second' WHERE prepared_id=$1",[row.prepared_id]);
 const {store}=await import('./service.js');
 const result=await store({preparedId:row.prepared_id,transaction:Buffer.from('fixture-signed-bytes').toString('base64'),request_id:'retry:'+id},'wallet');
 assert.equal(result.order_id,id);assert.equal(result.status,'active');
}));
