import { loadEnv, pg, chInsert, log } from '@pump/runtime';

export const SEED = {
  chain: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  mint: 'US517G5965aydkZ46HS38QLi7UQiSojurfbQfKCELFx',
  wallet: 'YMN9Qj5jPNp7j14VPcML1B6xGgcPWVZUGLFU3Mnyfaf',
  bobWallet: 'cGfHiC6Kgg3FpFZvgwGcswsCRtp4aBP2fzuXRQPizuN',
  quote: 'gBxS1f6uyyGPuW5MzGBukidSb71jdsCb5fZaoSzULE5',
  alice: '11111111-1111-4111-8111-111111111111',
  bob: '22222222-2222-4222-8222-222222222222',
  squad: '33333333-3333-4333-8333-333333333333',
  org: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
};

async function seed(): Promise<void> {
  loadEnv();
  const client = await pg().connect();
  try {
    await client.query('BEGIN');
    for (const [id, username, wallet, bio] of [
      [SEED.alice, 'alice', SEED.wallet, 'Researching community coins and sharing a thesis.'],
      [SEED.bob, 'bob', SEED.bobWallet, 'Following launches and testing the local tape.'],
    ]) {
      await client.query('INSERT INTO users(id,username,canonical_svm_wallet,bio) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO NOTHING', [id, username, wallet, bio]);
      await client.query("INSERT INTO wallets(address,user_id,chain,custody) VALUES($1,$2,$3,'privy') ON CONFLICT(address) DO NOTHING", [wallet, id, SEED.chain]);
    }
    await client.query("INSERT INTO follows(follower,followee,origin,trade_notifications) VALUES($1,$2,'local-seed',true),($2,$1,'local-seed',true) ON CONFLICT DO NOTHING", [SEED.alice, SEED.bob]);
    await client.query("INSERT INTO groups(id,username,owner,seats,bio) VALUES($1,'research-squad',$2,5,'Local development squad') ON CONFLICT(id) DO NOTHING", [SEED.squad, SEED.alice]);
    await client.query("INSERT INTO group_members(group_id,user_id,role,status) VALUES($1,$2,'OWNER','ACTIVE'),($1,$3,'MEMBER','ACTIVE') ON CONFLICT DO NOTHING", [SEED.squad, SEED.alice, SEED.bob]);
    await client.query(`INSERT INTO coins(chain,address,name,symbol,description,creator,decimals,quote_mint,quote_decimals,total_supply,metadata)
      VALUES($1,$2,'Replay Research Coin','RPLAY','Synthetic local coin encoded with the captured Anchor IDLs.',$3,6,$4,9,1000000000000000,$5::jsonb)
      ON CONFLICT(chain,address) DO NOTHING`, [SEED.chain, SEED.mint, SEED.wallet, SEED.quote, JSON.stringify({ synthetic: true, program: 'pump', quote_usd: '150' })]);
    await client.query(`INSERT INTO callouts(id,author,chain,coin,thesis,price_usd_at_call,mcap_usd_at_call,created_at)
      VALUES('44444444-4444-4444-8444-444444444444',$1,$2,$3,'Watching the fixture launch and its confirmed trade tape.',0.012,12000000,'2026-10-28T09:00:00Z') ON CONFLICT(id) DO NOTHING`, [SEED.bob, SEED.chain, SEED.mint]);
    await client.query("INSERT INTO api_orgs(id,owner,status,contact_email,email_verified_at,terms_version) VALUES($1,$2,'approved','alice@example.test',now(),'local-v1') ON CONFLICT(id) DO NOTHING", [SEED.org, SEED.alice]);
    await client.query("INSERT INTO api_terms_acceptances(org_id,version,acceptor) VALUES($1,'local-v1',$2) ON CONFLICT DO NOTHING", [SEED.org, SEED.alice]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pg().end();
  }
  const rows = [
    { block_id: '800', tx_index: 1, event_index: 0, block_time_ms: '1793178000000', wallet: SEED.wallet, side: 'buy', base_amount: '25000000000', quote_amount: '2000000000', price_usd: '0.012', market_cap_usd: '12000000' },
    { block_id: '801', tx_index: 0, event_index: 0, block_time_ms: '1793178060000', wallet: SEED.bobWallet, side: 'buy', base_amount: '10000000000', quote_amount: '1000000000', price_usd: '0.015', market_cap_usd: '15000000' },
    { block_id: '802', tx_index: 0, event_index: 0, block_time_ms: '1793178120000', wallet: SEED.wallet, side: 'sell', base_amount: '2500000000', quote_amount: '240000000', price_usd: '0.0144', market_cap_usd: '14400000' },
  ].map((x, index) => ({
    chain: SEED.chain, mint: SEED.mint, commitment: 'confirmed', event_name: 'TradeEvent', version: '1', deleted: 0,
    quote_mint: SEED.quote, fee_protocol: '1900000', fee_creator: '600000', signature: `synthetic-seed-${index + 1}`,
    metadata_json: JSON.stringify({ synthetic: true, base_decimals: 6, quote_decimals: 9 }), ...x,
  }));
  for (const table of ['event_log', 'trades', 'fee_events', 'position_deltas']) await chInsert(table, rows);
  log('seed', 'complete', { users: 2, coins: 1, trades: rows.length, callouts: 1 });
}

if (require.main === module) seed().catch(() => { log('seed', 'failed'); process.exitCode = 1; });
