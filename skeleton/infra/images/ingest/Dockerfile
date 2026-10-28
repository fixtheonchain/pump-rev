# syntax=docker/dockerfile:1
FROM rust:1.99.1-bookworm AS build
WORKDIR /app/ingest
COPY ingest/ .
RUN cargo build --release --locked

FROM debian:bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libssl3 && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 ingest && useradd --system --uid 10001 --gid ingest ingest
WORKDIR /app
COPY --from=build /app/ingest/target/release/pump-ingest /usr/local/bin/pump-ingest
COPY ingest/idl/ /app/ingest/idl/
COPY fixtures/ /app/fixtures/
USER 10001:10001
HEALTHCHECK CMD ["/usr/local/bin/pump-ingest", "health"]
ENTRYPOINT ["/usr/local/bin/pump-ingest"]
CMD ["run"]