# Money flow: where every lamport of a trade goes

All rates below were read from chain on 2026-10-26 (`[chain]`, slot 461,522,470). Every split was checked against
decoded mainnet trades (`[tx]`, signatures given). Rates are basis points of the trade's quote amount.

## The parameters

| Parameter | Live value | Where it lives |
| --- | --- | --- |
| Curve fee, all quote types | LP 0 / protocol **95** / creator **30** bps = **1.25%** | Pump Fees `FeeConfig` `8Wf5TiAh…` |
| Buyback share of the protocol fee | **5,000 bps (50%)**, both programs | Pump `Global.buyback_basis_points`, PumpSwap `GlobalConfig.buyback_basis_points` |
| PumpSwap canonical pool, SOL quote | 25 market-cap tiers (table below) | Pump Fees `FeeConfig` `5PHirr8j…` `fee_tiers` |
| PumpSwap canonical pool, USDC quote | 25 tiers in USDC (table below) | same, `stable_fee_tiers` |
| PumpSwap canonical pool, custom quote | LP 20 / protocol 5 / creator 5 bps, or the coin's own creator bps up to 300 | `exotic_flat_fees`, `Global.max_configurable_creator_fee_bps` |
| Any other PumpSwap pool | LP 25 / protocol 5 / creator 0 bps | `flat_fees` |
| Migration fee | 15,000,001 lamports per graduation | Pump `Global.pool_migration_fee` |
| Boost | ~17.6 SOL of a SOL coin's raised liquidity, spent on buy-and-burn after migration | PumpSwap `GlobalConfig.boost_enabled = true` [chain]; amount [press: The Block, 2026-07-29] |
| App platform fee | 0.45% (0.40% with referral) on app/web trades | Pump App router, outside the core programs [tx] [press: TokenPost, 2026-10-17] |

## Per trade, by stage

Share of trade size. "Protocol → fee wallets" and "Protocol → buyback" are the two halves of the protocol fee.

| Stage | LP (stays in pool) | Protocol → pump fee wallets | Protocol → buyback vaults | Creator | Total |
| --- | --- | --- | --- | --- | --- |
| Bonding curve (SOL, USDC, custom pair) | 0 | 0.475% | 0.475% | 0.30% | **1.25%** |
| Bonding curve, mayhem coin | 0 | 0.95% → Mayhem program's reserved recipients | 0 | 0.30% | **1.25%** |
| PumpSwap canonical, market cap < 420 SOL | 0.02% | 0.465% | 0.465% | 0.30% | **1.25%** |
| PumpSwap canonical, 420 – 1,470 SOL | 0.20% | 0.025% | 0.025% | 0.95% | **1.20%** |
| … falling by tier … | 0.20% | 0.025% | 0.025% | 0.90% → 0.08% | |
| PumpSwap canonical, ≥ 98,240 SOL | 0.20% | 0.025% | 0.025% | 0.05% | **0.30%** |
| PumpSwap canonical, custom-pair quote | 0.20% | 0.025% | 0.025% | 0.05% (or set, ≤ 3%) | 0.30%+ |
| PumpSwap, any other pool | 0.25% | 0.025% | 0.025% | 0 | **0.30%** |

Where the creator column goes depends on the coin:

- **Regular coin:** the creator vault, `["creator-vault", creator]` on the curve and `["creator_vault", coin_creator]`
  on the pool.
- **Sharing-config coin:** split by `share_bps` among up to 10 addresses, GitHub users or donation PDAs.
- **Holder-rewards coin:** the `["holder-rewards", mint]` PDA, paid to holders by pump.fun's claim key.
- **Legacy cashback coin:** the trader's `UserVolumeAccumulator`.

A graduated coin's pool opens at about 410.8 SOL market cap (see [lifecycle.md](lifecycle.md)). That is inside the
first tier, so fresh pools pay 0.93% protocol and 0.02% LP until the market cap passes 420 SOL. From there the
protocol take drops to 0.05% and the creator share jumps to 0.95%.

### PumpSwap canonical pools: market-cap tiers

SOL-quoted pools, `fee_tiers`, live [chain]. Market cap = `quote_reserve × base_supply / base_reserve`, in SOL.
Identical to the schedule pump.fun published for 1 September 2025 [docs `FEE_PROGRAM_README.md`, `fees.png`].

