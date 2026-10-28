# Flow: buy

Covers both venues. Until graduation a buy hits the bonding curve; after it, the coin's canonical PumpSwap pool.
The web app sends app trades through the Pump App router, which charges the 0.45% platform fee [tx] [capture].

```mermaid
sequenceDiagram
    autonumber
    actor U as Trader (browser + wallet)
    participant W as pump.fun web
    participant BUILD as /api/blockchain (swap-build) or in-browser SDK
    participant RPC as solana-mainnet.pump.fun
    participant TX as Nozomi / Jito
    participant R as Pump App router
    participant P as Pump (curve) / PumpSwap (pool)
    participant F as Pump Fees (FeeConfig)
    participant IDX as Indexers
    participant N as NATS + RPC PubSub

    W->>RPC: accountSubscribe(curve or pool, mint) at processed
    W->>IDX: GET market-activity, candles, trades, holders
    U->>W: amount in SOL / USDC
    W->>BUILD: POST /transactions/swap-build {user, mint, amount, slippage, …}
    BUILD-->>W: serialized v0 tx (compute budget, ATA, router ix, tip)
    U->>W: wallet signs
    W->>TX: sendTransaction (Nozomi regions, or /api/jito)
    TX->>R: router: bonding_curve_v3 or pump_swap_v3
    R->>P: buy (CPI)
    Note over P,F: fee tier from FeeConfig (v3 reads it, v1/v2 call get_fees)
    P->>P: reserves move, buyback half of the protocol fee to a buyback vault, protocol + creator fee kept in the curve or pool
    R->>R: 0.45% app fee (0.40% with a referral) to pump.fun
    P-->>N: account change → price on open pages
    P-->>IDX: TradeEvent / BuyEvent
    IDX-->>W: market-activity, PnL (profile-api), leaderboard, positions
```

| Step | Detail | Source |
| --- | --- | --- |
| Prices before the trade | `swap-api /v1/coins/{mint}/market-activity`, `frontend-api-v3 /candles/{caip2}/{mint}`, curve or pool account through `accountSubscribe` (base64, `processed`) | [capture] |
| Build | `POST pump.fun/api/blockchain/transactions/swap-build` (`has_support_for_sending_options: true`, retries, `insufficient_funds`). The agents API `POST fun-block.pump.fun/agents/swap` picks curve or pool on the server and returns a transaction | [bundle] [docs pump-fun-skills] |
| Fees in the transaction | Priority fee from `getPriorityFeeEstimate` (floor 100,000 µlamports), compute limit from simulation, tip to a `pfn…` (Nozomi) or Jito account | [bundle] |
| Router | `bonding_curve_v3` → Pump (+ Pump Fees, Token-2022); `pump_swap_v3` → PumpSwap (+ Pump Fees, SPL Token, Token-2022) | [tx 2026-10-28] |
| Curve buy (v3) | 1.25% on top: 0.475% to a buyback vault in the trade, 0.475% protocol and 0.30% creator kept on the curve until swept | [chain] [tx] → [../onchain/fees.md](../onchain/fees.md) |
| Pool buy (v2) | Market-cap tier from `FeeConfig`: 1.25% below 420 SOL down to 0.30%; buyback half paid in the trade; protocol and creator fee kept in the pool | [chain] |
| App fee | `blockchain-swap /referrals/fee-rates`: 45 bps, 40 with a referral, 5 / 4 bps on 16 listed quote assets; shown back as `fee_detail.ui` | [capture] |
| Crossing buy | A v3 buy that empties the curve continues into the future pool's reserves (synthetic migration). See [graduate.md](graduate.md) | [docs `SYNTHETIC_MIGRATION.md`] |
| After | `profile-api /pnl/coin/{mint}/holders` (cost basis, fees split into base, priority, tip, ui, ata_rent, protocol), `frontend-api-v3 /mint-positions`, `/pnl-leaderboard`, NATS `positions.<wallet>` and `account_balance_change.<wallet>.*` for signed-in users | [capture] [contract] |

A buy sent straight to Pump or PumpSwap, as bots do, skips the router and its app fee [tx 2026-10-26, see
`../onchain/fees.md`]. Terminal sends `validate_nonce` + `route` through its own program [tx].
