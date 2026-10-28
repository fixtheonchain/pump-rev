import {z} from 'zod';
import {defineRoutes,publicRead} from './registry';
const address=z.string().min(1),uuid=z.string().uuid(),atoms=z.string().regex(/^\d+$/),decimal=z.string().regex(/^-?\d+(\.\d+)?$/);
const object=z.record(z.string(),z.unknown()),requestId=z.string().min(1);
export const positionDto=z.object({wallet:z.string(),chain:z.string(),mint:z.string(),amount:z.string(),amountAtomic:atoms,costBasisUsd:decimal.nullable(),realizedPnlUsd:decimal.nullable(),unrealizedPnlUsd:decimal.nullable(),valueUsd:decimal.nullable(),isExited:z.boolean(),basisComplete:z.boolean()}).passthrough();
export const portfolioTotals=z.object({valueUsd:decimal.nullable(),costBasisUsd:decimal.nullable(),realizedPnlUsd:decimal.nullable(),unrealizedPnlUsd:decimal.nullable()});
export const portfolioDto=z.object({userId:z.string(),positions:z.array(positionDto),totals:portfolioTotals,limitations:z.array(z.string()),nextCursor:z.string()}).passthrough();
export const portfolioSummaryDto=z.object({totals:portfolioTotals,limitations:z.array(z.string()),commitment:z.string()}).passthrough();
export const transactionError=z.object({error:z.string(),data:z.object({reason:z.string(),retryable:z.boolean()})});
export const preparedTransaction=z.object({preparedId:uuid,transaction:z.string(),encoding:z.literal('base64'),blockhash:z.string(),lastValidBlockHeight:z.string(),expiresAt:z.string().nullable(),nonce:object.optional()}).passthrough();
const swapBody=z.object({user:address,mint:address,quote_mint:address,side:z.enum(['buy','sell']),amount_in:atoms,min_out:atoms,venue:z.enum(['pump','pumpswap']).optional(),pool:address.optional()}).strict();
const page=z.object({limit:z.coerce.number().int().positive().optional(),cursor:z.string().optional()});
const tx={auth:'session',implemented:true,errorStyle:'transaction'} as const;
const session={auth:'session',implemented:true} as const;
const publicRoute={auth:'optional',implemented:true} as const;
const bountyParams=z.object({id:uuid});
export const serviceRoutes=defineRoutes({
  'POST /nats/token':{summary:'Mint a one-hour subject-scoped user NATS bearer grant',...session,response:z.object({token:z.string(),expiresAt:z.string(),expiresInSeconds:z.literal(3600),subjects:z.array(z.string()),server:z.string(),account:z.literal('USER'),authentication:z.literal('token')})},
  'POST /api/blockchain/transactions/swap-build':{summary:'Build a curve or canonical pool swap',...tx,body:swapBody,response:preparedTransaction},
  'POST /api/blockchain/transactions/creator-fees':{summary:'Build creator-fee sweeps and collection',...tx,body:z.object({wallet:address,mint:address}).strict(),response:z.object({fees:z.object({claim_transaction:z.string(),is_claimable:z.boolean(),transactions:z.array(preparedTransaction)})})},
  'POST /api/blockchain/transactions/creator-fees/vault':{summary:'Build creator-vault collection',...tx,body:z.object({wallet:address,quote_mint:address.optional()}).strict(),response:z.object({fees:z.object({collect_transaction:z.string(),is_claimable:z.boolean(),transactions:z.array(preparedTransaction)})})},
  'POST /api/blockchain/transactions/send':{summary:'Send only a safely signed prepared transaction',...tx,body:z.object({preparedId:uuid.optional(),transaction:z.string().min(1),idempotencyKey:requestId,route:z.string().optional(),options:object.optional(),non_trade_tx:z.boolean().optional()}).strict(),response:z.object({signature:z.string(),status:z.string()})},
  'POST /api/blockchain-limit/transactions/limit-eligibility':{summary:'Check durable nonce order eligibility',...session,body:z.object({user:address,mint:address,quote_mint:address.optional(),nonce_account:address.optional()}).strict(),response:z.object({eligible:z.boolean(),reasons:z.array(z.string()),nonce_supported:z.boolean()})},
  'POST /api/blockchain-limit/transactions/swap-build-limit':{summary:'Build a durable nonce presigned swap',...session,body:z.object({user:address,mint:address,quote_mint:address,order_type:z.string(),amount_in:atoms,min_quote_out:atoms,trigger_mcap:decimal,nonce_account:address,nonce_landed_slot:atoms,request_id:requestId,deadline:z.string().datetime().optional()}).strict(),response:preparedTransaction.extend({order_type:z.string(),trigger_mcap:z.string(),deadline:z.string()})},
  'POST /api/blockchain-limit/transactions/send-limit':{summary:'Verify and store the presigned order',...session,body:z.object({preparedId:uuid,transaction:z.string().min(1),request_id:requestId}).strict(),response:z.object({order_id:z.string(),status:z.string()})},
  'POST /api/blockchain-limit/transactions/cancel-limit':{summary:'Cancel a stored order before execution',...session,body:z.object({order_id:z.string()}).strict(),response:z.object({order_id:z.string(),status:z.string()})},
  'GET /api/blockchain-limit/orders':{summary:'List the session wallet limit orders',...session,response:z.object({orders:z.array(object)})},
  'GET /user-portfolio/{userId}':publicRead('positions.read',{summary:'Portfolio positions and exact PnL',implemented:true,params:z.object({userId:address}),query:page.extend({filter:z.enum(['open','closed','all']).optional(),totalsOnly:z.enum(['true','false']).optional()}),response:portfolioDto}),
  'GET /user-positions/{userId}':publicRead('positions.read',{summary:'Position per requested mint',implemented:true,params:z.object({userId:address}),query:z.object({mints:z.string().optional()}),response:portfolioDto}),
  'PUT /v1/device-tokens':{summary:'Register a push delivery device',...session,body:z.object({token:z.string().min(1),platform:z.enum(['web','ios','android']),deviceId:z.string().min(1)}).strict(),response:object},
  'DELETE /v1/device-tokens/{deviceId}':{summary:'Revoke the current user device token',...session,params:z.object({deviceId:z.string().min(1)}),response:object},
  'POST /notifications/confirm-delivery':{summary:'Record a notification delivery receipt',...session,body:z.object({notificationId:uuid,deviceId:z.string().min(1)}).strict(),response:object},
  'GET /notifications':{summary:'Read the current user notifications',...session,query:page,response:object},
  'GET /livestream':{summary:'Current stream for a coin',...publicRoute,query:z.object({mintId:address}),response:z.union([object,z.literal('')])},
  'GET /livestream/history':{summary:'Historical streams for a coin',...publicRoute,query:z.object({mintId:address,limit:z.coerce.number().int().positive().optional(),offset:z.coerce.number().int().nonnegative().optional()}),response:object},
  'POST /livestream/start':{summary:'Start a coin creator stream',...session,body:z.object({chain:z.string(),mintId:address,title:z.string(),requestId}).strict(),response:object},
  'POST /livestream/{id}/stop':{summary:'Stop an owned stream',...session,params:z.object({id:uuid}),body:z.object({requestId}).strict(),response:object},
  'GET /clips/{mint}':{summary:'List coin recordings',...publicRoute,params:z.object({mint:address}),query:page.extend({clipType:z.enum(['HIGHLIGHT','COMPLETE']).optional()}),response:object},
  'GET /clips/{mint}/counts':{summary:'Recording counts for a coin',...publicRoute,params:z.object({mint:address}),response:object},
  'GET /clips/{mint}/{clipId}':{summary:'Get a recording',...publicRoute,params:z.object({mint:address,clipId:z.string()}),response:object},
  'POST /clips':{summary:'Create a clip from an owned stream',...session,body:z.object({streamId:uuid,startTime:z.number().int().nonnegative(),endTime:z.number().int().positive(),title:z.string(),requestId}).strict(),response:object},
  'GET /coins/currently-live':{summary:'Coins with active local streams',...publicRoute,query:page,response:object},
  'POST /bounties/tasks':{summary:'Create a bounty draft',...session,body:z.object({title:z.string(),markdown:z.string(),chain:z.string().optional(),coinAddress:address.optional(),expiresAt:z.string().datetime(),requestId,pumpFollowerGate:z.boolean().optional()}).strict(),response:object},
  'POST /bounties/tasks/{id}/fund':{summary:'Fund a bounty escrow through the local provider',...session,params:bountyParams,body:z.object({mint:address,amountAtomic:atoms,requestId}).strict(),response:object},
  'POST /bounties/tasks/{id}/publish':{summary:'Publish a funded bounty',...session,params:bountyParams,body:z.object({requestId}).strict(),response:object},
  'POST /bounties/tasks/{id}/submissions':{summary:'Submit work to an open bounty',...session,params:bountyParams,body:z.object({markdown:z.string(),requestId}).strict(),response:object},
  'POST /bounties/tasks/{id}/resolve':{summary:'Propose a bounty payout and refund split',...session,params:bountyParams,body:z.object({submissionId:uuid.optional(),refundBps:z.number().int().min(0).max(10000),requestId}).strict(),response:object},
  'POST /bounties/tasks/{id}/finalize-expired':{summary:'Finalize an expired bounty or elapsed dispute',...session,params:bountyParams,body:z.object({requestId}).strict(),response:object},
  'POST /bounties/tasks/{id}/recover':{summary:'Recover the escrow refund once',...session,params:bountyParams,body:z.object({requestId}).strict(),response:object},
  'GET /bounties/tasks/{id}':{summary:'Get a bounty and its escrow state',...publicRoute,params:bountyParams,response:object},
  'GET /bounties/v2/tasks':{summary:'List public bounty tasks',...publicRoute,query:page.extend({coinAddress:address.optional(),phase:z.string().optional()}),response:object},
  'GET /bounties/v2/stats':{summary:'Bounty phase and payout totals',...publicRoute,response:object},
  'GET /api/relay/quote':{summary:'Get a Relay-shaped local bridge quote',...session,query:z.object({fromChain:z.string(),toChain:z.string(),fromToken:address,toToken:address,amount:atoms,userAddress:address,recipient:address,subsidizeFees:z.enum(['true','false']).optional(),originGasOverhead:atoms.optional(),slippageBps:z.coerce.number().int().min(0).max(10000)}),response:object},
  'POST /api/relay/quote':{summary:'Create a bridge quote',...session,body:z.object({originChain:z.string(),destinationChain:z.string(),originCurrency:address,destinationCurrency:address,amountAtomic:atoms,recipient:address,requestId,slippageBps:z.number().int().min(0).max(10000).optional()}).strict(),response:object},
  'POST /api/relay/execute':{summary:'Execute a previously quoted bridge intent once',...session,body:z.object({quoteId:uuid,requestId}).strict(),response:object},
  'GET /api/relay/status/{requestId}':{summary:'Get the current user bridge intent status',...session,params:z.object({requestId:uuid}),response:object},
});