| Market cap (SOL) | LP bps | Protocol bps | Fee wallets / buyback bps | Creator bps | Total |
| --- | --- | --- | --- | --- | --- |
| 0 – 420 | 2 | 93 | 46.5 / 46.5 | 30 | **1.25%** |
| 420 – 1,470 | 20 | 5 | 2.5 / 2.5 | 95 | **1.2%** |
| 1,470 – 2,460 | 20 | 5 | 2.5 / 2.5 | 90 | **1.15%** |
| 2,460 – 3,440 | 20 | 5 | 2.5 / 2.5 | 85 | **1.1%** |
| 3,440 – 4,420 | 20 | 5 | 2.5 / 2.5 | 80 | **1.05%** |
| 4,420 – 9,820 | 20 | 5 | 2.5 / 2.5 | 75 | **1%** |
| 9,820 – 14,740 | 20 | 5 | 2.5 / 2.5 | 70 | **0.95%** |
| 14,740 – 19,650 | 20 | 5 | 2.5 / 2.5 | 65 | **0.9%** |
| 19,650 – 24,560 | 20 | 5 | 2.5 / 2.5 | 60 | **0.85%** |
| 24,560 – 29,470 | 20 | 5 | 2.5 / 2.5 | 55 | **0.8%** |
| 29,470 – 34,380 | 20 | 5 | 2.5 / 2.5 | 50 | **0.75%** |
| 34,380 – 39,300 | 20 | 5 | 2.5 / 2.5 | 45 | **0.7%** |
| 39,300 – 44,210 | 20 | 5 | 2.5 / 2.5 | 40 | **0.65%** |
| 44,210 – 49,120 | 20 | 5 | 2.5 / 2.5 | 35 | **0.6%** |
| 49,120 – 54,030 | 20 | 5 | 2.5 / 2.5 | 30 | **0.55%** |
| 54,030 – 58,940 | 20 | 5 | 2.5 / 2.5 | 28 | **0.53%** |
| 58,940 – 63,860 | 20 | 5 | 2.5 / 2.5 | 25 | **0.5%** |
| 63,860 – 68,770 | 20 | 5 | 2.5 / 2.5 | 23 | **0.48%** |
| 68,770 – 73,681 | 20 | 5 | 2.5 / 2.5 | 20 | **0.45%** |
| 73,681 – 78,590 | 20 | 5 | 2.5 / 2.5 | 18 | **0.43%** |
| 78,590 – 83,500 | 20 | 5 | 2.5 / 2.5 | 15 | **0.4%** |
| 83,500 – 88,400 | 20 | 5 | 2.5 / 2.5 | 13 | **0.38%** |
| 88,400 – 93,330 | 20 | 5 | 2.5 / 2.5 | 10 | **0.35%** |
| 93,330 – 98,240 | 20 | 5 | 2.5 / 2.5 | 8 | **0.33%** |
| 98,240+ | 20 | 5 | 2.5 / 2.5 | 5 | **0.3%** |

USDC-quoted pools (`stable_fee_tiers`) use the same rates with thresholds in USDC: 59,000 · 300,000 · 500,000 ·
700,000 · 900,000 · 2M · 3M … 20M (1M steps from 2M) [chain].

The buyback half is rounded down: a 5-lamport protocol fee paid 2 to the buyback vault and 3 to the fee wallet [tx
`BqXE9VG1…`].

## Worked examples from mainnet

### Bonding curve trade

A v3 exact-quote buy on a regular SOL coin (event `ix_name` `buy_exact_quote_in`; fees kept on the curve, which only v3
does), routed through a third-party trading bot program
[tx `3gyAPX53GGHP6xJauU5LDVHTd34JB3b67sZxv4LiZj5FfeCe9CjWTsfVBvXkf66qdHiZepmyP2cCKD1nzKNNqfb6`, 2026-10-26 04:14:34 UTC]:

| Lamports | Where | Why |
| --- | --- | --- |
| 195,555,555 | Bonding curve reserves (`DnWc9JrN…`) | The swap itself: 2,606,899.051986 tokens out |
| 928,889 | Bonding curve, `protocol_fees` bucket | 47.5 bps, swept later to a pump fee wallet |
| 586,667 | Bonding curve, `creator_fee` bucket | 30 bps, swept later to the creator vault |
| 928,889 | Buyback vault 1 (`9M4giFFM…`) | 47.5 bps, paid in the trade |
| 2,000,000 | `8vFGAKdw…` | The bot's own 1% fee, not pump's |
| 1,513,840 + 1,000 + 6,000 | buyer's token account, tip, network fee | Not pump's |
| **201,520,840** | total leaving the buyer | |

The curve account rose by 197,071,111 = reserves + both buckets. The `TradeEvent` reports `fee` 1,857,778 (95 bps),
`creator_fee` 586,667 (30 bps), `buyback_fee` 928,889 (`buyback_fee_basis_points` 5,000) and `fee_recipient` = the
zero key (fee kept on the curve).

Sell side: on a v3 sell both fees come out of the proceeds and stay on the curve. Mayhem sell
`47iBM7BC…`: 6,279,626 lamports of curve value, 59,657 + 18,839 kept as fees, 6,201,130 paid out of the curve [tx].

### PumpSwap trade

