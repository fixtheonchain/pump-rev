import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CalloutFacts, refusal } from './rules';

const policy = { attemptLimit: 5, spamLimit: 3, cooldownMs: 1000, minHoldingUsd: '0.000000000000000001' };
const valid: CalloutFacts = {
  duplicate: false, attempts: 1, spamAttempts: 1, lastCreatedAtMs: null, nowMs: 10000, contentValid: true,
  eligibleWallets: 1, holdingAtomic: '1', holdingUsd: '0.000000000000000001', priceUsd: '0.000000000000000001',
  marketCapUsd: '1', mayhemRunning: false, groupRequested: false, groupActor: false, groupAdmin: false,
  userBanned: false, coinBlocked: false,
};
test('callout rules accept an exact positive position and reject a duplicate before cooldown', () => {
  assert.equal(refusal(valid, policy), null);
  assert.equal(refusal({ ...valid, duplicate: true, lastCreatedAtMs: 9999 }, policy), 'DUPLICATE_CALLOUT');
  assert.equal(refusal({ ...valid, holdingAtomic: '0' }, { ...policy, minHoldingUsd: '0' }), 'INSUFFICIENT_BALANCE');
  assert.equal(refusal({ ...valid, holdingUsd: '0.0000000000000000009' }, policy), 'INSUFFICIENT_BALANCE');
});
test('budget, cooldown, wallet, Mayhem and squad gates reject independently', () => {
  for (const [overrides, code] of [
    [{ attempts: 6 }, 'ATTEMPT_LIMIT'], [{ spamAttempts: 4 }, 'SPAM_RESTRICTED'],
    [{ lastCreatedAtMs: 9999 }, 'COOLDOWN'], [{ eligibleWallets: 0 }, 'NO_ELIGIBLE_WALLET'],
    [{ mayhemRunning: true }, 'MAYHEM_NOT_COMPLETED'], [{ contentValid: false }, 'INVALID_CONTENT'],
    [{ groupRequested: true }, 'NOT_GROUP_ADMIN'], [{ groupActor: true }, 'GROUP_ACTOR_REQUIRED'],
    [{ priceUsd: '0' }, 'PRICE_UNAVAILABLE'],
  ] as [Partial<CalloutFacts>, string][]) assert.equal(refusal({ ...valid, ...overrides }, policy), code);
});
