import {spawn,type ChildProcess} from 'node:child_process';
import path from 'node:path';
import {StorageType} from 'nats';
import {loadEnv,natsConnect,log,required,workspaceRoot} from '@pump/runtime';
import {ensureTls} from './dev-tls';
export async function ensureBus():Promise<void>{
 const nc=await natsConnect('operator');
 try{
  const manager=await nc.jetstreamManager();
  for(const [name,subjects] of [['TRADING_EVENTS',['trading.events.>']],['COMMUNITIES_EVENTS',['communities.>','dm.user.*','followingFeed.user.*','alertsFeed.user.*.*']],['HOLDER_REWARDS',['holderRewards.>']]] as const){
   try{const prior=await manager.streams.info(name);if(subjects.some(subject=>!prior.config.subjects?.includes(subject)))await manager.streams.update(name,{...prior.config,subjects:[...new Set([...(prior.config.subjects??[]),...subjects])]});}
   catch(error:any){if(error.code!=='404')throw error;await manager.streams.add({name,subjects:[...subjects],storage:StorageType.File});}
  }
 }finally{await nc.drain();}
}
export const coreServices=['trading','communities','coins','stream-gateway','client-server','keyed-api'];
export function launchServices(environment:NodeJS.ProcessEnv=process.env,selected?:string[]):ChildProcess[]{
 const root=workspaceRoot();
 const names=selected??[...(environment.NATS_AUTH_MODE==='on'?['auth-callout']:[]),...coreServices,'tx-builder','limit','profile','notify','live','bridge','holder-rewards'];
 return names.map(name=>{
  const target=name==='keyed-api'?'client-server':name;
  const file=name==='holder-rewards'?path.join(root,'keepers','holder-rewards','dist','main.js'):path.join(root,'services',target,'dist','main.js');
  return spawn(process.execPath,[file,...(name==='keyed-api'?['--keyed']:[])],{cwd:root,env:{...environment,NATS_SERVICE_IDENTITY:name==='holder-rewards'?'keepers':target},stdio:'inherit',windowsHide:true});
 });
}
async function main():Promise<void>{
 loadEnv();required('NATS_AUTH_MODE');await ensureTls();await ensureBus();
 const children=launchServices();let stopping=false;
 function stop():void{if(stopping)return;stopping=true;for(const child of children)if(child.exitCode===null)child.kill();setTimeout(()=>process.exit(process.exitCode??0),1000);}
 for(const child of children)child.on('exit',code=>{if(!stopping){process.exitCode=code??1;stop();}});
 process.once('SIGINT',stop);process.once('SIGTERM',stop);log('local','services_started',{count:children.length,natsAuth:required('NATS_AUTH_MODE')});
}
if(require.main===module)main().catch(error=>{log('local','startup_failed',{reason:/configuration|NATS_/.test(error.message)?error.message:'Local prerequisite failed'});process.exitCode=1;});
