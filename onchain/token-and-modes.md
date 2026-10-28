# Token standard, metadata and coin modes

## The mint a coin gets

Read from chain on 2026-10-28: the mint of Robotaxi Coin, `6xc3RU6UMZinBJJgeMaNBqRbanTdG1QTq47tCXXwpump`, created
by `create_v2` and graduated the same day [chain, `scripts/read-extra.mjs` → `../data/extra-snapshot.json`].

| Field | Value |
| --- | --- |
| Owner program | Token-2022 `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |
| Account size | 399 bytes |
| Decimals | 6 |
| Mint authority | none |
| Freeze authority | none |
| Supply | 954,783,435.618084: 1 B was minted at creation, so 45.2 M have been burned since. Burns come from holders and from boost buy-and-burn; this read does not say which |
| Extensions | `MetadataPointer` (authority none, points at the mint itself) and `TokenMetadata` (update authority none, `name`, `symbol`, `uri`, no additional fields) |

No transfer fee, transfer hook, permanent delegate, pausable or default-account-state extension. The metadata lives
in the mint account (Token-2022 metadata extension), not in a Metaplex account, and nobody can edit it after
creation [chain]. Legacy `create` coins instead have an SPL Token mint and Metaplex metadata at
`metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s` [docs `COIN_CREATION.md`].

Mint addresses end in `pump` because the web app takes a vanity key from a server pool
(`GET /vanity/random-mint-public-key`; `GET /coins/check-vanity-store/{mint}` checks whether a key came from it) and
the server adds the mint's signature (`POST /coins/sign-create-tx`) [contract] [bundle]. See
[../flows/create-coin.md](../flows/create-coin.md).

## What the metadata `uri` points at

The web app uploads the image and then the JSON to IPFS through Pinata with a presigned URL from
`GET /ipfs/pinata-presigned`, and writes `https://ipfs.io/ipfs/<cid>` into the mint. It reads images back through the
dedicated gateway `pump.mypinata.cloud` and the resizing CDN `images.pump.fun` [bundle] [capture]. The JSON fields are
`name, symbol, description, image, showName, createdOn, twitter, telegram, website, video` [docs
github.com/pump-fun/pump-fun-skills `create-coin/references/METADATA.md`]. Third-party launchers write their own
URIs (the Robotaxi mint points at `metadata.j7tracker.io`) [chain].

## Mode flags

Each flag is fixed at creation in `create_v2`, stored on the `BondingCurve`, and copied into the PumpSwap `Pool` at
migration [idl] [docs].

| Flag | Where | What it changes | Global switch (live 2026-10-28) |
| --- | --- | --- | --- |
| `is_mayhem_mode` | `BondingCurve`, `Pool` | Protocol fee goes to the Mayhem program's 8 reserved recipients, no buyback share; the Mayhem program may rewrite the curve's virtual reserves (`set_mayhem_virtual_params`); excluded from synthetic migration, multi-hop and takeovers. Off chain: 2 B supply, an agent trades for 24 h, leftovers burned [press]. See [mayhem.md](mayhem.md) | `mayhem_mode_enabled = true` (Pump and PumpSwap) |
| `is_cashback_coin` | `BondingCurve`, `Pool` | The creator fee goes to the trader's `UserVolumeAccumulator` as cashback | `is_cashback_enabled = true`, but `create_v2` has rejected new cashback coins since 2026-09-12 [docs] |
| `is_holder_reward` | `BondingCurve`, `Pool` | Creator is the `["holder-rewards", mint]` PDA; pump.fun's `holder_reward_claim_authority` pays holders off chain-computed amounts. Can be set later through `admin_cto` | `is_holder_reward_enabled = true` |
| `creator_fee_bps` | `Pool` (custom-pair coins) | The coin's own creator fee, up to `max_configurable_creator_fee_bps` = 300 | `creator_fee_configurable = true` |
| quote mint | `BondingCurve.quote_mint` | SOL, USDC (standard schedule) or one of 224 custom quote mints (xStocks, PreStocks, pump coins up to depth 2, PUMP) | `whitelisted_quote_mints`, `QuoteControl` |
| boost | PumpSwap boost vault, set up at migration | ~17.6 SOL of the raised SOL spent on buy-and-burn after graduation; the API reports `boost_mode` per coin | `boost_enabled = true` |
| tokenized agent | Agent Payments `TokenAgentPayments` | Payments split into buy-and-burn and withdrawal; the launch option was removed 2026-06-30 [press]; the API still reports `tokenized_agent` | n/a |

Live switches from [chain] at slot 462,377,442. The API's coin record repeats these as `is_cashback_enabled`,
`is_holder_reward`, `boost_mode`, `tokenized_agent`, `quote_mint`, `transfer_fee_bps`, `transfer_hook_program`,
`depth` [capture `coins-v3`].
