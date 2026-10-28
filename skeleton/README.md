# pump.fun backend skeleton

A backend research implementation of the [reconstruction blueprint](../reconstruction/blueprint.md). It combines a NestJS HTTP BFF, gRPC domain services, a binary protobuf WebSocket gateway, Rust event ingest, relational workflows, transaction builders and keepers. TypeScript clients consume the public HTTP contract and stream codecs independently of service internals.

## Layout and research

| Directory | Responsibility | Reference |
| --- | --- | --- |
| `contracts/http` | Zod route registry, six API scopes, error registry, deprecations and typed fetch client | [HTTP contract](../data/frontend-api-v3-contract.md), [developer API](../features/developer-api.md) |
| `contracts/proto` | Trading, communities and coins gRPC definitions; browser stream codecs | [data pipeline](../reconstruction/data-pipeline.md) |
| `packages/runtime`, `packages/internal-http` | Store connections, configuration, internal authentication, validation and idempotency | [service boundaries](../reconstruction/services.md) |
| `packages/solana` | Captured IDLs, instruction/account resolution, v0 transactions and signed-message validation | [Pump](../onchain/pump.md), [PumpSwap](../onchain/pump-amm.md), [IDLs](../idl/) |
| `packages/nats-auth`, `services/auth-callout` | One-hour user grants, encrypted auth exchange and subject isolation | [NATS subjects](../reconstruction/data-pipeline.md) |
| `ingest` | Anchor event decoding, replay and Geyser sources, ordinals and corrections | [ingest guide](ingest/README.md), [pipeline](../reconstruction/data-pipeline.md) |
| `services/trading`, `services/stream-gateway` | Trades, candles, holdings, live state and bounded WebSocket streams | [pipeline](../reconstruction/data-pipeline.md), [realtime](../backend/realtime.md) |
| `services/communities`, `services/coins` | Users, follows, callouts, transactional outbox and coin registry | [social rules](../features/social-and-callouts.md) |
| `services/client-server` | HTTP routes, sessions, keyed host, CORS, rate limits, flags and upstream error mapping | [identity](../features/accounts-and-identity.md), [developer API](../features/developer-api.md) |
| `services/tx-builder` | Swaps, creator-fee sweeps/claims, guarded sends and signature reconciliation | [transactions](../backend/transactions.md), [claim flow](../flows/claim-creator-fees.md), [buy flow](../flows/buy.md) |
| `services/limit` | Durable nonce orders, market-cap triggers and settlement ledger | [trading tools](../features/trading-tools.md) |
| `keepers/holder-rewards` | Exact allocations, distribution reserve, transaction batching and payout ledger | [rewards](../features/rewards-and-referrals.md), [keepers](../reconstruction/keepers-and-signers.md) |
| `services/profile` | Positions, inventory cost basis and realized/unrealized PnL | [trading tools](../features/trading-tools.md) |
| `services/notify` | Encrypted device tokens, user-subject fan-out, push delivery and receipts | [social delivery](../features/social-and-callouts.md) |
| `services/live` | Streams, clips, bounty escrow state machine and settlement ledger | [livestreams](../backend/livestream.md), [bounties](../features/packs-mayhem-agents-bounties.md) |
| `services/bridge` | Relay-shaped quotes, execution and status | [transactions](../backend/transactions.md) |
| `storage`, `tools`, `fixtures` | Migrations, seeds, start/verification scripts and synthetic event fixtures | [blueprint](../reconstruction/blueprint.md) |
| `infra` | Store configuration, service images and AWS/Kubernetes manifests | [infrastructure guide](infra/README.md), [blueprint](../reconstruction/blueprint.md) |

## Requirements

- Node.js 22 and npm.
- Rust/Cargo compatible with the locked ingest crate; its image uses Rust 1.99.1.
- OpenSSL for local TLS certificates.
- PostgreSQL 17, ClickHouse 25.8, Redis 7.4 and NATS 2.11 with JetStream.

The local endpoints in `.env.example` are PostgreSQL on 5641, ClickHouse HTTP/native on 8641/9641, Redis on 6641 and NATS on 4641. [infra/compose.yaml](infra/compose.yaml) defines these stores. Services connect to configured stores; they do not manage store lifecycles.

## Setup

Run from this directory after configuring the stores:

```bash
npm ci
npm run prepare:local
npm run build
cargo build --manifest-path ingest/Cargo.toml
npm run migrate
npm run seed
npm run seed:transactions
npm run fixtures
npm run dev:tls
```

`prepare:local` creates `.env` from `.env.example` or fills missing entries without replacing existing values. It generates the device-token encryption key and derives the fixture trader's public wallet. `.env.example` contains only local stand-ins and empty external credential fields. `.env`, `.local/`, generated Prisma clients and build output are ignored.

The workspace build follows package dependencies and generates the Prisma client and protobuf descriptor without accessing a database. SQL migrations define the persistent schema. PostgreSQL migrations are transactional and checksummed; ClickHouse DDL uses a migration ledger and restart-safe statements. Applied migration files are immutable. The coin registry's Prisma schema is an ORM projection of the SQL schema.

