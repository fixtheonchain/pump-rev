import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { API_SCOPES } from '@pump/http';
import { pg, loadEnv, integer, log, workspaceRoot } from '@pump/runtime';
const {issueKey,hashKey,validKey} = require(path.resolve(__dirname,'../../services/client-server/dist/keys')) as typeof import('../services/client-server/dist/keys');
async function main():Promise<void>{
  loadEnv();
  const file=path.join(workspaceRoot(),'.local','api-key.txt');
  let key:string|undefined;
  try{key=(await readFile(file,'utf8')).trim();}catch{}
  if(!key || !validKey(key))key=issueKey();
  await pg().query(`INSERT INTO api_keys(id,org_id,name,prefix,last4,hash,scopes,daily_limit,burst,status)
    VALUES($1,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Local development',$2,$3,$4,$5,$6,$7,'active') ON CONFLICT(hash) DO NOTHING`,
    [randomUUID(),key.slice(0,16),key.slice(-4),hashKey(key),API_SCOPES.filter(scope=>scope!=='moderation.read'),integer('LOCAL_API_KEY_DAILY_LIMIT'),integer('LOCAL_API_KEY_BURST')]);
  await mkdir(path.dirname(file),{recursive:true});await writeFile(file,key+'\n',{mode:0o600});
  log('seed','local_key_written',{path:'.local/api-key.txt'});
  await pg().end();
}
main().catch(()=>{log('seed','key_failed');process.exitCode=1;});
