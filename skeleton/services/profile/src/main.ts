import Decimal from 'decimal.js';
import { startInternalService, refuse } from '@pump/internal-http';
import { chQuery,integer,loadEnv,log,pg,required } from '@pump/runtime';
import { portfolioParams,portfolioQuery,positionsQuery,summaryQuery } from './contracts';
import { foldPosition,type Delta } from './fold';
const Exact=Decimal.clone({precision:128});
async function walletsFor(identifier:string):Promise<string[]>{
  const group=(await pg().query('SELECT id FROM groups WHERE id::text=$1 OR username::text=$1',[identifier])).rows[0];
  if(group)return (await pg().query("SELECT DISTINCT w.address FROM group_members g JOIN wallets w ON w.user_id=g.user_id WHERE g.group_id=$1 AND g.status='ACTIVE' AND w.reserved=false",[group.id])).rows.map(x=>x.address);
  const user=(await pg().query('SELECT id FROM users WHERE id::text=$1 OR username::text=$1 OR canonical_svm_wallet=$1 OR canonical_evm_wallet=$1',[identifier])).rows[0];
  if(user)return (await pg().query('SELECT address FROM wallets WHERE user_id=$1 AND reserved=false',[user.id])).rows.map(x=>x.address);
  return [identifier];
}
async function portfolio(identifier:string,query:Record<string,any>):Promise<Record<string,unknown>>{
  const wallets=await walletsFor(identifier),max=integer('PROFILE_MAX_EVENT_ROWS');
  if(!wallets.length)return {userId:identifier,positions:[],totals:{valueUsd:'0',costBasisUsd:'0',realizedPnlUsd:'0',unrealizedPnlUsd:'0'},limitations:['Trade-derived balances exclude transfers and cash'],nextCursor:''};
  const params:Record<string,unknown>={limit:max+1};wallets.forEach((x,i)=>params[`w${i}`]=x);
  let where=`wallet IN (${wallets.map((_,i)=>`{w${i}:String}`).join(',')}) AND deleted=0`;
  const commitment=required('PROFILE_COMMITMENT');if(!['processed','confirmed'].includes(commitment))throw new Error('PROFILE_COMMITMENT must be processed or confirmed');
  if(commitment==='confirmed')where+=" AND commitment='confirmed'";
  if(query.chain){params.chain=query.chain;where+=' AND chain={chain:String}';}
  const rows=await chQuery<Delta>(`SELECT chain,mint,wallet,side,toString(base_amount) AS base_amount,toString(quote_amount) AS quote_amount,toString(price_usd) AS price_usd,quote_mint,toString(fee_protocol) AS fee_protocol,toString(fee_creator) AS fee_creator,toString(block_id) AS block_id,tx_index,event_index,metadata_json FROM position_deltas FINAL WHERE ${where} ORDER BY toUInt64(block_id),tx_index,event_index LIMIT {limit:UInt32}`,params);
  if(rows.length>max)refuse('PORTFOLIO_BUILDING',409,'Canonical history exceeds the configured fold budget');
  const groups=new Map<string,Delta[]>();for(const row of rows){const key=`${row.wallet}/${row.chain}/${row.mint}`;groups.set(key,[...(groups.get(key)??[]),row]);}
  const results:Record<string,any>[]=[];
  for(const values of groups.values()){
    const first=values[0];const meta=(await pg().query('SELECT name,symbol,decimals,quote_decimals FROM coins WHERE chain=$1 AND address=$2',[first.chain,first.mint])).rows[0];
    if(!meta)refuse('BALANCE_UNAVAILABLE',503,'Token decimals are not registered');
    const markRow=(await chQuery<{price:string;quote_mint:string;metadata_json:string}>('SELECT toString(price_usd) AS price,quote_mint,metadata_json FROM trades FINAL WHERE chain={chain:String} AND mint={mint:String} AND deleted=0 ORDER BY block_id DESC,tx_index DESC,event_index DESC LIMIT 1',{chain:first.chain,mint:first.mint}))[0];
    const mark=markRow&&new Exact(markRow.price).gt(0)?markRow.price:null,markMetadata=JSON.parse(markRow?.metadata_json??'{}');
    const quoteMark=typeof markMetadata.quote_usd==='string'&&typeof markMetadata.quote_decimals==='number'?{priceUsd:markMetadata.quote_usd,mint:markRow.quote_mint,decimals:markMetadata.quote_decimals}:undefined;
    results.push(foldPosition(values,meta,mark,quoteMark));
  }
  const totals:Record<string,string|null>={};
  for(const field of ['valueUsd','costBasisUsd','realizedPnlUsd','unrealizedPnlUsd'])totals[field]=results.some(x=>x[field]===null)?null:results.reduce((sum,x)=>sum.plus(x[field]),new Exact(0)).toFixed();
  const selected=results.filter(x=>query.filter==='open'?!x.isExited:query.filter==='closed'?x.isExited:true).filter(x=>!query.mints||String(query.mints).split(',').includes(x.mint)).sort((a,b)=>(a.wallet+'/'+a.chain+'/'+a.mint).localeCompare(b.wallet+'/'+b.chain+'/'+b.mint));
  const limit=query.limit??integer('PROFILE_PAGE_LIMIT');if(limit>integer('PROFILE_PAGE_LIMIT'))refuse('INVALID_ARGUMENT',400);
  const cursor=query.cursor??'';const page=selected.filter(x=>(x.wallet+'/'+x.chain+'/'+x.mint)>cursor).slice(0,limit+1);
  const tail=page[Math.min(limit,page.length)-1];
  return {userId:identifier,positions:query.totalsOnly==='true'?[]:page.slice(0,limit),totals,nextCursor:page.length>limit&&tail?tail.wallet+'/'+tail.chain+'/'+tail.mint:'',
    limitations:['Balances and PnL derive from canonical trade position deltas, not transfer or cash account history','Unknown transaction fee components are null; execution notional has no assumed fee adjustment','Repeating rational basis is exact in costBasis*Exact; decimal renderings use 128 significant digits'],commitment};
}
async function main():Promise<void>{
  loadEnv();integer('PROFILE_MAX_EVENT_ROWS');integer('PROFILE_PAGE_LIMIT');required('PROFILE_COMMITMENT');
  const service=await startInternalService('profile','PROFILE_PORT',[
    {method:'GET',path:'/user-portfolio/:userId',params:portfolioParams,query:portfolioQuery,handle:async input=>portfolio(input.params.userId,input.query)},
    {method:'GET',path:'/user-positions/:userId',params:portfolioParams,query:positionsQuery,handle:async input=>portfolio(input.params.userId,input.query)},
    {method:'GET',path:'/portfolio-summary',query:summaryQuery,handle:async input=>{const result=await portfolio(input.query.user,input.query);return {totals:result.totals,limitations:result.limitations,commitment:result.commitment};}},
  ],async()=>{await pg().query('SELECT 1');await chQuery('SELECT 1');return {status:'ok'};});
  const close=():void=>{void service.close().then(()=>pg().end());};process.once('SIGINT',close);process.once('SIGTERM',close);
}
main().catch(error=>{log('profile','startup_failed',{reason:error instanceof Error&&/configuration|PROFILE_/.test(error.message)?error.message:'Dependency startup failed'});process.exitCode=1;});