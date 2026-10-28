# Network capture log (raw evidence)

Browsing pump.fun in a desktop browser on 2026-10-28 (~05:3x–06:xx UTC), not signed in, no wallet
connected, the terms clickwrap left unanswered. A small in-page hook recorded the method, URL, status, request body
(first 600 chars) and a type skeleton of each JSON response for the app's own `fetch`, XHR and WebSocket traffic.
Static assets, images, analytics beacons and feature-flag calls were left out of the hook. Addresses in paths are
written `{mint}` / `{wallet}`; `str(n)` in a shape means a string of n chars.

## Page `/` (home), first load

| Method | URL | Status | Notes |
| --- | --- | --- | --- |
| GET | `https://frontend-api-v3.pump.fun/home-feed?pageSize=150&chain=all&platform=WEB&session_id=…&device_id=…&session_start_timestamp_ms=…` | 200 | `{coins:[{coinMint, coinName, coinImage, symbol, coinDescription, marketCap, protocol, platform, program, chain, narrative, position:{userId, userName, walletAddress, isVerified, xUsername, followerCount, totalCallouts, amountHeld, valueUsd, pnlUsd, pnlPercentage, realizedPnlUsd, costBasisUsd, callout:{calloutId, assetClass, perp, calledOutAtMcap, multiple, thesis, likes, commentCount, maxMultiplier, …}}}]}` |
| POST | `https://frontend-api-v3.pump.fun/users/batch` | 200 | `[{address, userId, is_pump_user, is_banned, username, profile_image, bio, followers, following, x_username, canonical_svm_wallet, canonical_evm_wallet, group_badges, active_competition_entry}]` |
| POST | `https://frontend-api-v3.pump.fun/coins-v2/mints` | 200 | Array of coin records (same fields as `coins-v3`), mixed chains: e.g. `chain_id "eip155:4663"`, `protocol "pons"`, `multichain_family 2` |
| POST | `https://frontend-api-v3.pump.fun/profiles/verified` | 200 | `{<userId>: bool}` |
| GET | `https://frontend-api-v3.pump.fun/profiles/verified` | 200 | `[{userId, username, bio, profileImageUrl, followerCount, walletAddress, socials:[{provider:"TWITTER", username}], isVerified, kind:"PERSON", groupBadges, generatedMedia:{pnlLoop, replayIntro}, isPumpUser}]` |
| GET | `https://frontend-api-v3.pump.fun/coins/top-tokens/mints?withChains=true` | 200 | `{mints:[631], chains:{<mint>:["eip155:1"|"eip155:8453"|"eip155:4663"|"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"]}}` |
| GET | `https://frontend-api-v3.pump.fun/pnl-leaderboard?period=weekly&sort=combined&limit=100` | 200 | `{entries:[{rank, walletAddress, pnlSol, pnlUsd, pnlPercent, buySpendSol, realizedPnlSol, unrealizedPnlSol, positionsCount, topPositions:[{mint, chainId:1399811149, symbol}], username, userId}], periodType, periodLabel:"7d", windowStartSec}` |
| GET | `https://frontend-api-v3.pump.fun/sol-price` | 200 | `{solPrice:101.9, asOfTimestamp, stale:false}` |
| GET | `https://advanced-indexer.pump.fun/boards/trending?tier=web&surface=TRENDING&platform=WEB&limit=150&session_id=…&device_id=…` | 200 | `{board:"movers", version, serverTs, rid, entries:[{m (mint), c:"solana:mainnet", n, t, i, mc, v, vUsd, p (curve %), v5, v15, v1h, v24h, vUsd5…, tx5, age, kol, sn (snipers), mh (mayhem), hs, pg, lp, gd (graduated at), ath, bc, sc, txc, nh (holders), t10 (top-10 %), dh, tw, ws, tg, cb, hr, dw (dev wallet), lv (live), pa, desc, ih, tf, tfUsd}]}` (137 entries) |
| POST | `https://swap-api.pump.fun/v1/coins/market-activity/batch` | 201 | body `{addresses:[…], inte…}`; `{<mint>:{5m|1h|6h|24h:{numTxs, volumeUSD, numUsers, priceChangePercent}}}` |
| GET | `https://swap-api.pump.fun/v1/coins/{mint}/trades/batch` | (resource timing) | trades for a mint |
| GET | `https://frontend-api-v3.pump.fun/candles/solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/{mint}` | (resource timing) | chart candles, CAIP-2 chain id in the path |
| GET | `https://frontend-api-v3.pump.fun/mint-positions/{mint}` | (resource timing) | |
| GET | `https://frontend-api-v3.pump.fun/pnl-leaderboard/top-trader-trades/{mint}` | (resource timing) | |
| GET | `https://frontend-api-v3.pump.fun/coins-v3/{mint}` | (resource timing) | |
| POST | `https://pump.fun/api/relay/rpc/tokens/batch` | 200 | body `{addresses:["0x7ffd…"]}` → `{tokens:[{address, poolAddress, chain:"robinhood", name, symbol, decimals:18, launchpad:"ponsv2", launchpadProgram:"0x8366a39c…", creatorAddress, createTransactionHash, migrationCompleted, migratedPoolAddress, isHolderReward, assetClass, canonicalStock, underlyingSymbol, operatorBypass, operatorBlacklist, …}]}` |
| GET | `https://pump.fun/api/relay/rpc/stocks` | 200 | |
| GET | `https://pump.fun/api/server-time` | 200 | |
| GET | `https://pump.fun/api/i18n/ko?ns=web.competitions`, `?ns=__all__` | 200 | translations |
| POST | `https://solana-mainnet.pump.fun/f15623a5-2536-4b47-9641-8abc239413ba` | (resource timing) | Solana JSON-RPC (HTTP) |

