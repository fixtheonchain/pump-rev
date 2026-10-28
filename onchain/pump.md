# Pump: the bonding-curve launch program

`6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`

Every pump.fun coin is created here. It trades against a constant-product curve with virtual reserves until the
curve runs out of real tokens, then migrates its reserves into a PumpSwap pool. Tags such as `[chain]` and `[tx]`
mark where each value comes from; they are defined in the [README](../sources.md).

## Identity

| Field | Value | Source |
| --- | --- | --- |
| Program | `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P` | [chain] |
| ProgramData | `B5MvUwXdiW1NMM6QFFD3ssPKBujD4zMohncbM73Z2BQu`, 10,485,760 bytes (the 10 MiB maximum), 53.27 SOL rent | [chain] |
| Upgrade authority | `7gZufwwAo17y5kg8FMyJy2phgpvv9RSdzWtdXiWHjFr8`: vault 0 of Squads v4 multisig `2yMoQqQrtbhq3nQ3wFoQQawWS65qcqUXcwHEYha4rshW` ("Pump.fun Multisig" on Solscan), threshold **3 of 4**, time lock **0 s**, no config authority | [chain] [tx] [solscan] |
| Last deploy | slot 458,921,440, **2026-10-19 17:47:02 UTC** | [chain] |
| IDL used here | [`idl/pump.json`](../idl/pump.json), `pump-rust-client` 0.5.0 (2026-10-19), 56 instructions; same instruction set as pump-public-docs `639b87f` (kept in `../idl/previous-docs-repo-639b87f/`) | [idl] |
| On-chain Anchor IDL | `AYgC53tU5BbP2NAnv5nConJxAdpQZctvmZK88pu69xRs`, authority `92gWFZMpGhWzVq5tjBnJxF9VnFwE3ydB2idJp9z2D9Nr`, 47 instructions. It predates the October release: `buy_v3`, `sell_v3`, `buy_exact_quote_in_v3`, `multi_hop_curve_swap`, `sweep_protocol_fee`, `sweep_creator_fee`, `set_max_curve_depth`, `set_quote_control_mint_reserves` and `set_quote_control_reserves_admin` are missing. Saved in [`idl/onchain/pump.json`](../idl/onchain/pump.json) | [chain] |

## Accounts and PDAs

| Account | Seeds (program) | What it holds |
| --- | --- | --- |
| `Global` | `["global"]` → `4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf` | All protocol parameters, see below |
| `BondingCurve` | `["bonding-curve", mint]` | Virtual and real reserves, `complete`, `creator`, `quote_mint`, flags (`is_mayhem_mode`, `is_cashback_coin`, `is_holder_reward`), fees waiting to be swept (`protocol_fees`, `creator_fee`), synthetic-migration record (`post_complete_base_out`, `post_complete_quote_in`). Holds the SOL reserves as lamports for SOL-paired coins |
| associated bonding curve | ATA(`bonding_curve`, mint) | The curve's base tokens |
| `mint_authority` | `["mint-authority"]` | Mint authority while minting at creation |
| creator vault | `["creator-vault", creator]` | Creator fees for one creator address, claimed with `collect_creator_fee*` |
| holder rewards | `["holder-rewards", mint]` | Creator address recorded for holder-rewards coins; paid out by `distribute_fee_to_holders` |
| `UserVolumeAccumulator` | `["user_volume_accumulator", user]` | Per-user volume, PUMP incentive balance, cashback |
| `GlobalVolumeAccumulator` | `["global_volume_accumulator"]` → `Hq2wp8uJ9jCPsYgNHex8RtqdvMPfVGoYwjvF1ATiwn2Y` | Daily PUMP incentive schedule |
| `QuoteControl` | `["quote-control"]` → `6z6GDdfb2AjR9ZhJmAUQ5cipJCVxQvLJhB2H8mCwTFBP` | Custom-pair quote mints and their starting virtual reserves |
| `pool-authority` | `["pool-authority", mint]` | Signs as the `creator` of the coin's PumpSwap pool at migration |
| event authority | `["__event_authority"]` | Anchor `emit_cpi` events |
| Pump Fees `FeeConfig` | `["fee_config", pump program id]` @ pump_fees → `8Wf5TiAheLUqBrKXeYg2JtAFFMWtKdG2BSFgqUcPVwTt` | The fee schedule every trade reads |
| Pump Fees `SharingConfig` | `["sharing-config", mint]` @ pump_fees | Creator-fee split, when the creator is a sharing config |

