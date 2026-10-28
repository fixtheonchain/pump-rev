# Flow: graduate to PumpSwap

```mermaid
sequenceDiagram
    autonumber
    actor B as Last buyer
    participant P as Pump (curve)
    participant K as Migration sender (permissionless)
    participant A as PumpSwap
    participant BV as Boost vault / boost authority
    participant IDX as Indexers + API
    participant W as pump.fun web

    B->>P: buy_v3 / buy_exact_quote_in_v3 takes the last real token
    P->>P: complete = true, CompleteEvent
    P->>P: synthetic migration: the same buy continues into the pool-to-be (PostCompleteBuyEvent)
    Note over P: every further curve trade fails with BondingCurveComplete
    K->>P: migrate_v2 (any signer)
    P->>A: create_pool(index 0, creator = PDA["pool-authority", mint]) via CPI
    P->>A: deposit 206.9M tokens + raised quote − 0.015 SOL migration fee
    Note over P: fee remainder after rent → withdraw_authority 39azUY… (pump.fun's migration wallet)
    P->>BV: boost PDAs passed as remaining accounts, ~17.6 SOL set aside on SOL pairs
    A-->>IDX: CreatePoolEvent, CompletePumpAmmMigrationEvent
    BV->>A: boost_buy_and_burn over the next ~5 min (tokens bought are burned)
    IDX-->>W: coin record: complete, pump_swap_pool, pool_address, graduationDate (gd), boost_mode
    W->>W: coin page switches to the pool account and the pool fee tiers
```

| Step | Detail | Source |
| --- | --- | --- |
| Completion point | Curve from `Global`: 793.1 M tokens for sale, about 85.005 SOL raised net of fees, market cap ≈ 410.9 SOL at completion | [chain] → [../onchain/lifecycle.md](../onchain/lifecycle.md) |
| Synthetic migration | A v3 crossing buy has no maximum: it takes what is left, sets `complete`, then buys from the tokens and quote the migration will deposit, priced by PumpSwap's formula. It is recorded as `post_complete_base_out` / `post_complete_quote_in`. Mayhem curves are excluded | [docs `SYNTHETIC_MIGRATION.md`] |
| Who migrates | `migrate_v2` is permissionless. The live migration of 2026-10-26 was sent by `9C4nRvhhVquCKATjDCx5FKvNS9PNgNqgyWy9AcoDjYv5` | [idl] [tx `3APwkHCt…`] |
| Pool | Canonical pool `["pool", 0u16, pool_authority, base_mint, quote_mint]`. LP tokens are minted to the pool-authority's account (the docs call them burnt) | [idl] [docs] |
| Fee | `pool_migration_fee` 15,000,001 lamports: rent for the new accounts, the rest to `39azUYFW…` (8,822,721 lamports in that transaction) | [chain] [tx] |
| Boost | On by default since 2026-07-21: about 20% of migration liquidity (17.6 SOL on SOL pairs) spent by `boost_authority` `HTVZVEQM…` on TWAP buys that are burned. The pool keeps pricing as if that SOL were still in the vault | [chain] [press: The Block 2026-07-29] [sdk] |
| After | Pool trades use market-cap tiers (1.25% → 0.30%); creator fees continue in the pool; the indexer records `gd` / `graduationDate` and `pump_swap_pool` | [chain] [capture] |
