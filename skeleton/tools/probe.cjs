// Container health adapter. TradeApi and domain Health methods are custom unary RPCs,
// so Kubernetes' native grpc.health.v1 probe is intentionally not used.
const http=require('node:http');
const https=require('node:https');
const fs=require('node:fs');
const requested=process.argv[2];
const name=requested==='client-server'&&process.env.PUMPSKEL_API_HOST_MODE==='keyed'?'keyed-api':requested;
const timeout=Number(process.env.HEALTHCHECK_TIMEOUT_MS??process.env.UPSTREAM_TIMEOUT_MS);
if(!Number.isSafeInteger(timeout)||timeout<1)process.exit(1);
const timer=setTimeout(()=>process.exit(1),timeout);
function finish(ok){clearTimeout(timer);process.exit(ok?0:1);}
if(['trading','communities','coins'].includes(name)){
  const {loadPackage,grpc}=require('@pump/proto');
  const definitions={trading:['trading.v1','TradeApi',4347,'TRADING_GRPC_BIND'],communities:['communities.v1','CommunitiesApi',4348,'COMMUNITIES_GRPC_BIND'],coins:['coins.v1','CoinsApi',4349,'COINS_GRPC_BIND']};
  const [namespace,service,fallback,bind]=definitions[name];
  const port=process.env[bind]?Number(process.env[bind].split(':').at(-1)):fallback;
  if(!Number.isInteger(port)||port<1||port>65535)finish(false);
  const client=new(loadPackage(namespace)[service])('127.0.0.1:'+port,grpc.credentials.createInsecure());
  client.Health({},{deadline:Date.now()+timeout},error=>{client.close();finish(!error);});
}else{
  const key={'client-server':'BFF_PORT','keyed-api':'KEYED_PORT','stream-gateway':'STREAM_PORT','tx-builder':'TX_BUILDER_PORT',limit:'LIMIT_PORT',profile:'PROFILE_PORT',notify:'NOTIFY_PORT',live:'LIVE_PORT',bridge:'BRIDGE_PORT','auth-callout':'NATS_AUTH_HEALTH_PORT','holder-rewards':'HOLDER_REWARDS_PORT'}[name];
  const port=Number(process.env[key]);
  if(!Number.isInteger(port)||port<1||port>65535)finish(false);
  const tls=name==='stream-gateway'&&process.env.STREAM_TLS_CERT_PATH;
  const request=(tls?https:http).get({host:'127.0.0.1',port,path:'/health',...(tls?{ca:fs.readFileSync(process.env.STREAM_TLS_CERT_PATH)}:{})},response=>{response.resume();response.on('end',()=>finish(response.statusCode===200));});
  request.setTimeout(timeout,()=>request.destroy());request.on('error',()=>finish(false));
}