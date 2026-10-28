import 'reflect-metadata';
import { timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { integer, loadEnv, log, pg, redis, required } from '@pump/runtime';
import { transactionBuilder, TransactionRefusal } from './index';
loadEnv();
const address=z.string().min(1);const amount=z.string().regex(/^\d+$/);
const swap=z.object({user:address,mint:address,quote_mint:address,side:z.enum(['buy','sell']),amount_in:amount,min_out:amount,venue:z.enum(['pump','pumpswap']).optional(),pool:address.optional()}).strict();
const fees=z.object({wallet:address,mint:address}).strict();
const vault=z.object({wallet:address,quote_mint:address.optional()}).strict();
const send=z.object({preparedId:z.string().uuid().optional(),transaction:z.string().min(1),idempotencyKey:z.string().min(1),route:z.string().optional(),options:z.record(z.string(),z.unknown()).optional(),non_trade_tx:z.boolean().optional()}).strict();
function equal(a:string,b:string):boolean{const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right);}
async function authenticatedWallet(req:any):Promise<string>{
 const bearerInternal=typeof req.headers.authorization==='string'&&req.headers.authorization.startsWith('Bearer ')?req.headers.authorization.slice(7):undefined;
 const internal=req.headers['x-internal-service-token']??(bearerInternal&&equal(bearerInternal,required('INTERNAL_SERVICE_TOKEN'))?bearerInternal:undefined);
 if(typeof internal==='string'){
  if(!equal(internal,required('INTERNAL_SERVICE_TOKEN')))throw new TransactionRefusal('unauthenticated');
  const wallet=req.headers['x-pump-wallet'],userId=req.headers['x-pump-user-id'];if(typeof wallet!=='string'||!wallet||typeof userId!=='string'||!z.uuid().safeParse(userId).success)throw new TransactionRefusal('unauthenticated');
  const actor=await pg().query('SELECT 1 FROM users u JOIN wallets w ON w.user_id=u.id WHERE u.id=$1 AND w.address=$2 AND u.banned_at IS NULL',[userId,wallet]);if(!actor.rowCount)throw new TransactionRefusal('unauthenticated');return wallet;
 }
 let authorization=req.headers.authorization as string|undefined;
 if(!authorization){const cookie=(req.headers.cookie as string|undefined)?.split(';').map(item=>item.trim()).find(item=>item.startsWith('auth_token='));if(cookie){const allowed=required('ALLOWED_ORIGINS').split(',');if(!req.headers.origin||!allowed.includes(req.headers.origin))throw new TransactionRefusal('origin_required');authorization=`Bearer ${decodeURIComponent(cookie.slice(11))}`;}}
 if(!authorization?.startsWith('Bearer ')||authorization.startsWith('Bearer pf_live_'))throw new TransactionRefusal('unauthenticated');
 try{const claims=jwt.verify(authorization.slice(7),required('SESSION_JWT_SECRET'),{algorithms:['HS256'],issuer:required('SESSION_JWT_ISSUER'),audience:required('SESSION_JWT_AUDIENCE')});if(typeof claims==='string'||typeof claims.wallet!=='string'||!claims.jti||!claims.sub)throw new Error('invalid');const session=await pg().query('SELECT 1 FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.jti=$1 AND s.user_id=$2 AND s.wallet=$3 AND s.revoked_at IS NULL AND s.expires_at>now() AND u.banned_at IS NULL',[claims.jti,claims.sub,claims.wallet]);if(!session.rowCount)throw new Error('revoked');return claims.wallet;}catch{throw new TransactionRefusal('unauthenticated');}
}
async function bucket(wallet:string):Promise<void>{const client=await redis();const result=await client.eval("local n=redis.call('INCR',KEYS[1]);if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end;return n",{keys:[`tx-user:${wallet}`],arguments:[String(integer('TX_USER_RATE_WINDOW_MS'))]}) as number;if(result>integer('TX_USER_RATE_LIMIT'))throw new TransactionRefusal('rate_limited',true);}
async function main(){
 const {Controller,Get,Post,Req,Res,Module}=await import('@nestjs/common');
 const {NestFactory}=await import('@nestjs/core');
@Controller()
class TransactionController {
 @Get('health') async health(){await pg().query('SELECT 1');return {status:'ok'};}
 private async handle(req:any,res:any,schema:z.ZodType,fn:(input:any,wallet:string)=>Promise<any>){try{const input=schema.parse(req.body);const wallet=await authenticatedWallet(req);if((input as any).user&&(input as any).user!==wallet||(input as any).wallet&&(input as any).wallet!==wallet)throw new TransactionRefusal('owner_mismatch');await bucket(wallet);res.status(200).json(await fn(input,wallet));}catch(error){const refusal=error instanceof TransactionRefusal?error:new TransactionRefusal(error instanceof z.ZodError?'invalid_input':'upstream_unavailable',!(error instanceof z.ZodError));const status=refusal.reason==='unauthenticated'?401:refusal.reason==='owner_mismatch'?403:refusal.reason==='rate_limited'?429:refusal.retryable?503:400;res.status(status).json({error:'builder_error',data:{reason:refusal.reason,retryable:refusal.retryable}});}}
 @Post('transactions/swap-build') async swap(@Req()req:any,@Res()res:any){await this.handle(req,res,swap,input=>transactionBuilder().buildSwap(input));}
 @Post('transactions/creator-fees') async creator(@Req()req:any,@Res()res:any){await this.handle(req,res,fees,input=>transactionBuilder().buildCreatorFees(input));}
 @Post('transactions/creator-fees/vault') async vault(@Req()req:any,@Res()res:any){await this.handle(req,res,vault,input=>transactionBuilder().buildCreatorVault(input));}
 @Post('transactions/send') async send(@Req()req:any,@Res()res:any){await this.handle(req,res,send,(input,wallet)=>transactionBuilder().sendStored({...input,user:wallet}));}
}
@Module({controllers:[TransactionController]})class TransactionModule{}
transactionBuilder();const app=await NestFactory.create(TransactionModule,{logger:false,bodyParser:false});const express=(await import('express')).default;app.use(express.json({limit:integer('BODY_LIMIT_BYTES')}));const origins=required('ALLOWED_ORIGINS').split(',');app.enableCors({origin:(origin:string|undefined,callback:(error:Error|null,allow?:boolean)=>void)=>callback(null,!origin||origins.includes(origin)),credentials:true});app.enableShutdownHooks();await app.listen(integer('TX_BUILDER_PORT'),required('BIND_HOST'));log('tx-builder','listening',{port:integer('TX_BUILDER_PORT')});}
main().catch(error=>{log('tx-builder','startup_failed',{reason:error instanceof Error&&/configuration|TX_|INTERNAL_/.test(error.message)?error.message:'Dependency initialization failed'});process.exitCode=1;});


