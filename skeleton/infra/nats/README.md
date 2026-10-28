# NATS authentication and accounts

`server.conf.template` defines the account boundary without credentials.
Preparation creates service passwords, an Ed25519 account issuer, an X25519
callout encryption key, and the rendered server configuration in ignored
`.local/nats/`. Repeating preparation preserves existing keys and passwords.
The generated files contain secrets.

```bash
npm run prepare:nats-auth
```

Preparation does not connect to NATS or change `NATS_AUTH_MODE`. Regenerate the
configuration after permission changes, then recreate the broker before
starting services with the updated policy.

The implementation uses the official [NATS auth callout protocol](https://docs.nats.io/learn/security/auth-callout)
and [ADR-26](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-26.md)
in server configuration mode. NATS Server 2.11 `allowed_accounts` keeps static
services outside the callout. Unknown bearer-token connections are delegated
and placed into `USER`.

| Account | Purpose | Boundary |
| --- | --- | --- |
| `AUTH` | Bootstrap auth-callout identity | Protected authorization requests and dynamic single-response reply grants |
| `SYS` | System monitoring identity | System requests and events, without application exports |
| `CORE` | Ingest, trading, communities, keepers, notify, and maintenance | JetStream streams with explicit service publish/API and inbox permissions |
| `PUBLIC` | Static `subscriber` credentials | Read-only import of `trading.events.>`; publishing is denied |
| `USER` | Connected user | Imported user event families restricted to the user's ID and owned wallets |

JetStream APIs remain inside `CORE`. Service request inboxes use
`_INBOX.<identity>.>` so services cannot read one another's replies. The
maintenance identity provisions streams and supports verification; application
pods receive separate identities. `.local/nats/permissions.json` records
rendered permissions without passwords.

Trading binds to `TRADING_EVENTS`; notify binds to `COMMUNITIES_EVENTS`.
Explicit stream binding avoids the implicit `$JS.API.STREAM.NAMES` lookup in
nats.js, so application identities do not need account-wide discovery.
Trading manages ephemeral consumers on its trading stream. Notify's consumer
lifecycle, pull, and acknowledgment grants name only `notify-dm`,
`notify-following`, and `notify-alerts`, with their matching filters. Publishers
have stream info and their own publish families. Replies and pushed deliveries
use the service's inbox prefix. Trading and notify startup diagnostics identify
the dependency, operation, and failure classification without exposing raw
dependency errors.

## User grants

`POST /nats/token` returns a one-hour Ed25519 NATS-format user JWT. Clients pass
this bearer credential to NATS `tokenAuthenticator(token)` and receive no user
seed or account signer. The callout reads it from
`nats.connect_opts.auth_token`, verifies the grant, active session, and wallet
ownership in Postgres, then signs an authorization response bound to the
server's transient user NKey and server audience. Auth request and response
payloads are encrypted with the configured xkey.

The connection expires at the earlier of session expiry and grant expiry.
Logout, bans, and expired sessions prevent new connections. Connections
already admitted retain their existing expiration timer.

Observed user subjects from [the data pipeline](../../../reconstruction/data-pipeline.md)
are `dm.user.<uid>`, `followingFeed.user.<uid>`, `alertsFeed.user.<uid>.*`,
`positions.<wallet>`, and `account_balance_change.<wallet>.*`. The inferred
`notifications.user.<uid>` family carries local in-app delivery events.
Browser credentials cannot publish.

## Configuration and startup

Required settings are `NATS_AUTH_MODE=off|on`, `NATS_CREDENTIALS_FILE`,
`NATS_AUTH_ISSUER_SEED_FILE`, `NATS_AUTH_CURVE_SEED_FILE`, `NATS_PUBLIC_URL`,
`NATS_SERVICE_PASSWORD_BYTES`, `NATS_AUTH_TIMEOUT_MS`, `NATS_AUTH_MAX_PENDING`,
`NATS_AUTH_CALLOUT_QUEUE`, `NATS_AUTH_HEALTH_HOST`, `NATS_AUTH_HEALTH_PORT`, and
`NATS_AUTH_VERIFY_TIMEOUT_MS`. The root `.env.example` supplies local values for
configuration choices absent from the research. Set the health host to
`0.0.0.0` inside a container.

After preparation, recreate the broker:

```bash
docker compose -f infra/compose.yaml up -d --force-recreate nats
```

Set `NATS_AUTH_MODE=on` in `.env`, then start the services:

```bash
npm run start:local
```

This starts the auth worker and notify service. To run the auth worker
independently, use `npm run start:auth-callout` instead of starting another
worker on the same health port. Its bootstrap identity bypasses the callout,
so it can start after broker recreation. Application startup provisions the
streams in `CORE` with the maintenance identity. Compose gives JetStream a
persistent volume; fixture history from an unauthenticated account is not
migrated into `CORE`.

## Verification

With the auth worker, BFF, notify worker, and seeded stores running:

```bash
npm run verify:nats-auth
```

The verifier obtains a grant through the BFF, checks the exact user and wallet
subjects, proves delivery for each family, rejects cross-user, cross-wallet,
and broader subscriptions, and verifies that browser publishing is denied and
`PUBLIC` is read-only. It exercises service JetStream permissions, including
trading pull, acknowledgment, and consumer deletion, and rejects reconnects
with a revoked session. Cleanup removes its probe messages and consumers and
revokes its session.

Failure logs identify fixed step, rule, and category labels, plus HTTP status
when relevant. Callout logs distinguish encryption and JWT policy, missing
grants, active and unbanned sessions, and wallet ownership without logging
credentials or user identifiers.

Stop the service process tree before running the independent slice verifier:

```bash
npm run verify:slices
```
