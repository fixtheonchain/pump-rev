# Who holds which key

Every authority found in the live configs, with what it can do. "Keypair" means the address is on the ed25519 curve:
an ordinary single-signature wallet. "Off-curve" means a PDA, which for a system-owned account with no data is the
Squads vault pattern. Classification was computed locally with `scripts/lib.mjs`. Balances are from
`../data/previous/live-snapshot.json` (2026-10-26 04:07 UTC) [chain].

## The keys

| Key | Kind | SOL | Roles | Source |
| --- | --- | --- | --- | --- |
| `2yMoQqQrtbhq3nQ3wFoQQawWS65qcqUXcwHEYha4rshW` | Squads v4 multisig, **3 of 4**, time lock 0, no config authority, 157 transactions so far. Members `4tbEe4AquJWyMh7f7yE5poFChhsuPbeGh7EHVQCvq2N8`, `5sFJMw5dC59oKGKA9LgeYQCSmYS6rLeCegxMkcM2Pwby`, `6W6qsDbocrEs3vjri5Di15bf9PLRYhfxekPk25MhVHWz`, `7zc8kzBr5wbsQKxYYv9uCMgfcW5zjxLEopvmuf3ig6iw` (all permissions) | n/a | "Pump.fun Multisig" | [chain] [solscan] |
| `7gZufwwAo17y5kg8FMyJy2phgpvv9RSdzWtdXiWHjFr8` | Off-curve, vault 0 of the multisig above | 321.98 | **Upgrade authority** of Pump, PumpSwap, Pump Fees, Mayhem, Agent Payments | [chain] [tx] |
| `FFWtrEQ4B4PKQoVuHYzZq8FabGkVatYzDpEVHsK5rrhF` | Off-curve, Squads vault ("global authority (amm fees)"). Solscan shows its recent executions signed by `5sFJ…`, `6W6q…` and `4tbE…`, the members above; it is not one of that multisig's vaults 0–3 | 0.26 | Pump `Global.authority`; PumpSwap `GlobalConfig.admin`; `FeeConfig.admin` for both programs; `FeeProgramGlobal.authority`; Agent Payments `protocol_authority` | [chain] [solscan] |
| `UqN2p5bAzBqYdHXcgB6WLtuVrdvmy9JSAtgqZb3CMKw` | Off-curve, Squads vault | 1.59 | `admin_set_creator_authority` (Pump) / `admin_set_coin_creator_authority` (PumpSwap): community takeovers | [chain] [solscan] |
| `39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg` | **Keypair** ("Pump.fun: Migration") | **4,718.53** | `withdraw_authority` (gets each migration's fee remainder), `set_creator_authority` | [chain] [solscan] |
| `HckQ93Xqjjo8mwt5pNPWvyCTZXQZ858rvzmm7ZRrZg9t` | **Keypair** | 69.92 | `holder_reward_claim_authority`: signs every holder-rewards payout and picks the amounts | [chain] |
| `HTVZVEQMBsNanubDPTs3CxDAEGNFQHJY8c1441iy2S5r` | **Keypair** | 29.20 | PumpSwap `boost_authority` | [chain] |
| `4zmJQ6KQXftutXjLAHJFmgANchhPD98Tm9vpNe3zogGP` | **Keypair** | n/a | `authority` of all 8 buyback vaults: sweeps them to a destination it chooses | [chain] [tx] |
| `99mRw3EzdJZWEUjgp1nrU4WeHsukUBjbh7gYE7pm4F3c` | **Keypair** ("Pump Buybacks") | 17.49 (Solscan, 04:13 UTC) | Receives buyback sweeps, swaps on Jupiter, burns PUMP. Funded by Squads vault "BBFunds1" `28Kqfva3…` | [tx] [solscan] |
| `2sMrGNK8i36YRkF5WWCwnaUYuwDJhHe1g2xA8aPvhkjM` | **Keypair** | 100.95 | Pump Fees `social_claim_authority`: pays out GitHub-linked fees | [chain] |
| `2fAEoCqd6c4tX8s9sMoXTvGnmuzoczFyJsHr72Xq4YyQ` | Off-curve | 0.09 | `QuoteControl.admin` (custom-pair quote list) | [chain] |
| `9D6H6Yp65TtwUUW7h5xwPDRzD3USvG9n3qjusYCLgz5h` | **Keypair** | 0.07 | `QuoteControl.reserves_admin` (starting reserves per quote mint) | [chain] |
| `GmFrDZT2cdrqykgTikVdXbe8EtCgzUDM9VsDhQnwsUsG` | **Keypair** | 29.12 | Agent Payments `buyback_authority` | [chain] |
| `92gWFZMpGhWzVq5tjBnJxF9VnFwE3ydB2idJp9z2D9Nr` | **Keypair** | 58.94 | **Upgrade authority of the Pump App router**; authority of Pump's on-chain IDL; got the buffer refund of the 2026-10-19 PumpSwap upgrade; funded buyback vault 1 (`9M4giFFM…`, per Solscan) | [chain] [tx] [solscan] |
| `GUYCUEpxSkm1ccDo3LSKMR4Xpe5bgMnEZaFygWUSEVH3` | **Keypair** | n/a | Authority of PumpSwap's and Pump Fees' on-chain IDL accounts | [chain] |
| `5oJNGGDxGGTt2eXuwaqtuM1AXqvWg7dCs626QnYC8xDn` | Off-curve | 2.32 | Upgrade authority of Terminal (formerly Padre) | [chain] |
| `9rmqZkmn3Bzd4jAL5uw3TXCgWvbHwH1VyW6fdFtimASu` | Off-curve | 0.10 | Upgrade authority of Donation Relay | [chain] |
| `BwWK17cbHxwWBKZkUYvzxLcNQ1YVyaFezduWbtm2de6s` | Mayhem `["sol-vault"]` PDA | **64,224.34** | `whitelist_pda` in both trading programs; the only signer allowed for `set_mayhem_virtual_params` | [chain] [idl] |
| `8LWu7QM2dGR1G8nKDHthckea57bkCzXyBTAKPJUBDHo8` | hard-coded in the IDL | n/a | One-time `create_config` / `initialize_fee_config` | [idl] |

## What can be changed without a program upgrade

| Action | Who | Instruction |
| --- | --- | --- |
| **Change any trading fee rate** on curves and canonical pools, per tier | `FFWtr…` | Pump Fees `update_fee_config`, `upsert_fee_tiers`, `update_stable_fee_config`, `set_exotic_flat_fees`. The IDL bounds only the total, at 100% (error 6006 `InvalidFeeTotal`) |
| Change the buyback share | `FFWtr…` | `update_buyback_config` on Pump and PumpSwap |
| **Pause PumpSwap** buys, sells, deposits, withdrawals or pool creation, for every pool | `FFWtr…` | PumpSwap `disable` |
| Stop new coins (v2) | `FFWtr…` | Pump `toggle_create_v2` |
| Redirect PumpSwap protocol fees | `FFWtr…` | PumpSwap `update_fee_config(protocol_fee_recipients)` |
| Change the curve for new coins and the migration fee | `FFWtr…` | Pump `set_params` |
| Redirect the migration remainder, rotate the creator keys | `FFWtr…` | Pump `set_params(withdraw_authority, set_creator_authority, admin_set_creator_authority)` |
| **Reassign a coin's creator fees**, convert it to holder rewards, set a custom creator fee | `UqN2p5…` | Pump `admin_cto` (cascades to the pool and sharing config) |
| Set a curve's creator | `39azUY…` | Pump `set_creator` |
| Decide holder-rewards recipients and amounts | `HckQ93…` | Pump `distribute_fee_to_holders(amounts)` |
| **Choose where buyback money goes** | `4zmJQ6…` | Pump Fees `sweep_buyback` (`destination` unconstrained in the IDL) |
| Rotate the buyback sweeper | `FFWtr…` | Pump Fees `update_buyback_authority` |
| Spend boost vaults on buy-and-burn | `HTVZVE…` (by role name) | PumpSwap `boost_buy_and_burn` |
| Rewrite a mayhem curve's virtual reserves | Mayhem program | Pump `set_mayhem_virtual_params` |
| Pay out GitHub-linked fees | `2sMrGN…` | Pump Fees `claim_social_fee_pda` |
| Add or price custom-pair quote mints | QuoteControl admins | Pump `add_quote_control_mint`, `set_quote_control_mint_reserves` |

## With an upgrade

The 3-of-4 multisig, with no time lock, can replace the code of all five core programs. Pump's fee recipient lists (`Global.fee_recipients`, `buyback_fee_recipients`) have no instruction argument. IDL errors
suggest `Global.authority` can replace them through remaining accounts [inferred], and the April 2026 change shipped
with an upgrade. The last
upgrades were Pump and PumpSwap on 2026-10-19, Pump Fees on 2026-10-12 and Mayhem on 2026-10-02 [chain]. The Pump App
router can be replaced by a single key (`92gWFZ…`).

## Re-verified 2026-10-28

Read again at slot 462,377,442 [chain]. Every key above holds the same role. The Squads multisig still has threshold 3
of 4, time lock 0 and transaction index 157 [chain, `scripts/read-flows.mjs keys`]. Balances that moved:
migration wallet `39azUYFW…` 4,737.74 SOL, Mayhem `sol-vault` 63,644.26 SOL. The protocol fee recipient
`CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM`, listed in the web bundle's fee-recipient array, holds 6,344.87 SOL
[chain] [bundle].

Keys found since 2026-10-26:

| Key | Kind | Role | Source |
| --- | --- | --- | --- |
| `Gygj9QQby4j2jryqyqBHvLP7ctv2SaANgh4sCb69BUpA` | signer | Signs the Mayhem program's `sell` trades on mayhem coins (the agent's operator) | [tx] |
| `333UA891CYPpAJAthphPT3hg1EkUBLhNFoP9HoWW3nug` | program, **immutable** (no upgrade authority) | `transfer_hook_authority`, an empty Anchor program; see [transfer-hook-authority.md](transfer-hook-authority.md) | [chain] [docs github.com/pump-fun/transfer-hook-authority] |
| `pUmPFn9WvfaN2WTVGnCEtJTd2ATTpvpsKRz6jVzu6u4` | program, **closed** (ProgramData gone) | Earlier `pump_agent_payments` address still embedded in the web bundle | [chain] [bundle] |
| 16 `pfn…` addresses (e.g. `pfnTcJ1i4mRYzbqGduF71RsooUCFkPSpk8UE7drCkjh`) | system accounts | Tip destinations the web app pays when it sends through Nozomi (Temporal) | [bundle] [chain] |
