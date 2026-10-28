import {credentials, type ClientReadableStream} from '@grpc/grpc-js';
import {loadPackage} from '@pump/proto';
import {integer,loadEnv,log,pg,required} from '@pump/runtime';
import {startInternalService,actor} from '@pump/internal-http';
import {getNonce,getSignatureStatus,sendStored} from '@pump/tx-builder';
import {eligibilityInput,buildInput,sendInput,cancelInput,eligibility,prepare,store,cancel,list,orderKinds} from './service';
import {LimitKeeper} from './engine';

async function main():Promise<void>{
  loadEnv();orderKinds();
  const dry=required('LIMIT_DRY_RUN');if(!['true','false'].includes(dry))throw new Error('LIMIT_DRY_RUN must be true or false');
  const keeper=new LimitKeeper({getNonce,status:getSignatureStatus,send:sendStored},dry==='true');
  const client=new (loadPackage('trading.v1').TradeApi)(required('TRADING_GRPC_URL'),credentials.createInsecure());
  const feeds=new Map<string,{call:ClientReadableStream<any>;lastAt:number;mark?:string}>();
  let running=false,stopped=false;
  const commitment=required('LIMIT_TRIGGER_COMMITMENT');
  if(!['PROCESSED','CONFIRMED'].includes(commitment))throw new Error('Invalid LIMIT_TRIGGER_COMMITMENT');
  async function tick():Promise<void>{
    if(running||stopped)return;running=true;
    try{
      const orders=(await pg().query("SELECT order_address,mint,status FROM limit_orders WHERE status IN ('active','executing') ORDER BY created_at LIMIT $1",[integer('LIMIT_KEEPER_BATCH_SIZE')])).rows;
      const mints=new Set<string>(orders.filter(row=>row.status==='active').map(row=>row.mint));
      for(const [mint,feed] of feeds)if(!mints.has(mint)){feeds.delete(mint);feed.call.cancel();}
      for(const mint of mints){
        if(feeds.has(mint)||feeds.size>=integer('LIMIT_MAX_WATCH_TOPICS'))continue;
        const call=client.watch({subscribe:[{coin:{chain:'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',address:mint,parts:['MARKET','MARKS'],commitment}}]}) as ClientReadableStream<any>;
        const feed={call,lastAt:0,mark:undefined as string|undefined};feeds.set(mint,feed);
        call.on('data',frame=>{if(frame.coin?.state?.marketCapUsd && !frame.gap){feed.mark=frame.coin.state.marketCapUsd;feed.lastAt=Date.now();}if(frame.gap){feed.mark=undefined;feed.lastAt=0;}});
        call.on('error',()=>{if(feeds.get(mint)===feed)feeds.delete(mint);});call.on('end',()=>{if(feeds.get(mint)===feed)feeds.delete(mint);});
      }
      for(const order of orders){
        const feed=feeds.get(order.mint),mark=feed && Date.now()-feed.lastAt<=integer('LIMIT_MARK_STALE_MS')?feed.mark:undefined;
        // Executing orders reconcile their immutable signature even without a current market stream.
        if(order.status==='executing'||mark)await keeper.process(order.order_address,mark);
      }
    }catch{log('limit','keeper_retry');}finally{running=false;}
  }
  const http=await startInternalService('limit','LIMIT_PORT',[
    {method:'POST',path:'/transactions/limit-eligibility',actor:true,body:eligibilityInput,handle:async({body},ctx)=>eligibility(body,actor(ctx).wallet)},
    {method:'POST',path:'/transactions/swap-build-limit',actor:true,body:buildInput,handle:async({body},ctx)=>prepare(body,actor(ctx).wallet)},
    {method:'POST',path:'/transactions/send-limit',actor:true,body:sendInput,handle:async({body},ctx)=>store(body,actor(ctx).wallet)},
    {method:'POST',path:'/transactions/cancel-limit',actor:true,body:cancelInput,handle:async({body},ctx)=>cancel(body.order_id,actor(ctx).wallet)},
    {method:'GET',path:'/orders',actor:true,handle:async(_input,ctx)=>list(actor(ctx).wallet)},
  ],async()=>{await pg().query('SELECT 1');return {status:'ok',dryRun:dry==='true',watchedTopics:feeds.size};});
  const timer=setInterval(()=>void tick(),integer('LIMIT_KEEPER_POLL_MS'));await tick();
  async function stop(){stopped=true;clearInterval(timer);for(const feed of feeds.values())feed.call.cancel();client.close();await http.close();await pg().end();}
  process.once('SIGINT',()=>void stop());process.once('SIGTERM',()=>void stop());
}
main().catch(error=>{log('limit','startup_failed',{reason:error instanceof Error && /configuration|LIMIT_/.test(error.message)?error.message:'Dependency startup failed'});process.exitCode=1;});
