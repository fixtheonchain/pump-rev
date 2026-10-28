import { createHash, timingSafeEqual } from 'node:crypto';
import { pg, required } from '@pump/runtime';
import { fail } from './errors';
export interface IdentityAdapter { verify(token:string):Promise<{wallet:string}>; }
export class LocalIdentityAdapter implements IdentityAdapter {
  async verify(token:string):Promise<{wallet:string}> {
    const expected=createHash('sha256').update(required('LOCAL_IDENTITY_TOKEN')).digest();
    const actual=createHash('sha256').update(token).digest();
    const moneyToken=process.env.LOCAL_MONEY_IDENTITY_TOKEN;
    if(moneyToken && timingSafeEqual(createHash('sha256').update(moneyToken).digest(),actual))return {wallet:required('LOCAL_MONEY_IDENTITY_WALLET')};
    if(!timingSafeEqual(expected,actual))fail('UNAUTHENTICATED');
    return {wallet:required('LOCAL_IDENTITY_WALLET')};
  }
}
export class PrivyIdentityAdapter implements IdentityAdapter {
  private verifier?:Promise<{verify:(token:string)=>Promise<string|undefined>}>;
  constructor(){required('PRIVY_APP_ID');required('PRIVY_JWKS_URL');}
  async verify(token:string):Promise<{wallet:string}>{
    this.verifier ??= import('jose').then(jose=>{
      const keys=jose.createRemoteJWKSet(new URL(required('PRIVY_JWKS_URL')));
      return {verify:async(token:string)=>(await jose.jwtVerify(token,keys,{issuer:'privy.io',audience:required('PRIVY_APP_ID'),algorithms:['ES256']})).payload.sub};
    });
    let subject:string|undefined;
    try{subject=await (await this.verifier).verify(token);}catch{fail('UNAUTHENTICATED');}
    if(!subject)fail('UNAUTHENTICATED');
    const result=await pg().query('SELECT wallet FROM external_identities WHERE provider=$1 AND subject=$2',['privy',subject]);
    if(!result.rowCount)fail('ACCOUNT_NOT_FOUND');
    return {wallet:result.rows[0].wallet};
  }
}
export function identityAdapter():IdentityAdapter {
  switch(required('IDENTITY_ADAPTER')){
    case 'local':required('LOCAL_IDENTITY_TOKEN');required('LOCAL_IDENTITY_WALLET');return new LocalIdentityAdapter();
    case 'privy':return new PrivyIdentityAdapter();
    default:throw new Error('IDENTITY_ADAPTER must be local or privy');
  }
}
