# Blueprint: building the same backend

The reconstruction turned into a buildable design. It mirrors the shape the evidence shows (a NestJS BFF over gRPC
domain services, protobuf streams, NATS, server-built transactions, keepers with hot keys) and fills the parts the
evidence cannot see with concrete choices. It is built as a local backend in [../skeleton/](../skeleton/README.md). Everything on this page is a design [inferred]; where a choice copies
something observed, the observed page is linked.

## 1. Repository

```text
platform/
├─ contracts/
│  ├─ http/            # zod route contract: defineRoutes, publicRead(scope), error registry, deprecations
│  └─ proto/           # pumpfun-style trading.v1, social.v1, coins.v1 (.proto) → TS + Rust codegen
├─ ingest/             # Rust: chain stream → decode → ordinal → event log
├─ services/
│  ├─ client-server/   # NestJS BFF (first-party host + keyed API host, one codebase, two auth guards)
│  ├─ stream-gateway/  # WebSocket ↔ trading.v1 streams
│  ├─ trading/         # TradeApi: coins, candles, trades, holders, positions, fees, boards (gRPC)
│  ├─ coins/           # coin registry, verdicts, images (gRPC)
│  ├─ communities/     # users, social graph, callouts, DMs, squads, competitions, payouts (gRPC)
│  ├─ profile/         # balances, PnL, wallet overview (REST)
│  ├─ tx-builder/      # blockchain-api-service: build + simulate + send (REST)
│  ├─ limit/           # limit orders + trigger keeper
│  ├─ live/            # livestreams, clips, bounties (LiveKit, S3)
│  ├─ notify/          # hermes: push tokens, fan-out, receipts
│  ├─ bridge/          # intents: Relay quotes, execute, status
│  └─ auth-callout/    # NATS auth callout
├─ keepers/            # holder rewards, buyback sweep, boost, migration, agent buyback, payouts
├─ web/                # Next.js App Router (RSC data pages, /api/* proxies)
└─ infra/              # Terraform: AWS (EKS, RDS, ElastiCache, MSK or JetStream, S3, CloudFront), Cloudflare, Vercel
```

## 2. Contracts

**HTTP contract.** One package, imported by the server (route registration and validation), the web and mobile
clients (typed calls) and the docs generator (public routes and deprecations), as in
[../features/developer-api.md](../features/developer-api.md):

```ts
export const calloutRoutes = defineRoutes({
  "POST /callout/create": {
    summary: "Create a callout",
    multipart: true,
    body: z.object({ coinMint: z.string(), thesis: z.string().optional(), chain: caip2.optional(),
                     asGroupId: z.string().uuid().optional(), mediaId: z.string().uuid().optional() }),
    response: z.object({ callout: calloutDto.optional() }),
    emits: ["DUPLICATE_CALLOUT", "ATTEMPT_LIMIT", "INSUFFICIENT_BALANCE", "COOLDOWN", "INVALID_CONTENT"],
  },
  "GET /callout/{calloutId}": publicRead("content.read", {
    summary: "Get a callout by id with its author identity",
    params: z.object({ calloutId: z.string().uuid() }),
    response: calloutWithAuthorDto,
  }),
});

export const ERROR_CODES = {
  DUPLICATE_CALLOUT: { status: 409, owner: "callout", summary: "…", actionable: true, retryable: "never" },
  // one entry per domain refusal; the BFF maps upstream gRPC statuses onto these
};
```

**Protobuf.** The trading stream as the client sees it ([data-pipeline.md](data-pipeline.md)):

```proto
syntax = "proto3";
package trading.v1;

enum Commitment { COMMITMENT_UNSPECIFIED = 0; PROCESSED = 1; CONFIRMED = 2; }
enum Part { PART_UNSPECIFIED = 0; MARKET = 1; PHASE = 2; META = 3; POSITION = 4; HOLDERS = 5; MARKS = 6; CANDLES = 7; }
enum FrameKind { FRAME_KIND_UNSPECIFIED = 0; SNAPSHOT = 1; LIVE = 2; CORRECTION = 3; }

message Ordinal { uint64 block_id = 1; uint32 tx_index = 2; uint32 event_index = 3; int64 block_time_ms = 4; }

message CandleSpec { string res = 1; string measure = 2; }          // e.g. "1m" × "price_usd"
message CoinTopic { string chain = 1; string address = 2; repeated Part parts = 3;
                    Commitment commitment = 4; repeated CandleSpec candles = 5; }
message WalletTopic { string wallet = 1; }
message ListTopic { string list = 1; }                                // a board id
message Subscription { oneof topic { CoinTopic coin = 1; WalletTopic wallet = 2; ListTopic list = 3; } }
message WatchRequest { repeated Subscription subscribe = 1; repeated string unsubscribe = 2; }

message Frame {
  string topic = 1; uint64 seq = 2; FrameKind kind = 3; Ordinal ordinal = 4;
  oneof payload { CoinFrame coin = 10; WalletFrame wallet = 11; ListFrame list = 12; }
}
```

