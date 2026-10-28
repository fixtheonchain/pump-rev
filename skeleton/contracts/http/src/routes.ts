import {serviceRoutes,portfolioSummaryDto} from './service-routes';
import { z } from 'zod';
import { defineRoutes, publicRead } from './registry';

export const SOLANA_CHAIN = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
export const chain = z.string().regex(/^[a-z0-9]+:[A-Za-z0-9_-]+$/);
const address = z.string().min(1);
const uuid = z.string().uuid();
const uint = z.string().regex(/^\d+$/);
const decimal = z.string().regex(/^-?\d+(\.\d+)?$/);
const page = z.object({limit: z.coerce.number().int().min(1).optional(),cursor:z.string().optional()});
export const userDto = z.object({id:uuid,username:z.string(),bio:z.string(),kind:z.string(),canonicalSvmWallet:z.string(),canonicalEvmWallet:z.string(),banned:z.boolean()});
export const ordinalDto = z.object({blockId:uint,txIndex:z.number().int(),eventIndex:z.number().int(),blockTimeMs:z.string()});
export const tradeDto = z.object({ordinal:ordinalDto,signature:z.string(),wallet:z.string(),side:z.string(),baseAmount:uint,quoteAmount:uint,quoteMint:z.string(),priceUsd:decimal,marketCapUsd:decimal,feeProtocol:uint,feeCreator:uint,commitment:z.string(),slotIndexId:z.string()});
export const coinDto = z.object({chain,address,name:z.string(),symbol:z.string(),priceUsd:decimal,marketCapUsd:decimal,holderCount:z.coerce.number(),complete:z.boolean(),mayhem:z.boolean(),baseDecimals:z.number(),quoteDecimals:z.number(),quoteMint:z.string(),ordinal:ordinalDto.nullish(),commitment:z.string()});
export const calloutDto = z.object({id:uuid,author:userDto,chain,coin:address,thesis:z.string(),mediaId:z.string(),actingGroup:z.string(),createdAt:z.string(),priceUsdAtCall:decimal,calledOutAtMcap:decimal,status:z.string(),quotedCalloutId:z.string()});
export const calloutInput = z.object({
  coinMint:address,thesis:z.string().optional(),version:z.coerce.number().int().min(1).max(2).optional(),
  chain:chain.optional(),chainId:chain.optional(),asGroupId:uuid.optional(),quotedCalloutId:uuid.optional(),mediaId:uuid.optional(),
  sourceRef:z.string().regex(/^collectible:[0-9a-f-]{36}$/).optional(),
}).strict().refine(x => !x.chain || !x.chainId || x.chain === x.chainId, {message:'chain and chainId must agree'});
const authBody = z.object({identityToken:z.string().min(1)}).strict();
const tokenDto = z.object({token:z.string(),user:userDto,expiresAt:z.string()});
const health = z.object({status:z.string()});
const readParams = z.object({chainId:chain,address});
const commitment = z.enum(['processed','confirmed']).optional();
const unknownPage = z.object({items:z.array(z.unknown()),nextCursor:z.string().optional()});
const reserved = {implemented:false} as const;
export const routes = defineRoutes({
  'GET /health': {summary:'Liveness health check',auth:'none',response:health,implemented:true},
  'POST /auth/login/token': {summary:'Authenticate and return the session token as a bearer token',auth:'none',body:authBody,response:tokenDto,emits:['ACCOUNT_NOT_FOUND','UNAUTHENTICATED'],implemented:true},
  'POST /auth/login/session': {summary:'Authenticate and establish the auth_token cookie session',auth:'none',body:authBody,response:tokenDto,emits:['ACCOUNT_NOT_FOUND','UNAUTHENTICATED'],implemented:true},
  'GET /auth/my-profile': {summary:'Get the current session profile',auth:'session',response:userDto,implemented:true},
  'POST /auth/logout': {summary:'Clear and revoke the current session',auth:'session',response:z.object({success:z.boolean()}),implemented:true},
  'GET /auth/disabled-features': {summary:'Get disabled features for the caller',auth:'none',response:z.object({disabledFeatures:z.array(z.string())}),implemented:true},
  'GET /trades/{chainId}/{address}': {summary:'A coin trade tape, newest first',params:readParams,query:page.extend({commitment}),response:z.object({trades:z.array(tradeDto),nextCursor:z.string()}),auth:'optional',implemented:true},
  'GET /candles/{chainId}/{address}': {summary:'A coin OHLCV bars, oldest first',params:readParams,query:z.object({res:z.string(),measure:z.literal('price_usd').optional(),fromMs:z.string().regex(/^\d+$/).optional(),toMs:z.string().regex(/^\d+$/).optional(),limit:z.coerce.number().int().min(1).optional(),commitment}),response:z.object({candles:z.array(z.object({timeMs:z.string(),open:decimal,high:decimal,low:decimal,close:decimal,volumeBase:uint,volumeQuote:uint,tradeCount:z.coerce.number()})),res:z.string(),measure:z.string()}),auth:'optional',implemented:true},
  'GET /coins-v2/{mint}': {summary:'Get an enriched coin by mint',params:z.object({mint:address}),query:z.object({chain:chain.optional(),commitment}),response:coinDto,auth:'optional',implemented:true},
  'GET /coins-v3/{address}': {summary:'Resolve a coin by address',params:z.object({address}),query:z.object({chain:chain.optional(),commitment}),response:coinDto,auth:'optional',implemented:true},
  'GET /token-holders/{mint}/count': {summary:'Get a token unique holder count',params:z.object({mint:address}),query:z.object({chain:chain.optional(),commitment}),response:z.object({holderCount:z.coerce.number()}),auth:'optional',implemented:true},
  'GET /users/{id}': publicRead('profiles.read',{summary:'Get a user by wallet or id',params:z.object({id:address}),response:userDto,implemented:true}),
  'GET /users': publicRead('profiles.read',{summary:'List users',query:page,response:z.object({users:z.array(userDto),nextCursor:z.string()}),implemented:true}),
  'GET /users/search-v2': publicRead('profiles.read',{summary:'Search users',query:page.extend({searchTerm:z.string()}),response:z.object({users:z.array(userDto),nextCursor:z.string()}),implemented:true}),
  'POST /following/v2/{userId}': {summary:'Follow a user',auth:'session',params:z.object({userId:uuid}),query:z.object({origin:z.string().optional()}),response:z.object({following:z.boolean()}),implemented:true},
  'DELETE /following/{userId}': {summary:'Unfollow a user',auth:'session',params:z.object({userId:uuid}),response:z.object({following:z.boolean()}),implemented:true},
  'GET /following/v3/followers/{userId}': publicRead('graph.read',{summary:'Page followers',params:z.object({userId:address}),query:page,response:z.object({users:z.array(userDto),nextCursor:z.string(),count:z.coerce.number()}),implemented:true}),
  'GET /following/v3/following/{userId}': publicRead('graph.read',{summary:'Page followees',params:z.object({userId:address}),query:page,response:z.object({users:z.array(userDto),nextCursor:z.string(),count:z.coerce.number()}),implemented:true}),
  'POST /callout/create': {summary:'Create a position-backed callout',auth:'session',multipart:true,body:calloutInput,response:z.object({callout:calloutDto}),emits:['DUPLICATE_CALLOUT','ATTEMPT_LIMIT','COOLDOWN','SPAM_RESTRICTED','INSUFFICIENT_BALANCE','NO_ELIGIBLE_WALLET','MAYHEM_NOT_COMPLETED','INVALID_CONTENT','PRICE_UNAVAILABLE','NOT_GROUP_ADMIN','GROUP_ACTOR_REQUIRED'],implemented:true,flag:'callouts'},
  'GET /callout/eligibility/{coinMint}': {summary:'Check callout eligibility',auth:'session',params:z.object({coinMint:address}),query:z.object({chain:chain.optional(),asGroupId:uuid.optional()}),response:z.object({eligible:z.boolean(),reason:z.string(),preflight:z.object({existingCallout:z.boolean(),attemptsRemaining:z.number(),cooldownUntil:z.string()})}),implemented:true},
  'GET /callout/{calloutId}': publicRead('content.read',{summary:'Get a callout with its author',params:z.object({calloutId:uuid}),response:calloutDto,implemented:true}),
  // Observed routes reserved in the contract; handlers are not implemented.
  'GET /callout/coin/{coin}': publicRead('content.read',{summary:'Top callouts on a coin',params:z.object({coin:address}),query:page.extend({chain:chain.optional()}),response:unknownPage,...reserved}),
  'GET /home-feed': publicRead('content.read',{summary:'Trending coins with followed trader callouts',query:page.extend({chains:z.string().optional()}),response:unknownPage,...reserved}),
  'GET /posts/{postId}': publicRead('content.read',{summary:'Get one post',params:z.object({postId:uuid}),response:z.record(z.string(),z.unknown()),...reserved}),
  'GET /dms/eligibility/{userId}': {summary:'Check mutual-follow DM eligibility',auth:'session',params:z.object({userId:uuid}),response:z.object({eligible:z.boolean()}),emits:['NOT_MUTUAL'],...reserved},
  'GET /groups/{groupId}/members': publicRead('graph.read',{summary:'Page squad members',params:z.object({groupId:uuid}),query:page,response:unknownPage,...reserved}),
  'GET /competitions': publicRead('leaderboards.read',{summary:'Upcoming, live and past competitions',response:z.object({upcoming:z.array(z.unknown()),live:z.array(z.unknown()),past:z.array(z.unknown())}),...reserved}),
  'GET /pnl-leaderboard': publicRead('leaderboards.read',{summary:'PnL board for a period',query:z.object({period:z.string(),limit:z.coerce.number().int().optional()}),response:unknownPage,...reserved}),
  'GET /achievements/catalog': {summary:'Achievement catalog',auth:'optional',response:z.array(z.unknown()),...reserved},
  'POST /share-video/replay': {summary:'Start or fetch a content-addressed replay render',auth:'session',body:z.object({wallet:address,mint:address,chain:chain.optional(),cut:z.enum(['full','social']).optional()}),response:z.object({renderId:z.string()}),...reserved},
  'GET /fees/creator/{address}': {summary:'Creator fee earnings and claimable balance',params:z.object({address}),response:z.record(z.string(),z.unknown()),auth:'optional',...reserved},
  'GET /fees/holder-rewards': {summary:'Holder rewards open-day book',query:page,response:unknownPage,auth:'optional',implemented:true},
  'GET /referral/me': {summary:'Referral state for the current user',query:z.object({userId:address.optional()}),response:z.record(z.string(),z.unknown()),auth:'session',...reserved},
  'GET /payouts/leaderboard': publicRead('leaderboards.read',{summary:'Confirmed payout board',query:z.object({period:z.string().optional()}),response:unknownPage,...reserved}),
  'GET /mint-positions/{mint}': publicRead('positions.read',{summary:'Users holding a position in a mint',params:z.object({mint:address}),query:page,response:unknownPage,...reserved}),
  'GET /portfolio-summary': publicRead('positions.read',{summary:'Merged portfolio for wallet, username, user or squad',query:z.object({user:address.optional()}),keyedUserRequired:true,response:portfolioSummaryDto,implemented:true}),
  'GET /coins/boards/{board}': {summary:'Fold-ranked coin board',params:z.object({board:z.string()}),response:unknownPage,auth:'optional',flag:'uapiCoinLists',...reserved},
  'GET /perps/orders/{userId}': {summary:'Resting HyperCore orders',params:z.object({userId:address}),query:page,response:z.object({orders:z.array(z.unknown())}),auth:'optional',...reserved},
  'POST /wallet-mapping/challenge': {summary:'Single-use EVM wallet linking challenge',auth:'session',body:z.object({evmAddress:z.string()}),response:z.record(z.string(),z.unknown()),...reserved},
  'GET /packs': {summary:'Merged graded-card pack catalog',auth:'optional',query:z.object({category:z.string().optional()}),response:z.record(z.string(),z.unknown()),...reserved},
  'GET /mayhem/overview': {summary:'Mayhem landing overview',auth:'optional',response:z.record(z.string(),z.unknown()),...reserved},
  'POST /mayhem/partner/{mint}/trigger': {summary:'Trigger a partner Mayhem trade',params:z.object({mint:address}),body:z.object({wallet:address,request_id:z.string().uuid()}),response:z.record(z.string(),z.unknown()),auth:'session',flag:'MAYHEM_PARTNER_ROUTES_ENABLED',...reserved},
  'GET /developer/keys': {summary:'List API key metadata without plaintext',auth:'session',response:z.array(z.unknown()),...reserved},
  'GET /moderation/ban/address/{address}': publicRead('moderation.read',{summary:'Whether a wallet is banned',params:z.object({address}),response:z.object({banned:z.boolean()}),...reserved}),
  'GET /feed/video-feed': publicRead('content.read',{summary:'Curated clips and live coins',query:page,response:unknownPage,implemented:true}),
  'GET /app-banner': {summary:'In-app announcement banner',auth:'optional',response:z.unknown(),...reserved},
  ...serviceRoutes,
});
export type Routes = typeof routes;

