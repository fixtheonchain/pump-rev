# Realtime: NATS, Solana PubSub, board sockets, livechat

The web app uses five kinds of push channel. Server config and code paths come from the page HTML and the bundle;
the Solana PubSub socket was observed sending subscriptions. The NATS sockets did not send a frame while the browser
sat signed out behind the unanswered terms dialog, so their subjects are taken from the contract and code, not from
traffic.

## uapi stream on the BFF (protobuf)

`wss://frontend-api-v3.pump.fun/stream` (`NEXT_PUBLIC_UAPI_STREAM_URL`) carries binary protobuf frames of the
`pumpfun.trading.v1` protocol: the client sends `WatchRequest`s for `coin`, `wallet` and `list` topics and receives
`Frame`s of kind `SNAPSHOT`, `LIVE` or `CORRECTION`, each with an ordinal (`blockId:txIndex:eventIndex`). A coin topic
selects parts (`MARKET`, `PHASE`, `META`, `POSITION`, `HOLDERS`, `MARKS`, `CANDLES` per resolution and measure) and a
commitment (`PROCESSED` or `CONFIRMED`). Client limits: 64 topics, 32 subscriptions per request, a 256-frame queue per
topic, a 15 s stale watchdog, 1 s → 30 s reconnect backoff. Header, tape, chart, lists, holders and boards moved onto
it behind six flags created 2026-09-30 [bundle]. Details: [../reconstruction/data-pipeline.md](../reconstruction/data-pipeline.md).

## NATS (pump.fun's own clusters)

The page HTML carries a `configs` object for four clusters [config, `../data/capture-log.md`]:

| Instance | Server | DNS | Opened on load |
| --- | --- | --- | --- |
| `UNIFIED` | `wss://unified-prod.nats.realtime.pump.fun` | CNAME to an AWS ELB in us-east-1 (`rootam-natsa-…elb.amazonaws.com`) | yes |
| `CORE` | `wss://prod-v2.nats.realtime.pump.fun` | AWS ELB us-east-1 (`prod-n-natsa-…`) | yes |
| `ADVANCED` | `wss://prod-advanced.nats.realtime.pump.fun` | AWS ELB us-east-1 (`prod-a-natsa-…`) | no |
| `MULTICHAIN` | `wss://multichain-prod.nats.realtime.pump.fun` | AWS ELB us-east-1 (`rootam-natsa-…`) | no; used for EVM trades and market caps |

Every instance shares the settings `timeout 5000`, `waitOnFirstConnect`, `reconnect` with no attempt limit,
`reconnectTimeWait 1000`, `pingInterval 5000`, `maxPingOut 2`. The user is `subscriber`, and its password ships in the
HTML to every visitor (not copied here) [config]. Unlike the APIs, the NATS hosts are not behind Cloudflare [dns].

**Per-user access.** `POST frontend-api-v3/nats/token` mints "a 1h bearer user JWT for the CORE NATS cluster
(SEC-1908 per-user auth)". An auth-callout worker scopes it to `dm.user.<uid>`, `followingFeed.user.<uid>`,
`alertsFeed.user.<uid>.*`, `positions.<wallet>` and `account_balance_change.<wallet>.*` for the session wallet and the
linked EVM wallet, plus the public subject families. Clients present it as the CONNECT `auth_token` and re-mint at
50 min. When the flag is off the route answers 404 `NATS_AUTH_DISABLED`, and clients keep the static subscriber
credentials [contract]. The bundle builds `account_balance_change.{wallet}.{…}` subjects [bundle].

**What rides on it** [bundle]: the chart's live ticks (the chart component takes a `natsInstance` and logs
`natsConnected` / `sawLiveTick` when the stream stalls); EVM trades (`useMultichainTradeEventSubscription`) and EVM
market caps for lists (`useRealtimeEvmCoinMarketDataBatch`), on subjects `<prefix>.<chain>.<mint>`; DM signals
(`DmRealtimeSignalSubscriber`, delivery modes `REALTIME_NATS`, `INBOX_POLL`, `FOREGROUND_REFETCH`, `SEND_ECHO`); and
the alerts feed. `POST /following-positions/alerts/presence` "returns the subscription contract: the exact NATS
subject to consume" [contract].

## Solana PubSub on pump.fun's RPC

`wss://solana-mainnet.pump.fun/2ba533b3-1d80-4fa8-8879-404ea05e068f` (same Cloudflare front as pump.fun) [bundle] [dns].
Observed on a coin page [capture]:

```json
{"jsonrpc":"2.0","method":"accountSubscribe","params":["<bonding curve>",{"encoding":"base64","commitment":"processed"}],"id":1}
```

It subscribes at `processed` commitment to the bonding curve, the PumpSwap pool, the mint and three more accounts of
the coin; each reply is a subscription id. The price and progress bar update from these account changes, decoded in
the browser with the program IDLs [capture] [bundle].

## Board sockets on advanced-indexer

`wss://advanced-indexer.pump.fun/ws/trenches?subscription={"board":…,"tier":"web","filterKey":…}`, then
`{"event":"subscribe","data":{board, tier:"web", limit, window, …}}` [bundle]. These are the live columns of new,
graduating and graduated coins. No socket opened during the signed-out capture.

## Livechat

`livechatUrl: "wss://livechat.pump.fun"`. The client derives its REST base from the same host by swapping `ws(s)` for
`http(s)`, and sends `credentials: "include"` and an optional bearer [config] [bundle]. It carries livestream chat. See
[livestream.md](livestream.md).

## Third-party push the app also loads

LaunchDarkly streaming (`clientstream.launchdarkly.com/eval/…`) for feature flags [capture]. See
[web-and-edge.md](web-and-edge.md).