`seed` creates users, wallets, follows, a squad, a coin, trades, a callout and an approved API organization. Its generated local API key is written to `.local/api-key.txt`. `seed:transactions` adds the fixture transaction identity and reward vault, with public fixture addresses in `.local/money-fixtures.json`. Fixture signers are deterministic test identities.

The example selects fixture transaction adapters and local media, escrow, push and bridge adapters. Both keepers default to dry-run mode. Configuration values that are not reconstructed constants are explicit environment settings.

## Run

```bash
npm run start:local
```

This provisions the named JetStream streams and starts services and keepers. `NATS_AUTH_MODE=on` also starts auth-callout. Match this setting to the broker: `on` for the authenticated configuration under `infra/`, or `off` for an unauthenticated broker. Ctrl+C stops the child services.

Each service also has an individual start command:

| Command | Local endpoint |
| --- | --- |
| `npm run start:bff` | HTTP 4345 |
| `npm run start:keyed` | HTTP 4353 |
| `npm run start:stream` | WSS 4346, `/stream` |
| `npm run start:trading` | gRPC 4347 |
| `npm run start:communities` | gRPC 4348 |
| `npm run start:coins` | gRPC 4349 |
| `npm run start:tx-builder` | HTTP 4350 |
| `npm run start:limit` | HTTP 4351, with trigger worker |
| `npm run start:profile` | HTTP 4352 |
| `npm run start:notify` | HTTP 4354 |
| `npm run start:live` | HTTP 4355, with bounty reconciliation |
| `npm run start:bridge` | HTTP 4356 |
| `npm run start:auth-callout` | Health HTTP 4357, NATS worker |
| `npm run start:holder-rewards` | HTTP 4358, with reward worker |

HTTP services expose `GET /health`. Trading, communities and coins expose their domain gRPC `Health` methods. `tools/probe.cjs` calls these protocols for container probes. Ingest provides `cargo run --manifest-path ingest/Cargo.toml -- health`. Public listeners use `BIND_HOST`; gRPC servers accept separate `*_GRPC_BIND` settings alongside their client URLs.

Replay the synthetic events with pacing:

```bash
cargo run --manifest-path ingest/Cargo.toml -- replay fixtures/replay.jsonl --delay-ms 100
```

The gateway uses `.local/localhost-cert.pem` and `.local/localhost-key.pem` for local WSS. Clients must trust the certificate. When TLS terminates at a proxy, the gateway accepts WS if both certificate settings are absent.

## HTTP client and contract

`@pump/http` exports `defineRoutes`, `publicRead`, the route map, schemas, API scopes, errors and `createClient`. Routes are defined in `contracts/http/src/routes.ts` and `service-routes.ts`. Add the built package as a workspace or local package dependency to use it from a TypeScript client.

```typescript
import {createClient, SOLANA_CHAIN} from '@pump/http';

const mint = 'US517G5965aydkZ46HS38QLi7UQiSojurfbQfKCELFx';
const api = createClient({baseUrl: 'http://127.0.0.1:4345'});
const tape = await api.request('GET /trades/{chainId}/{address}', {
  params: {chainId: SOLANA_CHAIN, address: mint},
  query: {limit: 20, commitment: 'confirmed'},
});
const login = await api.request('POST /auth/login/token', {
  body: {identityToken: 'pumpskel-alice-identity'},
});
const signed = createClient({baseUrl: 'http://127.0.0.1:4345', token: login.token});
const portfolio = await signed.request('GET /user-portfolio/{userId}', {
  params: {userId: login.user.id}, query: {filter: 'open'},
});
```

The factory infers input/output types from literal route keys, URL-encodes parameters, validates requests and responses, and creates multipart bodies where declared. `ApiError` carries the registry-backed Nest-style envelope; `TransactionApiError` carries `{error, data: {reason, retryable}}` for transaction-builder routes. Registry entries define status, ownership, summary, actionability and retry policy. The BFF registers routes and validates boundaries from this same map. Deprecations require at least 90 days between `since` and `sunset`.

Cookie login at `POST /auth/login/session` uses `credentials: 'include'` and a configured Origin. Cookie writes require Origin. Keyed clients use `apiKey`, port 4353 and routes marked `publicRead(scope, ...)`. Session and keyed credentials are separated by host. Allowed origins, per-user buckets, key scopes, burst/daily budgets and flags are environment-backed.

## Trading stream

Browser codecs are exported from `@pump/proto/browser`; Node gRPC/runtime helpers are exported from `@pump/proto`. The package includes the proto definitions for independent client generation.

```typescript
import {SOLANA_CHAIN} from '@pump/http';
import {streamCodecs} from '@pump/proto/browser';

const mint = 'US517G5965aydkZ46HS38QLi7UQiSojurfbQfKCELFx';
const {WatchRequest, Frame} = streamCodecs();
const socket = new WebSocket('wss://127.0.0.1:4346/stream', 'pumpfun.trading.v1');
socket.binaryType = 'arraybuffer';
socket.onopen = () => socket.send(WatchRequest.encode(WatchRequest.fromObject({
  subscribe: [{coin: {
    chain: SOLANA_CHAIN, address: mint, commitment: 'PROCESSED', parts: ['MARKET'],
  }}],
})).finish());
socket.onmessage = event => {
  const frame = Frame.decode(new Uint8Array(event.data));
  console.log(frame);
};
```

