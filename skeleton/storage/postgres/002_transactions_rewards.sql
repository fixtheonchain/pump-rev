-- Round two: prepared messages and immutable signatures are persisted before dispatch.
CREATE TABLE prepared_transactions (
 id uuid PRIMARY KEY, owner_wallet text NOT NULL, kind text NOT NULL, request jsonb NOT NULL,
 transaction bytea NOT NULL, lookup_tables jsonb NOT NULL, blockhash text NOT NULL,
 last_valid_block_height numeric(78,0), nonce jsonb, expires_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX prepared_owner_created ON prepared_transactions(owner_wallet,created_at DESC);
CREATE TABLE transaction_sends (
 id uuid PRIMARY KEY, prepared_id uuid NOT NULL UNIQUE REFERENCES prepared_transactions(id),
 owner_wallet text NOT NULL, idempotency_key text NOT NULL, signed_hash text NOT NULL,
 signature text NOT NULL UNIQUE, signed_transaction bytea NOT NULL, status text NOT NULL,
 attempts integer NOT NULL DEFAULT 0, last_error text, created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(owner_wallet,idempotency_key)
);
-- These rows model external chain boundaries only in fixture mode. They survive process restarts.
CREATE TABLE fixture_chain_nonces (
 address text PRIMARY KEY, authority text NOT NULL, nonce text NOT NULL,
 slot numeric(78,0) NOT NULL, status text NOT NULL DEFAULT 'confirmed', consumed_by text
);
CREATE TABLE fixture_chain_signatures (
 signature text PRIMARY KEY, transaction_hash text NOT NULL, status text NOT NULL,
 signed_transaction bytea NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE holder_reward_vaults (
 chain text NOT NULL, mint text NOT NULL, quote_mint text NOT NULL, quote_decimals integer NOT NULL,
 quote_usd numeric(78,18) NOT NULL CHECK(quote_usd>0), balance_atomic numeric(78,0) NOT NULL CHECK(balance_atomic>=0),
 reserved_atomic numeric(78,0) NOT NULL DEFAULT 0 CHECK(reserved_atomic>=0 AND reserved_atomic<=balance_atomic),
 base_decimals integer NOT NULL, price_usd numeric(78,18) NOT NULL CHECK(price_usd>0),
 snapshot_ordinal text NOT NULL, authority text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(chain,mint)
);
CREATE TABLE holder_reward_rounds (
 id uuid PRIMARY KEY, chain text NOT NULL, mint text NOT NULL, snapshot_ordinal text NOT NULL,
 status text NOT NULL, balance_atomic numeric(78,0) NOT NULL, reserve_atomic numeric(78,0) NOT NULL,
 distributable_atomic numeric(78,0) NOT NULL, distributed_atomic numeric(78,0) NOT NULL,
 remainder_atomic numeric(78,0) NOT NULL, holder_count integer NOT NULL, snapshot jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 UNIQUE(chain,mint,snapshot_ordinal)
);
CREATE UNIQUE INDEX holder_one_active_round ON holder_reward_rounds(chain,mint) WHERE status IN ('prepared','sending','unknown');
CREATE TABLE holder_reward_batches (
 round_id uuid NOT NULL REFERENCES holder_reward_rounds(id), batch_index integer NOT NULL,
 prepared_id uuid REFERENCES prepared_transactions(id), signature text, signed_transaction bytea,
 payout_atomic numeric(78,0) NOT NULL, recipients jsonb NOT NULL, status text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(round_id,batch_index), UNIQUE(signature)
);
CREATE TABLE holder_reward_events (
 id uuid PRIMARY KEY, round_id uuid NOT NULL REFERENCES holder_reward_rounds(id), payload jsonb NOT NULL,
 published_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);


