import { redis, integer } from '@pump/runtime';
import { type ErrorCode } from '@pump/http';
import { fail } from './errors';
const bucketScript=`
local count=redis.call('INCR',KEYS[1])
if count==1 then redis.call('PEXPIRE',KEYS[1],ARGV[2]) end
if count>tonumber(ARGV[1]) then return redis.call('PTTL',KEYS[1]) end
return 0`;
export async function bucket(key:string,limit:number,windowMs:number,code:ErrorCode='RATE_LIMITED'):Promise<void>{
  const client=await redis();
  const delay=Number(await client.eval(bucketScript,{keys:[key],arguments:[String(limit),String(windowMs)]}));
  if(delay>0)fail(code,{retryAfterMs:delay});
}
// One atomic token-bucket + daily reservation: refusal consumes neither daily nor burst budget.
const keyedScript=`
local tm=redis.call('TIME')
local now=tonumber(tm[1])*1000+math.floor(tonumber(tm[2])/1000)
local cap=tonumber(ARGV[1]);local window=tonumber(ARGV[2]);local daily=tonumber(ARGV[3])
local old=redis.call('HMGET',KEYS[1],'tokens','last')
local tokens=tonumber(old[1]) or cap;local last=tonumber(old[2]) or now
tokens=math.min(cap,tokens+(now-last)*cap/window)
local used=tonumber(redis.call('GET',KEYS[2])) or 0
if daily==0 or used>=daily then return {2,tonumber(ARGV[4])} end
if tokens<1 then return {1,math.ceil((1-tokens)*window/cap)} end
redis.call('HSET',KEYS[1],'tokens',tokens-1,'last',now)
redis.call('PEXPIRE',KEYS[1],math.ceil(window*2))
redis.call('INCR',KEYS[2]);redis.call('PEXPIRE',KEYS[2],ARGV[4])
return {0,0}`;
export async function keyBuckets(id:string,burst:number,dailyLimit:number):Promise<void>{
  const client=await redis(),now=new Date();
  const until=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1)-now.getTime();
  const result=await client.eval(keyedScript,{keys:[`api:burst:${id}`,`api:daily:${id}:${now.toISOString().slice(0,10)}`],arguments:[String(burst),String(integer('API_KEY_BURST_WINDOW_MS')),String(dailyLimit),String(until)]}) as number[];
  if(Number(result[0])!==0)fail('API_KEY_RATE_LIMITED',{retryAfterMs:Number(result[1])});
}
