import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import { type ApiScope } from '@pump/http';
import { integer, pg, required } from '@pump/runtime';
import { fail } from './errors';
import { hashKey, validKey } from './keys';
import { bucket, keyBuckets } from './rates';

export type Session={sub:string;wallet:string;jti:string};
export function cookieToken(req:Request):string|undefined {
  const cookies=(req.headers.cookie ?? '').split(';').map(value=>value.trim());
  const token=cookies.find(value=>value.startsWith('auth_token='))?.slice('auth_token='.length);
  if(!token)return undefined;
  try{return decodeURIComponent(token);}catch{fail('UNAUTHENTICATED');}
}
export async function sessionAuth(req:Request,requiredSession:boolean):Promise<Session|undefined>{
  const authorization=req.headers.authorization, cookie=cookieToken(req);
  if(req.headers['x-api-key'] || authorization?.startsWith('Bearer pf_live_'))fail('API_CREDENTIAL_NOT_ALLOWED');
  if(authorization && !authorization.startsWith('Bearer '))fail('UNAUTHENTICATED');
  const bearer=authorization?.slice(7);
  if(cookie && bearer && cookie!==bearer)fail('API_CREDENTIAL_NOT_ALLOWED');
  const token=bearer ?? cookie;
  if(!token){if(requiredSession)fail('UNAUTHENTICATED');return undefined;}
  let claims:Session;
  try{
    const value=jwt.verify(token,required('SESSION_JWT_SECRET'),{algorithms:['HS256'],issuer:required('SESSION_JWT_ISSUER'),audience:required('SESSION_JWT_AUDIENCE')});
    if(typeof value==='string' || typeof value.sub!=='string' || typeof value.wallet!=='string' || typeof value.jti!=='string')fail('UNAUTHENTICATED');
    claims={sub:value.sub,wallet:value.wallet,jti:value.jti};
  }catch{fail('UNAUTHENTICATED');}
  const valid=await pg().query('SELECT 1 FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.jti=$1 AND s.user_id=$2 AND s.wallet=$3 AND s.revoked_at IS NULL AND s.expires_at>now() AND u.banned_at IS NULL',[claims.jti,claims.sub,claims.wallet]);
  if(!valid.rowCount)fail('UNAUTHENTICATED');
  if(cookie && !bearer && !['GET','HEAD','OPTIONS'].includes(req.method) && !req.headers.origin)fail('FORBIDDEN');
  return claims;
}
export async function keyAuth(req:Request,scope:ApiScope|undefined):Promise<void>{
  if(cookieToken(req))fail('API_CREDENTIAL_NOT_ALLOWED');
  const authorization=req.headers.authorization,header=req.headers['x-api-key'];
  if(authorization && !authorization.startsWith('Bearer pf_live_'))fail('API_CREDENTIAL_NOT_ALLOWED');
  if(Array.isArray(header))fail('API_KEY_INVALID');
  const bearer=authorization?.slice(7),key=header ?? bearer;
  if(header && bearer && header!==bearer)fail('API_CREDENTIAL_NOT_ALLOWED');
  const ip=req.ip ?? req.socket.remoteAddress ?? 'unknown';
  await bucket(`api:lookup:${ip}`,integer('API_IP_LOOKUP_LIMIT'),integer('API_IP_WINDOW_MS'),'API_KEY_RATE_LIMITED');
  // This stand-in is environment-backed. Do not trust client-provided country headers.
  if(required('API_REGION_ALLOWED')!=='true')fail('API_REGION_RESTRICTED');
  if(!key || !validKey(key)) {
    await bucket(`api:failed:${ip}`,integer('API_FAILED_AUTH_LIMIT'),integer('API_IP_WINDOW_MS'),'API_KEY_RATE_LIMITED');
    fail('API_KEY_INVALID');
  }
  const result=await pg().query(`SELECT k.*,o.status AS org_status FROM api_keys k JOIN api_orgs o ON o.id=k.org_id WHERE k.hash=$1`,[hashKey(key)]);
  if(!result.rowCount){await bucket(`api:failed:${ip}`,integer('API_FAILED_AUTH_LIMIT'),integer('API_IP_WINDOW_MS'),'API_KEY_RATE_LIMITED');fail('API_KEY_INVALID');}
  const record=result.rows[0];
  if(record.status==='revoked' || (record.status==='rotating' && (!record.grace_until || new Date(record.grace_until)<=new Date())))fail('API_KEY_REVOKED');
  if(record.org_status==='suspended')fail('API_ORG_SUSPENDED');
  if(record.org_status!=='approved')fail('API_ORG_NOT_APPROVED');
  if(!scope)fail('API_SCOPE_FORBIDDEN');
  if(!record.scopes.includes(scope))fail('API_SCOPE_FORBIDDEN');
  await keyBuckets(record.id,record.burst,record.daily_limit);
  await pg().query('UPDATE api_keys SET last_used_at=now() WHERE id=$1',[record.id]);
}
