// Operator Job only: this credential is never mounted into application pods.
const { loadEnv, natsConnect } = require('@pump/runtime');
const { StorageType } = require('nats');
async function main() {
  loadEnv();
  const nc = await natsConnect('operator');
  try {
    const manager = await nc.jetstreamManager();
    for (const [name,subjects] of [
      ['TRADING_EVENTS',['trading.events.>']],
      ['HOLDER_REWARDS',['holderRewards.>']],
      ['COMMUNITIES_EVENTS',['communities.>','followingFeed.user.*','alertsFeed.user.*.*','dm.user.*']],
    ]) {
      try { const prior = await manager.streams.info(name); await manager.streams.update(name,{...prior.config,subjects:[...new Set([...(prior.config.subjects??[]),...subjects])]}); }
      catch (error) { if (error.code !== '404') throw error; await manager.streams.add({name,subjects,storage:StorageType.File}); }
    }
    process.stdout.write('Application streams provisioned.\n');
  } finally { await nc.drain(); }
}
main().catch(() => { process.stderr.write('Stream provisioning failed.\n'); process.exitCode=1; });