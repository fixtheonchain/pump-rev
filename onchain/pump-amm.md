# PumpSwap (pump_amm): the AMM graduated coins trade on

`pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA`

A constant-product AMM. Every graduated pump coin gets a canonical pool here at migration. Anyone can also create
other pools. Pricing uses effective quote reserves (vault balance plus a signed `virtual_quote_reserves`), and pump's
canonical pools carry a market-cap fee schedule with a creator fee and a buyback share.

## Identity

| Field | Value | Source |
| --- | --- | --- |
| Program | `pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA` | [chain] |
| ProgramData | `6naEzKeUuFh1Jeeu51NXQgr5qkXgXtc9WKNct4xynVJc`, 10,485,760 bytes, 53.27 SOL rent | [chain] |
| Upgrade authority | `7gZufwwAo17y5kg8FMyJy2phgpvv9RSdzWtdXiWHjFr8`, the same 3-of-4 Squads vault as Pump | [chain] |
| Last deploy | slot 458,921,517, **2026-10-19 17:47:20 UTC**. Executed through Squads v4 in tx `2zsoY8doVFSfB1L8BQQ9GeyeEA1PgFUoFdK5CrqkzGtq8d8ie7cdUuScCue8RFLXWXFjmDvJiV6kJBcF3rUfXMXv`: member `4tbEe4AquJWyMh7f7yE5poFChhsuPbeGh7EHVQCvq2N8` signed, and the buffer's 6.44 SOL rent went back to `92gWFZMpGhWzVq5tjBnJxF9VnFwE3ydB2idJp9z2D9Nr` | [chain] [tx] |
| IDL used here | [`idl/pump_amm.json`](../idl/pump_amm.json) (`pump-rust-client` 0.5.0), 38 instructions | [idl] |
| On-chain Anchor IDL | `5fLnXNNoZcZt9Qku6HARM3un3Ttm2cGsR7gN9Zp1R7h3`, authority `GUYCUEpxSkm1ccDo3LSKMR4Xpe5bgMnEZaFygWUSEVH3`, 27 instructions. It lacks the v2 trades, `multi_hop_swap`, the sweeps, all boost instructions, `admin_cto_pool` and `update_creator_fee_config`, and still lists `admin_set_coin_creator`. Saved in [`idl/onchain/pump_amm.json`](../idl/onchain/pump_amm.json) | [chain] |

## Accounts and PDAs

| Account | Seeds | Notes |
| --- | --- | --- |
| `GlobalConfig` | `["global_config"]` → `ADyA8hdefvWN2dbGGWFotbzWxrAvLW83WG6QCVXvJKqw` | Admin, fallback fees, recipients, flags |
| `Pool` | `["pool", index (u16 LE), creator, base_mint, quote_mint]` | A pump coin's **canonical pool** has index 0 and `creator` = Pump PDA `["pool-authority", mint]` |
| LP mint | `["pool_lp_mint", pool]` | |
| pool vaults | ATA(pool, base_mint), ATA(pool, quote_mint) | Stored in `Pool` |
| coin creator vault authority | `["creator_vault", coin_creator]` | Its quote ATA collects creator fees |
| boost vault authority | `["boost_vault", pool]`; its quote ATA is the boost vault | Holds SOL set aside at migration for buy-and-burn |
| `UserVolumeAccumulator` | `["user_volume_accumulator", user]` | Separate from the Pump one. Cashback is held in its WSOL ATA |
| `GlobalVolumeAccumulator` | `["global_volume_accumulator"]` → `C2aFPdENg4A2HQsmrd5rTw5TaYBX5Ku887cWjbFKtZpw` | All zero on chain: no PUMP incentive schedule [chain] |
| Pump Fees `FeeConfig` | `["fee_config", pump_amm program id]` @ pump_fees → `5PHirr8joyTMp9JMm6nW7hNDVyEYdkzDqazxPD7RaTjx` | The schedule trades read |

`Pool` fields: `pool_bump, index, creator, base_mint, quote_mint, lp_mint, pool_base_token_account,
pool_quote_token_account, lp_supply, coin_creator, is_mayhem_mode, is_cashback_coin, virtual_quote_reserves (i128),
creator_fee_bps, can_edit_creator_fee, is_holder_reward, protocol_fees, creator_fees` [idl].

## GlobalConfig, read live

Slot 461,522,470, 2026-10-26 04:07 UTC [chain]:

