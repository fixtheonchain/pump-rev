import { z } from 'zod';
export const deviceBody=z.object({token:z.string().min(1),platform:z.enum(['web','ios','android']),deviceId:z.string().min(1).max(200)}).strict();
export const deviceParams=z.object({deviceId:z.string().min(1).max(200)});
export const receiptBody=z.object({notificationId:z.uuid(),deviceId:z.string().min(1).max(200)}).strict();
export const notificationQuery=z.object({limit:z.coerce.number().int().positive().optional(),cursor:z.string().optional()});
export const notificationItem=z.object({id:z.uuid(),kind:z.string(),payload:z.unknown(),createdAt:z.string()});
export const notificationPage=z.object({items:z.array(notificationItem),nextCursor:z.string()});