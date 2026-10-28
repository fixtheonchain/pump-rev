import { Server, ServerCredentials, status, type ServerUnaryCall, type sendUnaryData } from '@grpc/grpc-js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import { loadPackage } from '@pump/proto';
import { loadEnv, log, required } from '@pump/runtime';

async function main(): Promise<void> {
  loadEnv();
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: required('DATABASE_URL') }) });
  const api = loadPackage('coins.v1');
  const server = new Server();
  const getCoin = (call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>): void => {
    if (!call.request.chain || !call.request.address) { callback({ code: status.INVALID_ARGUMENT, details: 'Chain and address required' }); return; }
    void prisma.coin.findUnique({ where: { chain_address: { chain: call.request.chain, address: call.request.address } } }).then(row => {
      if (!row) { callback({ code: status.NOT_FOUND, details: 'Coin not found' }); return; }
      const verdict = (row.securityVerdict as { verdict?: string } | null)?.verdict;
      if (verdict && ['block', 'blocked'].includes(verdict)) { callback({ code: status.PERMISSION_DENIED, details: 'Coin blocked' }); return; }
      callback(null, { chain: row.chain, address: row.address, name: row.name, symbol: row.symbol, description: row.description, decimals: row.decimals, complete: row.complete, mayhemMode: row.mayhemMode });
    }).catch(() => callback({ code: status.UNAVAILABLE, details: 'Coin registry unavailable' }));
  };
  server.addService(api.CoinsApi.service, {
    getCoin,
    health: (_call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) => {
      void prisma.$queryRaw`SELECT 1`.then(() => callback(null, { status: 'ok' })).catch(() => callback({ code: status.UNAVAILABLE, details: 'Coin registry unavailable' }));
    },
  });
  await new Promise<void>((resolve, reject) => server.bindAsync(process.env.COINS_GRPC_BIND ?? required('COINS_GRPC_URL'), ServerCredentials.createInsecure(), error => error ? reject(error) : resolve()));
  log('coins', 'started', { address: required('COINS_GRPC_URL') });
  const stop = (): void => { server.tryShutdown(() => { void prisma.$disconnect(); }); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
main().catch(error => { log('coins', 'startup_failed', { reason: error instanceof Error && /configuration/.test(error.message) ? error.message : 'Dependency startup failed' }); process.exitCode = 1; });