## Page `/coin/6xc3RU6UMZinBJJgeMaNBqRbanTdG1QTq47tCXXwpump` (graduated, quote = TSLAx `XsDoVfqe…`)

| Method | URL | Status | Shape |
| --- | --- | --- | --- |
| GET | `https://advanced-indexer.pump.fun/in-memory-coin/{mint}` | 200 | `{mint, chain:"solana:mainnet", name, ticker, dev, program, platform, creationTime, quoteMint, pair, marketCapUsd, volumeSol, volumeUsd, progress, graduationDate, athMarketCapUsd, sniperCount, numKolsTraded, txCount, buyCount, sellCount, priorityFeeSol/Usd, builderTipSol(V2), tradingAppFeeSol(V2), txFeeSolV2, feeSeedSol, isMayhemMode, mayhemState, mayhemMode, isMultiplayer, …}` |
| GET | `https://swap-api.pump.fun/v1/coins/{mint}/market-activity?program=pump&chainId=solana:5eykt…` | 200 | `{5m|1h|6h|24h:{numTxs, volumeUSD, numUsers, numBuys, numSells, buyVolumeUSD, sellVolumeUSD, numBuyers, numSellers, priceChangePercent}}` |
| GET | `https://swap-api.pump.fun/v1/coins/{mint}/ath?currency=USD&program=pump&chainId=…` | 200 | `{athMarketCap}` |
| GET | `https://frontend-api-v3.pump.fun/coins-v3/{mint}` | 200 | `{mint, initialized, name, symbol, description, image_uri, metadata_uri, twitter, bonding_curve, associated_bonding_curve, creator, created_timestamp, complete, hidden, total_supply, website, show_name, last_trade_timestamp, nsfw, is_banned, pump_swap_pool, livestream_ban_expiry, is_currently_live, ath_market_cap, program:"pump", token_program, quote_mint, base_decimals, quote_decimals, pool_address, is_cashback_enabled, indexed_by_pump, tokenized_agent, chain_id, multichain_family, protocol, is_charity, total_supply_str, market_cap_usd, market_cap_quote, canonical_pool_liquidity_usd, boost_mode, verified, is_holder_reward, transfer_fee_bps, transfer_hook_program, depth, security_verdict:{verdict, scope, reasons, decided_by, provider, version}, …}` |
| GET | `https://frontend-api-v3.pump.fun/coins-v2/{mint}/mayhem-state` | 200 | `null` for a non-mayhem coin |
| GET | `https://frontend-api-v3.pump.fun/global-params/{timestampMs}` | 200 | `{slot, signature, initial_virtual_token_reserves, initial_virtual_sol_reserves, initial_virtual_quote_reserves, initial_real_token_reserves, token_total_supply, fee_basis_points, timestamp}` (record from slot 354,155,511) |
| GET | `https://frontend-api-v3.pump.fun/token-holders/{mint}/count` | 200 | `{mint, chain:"solana", networkId:1399811149, holderCount}` |
| GET | `https://frontend-api-v3.pump.fun/coins/search-quote-facets?quoteMints={mint}` | 200 | `{quoteFacets:[{mint, coinCount}], otherCount}` |
| GET | `https://frontend-api-v3.pump.fun/coins/search-unrestricted?quoteMints={mint}&sort=usd_market_cap&order=DESC&limit=48&offset=0` | 200 | array of coin records |
| GET | `https://frontend-api-v3.pump.fun/mint-positions/{mint}?sortBy=TOP&pageSize=50` | 200 | `{positions:[{coinMint, chainId, userId, userName, walletAddress, amountHeld, pnlUsd, pnlPercentage, realizedPnlUsd, costBasisUsd, callout:{…}}], totalCount, hasMore}` |
| GET | `https://frontend-api-v3.pump.fun/pnl-leaderboard/top-trader-trades/{mint}` | 200 | `{mint, traders:[{userId, walletAddress, username, bestRank, periods, tradingWallets, tradeCount}], trades:[{tx, isBuy, timestamp, amountUsd, baseAmount, priceUsd, walletAddress, slotIndexId, amountSol}], page:{nextCursor, limit}}` |
| GET | `https://frontend-api-v3.pump.fun/users/{wallet}` | 200 | `{address, userId, is_pump_user, is_banned, username, profile_image, header_image_url, kind, following, followers, bio, x_username, canonical_svm_wallet, canonical_evm_wallet, group_badges}` |
| POST | `https://profile-api.pump.fun/pnl/coin/{mint}/holders` | 201 | body `{holders:[wallets…]}` → `{success, data:[{wallet, mint, unrealized:{cost_basis, pnl, percentage, amount_held}, realized, total_buy_spend, total_buy_amount, last_slot_index_id, has_transfers, fee:{sol, usd}, fee_detail:{base, priority, tip, ui, ata_rent, protocol, cashback}}], errors}` |
| GET | `https://blockchain-swap.pump.fun/referrals/fee-rates` | 200 | `{protocol_bps:45, referrer_bps:40, reduced:{mints:[16], protocol_bps:5, referrer_bps:4}}` |
| GET | `https://blockchain-swap.pump.fun/supported/coin-create-mints` | 200 | `[{mint, decimals, symbol, ticker, image_url, minimum_sol_buy, minimum_usdc_buy, price_usd, market_cap_usd, liquidity_usd, asset_type:"native"…}]` (226 quote mints) |
| GET | `https://livestream-api.pump.fun/livestream?mintId={mint}` | 200 | `""` when not live |
| GET | `https://livestream-api.pump.fun/livestream/history?mintId={mint}&limit=50&offset=0` | 200 | `{items:[{id, streamStartTimestamp, streamEndTimestamp, title}], total}` |
| GET | `https://livestream-api.pump.fun/livestream/is-approved-creator?mintId={mint}` | 200 | `{isApprovedCreator:false}` |
| GET | `https://livestream-api.pump.fun/clips/{mint}?limit=20&clipType=HIGHLIGHT|COMPLETE` | 200 | `{clips:[], hasMore}` |
| GET | `https://livestream-api.pump.fun/clips/{mint}/counts` | 200 | `{total, hidden, visible, clips, softDeleted}` |
| GET | `https://livestream-api.pump.fun/clips/{mint}/{clipId}` | 200 | `{roomName:<mint>, clipId, sessionId, startTime, endTime, duration, playlistUrl, variants:[{name:"high", height:1080, playlistUrl, playlistS3Key}], mp4S3Key, thumbnailUrl, playlistS3Key, title, clipType, deletionStatus, viewCount}` |
| GET | `https://livestream-api.pump.fun/bounties/v2/tasks?coinAddress={mint}&phase=OPEN,PENDING_RESOLUTION,CLOSED,IN_DISPUTE_PERIOD&limit=5` | 200 | `{items:[]}` |
| WS | `wss://solana-mainnet.pump.fun/2ba533b3-1d80-4fa8-8879-404ea05e068f` | open | Solana RPC PubSub. Sent `accountSubscribe` (`encoding: base64`, `commitment: processed`) for the bonding curve, the PumpSwap pool, the mint and other accounts; replies are subscription ids |
| POST | `https://browser-intake-datadoghq.com/api/v2/rum`, `/api/v2/logs` | 202 | Datadog RUM (session sample rate 20, replay 1) |

