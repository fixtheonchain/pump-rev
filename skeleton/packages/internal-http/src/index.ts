import 'reflect-metadata';
import { createHash, timingSafeEqual } from 'node:crypto';
import express, { type Request, type Response } from 'express';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import { integer, log, pg, required } from '@pump/runtime';

export interface InternalContext { userId?: string; wallet?: string; }
export interface InternalRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; path: string; actor?: boolean;
  params?: z.ZodType; query?: z.ZodType; body?: z.ZodType;
  handle(input: { params: any; query: any; body: any }, context: InternalContext): Promise<unknown>;
}
export class ServiceError extends Error {
  constructor(readonly code: string, readonly status: number, message: string = code) { super(message); }
}
export function refuse(code: string, status: number, message?: string): never { throw new ServiceError(code, status, message); }
export function actor(context: InternalContext): { userId: string; wallet: string } {
  if (!context.userId || !context.wallet) refuse('UNAUTHENTICATED', 401);
  return { userId: context.userId, wallet: context.wallet };
}
function stable(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value !== null && typeof value === 'object') return '{' + Object.entries(value).filter(([,v]) => v !== undefined).sort(([a],[b]) => a.localeCompare(b)).map(([key,v]) => JSON.stringify(key) + ':' + stable(v)).join(',') + '}';
  return JSON.stringify(value);
}
export async function idempotent<T>(domain: string, owner: string, requestId: string, payload: unknown, work: (client: PoolClient) => Promise<T>): Promise<T> {
  z.string().min(1).max(200).parse(requestId);
  const hash = createHash('sha256').update(stable(payload)).digest('hex');
  const client = await pg().connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [`${domain}:${owner}:${requestId}`]);
    const prior = (await client.query('SELECT request_hash,response FROM domain_idempotency WHERE domain=$1 AND actor=$2 AND request_id=$3', [domain,owner,requestId])).rows[0];
    if (prior) { if (prior.request_hash !== hash) refuse('IDEMPOTENCY_CONFLICT',409); await client.query('COMMIT'); return prior.response as T; }
    const result = await work(client);
    await client.query('INSERT INTO domain_idempotency(domain,actor,request_id,request_hash,response) VALUES($1,$2,$3,$4,$5::jsonb)', [domain,owner,requestId,hash,JSON.stringify(result)]);
    await client.query('COMMIT'); return result;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function startInternalService(name: string, portEnvironment: string, routes: InternalRoute[], health?: () => Promise<unknown>): Promise<{ close(): Promise<void> }> {
  const { Controller, Module, RequestMapping, RequestMethod, Req, Res } = await import('@nestjs/common');
  const { NestFactory } = await import('@nestjs/core');
  const secret = createHash('sha256').update(required('INTERNAL_SERVICE_TOKEN')).digest();
  function envelope(req: Request, res: Response, error: unknown): void {
    const fault = error instanceof ServiceError ? error : error instanceof z.ZodError ? new ServiceError('INVALID_ARGUMENT',400) : new ServiceError('INTERNAL',500);
    if (fault.status >= 500) log(name,'request_failed',{ code: fault.code });
    res.status(fault.status).json({ statusCode:fault.status,timestamp:new Date().toISOString(),path:req.path,error:fault.code,code:fault.code,message:fault.message });
  }
  async function context(req: Request): Promise<InternalContext> {
    const header = req.headers.authorization ?? '';
    if (!header.startsWith('Bearer ') || !timingSafeEqual(secret,createHash('sha256').update(header.slice(7)).digest())) refuse('UNAUTHENTICATED',401);
    const userId = req.headers['x-pump-user-id']; const wallet = req.headers['x-pump-wallet'];
    if ((userId === undefined) !== (wallet === undefined)) refuse('INVALID_ARGUMENT',400);
    if (userId === undefined) return {};
    const parsed = { userId:z.uuid().parse(userId),wallet:z.string().min(1).max(256).parse(wallet) };
    const valid = await pg().query('SELECT 1 FROM users u JOIN wallets w ON w.user_id=u.id WHERE u.id=$1 AND w.address=$2 AND u.banned_at IS NULL', [parsed.userId,parsed.wallet]);
    if (!valid.rowCount) refuse('FORBIDDEN',403);
    return parsed;
  }
  class ServiceController {}
  Controller()(ServiceController);
  const allRoutes: InternalRoute[] = [{method:'GET',path:'/health',handle:async()=>health ? health() : {status:'ok'}},...routes];
  for (const [index,route] of allRoutes.entries()) {
    const key = `route_${index}`;
    const handler = async (req: Request,res: Response): Promise<void> => {
      try {
        const ctx = req.path === '/health' ? {} : await context(req);
        if (route.actor) actor(ctx);
        const result = await route.handle({params:route.params?.parse(req.params) ?? req.params,query:route.query?.parse(req.query) ?? req.query,body:route.body?.parse(req.body) ?? req.body},ctx);
        res.status(200).json(result);
      } catch (error) { envelope(req,res,error); }
    };
    Object.defineProperty(ServiceController.prototype,key,{value:handler,writable:true});
    RequestMapping({path:route.path,method:RequestMethod[route.method]})(ServiceController.prototype,key,Object.getOwnPropertyDescriptor(ServiceController.prototype,key)!);
    Req()(ServiceController.prototype,key,0); Res()(ServiceController.prototype,key,1);
  }
  class ServiceModule {} Module({controllers:[ServiceController]})(ServiceModule);
  const app = await NestFactory.create(ServiceModule,{logger:false,bodyParser:false});
  app.use(express.json({limit:integer('BODY_LIMIT_BYTES')}));
  await app.init();
  const adapter = app.getHttpAdapter().getInstance();
  adapter.use((req:Request,res:Response)=>envelope(req,res,new ServiceError('NOT_FOUND',404)));
  adapter.use((_error:unknown,req:Request,res:Response,_next:unknown)=>envelope(req,res,new ServiceError('INVALID_ARGUMENT',400)));
  await app.listen(integer(portEnvironment),required('BIND_HOST'));
  log(name,'listening',{port:integer(portEnvironment)});
  return {close:()=>app.close()};
}