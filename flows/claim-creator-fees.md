# Flow: claim creator fees

Since the October 2026 release, v3 curve trades and v2 pool trades keep the creator fee inside the curve or pool. A
claim therefore has two parts: sweep the fee out of each curve or pool, then pay it to the creator, or split it among
shareholders.

```mermaid
sequenceDiagram
    autonumber
    actor C as Creator (browser + wallet)
    participant W as pump.fun web
    participant API as frontend-api-v3
    participant FB as /api/blockchain (blockchain-api-service)
    participant TX as sender (Nozomi / Jito)
    participant P as Pump (curve)
    participant A as PumpSwap (pool)
    participant F as Pump Fees (sharing config)

    W->>API: GET /fees/creator/{wallet} (earnings, claimable, series)
    W->>API: GET /fees/creator/{wallet}/unswept (coins with fees still in the on-chain bucket)
    C->>W: Claim
    alt single creator
        W->>FB: build sweep_creator_fee (curve) + collect_creator_fee_v2, sweep_creator_fee (pool) + collect_coin_creator_fee
    else sharing config (up to 10 shareholders)
        W->>FB: build sweeps + transfer_creator_fees_to_pump_v2 + distribute_creator_fees_v2
    end
    Note over W,FB: POST transactions/creator-fees {wallet, mint} (vault: creator-fees/vault), bots use fun-block /agents/collect-fees
    C->>W: wallet signs
    W->>FB: POST transactions/send → signature
    FB->>TX: send
    TX->>P: sweep_creator_fee: BondingCurve.creator_fee → ["creator-vault", creator]
    TX->>A: sweep_creator_fee: Pool.creator_fees → ["creator_vault", coin_creator] ATA
    TX->>P: collect_creator_fee_v2 → creator wallet
    TX->>A: collect_coin_creator_fee → creator wallet
    TX->>F: (sharing) distribute by share_bps
    API-->>W: /fees/* and /user-activity show the claim
```

| Step | Detail | Source |
| --- | --- | --- |
| What is owed | `GET /fees/creator/{address}` ("fee earnings, claimable balance and series"), `GET /fees/creator/{address}/unswept` ("creator fees still in the on-chain bucket … what a claim must sweep"), `GET /fees/coin/{chainId}/{address}` (sharing config and fee events), `GET /fees/shareholder/{id}` | [contract] |
| Sweep | `sweep_creator_fee` on Pump and on PumpSwap, permissionless. pump.fun runs the protocol-fee sweep itself | [idl] [docs `SWEEP_FEES.md`] |
| Pay out, single creator | Curve side `collect_creator_fee_v2` (creator vault → wallet); pool side `collect_coin_creator_fee` | [idl] [docs `COLLECT_CREATOR_FEE.md`] |
| Pay out, sharing config | `transfer_creator_fees_to_pump_v2` (pool fees into the Pump creator vault), then permissionless `distribute_creator_fees_v2` by `share_bps`; `get_minimum_distributable_fee` checks the minimum | [idl] [docs `CREATOR_FEE_SHARING.md`] |
| GitHub-linked shareholders | Their share accrues in a `SocialFeePda`; `claim_social_fee_pda` is signed by pump.fun's `social_claim_authority` "only through Pump.fun (web or mobile)" | [idl] [docs] |
| Holder-rewards coins | The creator is the `["holder-rewards", mint]` PDA; pump.fun's `holder_reward_claim_authority` pays holders with `distribute_fee_to_holders(amounts)`; the book is at `GET /fees/holder-rewards` | [idl] [contract] |
| Builder (web app) | The Claim button calls `POST /api/blockchain/transactions/creator-fees {wallet, mint}`, which returns `{fees: {claim_transaction (base64 v0), is_claimable, transactions[]}}` with the sweeps prepended; `POST transactions/creator-fees/vault {wallet}` (no mint) returns a `collect_transaction` for the whole creator vault. The signed transaction goes back through `POST transactions/send {transaction, route, options, non_trade_tx}` → `{signature}`, and the app polls `getSignatureStatuses` every 2 s | [bundle 2026-10-28] |
| Builder (bots) | `POST fun-block.pump.fun/agents/collect-fees` builds the same claim for agents ("collect for direct creator, distribute for sharing config") and returns `{transaction, creator, isGraduated, usesSharingConfig}` | [docs pump-fun-skills `coin-fees/SKILL.md`] [sdk] |
| Terms | `GET/POST /creator-rewards-tos(/accept)`: the creator-rewards terms acceptance the app records | [contract] |
