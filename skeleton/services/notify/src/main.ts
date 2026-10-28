import { createCipheriv,createDecipheriv,createHash,randomBytes,randomUUID } from 'node:crypto';
import { consumerOpts,createInbox,JSONCodec,type JetStreamSubscription } from 'nats';
import { z } from 'zod';
import { actor,refuse,startInternalService } from '@pump/internal-http';
import { dependencyFailure,integer,loadEnv,log,natsConnect,pg,required } from '@pump/runtime';
import { deviceBody,deviceParams,notificationQuery,receiptBody } from './contracts';
import { LocalPushAdapter } from './providers';
let startupDependency='configuration',startupOperation='validate';
async function main():Promise<void>{
  loadEnv();if(required('NOTIFY_PUSH_ADAPTER')!=='local')throw new Error('NOTIFY_PUSH_ADAPTER must be local until an external provider is implemented');
  const key=Buffer.from(required('NOTIFY_TOKEN_ENCRYPTION_KEY'),'base64');if(key.length!==32)throw new Error('NOTIFY_TOKEN_ENCRYPTION_KEY must encode 32 bytes');
  for(const name of ['NOTIFY_MAX_DEVICES','NOTIFY_MAX_TOKEN_BYTES','NOTIFY_PAGE_LIMIT','NOTIFY_POLL_MS','NOTIFY_BATCH_SIZE','NOTIFY_MAX_ATTEMPTS','NOTIFY_RETRY_MS'])if(integer(name)<1)throw new Error(`${name} must be positive`);
  const encrypt=(token:string):Buffer=>{const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);const bytes=Buffer.concat([cipher.update(token,'utf8'),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),bytes]);};
  const decrypt=(bytes:Buffer):string=>{const decipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(0,12));decipher.setAuthTag(bytes.subarray(12,28));return Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]).toString('utf8');};
  startupDependency='nats';startupOperation='connect';
  const nc=await natsConnect('notify'),codec=JSONCodec(),push=new LocalPushAdapter();
  const subscriptions:JetStreamSubscription[]=[];let healthy=true,busy=false;
  async function consume():Promise<void>{
    for(const [family,durable] of [['dm.user.*','notify-dm'],['followingFeed.user.*','notify-following'],['alertsFeed.user.*.*','notify-alerts']]){
      const options=consumerOpts();options.bindStream('COMMUNITIES_EVENTS');options.durable(durable);options.deliverAll();options.manualAck();options.ackExplicit();options.deliverTo(createInbox('_INBOX.notify'));
      startupOperation=`jetstream.consumer.subscribe.COMMUNITIES_EVENTS.${durable}`;
      const subscription=await nc.jetstream().subscribe(family,options);subscriptions.push(subscription);
      void(async()=>{for await(const message of subscription){
        try{
          const userId=message.subject.split('.')[2];z.uuid().parse(userId);
          const payload=JSON.parse(new TextDecoder().decode(message.data));
          if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('Invalid activity event');
          const eventId=typeof payload.id==='string'?z.string().min(1).max(200).parse(payload.id):String(message.info.streamSequence);
          const kind=typeof payload.type==='string'?z.string().min(1).max(100).parse(payload.type):message.subject.split('.')[0];
          const sourceKey=createHash('sha256').update(eventId+':'+userId+':'+kind).digest('hex');
          const client=await pg().connect();
          try{await client.query('BEGIN');
            const user=(await client.query('SELECT id FROM users WHERE id=$1 AND banned_at IS NULL',[userId])).rows[0];
            if(user){const inserted=(await client.query('INSERT INTO notifications(id,user_id,source_key,kind,payload) VALUES($1,$2,$3,$4,$5::jsonb) ON CONFLICT(source_key) DO NOTHING RETURNING id',[randomUUID(),userId,sourceKey,kind,JSON.stringify(payload)])).rows[0];
              if(inserted)await client.query("INSERT INTO notification_deliveries(notification_id,device_id,user_id,status) SELECT $1,device_id,user_id,'pending' FROM notification_devices WHERE user_id=$2 AND active=true ON CONFLICT DO NOTHING",[inserted.id,userId]);}
            await client.query('COMMIT');message.ack();
          }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
        }catch(error){if(error instanceof z.ZodError||error instanceof SyntaxError)message.term();else message.nak(integer('NOTIFY_RETRY_MS'));log('notify','event_retry');}
      }healthy=false;})().catch(()=>{healthy=false;log('notify','consumer_stopped');});
    }
  }
  async function deliver():Promise<void>{
    if(busy)return;busy=true;const client=await pg().connect();
    try{await client.query('BEGIN');
      const inApp=(await client.query('SELECT id,user_id,kind,created_at FROM notifications WHERE in_app_published_at IS NULL ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT $1',[integer('NOTIFY_BATCH_SIZE')])).rows;
      for(const notification of inApp){nc.publish(`notifications.user.${notification.user_id}`,codec.encode({id:notification.id,kind:notification.kind,createdAt:notification.created_at.toISOString()}));await nc.flush();await client.query('UPDATE notifications SET in_app_published_at=now() WHERE id=$1',[notification.id]);}
      const deliveries=(await client.query("SELECT d.*,n.payload,v.token_ciphertext,v.active FROM notification_deliveries d JOIN notifications n ON n.id=d.notification_id JOIN notification_devices v ON v.user_id=d.user_id AND v.device_id=d.device_id WHERE d.status='pending' AND d.next_attempt_at<=now() ORDER BY d.next_attempt_at FOR UPDATE OF d SKIP LOCKED LIMIT $1",[integer('NOTIFY_BATCH_SIZE')])).rows;
      for(const delivery of deliveries){
        if(!delivery.active){await client.query("UPDATE notification_deliveries SET status='failed' WHERE notification_id=$1 AND device_id=$2",[delivery.notification_id,delivery.device_id]);continue;}
        try{const receipt=await push.send({notificationId:delivery.notification_id,deviceId:delivery.device_id,token:decrypt(delivery.token_ciphertext),payload:delivery.payload});await client.query("UPDATE notification_deliveries SET status='delivered',attempts=attempts+1,delivered_at=now(),provider_ref=$3 WHERE notification_id=$1 AND device_id=$2",[delivery.notification_id,delivery.device_id,receipt]);}
        catch{const attempts=delivery.attempts+1;await client.query("UPDATE notification_deliveries SET attempts=$3,status=$4,next_attempt_at=now()+$5::bigint*interval '1 millisecond' WHERE notification_id=$1 AND device_id=$2",[delivery.notification_id,delivery.device_id,attempts,attempts>=integer('NOTIFY_MAX_ATTEMPTS')?'failed':'pending',integer('NOTIFY_RETRY_MS')]);}
      }
      await client.query('COMMIT');
    }catch{await client.query('ROLLBACK');log('notify','delivery_retry');}finally{client.release();busy=false;}
  }
  await consume();
  startupDependency='http';startupOperation='bind';
  const service=await startInternalService('notify','NOTIFY_PORT',[
    {method:'PUT',path:'/v1/device-tokens',actor:true,body:deviceBody,handle:async({body},ctx)=>{
      if(Buffer.byteLength(body.token)>integer('NOTIFY_MAX_TOKEN_BYTES'))refuse('INVALID_ARGUMENT',400);
      const who=actor(ctx),client=await pg().connect();try{await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`notify:${who.userId}`]);
        const count=(await client.query('SELECT count(*)::int AS count FROM notification_devices WHERE user_id=$1 AND active=true AND device_id<>$2',[who.userId,body.deviceId])).rows[0].count;if(count>=integer('NOTIFY_MAX_DEVICES'))refuse('RATE_LIMITED',429);
        await client.query('INSERT INTO notification_devices(user_id,device_id,platform,token_ciphertext,token_hash) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id,device_id) DO UPDATE SET platform=EXCLUDED.platform,token_ciphertext=EXCLUDED.token_ciphertext,token_hash=EXCLUDED.token_hash,active=true,updated_at=now()',[who.userId,body.deviceId,body.platform,encrypt(body.token),createHash('sha256').update(body.token).digest()]);await client.query('COMMIT');return {deviceId:body.deviceId,platform:body.platform,active:true};
      }catch(error:any){await client.query('ROLLBACK');if(error.code==='23505')refuse('IDEMPOTENCY_CONFLICT',409);throw error;}finally{client.release();}
    }},
    {method:'DELETE',path:'/v1/device-tokens/:deviceId',actor:true,params:deviceParams,handle:async({params},ctx)=>{await pg().query('UPDATE notification_devices SET active=false,updated_at=now() WHERE user_id=$1 AND device_id=$2',[actor(ctx).userId,params.deviceId]);return {deviceId:params.deviceId,active:false};}},
    {method:'POST',path:'/notifications/confirm-delivery',actor:true,body:receiptBody,handle:async({body},ctx)=>{const who=actor(ctx);const result=await pg().query('INSERT INTO notification_receipts(notification_id,user_id,device_id) SELECT n.id,n.user_id,$3 FROM notifications n JOIN notification_devices d ON d.user_id=n.user_id AND d.device_id=$3 WHERE n.id=$1 AND n.user_id=$2 ON CONFLICT DO NOTHING',[body.notificationId,who.userId,body.deviceId]);if(!result.rowCount&&!(await pg().query('SELECT 1 FROM notification_receipts WHERE notification_id=$1 AND user_id=$2 AND device_id=$3',[body.notificationId,who.userId,body.deviceId])).rowCount)refuse('NOT_FOUND',404);return {confirmed:true};}},
    {method:'GET',path:'/notifications',actor:true,query:notificationQuery,handle:async({query},ctx)=>{const limit=query.limit??integer('NOTIFY_PAGE_LIMIT');if(limit>integer('NOTIFY_PAGE_LIMIT'))refuse('INVALID_ARGUMENT',400);let cursor:{time:string;id:string}|null=null;if(query.cursor){try{cursor=z.object({time:z.string(),id:z.uuid()}).parse(JSON.parse(Buffer.from(query.cursor,'base64url').toString('utf8')));}catch{refuse('INVALID_ARGUMENT',400);}}const rows=(await pg().query('SELECT *,created_at::text AS created_cursor FROM notifications WHERE user_id=$1 AND ($2::timestamptz IS NULL OR (created_at,id)<($2::timestamptz,$3::uuid)) ORDER BY created_at DESC,id DESC LIMIT $4',[actor(ctx).userId,cursor?.time??null,cursor?.id??null,limit+1])).rows;const tail=rows[Math.min(rows.length,limit)-1];return {items:rows.slice(0,limit).map(x=>({id:x.id,kind:x.kind,payload:x.payload,createdAt:x.created_at.toISOString()})),nextCursor:rows.length>limit?Buffer.from(JSON.stringify({time:tail.created_cursor,id:tail.id})).toString('base64url'):''};}},
  ],async()=>{await pg().query('SELECT 1');await nc.flush();if(!healthy)refuse('UPSTREAM_UNAVAILABLE',503);return {status:'ok',pushAdapter:'local'};});
  const timer=setInterval(()=>void deliver(),integer('NOTIFY_POLL_MS'));
  const stop=():void=>{clearInterval(timer);subscriptions.forEach(x=>x.unsubscribe());void service.close().then(()=>nc.drain()).then(()=>pg().end());};process.once('SIGINT',stop);process.once('SIGTERM',stop);
}
main().catch(error=>{log('notify','startup_failed',{dependency:startupDependency,operation:startupOperation,reason:startupDependency==='configuration'&&error instanceof Error?error.message:dependencyFailure(error)});process.exitCode=1;});