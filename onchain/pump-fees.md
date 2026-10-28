# Pump Fees (pump_fees): fee schedules, creator splits, buyback vaults

`pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ`

This program holds the fee rates both trading programs charge. It also holds the creator-fee sharing configs and the
eight buyback vaults that collect half of every protocol fee. GitHub ("social") fee accounts, donation fee accounts and
referral vaults live here too.

## Identity

| Field | Value | Source |
| --- | --- | --- |
| Program | `pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ` | [chain] |
| ProgramData | `75Uu23mqWBb8LM8vDppqC1mQAnCcBuLXhVaDezVMQLRw`, 948,989 bytes, 4.82 SOL rent | [chain] |
| Upgrade authority | `7gZufwwAo17y5kg8FMyJy2phgpvv9RSdzWtdXiWHjFr8` (3-of-4 Squads vault) | [chain] |
| Last deploy | slot 456,132,171, **2026-10-12 17:40:24 UTC** | [chain] |
| IDL used here | [`idl/pump_fees.json`](../idl/pump_fees.json) (`pump-rust-client` 0.5.0), 31 instructions | [idl] |
| On-chain Anchor IDL | `6hgWp61YgGzJ9QmvxyFtLnGfA8MYgx93Hby6fdq8gG31`, authority `GUYCUEpxSkm1ccDo3LSKMR4Xpe5bgMnEZaFygWUSEVH3`, 29 instructions. It lacks `admin_cto_sharing_config`, `get_fees_with_quote_mint`, `set_exotic_flat_fees` and `withdraw`, and still lists `reset_fee_sharing_config(_v2)`. Saved in [`idl/onchain/pump_fees.json`](../idl/onchain/pump_fees.json) | [chain] |
| Hard-coded admin for `initialize_fee_config` | `8LWu7QM2dGR1G8nKDHthckea57bkCzXyBTAKPJUBDHo8` | [idl] |

## Accounts and PDAs

| Account | Seeds | Live address / state |
| --- | --- | --- |
| `FeeConfig` for Pump | `["fee_config", 6EF8…]` | `8Wf5TiAheLUqBrKXeYg2JtAFFMWtKdG2BSFgqUcPVwTt`. Flat 0 / 95 / 30 bps (LP / protocol / creator) on every schedule [chain] |
| `FeeConfig` for PumpSwap | `["fee_config", pAMM…]` | `5PHirr8joyTMp9JMm6nW7hNDVyEYdkzDqazxPD7RaTjx`: `flat_fees` 25/5/0, 25 `fee_tiers`, 25 `stable_fee_tiers`, `exotic_flat_fees` 20/5/5 [chain] |
| `FeeProgramGlobal` | `["fee-program-global"]` | `CHqnuTkj6sXDFknM652aEFPECZh9qVsBXWkhPohmV9dA`: authority `FFWtr…`, `disable_flags` 0, `social_claim_authority` `2sMrGNK8i36YRkF5WWCwnaUYuwDJhHe1g2xA8aPvhkjM` (single keypair, 100.95 SOL), `claim_rate_limit` 0 [chain] |
| `BuybackVault` ×8 | `["buyback-vault", index u8]`, index 0–7 | `5YxQFdt3…`, `9M4giFFM…`, `GXPFM2ca…`, `3BpXnfJa…`, `5cjcW9wE…`, `EHAAiTxc…`, `5eHhjP8J…`, `A7hAgCzF…` (derived and matched) [chain] |
| `SharingConfig` | `["sharing-config", mint]` | One per coin that splits its creator fee. It becomes the coin's `creator`, so the creator vault is `["creator-vault", sharing_config]` |
| `SocialFeePda` | seeds not declared in the IDL | Holds fees for a GitHub user ID (`user_id`, `platform`) |
| `DonationFeePda` | `["donation-fee-pda", base_mint, config_id]` | A shareholder that forwards to the Donation Relay program |
| referral vault | `["referral-vault", user]` | Paid out by `withdraw` |