## From the web bundle (`/_next/static/…`, read from the browser cache)

- Typed client routes (`"METHOD /path"` keys): `GET /coins`, `GET /coins-v3/{address}`, `GET /coins/currently-live`,
  `GET /coins/great-coins`, `GET /coins/search-unrestricted`, `GET /coins/search-v2`, `GET /coins/top-holders-v2/{mint}`,
  `GET /global-params/{timestamp}`, `GET /groups/me`, `GET /groups/of/{id}`, `GET /groups/search`,
  `GET /groups/{groupId}/members`, `GET /groups/{groupId}/members/pnl`, `PATCH /groups/{groupId}`, `POST /groups`,
  `POST /groups/{groupId}/invites`, `POST /groups/{groupId}/invites/respond`, `DELETE /groups/{groupId}/members/{userId}`,
  `GET /pnl-leaderboard`, `GET /pnl-leaderboard/groups`, `GET /portfolio-summary`, `GET /search/resolve`,
  `GET /share-video/replay/{renderId}`, `POST /share-video/replay`, `GET /token-holders/{mint}/count`,
  `GET /trades/{chainId}/{address}`, `GET /user-portfolio/{userId}`, `GET /user-trades/{id}`, `GET /users/search-v2`,
  `GET /users/{id}`, `POST /profiles/verified`, `POST /users/batch`, `POST /coins/sign-create-tx`.
