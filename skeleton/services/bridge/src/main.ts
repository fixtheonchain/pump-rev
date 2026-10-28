import { randomUUID } from 'node:crypto';
import { actor,idempotent,refuse,startInternalService,type InternalContext } from '@pump/internal-http';
import { integer,loadEnv,log,pg,required } from '@pump/runtime';
import { executeBody,quoteBody,quoteQuery,statusParams } from './contracts';
import { LocalRelayAdapter,routeConfiguration,type BridgeInput } from './providers';
async function main():Promise<void>{
  loadEnv();if(required('BRIDGE_RELAY_ADAPTER')!=='local')throw new Error('BRIDGE_RELAY_ADAPTER must be local until a production transport is configured');
  const provider=new LocalRelayAdapter(routeConfiguration.parse(JSON.parse(required('BRIDGE_LOCAL_ROUTES_JSON'))));
  const ttl=integer('BRIDGE_QUOTE_TTL_MS'),slippage=integer('BRIDGE_DEFAULT_SLIPPAGE_BPS');if(ttl<1||slippage>10000)throw new Error('Invalid BRIDGE quote configuration');
  async function quote(input:BridgeInput,requestId:string,ctx:InternalContext):Promise<unknown>{
    const who=actor(ctx);
    return idempotent('bridge.quote',who.userId,requestId,input,async client=>{
      const id=randomUUID(),result=await provider.quote(input),expiresAt=new Date(Date.now()+ttl);
      const response={quoteId:id,requestId,amountAtomic:input.amountAtomic,...result,fees:{originAtomic:result.feeAtomic},expiresAt:expiresAt.toISOString(),recipient:input.recipient,steps:[],simulated:true};
      await client.query("INSERT INTO bridge_quotes(id,owner,request_data,provider_quote,expires_at,status) VALUES($1,$2,$3::jsonb,$4::jsonb,$5,'quoted')",[id,who.userId,JSON.stringify(input),JSON.stringify(response),expiresAt]);
      return response;
    });
  }
  const service=await startInternalService('bridge','BRIDGE_PORT',[
    {method:'POST',path:'/quote',actor:true,body:quoteBody,handle:async({body},ctx)=>quote({...body,slippageBps:body.slippageBps??slippage},body.requestId,ctx)},
    {method:'GET',path:'/quote',actor:true,query:quoteQuery,handle:async({query},ctx)=>{
      if(!(await pg().query('SELECT 1 FROM wallets WHERE user_id=$1 AND address=$2 AND reserved=false',[actor(ctx).userId,query.userAddress])).rowCount)refuse('FORBIDDEN',403);
      if(query.subsidizeFees==='true'||(query.originGasOverhead&&query.originGasOverhead!=='0'))refuse('PROVIDER_UNAVAILABLE',503,'The local adapter does not simulate gas subsidies');
      return quote({originChain:query.fromChain,destinationChain:query.toChain,originCurrency:query.fromToken,destinationCurrency:query.toToken,amountAtomic:query.amount,recipient:query.recipient,slippageBps:query.slippageBps??slippage},randomUUID(),ctx);
    }},
    {method:'POST',path:'/execute',actor:true,body:executeBody,handle:async({body},ctx)=>idempotent('bridge.execute',actor(ctx).userId,body.requestId,body,async client=>{
      const row=(await client.query('SELECT * FROM bridge_quotes WHERE id=$1 FOR UPDATE',[body.quoteId])).rows[0];if(!row)refuse('NOT_FOUND',404);if(row.owner!==actor(ctx).userId)refuse('FORBIDDEN',403);
      const existing=(await client.query('SELECT * FROM bridge_requests WHERE quote_id=$1',[row.id])).rows[0];if(existing)return {requestId:existing.id,status:existing.status,...existing.result,simulated:existing.simulated};
      if(row.expires_at.getTime()<=Date.now())refuse('QUOTE_EXPIRED',409);if(row.status!=='quoted')refuse('INVALID_STATE',409);
      const id=randomUUID();await client.query("UPDATE bridge_quotes SET status='executing' WHERE id=$1",[row.id]);
      const result=await provider.execute(row.id,row.provider_quote);
      await client.query("INSERT INTO bridge_requests(id,quote_id,owner,status,provider_request_id,result,simulated) VALUES($1,$2,$3,$4,$5,$6::jsonb,true)",[id,row.id,row.owner,result.status,result.providerRequestId,JSON.stringify(result)]);
      await client.query('UPDATE bridge_quotes SET status=$2 WHERE id=$1',[row.id,result.status]);return {requestId:id,quoteId:row.id,...result};
    })},
    {method:'GET',path:'/status/:requestId',actor:true,params:statusParams,handle:async({params},ctx)=>{const row=(await pg().query('SELECT * FROM bridge_requests WHERE id=$1 AND owner=$2',[params.requestId,actor(ctx).userId])).rows[0];if(!row)refuse('NOT_FOUND',404);return {requestId:row.id,quoteId:row.quote_id,status:row.status,...row.result,simulated:row.simulated};}},
  ],async()=>{await pg().query('SELECT 1');return {status:'ok',adapter:'local'};});
  const stop=():void=>{void service.close().then(()=>pg().end());};process.once('SIGINT',stop);process.once('SIGTERM',stop);
}
main().catch(error=>{log('bridge','startup_failed',{reason:error instanceof Error&&/configuration|BRIDGE_/.test(error.message)?error.message:'Dependency startup failed'});process.exitCode=1;});