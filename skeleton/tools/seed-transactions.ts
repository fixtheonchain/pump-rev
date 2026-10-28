import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {loadEnv,pg,required,workspaceRoot,log} from '@pump/runtime';
import {fixtureSigner,fixtureAuthority,FIXTURE_MINT,FIXTURE_QUOTE} from '@pump/tx-builder';
async function main(){
 loadEnv();const wallet=fixtureSigner().publicKey.toBase58(),id='55555555-5555-4555-8555-555555555555',chain='solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
 if(required('LOCAL_MONEY_IDENTITY_WALLET')!==wallet)throw new Error('LOCAL_MONEY_IDENTITY_WALLET must match the documented fixture signer');
 const client=await pg().connect();
 try{await client.query('BEGIN');
  await client.query("INSERT INTO users(id,username,bio,canonical_svm_wallet) VALUES($1,'fixture-trader','Deterministic local transaction signer.',$2) ON CONFLICT(id) DO NOTHING",[id,wallet]);
  await client.query("INSERT INTO wallets(address,user_id,chain,custody) VALUES($1,$2,$3,'external') ON CONFLICT DO NOTHING",[wallet,id,chain]);
  await client.query(`INSERT INTO holder_reward_vaults(chain,mint,quote_mint,quote_decimals,quote_usd,balance_atomic,base_decimals,price_usd,snapshot_ordinal,authority)
    VALUES($1,$2,$3,9,150,1000000000,6,0.015,'local-holder-rewards-seed-v1',$4) ON CONFLICT DO NOTHING`,[chain,FIXTURE_MINT,FIXTURE_QUOTE,fixtureAuthority().publicKey.toBase58()]);
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
 await mkdir(path.join(workspaceRoot(),'.local'),{recursive:true});
 await writeFile(path.join(workspaceRoot(),'.local','money-fixtures.json'),JSON.stringify({userId:id,wallet,mint:FIXTURE_MINT,quoteMint:FIXTURE_QUOTE,chain,authority:fixtureAuthority().publicKey.toBase58(),privateKeys:'Use the deterministic fixtureSigner() helper locally; these are not real wallets.'},null,2)+'\n');
 log('seed','transactions_complete',{identity:'fixture-trader',fixtures:'.local/money-fixtures.json'});await pg().end();
}
main().catch(error=>{log('seed','transactions_failed',{reason:/configuration|LOCAL_/.test(error.message)?error.message:'Database seed failed'});process.exitCode=1;});
