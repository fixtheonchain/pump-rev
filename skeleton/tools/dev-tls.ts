import { mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadEnv, required, integer, log } from '@pump/runtime';
export async function ensureTls():Promise<void>{
  const cert=required('STREAM_TLS_CERT_PATH'),key=required('STREAM_TLS_KEY_PATH');
  try{await access(cert);await access(key);return;}catch{}
  await mkdir(path.dirname(cert),{recursive:true});await mkdir(path.dirname(key),{recursive:true});
  const result=spawnSync('openssl',['req','-x509','-newkey','rsa:2048','-sha256','-noenc','-keyout',key,'-out',cert,'-days',String(integer('LOCAL_TLS_VALID_DAYS')),'-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost,IP:127.0.0.1'],{stdio:'pipe',windowsHide:true});
  if(result.status!==0)throw new Error('Local TLS certificate generation failed; install OpenSSL or supply STREAM_TLS_CERT_PATH/KEY_PATH');
  log('dev-tls','created',{certificate:cert});
}
if(require.main===module){loadEnv();ensureTls().catch(error=>{process.stderr.write(String(error.message)+'\n');process.exitCode=1;});}
