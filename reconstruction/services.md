# Services

Each service as the evidence names it. "Owns" lists the data and decisions it is the source of truth for. Columns
marked [inferred] are the reasoned part.

## App-facing layer

| Service | Owns / does | Interface | Evidence | Storage and runtime [inferred] |
| --- | --- | --- | --- | --- |
| **client-server** (`frontend-api-v3.pump.fun`) | Sessions (JWT in `auth_token` cookie or bearer), the route contract, per-user rate buckets ("BFF bucket callout-media-upload 10/min"), flag gates, fan-out to domain services with `degraded_lanes`, response caching ("a JWT caller gets no-store"), Intercom HMAC, NATS token minting, moderation and internal routes | HTTPS JSON + multipart, 330 routes | [contract] [capture] | NestJS on AWS behind Cloudflare; Redis for buckets and short caches; no domain tables of its own beyond sessions, ToS acceptances and admin roles |
| **keyed API** (`api.pump.fun`) | `pf_live_` key verification, scope checks, per-key burst bucket and UTC daily limit, region gate; serves the 68 `publicRead` routes | same contract, key auth only | [contract] [dns] | The same codebase deployed with a different auth guard; key "verdicts" cached in Redis and tombstoned on change |
| **uapi stream** (`wss://frontend-api-v3.pump.fun/stream`) | Live coin, wallet and list topics: up to 64 topics, 32 subscriptions per request, queue 256 frames, 15 s staleness watchdog, snapshot then live frames, corrections | WebSocket, binary protobuf `pumpfun.trading.v1` (`WatchRequest`, `Frame`) | [bundle] | A gateway that relays TradeApi streams; resumes by ordinal |
| **web proxies** (`pump.fun/api/*`) | Same-origin doors for the browser: `/api/blockchain`, `/api/blockchain-limit`, `/api/jito`, `/api/hermes`, `/api/relay/rpc/*`, `/api/i18n`, `/api/server-time` | HTTPS | [capture] [bundle] | Next.js route handlers on Vercel forwarding with server-held keys (`x-internal-api-key`) |

## Domain services

| Service | Owns / does | Evidence | Storage and runtime [inferred] |
| --- | --- | --- | --- |
| **coin-communities (`cc`)** | User registry ("cc user id", signup "mint budget"), profiles, usernames, X and EVM links, follows, mutes, blocks, callouts, posts, replies, reposts, likes, DMs, squads, competitions and their boards, PnL boards, streaks, achievements, payouts (callout rewards, referral commissions), referral edges, wallet labels, the packs catalog and holdings, perps account probes, reports, spam and media screening | Error registry: every social and squad refusal is "cc …"; `cc` publishes alerts only for viewers with presence | gRPC service; Postgres for the graph and content; Redis for presence, throttles and cached boards (top-500 board ≤ 60 s old); publishes to NATS CORE; reads prices from Codex and the coin registry |
| **TradeApi** | Trading data: coin lists and boards (`list_coins`), holders (`GetHolders`), fees (`get_fees`), perps open orders (`GetOpenOrders`), wallet perp history, candles; the `pumpfun.trading.v1` streams | Contract lanes and summaries; stream protocol | gRPC + streaming; fed by chain ingest; a columnar store for trades and candles, in-memory state for live coins |
| **coin-service / coin registry** | Coin records across chains (`coins-v2`, `coins-v3`, `coinsGrpc`), canonical images, security verdicts, mayhem state | `coinsGrpc` routes; "a member without a coin-service body is dropped"; "the coin registry cannot hydrate" | gRPC; Postgres per coin plus a cache; the source for coin cards everywhere |
| **coin-details-api** | Per-chain coin details; must admit a new chain before it trades | Chain registry notes | Service named only in notes |
| **profile-service** (`profile-api.pump.fun`) | Balances, multichain wallet overview, per-holder PnL with fee breakdown (base, priority, tip, ui, ata_rent, protocol, cashback), user activity (creates, fee claims) | [capture] `{success, data}` envelope, POST → 201 | NestJS; derived from ingest (cost basis per wallet and mint) |
| **advanced-indexer**, **swap-api**, **advanced-api-v2** | Boards (`boards/trending`, `/ws/trenches`), in-memory coin snapshots with sniper, KOL, fee and mayhem fields; market activity windows (5m–24h), ATH, trade batches | [capture] | Older data services the trading UI still reads; in-memory per-coin state ("in-memory-coin") |
| **livestream-service** (`livestream-api.pump.fun`) | Streams per coin (LiveKit room = mint), approved creators, history, clips (HLS variants low/mid/high, mp4, S3 keys, deletion lifecycle), playlist map, room moderation, X connection, **Go.fun bounties** (tasks, escrow, submissions, moderation, reconcile jobs) | [capture] [bundle] [contract] | LiveKit Cloud for media; egress to S3/CloudFront (`clips.pump.fun`); Postgres for streams, clips and bounties |
| **livechat** (`livechat.pump.fun`) | Stream chat over WebSocket, REST on the same host | [config] | WebSocket fan-out service |
| **hermes** | Notifications: device tokens (web push via Firebase, mobile push), delivery confirmations, in-app toasts | [bundle] | Queue consumer of `cc` and TradeApi events |
| **compliance-service** | Wallet screening (Solana, EVM, NEAR) | `/check/{address}` summary | Vendor-backed screening list |
| **ranking service** | Home feed ranking and recommendations per surface, with experiments bucketed on session id and impressions joined on device id | `/coins/recommendations` summary | Model service with a deadline per surface and a kill switch |
| **file-service** | Uploads: Pinata presigned URLs for coin metadata, images, S3 video URLs | Chain-registry note; `/ipfs/*`, `/videos/get-signed-url` | Presigner over Pinata and S3 |
| **auth-callout worker** | NATS auth callout: scopes each per-user JWT to its subjects | `/nats/token` summary | NATS 2.10 auth-callout service, ed25519 nkeys |

