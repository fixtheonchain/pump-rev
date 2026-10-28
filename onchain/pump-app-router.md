# Pump App router (pump_stables_router)

`6Vo3245eszAb5wuqEMw8mGdbfRUdKbHhDHP5LcaGuTAB` ("Pump App" on Solscan)

The program the pump.fun app routes trades through. It converts SOL ↔ USDC ↔ coin for coins quoted in something other
than SOL, and it carries the app's platform fee.

## Identity

| Field | Value | Source |
| --- | --- | --- |
| ProgramData | `5RWm5iSZx3XgcEQgEjdj7QYRsSRUhfHcAZE6fVKrNxhx`, 2,191,493 bytes, 11.13 SOL rent | [chain] |
| Upgrade authority | `92gWFZMpGhWzVq5tjBnJxF9VnFwE3ydB2idJp9z2D9Nr`: a **single keypair** (58.94 SOL). Pump's on-chain IDL lists the same key as its authority, and it received the buffer refund of the 2026-10-19 PumpSwap upgrade | [chain] [tx] |
| Last deploy | slot 454,846,926, **2026-10-09 11:01:28 UTC** | [chain] |
| IDL | none published, none on chain | [chain] |

`pump-rust-client` 0.4.1 loads this program into its local validator as `pump_stables_router`, described as routing
"SOL <-> USDC <-> token for non-SOL-quote bonding curves and pump_amm pools". It also loads Raydium AMM v4 and OpenBook
because the router CPIs into Raydium's SOL/USDC pool [sdk `src/bin/local_validator/pump_config.rs`].

## The 0.45% platform fee, observed

pump.fun announced a 0.45% app/web platform fee on 16 October 2026, effective 17 October (0.40% with a referral code)
[press: tokenpost.com/news/business/33804, 2026-10-17].

One routed sell decoded on chain
[tx `4U3W22mCtfL9vgCJaBeHfDpsPpAzwMy9HHqL5A7sCmMQ9PvBgev4V7u38mjCvrvymJp6sM9zqHyGMVN5oxLh6qwa`, 2026-10-26 04:10:39 UTC]:

- The user's only program instruction is this router. Inside it, two PumpSwap `SellEvent`s: the coin into its pump-coin
  quote, then that quote coin into an xStock quote.
- The router turned the proceeds into 799,044,403 lamports. The user received 795,379,384.
- **3,595,699 lamports = 0.4500%** went to `KfHbT5Jrr5SV3CDkQVCLiSNWyVv5DmuVaCzbAHrzMFQ`, and 10,000 lamports went to
  `pfnTcJ1i4mRYzbqGduF71RsooUCFkPSpk8UE7drCkjh`.

Neither address carries a Solscan label. The fee is charged by this router, not by the Pump or PumpSwap programs, so
trades sent straight to those programs do not pay it. The app's "Squads Competition" counts only app, web and Terminal
trades [press: PetrAnto via KuCoin, 2026-10-25; x.com/Pumpfun/status/2113647414573682846].

## Admin powers

No IDL is published, so its instructions and admin checks cannot be listed. The upgrade key is a single keypair, so
one key can change the router's logic, including its fee.

## Re-verified 2026-10-28

Read again at slot 462,377,442 (2026-10-28 06:37 UTC) by `scripts/read-live.mjs` [chain]. Upgrade authority (single keypair `92gWFZ…`) and last deploy (slot
454,846,926) are unchanged [chain].

### Instructions, from the program binary and live transactions

The `pump_stables_router` build in `pump-rust-client` 0.5.0 (`artifacts/pump_stables_router.so`, Anchor, source path
`programs/pump-stables-router/src/lib.rs`) names these instructions [sdk-bin]:

| Venue | Instructions |
| --- | --- |
| Pump curve | `bonding_curve`, `bonding_curve_v2`, `create_coin_and_buy_bonding_curve_v2`, `sell_bonding_curve_percentage` |
| PumpSwap | `pump_swap`, `pump_swap_v2`, `sell_pump_swap_percentage` |
| Raydium | `raydium_amm`, `raydium_cpmm`, `raydium_clmm`, `raydium_launchlab` |
| Meteora | `meteora_dbc`, `meteora_damm`, `meteora_dlmm` |

The deployed program is newer than that build (the ProgramData hash differs). Live app trades on 2026-10-28 call
two instructions not in the build: discriminator `cfa2f612aa6dbf37` = `bonding_curve_v3` (calls Pump, Pump Fees,
Token-2022) and `af051981a0d8389d` = `pump_swap_v3` (calls PumpSwap, Pump Fees, SPL Token, Token-2022). Each name was
recovered as `sha256("global:<name>")[..8]` [tx `5SQMLaQc…`, `4a95PapZ…`, `zUobpbEP…`; `../data/extra-snapshot.json`].
Each transaction is ATA creations, the router instruction and system transfers (the tip). Signers are the trader's
wallet. One transaction carries a second signer and a Memo instruction.

### The fee schedule it applies

`GET https://blockchain-swap.pump.fun/referrals/fee-rates` returns `{protocol_bps: 45, referrer_bps: 40, reduced:
{mints: [16 mints], protocol_bps: 5, referrer_bps: 4}}` [capture 2026-10-28]: 0.45%, or 0.40% with a referral, and
0.05% / 0.04% on 16 listed quote assets (`cbbtcf3a…` and others). `GET /fees/me` on frontend-api-v3 returns a
signed-in user's "platform-fee bypass" in basis points [contract]. The indexer splits each coin's costs into
`tradingAppFeeSol(V2)`, `builderTipSol(V2)`, `priorityFeeSol` and `txFeeSolV2`, and `profile-api` itemizes a
position's `fee_detail` as `base`, `priority`, `tip`, `ui` (the app fee: 0.0675 SOL on a 15 SOL buy = 0.45%),
`ata_rent`, `protocol` and `cashback` [capture].