- Realtime: `wss://multichain-prod.nats.realtime.pump.fun` (`NEXT_PUBLIC_MULTICHAIN_NATS_URL`, used by
  `useMultichainTradeEventSubscription`; the warning text says it carries "live EVM trades").
- Transaction sending: `/api/jito` (same-origin proxy; JSON-RPC `sendBundle` and `sendTransaction`), and 7 Nozomi
  (Temporal) endpoints `https://{ams1,ash1,ewr1,fra2,pit1,sgp1,tyo1}.secure.nozomi.temporal.xyz/?c=<client key>`.
  Tip instruction: a SystemProgram transfer to a random Jito tip account when front-running protection is on, else to
  a random one of 16 `pfn…` addresses. With protection on, the compute-limit instruction carries the read-only key
  `jitodontfront11111111111111111111111111pump`. "dust" mode adds no tip.
- Priority fee: `getPriorityFeeEstimate` (priorityLevel "High") on the app's RPC; floor 100,000 µlamports, cap
  100,000,000. Compute limit = simulated units × a factor; the draft for simulation uses 1,400,000 CU at price 1.
- Constants module: 200,000 / 250,000 / 270,000 / 450,000 / 500,000 CU values, commitment `processed`.
- `POST /coins/sign-create-tx` → `{serializedTx}` (bs58): the server signs the create transaction (mint key).
- Embedded IDL for `pump_agent_payments` at address `pUmPFn9WvfaN2WTVGnCEtJTd2ATTpvpsKRz6jVzu6u4`.
- Jito tip accounts ×8, PumpSwap/Pump protocol fee recipients ×8 (incl. `CebN5WGQ…`), buyback vaults ×8,
  `HTVZVEQM…` (boost authority) next to the `boost_vault` seed, lookup table `Hyif6eWb…`, quote mints WSOL, USDC and
  `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`.