## Transaction services

| Service | Owns / does | Evidence | Runtime [inferred] |
| --- | --- | --- | --- |
| **blockchain-api-service** (`/api/blockchain`) | Builds every server-built transaction (swap, creator-fee claims, vault collects, perps, Collector Crypt packs and market, Relay buys) and sends signed ones (`transactions/send`) | Bundle endpoint map; "Network error calling blockchain-api-service" | Holds RPC, simulation, ALTs, priority-fee estimation; knows each program's IDL |
| **blockchain-limit** (`/api/blockchain-limit`) | Limit-order eligibility, presigned durable-nonce swaps, cancel, EVM limit orders through a factory and bridge | [bundle] | A store of presigned transactions plus a trigger keeper |
| **blockchain-swap** (`blockchain-swap.pump.fun`) | Platform and referral fee rates, the quote-asset list for creation | [capture] | Config service |
| **fun-block** (`fun-block.pump.fun`) | The agents API: create-coin, swap, collect-fees, sharing-config | [docs pump-fun-skills] | Server builders for bots |
| **intents** (`intents.pump.fun`) | Bridge quotes, execution and status on Relay | [bundle] | Relay client with gas subsidy |
| **eep-core** | Holds per-chain quote sets (`INK_QUOTES`) | Chain-registry note | Execution core shared by builders [inferred] |
| **rpc-proxy-worker** | Pump-branded RPC hosts (`solana-mainnet.pump.fun`, `ink-mainnet.pump.fun`, `arc-mainnet.pump.fun`) over upstream providers (Alchemy for Ink and Arc) | Chain-registry note; Cloudflare IPs | A Cloudflare Worker holding provider keys in path-scoped URLs |

## Edge, sending and vendors

| Piece | Role | Evidence |
| --- | --- | --- |
| Cloudflare | Bot challenge on every API host, RUM, the web origin and RPC hosts | [headers] [dns] |
| Vercel | Next.js App Router web (RSC renders data pages like `/pump-token` and `/live` on the server) | [headers] [capture] |
| Nozomi (Temporal) ×7, Jito via `/api/jito` | Transaction landing with tips | [bundle] |
| Privy | Auth, embedded Solana and EVM wallets (TEE), key import/export, MFA, onramps | [bundle] [site-docs] |
| LiveKit | Live video rooms | [bundle] |
| Relay | Bridging and cross-chain buys, Hyperliquid deposits and withdrawals | [bundle] |
| Hyperliquid | Perps venue with pump.fun's builder code | [bundle] [site-docs] |
| Codex | Multichain market data and network ids | [contract] |
| Collector Crypt, Phygitals, Tensor | Card packs, card NFTs, listings | [contract] [bundle] |
| Donate.gg | Charity routing of creator fees | [site-docs charitycoins] |
| LaunchDarkly, Datadog RUM and logs, AppsFlyer, Intercom, Strapi, Google Analytics | Flags, telemetry, attribution and deep links, support, CMS, analytics | [capture] [bundle] |
