import fs from 'node:fs';import path from 'node:path';import {randomBytes,createHash} from 'node:crypto';import {Keypair} from '@solana/web3.js';
const root=path.resolve(import.meta.dirname,'..'),example=fs.readFileSync(path.join(root,'.env.example'),'utf8');
const file=path.join(root,'.env');let content=fs.existsSync(file)?fs.readFileSync(file,'utf8'):example;
const keys=new Set([...content.matchAll(/^([A-Z0-9_]+)=/gm)].map(match=>match[1]));
for(const line of example.split(/\r?\n/)){const match=/^([A-Z0-9_]+)=/.exec(line);if(match&&!keys.has(match[1])){content+='\n'+line;keys.add(match[1]);}}
function setMissing(name,value){const pattern=new RegExp('^'+name+'=(.*)$','m');const match=pattern.exec(content);if(!match?.[1]?.trim())content=match?content.replace(pattern,name+'='+value):content+'\n'+name+'='+value;}
setMissing('NOTIFY_TOKEN_ENCRYPTION_KEY',randomBytes(32).toString('base64'));
setMissing('LOCAL_MONEY_IDENTITY_WALLET',Keypair.fromSeed(createHash('sha256').update('pumpskel:local-only:transaction-user').digest()).publicKey.toBase58());
fs.writeFileSync(file,content.trimEnd()+'\n');console.log(JSON.stringify({event:'local_configuration_prepared',path:'.env',credentialsPrinted:false}));
