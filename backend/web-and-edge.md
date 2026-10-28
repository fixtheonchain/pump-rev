# The web app, hosting and edge

## pump.fun itself

| Signal | Value | Source |
| --- | --- | --- |
| Framework | Next.js App Router with React Server Components (`?_rsc=` requests, RSC payload in the HTML), built with Turbopack (`/_next/static/immutable/chunks/turbopack-….js`) | [capture] |
| Hosting | Vercel: `x-vercel-id: <edge>::iad1::…` (the edge nearest the viewer, function us-east-1), `x-vercel-cache`, `x-matched-path`, `/_vercel/speed-insights` | [headers] [capture] |
| Edge in front | Cloudflare: `server: cloudflare`, `cf-ray`, `cf-cache-status`, the bot challenge (`/cdn-cgi/challenge-platform/…`), `/cdn-cgi/rum`; a plain `curl` to pump.fun or any API host gets 403 with `Server-Timing: chlray` | [headers] |
| Security headers | CSP limited to `'self'` plus named vendors, HSTS (180 days, subdomains), `x-frame-options: SAMEORIGIN`, `expect-ct` | [headers] |
| Charts | TradingView Charting Library served from `/tradingview/charting_library/…` | [capture] |
| Auth state in HTML | An inline script reads the `auth_token` cookie (JWT with `address`, `exp`) or `localStorage['decoded-jwt']` and marks `data-pf-auth` before hydration | [html] |

### Same-origin API routes (`pump.fun/api/*`)

| Method | Path | Purpose | Source |
| --- | --- | --- | --- |
| GET | `/api/server-time` | `{nowMs}` (clock sync) | [capture] |
| GET | `/api/i18n/{locale}?ns=…` | Translations | [capture] |
| POST | `/api/relay/rpc/tokens/batch` | EVM token records (`chain: "robinhood"`, `launchpad: "ponsv2"`, …) from an upstream relay | [capture] |
| GET | `/api/relay/rpc/stocks` | Stock-token list | [capture] |
| POST | `/api/jito` | Proxy to Jito's block engine (`sendTransaction`, `sendBundle`) | [bundle] |
| POST | `/api/blockchain/transactions/swap-build` | Trade transaction builder (the bundle's `"/api/blockchain"` base) | [bundle] |
| * | `/api/hermes` | Notifications client base (`hermesNotificationsAvailable: false` in the config) | [bundle] [config] |

## Host map

| Host | What it is | Edge |
| --- | --- | --- |
| `pump.fun` | Web app | Cloudflare → Vercel |
| `frontend-api-v3.pump.fun` | Main API ([frontend-api-v3.md](frontend-api-v3.md)) | Cloudflare |
| `swap-api.pump.fun`, `advanced-indexer.pump.fun`, `advanced-api-v2.pump.fun`, `profile-api.pump.fun` | Data services ([data-services.md](data-services.md)) | Cloudflare |
| `blockchain-swap.pump.fun`, `fun-block.pump.fun` | Transaction services ([transactions.md](transactions.md)) | Cloudflare |
| `livestream-api.pump.fun`, `livechat.pump.fun` | Streams and chat ([livestream.md](livestream.md)) | Cloudflare |
| `solana-mainnet.pump.fun` | pump.fun's Solana RPC (HTTP + PubSub) | Cloudflare |
| `{unified-prod, prod-v2, prod-advanced, multichain-prod}.nats.realtime.pump.fun` | NATS clusters ([realtime.md](realtime.md)) | AWS ELB us-east-1, no Cloudflare |
| `images.pump.fun`, `socialimages.pump.fun` | Image CDNs | AWS CloudFront |
| `pump.mypinata.cloud` | Pinata IPFS gateway | Cloudflare (Pinata) |
| `mobile-resources.pump.fun` | Assets for the mobile app, referenced by the web bundle | Cloudflare |
| `swap.pump.fun`, `fees.pump.fun`, `join.pump.fun` | PumpSwap app, revenue page, invite links (footer links) | Cloudflare |

Every `*.pump.fun` name tried resolved to the same Cloudflare addresses (including names never seen in traffic, such
as `api.pump.fun` and `terminal.pump.fun`), so DNS alone does not prove a service exists. The hosts above are listed
because the app calls them or names them [dns] [capture] [bundle].

## Third-party services in the page

| Service | Use | Source |
| --- | --- | --- |
| LaunchDarkly (`app.launchdarkly.com`, `clientstream.launchdarkly.com`, `events.launchdarkly.com`) | Feature flags, anonymous context `{user: anonymous, platform: web, device}`; the bundle also carries an in-code flag registry with owners and exit criteria | [capture] [bundle] |
| Datadog (`browser-intake-datadoghq.com`) | RUM (20% of sessions, replay 1%) and browser logs | [capture] |
| Google Analytics (`analytics.google.com/g/collect`) | Analytics | [capture] |
| `w-iqit73m191t4x.lantern-echo.com` | `/ingestion/token`, `/ingestion/events`: an event-ingestion endpoint | [capture] |
| AppsFlyer (`/vendor/appsflyer-onelink-smart-script.js`, smart banner) | Web-to-app attribution and app download banner | [capture] |
| Cloudflare Insights / Turnstile | RUM; Turnstile on Terminal's sign-in | [capture] |
| Privy | Embedded wallets (import, export, TEE wallets, `x-privy-id-token`) | [contract] |
| Intercom | Support chat (`GET /intercom/hmac`) | [contract] |
| Pinata | IPFS pinning and gateway | [bundle] |
| Nozomi (Temporal), Jito | Transaction landing | [bundle] |
| Hyperliquid (HyperCore) | Perps via the user's linked EVM wallet | [contract] |
| Strapi | CMS for articles (`/articles/cms-webhook`) | [contract] |

pump.fun's own data stack, from its open-source `pump-segments-sdk`: user segments are SQL over BigQuery
(`pump-data-production.analytics.daily_user_activity`, with fields such as `was_on_mobile`, `usd_volume`,
`notifications_received`), refreshed on a schedule into DynamoDB (`SEGMENT#<id>#V#<version>` / `USER#<id>` keys)
[docs github.com/pump-fun/pump-segments-sdk `src/client.ts`, `src/segments/definitions.ts`]. frontend-api-v3 cites
Redis counters and BigQuery for API usage [contract].
