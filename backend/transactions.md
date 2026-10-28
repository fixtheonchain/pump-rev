# Transactions: who builds them, how they are priced and sent

## Builders

| Builder | Host | Builds | Signs | Evidence |
| --- | --- | --- | --- | --- |
| The browser (`@pump-fun/pump-sdk` inside the app) | — | `create_v2` + `buy_v2` for SOL/USDC coins (`createV2AndBuyV2Instructions`), using lookup table `Hyif6eWb8x88RVrvjPfabsgRYnwkVnyByEXTVTXbUcyP` | the user's wallet; the mint key locally when it is not a vanity key | [bundle] |
| frontend-api-v3 `POST /coins/sign-create-tx` (deprecated) | `frontend-api-v3.pump.fun` | nothing: adds the vanity mint's signature to a client-built create transaction (legacy, v0 or "SIMD-0385 v1", ≤ 4,096 bytes) | the vanity mint key, held by the server | [contract] [bundle] |
| frontend-api-v3 `POST /coins/create-v2` | `frontend-api-v3.pump.fun` | a whole coin creation for a signed-in user, with no first buy; the app records it as `isFree: true` | the server | [contract] [bundle] |
| swap build | `pump.fun/api/blockchain/transactions/swap-build` (same-origin route of the web app; base `"/api/blockchain"` in the host table) | buys and sells, with `has_support_for_sending_options: true`; errors return `reason` and `retryable`; `insufficient_funds` is a distinct result | the user's wallet | [bundle] |
| blockchain-api-service, other builders | `pump.fun/api/blockchain/transactions/…` | `creator-fees`, `creator-fees/vault` (claims), `relay-buy-preview` / `relay-buy-build` (cross-chain buys through Relay), `perp-fees`, `perp-open-preview`, `perp-open-build`, `perp-actions-build`, `perp-actions-send`, `perp-withdraw-build`, `perp-withdraw-send`, `perp-relay-status` (Hyperliquid), `cc-pack-*` and `cc-market-*` (Collector Crypt packs and card market), and `send` (lands a signed transaction and returns the signature). Retries twice on 429/5xx (600 ms, 1.2 s), 30 s timeout, header `x-transaction-encoding` | the user's wallet (Solana); the Privy EVM wallet signs EIP-712 for perps | [bundle 2026-10-28] → [../features/](../features/README.md) |
| limit orders | `pump.fun/api/blockchain-limit/transactions/…` | `limit-eligibility`, `swap-build-limit` (a swap against the user's durable nonce account), `send-limit`, `cancel-limit`; EVM orders under `…/evm/<route>` | the user, in advance; pump.fun sends at the trigger | [bundle] → [../features/trading-tools.md](../features/trading-tools.md) |
| `blockchain-swap.pump.fun` | Cloudflare | the swap and quote service behind the app: `GET /referrals/fee-rates`, `GET /supported/coin-create-mints` (226 quote assets with prices and minimum buys); responses carry `x-transaction-encoding: base58` | — | [capture] [headers] |
| `fun-block.pump.fun` | Cloudflare | the public "agents" API: `POST /agents/create-coin` (server generates the mint keypair and partial-signs), `POST /agents/swap` (curve or pool chosen by the server), `POST /agents/collect-fees`, `POST /agents/sharing-config`; each returns a serialized transaction for the user to sign; `encoding` defaults to base58 | mint key (create); the user | [docs github.com/pump-fun/pump-fun-skills `create-coin/SKILL.md`, `swap/SKILL.md`, `coin-fees/SKILL.md`] [bundle host table] |
| Cross-chain quote/execute | `intents.pump.fun` (`NEXT_PUBLIC_BRIDGE_API_URL`) | EVM → Solana trades: `GET /quote?fromChain&toChain=solana&fromToken&toToken&amount&userAddress&recipient&subsidizeFees&originGasOverhead=80000&slippageBps`, `POST /execute`, then a status poll every 2 s for up to 60 s | the EVM wallet | [bundle] |
| Terminal `txn-service.padre.gg` | Cloudflare | Terminal's own transactions; the on-chain `validate_nonce` + `route` pattern fits server-built transactions with a replay guard | the user | [capture trade.padre.gg] [tx] [inferred] |

The buy and sell path the web app takes for a given coin (client SDK or `swap-build`) is chosen in code by feature
flags and coin type, and no trade was signed during this research. Live app transactions on 2026-10-28 go through the
Pump App router (`bonding_curve_v3`, `pump_swap_v3`), which charges the 0.45% app fee [tx]. See
[../onchain/pump-app-router.md](../onchain/pump-app-router.md).

## Compute budget and priority fee (web app)

From the bundle's transaction module [bundle]:

1. Build a draft v0 transaction with `setComputeUnitLimit(1,400,000)`, `setComputeUnitPrice(1)` and the program
   instructions, blockhash `111…1`.
2. `simulateTransaction` (`sigVerify: false`, `replaceRecentBlockhash: true`, commitment `processed`) → units
   consumed. The limit becomes units × a scale factor, capped at 1,400,000. On a simulation error it falls back to a
   per-action default. The constants module holds 270,000 (create), 200,000 (trades), 250,000, 450,000 and 500,000.
3. `getPriorityFeeEstimate` (the Helius-style method) on the app's RPC, `priorityLevel` from the user's setting
   (default `"High"`), clamped to a floor of 100,000 and a cap of 100,000,000 µlamports. On failure it uses 100,000.
4. The other builder path takes a total priority fee (default 1,000,000 lamports) and sets the price to
   `floor(1e6 × fee / units)` µlamports [bundle; the unit of the default is inferred].

pump.fun's skills use the same method with `"Medium"`, a floor of 100,000 and a cap of 5,000,000 µlamports, and fixed
limits of 270,000 (create), 120,000 (curve trade) and 200,000 (pool trade) "aligned with
frontend/apps/frontend/stores/blockchainStore/constants.ts" [docs pump-fun-skills `scripts/lib/compute.mjs`,
`constants.mjs`].

