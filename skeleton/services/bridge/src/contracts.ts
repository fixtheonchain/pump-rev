import { z } from 'zod';
const atomic=z.string().regex(/^[1-9]\d*$/).max(78);
export const quoteBody=z.object({originChain:z.string().min(1),destinationChain:z.string().min(1),originCurrency:z.string().min(1),destinationCurrency:z.string().min(1),amountAtomic:atomic,recipient:z.string().min(1),requestId:z.string().min(1).max(200),slippageBps:z.number().int().min(0).max(10000).optional()}).strict();
// Names observed on the intents/Relay door, kept distinct from the local POST normalization.
export const quoteQuery=z.object({fromChain:z.string().min(1),toChain:z.string().min(1),fromToken:z.string().min(1),toToken:z.string().min(1),amount:atomic,userAddress:z.string().min(1),recipient:z.string().min(1),subsidizeFees:z.enum(['true','false']).optional(),originGasOverhead:z.string().regex(/^\d+$/).optional(),slippageBps:z.coerce.number().int().min(0).max(10000).optional()});
export const executeBody=z.object({quoteId:z.uuid(),requestId:z.string().min(1).max(200)}).strict();
export const statusParams=z.object({requestId:z.uuid()});
export const bridgeQuoteResponse=z.object({quoteId:z.uuid(),requestId:z.string(),amountAtomic:z.string(),amountOutAtomic:z.string(),minAmountOutAtomic:z.string(),expiresAt:z.string(),simulated:z.boolean()}).passthrough();