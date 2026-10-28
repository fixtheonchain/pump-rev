import { z } from 'zod';

export const API_SCOPES = ['profiles.read', 'graph.read', 'content.read', 'leaderboards.read', 'positions.read', 'moderation.read'] as const;
export type ApiScope = typeof API_SCOPES[number];
export type Retryability = 'never' | 'after' | 'immediate';
type ErrorDefinition = {status: number; owner: string; summary: string; actionable: boolean; retryable: Retryability};
function entry(status: number, owner: string, summary: string, retryable: Retryability = 'never', actionable = true): ErrorDefinition {
  return {status, owner, summary, actionable, retryable};
}
// Codes observed in features/*.md and data/frontend-api-v3-contract.md.
// HTTP mappings not quoted by the research are explicit local contract decisions.
export const ERROR_CODES = {
  DUPLICATE_CALLOUT: entry(409, 'callout', 'A live callout already exists for this author and coin'),
  ATTEMPT_LIMIT: entry(429, 'callout', 'Callout attempt budget exhausted', 'after'),
  COOLDOWN: entry(429, 'callout', 'Wait before creating another callout', 'after'),
  SPAM_RESTRICTED: entry(429, 'callout', 'Callout spam throttle exceeded', 'after'),
  INSUFFICIENT_BALANCE: entry(403, 'callout', 'Hold the coin before calling it out'),
  NO_ELIGIBLE_WALLET: entry(403, 'callout', 'No linked non-reserved wallet is eligible'),
  MAYHEM_NOT_COMPLETED: entry(409, 'callout', 'Wait for the Mayhem run to complete', 'after'),
  INVALID_CONTENT: entry(422, 'callout', 'Content did not pass validation'),
  PRICE_UNAVAILABLE: entry(503, 'callout', 'A trusted price is unavailable', 'after'),
  NOT_GROUP_ADMIN: entry(403, 'groups', 'Only a squad owner or admin can act as the squad'),
  GROUP_ACTOR_REQUIRED: entry(403, 'groups', 'A valid squad actor is required'),
  PROFILE_NOT_MIRRORED: entry(409, 'auth', 'The communities profile is not available yet', 'after'),
  ACCOUNT_NOT_FOUND: entry(404, 'auth', 'No account exists for the verified identity'),
  REGISTER_THROTTLED: entry(429, 'auth', 'Account registration is busy', 'after'),
  WALLET_NOT_ALLOWED: entry(403, 'auth', 'This wallet cannot perform this action'),
  COIN_BLOCKED: entry(403, 'coins', 'The coin is blocked by its security verdict'),
  BLOCKED_BY_AUTHOR: entry(403, 'callout', 'The thread author blocked this account'),
  EXISTING_CALLOUT: entry(409, 'callout', 'A live callout already exists'),
  USERNAME_TAKEN: entry(409, 'users', 'That username is already in use'),
  NOT_MUTUAL: entry(403, 'dms', 'Direct messages require mutual follows'),
  RATE_LIMITED: entry(429, 'bff', 'Request budget exhausted', 'after'),
  MEDIA_REJECTED: entry(422, 'media', 'Media screening refused this upload'),
  LABEL_LIMIT_REACHED: entry(409, 'wallet-labels', 'The wallet label limit was reached'),
  SELF_REPORT: entry(400, 'moderation', 'You cannot report yourself'),
  ALREADY_IN_GROUP: entry(409, 'groups', 'The membership cap was reached'),
  GROUP_FULL: entry(409, 'groups', 'The squad has no free seats'),
  COMPETITION_KIND_MISMATCH: entry(400, 'competitions', 'The entry does not match the competition kind'),
  COMPETITION_REGISTER_BUSY: entry(429, 'competitions', 'Registration is busy', 'after'),
  PORTFOLIO_BUILDING: entry(409, 'profile', 'The portfolio is still being built', 'after'),
  NATS_AUTH_USER_SCOPE_REQUIRED: entry(403, 'nats-auth', 'A communities user is required'),
  API_CREDENTIAL_NOT_ALLOWED: entry(401, 'api-platform', 'This credential kind is not accepted on this host'),
  API_KEY_INVALID: entry(401, 'api-platform', 'The API key is invalid'),
  API_KEY_REVOKED: entry(401, 'api-platform', 'The API key has been revoked'),
  API_KEY_RATE_LIMITED: entry(429, 'api-platform', 'The API key burst budget was exceeded', 'after'),
  API_ORG_NOT_APPROVED: entry(403, 'api-platform', 'The developer organization is not approved'),
  API_ORG_SUSPENDED: entry(403, 'api-platform', 'The developer organization is suspended'),
  API_REGION_RESTRICTED: entry(403, 'api-platform', 'The caller region is restricted'),
  API_SCOPE_FORBIDDEN: entry(403, 'api-platform', 'The key does not have the required scope'),
  API_USER_REQUIRED: entry(400, 'api-platform', 'Provide an explicit user for this keyed request'),
  API_PLATFORM_ACCOUNT_REQUIRED: entry(403, 'api-platform', 'A communities account is required'),
  // Skeleton infrastructure codes, deliberately distinct from observed domain codes.
  UNAUTHENTICATED: entry(401, 'auth', 'A valid session is required'),
  FORBIDDEN: entry(403, 'bff', 'Access is forbidden'),
  INVALID_ARGUMENT: entry(400, 'bff', 'The request does not match the contract'),
  NOT_FOUND: entry(404, 'bff', 'The requested resource does not exist'),
  UPSTREAM_UNAVAILABLE: entry(503, 'bff', 'An upstream lane is unavailable', 'after', false),
  NOT_IMPLEMENTED: entry(501, 'bff', 'This route is not implemented', 'never', false),
  IDEMPOTENCY_CONFLICT: entry(409,'workflow','This idempotency key names different input'),
  INVALID_STATE: entry(409,'workflow','This state transition is not available'),
  FUNDING_REQUIRED: entry(409,'live','Fund the escrow before publishing'),
  QUOTE_EXPIRED: entry(409,'bridge','The quote expired'),
  PROVIDER_UNAVAILABLE: entry(503,'integrations','The provider is unavailable','after'),
  BALANCE_UNAVAILABLE: entry(503,'profile','A trustworthy balance is unavailable','after'),
  INTERNAL: entry(500, 'bff', 'An internal error occurred', 'never', false),
} as const;
export type ErrorCode = keyof typeof ERROR_CODES;
export const KEYED_ROUTE_CODES = ['API_CREDENTIAL_NOT_ALLOWED','API_KEY_INVALID','API_KEY_REVOKED','API_KEY_RATE_LIMITED','API_ORG_NOT_APPROVED','API_ORG_SUSPENDED','API_REGION_RESTRICTED','API_SCOPE_FORBIDDEN','API_USER_REQUIRED'] as const satisfies readonly ErrorCode[];
export const errorEnvelope = z.object({
  statusCode: z.number(), timestamp: z.string(), path: z.string(), error: z.string(),
  code: z.enum(Object.keys(ERROR_CODES) as [ErrorCode, ...ErrorCode[]]), message: z.string(),
  retryAfterMs: z.number().optional(), degraded_lanes: z.array(z.string()).optional(),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelope>;

export const MIN_DEPRECATION_NOTICE_DAYS = 90;
export type RouteDefinition = {
  errorStyle?: 'transaction';
  summary: string; params?: z.ZodType; query?: z.ZodType; body?: z.ZodType;
  response: z.ZodType; emits?: readonly ErrorCode[]; multipart?: boolean;
  scope?: ApiScope; auth?: 'none' | 'optional' | 'session'; implemented?: boolean;
  flag?: string; keyedUserRequired?: boolean; deprecated?: {since: string; sunset: string};
};
export type RouteKey = `${'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} /${string}`;
export function defineRoutes<const T extends Record<RouteKey, RouteDefinition>>(routes: T): T {
  for (const [key, definition] of Object.entries(routes)) {
    if (definition.deprecated) {
      const {since, sunset} = definition.deprecated;
      const start = Date.parse(since), end = Date.parse(sunset);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end - start < MIN_DEPRECATION_NOTICE_DAYS * 86400000) {
        throw new Error(`Invalid deprecation notice for ${key}: requires at least 90 days`);
      }
    }
    for (const code of definition.emits ?? []) if (!(code in ERROR_CODES)) throw new Error(`Unknown error code: ${code}`);
  }
  return routes;
}
export function publicRead<const S extends ApiScope, const T extends RouteDefinition>(scope: S, definition: T): T & {scope: S} {
  return {...definition, scope, auth: definition.auth ?? 'optional', emits: [...new Set([...(definition.emits ?? []), ...KEYED_ROUTE_CODES])]};
}
