import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import type { IncomingMessage } from 'node:http';
import * as grpc from '@grpc/grpc-js';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { WebSocket, WebSocketServer } from 'ws';
import { getProtoRoot, loadPackage } from '@pump/proto';
import { integer, loadEnv, log, pg, required } from '@pump/runtime';

loadEnv();
// Observed limits: reconstruction/data-pipeline.md (uapi stream protocol).
const TOPIC_LIMIT = 64;
const REQUEST_LIMIT = 32;
const QUEUE_LIMIT = 256;
const STALE_MS = 15000;
const IDLE_MS = 10000;
const HIDDEN_GRACE_MS = 15000;
const PARTS = ['PART_UNSPECIFIED','MARKET','PHASE','META','POSITION','HOLDERS','MARKS','CANDLES'];
interface Sub {
  coin?: { chain: string; address: string; parts?: (string | number)[]; commitment?: string; candles?: { res: string; measure: string }[] };
  wallet?: { wallet: string; chain?: string };
  list?: { list: string };
}
interface Feed { call: grpc.ClientReadableStream<any>; queue: any[]; seq: bigint; lastAt: number; private: boolean; }
function parts(sub: Sub): string[] { return (sub.coin?.parts?.length ? sub.coin.parts : ['MARKET','PHASE','META']).map(part => typeof part === 'number' ? PARTS[part] ?? 'PART_UNSPECIFIED' : part); }
function topicKey(sub: Sub): string {
  if (sub.coin) {
    const c = sub.coin;
    return `coin/${encodeURIComponent(c.chain)}/${c.address}/${c.commitment || 'PROCESSED'}/${parts(sub).sort().join(',')}/${(c.candles ?? []).map(item => `${item.res}:${item.measure}`).sort().join(',')}`;
  }
  if (sub.wallet) return `wallet/${encodeURIComponent(sub.wallet.chain || '')}/${sub.wallet.wallet}`;
  if (sub.list) return `list/${sub.list.list}`;
  throw new Error('Topic required');
}
function bearer(req: IncomingMessage): string | undefined {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith('Bearer ')) return authorization;
  const token = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith('auth_token='))?.slice(11);
  return token ? `Bearer ${decodeURIComponent(token)}` : undefined;
}
async function verifySession(token?: string): Promise<{wallet: string; expires: number}> {
  if (!token) throw new Error('Session required');
  const claims = jwt.verify(token.slice(7), required('SESSION_JWT_SECRET'), { algorithms: ['HS256'], issuer: required('SESSION_JWT_ISSUER'), audience: required('SESSION_JWT_AUDIENCE') });
  if (typeof claims === 'string' || typeof claims.wallet !== 'string' || !claims.sub || !claims.jti || !claims.exp) throw new Error('Invalid session');
  const rows = await pg().query('SELECT 1 FROM sessions WHERE jti=$1 AND user_id=$2 AND wallet=$3 AND revoked_at IS NULL AND expires_at>now()', [claims.jti, claims.sub, claims.wallet]);
  if (!rows.rowCount) throw new Error('Session revoked');
  return {wallet:claims.wallet,expires:claims.exp * 1000};
}
function normalize(sub: Sub): Sub {
  if ([sub.coin,sub.wallet,sub.list].filter(Boolean).length !== 1) throw new Error('Exactly one topic is required');
  const text = (value: unknown): boolean => typeof value === 'string' && value.length > 0;
  if (sub.coin) {
    const c = sub.coin;
    if (!text(c.chain) || !text(c.address)) throw new Error('Invalid coin topic');
    c.commitment = c.commitment === 'COMMITMENT_UNSPECIFIED' || !c.commitment ? 'PROCESSED' : c.commitment;
    if (!['PROCESSED','CONFIRMED'].includes(c.commitment)) throw new Error('Invalid commitment');
    c.parts = [...new Set(parts(sub))].sort();
    if (c.parts.some(part => !PARTS.slice(1).includes(String(part)))) throw new Error('Invalid part');
    if ((c.candles?.length ?? 0) > integer('STREAM_MAX_CANDLE_SPECS')) throw new Error('Too many candle specs');
    for (const spec of c.candles ?? []) if (!/^\d+[smhd]$/.test(spec.res) || !['price_usd','mcap_usd'].includes(spec.measure)) throw new Error('Invalid candle spec');
    if (c.parts.includes('CANDLES') && !c.candles?.length) throw new Error('CANDLES needs at least one candle spec');
  }
  if (sub.wallet && (!text(sub.wallet.wallet) || (sub.wallet.chain && !text(sub.wallet.chain)))) throw new Error('Invalid wallet topic');
  if (sub.list && sub.list.list !== 'all') throw new Error('Only the all list is available');
  return sub;
}
async function main(): Promise<void> {
  const origins = new Set(required('ALLOWED_ORIGINS').split(',').map(origin => origin.trim()).filter(Boolean));
  const heartbeatMs = integer('TRADING_HEARTBEAT_MS');
  if (heartbeatMs <= 0 || heartbeatMs >= STALE_MS) throw new Error('TRADING_HEARTBEAT_MS must be below the stale watchdog');
  const proto = await getProtoRoot();
  const WatchRequest = proto.lookupType('trading.v1.WatchRequest');
  const Frame = proto.lookupType('trading.v1.Frame');
  const api = loadPackage('trading.v1');
  const client = new api.TradeApi(required('TRADING_GRPC_URL'), grpc.credentials.createInsecure());
  const health = (_req: IncomingMessage, response: http.ServerResponse): void => {
    if (_req.url !== '/health') { response.writeHead(404); response.end(); return; }
    client.Health({}, { deadline: Date.now()+integer('UPSTREAM_TIMEOUT_MS') }, (error: Error | null) => {
      response.writeHead(error ? 503 : 200, { 'content-type': 'application/json' }); response.end(JSON.stringify({status:error?'degraded':'ok'}));
    });
  };
  const certificate = process.env.STREAM_TLS_CERT_PATH;
  const key = process.env.STREAM_TLS_KEY_PATH;
  if (Boolean(certificate) !== Boolean(key)) throw new Error('Configure both STREAM_TLS_CERT_PATH and STREAM_TLS_KEY_PATH');
  const server = certificate && key ? https.createServer({cert:fs.readFileSync(certificate),key:fs.readFileSync(key)},health) : http.createServer(health);
  const sockets = new WebSocketServer({ noServer: true, maxPayload:integer('STREAM_MAX_PAYLOAD_BYTES'), handleProtocols: protocols => protocols.has('pumpfun.trading.v1') ? 'pumpfun.trading.v1' : false });
  server.on('upgrade', (request,socket,head) => {
    if (!String(request.headers['sec-websocket-protocol'] ?? '').split(',').map(value => value.trim()).includes('pumpfun.trading.v1')) { socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'); return; }
    if (request.url !== '/stream') { socket.end('HTTP/1.1 404 Not Found\r\n\r\n'); return; }
    if (request.headers.origin && !origins.has(request.headers.origin)) { socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return; }
    sockets.handleUpgrade(request,socket,head,ws => sockets.emit('connection',ws,request));
  });
  sockets.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    const feeds = new Map<string,Feed>();
    let closed = false; let sending = false; let idleSince = Date.now(); let hidden = false; let lastPong = Date.now();
    let privateExpires = Infinity; let checkingSession = false;
    let processing = Promise.resolve();
    let queuedRequests = 0;
    let authorization: string | undefined;
    try { authorization = bearer(request); } catch { ws.close(1008,'Invalid session cookie'); return; }
    const close = (code: number, reason: string): void => { if (!closed) ws.close(code,reason); };
    const flush = (): void => {
      if (sending || closed || ws.readyState !== WebSocket.OPEN) return;
      for (const feed of feeds.values()) {
        const frame = feed.queue.shift(); if (!frame) continue;
        sending = true;
        const message = Frame.fromObject(frame);
        ws.send(Frame.encode(message).finish(),{binary:true},error => { sending=false; if(error) close(1011,'Stream transport failed'); else flush(); });
        return;
      }
    };
    const enqueue = (feed: Feed, frame: any): void => {
      frame.seq = (++feed.seq).toString();
      if (feed.queue.length >= QUEUE_LIMIT) {
        feed.queue.length = 0;
        frame.gap = true;
        log('stream-gateway','gap');
      }
      feed.queue.push(frame); flush();
    };
    ws.on('pong',() => { lastPong=Date.now(); });
    ws.on('message',(data,isBinary) => {
      if (!isBinary) { close(1003,'Binary protobuf is required'); return; }
      if (++queuedRequests > integer('STREAM_MAX_PENDING_REQUESTS')) { close(1008,'Too many pending watch requests'); return; }
      const copy = Buffer.from(data as Buffer);
      processing=processing.then(async () => {
        try {
          const message = WatchRequest.toObject(WatchRequest.decode(copy),{enums:String,longs:String,defaults:true,oneofs:true}) as {subscribe:Sub[];unsubscribe:string[];hidden:boolean};
          if (message.subscribe.length>REQUEST_LIMIT || message.unsubscribe.length>TOPIC_LIMIT) { log('stream-gateway','topics_capped'); close(1008,'Watch request limit exceeded'); return; }
          const subscriptions=message.subscribe.map(normalize);
          const resulting=new Set([...feeds.keys()].filter(topic => !message.unsubscribe.includes(topic)));
          for(const sub of subscriptions) resulting.add(topicKey(sub));
          if(resulting.size>TOPIC_LIMIT) { log('stream-gateway','topics_capped'); close(1008,'Topic limit exceeded'); return; }
          const needsSession=subscriptions.some(sub => sub.wallet || parts(sub).includes('POSITION'));
          const session=needsSession ? await verifySession(authorization) : undefined;
          if(session) privateExpires=Math.min(privateExpires,session.expires);
          for(const sub of subscriptions) if(sub.wallet && sub.wallet.wallet!==session?.wallet) throw new Error('Wallet is outside the session');
          hidden=message.hidden;
          for(const topic of message.unsubscribe) { const feed=feeds.get(topic); feeds.delete(topic); feed?.call.cancel(); }
          for(const sub of subscriptions) {
            const topic=topicKey(sub); if(feeds.has(topic)) continue;
            const metadata=new grpc.Metadata();
            if(authorization && (sub.wallet || parts(sub).includes('POSITION'))) metadata.set('authorization',authorization);
            const call=client.Watch({subscribe:[sub]},metadata) as grpc.ClientReadableStream<any>;
            const feed:Feed={call,queue:[],seq:0n,lastAt:Date.now(),private:Boolean(sub.wallet || parts(sub).includes('POSITION'))}; feeds.set(topic,feed);
            call.on('data',(frame:any) => { if(!closed && feeds.get(topic)===feed) { feed.lastAt=Date.now(); enqueue(feed,{...frame,topic}); } });
            call.on('error',(error:grpc.ServiceError) => { if(!closed && feeds.get(topic)===feed && error.code!==grpc.status.CANCELLED) close(1011,'Trading stream unavailable'); });
            call.on('end',() => { if(!closed && feeds.get(topic)===feed) close(1011,'Trading stream ended'); });
          }
          if(!feeds.size) idleSince=Date.now();
        } catch { close(1008,'Invalid watch request or session'); }
        finally { queuedRequests--; }
      }).catch(() => close(1011,'Watch handling failed'));
    });
    const timer=setInterval(() => {
      const now=Date.now(); const grace=hidden?HIDDEN_GRACE_MS:0;
      const hasPrivate=[...feeds.values()].some(feed=>feed.private);
      if(hasPrivate && !checkingSession) { checkingSession=true; verifySession(authorization).catch(()=>close(1008,'Session revoked')).finally(()=>{checkingSession=false;}); }
      if(hasPrivate && privateExpires<=now) { close(1008,'Session expired'); return; }
      if(!feeds.size && now-idleSince>IDLE_MS+grace) { close(1000,'Idle'); return; }
      if(now-lastPong>STALE_MS+grace || [...feeds.values()].some(feed=>now-feed.lastAt>STALE_MS+grace)) { log('stream-gateway','stale_close'); close(1011,'Stale stream'); return; }
      if(ws.readyState===WebSocket.OPEN) ws.ping();
    },heartbeatMs);
    ws.once('close',() => { closed=true; clearInterval(timer); for(const feed of feeds.values()) feed.call.cancel(); feeds.clear(); log('stream-gateway','close'); });
    ws.on('error',() => close(1011,'Socket failed'));
    log('stream-gateway','open');
  });
  const port=integer('STREAM_PORT');
  await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(port,required('BIND_HOST'),resolve);});
  log('stream-gateway','listening',{port,tls:Boolean(certificate)});
  const stop=():void=>{for(const ws of sockets.clients) ws.close(1001,'Server stopping');sockets.close();server.close(()=>{client.close();pg().end().finally(()=>process.exit(0));});};
  process.once('SIGINT',stop);process.once('SIGTERM',stop);
}
main().catch(error=>{log('stream-gateway','startup_failed',{reason:error instanceof Error && /configuration|STREAM_|SESSION_|TRADING_/.test(error.message)?error.message:'Dependency startup failed'});process.exitCode=1;});




