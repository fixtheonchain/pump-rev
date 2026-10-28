import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { integer } from '@pump/runtime';

const PREFIX='pf_live_';
function checksum(payload:string):string {return createHash('sha256').update(PREFIX+payload).digest('hex').slice(0,integer('API_KEY_CHECKSUM_HEX_LENGTH'));}
export function validateKeyConfiguration():void {
  if(integer('API_KEY_PAYLOAD_BYTES')<16) throw new Error('API_KEY_PAYLOAD_BYTES must be at least 16');
  const length=integer('API_KEY_CHECKSUM_HEX_LENGTH');
  if(length<8 || length>64)throw new Error('API_KEY_CHECKSUM_HEX_LENGTH must be 8..64');
}
export function issueKey():string {
  validateKeyConfiguration();
  const payload=randomBytes(integer('API_KEY_PAYLOAD_BYTES')).toString('hex');
  return PREFIX+payload+'_'+checksum(payload);
}
/** Observed prefix; local configurable hex payload + SHA-256 checksum, not a recovered production algorithm. */
export function validKey(key:string):boolean {
  const size=integer('API_KEY_PAYLOAD_BYTES')*2, checkSize=integer('API_KEY_CHECKSUM_HEX_LENGTH');
  if(key.length!==PREFIX.length+size+1+checkSize || !key.startsWith(PREFIX)) return false;
  const payload=key.slice(PREFIX.length,PREFIX.length+size), check=key.slice(PREFIX.length+size+1);
  if(key[PREFIX.length+size]!=='_' || !/^[0-9a-f]+$/.test(payload+check))return false;
  return timingSafeEqual(Buffer.from(check),Buffer.from(checksum(payload)));
}
export function hashKey(key:string):Buffer {return createHash('sha256').update(key).digest();}