Canonical SOL pool `CpJAJkLBsZUBnCwhDdzDUWiaxV5Fp25DhJcdenySitXT` at ~4,319 SOL market cap (tier 3,440–4,420:
20/5/80 bps), v1 `buy_exact_quote_in` of 10,000 lamports
[tx `BqXE9VG1jrojo5184dLDEF6sPJY5ABLyWgE5XXM9A3ryYmUd7EXePnRuU4VYEfmuXJzWvmaNVuD5K3VAXEpuxKG`]:

| Lamports | Where |
| --- | --- |
| 9,915 | Pool quote vault (9,895 swapped + 20 LP fee) |
| 80 | Coin creator vault ATA (80 bps) |
| 3 | Fee wallet `7hTckgnG…` (protocol, rounded up) |
| 2 | Buyback vault 1 (protocol, rounded down) |

Non-canonical pool, larger trade [tx `4hUhuLmswwrDZ2wf3PyceSdi2E9HKusQ4zzDN3wHXSB1ZuQK4BMB26edY2YNboNtRyVmLiZDBexJuYZbvwavneSy`]:
2,407,136,252,165 quote units in, LP 25 bps = 5,999,841,108, protocol 5 bps = 1,199,968,222. That split into
**599,984,111 to fee wallet `62qc2CNX…` and 599,984,111 to buyback vault 7**. Creator 0.

### Graduation

[tx `3APwkHCt…`]: 15,000,001-lamport migration fee = 6,177,280 rent for the new pool's accounts + **8,822,721 to
`39azUYFW…` ("Pump.fun: Migration")**. See [lifecycle.md](lifecycle.md#3-completion-and-graduation).

## Where the money sits after the trade

| Destination | Holder | Live balance or total | What happens next |
| --- | --- | --- | --- |
| Normal protocol fee wallets (9 addresses: 8 in Pump `Global`, 8 in PumpSwap, 7 shared) | Off-curve, system-owned (Squads vault pattern); `62qc2CNX…` is "Pump.fun AMM: Protocol Fee 7" | **56,785.87 SOL** across the 9 at read time [chain] | Company treasury. Lookonchain-sourced reports count 5,347,925 SOL ($861.47M) sold by pump.fun as of 2026-10-07 [press: ChainCatcher] |
| Buyback vaults ×8 | Pump Fees PDAs, swept by keypair `4zmJQ6…` | 9.10 SOL at read; **856,582.70 SOL** cumulative `total_claimed` [chain] | Swept to `99mRw3…` "Pump Buybacks" [tx], which swaps on Jupiter and burns PUMP every few seconds [solscan] |
| Creator vaults / sharing configs / holder-rewards PDA | per coin | n/a | Claimed by the creator, distributed to shareholders, or paid to holders by pump.fun's key |
| Mayhem reserved recipients | Mayhem program | 63.87 SOL [chain] | Undocumented |
| Mayhem `sol-vault` | Mayhem program PDA | **64,224.34 SOL** [chain] | Undocumented |
| Migration wallet `39azUYFW…` | single keypair | **4,718.53 SOL** [chain] | Receives every graduation's fee remainder |
| Pool LP fee | the pool | n/a | Stays in reserves; canonical pools' LP tokens are minted to Pump's pool-authority at migration (burnt, per pump's docs) |

**PUMP supply.** Live supply 825,930,811,797.896297 PUMP (6 decimals) against the fixed 1 T cap. Mint and freeze
authority are both none [chain]. That is **174.07 B burned (17.41%)**. About 127.25 B of it went in the April 2026 burn
of all earlier buybacks [press: CoinDesk 2026-04-29, Coin360]. pump.fun's announced policy since then is 50% of net
revenue to buy-and-burn for 12 months [press: CoinDesk, The Block 2026-04-29]. On chain this is implemented as 50% of
each trade's protocol fee, routed to the buyback vaults.

**Revenue context (DefiLlama):** Pump group revenue $13.27M over 18–24 Oct 2026. Buybacks
(holders revenue) $5.94M over the same 7 days; all-time $456.6M. Daily launchpad revenue fell from $1.609M (20 Oct)
to $1.146M (24 Oct).

## Reproduce

```bash
node scripts/read-live.mjs
```

```bash
node scripts/read-flows.mjs
```

`read-live.mjs` makes about 14 RPC calls and `read-flows.mjs` about 30; both are read-only. Results land in
`data/live-snapshot.json` and `data/flows-snapshot.json`. `node scripts/read-flows.mjs tx <signature>` decodes any
other trade the same way.

## Re-verified 2026-10-28

All fee parameters above read the same at slot 462,377,442 [chain]. The app platform fee is now also visible in
the app's own API. `GET https://blockchain-swap.pump.fun/referrals/fee-rates` returns `protocol_bps 45`,
`referrer_bps 40`, and a reduced rate of 5 / 4 bps for 16 listed quote mints [capture]. `profile-api` itemizes what a
position paid as `base`, `priority`, `tip`, `ui` (the app fee), `ata_rent`, `protocol` and `cashback` [capture]. See
[pump-app-router.md](pump-app-router.md).
