import {createClient} from '@pump/http';
// The typed portfolio consumer needs no service-internal imports.
export async function readPosition(baseUrl:string,userId:string){
 const api=createClient({baseUrl});
 const portfolio=await api.request('GET /user-portfolio/{userId}',{params:{userId},query:{filter:'all'}});
 const amount:string|undefined=portfolio.positions[0]?.amountAtomic;
 const realized:string|null=portfolio.totals.realizedPnlUsd;
 return {amount,realized};
}
