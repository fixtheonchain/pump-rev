# Third-party services around pump.fun (not pump.fun's own)

Kept apart from pump.fun's services. The first five read pump.fun's programs or API on their own and do not appear
in the web app's traffic. The last three are vendors the app uses, and a launchpad whose coins the app lists.

| Service | What it offers | Relation to pump.fun | Source |
| --- | --- | --- | --- |
| PumpPortal (`pumpportal.fun`) | `POST /api/trade-local` builds a pump.fun trade for you to sign; `wss://pumpportal.fun/api/data` streams new coins and trades (`subscribeNewToken` and similar) | Independent: its own README calls it a "3rd-Party (unofficial) API for Pump.fun" | [docs PumpPortal README via github.com/thetateman/Pump-Fun-API; quicknode.com builders guide] |
| Bitquery | GraphQL queries and subscriptions (WebSocket, `streaming.bitquery.io/graphql`) for pump.fun trades, OHLC, market cap and new coins (`TokenSupplyUpdates`, `Trading.Pairs`); API token required | Independent indexer | [docs docs.bitquery.io/docs/blockchain/Solana/Pumpfun/, github.com/bitquery/Pump-Fun-API] |
| Solana Tracker (`rpc.solanatracker.io/public`, data API) | Public RPC and a data API; pump.fun's own skills name its RPC as an option for sending | Independent; recommended in pump.fun's skills | [docs pump-fun-skills `swap/SKILL.md`] |
| Jupiter (`lite-api.jup.ag`) | Routes pump.fun curves and pools | Independent aggregator; pump.fun's buyback wallet swaps through it | [tx] |
| Trading bots and launchers (j7tracker.io and others) | Create coins through Pump with their own metadata hosts (the Robotaxi mint's `uri` is on `metadata.j7tracker.io`) and route trades with their own fee | Independent; seen on chain | [chain] [tx] |
| Helius | `getPriorityFeeEstimate` method shape used by pump.fun's code; Terminal's RPC | Vendor | [bundle] [capture] |
| Nozomi (Temporal), Jito | Transaction landing used by the web app | Vendors | [bundle] |
| Pons (`ponsv2` launchpad on Robinhood Chain, `eip155:4663`) | EVM coins shown inside pump.fun's multichain feed (`protocol: "pons"`) | Listed in pump.fun's feed; the record names `launchpad: "ponsv2"` and its own program `0x8366a39c…` | [capture] |

Facts here come from those services' own pages, found by search on 2026-10-28. None of the services was called.