## Tips and sending

| Mode | Tip instruction | Where it is sent | Evidence |
| --- | --- | --- | --- |
| Normal | `SystemProgram.transfer` to a random one of 16 `pfn…` addresses (e.g. `pfnTcJ1i4mRYzbqGduF71RsooUCFkPSpk8UE7drCkjh`) | the 7 Nozomi (Temporal) regions in parallel: `https://{ams1,ash1,ewr1,fra2,pit1,sgp1,tyo1}.secure.nozomi.temporal.xyz/?c=<client key>` | [bundle]; the router transaction of 2026-10-26 paid 10,000 lamports to `pfnTcJ1i…` [tx, `../onchain/pump-app-router.md`] |
| Front-running protection | transfer to a random one of the 8 Jito tip accounts; the compute-limit instruction also carries the read-only key `jitodontfront11111111111111111111111111pump` | `POST /api/jito` (same-origin proxy), JSON-RPC `sendTransaction`, or `sendBundle` for several transactions | [bundle] |
| `dust` | none | — | [bundle] |

`jitodontfront…` is Jito's marker account: a bundle containing a transaction that lists an account starting with
`jitodontfront` is accepted by the block engine only with that transaction first, which keeps sandwiches out
[inferred from Jito's documented convention]. The tip amount comes from the user's setting. The skills default to
0.0001 SOL [docs pump-fun-skills `jito.mjs`].

## RPC

`https://solana-mainnet.pump.fun/f15623a5-2536-4b47-9641-8abc239413ba` (HTTP) and the matching
`wss://…/2ba533b3-…` PubSub. Both sit behind Cloudflare like the rest of pump.fun, and responses report
`apiVersion "4.3.0-alpha.2"` [bundle] [capture] [dns]. Terminal uses `wss://mainnet.helius-rpc.com` [capture]. The app
sets commitment `processed` [bundle].