The gateway stamps a per-topic `seq`; a client that sees a jump reports `seq_skip` and asks for a snapshot.

## 3. Storage

| Store | Holds | Why |
| --- | --- | --- |
| Postgres (RDS) per domain | communities (users, graph, content, squads, competitions, payouts), coins registry, live, limit orders, API platform | Relational writes with constraints (one live callout per coin, one org per owner) |
| Columnar (ClickHouse) | trades, candles, position deltas, fee events | Append-only by ordinal, scans by mint and wallet |
| Redis (ElastiCache) | rate buckets, presence with TTL, key verdicts, boards cache, usage counters, in-memory coin snapshots | Sub-ms reads, TTLs, atomic counters |
| BigQuery | analytics, 90-day API usage, ranking logs | Warehouse joins |
| S3 + CloudFront | images, videos, clips (HLS), share renders | Media at the edge |

Core tables (abridged):

```sql
-- communities
create table users (
  id uuid primary key, username citext unique, bio text, kind text not null default 'PERSON',
  canonical_svm_wallet text unique, canonical_evm_wallet text unique, x_username citext unique,
  banned_at timestamptz, created_at timestamptz not null default now()
);
create table wallets (address text primary key, user_id uuid references users, chain text not null,
  custody text not null, reserved boolean not null default false);          -- privy | external
create table follows (follower uuid references users, followee uuid references users,
  trade_notifications boolean not null default false, origin text, created_at timestamptz default now(),
  primary key (follower, followee));
create table callouts (
  id uuid primary key, author uuid not null references users, acting_group uuid,
  chain text not null, coin text not null, thesis text, media_id uuid, quoted_callout uuid,
  price_usd_at_call numeric not null, mcap_usd_at_call numeric not null, max_multiplier numeric,
  status text not null default 'live', created_at timestamptz not null default now()
);
create unique index one_live_callout on callouts (author, chain, coin) where status = 'live';
create table groups (id uuid primary key, username citext unique, owner uuid references users, seats int not null);
create table group_members (group_id uuid references groups, user_id uuid references users,
  role text not null, status text not null, primary key (group_id, user_id));   -- OWNER|ADMIN|MEMBER, ACTIVE|INVITED
create table competitions (id uuid primary key, slug text unique, kind text not null,   -- person | squad
  registration_opens_at timestamptz, starts_at timestamptz, ends_at timestamptz,
  entry_cap int, min_size int, max_size int);
create table competition_entries (id uuid primary key, competition_id uuid references competitions,
  user_id uuid, group_id uuid, struck_at timestamptz, unique (competition_id, user_id, group_id));
create table competition_roster (entry_id uuid references competition_entries, user_id uuid, wallet text,
  primary key (entry_id, user_id));                                       -- snapshotted at starts_at
create table payouts (id uuid primary key, user_id uuid, class text not null,   -- reward | referral
  amount_usdc_micros bigint not null, status text not null, tx text, created_at timestamptz default now());
create table referrals (referee uuid primary key references users, referrer uuid references users,
  code text not null, applied_at timestamptz not null default now());

-- trading (columnar)
create table trades (chain LowCardinality(String), mint String, block_id UInt64, tx_index UInt32,
  event_index UInt32, block_time DateTime64(3), commitment Enum8('processed'=1,'confirmed'=2),
  wallet String, side Enum8('buy'=1,'sell'=2), base_amount UInt128, quote_amount UInt128,
  quote_mint String, price_usd Float64, fee_protocol UInt64, fee_creator UInt64, signature String)
engine = ReplacingMergeTree order by (chain, mint, block_id, tx_index, event_index);

-- api platform
create table api_orgs (id uuid primary key, owner uuid unique references users, status text not null,
  contact_email text, email_verified_at timestamptz, terms_version text);
create table api_keys (id uuid primary key, org_id uuid references api_orgs, name text, prefix text,
  last4 text, hash bytea not null, scopes text[] not null, daily_limit int, burst int,
  status text not null, rotated_from uuid, grace_until timestamptz, last_used_at timestamptz);

-- limit orders
create table limit_orders (order_address text primary key, user_wallet text, mint text, quote_mint text,
  order_type text, amount_in numeric, trigger_mcap_usd numeric, nonce_account text not null,
  signed_tx bytea not null, status text not null, settlement jsonb, created_at timestamptz default now());
```

