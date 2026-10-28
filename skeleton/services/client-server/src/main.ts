import {createUserGrant} from '@pump/nats-auth';
import 'reflect-metadata';
import { randomUUID } from 'node:crypto';


import express, { type Request, type Response } from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { credentials, type ServiceError } from '@grpc/grpc-js';
import { z } from 'zod';
import { routes, ERROR_CODES, SOLANA_CHAIN, type RouteDefinition, type RouteKey } from '@pump/http';
import { loadPackage } from '@pump/proto';
import { integer, loadEnv, log, pg, redis, required } from '@pump/runtime';
import { DomainError, fail, upstreamError } from './errors';
import { sessionAuth, keyAuth, type Session } from './auth';
import { identityAdapter } from './identity';
import { bucket } from './rates';
import { validateKeyConfiguration } from './keys';

class TransactionProxyError extends Error {constructor(readonly status:number,readonly payload:{error:string;data:{reason:string;retryable:boolean}}){super(payload.data.reason);}}
interface FlagAdapter {enabled(name:string):boolean;disabled():string[];}
class EnvironmentFlags implements FlagAdapter {
  private flags:Record<string,boolean>;
  constructor(){this.flags=z.record(z.string(),z.boolean()).parse(JSON.parse(required('FLAGS_JSON')));}
  enabled(name:string):boolean {if(!(name in this.flags))throw new Error(`Flag configuration missing: ${name}`);return this.flags[name];}
  disabled():string[]{return Object.keys(this.flags).filter(name=>!this.flags[name]);}
}
async function main():Promise<void>{
  const {Controller,Module,RequestMapping,RequestMethod,Req,Res}=await import('@nestjs/common');
  const {NestFactory}=await import('@nestjs/core');
  loadEnv();validateKeyConfiguration();
  const keyed=process.argv.includes('--keyed');
  const origins=new Set(required('ALLOWED_ORIGINS').split(',').map(value=>value.trim()).filter(Boolean));
  if(!origins.size)throw new Error('ALLOWED_ORIGINS must name at least one origin');
  required('SESSION_JWT_SECRET');required('SESSION_JWT_ISSUER');required('SESSION_JWT_AUDIENCE');
  const sessionTtl=integer('SESSION_TTL_SECONDS');
  if(sessionTtl<1)throw new Error('SESSION_TTL_SECONDS must be positive');
  const flags=new EnvironmentFlags(),identity=identityAdapter();
  for(const definition of Object.values(routes) as RouteDefinition[])if(definition.flag)flags.enabled(definition.flag);
  const trading=new (loadPackage('trading.v1').TradeApi)(required('TRADING_GRPC_URL'),credentials.createInsecure());
  const communities=new (loadPackage('communities.v1').CommunitiesApi)(required('COMMUNITIES_GRPC_URL'),credentials.createInsecure());
  await redis();
  function rpc(client:any,method:string,input:unknown,lane:string):Promise<any>{
    return new Promise((resolve,reject)=>client[method](input,{deadline:Date.now()+integer('UPSTREAM_TIMEOUT_MS')},(error:ServiceError|null,result:unknown)=>error?reject(upstreamError(error,lane)):resolve(result)));
  }
  function envelope(req:Request,res:Response,error:unknown,style?:'transaction'):void{
    if(style==='transaction'){
      if(error instanceof TransactionProxyError){res.status(error.status).json(error.payload);return;}
      const fault=error instanceof DomainError?error:error instanceof z.ZodError?new DomainError('INVALID_ARGUMENT'):new DomainError('INTERNAL');
      res.status(ERROR_CODES[fault.code].status).json({error:'blockchain-api-service',data:{reason:fault.code,retryable:ERROR_CODES[fault.code].retryable!=='never'}});return;
    }
    const domain=error instanceof DomainError?error:error instanceof z.ZodError?new DomainError('INVALID_ARGUMENT'):new DomainError('INTERNAL');
    const definition=ERROR_CODES[domain.code];
    if(domain.code==='INTERNAL')log(keyed?'keyed-api':'client-server','request_failed',{method:req.method,path:req.path});
    if(domain.details.retryAfterMs)res.setHeader('Retry-After',String(Math.ceil(domain.details.retryAfterMs/1000)));
    res.status(definition.status).json({statusCode:definition.status,timestamp:new Date().toISOString(),path:req.path,error:domain.code,code:domain.code,message:definition.summary,...domain.details});
  }
  async function rest(service:string,pathname:string,method:string,query:Record<string,unknown>|undefined,body:unknown,session:Session|undefined,transactionStyle=false):Promise<any>{
    const url=new URL(pathname,required(service));
    for(const [name,value] of Object.entries(query??{}))if(value!==undefined)url.searchParams.set(name,String(value));
    const headers:Record<string,string>={authorization:'Bearer '+required('INTERNAL_SERVICE_TOKEN')};
    if(session){headers['x-pump-user-id']=session.sub;headers['x-pump-wallet']=session.wallet;}
    if(body!==undefined)headers['content-type']='application/json';
    let response:globalThis.Response,payload:any;
    try{response=await fetch(url,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(integer('UPSTREAM_TIMEOUT_MS'))});payload=await response.json();}
    catch{throw new DomainError('UPSTREAM_UNAVAILABLE',{degraded_lanes:[service.toLowerCase()]});}
    if(!response.ok){
      if(transactionStyle && payload?.data?.reason)throw new TransactionProxyError(response.status,payload);
      const code=typeof payload?.code==='string' && payload.code in ERROR_CODES?payload.code as keyof typeof ERROR_CODES:'UPSTREAM_UNAVAILABLE';
      throw new DomainError(code,code==='UPSTREAM_UNAVAILABLE'?{degraded_lanes:[service.toLowerCase()]}:{});
    }
    return payload;
  }
  async function login(input:{identityToken:string},req:Request,res:Response):Promise<unknown>{
    if(req.path==='/auth/login/session' && !req.headers.origin)fail('FORBIDDEN');
    await bucket(`auth:login:${req.ip}`,integer('AUTH_IP_LIMIT'),integer('AUTH_IP_WINDOW_MS'));
    res.setHeader('Cache-Control','no-store');
    const verified=await identity.verify(input.identityToken);
    let user:any;
    try{user=await rpc(communities,'getUser',{id:verified.wallet},'cc.get_user');}
    catch(error){if(error instanceof DomainError && ['NOT_FOUND','PROFILE_NOT_MIRRORED'].includes(error.code))fail('ACCOUNT_NOT_FOUND');throw error;}
    if(user.banned)fail('WALLET_NOT_ALLOWED');
    const jti=randomUUID(),expiresAt=new Date(Date.now()+sessionTtl*1000);
    await pg().query('INSERT INTO sessions(jti,user_id,wallet,expires_at) VALUES($1,$2,$3,$4)',[jti,user.id,verified.wallet,expiresAt]);
    const token=jwt.sign({wallet:verified.wallet},required('SESSION_JWT_SECRET'),{algorithm:'HS256',subject:user.id,jwtid:jti,issuer:required('SESSION_JWT_ISSUER'),audience:required('SESSION_JWT_AUDIENCE'),expiresIn:sessionTtl});
    if(req.path==='/auth/login/session'){
      if(!req.headers.origin)fail('FORBIDDEN');
      res.cookie('auth_token',token,{httpOnly:true,sameSite:'lax',secure:required('COOKIE_SECURE')==='true',path:'/',maxAge:sessionTtl*1000});
    }
    return {token,user,expiresAt:expiresAt.toISOString()};
  }
  async function dispatch(key:RouteKey,input:{params:any;query:any;body:any},session:Session|undefined,req:Request,res:Response):Promise<any>{
    const {params:p,query:q,body:b}=input;
    const coinRequest={chain:q?.chain ?? SOLANA_CHAIN,address:p?.mint ?? p?.address,commitment:q?.commitment?.toUpperCase()};
    if(key==='POST /nats/token'){
      const who=session!;
      const rows=await pg().query('SELECT address FROM wallets WHERE user_id=$1 AND reserved=false',[who.sub]);
      const user=await pg().query('SELECT canonical_svm_wallet,canonical_evm_wallet FROM users WHERE id=$1',[who.sub]);
      if(!user.rowCount)fail('NATS_AUTH_USER_SCOPE_REQUIRED');
      const wallets=[...new Set<string>([...rows.rows.map(row=>row.address),user.rows[0].canonical_svm_wallet,user.rows[0].canonical_evm_wallet].filter((value):value is string=>typeof value==='string' && value.length>0))];
      res.setHeader('Cache-Control','no-store');
      return createUserGrant({userId:who.sub,wallets,sessionJti:who.jti});
    }
    if(req.path.startsWith('/api/blockchain/'))return rest('TX_BUILDER_URL',req.path.slice('/api/blockchain'.length),req.method,q,b,session,true);
    if(req.path.startsWith('/api/blockchain-limit/'))return rest('LIMIT_URL',req.path.slice('/api/blockchain-limit'.length),req.method,q,b,session);
    if(req.path.startsWith('/api/relay/'))return rest('BRIDGE_URL',req.path.slice('/api/relay'.length),req.method,q,b,session);
    if(req.path.startsWith('/user-portfolio/')||req.path.startsWith('/user-positions/'))return rest('PROFILE_URL',req.path,req.method,q,b,session);
    if(req.path==='/portfolio-summary')return rest('PROFILE_URL',req.path,req.method,{...q,user:q?.user??session?.wallet},b,session);
    if(req.path==='/fees/holder-rewards')return rest('HOLDER_REWARDS_URL','/book','GET',q,undefined,session);
    if(req.path.startsWith('/v1/device-tokens')||req.path.startsWith('/notifications'))return rest('NOTIFY_URL',req.path,req.method,q,b,session);
    if(req.path.startsWith('/livestream')||req.path.startsWith('/clips')||req.path.startsWith('/bounties/')||req.path==='/feed/video-feed'||req.path==='/coins/currently-live')return rest('LIVE_URL',req.path,req.method,q,b,session);
    switch(key){
      case 'GET /health':return {status:'ok'};
      case 'POST /auth/login/token':case 'POST /auth/login/session':return login(b,req,res);
      case 'GET /auth/my-profile':return rpc(communities,'getUser',{id:session!.sub},'cc.get_user');
      case 'POST /auth/logout':
        await pg().query('UPDATE sessions SET revoked_at=COALESCE(revoked_at,now()) WHERE jti=$1',[session!.jti]);
        res.clearCookie('auth_token',{path:'/',httpOnly:true,sameSite:'lax',secure:required('COOKIE_SECURE')==='true'});
        return {success:true};
      case 'GET /auth/disabled-features':return {disabledFeatures:flags.disabled()};
      case 'GET /trades/{chainId}/{address}':return rpc(trading,'getTrades',{...q,chain:p.chainId,address:p.address,commitment:q?.commitment?.toUpperCase()},'trade_api.get_trades');
      case 'GET /candles/{chainId}/{address}':return rpc(trading,'getCandles',{...q,measure:q.measure ?? 'price_usd',chain:p.chainId,address:p.address,commitment:q?.commitment?.toUpperCase()},'trade_api.get_candles');
      case 'GET /coins-v2/{mint}':case 'GET /coins-v3/{address}':return (await rpc(trading,'getCoin',coinRequest,'trade_api.get_coin')).coin;
      case 'GET /token-holders/{mint}/count':return rpc(trading,'getHolders',coinRequest,'trade_api.get_holders');
      case 'GET /users/{id}':return rpc(communities,'getUser',{id:p.id},'cc.get_user');
      case 'GET /users':case 'GET /users/search-v2':return rpc(communities,'listUsers',{...q,search:q?.searchTerm},'cc.list_users');
      case 'POST /following/v2/{userId}':case 'DELETE /following/{userId}':
        return rpc(communities,'follow',{userId:session!.sub,targetUserId:p.userId,origin:q?.origin,remove:req.method==='DELETE'},'cc.follow');
      case 'GET /following/v3/followers/{userId}':case 'GET /following/v3/following/{userId}':
        return rpc(communities,'getFollowing',{...q,userId:p.userId,followers:key.includes('/followers/')},'cc.get_following');
      case 'POST /callout/create':return rpc(communities,'createCallout',{...b,chain:b.chain ?? b.chainId ?? SOLANA_CHAIN,userId:session!.sub,wallet:session!.wallet,version:b.version ?? 1},'cc.create_callout');
      case 'GET /callout/eligibility/{coinMint}':return rpc(communities,'getEligibility',{...q,coinMint:p.coinMint,chain:q?.chain ?? SOLANA_CHAIN,userId:session!.sub,wallet:session!.wallet},'cc.get_eligibility');
      case 'GET /callout/{calloutId}':return rpc(communities,'getCallout',{id:p.calloutId},'cc.get_callout');
      default:fail('NOT_IMPLEMENTED');
    }
  }
  class ContractController {}
  Controller()(ContractController);
  const entries=Object.entries(routes) as [RouteKey,RouteDefinition][];
  // Static routes precede parameter routes, so /users/search-v2 cannot resolve as an id.
  entries.sort((a,b)=>((a[0].match(/\{/g)?.length ?? 0)-(b[0].match(/\{/g)?.length ?? 0)));
  for(const [index,[key,definition]] of entries.entries()){
    const [method,pattern]=key.split(' ');
    const name=`route_${index}`;
    const handler=async(req:Request,res:Response):Promise<void>=>{
      try{
        if(!keyed && definition.auth==='none' && (req.headers['x-api-key'] || req.headers.authorization?.startsWith('Bearer pf_live_')))fail('API_CREDENTIAL_NOT_ALLOWED');
        const session=keyed || definition.auth==='none'?undefined:await sessionAuth(req,definition.auth==='session');
        if(keyed && key!=='GET /health'){
          await keyAuth(req,definition.scope);
          if(definition.keyedUserRequired && !req.query.user)fail('API_USER_REQUIRED');
        }
        if(definition.flag && !flags.enabled(definition.flag))fail('NOT_FOUND');
        if(session){res.setHeader('Cache-Control','no-store');await bucket(`user:${session.sub}`,integer('USER_RATE_LIMIT'),integer('USER_RATE_WINDOW_MS'));}
        else if(!keyed && key!=='GET /health')await bucket(`public:${req.ip}`,integer('PUBLIC_RATE_LIMIT'),integer('PUBLIC_RATE_WINDOW_MS'));
        const input={params:definition.params?.parse(req.params),query:definition.query?.parse(req.query),body:definition.body?.parse(req.body)};
        if(definition.implemented!==true)fail('NOT_IMPLEMENTED');
        if(definition.deprecated){res.setHeader('Deprecation',definition.deprecated.since);res.setHeader('Sunset',new Date(definition.deprecated.sunset).toUTCString());}
        const result=await dispatch(key,input,session,req,res);
        // Validate output too: implementation drift fails inside the service boundary.
        let output:unknown;
        try{output=definition.response.parse(result);}catch{throw new DomainError('INTERNAL');}
        res.status(method==='POST' && key==='POST /callout/create'?201:200).json(output);
      }catch(error){envelope(req,res,error,definition.errorStyle);}
    };
    Object.defineProperty(ContractController.prototype,name,{value:handler,writable:true});
    RequestMapping({path:pattern.replace(/\{([^}]+)\}/g,':$1'),method:RequestMethod[method as keyof typeof RequestMethod]})(ContractController.prototype,name,Object.getOwnPropertyDescriptor(ContractController.prototype,name)!);
    Req()(ContractController.prototype,name,0);Res()(ContractController.prototype,name,1);
  }
  class AppModule {}
  Module({controllers:[ContractController]})(AppModule);
  const app=await NestFactory.create(AppModule,{logger:false,bodyParser:false});
  app.use((req:Request,res:Response,next:()=>void)=>{
    if(req.headers.origin && !origins.has(req.headers.origin)){envelope(req,res,new DomainError('FORBIDDEN'));return;}
    next();
  });
  app.enableCors({origin:[...origins],credentials:!keyed,methods:['GET','POST','PUT','PATCH','DELETE','OPTIONS'],allowedHeaders:['Content-Type','Authorization','x-api-key','x-pump-source','x-pump-platform','x-device-id','x-aws-waf-token']});
  app.use(express.json({limit:integer('BODY_LIMIT_BYTES')}));
  const multipart=multer({limits:{fields:integer('MULTIPART_MAX_FIELDS'),fieldSize:integer('BODY_LIMIT_BYTES')}}).none();
  app.use((req:Request,res:Response,next:(error?:unknown)=>void)=>{
    if(req.is('multipart/form-data'))multipart(req,res,error=>error?envelope(req,res,new DomainError('INVALID_ARGUMENT')):next());
    else next();
  });
  await app.init();
  const server=app.getHttpAdapter().getInstance();
  server.use((req:Request,res:Response)=>envelope(req,res,new DomainError('NOT_FOUND')));
  server.use((error:unknown,req:Request,res:Response,_next:unknown)=>envelope(req,res,new DomainError('INVALID_ARGUMENT')));
  const port=integer(keyed?'KEYED_PORT':'BFF_PORT');
  await app.listen(port,required('BIND_HOST'));
  log(keyed?'keyed-api':'client-server','listening',{port});
  async function stop():Promise<void>{await app.close();trading.close();communities.close();await pg().end();await (await redis()).quit();}
  process.once('SIGINT',()=>void stop());process.once('SIGTERM',()=>void stop());
}
main().catch(error=>{log('client-server','startup_failed',{reason:error instanceof Error?error.message:'unknown'});process.exitCode=1;});
