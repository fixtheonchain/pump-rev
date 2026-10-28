import Decimal from 'decimal.js';

// The refusal names and ordering are derived from features/social-and-callouts.md.
// Numeric policy values absent from that evidence must be supplied through configuration.
export interface CalloutPolicy {
  attemptLimit: number;
  spamLimit: number;
  cooldownMs: number;
  minHoldingUsd: string;
}
export interface CalloutFacts {
  duplicate: boolean;
  attempts: number;
  spamAttempts: number;
  lastCreatedAtMs: number | null;
  nowMs: number;
  contentValid: boolean;
  eligibleWallets: number;
  holdingAtomic: string;
  holdingUsd: string;
  priceUsd: string;
  marketCapUsd: string;
  mayhemRunning: boolean;
  groupRequested: boolean;
  groupActor: boolean;
  groupAdmin: boolean;
  userBanned: boolean;
  coinBlocked: boolean;
}
export type CalloutRefusal = 'DUPLICATE_CALLOUT' | 'ATTEMPT_LIMIT' | 'SPAM_RESTRICTED' | 'COOLDOWN'
  | 'INVALID_CONTENT' | 'NO_ELIGIBLE_WALLET' | 'INSUFFICIENT_BALANCE' | 'PRICE_UNAVAILABLE'
  | 'MAYHEM_NOT_COMPLETED' | 'GROUP_ACTOR_REQUIRED' | 'NOT_GROUP_ADMIN' | 'WALLET_NOT_ALLOWED' | 'COIN_BLOCKED';

export function refusal(facts: CalloutFacts, policy: CalloutPolicy): CalloutRefusal | null {
  if (facts.userBanned) return 'WALLET_NOT_ALLOWED';
  if (facts.coinBlocked) return 'COIN_BLOCKED';
  if (facts.duplicate) return 'DUPLICATE_CALLOUT';
  if (facts.attempts > policy.attemptLimit) return 'ATTEMPT_LIMIT';
  if (facts.spamAttempts > policy.spamLimit) return 'SPAM_RESTRICTED';
  if (facts.lastCreatedAtMs !== null && facts.nowMs - facts.lastCreatedAtMs < policy.cooldownMs) return 'COOLDOWN';
  if (!facts.contentValid) return 'INVALID_CONTENT';
  if (facts.groupActor && !facts.groupRequested) return 'GROUP_ACTOR_REQUIRED';
  if (facts.groupRequested && !facts.groupAdmin) return 'NOT_GROUP_ADMIN';
  if (facts.eligibleWallets === 0) return 'NO_ELIGIBLE_WALLET';
  if (facts.mayhemRunning) return 'MAYHEM_NOT_COMPLETED';
  if (new Decimal(facts.priceUsd).lte(0) || new Decimal(facts.marketCapUsd).lte(0)) return 'PRICE_UNAVAILABLE';
  if (new Decimal(facts.holdingAtomic).lte(0) || new Decimal(facts.holdingUsd).lt(policy.minHoldingUsd)) return 'INSUFFICIENT_BALANCE';
  return null;
}

