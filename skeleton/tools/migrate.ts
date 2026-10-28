import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chExec, chQuery, loadEnv, log, pg } from '@pump/runtime';

async function migrate(): Promise<void> {
  loadEnv();
  const client = await pg().connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended('pumpskel:migrations',0))");
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const folder = resolve(__dirname, '../../storage/postgres');
    for (const name of (await readdir(folder)).filter(x => x.endsWith('.sql')).sort()) {
      const sql = (await readFile(resolve(folder, name), 'utf8')).replace(/^\uFEFF/, '');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const existing = await client.query('SELECT checksum FROM schema_migrations WHERE name=$1', [name]);
      if (existing.rowCount) {
        if (existing.rows[0].checksum !== checksum) throw new Error(`Applied Postgres migration changed: ${name}`);
        continue;
      }
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)', [name, checksum]);
      log('migrate', 'postgres_applied', { name });
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pg().end();
  }
  await chExec('CREATE TABLE IF NOT EXISTS schema_migrations (name String, checksum String, applied_at DateTime64(3) DEFAULT now64(3)) ENGINE=ReplacingMergeTree(applied_at) ORDER BY name');
  const folder = resolve(__dirname, '../../storage/clickhouse');
  for (const name of (await readdir(folder)).filter(x => x.endsWith('.sql')).sort()) {
    const sql = (await readFile(resolve(folder, name), 'utf8')).replace(/^\uFEFF/, '');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const prior = await chQuery<{checksum: string}>('SELECT checksum FROM schema_migrations FINAL WHERE name={name:String}', { name });
    if (prior.length) {
      if (prior[0].checksum !== checksum) throw new Error(`Applied ClickHouse migration changed: ${name}`);
      continue;
    }
    // ClickHouse DDL cannot be transactional; each statement is restart safe, ledger is written last.
    for (const statement of sql.split(';').map(x => x.trim()).filter(Boolean)) await chExec(statement);
    await chExec(`INSERT INTO schema_migrations(name,checksum) VALUES ('${name.replace(/'/g, "''")}','${checksum}')`);
    log('migrate', 'clickhouse_applied', { name });
  }
}

migrate().catch(error => { log('migrate', 'failed', { reason: error instanceof Error ? error.message : 'Migration failed' }); process.exitCode = 1; });