## Page `/create` (not signed in)

| Method | URL | Status | Shape |
| --- | --- | --- | --- |
| GET | `https://blockchain-swap.pump.fun/supported/coin-create-mints` | 200 | 226 quote options `[{mint, decimals, symbol, ticker, image_url, minimum_sol_buy, minimum_usdc_buy, price_usd, market_cap_usd, liquidity_usd, asset_type}]` |

## Page `/live`

No client `fetch` to an API during 8 s after the client-side navigation; the list arrives in the RSC payload
(rendered on pump.fun's server).

## Page `/profile/8ZN71XTdVo8yRovnGLmNgW3Tgniw6A4J3JGLvPD686FP`

| Method | URL | Status | Shape |
| --- | --- | --- | --- |
| GET | `https://profile-api.pump.fun/balance/summary/{wallet}?multi_chain=true` | 200 | `{success, data:{total_value, native_balance, native_lamports, wrapped_sol_balance, sol_price, token_count, dust_count, dust_value_usd, hidden_count, hidden_value_usd, last_update_ts, portfolioPnL:{total_cost_basis_usd, total_un…}}}` |
| GET | `https://profile-api.pump.fun/balance/tokens/{wallet}?page=1&size=10` and `?page=1&size=200&chain=all` | 200 | `{success, data:{tokens:[{token_mint, token_name, token_symbol, token_image, program:"non_launchpad"…, token_price, priceSol, decimals, balance, value, chain:"solana", network_id:"1399811149", tokenPnL, dust_floor_filtered}]}}` |
| POST | `https://profile-api.pump.fun/wallet-overview` | 200 | body `{wallets:[…]}` → `{wallets:{<w>:{total_value_usd, sol_price_usd, native_balance_sol, unavailable_chains, truncated, first_tx_timestamp}}}` |
| GET | `https://frontend-api-v3.pump.fun/users/{userId}/overview` | 200 | `{address, profile:{address, userId, is_pump_user, is_banned, username, profile_image, header_image_url, kind, …}}` |
| GET | `https://frontend-api-v3.pump.fun/users/{wallet}/achievements` | 200 | `{achievements:[{achievementId, unlockedAt, value, seen, holderCount, holderPercent}], progress:[{metric, currentValue, nextThreshold, nextAchievementId}]}` |
| GET | `https://frontend-api-v3.pump.fun/achievements/catalog` | 200 | `{catalogVersion, achievements:[{id, family, tier, name, description, imageUrl, metric, threshold}]}` (46) |
| GET | `https://frontend-api-v3.pump.fun/portfolio-summary/chart?user={wallet}&period=1d` | 200 | `{period, range, currency:"USD", points:[{time, value}], equityFrom, resolutionSec, valueNow, meta:{walletsRequested, walletsAnswered, coverageFrom}}` |
| GET | `https://frontend-api-v3.pump.fun/portfolio-summary?user={wallet}&period=1d&holdings=1` | 200 | `{wallet, from, to, pnl:{sol, usd}, realizedPnl, unrealizedPnl, percentage, totalBuySpend, heldOpenValue, maxCapitalDeployed, …}` |
| GET | `https://frontend-api-v3.pump.fun/user-portfolio/{wallet}?filter=open&page=0&pageSize=100&sortBy=POSITION_SIZE` | 200 | `{positions:[{coinMint, chainId, isExited, walletAddress, amountHeld, pnlUsd, pnlPercentage, costBasisAmount, costBasisUsd, amountBoughtUsd, receiptBasisUsd, amountBought, callout}]}` |
| GET | `https://frontend-api-v3.pump.fun/user-positions/{wallet}?mints=…&updatesLimit=0` | 200 | `{positions:[…]}` |
| GET | `https://frontend-api-v3.pump.fun/coins-v2/user-created-coins/{wallet}?limit=50&offset=0` | 200 | `{limit, offset, count, coins:[coin records]}` |
| POST | `https://solana-mainnet.pump.fun/{uuid}` | 200 | JSON-RPC `getMultipleAccounts`; response `context.apiVersion "4.3.0-alpha.2"` |

## Runtime config served in the page HTML (RSC payload)

- `config: {livechatUrl: "wss://livechat.pump.fun", livestreamsUrl: "https://livestream-api.pump.fun", clientServerUrl: "https://frontend-api-v3.pump.fun", profileApiUrl: "https://profile-api.pump.fun", hermesNotificationsAvailable: false}`.
- NATS `configs`: `ADVANCED` → `wss://prod-advanced.nats.realtime.pump.fun`, `CORE` → `wss://prod-v2.nats.realtime.pump.fun`,
  `UNIFIED` → `wss://unified-prod.nats.realtime.pump.fun`, `MULTICHAIN` → `wss://multichain-prod.nats.realtime.pump.fun`;
  each `{timeout:5000, waitOnFirstConnect:true, reconnect:true, reconnectTimeWait:1000, maxReconnectAttempts:-1,
  pingInterval:5000, maxPingOut:2, user:"subscriber", pass:<redacted>}`; `instances: ["UNIFIED","CORE"]` open on load.
  The read-only subscriber password ships to every visitor; it is not copied here.
- Footer links: `https://swap.pump.fun` (PumpSwap app), `https://fees.pump.fun/` (revenue page), `https://join.pump.fun/…` (invite links).

## Host table in the bundle (module 503630, chunk `1iz1f978wp41x.js`)

`advanced-api-v2.pump.fun`, `advanced-indexer.pump.fun`, `/api/blockchain` (same-origin), `blockchain-swap.pump.fun`,
`fun-block.pump.fun`, `frontend-api-v3.pump.fun`, `livestream-api.pump.fun`, `swap-api.pump.fun/v1`. Other modules:
`https://solana-mainnet.pump.fun/f15623a5-…` (HTTP RPC) and `wss://solana-mainnet.pump.fun/2ba533b3-…` (PubSub),
`https://images.pump.fun/{imageType}/{mint}?variant=…` (image CDN), `/api/hermes` (notifications, same-origin),
livechat REST at the `https` form of `livechatUrl`.

## Client code paths read from the bundle

- **Create, free (no first buy):** `GET /ipfs/pinata-presigned` → upload the image to Pinata with the presigned URL →
  the same for the metadata JSON (`metadataUri = https://ipfs.io/ipfs/<cid>`, gateway `pump.mypinata.cloud`) →
  `POST frontend-api-v3/coins/create-v2` with `{name, ticker, description, twitter, telegram, website, showName,
  metadataUri, image, video, tokenProgram}` and the session cookie → `{mint}`; recorded as `isFree: true`.
- **Create with a first buy (SOL or USDC pair):** mint from `GET /vanity/random-mint-public-key` (server-held vanity
  key), else a local keypair → `PUMP_SDK.createV2AndBuyV2Instructions` in the browser → lookup table `Hyif6eWb…` →
  simulate a 1,400,000-CU draft for units, `getPriorityFeeEstimate` for the price → v0 transaction → for a vanity mint
  `POST /coins/sign-create-tx` (server adds the mint signature), else the browser signs with the mint keypair → the
  wallet signs and sends. Coins with creator-reward recipients add a fee-sharing transaction (front-running
  protection on). Custom pairs (stock, pump-coin quote, custom creator fee, holder rewards) go through a separate
  builder with a "prep swap" into the quote asset.
- **Swap build:** `POST {/api/blockchain}/transactions/swap-build` with auth headers and
  `has_support_for_sending_options: true`; retries with backoff; error body carries `reason` and `retryable`.
- **Cross-chain (EVM ↔ Solana):** `GET {base}/quote?fromChain…&toChain=solana&fromToken&toToken&amount&userAddress&recipient&subsidizeFees&originGasOverhead=80000&slippageBps`,
  `POST {base}/execute`, then a status poll every 2 s for up to 60 s.
- **Board feed:** `new WebSocket(<advanced-indexer as ws>/ws/trenches?subscription={board, tier:"web", filterKey})`,
  then `{"event":"subscribe","data":{board, tier:"web", limit, window…}}`.
