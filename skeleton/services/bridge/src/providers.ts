import { createHash } from 'node:crypto';
import { z } from 'zod';
import { refuse } from '@pump/internal-http';
export const routeConfiguration=z.array(z.object({fromChain:z.string(),toChain:z.string(),fromToken:z.string(),toToken:z.string(),numerator:z.string().regex(/^[1-9]\d*$/),denominator:z.string().regex(/^[1-9]\d*$/),feeBps:z.number().int().min(0).max(10000),minimumAmountAtomic:z.string().regex(/^\d+$/)}));
export interface BridgeInput {originChain:string;destinationChain:string;originCurrency:string;destinationCurrency:string;amountAtomic:string;recipient:string;slippageBps:number;}
export interface RelayAdapter {
  quote(input:BridgeInput):Promise<{amountOutAtomic:string;minAmountOutAtomic:string;feeAtomic:string;simulated:boolean}>;
  execute(quoteId:string,quote:Record<string,unknown>):Promise<{providerRequestId:string;status:'success';simulated:boolean}>;
}
export class LocalRelayAdapter implements RelayAdapter {
  constructor(private readonly routes:z.infer<typeof routeConfiguration>){}
  async quote(input:BridgeInput){
    const route=this.routes.find(x=>x.fromChain===input.originChain&&x.toChain===input.destinationChain&&x.fromToken===input.originCurrency&&x.toToken===input.destinationCurrency);
    if(!route)refuse('PROVIDER_UNAVAILABLE',503,'No configured local Relay route');
    const amount=BigInt(input.amountAtomic);if(amount<BigInt(route.minimumAmountAtomic))refuse('INVALID_ARGUMENT',400);
    const fee=amount*BigInt(route.feeBps)/10000n;
    const out=(amount-fee)*BigInt(route.numerator)/BigInt(route.denominator);
    const minimum=out*BigInt(10000-input.slippageBps)/10000n;
    if(minimum<=0n)refuse('INVALID_ARGUMENT',400);
    return {amountOutAtomic:out.toString(),minAmountOutAtomic:minimum.toString(),feeAtomic:fee.toString(),simulated:true};
  }
  async execute(quoteId:string,_quote:Record<string,unknown>){return {providerRequestId:'local:'+createHash('sha256').update(quoteId).digest('hex'),status:'success' as const,simulated:true};}
}