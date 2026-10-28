import Decimal from 'decimal.js';
const Exact = Decimal.clone({precision:128});
export interface Delta {
  chain:string;mint:string;wallet:string;side:string;base_amount:string;quote_amount:string;price_usd:string;
  quote_mint:string;fee_protocol:string;fee_creator:string;block_id:string;tx_index:number;event_index:number;metadata_json:string;
}
export interface CoinMetadata {decimals:number;quote_decimals:number;name:string;symbol:string;}
function gcd(a:bigint,b:bigint):bigint { while(b){const t=a%b;a=b;b=t;}return a<0n?-a:a; }
// Rational inventory basis preserves the remainder when a partial sale splits a lot.
export class Rational {
  readonly n:bigint; readonly d:bigint;
  constructor(n:bigint,d:bigint=1n){if(d===0n)throw new Error('Zero denominator');const sign=d<0n?-1n:1n;const g=gcd(n,d);this.n=n/g*sign;this.d=d/g*sign;}
  add(other:Rational):Rational{return new Rational(this.n*other.d+other.n*this.d,this.d*other.d);}
  sub(other:Rational):Rational{return new Rational(this.n*other.d-other.n*this.d,this.d*other.d);}
  fraction(n:bigint,d:bigint):Rational{return new Rational(this.n*n,this.d*d);}
  display():string{return new Exact(this.n.toString()).div(this.d.toString()).toFixed();}
  exact():{numerator:string;denominator:string}{return {numerator:this.n.toString(),denominator:this.d.toString()};}
  static decimal(value:string):Rational{const m=/^(-?)(\d+)(?:\.(\d+))?$/.exec(value);if(!m)throw new Error('Invalid exact decimal');const n=BigInt(m[2]+(m[3]??''))*(m[1]? -1n:1n);return new Rational(n,10n**BigInt(m[3]?.length??0));}
}
export function foldPosition(rows:Delta[],meta:CoinMetadata,mark:string|null,quoteMark?:{priceUsd:string;mint:string;decimals:number}):Record<string,unknown>{
  let held=0n;let usd=new Rational(0n);let quote=new Rational(0n);let realizedUsd=new Rational(0n);let realizedQuote=new Rational(0n);let buyUsd=new Rational(0n);let buyAmount=0n;let complete=true;let missing=0n;let protocol=0n;let creator=0n;
  const quoteMints=new Set(rows.map(row=>row.quote_mint));
  const byQuote:Record<string,{protocol:string;creator:string}>={};
  let protocolUsd=new Rational(0n),creatorUsd=new Rational(0n),feeUsdKnown=true;
  const unavailable=new Set(['base','priority','tip','ui','ata_rent','cashback']);
  const metadataFees:Record<string,Rational>={};
  for(const row of rows){
    const base=BigInt(row.base_amount),cash=BigInt(row.quote_amount),executionPrice=Rational.decimal(row.price_usd);if(executionPrice.n<=0n)complete=false;const notional=executionPrice.fraction(base,10n**BigInt(meta.decimals));
    protocol+=BigInt(row.fee_protocol);creator+=BigInt(row.fee_creator);
    const fees=byQuote[row.quote_mint]??{protocol:'0',creator:'0'};byQuote[row.quote_mint]={protocol:(BigInt(fees.protocol)+BigInt(row.fee_protocol)).toString(),creator:(BigInt(fees.creator)+BigInt(row.fee_creator)).toString()};
    if(cash>0n){protocolUsd=protocolUsd.add(notional.fraction(BigInt(row.fee_protocol),cash));creatorUsd=creatorUsd.add(notional.fraction(BigInt(row.fee_creator),cash));}else if(BigInt(row.fee_protocol)>0n||BigInt(row.fee_creator)>0n)feeUsdKnown=false;
    if(base===0n)continue;
    const metadata=JSON.parse(row.metadata_json||'{}');
    for(const key of [...unavailable])if(typeof metadata.fee_detail?.[key]==='string'){
      const fee=Rational.decimal(metadata.fee_detail[key]);metadataFees[key]=(metadataFees[key]??new Rational(0n)).add(fee);
    }
    if(row.side==='buy'){held+=base;usd=usd.add(notional);quote=quote.add(new Rational(cash));buyUsd=buyUsd.add(notional);buyAmount+=base;}
    else{
      if(base>held){complete=false;missing+=base-held;held=0n;usd=new Rational(0n);quote=new Rational(0n);continue;}
      const spentUsd=usd.fraction(base,held),spentQuote=quote.fraction(base,held);
      usd=usd.sub(spentUsd);quote=quote.sub(spentQuote);held-=base;
      realizedUsd=realizedUsd.add(notional.sub(spentUsd));realizedQuote=realizedQuote.add(new Rational(cash).sub(spentQuote));
    }
  }
  const current=mark===null?null:Rational.decimal(mark).fraction(held,10n**BigInt(meta.decimals));
  const last=rows.at(-1)!;
  const quotePrice=quoteMark?Rational.decimal(quoteMark.priceUsd):null;
  const quoteCurrent=current&&quotePrice&&quotePrice.n>0n&&quoteMints.size===1&&quoteMark?.mint===last.quote_mint?current.fraction(quotePrice.d*10n**BigInt(quoteMark.decimals),quotePrice.n):null;
  return {wallet:last.wallet,chain:last.chain,mint:last.mint,token_mint:last.mint,token_name:meta.name,token_symbol:meta.symbol,decimals:meta.decimals,
    amount:new Exact(held.toString()).div(new Exact(10).pow(meta.decimals)).toFixed(),amountAtomic:held.toString(),balance:held.toString(),
    costBasisUsd:complete?usd.display():null,costBasisQuoteAtomic:complete&&quoteMints.size===1?quote.display():null,costBasisQuoteExact:complete&&quoteMints.size===1?quote.exact():null,
    costBasisUsdExact:complete?usd.exact():null,realizedPnlUsd:complete?realizedUsd.display():null,realizedPnlQuoteAtomic:complete&&quoteMints.size===1?realizedQuote.display():null,
    unrealizedPnlUsd:complete&&current?current.sub(usd).display():null,unrealizedPnlQuoteAtomic:complete&&quoteCurrent?quoteCurrent.sub(quote).display():null,valueQuoteAtomic:quoteCurrent?.display()??null,valueUsd:current?.display()??null,token_price:mark,
    isExited:held===0n,basisComplete:complete,untrackedSoldAtomic:missing.toString(),has_transfers:null,
    total_buy_spend:buyUsd.display(),total_buy_amount:buyAmount.toString(),last_slot_index_id:`${last.block_id}-${last.tx_index}-${last.event_index}`,
    fee_detail:{base:null,priority:null,tip:null,ui:null,ata_rent:null,cashback:null,protocol:quoteMints.size===1?{quoteAtomic:protocol.toString(),quoteMint:last.quote_mint}:null,creator:quoteMints.size===1?{quoteAtomic:creator.toString(),quoteMint:last.quote_mint}:null,byQuote},
    knownFeesUsd:feeUsdKnown?protocolUsd.add(creatorUsd).display():null,feeUsdValuation:'Execution-implied quote mark; known protocol and creator components only',unavailableFeeComponents:[...unavailable],feeEvidence:Object.fromEntries(Object.entries(metadataFees).map(([key,value])=>[key,{amount:value.display(),exact:value.exact()}])),costBasisMethod:'weighted_average_execution_notional',
    feeInclusion:'Event quote amount as reported; no assumed fee adjustment',
  };
}