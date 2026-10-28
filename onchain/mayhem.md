# Mayhem program

`MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e` ("Pump Mayhem Program" on Solscan)

The program behind **mayhem mode** coins, an option on `create_v2` since 11 November 2025 [docs README history,
commit `bec9a97`]. pump.fun publishes no IDL for it. Everything below comes from the Pump IDL's references to its
accounts, pump's docs, live account reads and decoded trades.

## Identity

| Field | Value | Source |
| --- | --- | --- |
| ProgramData | `4TXghKDfUy26yBMjicyfSfAp995GbLtNvW1d1uPSknub`, 777,453 bytes, 3.95 SOL rent | [chain] |
| Upgrade authority | `7gZufwwAo17y5kg8FMyJy2phgpvv9RSdzWtdXiWHjFr8` (3-of-4 Squads vault, same as Pump) | [chain] |
| Last deploy | slot 452,655,053, **2026-10-02 15:47:53 UTC** | [chain] |
| IDL | none published, none on chain | [chain] [docs] |

## Accounts

| Account | Seeds (Mayhem program) | Live state [chain] |
| --- | --- | --- |
| `global-params` | `["global-params"]` → `13ec7XdrjF3h3YcqBTFDSReRcUFwbCnJaAQspM4j6DDJ` | 318 bytes, layout unpublished (raw hex in `data/live-snapshot.json`) |
| `sol-vault` | `["sol-vault"]` → `BwWK17cbHxwWBKZkUYvzxLcNQ1YVyaFezduWbtm2de6s` | System-owned PDA holding **64,224.34 SOL**. It is also `whitelist_pda` in Pump `Global` and PumpSwap `GlobalConfig` |
| `mayhem-state` | `["mayhem-state", mint]` | Per-coin state, created by `create_v2` |
| mayhem token vault | ATA(`sol-vault`, mint, Token-2022) | Per-coin token account owned by the sol-vault, passed to `create_v2` |
| reserved fee recipients ×8 | owned by this program, 74 bytes each | `GesfTA3X…`, `4budycTj…`, `8SBKzEQU…`, `4UQeTP1T…`, `8sNeir4Q…`, `Fh9HmeLN…`, `463MEnMe…`, `6AUH3WEH…`: 63.87 SOL together |

## How mayhem coins differ, on chain

- **Protocol fee goes to this program's accounts.** A mayhem coin's protocol fee is paid or swept to one of the 8
  reserved recipients, all owned by the Mayhem program [docs `FEE_RECIPIENTS.md`] [chain].
- **No buyback share.** Two mayhem curve trades decoded on 2026-10-26 report `buyback_fee_basis_points` = 0 and
  `buyback_fee` = 0, while protocol (95 bps) and creator (30 bps) fees were charged as usual [tx
  `35CakHGyZkHYazouRkWJJCu6DmqgaMhkKhPFBcp2116o1bLMiL9yyCvJxF6bppWDmT8ydkys1Sd3sXA9X8YPmH2o`,
  `47iBM7BC8qkkQJnXP9hzHoBKXHpZ7bBPXRkvBddyUJ4TzepHk82GpcQtjXW6qbrLFKkZhHWn4styNcURfCUyBCkK`].
- **Rewritable curve.** Pump's `set_mayhem_virtual_params` can only be signed by this program's `sol-vault` PDA. It
  rewrites a mayhem curve's virtual token and SOL reserves (`UpdateMayhemVirtualParamsEvent` logs old and new values)
  [idl].
- **Small curves.** The two mayhem curves above traded at 0.129 and 0.037 SOL virtual SOL reserves. A mayhem coin that
  migrated at 04:10 UTC deposited 0.019 SOL into its pool [tx `3APwkHCtx3MRppKWFWMvipUh9p82cBDYN4DdXKyp3HSWJ5TfQqW82gAZM5eKR97PsDtV86cjscriPiw8Wcv2ZkM6`].
  A standard curve starts at 30 SOL virtual and completes at about 85 SOL raised (computed from the live `Global`, see
  [lifecycle.md](lifecycle.md)).
- **Excluded features:** synthetic migration, multi-hop routes, community takeovers (`admin_cto`) and use as a quote
  mint [docs `SYNTHETIC_MIGRATION.md`, `MULTI_HOP_SWAP.md`, `CREATE_WITH_PUMP_COIN_QUOTE.md`] [sdk README].

## Switches

- Pump `toggle_mayhem_mode` and PumpSwap `toggle_mayhem_mode` (admin `FFWtr…`). Both are on: `mayhem_mode_enabled = true` [chain].
- Pump/PumpSwap `set_reserved_fee_recipients(whitelist_pda)` (admin).

## Not established here

The program's own instructions, who triggers its trading, and how the 64,224 SOL in `sol-vault` is used are not
documented by pump.fun and cannot be read from an IDL.

## Re-verified 2026-10-28

Read again at slot 462,377,442 (2026-10-28 06:37 UTC) by `scripts/read-live.mjs` [chain]. Upgrade authority and last deploy (slot 452,655,053) are unchanged. The
`sol-vault` PDA holds **63,644.26 SOL**, 580.08 SOL less than on 2026-10-26 [chain].

### Instructions, from the program binary

`pump-rust-client` 0.5.0 ships a build of this program as `artifacts/mayhem_program.so`, used by its local
validator. Its Anchor log strings name 20 instructions [sdk-bin, `scripts/so-strings.mjs`]:

| Group | Instructions |
| --- | --- |
| Trading | `buy`, `sell`, `buy_pump_swap`, `sell_pump_swap` |
| Per coin | `initialize_mayhem_state`, `burn_tokens`, `reset_state`, `reset_sol_deployed` |
| Admin and operator | `initialize_global_params`, `update_global_params`, `initialize_fee_recipient`, `sweep_fees`, `sweep_fees_admin`, `update_max_sol_per_sweep`, `withdraw_admin`, `update_trader`, `update_admin`, `stop_trading`, `resume_trading`, `extend_account` |

The shipped build is not byte-identical to the deployed program: the sha256 of the first 676,720 bytes of
ProgramData differs from the artifact's [chain, `../data/extra-snapshot.json`]. The names describe the program's
interface. The deployed code may have more.

### What it does on chain, observed

The three newest successful transactions on 2026-10-28 06:47 UTC were all signed by one key,
`Gygj9QQby4j2jryqyqBHvLP7ctv2SaANgh4sCb69BUpA`. Each runs the Mayhem `sell` instruction (discriminator match), which
calls Pump (curve trade), Pump Fees and Token-2022 [tx `3x31EA8u…`, `3yekyscG…`, `5QtkLtfD…`, full signatures in
`../data/extra-snapshot.json`]. That key is the trading agent's operator, which `update_trader` sets [inferred].

### The mode as pump.fun describes it

Mayhem is chosen at creation. The coin gets 2 B supply instead of 1 B, and the extra 1 B goes to an AI agent that
trades the coin for its first 24 hours. Whatever the agent still holds afterwards is burned [press: KuCoin,
cryptonomist.ch, 2025-11-12]. The web API now lets a coin switch between automatic and manual mayhem, trigger single
manual trades (`POST /mayhem/{mint}/mode`, `/trigger-trade`, partner `POST /mayhem/partner/{mint}/trigger`) and send
"party emotes" on multiplayer mayhem coins [contract, `../data/frontend-api-v3-contract.md`]. The indexer reports
`isMayhemMode`, `mayhemState` and `isMultiplayer` per coin [capture, `advanced-indexer /in-memory-coin`].
