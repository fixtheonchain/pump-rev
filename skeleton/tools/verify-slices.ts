import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { WebSocket } from 'ws';
import { consumerOpts, createInbox, JSONCodec } from 'nats';
import { loadEnv, required, workspaceRoot, natsConnect, pg, log, chQuery } from '@pump/runtime';
import { streamCodecs } from '@pump/proto';
import { createClient, ApiError } from '@pump/http';
import { ensureBus, launchServices, coreServices } from './start-local';
import { ensureTls } from './dev-tls';
import { SEED } from './seed';

const pause=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
async function until<T>(read:()=>T|Promise<T>,timeoutMs=15000):Promise<T>{
  const deadline=Date.now()+timeoutMs;
  while(Date.now()<deadline){const value=await read();if(value)return value;await pause(50);}
  throw new Error('Timed out waiting for slice evidence');
}
async function healthy(url:string):Promise<boolean>{try{return (await fetch(url,{signal:AbortSignal.timeout(1000)})).ok;}catch{return false;}}
let step='prepare';
async function main():Promise<void>{
  loadEnv();await ensureTls();await ensureBus();
  const env={...process.env,BFF_PORT:'4360',KEYED_PORT:'4361',STREAM_PORT:'4362',TRADING_GRPC_URL:'127.0.0.1:4363',COMMUNITIES_GRPC_URL:'127.0.0.1:4364',COINS_GRPC_URL:'127.0.0.1:4365'};
  const children:ChildProcess[]=launchServices(env,coreServices);
  let socket:WebSocket|undefined,createdId:string|undefined;
  const nc=await natsConnect('operator');
  try{
    step='bff_health';
    await until(()=>healthy('http://127.0.0.1:4360/health')); 
    step='keyed_health';
    await until(()=>healthy('http://127.0.0.1:4361/health')); 
    // Wait for gateway upstream health through its TLS endpoint with the local certificate.
    const {WatchRequest,Frame}=await streamCodecs();
    const frames:any[]=[];
    const connect=async():Promise<WebSocket>=>{
      const ws=new WebSocket('wss://127.0.0.1:4362/stream','pumpfun.trading.v1',{ca:await readFile(required('STREAM_TLS_CERT_PATH')),origin:'http://localhost:3000'});
      await once(ws,'open');return ws;
    };
    step='gateway_connect';
    for(let attempt=0;attempt<60;attempt++){
      try{socket=await connect();break;}catch{await pause(100);}
    }
    assert(socket,'Gateway did not start');
    socket.on('message',(bytes,isBinary)=>{
      assert(isBinary);frames.push(Frame.toObject(Frame.decode(Buffer.from(bytes as Buffer)),{longs:String,enums:String,defaults:true,oneofs:true}));
    });
    socket.send(WatchRequest.encode(WatchRequest.fromObject({subscribe:[{coin:{chain:SEED.chain,address:SEED.mint,parts:['MARKET','CANDLES'],commitment:'PROCESSED',candles:[{res:'1m',measure:'price_usd'}]}}]})).finish());
    step='trading_snapshot';
    await until(()=>frames.find(frame=>frame.kind==='SNAPSHOT')); 
    // Give each verifier run new ordinals so persisted source revisions and JetStream dedup remain meaningful.
    const shift=BigInt(Date.now()),source=await readFile(path.join(workspaceRoot(),'fixtures/replay.jsonl'),'utf8');
    const rows=source.trim().split('\n').map(line=>JSON.parse(line));
    for(const row of rows){
      if(row.ordinal){row.ordinal.block_id=(BigInt(row.ordinal.block_id)+shift).toString();row.signature=`verify-${row.ordinal.block_id}-${row.ordinal.tx_index}`;}
      if(row.type==='confirmed_block'){row.block_id=Number(BigInt(row.block_id)+shift);row.seen=row.seen.map((key:string)=>{const [block,tx,event]=key.split('-');return `${BigInt(block)+shift}-${tx}-${event}`;});}
    }
    const fixture=path.join(workspaceRoot(),'.local','verify-replay.jsonl');await mkdir(path.dirname(fixture),{recursive:true});await writeFile(fixture,rows.map(row=>JSON.stringify(row)).join('\n')+'\n');
    step='ingest_replay';
    const ingest=spawn(path.join(workspaceRoot(),'ingest','target','debug',process.platform==='win32'?'pump-ingest.exe':'pump-ingest'),['replay',fixture,'--delay-ms','150'],{cwd:workspaceRoot(),env:process.env,stdio:'inherit',windowsHide:true});
    children.push(ingest);const [code]=await once(ingest,'exit');assert.equal(code,0,'Rust ingest failed');
    step='live_frame';
    await until(()=>frames.find(frame=>frame.kind==='LIVE')); 
    step='correction_frame';
    await until(()=>frames.find(frame=>frame.kind==='CORRECTION' && frame.coin?.removed)); 
    const changedBlock=(1001n+shift).toString(),droppedBlock=changedBlock;
    step='trade_and_candle_reads';
    const api=createClient({baseUrl:'http://127.0.0.1:4360'});
    const tape=await api.request('GET /trades/{chainId}/{address}',{params:{chainId:SEED.chain,address:SEED.mint},query:{limit:100}});
    const corrected=tape.trades.find(trade=>trade.ordinal.blockId===changedBlock && trade.ordinal.txIndex===0);
    assert.equal(corrected?.quoteAmount,'1200000000');assert.equal(corrected?.commitment,'CONFIRMED');
    assert(!tape.trades.some(trade=>trade.ordinal.blockId===droppedBlock && trade.ordinal.txIndex===1),'Dropped ordinal leaked into tape');
    const candles=await api.request('GET /candles/{chainId}/{address}',{params:{chainId:SEED.chain,address:SEED.mint},query:{res:'1m',measure:'price_usd'}});
    assert(candles.candles.length>0);
    const physical=await chQuery<{count:string}>('SELECT toString(count()) AS count FROM trades FINAL WHERE chain={chain:String} AND mint={mint:String} AND block_id={block:UInt64} AND tx_index=0',{chain:SEED.chain,mint:SEED.mint,block:changedBlock});
    assert.equal(physical[0].count,'1','ReplacingMergeTree canonical ordinal must be unique');
    log('verify','trade_slice_passed',{frames:frames.length,correction:true,trades:tape.trades.length,candles:candles.candles.length});

    step='callout_login';
    const login=await api.request('POST /auth/login/token',{body:{identityToken:required('LOCAL_IDENTITY_TOKEN')}});
    const signed=createClient({baseUrl:'http://127.0.0.1:4360',token:login.token});
    const opts=consumerOpts();opts.deliverNew();opts.manualAck();opts.ackExplicit();opts.deliverTo(createInbox('_INBOX.operator'));opts.bindStream('COMMUNITIES_EVENTS');
    const subject=`followingFeed.user.${SEED.bob}`,subscription=await nc.jetstream().subscribe(subject,opts);
    const observed:any[]=[];const consumer=(async()=>{for await(const event of subscription){observed.push(JSONCodec().decode(event.data));event.ack();}})();
    try{
      step='callout_create';
      const created=await signed.request('POST /callout/create',{body:{coinMint:SEED.mint,chain:SEED.chain,thesis:'The fixture trade reached confirmed storage and the live stream.',asGroupId:SEED.squad}});
      createdId=created.callout.id;assert.equal(created.callout.author.id,SEED.alice);
      assert.equal(created.callout.actingGroup,SEED.squad);
      let duplicate:ApiError|undefined;
      try{await signed.request('POST /callout/create',{body:{coinMint:SEED.mint,chain:SEED.chain,thesis:'Duplicate proof'}});}
      catch(error){if(error instanceof ApiError)duplicate=error;else throw error;}
      assert.equal(duplicate?.envelope.code,'DUPLICATE_CALLOUT');assert.equal(duplicate?.status,409);
      step='callout_event';
      await until(()=>observed.find(event=>event.id===createdId)); 
      log('verify','callout_slice_passed',{calloutId:createdId,duplicate:'DUPLICATE_CALLOUT',subject});
    }finally{subscription.unsubscribe();await consumer;}
    step='keyed_host_and_cors';
    const key=(await readFile(path.join(workspaceRoot(),'.local','api-key.txt'),'utf8')).trim();
    const keyed=createClient({baseUrl:'http://127.0.0.1:4361',apiKey:key});
    assert.equal((await keyed.request('GET /users/{id}',{params:{id:SEED.alice}})).id,SEED.alice);
    const crossed=await fetch('http://127.0.0.1:4360/users/'+SEED.alice,{headers:{'x-api-key':key}});
    assert.equal((await crossed.json() as {code:string}).code,'API_CREDENTIAL_NOT_ALLOWED');
    const cors=await fetch('http://127.0.0.1:4360/health',{headers:{Origin:'https://unconfigured.example.test'}});
    assert.equal(cors.status,403);
    log('verify','keyed_host_and_cors_passed');
    await writeFile(path.join(workspaceRoot(),'.local','verification.json'),JSON.stringify({checkedAt:new Date().toISOString(),trade:{live:frames.some(f=>f.kind==='LIVE'),correction:frames.some(f=>f.kind==='CORRECTION'),tombstone:frames.some(f=>f.coin?.removed)},calloutId:createdId,duplicateCode:'DUPLICATE_CALLOUT',subject},null,2)+'\n');
  }finally{
    socket?.close();await nc.drain();
    // Retain the verified record and event, release only this runner's live uniqueness slot.
    if(createdId)await pg().query("UPDATE callouts SET status='closed' WHERE id=$1",[createdId]);
    for(const child of children)if(child.exitCode===null)child.kill();
    await Promise.all(children.filter(child=>child.exitCode===null).map(child=>Promise.race([once(child,'exit'),pause(3000)])));
    await pg().end();
  }
}
main().catch(error=>{process.stderr.write(`Slice verification failed at ${step}: ${error instanceof Error?error.message:String(error)}\n`);process.exitCode=1;});
