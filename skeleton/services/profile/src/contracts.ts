import { z } from 'zod';
export const portfolioQuery = z.object({ filter:z.enum(['open','closed','all']).optional(),totalsOnly:z.enum(['true','false']).optional(),limit:z.coerce.number().int().positive().optional(),cursor:z.string().optional(),chain:z.string().optional() });
export const positionsQuery = portfolioQuery.extend({mints:z.string().optional()});
export const summaryQuery = z.object({user:z.string().min(1),chain:z.string().optional()});
export const portfolioParams = z.object({userId:z.string().min(1).max(256)});
export const positionSchema = z.object({wallet:z.string(),chain:z.string(),mint:z.string(),amount:z.string(),amountAtomic:z.string(),costBasisUsd:z.string().nullable(),realizedPnlUsd:z.string().nullable(),unrealizedPnlUsd:z.string().nullable(),valueUsd:z.string().nullable(),isExited:z.boolean(),basisComplete:z.boolean()}).passthrough();
export const portfolioResponse = z.object({userId:z.string(),positions:z.array(positionSchema),totals:z.record(z.string(),z.unknown()),limitations:z.array(z.string()),nextCursor:z.string()});