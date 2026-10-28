import { createHash } from 'node:crypto';
export interface MediaProvider {
  start(room:string,id:string):Promise<{roomId:string;playbackUrl:string;simulated:boolean}>;
  stop(roomId:string):Promise<void>;
  clip(room:string,clipId:string):Promise<{playlistUrl:string;mp4Url:string;thumbnailUrl:string;simulated:boolean}>;
}
export class LocalMediaProvider implements MediaProvider {
  constructor(private readonly baseUrl:string){}
  async start(room:string,id:string){return {roomId:`local:${id}`,playbackUrl:`${this.baseUrl}/rooms/${encodeURIComponent(room)}/index.m3u8`,simulated:true};}
  async stop(_roomId:string):Promise<void>{}
  async clip(room:string,clipId:string){const root=`${this.baseUrl}/clips/${encodeURIComponent(room)}/${encodeURIComponent(clipId)}`;return {playlistUrl:`${root}/index.m3u8`,mp4Url:`${root}/recording.mp4`,thumbnailUrl:`${root}/thumbnail.jpg`,simulated:true};}
}
export interface EscrowProvider { fund(taskId:string,mint:string,amount:string):Promise<string>; settle(taskId:string,operation:string,mint:string,amount:string,beneficiary:string):Promise<string>; }
export class LocalEscrowProvider implements EscrowProvider {
  private receipt(...parts:string[]):string{return 'local:'+createHash('sha256').update(parts.join(':')).digest('hex');}
  async fund(taskId:string,mint:string,amount:string){return this.receipt('fund',taskId,mint,amount);}
  async settle(taskId:string,operation:string,mint:string,amount:string,beneficiary:string){return this.receipt(operation,taskId,mint,amount,beneficiary);}
}