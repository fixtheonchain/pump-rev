// This consumer imports only the public contract package. It is compiled by the workspace build.
import {createClient, SOLANA_CHAIN} from '@pump/http';
export async function example(baseUrl:string,mint:string){
  const api=createClient({baseUrl});
  const result=await api.request('GET /trades/{chainId}/{address}',{params:{chainId:SOLANA_CHAIN,address:mint},query:{limit:10}});
  const amount:string|undefined=result.trades[0]?.baseAmount;
  return amount;
}
