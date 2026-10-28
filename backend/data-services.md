# Data services: swap-api, advanced-indexer, advanced-api-v2, profile-api

Four hosts that serve indexed market and wallet data next to `frontend-api-v3`. All sit behind Cloudflare
(AAAA `2606:4700:4405::6812:2216`), and a direct `curl` gets a managed challenge (403) [dns] [headers]. The web app
reads them from its host table: `V = new URL("v1", "https://swap-api.pump.fun")`,
`U = "https://advanced-indexer.pump.fun"`, `b = "https://advanced-api-v2.pump.fun"`, and `profileApiUrl` from the page
config [bundle] [config]. None of them builds transactions.

## swap-api.pump.fun (`/v1`): per-coin trade statistics

| Method | Path | Purpose | Auth | Response shape |
| --- | --- | --- | --- | --- |
| GET | `/v1/coins/{mint}/market-activity?program=pump&chainId={caip2}` | Trades, volume, buyers and sellers, price change per window | none | `{"5m"\|"1h"\|"6h"\|"24h": {numTxs, volumeUSD, numUsers, numBuys, numSells, buyVolumeUSD, sellVolumeUSD, numBuyers, numSellers, priceChangePercent}}` |
| POST | `/v1/coins/market-activity/batch` | The same for many mints (feed cards) | none | body `{addresses:[…], …}` → `{<mint>: {5m, 1h, 6h, 24h}}` (201) |
| GET | `/v1/coins/{mint}/ath?currency=USD&program&chainId` | All-time-high market cap | none | `{athMarketCap}` |
| GET | `/v1/coins/{mint}/trades/batch` | Recent trades for a coin (feed and chart) | none | trades (seen in resource timing, body not captured) |
| GET | `/v1/coins/{mint}/first-trade`, `/v1/coins/{mint}/mayhem-stats` | First trade; mayhem statistics | none | path templates in the bundle, not called during the capture |

[capture] [bundle]. The client tracks this host's health as a "family" named `swap-api` and opens a circuit after
repeated failures in 30 s [bundle].

## advanced-indexer.pump.fun: boards and the in-memory coin index

| Method | Path | Purpose | Auth | Response shape |
| --- | --- | --- | --- | --- |
| GET | `/boards/trending?tier=web&surface=TRENDING&platform=WEB&limit=150&session_id&device_id` | The "movers" board: ranked coins with compact stats | none | `{board:"movers", version, serverTs, rid, entries:[{m mint, c chain, n name, t ticker, i image, mc, v, vUsd, p curve %, v5, v15, v1h, v24h, tx5, age, kol, sn snipers, mh mayhem, pg program, lp launchpad, gd graduated-at, ath, bc buys, sc sells, txc, nh holders, t10 top-10 %, dh dev %, tw/ws/tg socials, cb cashback, hr holder rewards, dw dev wallet, lv live, pa paired asset, desc, tf, tfUsd}]}` |
| GET | `/in-memory-coin/{mint}` | One coin from the in-memory index | none | `{mint, chain:"solana:mainnet", name, ticker, dev, program, platform, creationTime, quoteMint, pair, marketCapUsd, volumeSol, volumeUsd, progress, graduationDate, athMarketCapUsd, sniperCount, numKolsTraded, txCount, buyCount, sellCount, priorityFeeSol, builderTipSolV2, tradingAppFeeSolV2, txFeeSolV2, feeSeedSol, isMayhemMode, mayhemState, isMultiplayer, …}` |
| WS | `/ws/trenches?subscription={"board","tier":"web","filterKey"}` | Live board updates. After open the client sends `{"event":"subscribe","data":{board, tier:"web", limit, window, …}}` | none | board entries (not observed: the socket did not open during the signed-out capture) |

[capture] [bundle]. A feature-flag note in the bundle names the deployment "advanced-indexer-aws" with a
`movers.followed_holders` field (`fh`) on Trending rows [bundle]. The per-coin cost fields split what traders paid
outside pump.fun's programs: priority fees, builder tips, and trading-app fees, which are the bots' and terminals'
own fees [capture]. `advanced-api-v2.pump.fun` is in the same host table. No call to it was captured; the NATS cluster
`ADVANCED` pairs with it [bundle] [config].

## profile-api.pump.fun: balances and PnL per wallet

| Method | Path | Purpose | Auth | Response shape |
| --- | --- | --- | --- | --- |
| GET | `/balance/summary/{wallet}?multi_chain=true` | Wallet value | none | `{success, data:{total_value, native_balance, native_lamports, wrapped_sol_balance, sol_price, token_count, dust_count, dust_value_usd, hidden_count, hidden_value_usd, last_update_ts, portfolioPnL}}` |
| GET | `/balance/tokens/{wallet}?page&size[&chain=all]` | Token balances with prices and PnL | none | `{success, data:{tokens:[{token_mint, token_name, token_symbol, token_image, program, token_price, priceSol, decimals, balance, value, chain, network_id, tokenPnL, dust_floor_filtered}]}, pagination}` |
| POST | `/wallet-overview` | Value and first-transaction time for several wallets | none | body `{wallets:[…]}` → `{wallets:{<w>:{total_value_usd, sol_price_usd, native_balance_sol, unavailable_chains, truncated, first_tx_timestamp}}}` |
| POST | `/pnl/coin/{mint}/holders` | PnL of listed holders in one coin | none | body `{holders:[…]}` → `{success, data:[{wallet, unrealized:{cost_basis, pnl, percentage, amount_held}, realized, total_buy_spend, total_buy_amount, last_slot_index_id, has_transfers, fee:{sol, usd}, fee_detail:{base, priority, tip, ui, ata_rent, protocol, cashback}}], errors}` (201) |
| GET | `/v2/pnl/batch/{…}?version=v2`, `/v3/pnl/token/{wallet}/{mint}`, `/v4/pnl/{wallet}/trades?…` | Versioned PnL reads | — | path templates in the bundle, not called during the capture |

[capture] [bundle]. `fee_detail.ui` is the app's own fee: 0.0675 SOL on a 15 SOL buy, i.e. 0.45% [capture]. pump.fun's
skills document the same `balance/summary` and `balance/tokens` endpoints [docs pump-fun-skills `swap/SKILL.md`].
frontend-api-v3 says its `/user-activity/{id}` is "proxied from profile-service" [contract].

## Indexer identifiers worth knowing

- `slotIndexId` / `last_slot_index_id`, e.g. `00046236105100035000030204`: a fixed-width, sortable trade position.
  Its leading digits read as a slot near the chain's height at the time (462,361,051), and the rest as transaction and
  instruction indexes [capture] [inferred].
- `networkId 1399811149` for Solana and `chain "solana:mainnet"` in the indexer versus CAIP-2
  `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` in paths [capture].