Seeds come from the IDL `pda` definitions [idl]; the fixed addresses were derived with `scripts/lib.mjs` and found on chain [chain].

## Global, read live

Read at slot 461,522,470 (2026-10-26 04:07 UTC) from `4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf` [chain]. Full dump in [`data/live-snapshot.json`](../data/live-snapshot.json).

| Field | Live value | Meaning |
| --- | --- | --- |
| `authority` | `FFWtrEQ4B4PKQoVuHYzZq8FabGkVatYzDpEVHsK5rrhF` | Admin of `Global`. A Squads vault ("global authority (amm fees)" on Solscan); its executions are signed by members of the upgrade multisig [solscan] |
| `initial_virtual_token_reserves` | 1,073,000,000,000,000 (1.073 B tokens, 6 decimals) | Curve start, virtual token side |
| `initial_virtual_sol_reserves` | 30,000,000,000 (30 SOL) | Curve start, virtual SOL side |
| `initial_real_token_reserves` | 793,100,000,000,000 (793.1 M tokens) | Tokens sold on the curve before it completes |
| `token_total_supply` | 1,000,000,000,000,000 (1 B tokens) | Supply minted per coin |
| `initial_virtual_quote_reserves` | 4,292,000,000 (4,292 USDC) | Curve start for non-SOL quotes such as USDC |
| `fee_basis_points` / `creator_fee_basis_points` | 95 / 5 | Fallback only. Trades read the Pump Fees `FeeConfig` (below) |
| `fee_recipient` + `fee_recipients[7]` | 8 addresses, `62qc2CNX…` and 7 more | Normal protocol fee recipients |
| `reserved_fee_recipient` + `reserved_fee_recipients[7]` | 8 addresses owned by the Mayhem program | Protocol fee recipients for mayhem coins |
| `buyback_fee_recipients[8]` | 8 `BuybackVault` accounts owned by Pump Fees | Receive the buyback share in every trade |
| `buyback_basis_points` | **5,000** | Half of the protocol fee goes to a buyback vault (confirmed in [tx], see [fees](fees.md)) |
| `withdraw_authority` | `39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg` | "Pump.fun: Migration" [solscan], a single keypair holding 4,718.53 SOL [chain]. Receives the migration fee remainder |
| `enable_migrate` / `pool_migration_fee` | true / 15,000,001 lamports | Migration on; fee taken from the curve's SOL at migration |
| `set_creator_authority` | `39azUYFW…` (same key) | May set any curve's `creator` with `set_creator` |
| `admin_set_creator_authority` | `UqN2p5bAzBqYdHXcgB6WLtuVrdvmy9JSAtgqZb3CMKw` | Squads vault [solscan]. Signs `admin_cto` (community takeover) |
| `create_v2_enabled` | true | `create_v2` is on |
| `mayhem_mode_enabled` | true | Mayhem coins can be created |
| `whitelist_pda` | `BwWK17cbHxwWBKZkUYvzxLcNQ1YVyaFezduWbtm2de6s` | The Mayhem program's `["sol-vault"]` PDA ("Mayhem_Mode on Pump.fun" [solscan]), holding **64,224.34 SOL** [chain] |
| `is_cashback_enabled` | true | Global flag is on, but `create_v2` rejects new cashback coins since 2026-09-12 [docs] |
| `whitelisted_quote_mints[1]` | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` (USDC) | Quote mint on the standard schedule besides SOL |
| `creator_fee_configurable` / `max_configurable_creator_fee_bps` | true / 300 | Custom-pair coins may set their own creator fee up to 3% |
| `holder_reward_claim_authority` | `HckQ93Xqjjo8mwt5pNPWvyCTZXQZ858rvzmm7ZRrZg9t` | A single keypair (69.92 SOL) [chain]. Signs every holder-rewards payout |
| `is_holder_reward_enabled` | true | Holder-rewards coins can be created |
| `max_curve_depth` | 2 | Pump-coin quote chains up to SOL → A → B → C |

`GlobalVolumeAccumulator` (`Hq2wp8uJ…`) has `start_time = end_time = 0`, `mint` = the zero key and all 30 daily
slots at 0 [chain]. The on-chain PUMP volume-incentive schedule is not running.

`QuoteControl` (`6z6GDdfb…`) lists **224** custom quote mints with their starting virtual reserves [chain]. They
include xStocks (`Xs…` mints), PreStocks (`Pre…`), USD-pegged and other tokens, and PUMP itself
(`pumpCmXq…`, 787,222,644,673 base units). Admin `2fAEoCqd6c4tX8s9sMoXTvGnmuzoczFyJsHr72Xq4YyQ` (off-curve address),
reserves admin `9D6H6Yp65TtwUUW7h5xwPDRzD3USvG9n3qjusYCLgz5h` (single keypair) [chain].

## Fee schedule this program reads

`FeeConfig` at `8Wf5TiAheLUqBrKXeYg2JtAFFMWtKdG2BSFgqUcPVwTt` (Pump Fees program) [chain]:

| Schedule | LP | Protocol | Creator | Total |
| --- | --- | --- | --- | --- |
| `fee_tiers` (one tier from market cap 0) | 0 | 95 bps | 30 bps | **1.25%** |
| `stable_fee_tiers` (USDC pairs) | 0 | 95 bps | 30 bps | 1.25% |
| `exotic_flat_fees` (custom pairs) | 0 | 95 bps | 30 bps | 1.25% |

Half the protocol fee (`buyback_basis_points` 5,000) goes to a buyback vault in the trade itself. The full lamport
breakdown with a real trade is in [fees.md](fees.md).

## Instructions

### Creating a coin

- **`create_v2`** (current): makes a Token-2022 mint (6 decimals, metadata pointer on the mint), the bonding curve and
  its token account, and mints `token_total_supply` to the curve. Arguments: `name`, `symbol`, `uri`, `creator`,
  `is_mayhem_mode`, `is_cashback_enabled` (rejected when true), `creator_fee_bps` (custom pairs only),
  `is_holder_reward`. Remaining accounts choose a non-SOL quote mint. It always passes the Mayhem program's
  `global_params`, `sol_vault`, `mayhem_state` and `mayhem_token_vault` [docs `COIN_CREATION.md`].
- `create` (legacy): SPL Token mint with Metaplex metadata. Coins made this way can never be mayhem coins [docs].
- `creator` is not required to sign, so a first buyer can create a coin on someone else's behalf [docs
  `PUMP_PROGRAM_README.md`]. That address receives the creator fee. On holder-rewards coins the program records the
  `["holder-rewards", mint]` PDA instead [docs `HOLDER_REWARDS_README.md`] [sdk `sdk.ts` `createdCurveCreator`].
- The SDK builds create + first buy into one transaction (`createV2AndBuyV2Instructions`) [sdk].

### Trading on the curve

| Generation | Instructions | Accounts | Fee handling |
| --- | --- | --- | --- |
| v1 | `buy`, `sell`, `buy_exact_sol_in` | 14–16 | Protocol and creator fee paid out in the trade |
| v2 (May 2026) | `buy_v2`, `sell_v2`, `buy_exact_quote_in_v2` | 26–27 | Same, for any quote mint |
| v3 (Oct 2026) | `buy_v3`, `sell_v3`, `buy_exact_quote_in_v3` | 17 | Protocol and creator fee **kept on the curve** (`BondingCurve.protocol_fees`, `.creator_fee`). Only the buyback share is paid in the trade |
| CPI-only | `multi_hop_curve_swap` | 13 | Signed by the PumpSwap `global_config` PDA, so only PumpSwap's `multi_hop_swap` can call it |

Sources: [docs `README.md`, `TRADE_V3.md`, `SWEEP_FEES.md`] [idl].

**Synthetic migration.** A v3 buy that empties the curve has no maximum size. It takes what is left on the curve,
marks it `complete`, then keeps buying from the tokens and quote the migration would deposit, priced with PumpSwap's
constant-product formula, and charges the curve fee schedule on both parts. The pool part is recorded in
`post_complete_base_out` / `post_complete_quote_in` and reported in `PostCompleteBuyEvent` [docs `SYNTHETIC_MIGRATION.md`].
Mayhem curves are excluded. After the crossing buy, every trade fails with `BondingCurveComplete` until migration.

### Graduation

- **`migrate_v2`** / `migrate`: permissionless (any `user` signs). Requires `complete == true`. Creates the canonical
  PumpSwap pool through CPI (`create_pool`, index 0, `creator` = `["pool-authority", mint]`), deposits all base tokens
  left in the curve and the raised quote minus `pool_migration_fee`, and sends the fee remainder (after rent for the new
  accounts) to `withdraw_authority`. The LP tokens go to the pool-authority's token account. The docs describe the LP
  tokens as burnt [docs `PUMP_PROGRAM_README.md`]. Two boost PDAs are mandatory remaining accounts [sdk `pump_v2.rs`].
- `withdraw` (legacy Raydium path) is disabled by `enable_migrate` [docs].

### Creator fees

- `sweep_creator_fee` / `sweep_protocol_fee`: permissionless. Move fees kept on the curve to the creator vault or to
  a fee recipient. pump.fun runs the protocol sweep [docs `SWEEP_FEES.md`].
- `collect_creator_fee` / `collect_creator_fee_v2`: creator vault → creator wallet.
- `distribute_creator_fees` / `distribute_creator_fees_v2`: permissionless. Pays a sharing config's creator vault to
  its shareholders by `share_bps`. `get_minimum_distributable_fee` checks the minimum.
- `migrate_bonding_curve_creator`: moves the creator role to the coin's sharing config.
- `distribute_fee_to_holders(amounts: Vec<u64>)`: signed by `holder_reward_claim_authority`. Pays the holder-rewards
  PDA's balance to the owners passed as remaining accounts, in amounts the signer chooses [idl doc]. Who counts as a
  holder and how much each gets is decided off chain.
- `claim_cashback`, `claim_cashback_v2`: existing cashback coins only.

### Creator identity and takeovers

- `set_metaplex_creator`: permissionless. Copies the Metaplex creator into the curve.
- `set_creator(creator)`: signed by `set_creator_authority` (`39azUYFW…`). Sets the curve's creator from metadata or
  the argument [idl doc].
- `admin_cto(is_holder_reward, creator_fee_bps, new_creator)`: signed by `admin_set_creator_authority` (`UqN2p5bA…`).
  Replaces a coin's creator on the curve and, through CPI, on its PumpSwap pool (`admin_cto_pool`) and its sharing
  config (`admin_cto_sharing_config`). Pays the outgoing creator's vaults out first. Can convert a coin to holder
  rewards, which is one-way. Mayhem coins cannot be taken over [docs `HOLDER_REWARDS_README.md`] [sdk README].

### PUMP incentives and user accounts

`init_user_volume_accumulator`, `sync_user_volume_accumulator`, `close_user_volume_accumulator`,
`claim_token_incentives`, `admin_update_token_incentives` (authority). The schedule is empty on chain today [chain].

### Admin (signed by `Global.authority` unless noted)

| Instruction | What it changes |
| --- | --- |
| `set_params` | Curve shape for new coins (initial virtual/real reserves, total supply), legacy fee bps, `withdraw_authority`, `enable_migrate`, `pool_migration_fee`, `set_creator_authority`, `admin_set_creator_authority` |
| `update_global_authority` | Hands `Global.authority` to a new key |
| `update_buyback_config` | `buyback_basis_points`, the protocol-fee share sent to buyback vaults |
| `update_creator_fee_config` | Whether custom-pair coins set their own creator fee, and its cap |
| `update_holder_reward_config` | Holder-rewards on/off and `holder_reward_claim_authority` |
| `toggle_create_v2`, `toggle_mayhem_mode`, `toggle_cashback_enabled` | Turn coin creation (v2), mayhem coins and cashback coins on or off |
| `set_reserved_fee_recipients(whitelist_pda)` | Mayhem fee routing |
| `add_quote_mint`, `remove_quote_mint`, `set_virtual_quote_reserves`, `set_max_curve_depth` | Standard quote mints, their starting reserves, pump-coin quote depth |
| QuoteControl: `initialize_quote_control`, `add_quote_control_mint`, `remove_quote_control_mint`, `set_quote_control_mint_reserves`, `set_quote_control_admin`, `set_quote_control_reserves_admin` | Custom-pair quote list. The signer is named `authority` without an IDL relation for most of these. By field name it is `QuoteControl.admin` / `reserves_admin` [inferred] |
| `admin_update_token_incentives` | PUMP incentive schedule |
| `admin_set_idl_authority` | Authority of the on-chain IDL account |
| `set_mayhem_virtual_params` | Signed by the Mayhem `["sol-vault"]` PDA, so only the Mayhem program can call it. Rewrites a mayhem curve's virtual reserves (`UpdateMayhemVirtualParamsEvent` carries old and new values) [idl] |

No instruction argument carries `Global.fee_recipients` or `buyback_fee_recipients`. Two IDL errors suggest the admin
replaces these lists through remaining accounts: `WrongBuybackFeeRecipientsCount` ("buyback fee recipients require
exactly 8 remaining accounts (or none)", likely on `update_buyback_config`) and `UnsortedNotUniqueFeeRecipients`
[inferred]. The April 2026 switch to the buyback recipients shipped with a program upgrade [docs `BREAKING_FEE_RECIPIENT.md`].

## What an authority can change, pause or redirect

- **Upgrade multisig (3 of 4, no time lock):** replaces the whole program, including every rule below. It last did so on
  2026-10-19 [chain].
- **`Global.authority`:** the curve shape for new coins, the buyback share, coin creation (`toggle_create_v2`), mayhem,
  holder rewards, quote mints, and who holds the two creator-setting keys. Fee rates live in Pump Fees `FeeConfig`,
  whose admin is the same vault (see [pump-fees.md](pump-fees.md)).
- **`admin_set_creator_authority`:** redirects any non-mayhem coin's creator fees to a new address, or to holders,
  through `admin_cto`.
- **`set_creator_authority`:** sets a curve's creator.
- **`holder_reward_claim_authority`:** decides each holder-rewards payout amount and recipient.
- **Mayhem program:** rewrites the virtual reserves of mayhem curves.
- The IDL has no per-coin pause instruction for curve trading. The global switches are `toggle_create_v2` here and
  `disable` on PumpSwap (see [pump-amm.md](pump-amm.md)).

## Re-verified 2026-10-28

Read again at slot 462,377,442 (2026-10-28 06:37 UTC) by `scripts/read-live.mjs` [chain]. Upgrade authority, ProgramData and last deploy (slot 458,921,440,
2026-10-19 17:47:02 UTC) are unchanged. Every `Global` field above reads the same. The Squads multisig behind the upgrade
key still has threshold 3 of 4, time lock 0 and transaction index 157, so no multisig transaction has executed since
2026-10-26 [chain, `scripts/read-flows.mjs keys`].

- **IDL.** `../idl/pump.json` is now the copy shipped in `pump-rust-client` 0.5.0 (crates.io, 2026-10-19), the newest
  published. It has the same 56 instructions, 7 accounts and 32 events as docs commit `639b87f`. Two changes:
  `TradeEvent` gained `quote_transfer_fee: u64`, and error 6110 `QuoteMintNotWritable` reads "quote_mint must be
  writable for a quote with a Token-2022 transfer fee: its withheld fees are harvested to the mint". Curves can now
  be quoted in Token-2022 mints that charge a transfer fee [idl] [sdk `src/math/transfer_fee.rs`].
- **`QuoteControl`** still lists 224 custom quote mints and the same two admins. 202 starting-reserve values were
  repriced since 2026-10-26: `reserves_admin` keeps each quote's starting reserves in step with its price [chain].
- **The mint a coin gets** is described in [token-and-modes.md](token-and-modes.md).
- **The web app** builds `create_v2` + `buy_v2` in the browser, and a server holds vanity mint keys. See
  [../flows/create-coin.md](../flows/create-coin.md).

## Full instruction reference

Generated from [`idl/pump.json`](../idl/pump.json) by `node scripts/idl-tables.mjs pump`. "Signers" shows the config
field a signer is checked against when the IDL declares it.

| Instruction | Arguments | Signers | IDL doc |
| --- | --- | --- | --- |
| `add_quote_control_mint` | quote_mint: pubkey, initial_virtual_quote_reserves: u64 | `authority` |  |
| `add_quote_mint` | quote_mint: pubkey | `authority` (= global.authority) |  |
| `admin_cto` | is_holder_reward: Option<bool>, creator_fee_bps: Option<u64>, new_creator: Option<pubkey> | `admin_set_creator_authority` (= global.admin_set_creator_authority) |  |
| `admin_set_idl_authority` | idl_authority: pubkey | `authority` (= global.authority) |  |
| `admin_update_token_incentives` | start_time: i64, end_time: i64, seconds_in_a_day: i64, day_number: u64, pump_token_supply_per_day: u64 | `authority` (= global.authority) |  |
| `buy` | amount: u64, max_sol_cost: u64, track_volume: OptionBool, partial_fill: OptionBool | `user` | Buys tokens from a bonding curve. |
| `buy_exact_quote_in_v2` | spendable_quote_in: u64, min_tokens_out: u64, partial_fill: OptionBool | `user` |  |
| `buy_exact_quote_in_v3` | spendable_quote_in: u64, min_tokens_out: u64, partial_fill: OptionBool | `user` |  |
| `buy_exact_sol_in` | spendable_sol_in: u64, min_tokens_out: u64, track_volume: OptionBool, partial_fill: OptionBool | `user` | Given a budget of spendable SOL, buy at least min_tokens_out tokens. Fees are deducted from spendable_sol_in.  # Quote formulas Where: - total_fee_bps = protocol_fee_bps + creator_fee_bps (creator_fee_bps is 0 if no crea |
| `buy_v2` | amount: u64, max_sol_cost: u64, partial_fill: OptionBool | `user` |  |
| `buy_v3` | amount: u64, max_sol_cost: u64, partial_fill: OptionBool | `user` |  |
| `claim_cashback` | — | — |  |
| `claim_cashback_v2` | — | — | Pays out the user's accrued cashback. For a token quote, `associated_quote_user` may be any token account of `quote_mint` owned by `user`, not only the associated one. |
| `claim_token_incentives` | — | `payer` |  |
| `close_user_volume_accumulator` | — | `user` |  |
| `collect_creator_fee` | — | — | Collects creator_fee from creator_vault to the coin creator account |
| `collect_creator_fee_v2` | — | — | Collects creator_fee from creator_vault to the coin creator account |
| `create` | name: string, symbol: string, uri: string, creator: pubkey | `mint`<br>`user` | Creates a new coin and bonding curve. |
| `create_v2` | name: string, symbol: string, uri: string, creator: pubkey, is_mayhem_mode: bool, is_cashback_enabled: OptionBool, creator_fee_bps: OptionU64, is_holder_reward: OptionBool | `mint`<br>`user` | Creates a new spl-22 coin and bonding curve.  Remaining accounts select the quote mint (none = SOL): `quote_mint`, `associated_quote_bonding_curve`, `quote_token_program` (SPL Token or Token-2022; must own the mint), plu |
| `distribute_creator_fees` | — | — | Distributes creator fees to shareholders based on their share percentages The creator vault needs to have at least the minimum distributable amount to distribute fees This can be checked with the get_minimum_distributabl |
| `distribute_creator_fees_v2` | initialize_ata: bool | `payer` |  |
| `distribute_fee_to_holders` | amounts: Vec<u64> | `holder_reward_claim_authority` (= global.holder_reward_claim_authority) | Pays fees collected on the `holder-rewards` PDA (via `collect_creator_fee*` with the PDA as creator) out to holders: `amounts[i]` goes to remaining accounts `[2i]` (owner) / `[2i + 1]` (its quote ATA, created if missing) |
| `extend_account` | — | `user` | Extends the size of program-owned accounts |
| `get_minimum_distributable_fee` | — | — | Permissionless instruction to check the minimum required fees for distribution Returns the minimum required balance from the creator_vault and whether distribution can proceed |
| `init_user_volume_accumulator` | — | `payer` |  |
| `initialize` | — | `user` | Creates the global state. |
| `initialize_quote_control` | — | `user` |  |
| `migrate` | — | `user` | Migrates liquidity to pump_amm if the bonding curve is complete |
| `migrate_bonding_curve_creator` | — | — |  |
| `migrate_v2` | — | `user` | Migrates liquidity to pump_amm if the bonding curve is complete |
| `multi_hop_curve_swap` | amount_in: u64, hop_fees: bytes | `pump_amm_global_config` (PDA ["global_config"])<br>`user`<br>`source_authority` |  |
| `remove_quote_control_mint` | quote_mint: pubkey | `authority` |  |
| `remove_quote_mint` | quote_mint: pubkey | `authority` (= global.authority) |  |
| `sell` | amount: u64, min_sol_output: u64 | `user` | Sells tokens into a bonding curve. For cashback coins, pass as remaining_accounts: [0] user_volume_accumulator, [1] bonding_curve_v2. If provided and valid, creator_fee goes to user_volume_accumulator. Otherwise, falls b |
| `sell_v2` | amount: u64, min_sol_output: u64 | `user` |  |
| `sell_v3` | amount: u64, min_sol_output: u64 | `user` |  |
| `set_creator` | creator: pubkey | `set_creator_authority` (= global.set_creator_authority) | Allows Global::set_creator_authority to set the bonding curve creator from Metaplex metadata or input argument |
| `set_max_curve_depth` | max_curve_depth: u8 | `authority` (= global.authority) |  |
| `set_mayhem_virtual_params` | — | `sol_vault_authority` (PDA ["sol-vault"]) |  |
| `set_metaplex_creator` | — | — | Syncs the bonding curve creator with the Metaplex metadata creator if it exists |
| `set_params` | initial_virtual_token_reserves: u64, initial_virtual_sol_reserves: u64, initial_real_token_reserves: u64, token_total_supply: u64, fee_basis_points: u64, withdraw_authority: pubkey, enable_migrate: bool, pool_migration_fee: u64, creator_fee_basis_points: u64, set_creator_authority: pubkey, admin_set_creator_authority: pubkey | `authority` (= global.authority) | Sets the global state parameters. |
| `set_quote_control_admin` | new_admin: pubkey | `authority` (= global.authority) |  |
| `set_quote_control_mint_reserves` | quote_mint: pubkey, initial_virtual_quote_reserves: u64 | `authority` |  |
| `set_quote_control_reserves_admin` | new_reserves_admin: pubkey | `authority` |  |
| `set_reserved_fee_recipients` | whitelist_pda: pubkey | `authority` (= global.authority) |  |
| `set_virtual_quote_reserves` | initial_virtual_quote_reserves: u64 | `authority` (= global.authority) |  |
| `sweep_creator_fee` | — | `payer` |  |
| `sweep_protocol_fee` | — | `payer` |  |
| `sync_user_volume_accumulator` | — | — |  |
| `toggle_cashback_enabled` | enabled: bool | `authority` (= global.authority) |  |
| `toggle_create_v2` | enabled: bool | `authority` (= global.authority) |  |
| `toggle_mayhem_mode` | enabled: bool | `authority` (= global.authority) |  |
| `update_buyback_config` | buyback_basis_points: Option<u64> | `authority` (= global.authority) |  |
| `update_creator_fee_config` | creator_fee_configurable: bool, max_configurable_creator_fee_bps: u64 | `authority` (= global.authority) |  |
| `update_global_authority` | — | `authority` (= global.authority) |  |
| `update_holder_reward_config` | is_holder_reward_enabled: bool, holder_reward_claim_authority: pubkey | `authority` (= global.authority) |  |