## 4. Ingest

1. Subscribe to a Geyser-class transaction stream filtered by the pump.fun program ids, at `processed`, and a second
   cursor at `confirmed`.
2. Decode Anchor events from the self-CPI event instruction data with the IDLs in [../idl/](../idl/); read curve
   and pool accounts for reserves.
3. Stamp `Ordinal{block_id, tx_index, event_index, block_time_ms}`; write to the event log keyed by mint.
4. Consumers are idempotent on the ordinal: trades and candles upsert, positions recompute cost basis from the
   ordered deltas, fee ledgers append.
5. When the `confirmed` cursor disagrees with a `processed` event (dropped or reordered), emit a `CORRECTION` frame
   and replace by ordinal.

## 5. Realtime

| Channel | Design |
| --- | --- |
| NATS accounts | `PUBLIC` (static read-only `subscriber` user for chart ticks and lists), `USER` (per-user JWTs minted by `POST /nats/token`, 1 h, scoped by the auth callout to `dm.user.<uid>`, `followingFeed.user.<uid>`, `alertsFeed.user.<uid>.*`, `positions.<wallet>`, `account_balance_change.<wallet>.*`) |
| Presence | `POST /…/alerts/presence` writes `presence:<uid>` in Redis with a TTL and the viewer's bands; publishers check presence before fan-out |
| Stream gateway | Holds TradeApi gRPC streams per topic, multiplexes to sockets, enforces 64 topics, 32 per request, queue coalescing |
| RPC PubSub | Proxied Solana RPC for `accountSubscribe` on curves and pools at `processed` |

## 6. Transaction builder

- One service, many builders: `swap-build`, `creator-fees`, `creator-fees/vault`, `relay-buy-*`, `perp-*`,
  `cc-pack-*`, `cc-market-*`, plus `send`. Each returns a base64 v0 transaction over the shared lookup table, with
  compute budget from simulation and a priority fee from an estimate, as observed in
  [../backend/transactions.md](../backend/transactions.md).
- Errors are `{error, data: {reason, retryable}}`, so clients retry only what can succeed.
- `send` lands through a tip-paying sender (Nozomi or Jito) and returns the signature; the client polls status.
- EVM actions (perps, bridge) return EIP-712 payloads; the client checks each primary type against an allowlist
  before signing.

## 7. Keepers

One job runner with per-job key custody (KMS-wrapped hot keys, small balances, alerts on drift), a schedule, and a
ledger table per job (`job, run_id, inputs, txs, status`). Jobs and rules are in
[keepers-and-signers.md](keepers-and-signers.md).

## 8. Deployment

| Layer | Placement |
| --- | --- |
| Web | Vercel (Next.js), Cloudflare in front |
| APIs and gateway | AWS us-east-1 (EKS), Cloudflare in front of every public host, AWS WAF tokens on abuse-prone writes |
| NATS | 4 clusters on AWS ELBs (unified, core, advanced, multichain) |
| RPC | Branded hosts through a Cloudflare Worker to upstream providers |
| Observability | Datadog RUM + logs + traces (`x-datadog-*` headers), Redis-backed usage, BigQuery |
| Flags | LaunchDarkly with a code registry (owner, created, expires, exit signal) |

## 9. Build order

1. Contracts package (HTTP + proto) and the error registry.
2. Ingest → trades, candles, coin state → TradeApi reads → stream gateway (the coin page works).
3. tx-builder (`swap-build`, `send`) and the create flow (vanity pool, metadata upload).
4. Communities core: users, sessions, follows, callouts; BFF with rate buckets and flags.
5. Profile and PnL, boards and folds, leaderboards.
6. NATS per-user auth, DMs, alerts with presence, notifications.
7. Rewards: creator-fee claims, holder-rewards keeper, referrals and payouts.
8. Squads and competitions, achievements, share renders.
9. Multichain registry, bridge, perps builders.
10. Packs, limit orders, livestreams and bounties, the keyed developer API.