`SharingConfig` = `{ bump, version, status: Active|Paused, mint, admin, admin_revoked, shareholders: Vec<{address,
share_bps}> }`. Shareholders: 1–10, `share_bps` sums to 10,000 [docs `CREATOR_FEE_SHARING.md`].

## Buyback vaults, read live

All eight vaults: `authority` = `4zmJQ6KQXftutXjLAHJFmgANchhPD98Tm9vpNe3zogGP` (single keypair), `claim_rate_limit`
= 0 [chain, full `scripts/read-flows.mjs` run at 2026-10-26 04:14 UTC; the snapshot's `readAt` shows the last partial run].

| Measure | Value |
| --- | --- |
| SOL in the 8 vaults at read time | 9.095 SOL |
| Sum of `total_claimed` across the 8 vaults | 856,582.70 SOL (lamport field; read as cumulative SOL swept out, matching `SweepBuybackEvent.sol_amount`) |
| `last_claimed` (vault 0) | 1,792,987,641 = 2026-10-26 04:07:21 UTC |

What a sweep does [tx `5mcMUhDrF8DAwk49j8deHpYrD4Y2PnmsEqJ5Qk7Xwm2B8HfKGqYPSRkxKCaT3p37BSnAnSihcx22W4DS9pgAjUga`, 04:07:21 UTC]:
`4zmJQ6…` signs two `sweep_buyback` instructions (indexes 0 and 6). Together they move 2,491,569 lamports and 231
units of a custom-pair quote token (`AAPLEDt8…`) to `99mRw3EzdJZWEUjgp1nrU4WeHsukUBjbh7gYE7pm4F3c`.

`99mRw3…` is "Pump Buybacks" on Solscan: a single keypair funded by the Squads vault "BBFunds1"
(`28Kqfva3Jy3FWfDx1TtEybgyAMfhAiaD9U7qnqYNAz7R`). At the time of reading it alternated Jupiter swaps and Token-2022
`BurnChecked` of PUMP every few seconds. One example: tx `4eJpC9janCtAhnMME4SN4goAHGEMMNPEiMN4iDE6oewit7yUoC3r1bQrZ7aCkUKgiJdFoYeXGK4tUTBwwNinbjAP`
burned 2,448.046529 PUMP at 04:13:37 UTC [solscan].

`sweep_buyback` takes `destination` as a plain writable account. The IDL attaches no seed or relation to it, so the
vault authority chooses where swept funds go. The PUMP buy and burn happen in a separate wallet's transactions, not in
this program [idl] [solscan].

## Instructions

### Fee schedule

- `get_fees(is_pump_pool, market_cap_lamports, trade_size_lamports, is_new_quote_mint)` and
  `get_fees_with_quote_mint`: views the trading programs use to pick a tier.
- `update_fee_config(fee_tiers, flat_fees)`, `update_stable_fee_config`, `upsert_fee_tiers`,
  `upsert_stable_fee_tiers`, `set_exotic_flat_fees`: signed by `FeeConfig.admin` (`FFWtr…`). These replace or extend
  the schedules both programs charge. The only bound in the IDL is error 6006 `InvalidFeeTotal`: "Fee total must not exceed 10_000bps" [idl].
- `initialize_fee_config` (hard-coded admin), `extend_fee_config` (realloc), `update_admin`.

### Creator-fee sharing

- `create_fee_sharing_config`: creates `["sharing-config", mint]`. Through CPI it moves the coin's creator on the curve
  and the pool to the config (`migrate_bonding_curve_creator`, `migrate_pool_coin_creator`).
- `update_fee_shares` / `update_fee_shares_v2(shareholders)`: signed by the config admin. Sweeps pending creator fees
  first, sets the list and revokes the admin. Since 19 March 2026 a split can be set **once only** [docs README history,
  commit `9d874ec`].
- `admin_cto_sharing_config(new_admin)`: signed by Pump's pool-authority PDA, so it only runs inside Pump's `admin_cto`.
- `revoke_fee_sharing_authority`, `transfer_fee_sharing_authority`: no longer supported [docs].

Live example: KIMCHI (`CSocnzcRpgSCr1naKcNTieWZUxb6rABe45j844m7pump`). Its sharing config
`FResVamn1XTH66ST3CQnFgWNDsEDTcYbXaSyujwa1xS9` is the creator on both curve and pool. Admin
`EFSr396A6Jh7bNCSujGRLMkyXspbWitEvjNVatGD56oF`, `admin_revoked: true`, one shareholder
`Gs5FHwYLrDBmCmiv5VhBLCvyiBmBYfcPedZDqR88GYeX` ("Kimchi on Pump.fun" [solscan]) at 10,000 bps [chain].

### Social (GitHub) fees

- `create_social_fee_pda(user_id, platform)`: anyone pays to create one. A GitHub user ID can then be listed as a
  shareholder [docs README, commit `1059c0d`, 2026-03-05].
- `claim_social_fee_pda` / `_v2(user_id, platform)`: signed by `social_claim_authority`, a pump.fun key. The docs say
  fees in a GitHub vault "can only be claimed by the linked GitHub user, and only through Pump.fun (web or mobile)".
- `set_social_claim_authority`, `set_claim_rate_limit`, `set_disable_flags`, `set_authority`: `FeeProgramGlobal.authority`.

### Donations

- `create_donation_fee_pda`, `crank_donation_fee_pda`: permissionless. The crank forwards a donation PDA's balance into
  the Donation Relay program (`RLAYHr9TRFcKB2ubYQhspcnXiaGpaVzNQvHytt47RZu`), see [donation-relay.md](donation-relay.md).

### Buybacks and referrals

- `initialize_buyback(index)`: creates a vault and its token account for a mint.
- `sweep_buyback(index)`: signed by the vault's `authority` (`4zmJQ6…`). Moves SOL and one token's balance to
  `destination`.
- `update_buyback_authority(index, new_authority)`, `update_buyback_claim_rate_limit(index, limit)`:
  `FeeProgramGlobal.authority` (`FFWtr…`).
- `withdraw`: pays a user's `["referral-vault", user]` balance in `quote_mint`.

## What an authority can change, pause or redirect

- **Upgrade multisig:** everything.
- **`FeeConfig.admin` (`FFWtr…`):** every trading fee rate on curves and canonical pools (protocol, creator and LP
  split per market-cap tier), bounded in the IDL only by a 100% total.
- **`FeeProgramGlobal.authority` (`FFWtr…`):** who sweeps each buyback vault, the sweep rate limit, the social-fee claim
  key and the program's disable flags.
- **Buyback vault authority (single keypair `4zmJQ6…`):** where buyback money goes after it leaves the vault.
- **Social claim authority (single keypair):** pays out GitHub-linked fees.
- Sharing configs cannot be edited after their first split. The only exception is `admin_cto` from Pump.

## Re-verified 2026-10-28

Read again at slot 462,377,442 (2026-10-28 06:37 UTC) by `scripts/read-live.mjs` [chain]. Upgrade authority, ProgramData and last deploy (slot 456,132,171) are
unchanged. Both `FeeConfig` accounts and `FeeProgramGlobal` read the same [chain].

- **IDL.** `../idl/pump_fees.json` comes from `pump-rust-client` 0.5.0 and has 31 instructions, `withdraw` included.
  `@pump-fun/pump-sdk` 4.3.1 (2026-10-22) ships a 30-instruction copy without `withdraw`, `WithdrawEvent` and errors
  `IncompleteTokenAccounts` / `NothingToWithdraw`. The referral-vault payout exists in the Rust client's copy only
  [idl].
- **Referral fees are charged off this program's schedule.** The app's 0.45% platform fee and its 0.40% referral rate
  come from `blockchain-swap.pump.fun/referrals/fee-rates` and are charged by the Pump App router. See
  [pump-app-router.md](pump-app-router.md) [capture].

## Full instruction reference

Generated from [`idl/pump_fees.json`](../idl/pump_fees.json) by `node scripts/idl-tables.mjs pump_fees`.

| Instruction | Arguments | Signers | IDL doc |
| --- | --- | --- | --- |
| `admin_cto_sharing_config` | new_admin: Option<pubkey> | `pool_authority` (PDA ["pool-authority", mint])<br>`authority` |  |
| `claim_social_fee_pda` | user_id: string, platform: u8 | `social_claim_authority` (= fee_program_global.social_claim_authority) |  |
| `claim_social_fee_pda_v2` | user_id: string, platform: u8 | `social_claim_authority` (= fee_program_global.social_claim_authority) |  |
| `crank_donation_fee_pda` | — | `payer` |  |
| `create_donation_fee_pda` | — | `payer` |  |
| `create_fee_sharing_config` | — | `payer` | Create Fee Sharing Config |
| `create_social_fee_pda` | user_id: string, platform: u8 | `payer` |  |
| `extend_fee_config` | — | `user` | Realloc the fee_config PDA to [`FeeConfig::CURRENT_SIZE`] (signer pays rent delta). |
| `get_fees` | is_pump_pool: bool, market_cap_lamports: u128, trade_size_lamports: u64, is_new_quote_mint: OptionBool | — | Get Fees |
| `get_fees_with_quote_mint` | is_pump_pool: bool, market_cap_lamports: u128, quote_mint: pubkey | — |  |
| `initialize_buyback` | index: u8 | `payer` |  |
| `initialize_fee_config` | — | `admin` (fixed 8LWu7Q…) | Initialize FeeConfig admin |
| `initialize_fee_program_global` | social_claim_authority: pubkey, disable_flags: u8, claim_rate_limit: u64 | `authority` (= pump_global.authority) |  |
| `revoke_fee_sharing_authority` | — | — | Revoke Fee Sharing Authority |
| `set_authority` | new_authority: pubkey | `authority` (= fee_program_global.authority) |  |
| `set_claim_rate_limit` | claim_rate_limit: u64 | `authority` (= fee_program_global.authority) |  |
| `set_disable_flags` | disable_flags: u8 | `authority` (= fee_program_global.authority) |  |
| `set_exotic_flat_fees` | exotic_flat_fees: Fees | `admin` (= fee_config.admin) |  |
| `set_social_claim_authority` | social_claim_authority: pubkey | `authority` (= fee_program_global.authority) |  |
| `sweep_buyback` | index: u8 | `authority` (= buyback_vault.authority) |  |
| `transfer_fee_sharing_authority` | — | — | Transfer Fee Sharing Authority |
| `update_admin` | — | `admin` (= fee_config.admin) | Update admin (only callable by admin) |
| `update_buyback_authority` | index: u8, new_authority: pubkey | `authority` (= fee_program_global.authority) |  |
| `update_buyback_claim_rate_limit` | index: u8, claim_rate_limit: i64 | `authority` (= fee_program_global.authority) |  |
| `update_fee_config` | fee_tiers: Vec<FeeTier>, flat_fees: Fees | `admin` (= fee_config.admin) | Set/Replace fee parameters entirely (only callable by admin) |
| `update_fee_shares` | shareholders: Vec<Shareholder> | `authority` | Update Fee Shares, make sure to distribute all the fees before calling this |
| `update_fee_shares_v2` | shareholders: Vec<Shareholder> | `authority` | Update Fee Shares, make sure to distribute all the fees before calling this |
| `update_stable_fee_config` | fee_tiers: Vec<FeeTier> | `admin` (= fee_config.admin) | Set/Replace fee parameters entirely (only callable by admin) |
| `upsert_fee_tiers` | fee_tiers: Vec<FeeTier>, offset: u8 | `admin` (= fee_config.admin) | Update or expand fee tiers (only callable by admin) |
| `upsert_stable_fee_tiers` | fee_tiers: Vec<FeeTier>, offset: u8 | `admin` (= fee_config.admin) | Update or expand fee tiers (only callable by admin) |
| `withdraw` | — | `user` |  |
