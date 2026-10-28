# Keepers and signers

The jobs that hold a key, move money or act on chain without a user clicking. Keys and balances are from
[../onchain/authorities.md](../onchain/authorities.md); cadences and rules from pump.fun's docs and the contract.
The job boundaries are [inferred] from the instructions and endpoints each one needs.

| Job | Signs with | Does | Cadence and rules | Evidence |
| --- | --- | --- | --- | --- |
| Holder-rewards distributor | `HckQ93Xq…` (`holder_reward_claim_authority`, keypair) | Collects the creator fee into each coin's `["holder-rewards", mint]` PDA, computes holders ≥ US$20, reserves distribution costs, calls `distribute_fee_to_holders(amounts)` with (owner, quote ATA) pairs | Runs when the vault holds the reserve plus US$20 and the holder count is under the cap; book refreshed every 60 s | [idl] [site-docs fees] [contract] |
| Buyback sweeper | `4zmJQ6KQ…` (buyback vault authority) → `99mRw3Ez…` ("Pump Buybacks") | Sweeps the eight Pump Fees buyback vaults (`sweep_buyback`), swaps to PUMP on Jupiter, burns | Daily spend shown on `/pump-token` ($772.4K on 2026-10-28); rate limit per vault in `FeeProgramGlobal` | [chain] [tx] [page] |
| Boost buy-and-burn | `HTVZVEQM…` (`boost_authority`) | `boost_buy_and_burn` from a pool's boost vault | Per boosted pool | [idl] [chain] |
| Migration | `39azUYFW…` ("Pump.fun: Migration") | Runs `migrate_v2` for completed curves when no user trade did it; receives the remainder; pays the 0.015 SOL migration fee for non-SOL pairs | On each completed curve | [chain] [site-docs fees] |
| Mayhem agent | `Gygj9QQb…` (operator) with the `["sol-vault"]` PDA `BwWK17cb…` | Random-walk buys and sells on Mayhem coins for 24 h, `set_mayhem_virtual_params`, burns leftovers at 24 h; manual triggers from creators, Party holders and partners | Hard caps on SOL in and out and on trade count; a per-mint trigger lock | [site-docs mayhem-mode] [tx] [contract] |
| Tokenized-agent buyback | `GmFrDZT2…` (Agent Payments `buyback_authority`) | Converts deposits (SOL, USDC, USDT, USD1) and calls `agent_buyback_trigger` with a swap, burning the bought tokens | Hourly | [site-docs tokenized-agent-disclaimer] [idl] [chain] |
| Social-fee payer | `2sMrGNK8…` (`social_claim_authority`) | `claim_social_fee_pda` for GitHub-linked fee accounts | On claim | [idl] [chain] |
| Donation crank | anyone | `crank_donation_fee_pda` forwards donation PDAs to Donation Relay, which swaps and distributes | On crank | [idl] |
| Limit-order trigger | the user's own signature on a durable-nonce transaction; the keeper only sends | Watches market cap per mint and sends the presigned swap once the trigger is crossed; records settlement | Continuous; nonce advance makes the order single-use | [bundle] [inferred] |
| Callout-rewards payouts | Program Operator's USDC wallet | Daily rounds: rank by the activity metric, cut the referrer share, pay USDC; `confirmed`, in-flight, failed and rejected states | Daily | [site-docs callout-reward-terms] [contract] |
| Referral first-deposit match | same payout rail | Pays the referrer USDC when a referee's first deposit qualifies inside 24 h of account creation | On deposit | [contract] |
| Bounty escrow settlement | a Go.fun escrow authority [inferred] | Resolves tasks, pays submissions, refunds by `refundBps`, finalizes expired tasks; reconcile jobs for decision, fees, payout, finalize | On resolution, expiry or moderation | [bundle] |
| Perps relay tracker | pump.fun's builder service | Tracks each Relay request for deposits and withdrawals until `success`, switches payout asset if needed | Long-poll per request | [bundle] |
| CTO executor | `UqN2p5bA…` (Squads vault) | `admin_cto`: reassigns creator fees, converts to holder rewards | On approved takeover | [chain] [idl] |
| Quote control | `2fAEoCqd…`, `9D6H6Yp6…` | Adds custom-pair quote mints and reprices their starting reserves (202 repriced on 2026-10-28) | On listing changes | [chain] |
| Competition and board folds | none (off chain) | Rebuild boards, snapshot rosters at start, freeze at end, apply strikes and blocklists | Periodic | [contract] |
| Vanity key pool | the server holds pool keypairs | Hands out `…pump` mint keys (`/vanity/random-mint-public-key`) and co-signs creates (`sign-create-tx`) | On create | [contract] [bundle] |

## Patterns across the keepers

- **Hot keypairs with small balances** run the high-frequency jobs (holder rewards, boost, buyback sweeps, agent
  buybacks); **Squads vaults** hold the rare, high-impact powers (upgrades, CTO, fee config) [chain].
- **Amounts decided off chain**: holder-rewards amounts, buyback destinations, Mayhem trades and agent swaps are
  passed in by the signer, and the programs gate them by the signer's role [idl].
- **User-signed, server-sent**: limit orders and claims are signed by the user and landed by pump.fun
  (`transactions/send`, `send-limit`), so the server never holds the user's key [bundle].