Subscriptions receive a snapshot followed by live frames and corrections. The gateway enforces 64 topics, 32 subscriptions per request, a 256-frame queue per topic, gap coalescing, per-topic sequences, 15-second staleness and 10-second idle close, with a 15-second hidden grace period. A gap or sequence jump calls for resubscription and a fresh snapshot. Wallet and POSITION topics require a matching active session.

Ingest decodes six Anchor events by IDL discriminator, stamps ordered block/transaction/event ordinals, writes ClickHouse and publishes deterministic JetStream message IDs. Confirmed replacements and tombstones reconcile processed events. Readers use canonical versions for trades, candles and trade-derived positions.

## User NATS access

```bash
npm run prepare:nats-auth
```

This creates the ignored broker configuration and credentials under `.local/nats/`, preserving existing key files and passwords. Load the generated configuration into the broker, set `NATS_AUTH_MODE=on`, and start the services. [The NATS guide](infra/nats/README.md) describes the accounts, permissions and broker configuration commands.

`POST /nats/token` returns a one-hour Ed25519 bearer grant for use with NATS `tokenAuthenticator(token)`; no private seed is returned. The auth worker verifies the active session, banned state and wallet ownership, then authorizes only the user's DM, following-feed, alerts, notification, position and balance-change subjects. Browser publishing is denied. Connection expiry is capped by session expiry; logout prevents reconnect with the grant.

Service identities use explicit stream/consumer APIs and their own inbox prefixes. Trading and notify bind to known streams, without account-wide stream discovery. Failure logs identify dependencies and authorization rules without credential values.

## Domain workflows

Transaction builders produce v0 messages with lookup tables, simulation-derived compute budgets, bounded priority fees and configured sender tips. They build curve/canonical-pool swaps and creator-fee sweeps/claims from the captured IDLs. The send guard verifies signatures and the prepared message, permitting supported ComputeBudget rewrites and trailing Lighthouse guards. It persists exact signed bytes and signatures before dispatch; retries reconcile signature history.

Limit orders use confirmed durable nonces, verified presigned transactions and a persistent settlement ledger. The worker watches fresh market-cap frames and compares trigger thresholds exactly. Cancellation stops backend execution; advancing the nonce revokes the signed transaction on chain.

Holder rewards use the USD20 holding floor and vault threshold, a per-holder distribution reserve, exact integer pro-rata allocations and size-bounded transaction batches. Rounding remainders stay in the vault. Snapshot validation, reservations and a payout ledger make retries idempotent. Signers are selected through fixture, keypair-file or remote adapters.

Profile derives weighted-average cost basis and realized/unrealized PnL from canonical position deltas. Unavailable marks and fee components are nullable, and fees are grouped by quote mint. Notify encrypts device tokens, deduplicates activity, retries delivery and records receipts. Live manages streams, clips and bounty escrow transitions with exact refund basis points. Bridge provides quotes, idempotent execution and owner-scoped status through its Relay adapter.

Internal HTTP services authenticate the BFF credential and validate supplied user/wallet pairs. The BFF derives actor headers from its authenticated session.

## Tests and verification

```bash
npm run test:core
npm run test:money
```

| Command | Evidence |
| --- | --- |
| `npm run build` | Every TypeScript workspace compiles, including independent contract consumers and generated clients/codecs |
| `cargo build --manifest-path ingest/Cargo.toml` | The ingest crate compiles |
| `npm run test:core` | Callout rules, API-key checksum, ordinal ordering and correction handling |
| `npm run test:money` | IDL instruction/account layouts, signed-message guards, durable nonce settlement, exact reward arithmetic and payout ledger recovery |
| `npm run verify:slices` | Fixture ingest to binary WSS and HTTP trade/candle reads; signed-in callout creation, duplicate rejection and NATS delivery; keyed-host and CORS boundaries |
| `npm run verify:nats-auth` | BFF grant minting, every owned subject family, cross-user/wallet and wildcard restrictions, public read-only access, service JetStream operations and revoked-session rejection |

Both verification scripts use the configured stores. `verify:slices` starts its own services on ports 4360-4365; stop the local service process tree before running it. `verify:nats-auth` requires auth mode on with auth-callout, BFF, trading and notify running. It removes its own probe messages/consumers and revokes its session. The slice verifier keeps its evidence while closing the callout it created. Contract consumer examples live in `tools/contract-consumer.ts` and `tools/contract-consumer-portfolio.ts`.

## Container and cluster configuration

[infra/README.md](infra/README.md) describes the image definitions, environment renderer, AWS/Kubernetes resources, migration and stream-provisioning Jobs, health probes and NATS secret distribution. Rendering requires explicit deployment settings and writes private manifests to ignored `.local/k8s/`.
