# Ingest

`pump-ingest` reads the captured Anchor IDLs in `idl/`, copied from
[`../../idl/`](../../idl/). It decodes events by discriminator, including the
Anchor self-CPI prefix, without fetching IDLs or marks over RPC. Its stream
model follows [the data pipeline](../../reconstruction/data-pipeline.md).
The Geyser protocol reference is the official
[Yellowstone Subscribe schema](https://github.com/rpcpool/yellowstone-grpc/tree/master/yellowstone-grpc-proto/proto).

## Build and replay

Run from the backend project root:

```bash
node ingest/tools/generate-fixtures.mjs
cargo build --manifest-path ingest/Cargo.toml
cargo run --manifest-path ingest/Cargo.toml -- replay fixtures/replay.jsonl --delay-ms 100
cargo run --manifest-path ingest/Cargo.toml -- health
cargo test --manifest-path ingest/Cargo.toml
```

The finite replay contains all six supported event types, a confirmed
replacement, and a confirmed block that drops an earlier processed trade.
Its $150 quote mark, supplies, balances, fees, and key bytes are synthetic
fixture inputs. `fixtures/ids.json` identifies the deterministic assets shared
with the Postgres seed.

## Configuration

Required storage settings are `CLICKHOUSE_URL`, `CLICKHOUSE_DATABASE`,
`CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, and `NATS_URL`. NATS authentication
uses `NATS_AUTH_MODE=off|on`; authenticated ingest reads its own identity from
`NATS_CREDENTIALS_FILE`. `.env` is loaded from the working directory.
`INGEST_SOURCE=replay` and `INGEST_REPLAY_FILE` select replay input for `run`.

```bash
cargo run --manifest-path ingest/Cargo.toml -- run
```

`INGEST_SOURCE=geyser` requires `GEYSER_ENDPOINT`, `GEYSER_TOKEN`,
`GEYSER_ASSET_METADATA`, `GEYSER_QUEUE_CAPACITY`, and `GEYSER_MAX_FRAME_BYTES`.
The metadata file follows `fixtures/assets.json` and supplies asset metadata
and block-time quote marks. Replay mode does not create a Geyser connection.

The Geyser source opens two HTTP/2 protobuf Subscribe calls, filtered by IDL
program addresses, at processed and confirmed commitments. It reads self-CPI
inner instructions and resolves loaded keys in versioned transactions. Full
confirmed blocks reconcile missing processed ordinals. An unexpected stream
end terminates ingest with an error.

## Storage and corrections

`event_log`, `trades`, `fee_events`, and `position_deltas` share a versioned
ordinal. Retries can write each table again; confirmed versions outrank
processed revisions. Readers use `FINAL` and `deleted=0`. Existing canonical
events are republished with deterministic JetStream message IDs to recover
from a crash after ClickHouse writes. Consumers deduplicate ordinal and
version beyond JetStream's deduplication window. TradeApi folds candles from
canonical trades, including replacements and deletions.
