# frontend-api-v3.pump.fun: the main application API

The web app calls it `clientServerUrl` [config]. It serves coins, search, charts, trades, users, social features
(callouts, follows, DMs, groups), fees and rewards views, uploads, auth, and the server side of coin creation.
Shared with the mobile app and Terminal (Terminal's bundle names this host too) [bundle].

| Signal | Value | Source |
| --- | --- | --- |
| Edge | Cloudflare (AAAA `2606:4700:4405::…` / `2a06:98c1:310a::…`); a plain `curl` gets a 403 managed challenge (`Server-Timing: chlray`) | [dns] [headers] |
| Browser access | Works from `pump.fun` (CORS allows the origin). pump.fun's own skills say the host "does not allow browser-origin requests" from other sites and must be proxied by a backend | [capture] [docs pump-fun-skills `create-coin/SKILL.md`] |
| Contract | A typed route contract ships in the web bundle: `defineRoutes` groups with 330 `"METHOD /path"` keys (68 of them public on the keyed host `api.pump.fun`), zod schemas, and a 106-code error registry | [bundle] → [`../data/frontend-api-v3-contract.md`](../data/frontend-api-v3-contract.md) |
| Upstreams named in summaries | `coinsGrpc` (enriched coins over gRPC), "TradeApi" (`GetHolders`, `GetOpenOrders`), "coin-communities", "profile-service", Redis counters, BigQuery, Strapi CMS, Privy, Intercom, the CORE NATS cluster | [contract] |
| Auth | `POST /auth/login/session` sets an `auth_token` cookie (a JWT; an inline script in the HTML reads its `address`, `userId`, `exp`); `POST /auth/login/token` returns the same as a bearer token. Calls use `credentials: "include"` | [contract] [html] [bundle] |
| Chain ids | CAIP-2 in paths (`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`, `eip155:1`, `eip155:8453`, `eip155:4663`); numeric `1399811149` for Solana in records (`networkId`, `chainId`) | [capture] |

## Endpoints observed (signed out, 2026-10-28)

Auth "none" means the call succeeded without a session. Shapes are abbreviated; full field lists are in
[`../data/capture-log.md`](../data/capture-log.md).

| Method | Path | Purpose | Auth | Response shape |
| --- | --- | --- | --- | --- |
| GET | `/home-feed?pageSize&chain=all&platform=WEB&session_id&device_id&session_start_timestamp_ms` | Home feed of coins with the position and callout of a followed or featured trader | none | `{coins:[{coinMint, coinName, coinImage, symbol, marketCap, protocol, program, chain, position:{userName, walletAddress, pnlUsd, …, callout:{thesis, calledOutAtMcap, multiple, likes, …}}}]}` |
| GET | `/coins-v3/{address}` | Resolve one coin (any chain) | none | coin record: `mint, name, symbol, description, image_uri, metadata_uri, bonding_curve, associated_bonding_curve, creator, created_timestamp, complete, pump_swap_pool, program, token_program, quote_mint, base_decimals, quote_decimals, pool_address, is_cashback_enabled, tokenized_agent, chain_id, multichain_family, protocol, market_cap_usd, canonical_pool_liquidity_usd, boost_mode, is_holder_reward, transfer_fee_bps, transfer_hook_program, depth, security_verdict{verdict, reasons, provider}, ath_market_cap, is_currently_live, nsfw, is_banned, …` |
| POST | `/coins-v2/mints` | Enriched coins for a list of mints (Solana and EVM) | none | `[coin record]` |
| GET | `/coins-v2/{mint}/mayhem-state` | Mayhem state of a coin | none | `null` or state object |
| GET | `/coins-v2/user-created-coins/{creator}?limit&offset` | Coins a wallet created | none | `{limit, offset, count, coins:[coin record]}` |
| GET | `/coins/search-unrestricted?quoteMints&sort=usd_market_cap&order&limit&offset` | Search without recency filter (here: coins quoted in a given coin) | none | `[coin record]` |
| GET | `/coins/search-quote-facets?quoteMints` | Facet counts per quote currency | none | `{quoteFacets:[{mint, coinCount}], otherCount}` |
| GET | `/coins/top-tokens/mints?withChains=true` | Mints shown as "top tokens", with their chains | none | `{mints:[631], chains:{<mint>:[caip2]}}` |
| GET | `/candles/{chainId}/{address}` | OHLCV bars, oldest first | none | bars |
| GET | `/global-params/{timestampMs}` | Curve parameters valid at a time | none | `{slot, signature, initial_virtual_token_reserves, initial_virtual_sol_reserves, initial_virtual_quote_reserves, initial_real_token_reserves, token_total_supply, fee_basis_points, timestamp}` |
| GET | `/token-holders/{mint}/count` | Unique holder count | none | `{mint, chain, networkId, holderCount}` |
| GET | `/mint-positions/{mint}?sortBy=TOP&pageSize` | Positions of pump users in a coin, with PnL and callouts | none | `{positions:[{userName, walletAddress, amountHeld, pnlUsd, pnlPercentage, costBasisUsd, callout}], totalCount, hasMore}` |
| GET | `/pnl-leaderboard?period=weekly&sort=combined&limit` | Weekly PnL leaderboard | none | `{entries:[{rank, walletAddress, pnlSol, pnlUsd, realizedPnlSol, unrealizedPnlSol, positionsCount, topPositions, username}], periodLabel, windowStartSec}` |
| GET | `/pnl-leaderboard/top-trader-trades/{mint}` | Leaderboard traders' trades in a coin (chart markers) | none | `{mint, traders:[…], trades:[{tx, isBuy, timestamp, amountUsd, baseAmount, priceUsd, walletAddress, slotIndexId, amountSol}], page}` |
| GET | `/sol-price` | SOL/USD | none | `{solPrice, asOfTimestamp, stale}` |
| GET | `/users/{wallet}` | Public profile by wallet | none | `{address, userId, username, profile_image, bio, followers, following, x_username, canonical_svm_wallet, canonical_evm_wallet, group_badges, is_banned, …}` |
| POST | `/users/batch` | Profiles for many wallets | none | `[profile]` |
| GET | `/users/{userId}/overview` | Profile page header | none | `{address, profile:{…}}` |
| GET | `/users/{wallet}/achievements`, `/achievements/catalog` | Badges and progress | none | `{achievements:[…], progress:[…]}` / `{catalogVersion, achievements:[46]}` |
| GET, POST | `/profiles/verified` | Verified accounts (GET: list; POST: which of these user ids are verified) | none | `[profile]` / `{<userId>: bool}` |
| GET | `/portfolio-summary?user&period&holdings=1`, `/portfolio-summary/chart?user&period` | Wallet PnL summary and equity curve | none | `{pnl, realizedPnl, unrealizedPnl, totalBuySpend, heldOpenValue, …}` / `{points:[{time, value}], …}` |
| GET | `/user-portfolio/{wallet}?filter=open&page&pageSize&sortBy=POSITION_SIZE` | Open positions | none | `{positions:[…]}` |
| GET | `/user-positions/{wallet}?mints&updatesLimit=0` | Positions in given mints | none | `{positions:[…]}` |

## The rest of the contract, by group

330 routes in total (259 in the first table, the rest in its second pass); the full tables are in
[`../data/frontend-api-v3-contract.md`](../data/frontend-api-v3-contract.md). Auth below is from the summaries
("authenticated", "owner only", "Admin:", "Internal:", a moderation permission) [contract].

| Group (routes) | What it covers | Auth per the contract |
| --- | --- | --- |
| `coins` (23), `coinsGrpc` (5), `holderStats`, `topHolders`, `tokenHolders`, `candles` (2), `trades` (2), `globalParams`, `solPrice` | Coin records, lists (`currently-live`, `mayhem-mode`, `great-coins`, `hot-coin`, `boards/{board}`, `recommendations`, `similar`, `perps` screener), search, holders, candles, trade tape, `create-v2`, `sign-create-tx` (deprecated), `add-banner`, `check-vanity-store` | Mostly public; `create-v2`, `add-banner` need a session; `coins/protected` admin |
| `vanityKeys` | `GET /vanity/random-mint-public-key`: hand out a vanity mint public key from a server pool | session (used by the create flow) |
| `ipfs` (3), `videos` | `POST /ipfs/token-metadata` (multipart image + JSON), `POST /ipfs/image`, `GET /ipfs/pinata-presigned`, `GET /videos/get-signed-url` | session |
| `auth` (11), `privyLink` (8), `walletMapping` (2), `walletScreening`, `xLink` (5), `natsAuth` | Login (session cookie or bearer), register, jurisdiction check, disabled features, admin roles; Privy embedded-wallet import and export (HPKE-sealed keys, TEE wallets); linking an EVM wallet by EIP-191 signature; blocklist screening; X account linking; per-user NATS JWT | session; admin for role changes |
| `callout` (13), `calloutTranslation`, `homeFeed`, `followingFeed`, `followingPositions` (3), `followedHolders` (4), `following` (14), `mutes` (3), `blocks` (3), `dms` (7), `groups` (10), `bookmarks` (10), `walletLabels` (3), `presence` (2) | The social layer: callouts (a trader's public call on a coin, with thesis, media, replies, reposts that require holding ≥ $1 of the token), follows, alerts feed, DMs (mutual follow), squads, bookmarks, private wallet labels | session for writes and private reads |
| `fees` (7), `referral` (3), `payouts`, `creatorRewardsTos` (2) | Fee-sharing configs and events per coin, a creator's earnings and unswept fees, referral-vault withdrawals, shareholder earnings, the holder-rewards book, the caller's platform-fee bypass, referral codes, USDC payouts | public reads by address; session for `me` |
| `pnlLeaderboard` (7), `competitions` (6), `achievements`, `users` (14), `userPortfolio` (5), `userActivity`, `replay`, `shareVideo` (6), `profiles` | Leaderboards and moderation of them, trading competitions (squads), streaks, trader stats, portfolio dust and spam marks, trade replays and server-rendered share videos | mixed; moderation needs `pump.competitions.moderate` |
| `mayhemApi` (6), `mayhemPartner` (2) | Mayhem landing data, auto/manual mode switch, manual trade triggers, multiplayer emotes, partner-asserted triggers | session or partner |
| `perps` (2) | HyperCore (Hyperliquid) account activation for the user's linked EVM wallet; resting TP/SL/limit orders | session |
| `packs` (2), `gachaInventory`, `market` | Collector Crypt and Phygitals graded-card packs and listings | public |
| `developer` (11), `internalApiPlatform` (9) | A public developer API: orgs apply, verify email, accept terms, create, rotate and revoke keys with scopes and limits; usage from Redis and BigQuery; internal review queue | session; internal |
| `moderation` (6), `internalModeration` (8), `internalUsers`, `flags`, `retailGrowth` | Bans, NSFW marks, photo and banner removal, verified flags, hot-coin and trending approvals, flag-store snapshot, internal growth stats | moderator / internal |
| `articles` (4), `changelog`, `appBanner`, `intercom`, `health` | CMS content (Strapi webhook), changelog targeted by platform and app version, in-app banner, Intercom identity HMAC, liveness | public / webhook |

Each feature built on these routes is explained in [../features/](../features/README.md); the developer host and its
scopes in [../features/developer-api.md](../features/developer-api.md).

## Where transactions are built

This service does not build trades. Two coin-creation routes touch transactions: `POST /coins/create-v2` creates a
coin on the server for a signed-in user ("without captcha"; the web app records it as free creation), and
`POST /coins/sign-create-tx` (deprecated) takes a client-built transaction and returns it with the vanity mint's
signature added. It accepts legacy, v0 or "SIMD-0385 v1" transactions [contract] [bundle]. See
[../flows/create-coin.md](../flows/create-coin.md).
