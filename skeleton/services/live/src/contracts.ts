import { z } from 'zod';
const requestId=z.string().min(1).max(200);
export const requestBody=z.object({requestId}).strict();
export const streamStartBody=z.object({chain:z.string().min(1),mintId:z.string().min(1),title:z.string().min(1),requestId}).strict();
export const clipCreateBody=z.object({streamId:z.uuid(),startTime:z.coerce.number().int().nonnegative(),endTime:z.coerce.number().int().positive(),title:z.string().optional(),requestId}).strict().refine(x=>x.endTime>x.startTime);
export const bountyCreateBody=z.object({title:z.string().min(1),markdown:z.string().min(1),chain:z.string().optional(),coinAddress:z.string().optional(),expiresAt:z.iso.datetime(),pumpFollowerGate:z.boolean().optional(),requestId}).strict();
export const bountyFundBody=z.object({mint:z.string().min(1),amountAtomic:z.string().regex(/^[1-9]\d*$/).max(78),requestId}).strict();
export const bountySubmissionBody=z.object({markdown:z.string().min(1),requestId}).strict();
// refundBps is observed in features/packs-mayhem-agents-bounties.md; the remainder goes to the selected submission.
export const bountyResolveBody=z.object({submissionId:z.uuid().optional(),refundBps:z.number().int().min(0).max(10000),requestId}).strict();
export const bountyPageQuery=z.object({coinAddress:z.string().optional(),phase:z.string().optional(),limit:z.coerce.number().int().positive().optional(),cursor:z.string().optional()});
export const idParams=z.object({id:z.uuid()});