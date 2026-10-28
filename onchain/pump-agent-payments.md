# Pump Agent Payments (pump_agent_payments)

`AgenTMiC2hvxGebTsgmsD4HHBa8WEcqGFf87iwRRxLo7`

Payments for "tokenized agents": pump coins tied to an agent that is paid in SOL or USDC. Each payment is split by
`buyback_bps`. One part is swapped into the agent's coin and burned, the other is withdrawable by the agent's
authority.

## Identity

| Field | Value | Source |
| --- | --- | --- |
| ProgramData | `H6H5jKFLoexLYnponVsKZV7eCEE279yNJWQ2gotN74Sd`, 715,605 bytes, 4.98 SOL rent | [chain] |
| Upgrade authority | `7gZufwwAo17y5kg8FMyJy2phgpvv9RSdzWtdXiWHjFr8` (3-of-4 Squads vault) | [chain] |
| Last deploy | slot 429,909,554, **2026-06-30 15:58:24 UTC** | [chain] |
| IDL | [`idl/pump_agent_payments.json`](../idl/pump_agent_payments.json), shipped in `pump-rust-client` 0.4.1 (crates.io), 14 instructions. None on chain | [sdk] [chain] |

pump.fun removed the "Tokenized Agent" launch option on 30 June 2026 [press: cryptopolitan.com "Pump.fun removes
agent mode…"], the same day as this program's last deploy.

## Accounts

| Account | Seeds | Live |
| --- | --- | --- |
| `GlobalConfig` | `["global-config"]` → `ALeLWphFxNVNXpXFEC4Ssf2Jan1Wki72Us8tXMMrQuQZ` | `protocol_authority` `FFWtr…`, `buyback_authority` `GmFrDZT2cdrqykgTikVdXbe8EtCgzUDM9VsDhQnwsUsG` (single keypair, 29.12 SOL), currencies WSOL and USDC, `tokenized_agent_sequence` **233,878** [chain] |
| `TokenAgentPayments` | `["token-agent-payments", mint]` | `{ mint, authority, buyback_bps }` |
| `TokenAgentPaymentInCurrency` | `["payment-in-currency", mint, currency_mint]` | Running totals: invoices paid, buyback, withdrawals, tokens bought back and burned |
| buyback / withdraw vaults | `["buyback-authority", mint]`, `["withdraw-authority", mint]` + their ATAs | Split destinations |

## Flow

1. `agent_initialize(authority, buyback_bps)`: registers a coin's agent (reads the Pump bonding curve).
2. `agent_accept_payment(amount, memo, start_time, end_time)`: a user pays an invoice in SOL or USDC.
3. `agent_distribute_payments`: splits the balance into the buyback vault (`buyback_bps`) and the withdraw vault.
4. `agent_buyback_trigger(swap_instruction_data)`: signed by the global `buyback_authority`. Swaps the buyback vault
   into the agent's coin and burns it (`AgentBuybackTriggerEvent.amount_burned`).
5. `agent_withdraw`: the agent's authority takes the withdraw vault.

Admin: `global_config_initialize`, `global_update_authorities`, `global_add_new_currency`, `global_remove_currency`,
`agent_update_authority`, `agent_update_buyback_bps`.

## Re-verified 2026-10-28

Read again at slot 462,377,442 (2026-10-28 06:37 UTC) by `scripts/read-live.mjs` [chain]. Upgrade authority and last deploy (slot 429,909,554) are unchanged.
`tokenized_agent_sequence` and the rest of `GlobalConfig` read the same [chain].

- **A second, closed deployment.** The pump.fun web bundle still embeds a `pump_agent_payments` IDL at address
  `pUmPFn9WvfaN2WTVGnCEtJTd2ATTpvpsKRz6jVzu6u4` [bundle]. That program account exists, but its ProgramData
  `HDnL1LxH9PNHLMQYMwY4i8yqipGahs5ELTnRZ6JiuNPP` does not: the program has been closed [chain]. `@pump-fun/agent-payments-sdk`
  3.0.3 (2026-03-24) and `pump-rust-client` 0.5.0 both use `AgenTMiC…` [sdk].
- **Off chain.** The `pump-fun-skills` repo's tokenized-agents skill verifies an invoice by deriving the invoice PDA
  (`["invoice-id", …]` from mint, currency, amount, memo, start, end) and querying "the Pump HTTP API" with
  `invoice-id` and `mint` [docs github.com/pump-fun/pump-fun-skills `tokenized-agents/SKILL.md`].

## Full instruction reference

Generated from [`idl/pump_agent_payments.json`](../idl/pump_agent_payments.json) by `node scripts/idl-tables.mjs pump_agent_payments`.

| Instruction | Arguments | Signers | IDL doc |
| --- | --- | --- | --- |
| `agent_accept_payment` | amount: u64, memo: u64, start_time: i64, end_time: i64 | `user` |  |
| `agent_buyback_trigger` | swap_instruction_data: bytes | `global_buyback_authority` |  |
| `agent_distribute_payments` | — | `user` |  |
| `agent_initialize` | _authority: pubkey, _buyback_bps: u16 | `authority` |  |
| `agent_transfer_extra_lamports` | — | — |  |
| `agent_update_authority` | new_authority: pubkey | `authority` |  |
| `agent_update_buyback_bps` | buyback_bps: u16 | `authority` |  |
| `agent_withdraw` | — | `authority` |  |
| `close_account` | — | `user` |  |
| `extend_account` | — | `user` |  |
| `global_add_new_currency` | — | `authority` |  |
| `global_config_initialize` | protocol_authority: pubkey, buyback_authority: pubkey | `authority` |  |
| `global_remove_currency` | index: u8 | `authority` |  |
| `global_update_authorities` | protocol_authority: Option<pubkey>, buyback_authority: Option<pubkey> | `authority` |  |
