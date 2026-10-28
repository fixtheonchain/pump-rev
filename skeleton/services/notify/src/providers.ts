import { createHash } from 'node:crypto';
import { log } from '@pump/runtime';
export interface PushAdapter { send(input:{notificationId:string;deviceId:string;token:string;payload:unknown}):Promise<string>; }
export class LocalPushAdapter implements PushAdapter {
  async send(input:{notificationId:string;deviceId:string;token:string;payload:unknown}):Promise<string>{
    // Never log device tokens or notification payloads; the fake performs no external delivery.
    log('notify','local_delivery',{notificationId:input.notificationId});
    return 'local:'+createHash('sha256').update(input.notificationId+':'+input.deviceId).digest('hex');
  }
}