| Field | Live value |
| --- | --- |
| `admin` | `FFWtrEQ4B4PKQoVuHYzZq8FabGkVatYzDpEVHsK5rrhF` (Squads vault, same as Pump `Global.authority`) |
| `lp_fee_basis_points` / `protocol_fee_basis_points` / `coin_creator_fee_basis_points` | 20 / 5 / 5 (fallback; trades read `FeeConfig`) |
| `disable_flags` | **0**: create_pool, deposit, withdraw, buy and sell all enabled |
| `protocol_fee_recipients[8]` | `62qc2CNX…`, `7VtfL8fv…`, `7hTckgnG…`, `9rPYyANs…`, `AVmoTthd…`, `FWsW1xNt…`, `G5UZAVbA…`, `JCRGumoE9Qi5BBgULTgdgTLjSgkCMSbF62ZZfGs84JeU`. The first seven are shared with Pump. All eight are off-curve, system-owned addresses (the Squads vault pattern) |
| `admin_set_coin_creator_authority` | `UqN2p5bAzBqYdHXcgB6WLtuVrdvmy9JSAtgqZb3CMKw` (Squads vault) |
| `reserved_fee_recipient(s)` / `whitelist_pda` / `mayhem_mode_enabled` | Same Mayhem accounts as Pump / `BwWK17cb…` / true |
| `buyback_fee_recipients[8]` / `buyback_basis_points` | The same 8 `BuybackVault`s / **5,000** |
| `boost_authority` / `boost_enabled` | `HTVZVEQMBsNanubDPTs3CxDAEGNFQHJY8c1441iy2S5r` (single keypair, 29.20 SOL) / **true** |
| `is_cashback_enabled` | true |
| `creator_fee_configurable` / `max_configurable_creator_fee_bps` | true / 300 |

## Fee schedule (Pump Fees `FeeConfig` for pump_amm, live)

`FeeConfig` `5PHirr8joyTMp9JMm6nW7hNDVyEYdkzDqazxPD7RaTjx`, admin `FFWtr…` [chain]. Which schedule applies:

