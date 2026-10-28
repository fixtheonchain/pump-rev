# The mobile app and Terminal: shared and separate parts

## Mobile app

The app was not run in this research. What follows comes from what pump.fun publishes and from the web client,
which shares code paths with it.

| Signal | What it shows | Source |
| --- | --- | --- |
| `github.com/pump-fun/react-native-pager-view` (fork) | The mobile app is React Native | [docs GitHub org listing] |
| The same typed contract serves both | `changelog` "targeted by platform and app version"; `privy-link/signup-import` for "a device-minted wallet key" into Privy with `x-privy-id-token`; `POST /privy-link/export` "HPKE-sealed to a recipient key the device minted"; `following-positions/alerts/presence` counts "screen blur / app background"; `coins/recommendations` for "the rail on the deposit success screen" | [contract] |
| `platform=WEB` query parameter on `home-feed` and `boards/trending` | The same endpoints serve other platforms with another value | [capture] |
| `mobile-resources.pump.fun` | A pump.fun host named in the web bundle; by its name, assets for the app | [bundle] [inferred] |
| AppsFlyer OneLink on the web | Web-to-app links and install attribution | [capture] |
| `pump-segments-sdk` | Segments such as "Mobile Users Without Notifications" and "Mobile High Volume Traders ($1k+ Weekly)", built from `was_on_mobile` and `notifications_received` | [docs pump-segments-sdk] |
| `social_claim_authority` docs | GitHub-linked creator fees "can only be claimed … through Pump.fun (web or mobile)" | [docs pump-public-docs README] |

**Shared:** frontend-api-v3 (one contract), profile-api, swap-api, the NATS clusters (per-user JWT subjects for DMs,
alerts and balances), Privy wallets, and the on-chain programs.
**Different:** embedded wallets minted on the device, push notifications, and app-store distribution [contract]
[inferred]. The 0.45% platform fee applies to "app/web" trades [press: TokenPost 2026-10-17].

## Terminal (formerly Padre)

pump.fun bought the Padre trading terminal (announced October 2025) and runs it as "Terminal". It merged Vyper into
Terminal in February 2026 [press: Cointelegraph, Crypto Briefing, sqmagazine.co.uk].

| Layer | Terminal | Shared with pump.fun? | Source |
| --- | --- | --- | --- |
| Web app | `trade.padre.gg`, a Vite SPA (`/assets/index-*.js`), sign-in required (Cloudflare Turnstile) | separate | [capture] |
| Backend | `backend.padre.gg` (`/app-info/get-runtime-config`, `/time/get-server-time`, `/csp-report/report`) | separate | [capture] |
| Transactions | `txn-service.padre.gg` builds them; on chain each runs `validate_nonce` then `route` on `term9…` | separate service, own program | [capture] [tx] |
| Market data | `candles.padre.gg`, `content.padre.gg`, `twitter-public.padre.gg`, `thumbnails.padre.gg`, `media-cache.padre.gg`, `cards.padre.gg` | separate | [capture] |
| pump.fun data | Its bundle names `https://frontend-api-v3.pump.fun`, `https://pump.fun`, `https://app.pump.fun` | **shared** | [capture] |
| RPC | `wss://mainnet.helius-rpc.com` | separate (pump.fun web uses its own `solana-mainnet.pump.fun`) | [capture] |
| Telemetry | `dd.padre.gg` (Datadog proxy), Cloudflare Insights | separate | [capture] |
| On chain | Terminal program `term9YPb9mzAsABaqN71A4xdbxHmpBNZavpBiQKZzN3`, upgrade key `5oJNGGDx…` (not pump.fun's multisig); routes into Pump, PumpSwap, Raydium and Meteora | its own program, pump.fun's pools | [chain] [tx] |
| Features | Limit orders, copy trading, multi-chain (Solana, Ethereum, Base, BNB) | — | [press] |

"Squads Competition" rankings count app, web and Terminal trades together, so trades from all three surfaces are
attributed to one account [press: PetrAnto via KuCoin, 2026-10-25].
