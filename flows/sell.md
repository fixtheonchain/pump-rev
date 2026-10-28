# Flow: sell

The same path as [buy.md](buy.md), mirrored. What differs is listed here.

```mermaid
sequenceDiagram
    autonumber
    actor U as Trader
    participant W as pump.fun web
    participant BUILD as /api/blockchain (swap-build)
    participant TX as Nozomi / Jito
    participant R as Pump App router
    participant P as Pump (curve) / PumpSwap (pool)
    participant IDX as Indexers
    participant PROF as profile-api

    W->>PROF: GET /balance/tokens/{wallet} (amount held, PnL)
    U->>W: amount or % of holdings
    W->>BUILD: POST /transactions/swap-build (sell)
    BUILD-->>W: v0 tx
    U->>W: wallet signs
    W->>TX: send
    TX->>R: bonding_curve_v3 / pump_swap_v3 (or sell_*_percentage)
    R->>P: sell (CPI)
    P->>P: tokens in, quote out, fees taken from the proceeds
    R->>R: 0.45% app fee from the proceeds
    P-->>IDX: TradeEvent / SellEvent
    IDX-->>W: realized PnL, positions, leaderboard
```

| Point | Detail | Source |
| --- | --- | --- |
| Percentage sells | The router has `sell_bonding_curve_percentage` and `sell_pump_swap_percentage`, so "sell 50%" resolves on chain against the live balance | [sdk-bin] |
| Curve sell (v3) | Protocol (0.95%) and creator (0.30%) fees come out of the SOL proceeds and stay on the curve until swept; buyback half paid in the trade | [tx `47iBM7BC…` in `../onchain/fees.md`] [docs `TRADE_V3.md`] |
| Pool sell | A sell paying out more than the quote vault really holds fails with `InsufficientRealQuoteReserves` (boost and negative virtual reserves make the priced reserve differ from the real one) | [sdk `math/amm.rs`] |
| Completed curve | After the crossing buy and before `migrate_v2`, every curve trade fails with `BondingCurveComplete` | [docs] |
| After | `profile-api` `realized` PnL, `frontend-api-v3 /user-portfolio/{wallet}` (`isExited`), `/portfolio-summary` | [capture] |
| Holders' view | Holder lists tag the dev, snipers, bundlers and the LP (`/coins/holder-stats/{mint}`: "top-10 / dev / sniper / bundler share") | [contract] |