- **Canonical pool, SOL quote:** `fee_tiers`, chosen by pool market cap in lamports
  (`quote_reserve × base_supply / base_reserve`). 25 tiers. Values are in [fees.md](fees.md#pumpswap-canonical-pools-market-cap-tiers).
- **Canonical pool, USDC quote:** `stable_fee_tiers`, 25 tiers in USDC units [sdk `fees.ts` `STABLE_QUOTE_MINTS`].
- **Canonical pool, custom quote (QuoteControl mint):** `exotic_flat_fees` = LP 20 / protocol 5 / creator 5 bps, or the
  pool's own `creator_fee_bps` when set (up to 300).
- **Any other pool:** `flat_fees` = LP 25 / protocol 5 / creator 0 bps.

The tier table matches the schedule pump.fun published for 1 September 2025 (`docs/fees.png`) to the basis point.
Both were checked against two live trades [tx]: a canonical SOL pool at ~4,319 SOL market cap paid 20/5/80 bps, and a
non-canonical pool paid 25/5/0 bps.

## Instructions

### Pools and liquidity

- `create_pool(index, base_amount_in, quote_amount_in, coin_creator, is_mayhem_mode, …)`: anyone. Pump's
  `migrate`/`migrate_v2` calls it through CPI to create the canonical pool.
- `deposit`, `withdraw`: LP in and out, priced against the vault net of waiting fees [sdk README]. Canonical pools'
  LP tokens are minted to Pump's pool-authority account at migration; pump's docs say they are burnt.

### Trading

| Generation | Instructions | Fee handling |
| --- | --- | --- |
| v1 | `buy`, `sell`, `buy_exact_quote_in` (21–23 accounts) | LP fee into reserves; protocol, buyback and creator fee paid out in the trade |
| v2 (Oct 2026) | `buy_v2`, `sell_v2`, `buy_exact_quote_in_v2` (17 accounts) | Protocol and creator fee **kept in the quote vault** (`Pool.protocol_fees`, `Pool.creator_fees`) and subtracted from `virtual_quote_reserves`. The buyback share is paid in the trade |
| routing | `multi_hop_swap` | Chains pool and curve hops (calls Pump's `multi_hop_curve_swap`) |

Price = constant product on `pool_base_token_account.amount` and `pool_quote_token_account.amount +
virtual_quote_reserves` [docs `PUMP_SWAP_README.md`, `NEGATIVE_VIRTUAL_QUOTE_RESERVES.md`].

### Fees and creators

- `sweep_protocol_fee`, `sweep_creator_fee`: permissionless payouts of the waiting fees.
- `collect_coin_creator_fee`: creator vault → coin creator.
- `transfer_creator_fees_to_pump` / `_v2`: moves a pool's creator fees into the Pump creator vault so sharing
  configs can distribute them.
- `set_coin_creator`: permissionless. Sets `Pool.coin_creator` from Metaplex metadata or `BondingCurve.creator` [idl doc].
- `migrate_pool_coin_creator`: moves the coin creator to the sharing config.
- `admin_cto_pool(coin_creator, is_holder_reward, creator_fee_bps)`: signed by Pump's `["pool-authority", mint]`
  PDA, so it only runs inside Pump's `admin_cto`.
- `claim_cashback`, volume accumulators, `claim_token_incentives`.

### Boost

- `init_boost`: the signer is an account named `creator`. Pump's migrate instructions take the boost PDAs as mandatory
  remaining accounts, and a canonical pool's creator is Pump's pool-authority PDA. So the boost is set up during
  migration [sdk] [inferred].
- `boost_buy_and_burn(quote_amount_in, min_base_amount_burned)`: the signer is named `authority`. Spends the pool's
  boost vault to buy the coin from the pool and burns what it buys (`BoostBuyAndBurnEvent`) [idl].
- `toggle_boost`, `set_boost_authority`: admin.

pump.fun made BOOST the default for new coins on 21 July 2026. About 20% of migration liquidity (17.6 SOL on SOL
pairs) is spent on TWAP buys in the first ~5 minutes after migration, and the coins bought are burned [press:
cryptobriefing.com "Pump.fun launches Boost mode…"; theblock.co, 2026-07-29]. On chain, the pool keeps pricing as if
that SOL were still in the vault (positive boost "sigma" inside `virtual_quote_reserves`). It refuses sells that
would pay out more than the real vault holds (`InsufficientRealQuoteReserves`) [sdk `math/amm.rs`].
KIMCHI's pool (`6DNxwecb…`) still carried a 17.58 SOL sigma days after migration
(`virtual_quote_reserves` 17,516,275,747 + waiting fees 68,229,540 lamports) [chain].

### Admin (signed by `GlobalConfig.admin`)

| Instruction | Effect |
| --- | --- |
| `disable(create_pool, deposit, withdraw, buy, sell)` | **Global pause** of any of the five operations across every pool |
| `update_fee_config(lp, protocol, protocol_fee_recipients[8], coin_creator, admin_set_coin_creator_authority)` | Fallback fees, **where protocol fees go**, and the creator-override key |
| `update_buyback_config` | Buyback share of the protocol fee |
| `toggle_boost`, `set_boost_authority` | Boost on/off and its operator |
| `toggle_mayhem_mode`, `toggle_cashback_enabled`, `set_reserved_fee_recipients` | Mode switches and mayhem fee routing |
| `update_creator_fee_config` | Custom-pair creator-fee cap |
| `admin_update_token_incentives` | PUMP incentive schedule |
| `update_admin` | Hands over admin |
| `create_config` | One-time init by the hard-coded key `8LWu7QM2dGR1G8nKDHthckea57bkCzXyBTAKPJUBDHo8` |

## What an authority can change, pause or redirect

- **Upgrade multisig:** everything.
- **`GlobalConfig.admin` (`FFWtr…`):** pause trading, deposits, withdrawals or pool creation globally; point protocol
  fees at new recipients; change the buyback share; turn boost on or off and choose its operator. Fee rates on
  canonical pools come from Pump Fees `FeeConfig`, which the same vault administers.
- **Boost authority (single keypair):** spends each boosted pool's boost vault on buy-and-burn. The IDL shows no
  destination for these funds other than the pool.
- **`admin_set_coin_creator_authority` via Pump `admin_cto`:** reassigns a graduated coin's creator fees.

## Re-verified 2026-10-28

Read again at slot 462,377,442 (2026-10-28 06:37 UTC) by `scripts/read-live.mjs` [chain]. Upgrade authority, ProgramData and last deploy (slot 458,921,517) are
unchanged, and so is every `GlobalConfig` field [chain].

- **IDL.** `../idl/pump_amm.json` comes from `pump-rust-client` 0.5.0 (identical to `@pump-fun/pump-swap-sdk` 2.2.0,
  2026-10-19). It has the same 38 instructions as docs commit `639b87f`. `BuyEvent`, `SellEvent`, `DepositEvent` and
  `WithdrawEvent` gained `quote_transfer_fee: u64`, and the program added error `QuoteMintNotWritable` [idl].
- **Who calls it.** On 2026-10-28 the Pump App router reached PumpSwap through its `pump_swap_v3` instruction, and
  Terminal's `route` reached it too [tx, `../data/extra-snapshot.json`]. See [cpi-graph.md](cpi-graph.md).

## Full instruction reference

Generated from [`idl/pump_amm.json`](../idl/pump_amm.json) by `node scripts/idl-tables.mjs pump_amm`.

| Instruction | Arguments | Signers | IDL doc |
| --- | --- | --- | --- |
| `admin_cto_pool` | coin_creator: pubkey, is_holder_reward: bool, creator_fee_bps: Option<u64> | `payer`<br>`pool_authority` (PDA ["pool-authority", pool.base_mint]) |  |
| `admin_update_token_incentives` | start_time: i64, end_time: i64, seconds_in_a_day: i64, day_number: u64, token_supply_per_day: u64 | `admin` (= global_config.admin) |  |
| `boost_buy_and_burn` | quote_amount_in: u64, min_base_amount_burned: u64 | `authority` |  |
| `buy` | base_amount_out: u64, max_quote_amount_in: u64, track_volume: OptionBool | `user` | For cashback coins, optionally pass user_volume_accumulator_wsol_ata as remaining_accounts[0]. If provided and valid, the ATA will be initialized if needed. |
| `buy_exact_quote_in` | spendable_quote_in: u64, min_base_amount_out: u64, track_volume: OptionBool | `user` | Given a budget of spendable_quote_in, buy at least min_base_amount_out Fees will be deducted from spendable_quote_in  f(quote) = tokens, where tokens >= min_base_amount_out  Make sure the payer has enough SOL to cover cr |
| `buy_exact_quote_in_v2` | spendable_quote_in: u64, min_base_amount_out: u64 | `user` |  |
| `buy_v2` | base_amount_out: u64, max_quote_amount_in: u64 | `user` |  |
| `claim_cashback` | — | — | Pays out the user's accrued cashback. `user_wsol_token_account` may be any token account of `quote_mint` owned by `user`, not only the associated one. |
| `claim_token_incentives` | — | `payer` |  |
| `close_user_volume_accumulator` | — | `user` |  |
| `collect_coin_creator_fee` | — | — |  |
| `create_config` | lp_fee_basis_points: u64, protocol_fee_basis_points: u64, protocol_fee_recipients: [pubkey; 8], coin_creator_fee_basis_points: u64, admin_set_coin_creator_authority: pubkey | `admin` (fixed 8LWu7Q…) |  |
| `create_pool` | index: u16, base_amount_in: u64, quote_amount_in: u64, coin_creator: pubkey, is_mayhem_mode: bool, is_cashback_coin: OptionBool, creator_fee_bps: OptionU64, can_edit_creator_fee: OptionBool, is_holder_reward: OptionBool | `creator` |  |
| `deposit` | lp_token_amount_out: u64, max_base_amount_in: u64, max_quote_amount_in: u64 | `user` |  |
| `disable` | disable_create_pool: bool, disable_deposit: bool, disable_withdraw: bool, disable_buy: bool, disable_sell: bool | `admin` (= global_config.admin) |  |
| `extend_account` | — | `user` |  |
| `init_boost` | — | `creator` |  |
| `init_user_volume_accumulator` | — | `payer` |  |
| `migrate_pool_coin_creator` | — | — | Migrate Pool Coin Creator to Sharing Config |
| `multi_hop_swap` | amount_in: u64, min_amount_out: u64 | `user` |  |
| `sell` | base_amount_in: u64, min_quote_amount_out: u64 | `user` |  |
| `sell_v2` | base_amount_in: u64, min_quote_amount_out: u64 | `user` |  |
| `set_boost_authority` | — | `admin` (= global_config.admin) |  |
| `set_coin_creator` | — | — | Sets Pool::coin_creator from Metaplex metadata creator or BondingCurve::creator |
| `set_reserved_fee_recipients` | whitelist_pda: pubkey | `admin` (= global_config.admin) |  |
| `sweep_creator_fee` | — | `payer` |  |
| `sweep_protocol_fee` | — | `payer` |  |
| `sync_user_volume_accumulator` | — | — |  |
| `toggle_boost` | enabled: bool | `admin` (= global_config.admin) |  |
| `toggle_cashback_enabled` | enabled: bool | `admin` (= global_config.admin) |  |
| `toggle_mayhem_mode` | enabled: bool | `admin` (= global_config.admin) |  |
| `transfer_creator_fees_to_pump` | — | — | Transfer creator fees to pump creator vault If coin creator fees are currently below rent.minimum_balance(TokenAccount::LEN) The transfer will be skipped |
| `transfer_creator_fees_to_pump_v2` | — | `payer` |  |
| `update_admin` | — | `admin` (= global_config.admin) |  |
| `update_buyback_config` | buyback_basis_points: Option<u64> | `admin` (= global_config.admin) |  |
| `update_creator_fee_config` | creator_fee_configurable: bool, max_configurable_creator_fee_bps: u64 | `admin` (= global_config.admin) |  |
| `update_fee_config` | lp_fee_basis_points: u64, protocol_fee_basis_points: u64, protocol_fee_recipients: [pubkey; 8], coin_creator_fee_basis_points: u64, admin_set_coin_creator_authority: pubkey | `admin` (= global_config.admin) |  |
| `withdraw` | lp_token_amount_in: u64, min_base_amount_out: u64, min_quote_amount_out: u64 | `user` |  |
